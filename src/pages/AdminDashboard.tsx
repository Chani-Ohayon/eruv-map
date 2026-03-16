import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEruvLocations, type EruvLocation } from "@/hooks/useEruvLocations";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { LogOut, MapPin, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: locations = [] } = useEruvLocations();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>טוען...</p></div>;
  }

  const handleStatusUpdate = async (loc: EruvLocation, newStatus: "kosher" | "not_kosher") => {
    const { error } = await supabase
      .from("eruv_locations")
      .update({ status: newStatus })
      .eq("id", loc.id);

    if (error) {
      toast({ title: "שגיאה", description: "לא ניתן לעדכן", variant: "destructive" });
    } else {
      toast({ title: "עודכן בהצלחה ✓", description: `${loc.city_name} - ${newStatus === "kosher" ? "כשר" : "פסול"}` });
      queryClient.invalidateQueries({ queryKey: ["eruv-locations"] });
    }
  };

  const handleFieldUpdate = async (id: string, field: "supervising_rabbi" | "notes", value: string) => {
    const { error } = await supabase
      .from("eruv_locations")
      .update({ [field]: value })
      .eq("id", id);

    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["eruv-locations"] });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="hover:opacity-80">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">לוח בקרה - בודק עירוב</h1>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
            <LogOut className="h-4 w-4" />
            יציאה
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto p-4 space-y-4 pb-8">
        <p className="text-muted-foreground">עדכנו את מצב העירוב בערים. השינויים יופיעו מיד במפה.</p>

        <div className="grid gap-4 md:grid-cols-2">
          {locations.map((loc) => (
            <Card key={loc.id} className="border-2 transition-colors" style={{ borderColor: loc.status === "kosher" ? "hsl(var(--eruv-kosher))" : "hsl(var(--eruv-not-kosher))" }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5" />
                    {loc.city_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${loc.status === "kosher" ? "text-eruv-kosher" : "text-eruv-not-kosher"}`}>
                      {loc.status === "kosher" ? "כשר" : "פסול"}
                    </span>
                    {loc.status === "kosher" ? <CheckCircle2 className="h-5 w-5 text-eruv-kosher" /> : <XCircle className="h-5 w-5 text-eruv-not-kosher" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">מצב העירוב</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">פסול</span>
                    <Switch
                      checked={loc.status === "kosher"}
                      onCheckedChange={(checked) => handleStatusUpdate(loc, checked ? "kosher" : "not_kosher")}
                    />
                    <span className="text-sm text-muted-foreground">כשר</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>רב מפקח</Label>
                  <Input
                    defaultValue={loc.supervising_rabbi || ""}
                    onBlur={(e) => handleFieldUpdate(loc.id, "supervising_rabbi", e.target.value)}
                    placeholder="שם הרב המפקח"
                  />
                </div>
                <div className="space-y-2">
                  <Label>הערות</Label>
                  <Input
                    defaultValue={loc.notes || ""}
                    onBlur={(e) => handleFieldUpdate(loc.id, "notes", e.target.value)}
                    placeholder="הערות נוספות"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
