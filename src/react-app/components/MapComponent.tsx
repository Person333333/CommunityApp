import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ResourceType } from '@/shared/types';
import { MapPin, Phone, Globe, Clock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for different categories
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-8 h-8 ${color} rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div class="absolute -inset-2 ${color} rounded-full animate-ping opacity-75"></div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const categoryIcons = {
  'Housing': createCustomIcon('bg-blue-500'),
  'Food': createCustomIcon('bg-green-500'),
  'Food Assistance': createCustomIcon('bg-green-500'),
  'Healthcare': createCustomIcon('bg-red-500'),
  'Employment': createCustomIcon('bg-purple-500'),
  'Education': createCustomIcon('bg-yellow-500'),
  'Transportation': createCustomIcon('bg-indigo-500'),
  'Mental Health': createCustomIcon('bg-pink-500'),
  'Legal Aid': createCustomIcon('bg-orange-500'),
  'Default': createCustomIcon('bg-teal-500'),
};

// Component to center map on location only when it explicitly changes
function MapCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number]>(center);
  const prevZoomRef = useRef<number>(zoom);

  useEffect(() => {
    const centerChanged = prevCenterRef.current[0] !== center[0] || prevCenterRef.current[1] !== center[1];
    const zoomChanged = prevZoomRef.current !== zoom;

    if (centerChanged || zoomChanged) {
      map.setView(center, zoom);
      prevCenterRef.current = center;
      prevZoomRef.current = zoom;
    }
  }, [center, zoom, map]);

  return null;
}

// Heatmap calculation function
function calculateHeatmap(resources: ResourceType[], gridSize: number = 0.02): Array<{
  center: [number, number];
  count: number;
  radius: number;
  opacity: number;
}> {
  const clusters: Map<string, { lat: number; lng: number; count: number }> = new Map();

  resources.forEach(resource => {
    const lat = resource.latitude ?? null as any;
    const lng = resource.longitude ?? null as any;
    if (lat == null || lng == null) return;

    // Round to grid cell
    const gridLat = Math.round(lat / gridSize) * gridSize;
    const gridLng = Math.round(lng / gridSize) * gridSize;
    const key = `${gridLat}_${gridLng}`;

    if (clusters.has(key)) {
      const cluster = clusters.get(key)!;
      // Weighted average for better centering
      cluster.lat = (cluster.lat * cluster.count + lat) / (cluster.count + 1);
      cluster.lng = (cluster.lng * cluster.count + lng) / (cluster.count + 1);
      cluster.count += 1;
    } else {
      clusters.set(key, { lat, lng, count: 1 });
    }
  });

  const maxCount = Math.max(...Array.from(clusters.values()).map(c => c.count));

  return Array.from(clusters.values()).map(cluster => {
    const normalizedCount = cluster.count / maxCount;
    return {
      center: [cluster.lat, cluster.lng] as [number, number],
      count: cluster.count,
      radius: 100 + (normalizedCount * 200), // Radius between 100-300m
      opacity: 0.3 + (normalizedCount * 0.4), // Opacity between 0.3-0.7
    };
  });
}

interface MapComponentProps {
  resources: ResourceType[];
  onResourceClick: (resource: ResourceType) => void;
  center: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
}

