import { useState } from 'react';
import { Search, UserCog, Ban, CheckCircle, Key, Shield, ShieldOff, FileText } from 'lucide-react';
import { useAdminUsers, AdminUser } from '@/hooks/useAdminUsers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UserManagement() {
    const { users, isLoading, suspendUser, reactivateUser, toggleAdmin, resetPassword } = useAdminUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'admins'>('all');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: 'suspend' | 'reactivate' | 'toggleAdmin' | 'resetPassword' | null;
        user: AdminUser | null;
    }>({ open: false, type: null, user: null });
    const [suspendReason, setSuspendReason] = useState('');

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === 'active') return !user.is_suspended;
        if (filter === 'suspended') return user.is_suspended;
        if (filter === 'admins') return user.is_admin;
        return true;
    });

    const handleAction = async () => {
        if (!actionDialog.user) return;

        try {
            switch (actionDialog.type) {
                case 'suspend':
                    await suspendUser({ userId: actionDialog.user.user_id, reason: suspendReason });
                    break;
                case 'reactivate':
                    await reactivateUser(actionDialog.user.user_id);
                    break;
                case 'toggleAdmin':
                    await toggleAdmin({ userId: actionDialog.user.user_id, isAdmin: actionDialog.user.is_admin });
                    break;
                case 'resetPassword':
                    await resetPassword(actionDialog.user.email);
                    break;
            }
            setActionDialog({ open: false, type: null, user: null });
            setSuspendReason('');
        } catch (error) {
            console.error('Action failed:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 rounded-xl" />
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'Todos' },
                    { key: 'active', label: 'Ativos' },
                    { key: 'suspended', label: 'Suspensos' },
                    { key: 'admins', label: 'Admins' },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === f.key
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* User List */}
            <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase font-medium px-1">
                    {filteredUsers.length} usuário(s)
                </p>
                {filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        className="p-4 bg-card border border-border rounded-2xl space-y-3"
                    >
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold truncate">{user.display_name || 'Sem nome'}</p>
                                    {user.is_admin && (
                                        <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                                    )}
                                    {user.is_suspended && (
                                        <Ban className="w-4 h-4 text-destructive flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span>{user.document_count || 0} docs</span>
                                    {user.last_login_at && (
                                        <span>Último login: {format(new Date(user.last_login_at), 'dd/MM/yy', { locale: ptBR })}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                                className="p-2 hover:bg-muted rounded-xl transition-colors"
                            >
                                <UserCog className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Actions (expanded) */}
                        {selectedUser?.id === user.id && (
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                                {!user.is_suspended ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActionDialog({ open: true, type: 'suspend', user })}
                                        className="text-destructive"
                                    >
                                        <Ban className="w-4 h-4 mr-2" />
                                        Suspender
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActionDialog({ open: true, type: 'reactivate', user })}
                                        className="text-green-500"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Reativar
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActionDialog({ open: true, type: 'resetPassword', user })}
                                >
                                    <Key className="w-4 h-4 mr-2" />
                                    Reset Senha
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActionDialog({ open: true, type: 'toggleAdmin', user })}
                                    className="col-span-2"
                                >
                                    {user.is_admin ? (
                                        <>
                                            <ShieldOff className="w-4 h-4 mr-2" />
                                            Remover Admin
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4 mr-2" />
                                            Promover Admin
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {user.is_suspended && user.suspended_reason && (
                            <div className="p-3 bg-destructive/10 rounded-xl">
                                <p className="text-xs font-medium text-destructive">Motivo: {user.suspended_reason}</p>
                            </div>
                        )}
                    </div>
                ))}

                {filteredUsers.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground text-sm">
                        Nenhum usuário encontrado
                    </p>
                )}
            </div>

            {/* Action Dialog */}
            <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionDialog.type === 'suspend' && 'Suspender Usuário'}
                            {actionDialog.type === 'reactivate' && 'Reativar Usuário'}
                            {actionDialog.type === 'toggleAdmin' && (actionDialog.user?.is_admin ? 'Remover Admin' : 'Promover Admin')}
                            {actionDialog.type === 'resetPassword' && 'Resetar Senha'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionDialog.type === 'suspend' && (
                                <div className="space-y-3">
                                    <p>Suspender {actionDialog.user?.email}?</p>
                                    <Input
                                        placeholder="Motivo da suspensão..."
                                        value={suspendReason}
                                        onChange={(e) => setSuspendReason(e.target.value)}
                                    />
                                </div>
                            )}
                            {actionDialog.type === 'reactivate' && `Reativar ${actionDialog.user?.email}?`}
                            {actionDialog.type === 'toggleAdmin' && (
                                actionDialog.user?.is_admin
                                    ? `Remover privilégios de admin de ${actionDialog.user?.email}?`
                                    : `Promover ${actionDialog.user?.email} para administrador?`
                            )}
                            {actionDialog.type === 'resetPassword' && `Enviar email de redefinição de senha para ${actionDialog.user?.email}?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleAction}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
