import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import {
    ShieldCheck,
    ChevronLeft,
    LayoutDashboard,
    Users,
    FileText,
    Shield,
    Bell,
    Settings,
    MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Import all admin modules
import { Dashboard } from '@/components/admin/Dashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { SecurityLogs } from '@/components/admin/SecurityLogs';
import { Communication } from '@/components/admin/Communication';
import { AppSettings } from '@/components/admin/AppSettings';
import { CommunityManagement } from '@/components/admin/CommunityManagement';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

type TabType = 'dashboard' | 'users' | 'content' | 'logs' | 'communication' | 'community' | 'settings';

export default function Admin() {
    const navigate = useNavigate();
    const { profile, loading: profileLoading } = useProfile();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    const isAdmin = profile?.is_admin === true || user?.email?.toLowerCase().trim() === 'brunoalmeidaoficial21@gmail.com';

    useEffect(() => {
        if (!profileLoading && !authLoading && !isAdmin) {
            navigate('/');
        }
    }, [isAdmin, profileLoading, authLoading, navigate]);

    if (profileLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const tabs = [
        { key: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
        { key: 'users' as TabType, label: 'Usuários', icon: Users },
        { key: 'content' as TabType, label: 'Conteúdo', icon: FileText },
        { key: 'community' as TabType, label: 'Comunidade', icon: MessageSquare },
        { key: 'logs' as TabType, label: 'Logs', icon: Shield },
        { key: 'communication' as TabType, label: 'Comunicação', icon: Bell },
        { key: 'settings' as TabType, label: 'Configurações', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'users':
                return <UserManagement />;
            case 'content':
                return <ContentManagement />;
            case 'logs':
                return <SecurityLogs />;
            case 'communication':
                return <Communication />;
            case 'community':
                return <CommunityManagement />;
            case 'settings':
                return <AppSettings />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <MobileLayout showNav={false}>
            <div className="px-5 py-6 safe-area-top min-h-screen bg-background">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Master Panel
                            </h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                Modo Administrador
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
                                    activeTab === tab.key
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="pb-8">{renderContent()}</div>
            </div>
        </MobileLayout>
    );
}
