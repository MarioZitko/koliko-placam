import { Separator } from '@/components/ui/separator';
import type { CalculationResult } from '@/types';

const fmt = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });

type Props = { result: CalculationResult };

export function ResultCard({ result }: Props) {
  const zoneInfo = result.city.zones[result.zone];

  return (
    <div className="rounded-lg bg-muted p-4 space-y-3">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Godišnja naknada
        </p>
        <p className="text-4xl font-bold tracking-tight">
          {fmt.format(result.annualTotal)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {fmt.format(result.monthlyTotal)} / mjesec
        </p>
      </div>

      <Separator />

      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Formula
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          B ({result.city.b.toFixed(2)}) × Kz ({zoneInfo.kz.toFixed(2)}) × Kn (1.0) × {result.sqm}m²
        </p>
        <p className="text-xs font-mono font-medium mt-0.5">
          = {fmt.format(result.annualTotal)}
        </p>
        {result.city.zoneCount === 9 && (
          <p className="text-xs text-muted-foreground mt-1">
            {zoneInfo.label} · {zoneInfo.description}
          </p>
        )}
      </div>

      {!result.city.confirmed && (
        <>
          <Separator />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠ Vrijednost boda za {result.city.name} je procjena temeljena na javno
            dostupnim informacijama. Provjerite aktualne podatke na web stranici
            vaše općine ili grada.
          </p>
        </>
      )}
    </div>
  );
}
