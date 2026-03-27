import { Separator } from '@/components/ui/separator';
import type { CalculationResult } from '@/types';

const fmt = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });

type Props = { result: CalculationResult };

function CostRow({ label, annual, isEstimate }: { label: string; annual: number; isEstimate?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs text-muted-foreground">
        {label}
        {isEstimate && <span className="ml-1 text-amber-500">⚠</span>}
      </span>
      <span className="text-sm font-mono font-medium tabular-nums">{fmt.format(annual)}</span>
    </div>
  );
}

export function ResultCard({ result }: Props) {
  const zoneInfo = result.city.zones[result.zone];

  return (
    <div className="rounded-lg bg-muted p-4 space-y-3">
      {/* Big total */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Ukupni godišnji troškovi
        </p>
        <p className="text-4xl font-bold tracking-tight">
          {fmt.format(result.totalAnnual)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {fmt.format(result.monthlyTotal)} / mjesec
        </p>
      </div>

      <Separator />

      {/* Breakdown */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Razrada</p>
        <CostRow
          label="Komunalna naknada"
          annual={result.naknadaAnnual}
          isEstimate={!result.city.confirmed}
        />
        <CostRow
          label="Odvoz otpada (procjena, 120L, 1×/tj.)"
          annual={result.wasteAnnual}
          isEstimate={!result.city.wasteConfirmed}
        />
        <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-border">
          <span className="text-xs font-medium">Ukupno / god</span>
          <span className="text-sm font-mono font-bold tabular-nums">{fmt.format(result.totalAnnual)}</span>
        </div>
        <p className="text-xs text-muted-foreground pt-0.5">
          Nisu uključeni: voda i odvodnja, struja, pričuva (za stanove).
        </p>
      </div>

      <Separator />

      {/* Formula */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Formula (komunalna naknada)
        </p>
        <p className="text-xs font-mono text-muted-foreground">
          B ({result.city.b.toFixed(2)}) × Kz ({zoneInfo.kz.toFixed(2)}) × Kn (1.0) × {result.sqm}m²
        </p>
        <p className="text-xs font-mono font-medium mt-0.5">
          = {fmt.format(result.naknadaAnnual)}
        </p>
        {result.city.zoneCount === 9 && (
          <p className="text-xs text-muted-foreground mt-1">
            {zoneInfo.label} · {zoneInfo.description}
          </p>
        )}
      </div>

      {(!result.city.confirmed || !result.city.wasteConfirmed) && (
        <>
          <Separator />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠ Jedan ili više podataka za {result.city.name} su procjene na temelju javno
            dostupnih informacija. Provjerite aktualne vrijednosti kod vaše JLS ili komunalne tvrtke.
          </p>
        </>
      )}
    </div>
  );
}
