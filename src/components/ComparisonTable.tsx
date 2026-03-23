import type { CalculationResult, City } from '@/types';

const fmt = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });
const fmtDiff = (n: number) => (n >= 0 ? '+' : '') + fmt.format(n);

type Props = {
  allResults: CalculationResult[];
  selectedCity: City;
  onCitySelect: (city: City) => void;
};

export function ComparisonTable({ allResults, selectedCity, onCitySelect }: Props) {
  const selectedResult = allResults.find(r => r.city.id === selectedCity.id)!;

  return (
    <div className="mt-4 rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Usporedba gradova</h3>
        <p className="text-xs text-muted-foreground">
          Zona 1 (centar) za sve gradove · kliknite za odabir
        </p>
      </div>
      <div className="overflow-y-auto max-h-72">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">#</th>
              <th className="text-left px-4 py-2 text-xs text-muted-foreground font-medium">Grad</th>
              <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">God.</th>
              <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Mj.</th>
              <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">B</th>
              <th className="text-right px-4 py-2 text-xs text-muted-foreground font-medium">Razlika</th>
            </tr>
          </thead>
          <tbody>
            {allResults.map((r, i) => {
              const isSelected = r.city.id === selectedCity.id;
              const diff = r.annualTotal - selectedResult.annualTotal;
              return (
                <tr
                  key={r.city.id}
                  onClick={() => onCitySelect(r.city)}
                  className={`
                    cursor-pointer border-b border-border last:border-0 transition-colors
                    ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'}
                  `}
                >
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium">{r.city.name}</span>
                    <span className="ml-1.5 text-xs">{r.city.confirmed ? '✓' : '⚠'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">{fmt.format(r.annualTotal)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground text-xs">
                    {fmt.format(r.monthlyTotal)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {r.city.b.toFixed(2)}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono text-xs ${
                    isSelected ? 'text-muted-foreground' :
                    diff < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isSelected ? '—' : fmtDiff(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
