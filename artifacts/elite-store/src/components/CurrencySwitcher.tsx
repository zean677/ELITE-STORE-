import React from 'react';
import { useCurrency } from '@/hooks/use-currency';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Coins } from 'lucide-react';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <span className="font-bold">{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'ل.س'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem onClick={() => setCurrency('USD')} className={currency === 'USD' ? 'bg-primary/20 text-primary' : ''}>
          USD ($)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency('SYP')} className={currency === 'SYP' ? 'bg-primary/20 text-primary' : ''}>
          SYP (ل.س)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setCurrency('EUR')} className={currency === 'EUR' ? 'bg-primary/20 text-primary' : ''}>
          EUR (€)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
