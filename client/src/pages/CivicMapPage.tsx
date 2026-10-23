import { useQuery } from '@tanstack/react-query';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { api } from '../lib/api';

export const CivicMapPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['map-complaints'],
    queryFn: async () => (await api.get('/complaints/map')).data
  });

  if (isLoading) return <p>Loading civic map...</p>;
  if (isError) return <p>Unable to load map data.</p>;

  const items = data.items as any[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Civic Map</h1>
      <p className="text-sm text-slate-600">Map uses OpenStreetMap and database complaint coordinates. Demo records are labeled in popups.</p>
      <div className="h-[420px] overflow-hidden rounded-xl bg-white">
        <MapContainer center={[17.385, 78.4867]} zoom={12} className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {items.map((item) => (
            <Marker key={item._id} position={[item.location.coordinates[1], item.location.coordinates[0]]}>
              <Popup>
                <strong>{item.title}</strong>
                <br />
                {item.publicId} · {item.category} · {item.status}
                <br />
                {item.isDemoData ? 'Demonstration data' : 'Citizen report'}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="rounded bg-white p-4">
        <h2 className="font-semibold">Accessible list view</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item._id}>
              {item.publicId}: {item.title} ({item.locality || 'Unknown locality'})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
