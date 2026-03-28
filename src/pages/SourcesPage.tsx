import { useState } from 'react';
import { CITIES } from '@/data/cities';

const fmt = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });

type SortKey = 'name' | 'b' | 'wasteAnnual' | 'county';
type SortDir = 'asc' | 'desc';

function SortHeader({
  col, label, sortKey, sortDir, onSort,
}: {
  col: SortKey; label: string; sortKey: SortKey; sortDir: SortDir; onSort: (col: SortKey) => void;
}) {
  const active = sortKey === col;
  return (
    <th
      className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
      onClick={() => onSort(col)}
    >
      {label}
      <span className="ml-1 opacity-60">
        {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  );
}

export function SourcesPage() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('b');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'county' ? 'asc' : 'desc');
    }
  }

  const filtered = CITIES
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.county.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name, 'hr');
      else if (sortKey === 'county') cmp = a.county.localeCompare(b.county, 'hr');
      else if (sortKey === 'b') cmp = a.b - b.b;
      else if (sortKey === 'wasteAnnual') cmp = a.wasteAnnual - b.wasteAnnual;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold">Gradovi & Podaci</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sve vrijednosti boda komunalne naknade i procjene odvoza otpada s izvorima. ✓ = potvrđeno · ⚠ = procjena
          </p>
        </div>
        <input
          type="text"
          placeholder="Pretraži grad ili županiju…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 border border-input rounded-md px-3 py-1.5 text-sm bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <SortHeader col="name" label="Grad" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader col="county" label="Županija" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Zone</th>
                <SortHeader col="b" label="B (€/m²/god)" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Kn naknada</th>
                <SortHeader col="wasteAnnual" label="Otpad/god (proc.)" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">God. ažur.</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Izvor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((city, i) => (
                <tr
                  key={city.id}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                >
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                    {city.name}
                    <span className="ml-1.5 text-xs">{city.confirmed ? '✓' : '⚠'}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs whitespace-nowrap">{city.county}</td>
                  <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{city.zoneCount}</td>
                  <td className="px-3 py-2.5 font-mono text-xs font-medium">{city.b.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {city.confirmed
                      ? <span className="text-green-600 dark:text-green-400 font-medium">✓ potvrđeno</span>
                      : <span className="text-amber-600 dark:text-amber-400">⚠ procjena</span>
                    }
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">
                    <span>{fmt.format(city.wasteAnnual)}</span>
                    <span className="ml-1 text-muted-foreground">
                      {city.wasteConfirmed ? '✓' : '⚠'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{city.sourceYear}</td>
                  <td className="px-3 py-2.5 text-xs">
                    <a
                      href={city.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-70 transition-opacity break-all"
                    >
                      {new URL(city.sourceUrl).hostname.replace('www.', '')}
                    </a>
                    {city.wasteSourceUrl && (
                      <>
                        <span className="text-muted-foreground mx-1">·</span>
                        <a
                          href={city.wasteSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
                        >
                          otpad
                        </a>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground text-sm">
                    Nema rezultata za "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Napomena o podacima</p>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Vrijednost boda komunalne naknade (B) potvrđena je samo tamo gdje je navedeno "✓ potvrđeno" —
          iz službenih odluka JLS (Narodne Novine, Službeni glasnici). Ostale vrijednosti su procjene
          temeljene na medijskim izvješćima o postotnim povećanjima za 2026. godinu.
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
          Odvoz otpada prikazan je kao procjena za standardno kućanstvo (120L posuda, 1× tjedno pražnjenje).
          Stvarni iznos ovisi o veličini posude, učestalosti pražnjenja i pružatelju usluge u vašem gradu.
        </p>
      </div>
    </div>
  );
}
