import type { ZoneNumber, City } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  city: City;
  zone: ZoneNumber;
  onChange: (z: ZoneNumber) => void;
};

export function ZoneSelector({ city, zone, onChange }: Props) {
  if (city.zoneCount === 9) {
    return (
      <div>
        <label className="text-sm font-medium mb-2 block">Zona</label>
        <Select
          value={String(zone)}
          onValueChange={v => onChange(Number(v) as ZoneNumber)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Array.from({ length: 9 }, (_, i) => i + 1) as ZoneNumber[]).map(n => {
              const z = city.zones[n];
              return (
                <SelectItem key={n} value={String(n)}>
                  <span className="font-medium">{z.label}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{z.description}</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Kz = {city.zones[zone].kz.toFixed(2)} · Provjeri zonu na svom rješenju.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Zona</label>
      <div className="grid grid-cols-3 gap-2">
        {([1, 2, 3] as ZoneNumber[]).map(n => {
          const z = city.zones[n];
          return (
            <Button
              key={n}
              variant={zone === n ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(n)}
              className="flex flex-col h-auto py-2"
            >
              <span className="text-xs font-semibold">{z.label}</span>
              <span className="text-xs opacity-70">{z.description}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
