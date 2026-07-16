import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Heart, Calendar, MapPin, Phone, User, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FuneralCaseCardSkeleton } from "@/components/shared/Skeletons";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FuneralCase = {
  id: string;
  case_number: string;
  deceased_name: string;
  date_of_death: string;
  date_of_funeral: string | null;
  location: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  status: string;
  notes: string | null;
};

export function PublicFuneralCasesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["public-funeral-cases"],
    queryFn: async () => {
      const { data } = await supabase
        .from("funeral_cases")
        .select(
          "id, case_number, deceased_name, date_of_death, date_of_funeral, location, contact_person, contact_phone, status, notes",
        )
        .order("date_of_death", { ascending: false });
      return (data ?? []) as FuneralCase[];
    },
  });

  const filtered = data.filter((fc) => {
    const q = search.toLowerCase();
    return (
      fc.deceased_name.toLowerCase().includes(q) ||
      fc.case_number.toLowerCase().includes(q) ||
      (fc.location ?? "").toLowerCase().includes(q) ||
      (fc.contact_person ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col">
      {/* Sticky header + search */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm  px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Page title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t("public.funeralCases")}</h1>
          </div>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 pr-8"
              placeholder="Search by name, case number or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-4xl">
          {isLoading ? (
            <FuneralCaseCardSkeleton count={3} />
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {search ? "No results found." : t("public.noFuneralCases")}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((fc) => (
                <Card key={fc.id}>
                  <CardContent className="pt-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {fc.deceased_name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {fc.case_number}
                        </p>
                      </div>
                      <Badge
                        variant={fc.status === "open" ? "default" : "secondary"}
                      >
                        {fc.status === "open"
                          ? t("public.open")
                          : t("public.closed")}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {t("public.dateOfDeath")}:{" "}
                          {formatDate(fc.date_of_death)}
                        </span>
                      </div>
                      {fc.date_of_funeral && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {t("funeral.dateOfFuneral")}:{" "}
                            {formatDate(fc.date_of_funeral)}
                          </span>
                        </div>
                      )}
                      {fc.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{fc.location}</span>
                        </div>
                      )}
                      {fc.contact_person && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span>{fc.contact_person}</span>
                        </div>
                      )}
                      {fc.contact_phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <a
                            href={`tel:${fc.contact_phone}`}
                            className="text-primary hover:underline"
                          >
                            {fc.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {fc.notes && (
                      <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                        {fc.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
