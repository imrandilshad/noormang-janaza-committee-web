import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, Calendar, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AnnouncementCardSkeleton } from "@/components/shared/Skeletons";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AnnouncementType = "all" | "death_notice" | "meeting" | "general";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  scheduled_date?: string | null;
};

export function PublicAnnouncementsPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AnnouncementType>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, content, type, created_at, scheduled_date")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      return (data ?? []) as Announcement[];
    },
  });

  const typeLabel: Record<string, string> = {
    death_notice: t("public.deathNotice"),
    meeting: t("public.meeting"),
    general: t("public.general"),
  };
  const typeVariant: Record<string, "destructive" | "default" | "secondary"> = {
    death_notice: "destructive",
    meeting: "default",
    general: "secondary",
  };

  const filters: { key: AnnouncementType; label: string }[] = [
    { key: "all", label: t("public.filterAll") },
    { key: "death_notice", label: t("public.filterDeathNotice") },
    { key: "meeting", label: t("public.filterMeeting") },
    { key: "general", label: t("public.filterGeneral") },
  ];

  const filtered = (data ?? []).filter((a) => {
    const matchesFilter = filter === "all" || a.type === filter;
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      {/* Sticky header + search + filters */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm  px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Megaphone className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t("public.announcements")}</h1>
          </div>
          {/* Search + filter row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9 pr-8"
                placeholder={t("announcement.searchPlaceholder")}
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
            <div className="flex gap-1 flex-wrap">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-4xl">
          {isLoading ? (
            <AnnouncementCardSkeleton count={4} />
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {search ? "No results found." : t("public.noAnnouncements")}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((a) => (
                <Card key={a.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-base leading-snug">
                        {a.title}
                      </h2>
                      <Badge
                        variant={typeVariant[a.type] ?? "secondary"}
                        className="shrink-0"
                      >
                        {typeLabel[a.type] ?? a.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {a.content}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {t("common.date")}: {formatDate(a.created_at)}
                      </span>
                      {a.scheduled_date && (
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Calendar className="h-3.5 w-3.5" />
                          Scheduled: {formatDate(a.scheduled_date)}
                        </span>
                      )}
                    </div>
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
