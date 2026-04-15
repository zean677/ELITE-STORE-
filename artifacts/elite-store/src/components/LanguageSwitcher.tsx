import React from 'react';
import { useLanguage } from '@/i18n';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem onClick={() => setLang('ar')} className={lang === 'ar' ? 'bg-primary/20 text-primary' : ''}>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'bg-primary/20 text-primary' : ''}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
