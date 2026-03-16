import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { EruvLocation } from "@/hooks/useEruvLocations";

interface SearchBarProps {
  locations: EruvLocation[];
  onSelectCity: (location: EruvLocation) => void;
}

export default function SearchBar({ locations, onSelectCity }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return locations.filter((loc) =>
      loc.city_name.includes(query)
    );
  }, [query, locations]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="חפש עיר או יישוב לשבת"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pr-10 bg-card/95 backdrop-blur-sm border-border shadow-lg text-base h-12 rounded-xl"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden">
          {filtered.map((loc) => (
            <button
              key={loc.id}
              className="w-full text-right px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3"
              onClick={() => {
                onSelectCity(loc);
                setQuery(loc.city_name);
                setOpen(false);
              }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  backgroundColor: loc.status === "kosher" ? "hsl(var(--eruv-kosher))" : "hsl(var(--eruv-not-kosher))",
                }}
              />
              <span className="font-medium">{loc.city_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
