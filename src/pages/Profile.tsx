import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ChevronLeft,
  Camera,
  User,
  Mail,
  Lock,
  Loader2,
  Check,
  Settings,
  FolderPlus,
  Star,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { validatePassword, getPasswordStrength } from '@/lib/passwordValidation';
import { logger } from '@/lib/logger';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [tempName, setTempName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('voy_secure_docs')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('voy_secure_docs')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: publicUrl });

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });
    } catch (error) {
      logger.error('Error uploading photo');
      toast({
        variant: "destructive",
        title: "Erro ao enviar foto",
        description: "Tente novamente.",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) return;

    setSaving(true);
    await updateProfile({ display_name: tempName });
    setSaving(false);
    setShowNameDialog(false);
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
      });
      return;
    }

    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: validation.errors[0],
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso.",
      });

      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const authError = error as Error;
      logger.error('Error changing password', { error: authError.message });
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: "Ocorreu um erro. Tente novamente.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Usuário';
  const avatarUrl = profile?.avatar_url;

  return (
    <MobileLayout showNav={false}>
      <div className="px-5 py-6 safe-area-top">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        </div>

        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
              {uploadingPhoto ? (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              ) : profile?.signedAvatarUrl ? (
                <img src={profile.signedAvatarUrl} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold">{displayName}</h2>
          <p className="text-muted-foreground">{user?.email}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        {/* Profile Options */}
        <div className="space-y-2 mb-8">
          <button
            onClick={() => {
              setTempName(displayName);
              setShowNameDialog(true);
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Nome</p>
              <p className="text-sm text-muted-foreground">{displayName}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setShowPasswordDialog(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Alterar senha</p>
              <p className="text-sm text-muted-foreground">Atualize sua senha</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Settings Shortcuts */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Configurações rápidas
          </h3>

          <button
            onClick={() => navigate('/settings/categories')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-info" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Categorias de documentos</p>
              <p className="text-sm text-muted-foreground">Gerenciar categorias</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate('/settings/quick-access')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Acesso rápido</p>
              <p className="text-sm text-muted-foreground">Escolher documentos favoritos</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate('/settings', { replace: true })}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">Todas as configurações</p>
              <p className="text-sm text-muted-foreground">Idioma, tema e mais</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome de exibição</Label>
              <Input
                id="name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Seu nome"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNameDialog(false)}
                className="flex-1 h-12 rounded-xl"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveName}
                className="flex-1 h-12 rounded-xl"
                disabled={saving || !tempName.trim()}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="h-12 rounded-xl"
              />

              {/* Password strength indicator */}
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    <div className={cn(
                      "h-1 flex-1 rounded",
                      passwordStrength === 'weak' ? 'bg-destructive' :
                        passwordStrength === 'medium' ? 'bg-warning' : 'bg-success'
                    )} />
                    <div className={cn(
                      "h-1 flex-1 rounded",
                      passwordStrength === 'medium' ? 'bg-warning' :
                        passwordStrength === 'strong' ? 'bg-success' : 'bg-muted'
                    )} />
                    <div className={cn(
                      "h-1 flex-1 rounded",
                      passwordStrength === 'strong' ? 'bg-success' : 'bg-muted'
                    )} />
                  </div>
                  <p className={cn(
                    "text-xs",
                    passwordStrength === 'weak' ? 'text-destructive' :
                      passwordStrength === 'medium' ? 'text-warning' : 'text-success'
                  )}>
                    Força: {passwordStrength === 'weak' ? 'Fraca' :
                      passwordStrength === 'medium' ? 'Média' : 'Forte'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mínimo 8 caracteres, 1 letra e 1 número
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 h-12 rounded-xl"
                disabled={changingPassword}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleChangePassword}
                className="flex-1 h-12 rounded-xl"
                disabled={changingPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Alterar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
