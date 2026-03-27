import { useState } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Map } from '@/components/Map';
import { Calculator } from '@/components/Calculator';
import { ComparisonTable } from '@/components/ComparisonTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SourcesPage } from '@/pages/SourcesPage';
import { Badge } from '@/components/ui/badge';

type Tab = 'kalkulator' | 'gradovi';

export default function App() {
  const { dark, toggle } = useDarkMode();
  const [activeTab, setActiveTab] = useState<Tab>('kalkulator');
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

        {/* Tab nav */}
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1 -mb-px">
            {(['kalkulator', 'gradovi'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize
                  ${activeTab === tab
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }
                `}
              >
                {tab === 'kalkulator' ? 'Kalkulator' : 'Gradovi & Podaci'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'kalkulator' ? (
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
        ) : (
          <SourcesPage />
        )}
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
