import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import { CITIES } from '@/data/cities';
import type { City } from '@/types';

// GeoJSON 'name' → city.county (only special case needed)
const GEOJSON_TO_COUNTY: Record<string, string> = {
  'Zagreb': 'Grad Zagreb',
};
function resolveCounty(geoName: string): string {
  return GEOJSON_TO_COUNTY[geoName] ?? geoName;
}

function markerColor(b: number): string {
  if (b <= 1.2) return '#16a34a';
  if (b <= 1.6) return '#d97706';
  return '#dc2626';
}

function createIcon(color: string, isSelected: boolean): L.DivIcon {
  if (isSelected) {
    return L.divIcon({
      html: `
        <div class="lm-selected">
          <div class="lm-ring" style="background:${color}"></div>
          <div class="lm-ring lm-ring-2" style="background:${color}"></div>
          <div class="lm-dot lm-dot-sel" style="background:${color}"></div>
        </div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }
  return L.divIcon({
    html: `<div class="lm-dot" style="width:11px;height:11px;background:${color}"></div>`,
    className: '',
    iconSize: [11, 11],
    iconAnchor: [5.5, 5.5],
  });
}

function FlyToCity({ city }: { city: City }) {
  const map = useMap();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    map.flyTo([city.lat, city.lng], Math.max(map.getZoom(), 8), { duration: 1.1, easeLinearity: 0.2 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city.id]);
  return null;
}

type Props = {
  selectedCity: City;
  onCitySelect: (city: City) => void;
  sqm: number;
  dark: boolean;
};

export function Map({ selectedCity, onCitySelect, sqm, dark }: Props) {
  const [counties, setCounties] = useState<GeoJsonObject | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    fetch('/counties.geojson')
      .then(r => r.json())
      .then(setCounties)
      .catch(() => {/* silently fail */});
  }, []);

  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  function onEachCounty(feature: Feature, layer: L.Layer) {
    const countyName = (feature.properties as any)?.name as string | undefined;
    if (!countyName) return;
    const normalizedName = resolveCounty(countyName);
    const citiesInCounty = CITIES.filter(c => c.county === normalizedName);

    layer.on({
      mouseover(e) {
        const l = e.target as L.Path;
        l.setStyle({ fillOpacity: dark ? 0.28 : 0.20, weight: 2.5, opacity: 0.9 });
        setHoveredCounty(countyName);
      },
      mouseout(e) {
        const l = e.target as L.Path;
        l.setStyle({ fillOpacity: dark ? 0.07 : 0.05, weight: dark ? 1.5 : 1, opacity: dark ? 0.55 : 0.45 });
        setHoveredCounty(null);
      },
      click() {
        if (citiesInCounty.length === 0) return;
        // Select city with highest B value in this county (most interesting)
        const city = citiesInCounty.reduce((best, c) => c.b > best.b ? c : best, citiesInCounty[0]);
        onCitySelect(city);
      },
    });

    if (citiesInCounty.length > 0) {
      const names = citiesInCounty.map(c => c.name).join(', ');
      layer.bindTooltip(
        `<div style="font-size:12px;font-weight:600">${countyName} županija</div>` +
        `<div style="font-size:11px;opacity:0.7">${names}</div>`,
        { sticky: true, opacity: 0.92 }
      );
    }
  }

  const countyStyle = (_feature?: Feature): L.PathOptions => ({
    fillColor: dark ? '#818cf8' : '#4f46e5',
    fillOpacity: dark ? 0.07 : 0.05,
    color: dark ? '#a5b4fc' : '#6366f1',
    weight: dark ? 1.5 : 1,
    opacity: dark ? 0.55 : 0.45,
  });

  return (
    <div className="relative overflow-hidden rounded-xl border border-border shadow-sm">
      {hoveredCounty && (
        <div className="absolute z-[500] top-2 left-2 bg-background/90 backdrop-blur-sm border border-border rounded-md px-2 py-1 text-xs font-medium pointer-events-none">
          {hoveredCounty} županija
        </div>
      )}
      <MapContainer
        center={[44.8, 16.5]}
        zoom={7}
        scrollWheelZoom={false}
        className="h-64 sm:h-80 lg:h-[440px] w-full"
      >
        <TileLayer
          key={dark ? 'dark' : 'light'}
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {counties && (
          <GeoJSON
            key={dark ? 'geojson-dark' : 'geojson-light'}
            ref={geoJsonRef}
            data={counties}
            style={countyStyle}
            onEachFeature={onEachCounty}
          />
        )}

        <FlyToCity city={selectedCity} />

        {CITIES.map(city => {
          const isSelected = selectedCity.id === city.id;
          const color = markerColor(city.b);
          const zona1Annual = Math.round(city.b * city.zones[1].kz * 1.0 * sqm);

          return (
            <Marker
              key={city.id}
              position={[city.lat, city.lng]}
              icon={createIcon(color, isSelected)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => onCitySelect(city) }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-sm font-semibold leading-snug">{city.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  B = {city.b.toFixed(2)} €/m²/god
                </div>
                <div className="text-xs text-muted-foreground">
                  {sqm}m² zona 1 → <span className="font-medium text-foreground">{zona1Annual} €/god</span>
                </div>
                {!city.confirmed && (
                  <div className="text-xs text-amber-500 mt-0.5">⚠ procjena</div>
                )}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
