import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { EruvLocation } from "@/hooks/useEruvLocations";

interface StatusCardProps {
  location: EruvLocation | null;
  onClose: () => void;
}

export default function StatusCard({ location, onClose }: StatusCardProps) {
  if (!location) return null;

  const isKosher = location.status === "kosher";
  const updatedDate = new Date(location.last_updated);
  const formattedDate = updatedDate.toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000]"
      >
        <Card className="shadow-2xl border-2" style={{ borderColor: isKosher ? "hsl(var(--eruv-kosher))" : "hsl(var(--eruv-not-kosher))" }}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">{location.city_name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 -mt-1 -me-2">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className={`flex items-center gap-2 text-lg font-bold ${isKosher ? "text-eruv-kosher" : "text-eruv-not-kosher"}`}>
              {isKosher ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
              <span>{isKosher ? "העירוב כשר" : "העירוב פסול"}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="text-sm">עודכן: {formattedDate}</span>
            </div>
            {location.supervising_rabbi && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span className="text-sm">רב מפקח: {location.supervising_rabbi}</span>
              </div>
            )}
            {location.notes && (
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{location.notes}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
