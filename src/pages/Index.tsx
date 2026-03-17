import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import StatusCard from "@/components/StatusCard";
import AlertSubscription from "@/components/AlertSubscription";
import Footer from "@/components/Footer";
import { useEruvLocations, type EruvLocation } from "@/hooks/useEruvLocations";

const EruvMap = lazy(() => import("@/components/EruvMap"));

export default function Index() {
  const { data: locations = [], isLoading } = useEruvLocations();
  const [selectedLocation, setSelectedLocation] = useState<EruvLocation | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);

  const handleSelectCity = (loc: EruvLocation) => {
    setSelectedLocation(loc);
    setFlyTo({ lat: loc.lat, lng: loc.lng });
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg font-bold text-lg shrink-0">
            מפת העירוב
          </div>
          <SearchBar locations={locations} onSelectCity={handleSelectCity} />
          <AlertSubscription locations={locations} />
          <Link to="/admin">
            <Button variant="outline" size="icon" className="h-12 w-12 bg-card/95 backdrop-blur-sm shadow-lg rounded-xl shrink-0">
              <Shield className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Map */}
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center bg-muted">
          <p className="text-muted-foreground text-lg">טוען מפה...</p>
        </div>
      ) : (
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-muted"><p className="text-muted-foreground text-lg">טוען מפה...</p></div>}>
          <EruvMap locations={locations} onMarkerClick={setSelectedLocation} selectedCity={flyTo} />
        </Suspense>
      )}

      {/* Status card */}
      <StatusCard location={selectedLocation} onClose={() => setSelectedLocation(null)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
