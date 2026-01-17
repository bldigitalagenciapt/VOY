import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Plus, StickyNote, Star, MoreVertical, Pencil, Trash2, Bell, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useNotes } from '@/hooks/useNotes';

export default function Notes() {
  const { notes, loading, addNote, updateNote, deleteNote, toggleImportant } = useNotes();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    is_important: false,
    hasReminder: false,
    reminder_date: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      is_important: false,
      hasReminder: false,
      reminder_date: '',
    });
    setEditingNoteId(null);
  };

  const handleSaveNote = async () => {
    if (formData.title) {
      setSaving(true);

      if (editingNoteId) {
        await updateNote(editingNoteId, {
          title: formData.title,
          content: formData.content || null,
          category: formData.category || null,
          is_important: formData.is_important,
          reminder_date: formData.hasReminder ? formData.reminder_date : null,
        });
      } else {
        await addNote({
          title: formData.title,
          content: formData.content || undefined,
          category: formData.category || undefined,
          is_important: formData.is_important,
          reminder_date: formData.hasReminder ? formData.reminder_date : undefined,
        });
      }

      setSaving(false);
      resetForm();
      setShowAddDialog(false);
    }
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setFormData({
        title: note.title,
        content: note.content || '',
        category: note.category || '',
        is_important: note.is_important,
        hasReminder: !!note.reminder_date,
        reminder_date: note.reminder_date || '',
      });
      setEditingNoteId(noteId);
      setShowAddDialog(true);
    }
  };

  const handleDeleteNote = async () => {
    if (deleteId) {
      await deleteNote(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleImportant = async (noteId: string) => {
    await toggleImportant(noteId);
  };

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
      <div className="px-5 py-6 safe-area-top">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Minhas Anotações</h1>
          <Button
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
            size="sm"
            className="rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova
          </Button>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <StickyNote className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma anotação
            </h3>
            <p className="text-muted-foreground max-w-[250px]">
              Crie notas para lembrar de coisas importantes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'p-4 rounded-2xl border transition-all',
                  note.is_important
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-card border-border'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleImportant(note.id)}
                    className="mt-1"
                  >
                    <Star
                      className={cn(
                        'w-5 h-5 transition-colors',
                        note.is_important
                          ? 'fill-[#FFD700] text-[#FFD700]'
                          : 'text-muted-foreground'
                      )}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{note.title}</h3>
                        {note.category && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {note.category}
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleEditNote(note.id)}
                          >
                            <Pencil className="w-4 h-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {note.content && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {note.content}
                      </p>
                    )}
                    {note.reminder_date && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-info">
                        <Bell className="w-3 h-3" />
                        {new Date(note.reminder_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Note Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNoteId ? 'Editar nota' : 'Nova anotação'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="noteTitle">Título</Label>
              <Input
                id="noteTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="O que você quer lembrar?"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noteContent">Conteúdo (opcional)</Label>
              <Textarea
                id="noteContent"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Adicione mais detalhes..."
                className="min-h-[100px] rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noteCategory">Categoria (opcional)</Label>
              <Input
                id="noteCategory"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Trabalho, AIMA, Pessoal..."
                className="h-12 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-[#FFD700]" />
                <span className="font-medium">Marcar como importante</span>
              </div>
              <Switch
                checked={formData.is_important}
                onCheckedChange={(checked) => setFormData({ ...formData, is_important: checked })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-info" />
                  <span className="font-medium">Adicionar lembrete</span>
                </div>
                <Switch
                  checked={formData.hasReminder}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasReminder: checked })}
                />
              </div>
              {formData.hasReminder && (
                <Input
                  type="date"
                  value={formData.reminder_date}
                  onChange={(e) => setFormData({ ...formData, reminder_date: e.target.value })}
                  className="h-12 rounded-xl"
                />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowAddDialog(false);
                }}
                className="flex-1 h-12 rounded-xl"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={!formData.title || saving}
                className="flex-1 h-12 rounded-xl"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A nota será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
}
