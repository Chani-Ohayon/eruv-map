import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type EruvLocation = Tables<"eruv_locations">;

export function useEruvLocations() {
  return useQuery({
    queryKey: ["eruv-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eruv_locations")
        .select("*")
        .order("city_name");
      if (error) throw error;
      return data as EruvLocation[];
    },
  });
}
