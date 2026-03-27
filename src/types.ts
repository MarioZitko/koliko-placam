export type ZoneNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type ZoneInfo = {
  kz: number;
  label: string;
  description: string;
};

export type City = {
  id: string;
  name: string;
  county: string;
  lat: number;
  lng: number;
  b: number;
  zoneCount: 3 | 9;
  zones: Record<ZoneNumber, ZoneInfo>;
  sourceUrl: string;
  sourceYear: number;
  confirmed: boolean;
  // Odvoz otpada — annual cost for standard 120L bin, weekly pickup, stambeni
  wasteAnnual: number;
  wasteConfirmed: boolean;
  wasteSourceUrl?: string;
};

export type CalculationResult = {
  city: City;
  zone: ZoneNumber;
  sqm: number;
  naknadaAnnual: number;  // komunalna naknada only
  wasteAnnual: number;    // odvoz otpada (fixed, not m²-dependent)
  totalAnnual: number;    // naknadaAnnual + wasteAnnual
  monthlyTotal: number;   // totalAnnual / 12
  formula: string;
};
