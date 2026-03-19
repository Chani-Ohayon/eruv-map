import { useEffect, useState, useMemo } from "react";
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
import { LogOut, MapPin, ArrowRight, CheckCircle2, XCircle, Users, Plus, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Inspector {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: locations = [] } = useEruvLocations();
  const queryClient = useQueryClient();

  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loadingInspectors, setLoadingInspectors] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<"eruv" | "users">("eruv");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;
    return locations.filter((loc) => loc.city_name.includes(searchQuery));
  }, [searchQuery, locations]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  const fetchInspectors = async () => {
    setLoadingInspectors(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await supabase.functions.invoke("manage-users", {
      body: { action: "list" },
    });

    if (res.data?.users) {
      setInspectors(res.data.users);
    } else if (res.error) {
      console.error("Error fetching inspectors:", res.error);
    }
    setLoadingInspectors(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchInspectors();
    }
  }, [user, isAdmin]);

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

  const handleAddInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);

    try {
      const res = await supabase.functions.invoke("manage-users", {
        body: { action: "create", email: newEmail, password: newPassword, name: newName },
      });

      if (res.error) {
        const errorBody = res.error?.message || "שגיאה לא ידועה";
        toast({ title: "שגיאה", description: errorBody, variant: "destructive" });
      } else if (res.data?.error) {
        toast({ title: "שגיאה", description: res.data.error, variant: "destructive" });
      } else if (res.data?.success) {
        toast({ title: "נוסף בהצלחה ✓", description: `${newName} (${newEmail})` });
        setShowAddDialog(false);
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        fetchInspectors();
      }
    } catch (err) {
      toast({ title: "שגיאה", description: "לא ניתן להתחבר לשרת", variant: "destructive" });
    }
    setAddingUser(false);
  };

  const handleRemoveInspector = async (inspector: Inspector) => {
    if (inspector.id === user?.id) {
      toast({ title: "שגיאה", description: "לא ניתן להסיר את עצמך", variant: "destructive" });
      return;
    }

    const res = await supabase.functions.invoke("manage-users", {
      body: { action: "remove", user_id: inspector.id },
    });

    if (res.data?.success) {
      toast({ title: "הוסר בהצלחה ✓", description: `${inspector.name || inspector.email}` });
      fetchInspectors();
    } else {
      toast({ title: "שגיאה", description: "לא ניתן להסיר", variant: "destructive" });
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

      {/* Tabs */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex gap-2 border-b border-border pb-2">
          <Button
            variant={activeTab === "eruv" ? "default" : "ghost"}
            onClick={() => setActiveTab("eruv")}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            עירובין
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            onClick={() => setActiveTab("users")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            ניהול בודקים
          </Button>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto p-4 space-y-4 pb-8">
        {activeTab === "eruv" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <p className="text-muted-foreground">עדכנו את מצב העירוב בערים. השינויים יופיעו מיד במפה.</p>
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חפש עיר..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>
            {filteredLocations.length === 0 && searchQuery ? (
              <p className="text-muted-foreground text-center py-8">לא נמצאו תוצאות עבור "{searchQuery}"</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredLocations.map((loc) => (
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
            )}
          </>
        )}

        {activeTab === "users" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">ניהול בודקים</h2>
                <p className="text-muted-foreground text-sm">הוסיפו או הסירו בודקי עירוב. כל בודק יקבל גישה לדאשבורד.</p>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    הוסף בודק
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>הוספת בודק חדש</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddInspector} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-name">שם מלא</Label>
                      <Input id="new-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="ישראל ישראלי" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-email">אימייל</Label>
                      <Input id="new-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">סיסמה</Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="לפחות 6 תווים" required minLength={6} />
                    </div>
                    <Button type="submit" className="w-full" disabled={addingUser}>
                      {addingUser ? "מוסיף..." : "הוסף בודק"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3">
              {loadingInspectors ? (
                <p className="text-muted-foreground text-center py-8">טוען רשימת בודקים...</p>
              ) : inspectors.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">אין בודקים רשומים</p>
              ) : (
                inspectors.map((inspector) => (
                  <Card key={inspector.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{inspector.name || "ללא שם"}</p>
                        <p className="text-sm text-muted-foreground">{inspector.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {inspector.id === user?.id && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">את</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveInspector(inspector)}
                          disabled={inspector.id === user?.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
