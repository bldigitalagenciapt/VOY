import React, { Component, ReactNode, useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Briefcase, Heart, Home as HomeIcon, Camera, Upload, File, MoreVertical, Eye, Download, Pencil, Trash2, Loader2, X, Image, FileSpreadsheet, Search, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { useCategories } from '@/hooks/useCategories';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Shield, ShieldCheck, Sparkles, ShieldAlert } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

class LocalErrorBoundary extends Component<{ children: ReactNode, onErrorCaught?: (error: any) => void }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any) {
    if (this.props.onErrorCaught) this.props.onErrorCaught(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Dialog open={true}>
          <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl p-6">
            <DialogHeader><DialogTitle>Erro Local Identificado</DialogTitle></DialogHeader>
            <div className="p-4 bg-red-100 text-red-800 rounded-md break-words text-sm font-mono overflow-auto max-h-60">
              {String(this.state.error)}
            </div>
            <Button onClick={() => window.location.reload()}>Recarregar</Button>
          </DialogContent>
        </Dialog>
      );
    }
    return this.props.children;
  }
}

const defaultCategories = [
  { id: 'immigration' as const, icon: FileText, label: 'docs.category.immigration', color: 'bg-primary/15 text-primary' },
  { id: 'work' as const, icon: Briefcase, label: 'docs.category.work', color: 'bg-info/15 text-info' },
  { id: 'health' as const, icon: Heart, label: 'docs.category.health', color: 'bg-success/15 text-success' },
  { id: 'housing' as const, icon: HomeIcon, label: 'docs.category.housing', color: 'bg-warning/15 text-warning' },
];

const getFileTypeInfo = (fileType: string | null) => {
  if (!fileType) return { icon: FileText, label: 'Documento' };
  if (fileType.includes('pdf')) return { icon: FileText, label: 'PDF' };
  if (fileType.includes('png')) return { icon: Image, label: 'PNG' };
  if (fileType.includes('jpeg') || fileType.includes('jpg')) return { icon: Image, label: 'JPEG' };
  if (fileType.includes('webp')) return { icon: Image, label: 'WEBP' };
  if (fileType.includes('sheet') || fileType.includes('xlsx') || fileType.includes('xls')) return { icon: FileSpreadsheet, label: 'Excel' };
  if (fileType.includes('word') || fileType.includes('doc')) return { icon: FileText, label: 'Word' };
  return { icon: File, label: 'Arquivo' };
};

export default function Documents() {
  const { t } = useApp();
  const { documents, loading: docsLoading, addDocument, updateDocument, deleteDocument } = useDocuments();
  const { categories: customCategories, loading: catsLoading } = useCategories();
  const { profile } = useProfile();
  const { user } = useAuth();
  const isPremium = profile?.plan_status === 'premium';
  const location = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('immigration');
  const [documentName, setDocumentName] = useState('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ id: string; name: string; expiry_date: string | null } | null>(null);
  const [isSecure, setIsSecure] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getExpiryStatus = (date: string | null) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = diffDays < 0;

    if (isExpired) return { label: t('docs.status.expired'), color: 'text-destructive bg-destructive/10' };
    if (diffDays === 0) return { label: t('docs.status.expires_today'), color: 'text-warning bg-warning/10' };
    if (diffDays <= 30) return { label: t('docs.status.expires_in').replace('{{days}}', diffDays.toString()), color: 'text-info bg-info/10' };

    return { label: t('docs.status.valid_until').replace('{{date}}', new Date(date).toLocaleDateString()), color: 'text-muted-foreground bg-muted' };
  };

  const handleAddDocument = async () => {
    if (documentName) {
      setSaving(true);
      try {
        await addDocument(documentName, selectedCategory, selectedFile || undefined, isSecure);
        setDocumentName('');
        setExpiryDate('');
        setSelectedFile(null);
        setIsSecure(false);
        setShowAddDialog(false);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleEditSave = async () => {
    if (editingDoc) {
      setSaving(true);
      try {
        await updateDocument(editingDoc.id, { name: editingDoc.name, category: editingDoc.expiry_date || undefined });
        setEditingDoc(null);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDocument(deleteId);
      setDeleteId(null);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[acceptedFiles.length - 1]);
      if (!documentName) {
        setDocumentName(acceptedFiles[acceptedFiles.length - 1].name.split('.')[0]);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const allCategories = [...defaultCategories, ...(customCategories || [])];
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MobileLayout>
      <div className="px-5 py-6 pb-24 safe-area-top">
        <input {...getInputProps()} />
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground text-center md:text-left">{t('docs.title')}</h1>
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="w-full md:w-auto rounded-xl gap-2 h-12 md:h-9">
            <Plus className="w-4 h-4" />
            {t('docs.add')}
          </Button>
        </div>

        <div className="relative mb-6 flex items-center gap-3 bg-muted/50 p-4 rounded-2xl border border-border/50">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('docs.search')}
            className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setFilterCategory(null)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              !filterCategory ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {t('docs.all')}
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                filterCategory === cat.id ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {t(cat.label)}
            </button>
          ))}
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-[2rem] bg-muted flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('docs.empty')}</h3>
            <p className="text-muted-foreground max-w-[250px]">{t('docs.empty.desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredDocuments.map((doc) => {
              const fileInfo = getFileTypeInfo(doc.file_type);
              const expiryStatus = getExpiryStatus(doc.expiry_date);
              return (
                <div key={doc.id} className="group relative bg-card p-4 rounded-3xl border border-border/50 hover:border-primary/30 transition-all active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <fileInfo.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{doc.name}</p>
                      {expiryStatus && (
                        <div className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider", expiryStatus.color)}>
                          {expiryStatus.label}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2">
                        <DropdownMenuItem onClick={() => setViewingDoc(doc)} className="rounded-xl gap-2 cursor-pointer">
                          <Eye className="w-4 h-4" /> {t('docs.action.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => setDeleteId(doc.id)}>
                          <Trash2 className="w-4 h-4" /> {t('docs.action.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl p-6">
          <DialogHeader><DialogTitle>{t('docs.dialog.add')}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('docs.form.name')}</Label>
              <Input value={documentName} onChange={(e) => setDocumentName(e.target.value)} placeholder={t('docs.form.name')} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowAddDialog(false)}>{t('cancel')}</Button>
              <Button onClick={handleAddDocument} disabled={saving || !documentName}>{saving ? <Loader2 className="animate-spin" /> : t('save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('docs.dialog.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('docs.dialog.delete.desc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">{t('docs.action.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {viewingDoc && (
        <LocalErrorBoundary onErrorCaught={(err) => {
          console.error("LocalErrorBoundary caught:", err);
          toast.error("Erro interno ao abrir documento.");
        }}>
          <DocumentViewer doc={viewingDoc} open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)} />
        </LocalErrorBoundary>
      )}
    </MobileLayout>
  );
}
