import { useCalculator } from '@/hooks/useCalculator';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Map } from '@/components/Map';
import { Calculator } from '@/components/Calculator';
import { ComparisonTable } from '@/components/ComparisonTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';

export default function App() {
  const { dark, toggle } = useDarkMode();
  const {
    selectedCity, setSelectedCity,
    sqm, setSqm,
    zone, setZone,
    result, allResults,
  } = useCalculator();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Koliko Plaćam</h1>
            <p className="text-xs text-muted-foreground">
              Izračun komunalne naknade za stambeni prostor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Podaci za 2026.</Badge>
            <ThemeToggle dark={dark} onToggle={toggle} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div>
            <Map
              selectedCity={selectedCity}
              onCitySelect={setSelectedCity}
              sqm={sqm}
              dark={dark}
            />
            <ComparisonTable
              allResults={allResults}
              selectedCity={selectedCity}
              onCitySelect={setSelectedCity}
            />
          </div>
          <div>
            <Calculator
              selectedCity={selectedCity}
              sqm={sqm}
              zone={zone}
              result={result}
              onSqmChange={setSqm}
              onZoneChange={setZone}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground">
            Podaci su informativni i temelje se na javno dostupnim odlukama JLS.
            Uvijek provjerite aktualne vrijednosti s vašom općinom ili gradom.
            ✓ = službeno potvrđeno · ⚠ = procjena · Zadnje ažuriranje: ožujak 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
