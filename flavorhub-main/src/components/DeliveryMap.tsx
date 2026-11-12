import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when location changes
function RecenterAutomatically({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface DeliveryMapProps {
  location?: { lat: number; lng: number } | null;
  status: string;
}

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const DeliveryMap = ({ location, status }: DeliveryMapProps) => {
  // Setup a default fallback location (e.g., center of city or restaurant coordinate)
  const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York fallback
  const mapCenter = location || defaultLocation;

  if (status === 'delivered') {
     return (
        <div className="h-48 w-full bg-green-50 rounded-xl flex items-center justify-center border-2 border-green-200">
           <p className="text-green-700 font-medium font-heading">Delivered Successfully 🎉</p>
        </div>
     );
  }

  if (status === 'cancelled') {
     return (
        <div className="h-48 w-full bg-red-50 rounded-xl flex items-center justify-center border-2 border-red-200">
           <p className="text-red-700 font-medium font-heading">Order Cancelled</p>
        </div>
     );
  }

  // If order is pending/confirmed/preparing without a live location
  if (!location) {
     return (
        <div className="h-48 w-full bg-secondary/50 rounded-xl flex flex-col items-center justify-center border-2 border-border p-4 text-center">
           <p className="text-muted-foreground font-medium mb-2">Live tracking will appear here</p>
           <p className="text-sm text-muted-foreground">Once your order is out for delivery, you can track the driver's location.</p>
        </div>
     );
  }

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-border shadow-sm relative z-0">
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={14} 
        scrollWheelZoom={false} 
        className="h-full w-full outline-none"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterAutomatically lat={mapCenter.lat} lng={mapCenter.lng} />
        <Marker position={[mapCenter.lat, mapCenter.lng]} icon={customMarkerIcon}>
          <Popup className="font-sans">
             <div>
                <p className="font-semibold m-0 text-sm">Delivery Driver</p>
                <p className="m-0 text-xs text-muted-foreground">On the way!</p>
             </div>
          </Popup>
        </Marker>
      </MapContainer>
      <div className="absolute top-2 left-2 z-[400] bg-background/90 backdrop-blur pb-1 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm flex items-center gap-2">
         <span className="relative flex h-2 w-2">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
         </span>
         Live Tracking
      </div>
    </div>
  );
};
