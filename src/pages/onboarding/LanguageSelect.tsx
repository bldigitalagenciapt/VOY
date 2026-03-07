import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'pt' as const, name: 'Português', flag: '🇧🇷 🇵🇹' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧 🇺🇸' },
];

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useApp();
  const { updateProfile } = useProfile();

  const handleContinue = async () => {
    if (language) {
      await updateProfile({ language });
    }
    navigate('/onboarding/profile');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-12">
      <div className="flex-1 max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
          {t('language.select')}
        </h1>
        <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {t('onboarding.language.hint')}
        </p>

        <div className="space-y-3">
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                'w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 animate-slide-up',
                language === lang.code
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              )}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="flex-1 text-left font-semibold text-lg">{lang.name}</span>
              {language === lang.code && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm mx-auto mt-8">
        <Button
          onClick={handleContinue}
          className="w-full h-14 text-lg font-semibold rounded-2xl btn-primary-elevated"
          size="lg"
        >
          {t('continue')}
        </Button>
      </div>
    </div>
  );
}
