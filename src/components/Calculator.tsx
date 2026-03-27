import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZoneSelector } from './ZoneSelector';
import { ResultCard } from './ResultCard';
import { MonthlyExpenses } from './MonthlyExpenses';
import type { City, ZoneNumber, CalculationResult } from '@/types';

type Props = {
  selectedCity: City;
  sqm: number;
  zone: ZoneNumber;
  result: CalculationResult;
  onSqmChange: (v: number) => void;
  onZoneChange: (z: ZoneNumber) => void;
};

export function Calculator({ selectedCity, sqm, zone, result, onSqmChange, onZoneChange }: Props) {
  return (
    <div className="space-y-3">
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold">{selectedCity.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedCity.county}</p>
          </div>
          {!selectedCity.confirmed && (
            <Badge variant="outline" className="text-amber-600 border-amber-400 shrink-0">
              ⚠ Procjena
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Površina stana</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={20}
              max={300}
              step={5}
              value={sqm}
              onChange={e => onSqmChange(Number(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSqmChange(Math.max(20, sqm - 5))}
                className="w-7 h-7 rounded border border-input flex items-center justify-center text-base leading-none hover:bg-muted transition-colors select-none"
                aria-label="Smanji"
              >−</button>
              <input
                type="number"
                min={20}
                max={300}
                value={sqm}
                onChange={e => onSqmChange(Number(e.target.value))}
                onBlur={e => onSqmChange(Math.min(300, Math.max(20, Number(e.target.value))))}
                className="w-14 text-center border border-input rounded-md px-1 py-1 text-sm bg-background"
              />
              <button
                type="button"
                onClick={() => onSqmChange(Math.min(300, sqm + 5))}
                className="w-7 h-7 rounded border border-input flex items-center justify-center text-base leading-none hover:bg-muted transition-colors select-none"
                aria-label="Povećaj"
              >+</button>
              <span className="text-sm text-muted-foreground ml-0.5">m²</span>
            </div>
          </div>
        </div>

        <ZoneSelector city={selectedCity} zone={zone} onChange={onZoneChange} />

        <ResultCard result={result} />
      </CardContent>
    </Card>

    <MonthlyExpenses result={result} />
    </div>
  );
}
