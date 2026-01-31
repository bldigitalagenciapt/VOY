import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Star, Loader2, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function QuickAccess() {
  const navigate = useNavigate();

  const { profile, updateProfile, updateNumber } = useProfile();
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<{ id?: string, label: string, value: string, isStandard?: boolean } | null>(null);
  const [newBlockLabel, setNewBlockLabel] = useState('');
  const [newBlockValue, setNewBlockValue] = useState('');

  const customBlocks = profile?.custom_quick_access || [];

  const standardBlocks = [
    { key: 'nif', label: 'NIF', value: profile?.nif || '' },
    { key: 'niss', label: 'NISS', value: profile?.niss || '' },
    { key: 'sns', label: 'SNS', value: profile?.sns || '' },
    { key: 'passport', label: 'Passaporte', value: profile?.passport || '' },
  ];

  const handleAddBlock = async () => {
    if (!newBlockLabel.trim()) return;
    const updatedBlocks = [...customBlocks, { label: newBlockLabel, value: newBlockValue, id: Date.now().toString() }];
    await updateProfile({ custom_quick_access: updatedBlocks });
    setShowAddBlock(false);
    setNewBlockLabel('');
    setNewBlockValue('');
  };

  const handleEditBlock = async () => {
    if (!editingBlock) return;

    if (editingBlock.isStandard) {
      await updateNumber(editingBlock.id as any, editingBlock.value);
    } else {
      const updatedBlocks = customBlocks.map(b =>
        b.id === editingBlock.id ? { ...b, value: editingBlock.value } : b
      );
      await updateProfile({ custom_quick_access: updatedBlocks });
    }
    setEditingBlock(null);
  };

  const handleDeleteBlock = async (id: string) => {
    const updatedBlocks = customBlocks.filter((b) => b.id !== id);
    await updateProfile({ custom_quick_access: updatedBlocks });
  };

  if (!profile) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="px-5 py-6 safe-area-top">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Acesso Rápido</h1>
            <p className="text-sm text-muted-foreground">Configurar blocos e documentos</p>
          </div>
        </div>

        {/* Custom Blocks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Meus Blocos (Números)</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowAddBlock(true)} className="text-primary h-8 gap-1">
              <Plus className="w-4 h-4" /> Novo Bloco
            </Button>
          </div>

          <div className="space-y-2">
            {/* Standard Blocks First */}
            {standardBlocks.map((block) => (
              <div
                key={block.key}
                className="flex items-center gap-3 p-4 bg-card border rounded-2xl cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => setEditingBlock({ id: block.key, label: block.label, value: block.value, isStandard: true })}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{block.label}</p>
                  <p className="text-xs text-muted-foreground">{block.value || 'Toque para adicionar'}</p>
                </div>
                <div className="text-xs text-primary font-medium">Editar</div>
              </div>
            ))}

            {/* Custom Blocks */}
            {customBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-3 p-4 bg-card border rounded-2xl cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => setEditingBlock({ id: block.id, label: block.label, value: block.value, isStandard: false })}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{block.label}</p>
                  <p className="text-xs text-muted-foreground">{block.value || 'Toque para adicionar'}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBlock(block.id);
                  }}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <div className="flex gap-3">
            <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Cartões de Acesso Rápido</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adicione NIF, NISS ou crie seus próprios blocos personalizados para ter seus números sempre à mão.
              </p>
            </div>
          </div>
        </div>


        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          className="w-full h-12 rounded-xl mb-12"
        >
          Voltar para Home
        </Button>
      </div>

      {/* Add Block Dialog */}
      <Dialog open={showAddBlock} onOpenChange={setShowAddBlock}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Novo Bloco de Acesso Rápido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome do Bloco (ex: NIF, NISS)</Label>
              <Input value={newBlockLabel} onChange={(e) => setNewBlockLabel(e.target.value)} placeholder="Ex: NIF" className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>Número (Opcional)</Label>
              <Input value={newBlockValue} onChange={(e) => setNewBlockValue(e.target.value)} placeholder="Digite o número" className="rounded-xl h-12" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddBlock(false)} className="flex-1 h-12 rounded-xl">Cancelar</Button>
              <Button onClick={handleAddBlock} disabled={!newBlockLabel.trim()} className="flex-1 h-12 rounded-xl">Criar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar {editingBlock?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Número / Valor</Label>
              <Input
                value={editingBlock?.value || ''}
                onChange={(e) => setEditingBlock(prev => prev ? { ...prev, value: e.target.value } : null)}
                placeholder="Digite o número"
                className="rounded-xl h-12"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setEditingBlock(null)} className="flex-1 h-12 rounded-xl">Cancelar</Button>
              <Button onClick={handleEditBlock} className="flex-1 h-12 rounded-xl">Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
