import { useState, useRef, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

const defaultCategories = [
  { id: 'immigration' as const, icon: FileText, label: 'Imigração', color: 'bg-primary/15 text-primary' },
  { id: 'work' as const, icon: Briefcase, label: 'Trabalho', color: 'bg-info/15 text-info' },
  { id: 'health' as const, icon: Heart, label: 'Saúde', color: 'bg-success/15 text-success' },
  { id: 'housing' as const, icon: HomeIcon, label: 'Moradia', color: 'bg-warning/15 text-warning' },
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
  const { documents, loading: docsLoading, addDocument, updateDocument, deleteDocument } = useDocuments();
  const { categories: customCategories, loading: catsLoading } = useCategories();
  const { profile } = useProfile();
  const isPremium = profile?.plan_status === 'premium';
  const location = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('immigration');
  const [documentName, setDocumentName] = useState('');

  useEffect(() => {
    if (location.state?.openAddDialog) {
      setShowAddDialog(true);
      // Clean up state so it doesn't reopen contentiously if we navigate around
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ id: string; name: string } | null>(null);
  const [isSecure, setIsSecure] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [viewingDoc, setViewingDoc] = useState<typeof documents[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddDocument = async () => {
    if (documentName) {
      setSaving(true);
      await addDocument(documentName, selectedCategory, selectedFile || undefined, isSecure);
      setSaving(false);
      setDocumentName('');
      setSelectedFile(null);
      setIsSecure(false);
      setShowAddDialog(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (!isPremium) {
      toast.error('Recurso exclusivo do VOY Premium');
      setViewingDoc({ id: 'barrier', name: 'Premium Required', file_url: null, file_type: null } as any);
      return;
    }
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
      }
      // If we are not already in the dialog, open it
      if (!showAddDialog) {
        setShowAddDialog(true);
      }
      toast.success('Arquivo selecionado! Preencha o nome e salve.');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': []
    },
    noClick: true
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDocument(deleteId);
      setDeleteId(null);
    }
  };

  const handleEditSave = async () => {
    if (editingDoc && editingDoc.name) {
      await updateDocument(editingDoc.id, { name: editingDoc.name });
      setEditingDoc(null);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = filterCategory ? doc.category === filterCategory : true;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const loading = docsLoading || catsLoading;

  const allCategories = [
    ...defaultCategories,
    ...customCategories.map(cat => ({
      id: cat.id,
      label: cat.label,
      icon: FileText,
      color: 'bg-muted text-muted-foreground'
    }))
  ];

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  // ─── PAYWALL: Full sales page for non-premium users ───
  if (!isPremium) {
    const handleCheckout = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
          body: { user_id: profile?.user_id, user_email: profile?.user_profile }
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      } catch (err) {
        toast.error('Erro ao iniciar pagamento. Tente novamente.');
        console.error('Checkout error:', err);
      }
    };

    return (
      <MobileLayout>
        <div className="px-5 py-8 safe-area-top min-h-full flex flex-col items-center text-center">

          {/* Hero Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Shield className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[1.6rem] font-black text-foreground leading-tight mb-3 max-w-xs tracking-tight">
            Tenha seu cofre digital de imigrante por apenas{' '}
            <span className="text-blue-500">19,90€</span>
          </h1>

          <p className="text-sm text-muted-foreground font-medium mb-8 max-w-[280px]">
            Pagamento único. Acesso vitalício. Sem mensalidades.
          </p>

          {/* Benefits */}
          <div className="w-full max-w-sm space-y-3 mb-8">
            {[
              { icon: Upload, text: 'Uploads ilimitados de documentos', sub: 'PDF, fotos, scans e mais' },
              { icon: ShieldCheck, text: 'Cofre criptografado', sub: 'Seus documentos seguros e privados' },
              { icon: Bell, text: 'Alertas de validade', sub: 'Nunca perca um prazo importante' },
              { icon: FileText, text: 'Acesso vitalício garantido', sub: 'Pague uma vez, use para sempre' },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border text-left animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{benefit.text}</p>
                  <p className="text-[11px] text-muted-foreground">{benefit.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={handleCheckout}
            className="w-full max-w-sm h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-lg tracking-wider gap-3 shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            DESBLOQUEAR COFRE — 19,90€
          </Button>

          {/* Guarantee */}
          <p className="mt-4 text-xs text-muted-foreground font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Garantia de reembolso de 7 dias
          </p>

          {/* Payment Methods (Trust Badges) */}
          <div className="mt-8 w-full max-w-sm">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Métodos de pagamento aceitos</p>
            <div className="flex items-center justify-center gap-6">

              {/* Cartão (Visa/MC icon placeholder) */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-10 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-600" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM4 0h16v2H4zm0 22h16v2H4z" opacity=".3" />
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z" />
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Cartão</span>
              </div>

              {/* MB WAY */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-10 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm px-1.5">
                  <svg viewBox="0 0 120 40" className="w-full h-full">
                    <rect x="2" y="2" width="36" height="36" rx="8" fill="#D4002A" />
                    <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Arial">MB</text>
                    <text x="80" y="22" textAnchor="middle" fill="#D4002A" fontSize="11" fontWeight="900" fontFamily="Arial">WAY</text>
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">MB WAY</span>
              </div>

              {/* Multibanco */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-10 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm px-1.5">
                  <svg viewBox="0 0 100 40" className="w-full h-full">
                    <rect x="2" y="2" width="96" height="36" rx="6" fill="#004B87" />
                    <text x="50" y="24" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="Arial">MULTIBANCO</text>
                  </svg>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Multibanco</span>
              </div>
            </div>
          </div>

          {/* Subtle footer */}
          <p className="mt-8 text-[10px] text-muted-foreground/50 font-medium max-w-[250px]">
            Pagamento seguro processado pelo Stripe. Os seus dados financeiros nunca são armazenados.
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div
        className={cn(
          "px-5 py-6 safe-area-top min-h-full transition-colors",
          isDragActive && "bg-primary/5 border-2 border-dashed border-primary m-2 rounded-xl"
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-foreground text-center md:text-left">Meus Documentos</h1>
          <Button
            onClick={() => {
              if (!isPremium) {
                toast.error('Recurso exclusivo do VOY Premium');
                setViewingDoc({ id: 'barrier', name: 'Premium Required', file_url: null, file_type: null } as any);
                return;
              }
              setShowAddDialog(true);
            }}
            size="sm"
            className="w-full md:w-auto rounded-xl gap-2 h-12 md:h-9"
          >
            <Plus className="w-4 h-4" />
            Adicionar Documento
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6 bg-muted p-3 rounded-xl border border-transparent focus-within:border-primary/50 transition-colors">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            className="bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 mb-4">
          <button
            onClick={() => setFilterCategory(null)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              !filterCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Todos
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                filterCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum documento ainda
            </h3>
            <p className="text-muted-foreground max-w-[250px]">
              Adicione seus documentos importantes aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const category = allCategories.find((c) => c.id === doc.category);
              const Icon = category?.icon || FileText;
              const fileInfo = getFileTypeInfo(doc.file_type);

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border active:scale-[0.98] transition-transform select-none"
                  onClick={() => setViewingDoc(doc)}
                >
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', category?.color || 'bg-muted')}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {fileInfo.label} • {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingDoc(doc);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </DropdownMenuItem>
                      {doc.file_url && (
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(doc.file_url!, '_blank');
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Baixar documento
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingDoc({ id: doc.id, name: doc.name });
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                        Editar nome
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(doc.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Add Document Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[85vh] flex flex-col p-0 gap-0 rounded-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Adicionar documento</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
            {/* Upload Options */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-90"
                type="button"
              >
                <Camera className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium">Tirar Foto</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-90"
                type="button"
              >
                <Upload className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium">Upload</span>
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                type="button"
              >
                <File className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium">Scan</span>
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-sm font-medium text-primary">Solte o arquivo aqui...</p>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm">Arraste e solte o arquivo aqui</p>
                </div>
              )}
            </div>

            {/* Selected File */}
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-success/10 rounded-xl">
                <FileText className="w-5 h-5 text-success" />
                <span className="text-sm font-medium flex-1 truncate">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-muted rounded"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Secure Upload Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isSecure ? "bg-primary/20 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
                )}>
                  {isSecure ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-sm">Pasta Segura</p>
                  <p className="text-xs text-muted-foreground">Criptografado e protegido</p>
                </div>
              </div>
              <Switch
                checked={isSecure}
                onCheckedChange={setIsSecure}
              />
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="docName">Nome do documento</Label>
              <Input
                id="docName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Ex: Passaporte, Contrato..."
                className="h-12 rounded-xl"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {allCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                        selectedCategory === cat.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-1'
                          : 'border-border hover:border-primary/50'
                      )}
                      type="button"
                    >
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cat.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 pb-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setDocumentName('');
                  setSelectedFile(null);
                }}
                className="flex-1 h-12 rounded-xl"
                disabled={saving}
                type="button"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddDocument}
                disabled={!documentName || saving}
                className="flex-1 h-12 rounded-xl"
                type="submit"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </div>
                ) : 'Salvar Documento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              value={editingDoc?.name || ''}
              onChange={(e) => setEditingDoc(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="Nome do documento"
              className="h-12 rounded-xl"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingDoc(null)}
                className="flex-1 h-12 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditSave}
                className="flex-1 h-12 rounded-xl"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O documento será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Viewer */}
      <DocumentViewer
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </MobileLayout>
  );
}
