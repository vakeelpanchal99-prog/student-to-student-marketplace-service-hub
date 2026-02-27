import { useState } from 'react';
import { MapPin, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationShareButtonProps {
  onLocationSelected: (location: string) => void;
  selectedLocation: string;
}

export default function LocationShareButton({
  onLocationSelected,
  selectedLocation,
}: LocationShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const coords = selectedLocation
    ? (() => {
        const match = selectedLocation.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null;
      })()
    : null;

  const mapUrl = coords
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${coords.lat},${coords.lng}&zoom=16&size=400x200&markers=${coords.lat},${coords.lng},red`
    : null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const formatted = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        onLocationSelected(formatted);
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setErrorMsg(
          err.code === 1
            ? 'Location access denied. Please allow location access.'
            : 'Failed to get your location. Please try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleReset = () => {
    onLocationSelected('');
    setStatus('idle');
    setErrorMsg('');
  };

  if (selectedLocation && coords) {
    return (
      <div className="space-y-2">
        {mapUrl && (
          <div className="rounded-lg overflow-hidden border border-border">
            <img
              src={mapUrl}
              alt="Selected location"
              className="w-full h-32 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Location shared: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
          </div>
          <button onClick={handleReset} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleGetLocation}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Getting location...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Share My Location
          </>
        )}
      </Button>
      {status === 'error' && (
        <div className="flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
