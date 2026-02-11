import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText, Image, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    file_url: string | null;
    file_type: string | null;
  } | null;
}

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return File;

  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('image')) return Image;
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('xlsx') || fileType.includes('xls')) return FileSpreadsheet;
  if (fileType.includes('word') || fileType.includes('doc')) return FileText;

  return File;
};

const getFileTypeName = (fileType: string | null) => {
  if (!fileType) return 'Documento';

  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('png')) return 'PNG';
  if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG';
  if (fileType.includes('webp')) return 'WEBP';
  if (fileType.includes('sheet') || fileType.includes('xlsx')) return 'Excel';
  if (fileType.includes('xls')) return 'Excel';
  if (fileType.includes('word') || fileType.includes('docx')) return 'Word';
  if (fileType.includes('doc')) return 'Word';

  return 'Arquivo';
};

const isImage = (fileType: string | null) => {
  if (!fileType) return false;
  return fileType.includes('image') || fileType.includes('png') || fileType.includes('jpeg') || fileType.includes('jpg') || fileType.includes('webp');
};

const isPdf = (fileType: string | null) => {
  if (!fileType) return false;
  return fileType.includes('pdf');
};

export function DocumentViewer({ isOpen, onClose, document }: DocumentViewerProps) {
  const [downloading, setDownloading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    if (isOpen && document?.file_url) {
      generateSignedUrl();
    } else {
      setSignedUrl(null);
      setImageLoading(true);
    }
  }, [isOpen, document?.file_url]);

  const generateSignedUrl = async () => {
    if (!document?.file_url) return;

    setLoadingUrl(true);
    try {
      const bucket = 'voy_secure_docs';
      let filePath = '';

      if (document.file_url.includes(`/${bucket}/`)) {
        filePath = decodeURIComponent(document.file_url.split(`/${bucket}/`)[1]);
      } else {
        const urlParts = document.file_url.split('/');
        filePath = urlParts[urlParts.length - 1];
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour

      if (error) throw error;
      setSignedUrl(data.signedUrl);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      toast.error('Não foi possível carregar o arquivo com segurança.');
    } finally {
      setLoadingUrl(false);
    }
  };

  if (!document) return null;

  const Icon = getFileIcon(document.file_type);
  const fileTypeName = getFileTypeName(document.file_type);
  const canPreviewImage = isImage(document.file_type);
  const canPreviewPdf = isPdf(document.file_type);

  const handleDownload = async () => {
    const urlToUse = signedUrl || document.file_url;
    if (!urlToUse) return;

    setDownloading(true);
    try {
      const response = await fetch(urlToUse);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name + (document.file_type ? `.${document.file_type.split('/').pop()}` : '');
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      window.open(urlToUse, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenExternal = () => {
    const urlToUse = signedUrl || document.file_url;
    if (urlToUse) {
      window.open(urlToUse, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-1rem)] max-h-[90vh] rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-left truncate">{document.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{fileTypeName}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 min-h-[300px] flex flex-col items-center justify-center">
          {loadingUrl ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Obtendo acesso seguro...</p>
            </div>
          ) : document.file_url && signedUrl ? (
            <>
              {canPreviewImage && (
                <div className="relative w-full flex items-center justify-center min-h-[200px] bg-muted rounded-xl overflow-hidden">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                  <img
                    src={signedUrl}
                    alt={document.name}
                    className={cn(
                      "max-w-full max-h-[50vh] object-contain rounded-lg",
                      imageLoading && "opacity-0"
                    )}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                </div>
              )}

              {canPreviewPdf && (
                <div className="w-full h-full min-h-[400px] flex flex-col">
                  <iframe
                    src={signedUrl + '#toolbar=0'}
                    className="w-full flex-1 rounded-xl bg-muted border border-border"
                    title={document.name}
                  />
                  <div className="p-2 text-center text-xs text-muted-foreground">
                    Se não conseguir visualizar, use o botão Baixar abaixo.
                  </div>
                </div>
              )}

              {!canPreviewImage && !canPreviewPdf && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Icon className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">Arquivo {fileTypeName}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este tipo de arquivo não pode ser visualizado diretamente
                  </p>
                  <Button onClick={handleOpenExternal} variant="outline" className="rounded-xl">
                    Abrir arquivo
                  </Button>
                </div>
              )}
            </>
          ) : document.file_url && !signedUrl && !loadingUrl ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500">
                <X className="w-8 h-8" />
              </div>
              <h3 className="font-semibold mb-2">Erro de Segurança</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Não foi possível validar seu acesso a este documento.
              </p>
              <Button onClick={generateSignedUrl} variant="outline" className="rounded-xl">
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Documento sem arquivo</h3>
              <p className="text-sm text-muted-foreground">
                Este documento foi salvo apenas com nome
              </p>
            </div>
          )}

        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 rounded-xl"
          >
            Fechar
          </Button>
          {document.file_url && signedUrl && (
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 h-12 rounded-xl gap-2"
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Baixar
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
