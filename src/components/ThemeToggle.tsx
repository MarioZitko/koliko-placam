import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

type Props = { dark: boolean; onToggle: () => void };

export function ThemeToggle({ dark, onToggle }: Props) {
  return (
    <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Toggle theme">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
