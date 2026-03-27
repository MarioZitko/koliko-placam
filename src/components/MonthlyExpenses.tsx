import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import type { CalculationResult } from '@/types';

const fmt = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });

// Who is responsible for each cost
type Payer = 'vlasnik' | 'stanar' | 'oboje';

const PAYER_LABEL: Record<Payer, { label: string; cls: string }> = {
  vlasnik: { label: 'vlasnik', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  stanar:  { label: 'stanar',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  oboje:   { label: 'oboje',   cls: 'bg-muted text-muted-foreground' },
};

function PayerBadge({ payer }: { payer: Payer }) {
  const { label, cls } = PAYER_LABEL[payer];
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${cls}`}>
      {label}
    </span>
  );
}

type EditableRow = {
  id: string;
  label: string;
  payer: Payer;
  defaultMonthly: number;
  hint?: string;
};

const EDITABLE_ROWS: EditableRow[] = [
  { id: 'struja',   label: 'Struja',            payer: 'oboje',   defaultMonthly: 80,  hint: 'Prosječno kućanstvo ~60–120 €/mj' },
  { id: 'voda',     label: 'Voda i odvodnja',   payer: 'oboje',   defaultMonthly: 20,  hint: '~15–35 €/mj za 2–3 osobe' },
  { id: 'grijanje', label: 'Grijanje / plin',   payer: 'oboje',   defaultMonthly: 60,  hint: 'Sezonski; toplana ili plin' },
  { id: 'pricuva',  label: 'Pričuva',           payer: 'vlasnik', defaultMonthly: 30,  hint: 'Samo za stanove; kuće nemaju' },
  { id: 'internet', label: 'Internet + TV',     payer: 'oboje',   defaultMonthly: 15,  hint: '~10–25 €/mj' },
  { id: 'ostalo',   label: 'Ostalo',            payer: 'oboje',   defaultMonthly: 0,   hint: 'Osiguranje, dimnjačar...' },
];

type Props = {
  result: CalculationResult;
};

export function MonthlyExpenses({ result }: Props) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(EDITABLE_ROWS.map(r => [r.id, r.defaultMonthly]))
  );

  const naknadaMonthly = result.naknadaAnnual / 12;
  const wasteMonthly   = result.wasteAnnual / 12;
  const userTotal      = Object.values(values).reduce((s, v) => s + (isNaN(v) ? 0 : v), 0);
  const grandTotal     = naknadaMonthly + wasteMonthly + userTotal;

  function set(id: string, val: number) {
    setValues(prev => ({ ...prev, [id]: isNaN(val) ? 0 : val }));
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <div>
          <span className="text-sm font-semibold">Svi troškovi / mjesec</span>
          <span className="ml-2 text-xs text-muted-foreground">
            ukupno ~{fmt.format(grandTotal)}/mj
          </span>
        </div>
        <span className="text-muted-foreground text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">

          {/* Who pays legend */}
          <div className="pt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Tko plaća?</span>
            <PayerBadge payer="vlasnik" />
            <span>= plaća samo vlasnik nekretnine</span>
            <PayerBadge payer="stanar" />
            <span>= plaća stanar</span>
            <PayerBadge payer="oboje" />
            <span>= ovisi o ugovoru</span>
          </div>

          <Separator />

          {/* Fixed calculated rows */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Izračunato prema gradu i stanu
            </p>
            <FixedRow
              label="Komunalna naknada"
              monthly={naknadaMonthly}
              payer="vlasnik"
              note={result.city.confirmed ? undefined : '⚠ procjena'}
            />
            <FixedRow
              label="Odvoz otpada (120L, 1×/tj.)"
              monthly={wasteMonthly}
              payer="oboje"
              note={result.city.wasteConfirmed ? undefined : '⚠ procjena'}
            />
          </div>

          <Separator />

          {/* User-editable rows */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Unesite vaše stvarne iznose
            </p>
            {EDITABLE_ROWS.map(row => (
              <div key={row.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm truncate">{row.label}</span>
                    <PayerBadge payer={row.payer} />
                  </div>
                  {row.hint && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{row.hint}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => set(row.id, Math.max(0, (values[row.id] ?? 0) - 5))}
                    className="w-6 h-6 rounded border border-input flex items-center justify-center text-sm leading-none hover:bg-muted transition-colors select-none"
                  >−</button>
                  <input
                    type="number"
                    min={0}
                    value={values[row.id] ?? 0}
                    onChange={e => set(row.id, Number(e.target.value))}
                    onBlur={e => set(row.id, Math.max(0, Number(e.target.value)))}
                    className="w-14 text-center border border-input rounded-md px-1 py-1 text-sm bg-background"
                  />
                  <button
                    type="button"
                    onClick={() => set(row.id, (values[row.id] ?? 0) + 5)}
                    className="w-6 h-6 rounded border border-input flex items-center justify-center text-sm leading-none hover:bg-muted transition-colors select-none"
                  >+</button>
                  <span className="text-xs text-muted-foreground w-6">€</span>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Grand total */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Komunalna naknada + otpad</span>
              <span className="text-sm font-mono tabular-nums">{fmt.format(naknadaMonthly + wasteMonthly)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Režije (vaš unos)</span>
              <span className="text-sm font-mono tabular-nums">{fmt.format(userTotal)}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1.5 border-t border-border">
              <span className="text-sm font-bold">Ukupno / mjesec</span>
              <span className="text-xl font-bold font-mono tabular-nums">{fmt.format(grandTotal)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Ukupno / godina</span>
              <span className="text-sm font-mono tabular-nums text-muted-foreground">{fmt.format(grandTotal * 12)}</span>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Komunalna naknada plaća isključivo vlasnik nekretnine — stanari je ne plaćaju.
            Odvoz otpada plaća korisnik (vlasnik ili stanar prema ugovoru o najmu).
            Grijanje, struja i voda plaća onaj tko je korisnik usluge (obično stanar).
            Pričuva plaća vlasnik stana.
          </p>
        </div>
      )}
    </div>
  );
}

function FixedRow({
  label, monthly, payer, note,
}: {
  label: string; monthly: number; payer: Payer; note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm truncate">{label}</span>
        <PayerBadge payer={payer} />
        {note && <span className="text-[10px] text-amber-500">{note}</span>}
      </div>
      <span className="text-sm font-mono tabular-nums shrink-0">{fmt.format(monthly)}</span>
    </div>
  );
}