export default function MapComponent({
  resources,
  onResourceClick,
  center,
  zoom = 13,
  showHeatmap = false
}: MapComponentProps) {
  const { t } = useTranslation();
  const heatmapData = showHeatmap ? calculateHeatmap(resources) : [];

  // Get coordinates for resources
  const getResourceCoordinates = (resource: ResourceType): [number, number] | null => {
    if (resource.latitude != null && resource.longitude != null && !isNaN(resource.latitude) && !isNaN(resource.longitude)) {
      return [resource.latitude, resource.longitude];
    }
    return null; // Do not fallback to center, just hide the marker
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
        scrollWheelZoom={true}
      >
        <MapCenter center={center} zoom={zoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap circles - rendered first so they appear behind markers */}
        {showHeatmap && heatmapData.map((heat, index) => (
          <Circle
            key={`heat-${index}`}
            center={heat.center}
            radius={heat.radius}
            pathOptions={{
              color: 'rgba(15, 118, 110, 0.8)',
              fillColor: 'rgba(15, 118, 110, 0.6)',
              fillOpacity: heat.opacity,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-2">
                <p className="text-sm font-medium text-slate-300">
                  {heat.count} resource{heat.count !== 1 ? 's' : ''} in this area
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

        {!showHeatmap && resources.map(resource => {
          const coords = getResourceCoordinates(resource);
          if (!coords) return null as any;

          const category = (resource.category_raw || resource.category) as string;
          const markerColor = 
            category === 'Housing' || category === 'Housing / Shelter' ? '#3B82F6' :
            category === 'Food' || category === 'Food Assistance' || category === 'Emergency Food' ? '#10B981' :
            category === 'Healthcare' || category === 'Medical Care' ? '#EF4444' :
            category === 'Employment' ? '#A855F7' :
            category === 'Education' ? '#EAB308' :
            category === 'Transportation' ? '#6366F1' :
            category === 'Mental Health' ? '#EC4899' :
            category === 'Legal Assistance' || category === 'Legal Aid' ? '#F97316' :
            '#14B8A6';

          return (
            <Marker
              key={resource.id}
              position={coords}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `
                  <div style="position:relative;width:32px;height:32px;">
                    <div style="
                      width:28px;height:28px;
                      background-color:${markerColor};
                      border-radius:50%;
                      border:3px solid white;
                      box-shadow:0 2px 8px rgba(0,0,0,0.3);
                      display:flex;align-items:center;justify-content:center;
                      position:absolute;top:2px;left:2px;
                    ">
                      <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
                    </div>
                    <div style="
                      position:absolute;inset:-4px;
                      background-color:${markerColor};
                      border-radius:50%;
                      opacity:0.35;
                      animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
                    "></div>
                  </div>
                `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
              eventHandlers={{
                click: () => {
                  onResourceClick(resource);
                },
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-slate-300 font-medium">
                      {resource.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{resource.address}, {resource.city}</span>
                  </div>

                  <span className="inline-block text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {resource.category}
                  </span>

                  {resource.audience && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>{resource.audience}</span>
                    </div>
                  )}

                  {resource.hours && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{resource.hours}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {resource.phone && (
                      <a
                        href={`tel:${resource.phone}`}
                        className="flex items-center gap-1 text-sm bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                    )}

                    {resource.website && (
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        Visit
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Show clustered markers in heatmap mode */}
        {showHeatmap && heatmapData.map((heat, index) => {
          // Find resources in this cluster
          const clusterResources = resources.filter(resource => {
            if (!resource.address) return false;
            const coords = getResourceCoordinates(resource);
            if (!coords) return false;
            const dist = Math.sqrt(
              Math.pow(coords[0] - heat.center[0], 2) +
              Math.pow(coords[1] - heat.center[1], 2)
            );
            return dist < 0.01; // Within ~1km
          });

          if (clusterResources.length === 0) return null;

          // Show a single marker for the cluster
          const mainResource = clusterResources[0];
          const icon = categoryIcons[(mainResource.category_raw || mainResource.category) as keyof typeof categoryIcons] || categoryIcons.Default;

          return (
            <Marker
              key={`cluster-${index}`}
              position={heat.center}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onResourceClick(mainResource);
                },
              }}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                      {heat.count} Resource{heat.count !== 1 ? 's' : ''} in Area
                    </h3>
                    <p className="text-sm text-slate-300 font-medium mb-2">
                      {mainResource.title} and {heat.count - 1} other{heat.count - 1 !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {clusterResources.slice(0, 3).map(resource => (
                      <div key={resource.id} className="text-sm text-gray-700">
                        • {resource.title} - {resource.category}
                      </div>
                    ))}
                    {clusterResources.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{clusterResources.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10 max-w-xs">
        <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3 drop-shadow-sm">
          {showHeatmap ? t('map.densityView') : t('map.categories')}
        </h4>
        {showHeatmap ? (
          <div className="space-y-2 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-teal-500/60 shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
              <span>{t('map.highDensity')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500/40" />
              <span>{t('map.mediumDensity')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500/30" />
              <span>{t('map.lowDensity')}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs font-medium">
            {Object.entries(categoryIcons).slice(0, -1).map(([category, _]) => (
              <div key={category} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full shadow-sm ${category === 'Housing' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' :
                  category === 'Food' || category === 'Food Assistance' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' :
                    category === 'Healthcare' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                      category === 'Employment' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' :
                        category === 'Education' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]' :
                          category === 'Transportation' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' :
                            category === 'Mental Health' ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]' :
                              'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]'
                  }`} />
                <span className="text-slate-300 truncate tracking-wide">{t(`categories.${category}`, category)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
