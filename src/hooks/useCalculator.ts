import { useState, useMemo } from 'react';
import { CITIES } from '@/data/cities';
import type { City, ZoneNumber, CalculationResult } from '@/types';

export function useCalculator() {
  const [selectedCity, setSelectedCityRaw] = useState<City>(CITIES[0]);
  const [sqm, setSqm] = useState<number>(80);
  const [zone, setZone] = useState<ZoneNumber>(1);

  function setSelectedCity(city: City) {
    setSelectedCityRaw(city);
    setZone(1);
  }

  const result = useMemo((): CalculationResult => {
    const safeZone = (zone <= selectedCity.zoneCount ? zone : 1) as ZoneNumber;
    const { kz } = selectedCity.zones[safeZone];
    const kn = 1.0;
    const naknadaAnnual = selectedCity.b * kz * kn * sqm;
    const wasteAnnual = selectedCity.wasteAnnual;
    const totalAnnual = naknadaAnnual + wasteAnnual;
    return {
      city: selectedCity,
      zone: safeZone,
      sqm,
      naknadaAnnual,
      wasteAnnual,
      totalAnnual,
      monthlyTotal: totalAnnual / 12,
      formula: `${selectedCity.b.toFixed(2)} × ${kz.toFixed(2)} × ${kn.toFixed(1)} × ${sqm}m²`,
    };
  }, [selectedCity, sqm, zone]);

  // Comparison table always uses zona 1, and total = naknada + waste
  const allResults = useMemo((): CalculationResult[] =>
    CITIES.map(city => {
      const { kz } = city.zones[1];
      const kn = 1.0;
      const naknadaAnnual = city.b * kz * kn * sqm;
      const wasteAnnual = city.wasteAnnual;
      const totalAnnual = naknadaAnnual + wasteAnnual;
      return {
        city,
        zone: 1 as ZoneNumber,
        sqm,
        naknadaAnnual,
        wasteAnnual,
        totalAnnual,
        monthlyTotal: totalAnnual / 12,
        formula: `${city.b.toFixed(2)} × ${kz.toFixed(2)} × ${kn.toFixed(1)} × ${sqm}m²`,
      };
    }).sort((a, b) => a.totalAnnual - b.totalAnnual),
  [sqm]);

  return { selectedCity, setSelectedCity, sqm, setSqm, zone, setZone, result, allResults };
}
