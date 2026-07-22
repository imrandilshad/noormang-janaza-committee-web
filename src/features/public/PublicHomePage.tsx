import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Users,
  Home,
  Heart,
  Megaphone,
  ArrowRight,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  BookOpen,
  Phone,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import {
  PublicStatsSkeleton,
  PublicMiniCardSkeleton,
} from "@/components/shared/Skeletons";

const PREVIEW_LENGTH = 120;

function ExpandableAnnouncementCard({
  announcement: a,
  typeLabel,
  typeVariant,
}: {
  announcement: {
    id: string;
    title: string;
    content: string;
    type: string;
    created_at: string;
  };
  typeLabel: Record<string, string>;
  typeVariant: Record<string, "destructive" | "default" | "secondary">;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isLong = a.content.length > PREVIEW_LENGTH;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm leading-snug">{a.title}</p>
          <Badge
            variant={typeVariant[a.type] ?? "secondary"}
            className="shrink-0 text-xs"
          >
            {typeLabel[a.type] ?? a.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p className="whitespace-pre-line">
          {expanded || !isLong
            ? a.content
            : `${a.content.slice(0, PREVIEW_LENGTH)}…`}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                {t("public.readLess")}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                {t("public.readMore")}
              </>
            )}
          </button>
        )}
        <p className="mt-2 text-xs flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(a.created_at)}
        </p>
      </CardContent>
    </Card>
  );
}

export function PublicHomePage() {
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const [{ count: members }, { count: families }, { count: cases }] =
        await Promise.all([
          supabase
            .from("members")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          supabase.from("families").select("*", { count: "exact", head: true }),
          supabase
            .from("funeral_cases")
            .select("*", { count: "exact", head: true }),
        ]);
      return {
        members: members ?? 0,
        families: families ?? 0,
        cases: cases ?? 0,
      };
    },
  });

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ["public-announcements-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, content, type, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(3);
      return (data ?? []) as {
        id: string;
        title: string;
        content: string;
        type: string;
        created_at: string;
      }[];
    },
  });

  const { data: funeralCases, isLoading: casesLoading } = useQuery({
    queryKey: ["public-funeral-cases-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("funeral_cases")
        .select(
          "id, case_number, deceased_name, date_of_death, location, status",
        )
        .order("date_of_death", { ascending: false })
        .limit(3);
      return (data ?? []) as {
        id: string;
        case_number: string;
        deceased_name: string;
        date_of_death: string;
        location: string;
        status: string;
      }[];
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

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto mb-6">
            <img
              src="/logo.png"
              alt="Janaza Committee"
              className="h-28 w-28 mx-auto rounded-2xl object-cover shadow-md"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            {t("public.heroTitle")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("public.heroSubtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/funeral-cases">
              <Button size="lg" className="gap-2">
                <Heart className="h-4 w-4" />
                {t("public.funeralCases")}
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="gap-2">
                <Info className="h-4 w-4" />
                {t("public.about")}
              </Button>
            </Link>
            <Link to="/membership">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                {t("public.membership")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-semibold text-muted-foreground mb-8">
            {t("public.statsTitle")}
          </h2>
          {statsLoading ? (
            <PublicStatsSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Users,
                  value: stats?.members ?? 0,
                  label: t("public.totalMembers"),
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-50 dark:bg-blue-950/40",
                },
                {
                  icon: Home,
                  value: stats?.families ?? 0,
                  label: t("public.totalFamilies"),
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-950/40",
                },
                {
                  icon: Heart,
                  value: stats?.cases ?? 0,
                  label: t("public.casesHandled"),
                  color: "text-rose-600 dark:text-rose-400",
                  bg: "bg-rose-50 dark:bg-rose-950/40",
                },
              ].map(({ icon: Icon, value, label, color, bg }) => (
                <Card
                  key={label}
                  className="overflow-hidden border-0 shadow-sm"
                >
                  <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />
                  <CardContent className="pt-6 pb-6 text-center">
                    <div
                      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${bg}`}
                    >
                      <Icon className={`h-7 w-7 ${color}`} />
                    </div>
                    <p className={`text-4xl font-bold ${color}`}>
                      <AnimatedNumber value={value} />
                    </p>
                    <p className="text-sm font-medium text-muted-foreground mt-2">
                      {label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Announcements */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {t("public.recentAnnouncements")}
            </h2>
            <Link to="/announcements">
              <Button variant="ghost" size="sm" className="gap-1">
                {t("public.viewAll")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {announcementsLoading ? (
            <PublicMiniCardSkeleton count={3} />
          ) : announcements && announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcements.map((a) => (
                <ExpandableAnnouncementCard
                  key={a.id}
                  announcement={a}
                  typeLabel={typeLabel}
                  typeVariant={typeVariant}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t("public.noAnnouncements")}
            </p>
          )}
        </div>
      </section>

      {/* Recent Funeral Cases */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {t("public.recentFuneralCases")}
            </h2>
            <Link to="/funeral-cases">
              <Button variant="ghost" size="sm" className="gap-1">
                {t("public.viewAll")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {casesLoading ? (
            <PublicMiniCardSkeleton count={3} />
          ) : funeralCases && funeralCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {funeralCases.map((fc) => (
                <Card key={fc.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold">{fc.deceased_name}</p>
                      <Badge
                        variant={fc.status === "open" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {fc.status === "open"
                          ? t("public.open")
                          : t("public.closed")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {fc.case_number}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(fc.date_of_death)}
                    </p>
                    {fc.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {fc.location}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t("public.noFuneralCases")}
            </p>
          )}
        </div>
      </section>

      {/* Explore Section */}
      <section className="py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-center mb-8">
            {t("public.exploreTitle")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { to: "/about", icon: Info, labelKey: "public.about" },
              {
                to: "/membership",
                icon: BookOpen,
                labelKey: "public.membership",
              },
              {
                to: "/announcements",
                icon: Megaphone,
                labelKey: "public.announcements",
              },
              { to: "/contact", icon: Phone, labelKey: "public.contact" },
              { to: "/donate", icon: Heart, labelKey: "public.donate" },
              { to: "/faq", icon: Users, labelKey: "public.faq" },
            ].map(({ to, icon: Icon, labelKey }) => (
              <Link key={to} to={to}>
                <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full">
                  <CardContent className="pt-5 pb-5 flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs font-medium">{t(labelKey)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
