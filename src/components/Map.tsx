import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CITIES } from '@/data/cities';
import type { City } from '@/types';

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

/** Smooth-flies the map to the selected city whenever it changes. */
function FlyToCity({ city }: { city: City }) {
  const map = useMap();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    map.flyTo([city.lat, city.lng], Math.max(map.getZoom(), 8), {
      duration: 1.1,
      easeLinearity: 0.2,
    });
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
  const tileUrl = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
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
