import { useState, useRef } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Briefcase, Heart, Home as HomeIcon, Camera, Upload, File, MoreVertical, Eye, Download, Pencil, Trash2, Loader2, X, Image, FileSpreadsheet, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const categories = [
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
  const { documents, loading, addDocument, updateDocument, deleteDocument } = useDocuments();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('immigration');
  const [documentName, setDocumentName] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [viewingDoc, setViewingDoc] = useState<typeof documents[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddDocument = async () => {
    if (documentName) {
      setSaving(true);
      await addDocument(documentName, selectedCategory, selectedFile || undefined);
      setSaving(false);
      setDocumentName('');
      setSelectedFile(null);
      setShowAddDialog(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
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

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Meus Documentos</h1>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            className="rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar
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
          {categories.map((cat) => (
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
              const category = categories.find((c) => c.id === doc.category);
              const Icon = category?.icon || FileText;
              const fileInfo = getFileTypeInfo(doc.file_type);

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border"
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
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
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
                          onClick={() => window.open(doc.file_url!, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                          Baixar documento
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="gap-2"
                        onClick={() => setEditingDoc({ id: doc.id, name: doc.name })}
                      >
                        <Pencil className="w-4 h-4" />
                        Editar nome
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(doc.id)}
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
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                type="button"
              >
                <Camera className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium">Tirar Foto</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
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
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
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
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
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
