import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { EruvLocation } from "@/hooks/useEruvLocations";
import { motion, AnimatePresence } from "framer-motion";

interface AlertSubscriptionProps {
  locations: EruvLocation[];
}

export default function AlertSubscription({ locations }: AlertSubscriptionProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [cityId, setCityId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !cityId) return;

    setSubmitting(true);
    const { error } = await supabase.from("alert_subscriptions").insert({
      name,
      contact,
      city_id: cityId,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: "שגיאה", description: "לא ניתן להירשם כרגע, נסו שוב מאוחר יותר", variant: "destructive" });
    } else {
      toast({ title: "נרשמתם בהצלחה! ✓", description: "תקבלו התראת עירוב לפני כניסת שבת" });
      setName("");
      setContact("");
      setCityId("");
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg gap-2 h-12 px-5 rounded-xl font-semibold"
      >
        <Bell className="h-5 w-5" />
        <span className="hidden sm:inline">קבלת התראת עירוב</span>
        <span className="sm:hidden">התראות</span>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="w-full max-w-md shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">קבלת התראת עירוב ליום שישי</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">שם מלא</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ישראל ישראלי" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">טלפון או אימייל</Label>
                      <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="050-1234567 / email@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label>בחרו עיר</Label>
                      <Select value={cityId} onValueChange={setCityId} required>
                        <SelectTrigger>
                          <SelectValue placeholder="בחרו עיר" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.city_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 font-semibold" disabled={submitting}>
                      {submitting ? "שולח..." : "הרשמה לקבלת התראות"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
