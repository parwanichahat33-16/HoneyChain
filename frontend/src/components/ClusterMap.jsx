import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const GUJARAT_CENTER = [22.5, 71.5];

export default function ClusterMap({ apiaries }) {
  if (!apiaries || apiaries.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">No apiary location data yet.</p>;
  }

  return (
    <div className="rounded-xl overflow-hidden border border-honey-100 dark:border-gray-700" style={{ height: 380 }}>
      <MapContainer center={GUJARAT_CENTER} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {apiaries.map((a) => {
          const atRisk = Number(a.at_risk_count) > 0;
          return (
            <CircleMarker
              key={a.id}
              center={[Number(a.latitude), Number(a.longitude)]}
              radius={8 + Math.min(Number(a.hive_count), 10)}
              pathOptions={{
                color: atRisk ? '#ef4444' : '#e8a317',
                fillColor: atRisk ? '#ef4444' : '#e8a317',
                fillOpacity: 0.5,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{a.name}</p>
                  <p>{a.cluster} · {a.beekeeper_name}</p>
                  <p>{a.hive_count} hives{atRisk ? ` · ${a.at_risk_count} at risk` : ''}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
