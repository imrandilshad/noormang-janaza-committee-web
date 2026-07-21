import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  Target,
  Users,
  Home,
  BookOpen,
  CheckCircle,
  MessageSquareQuote,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { PublicAboutStatsSkeleton } from "@/components/shared/Skeletons";

const objectives = [
  "public.obj1",
  "public.obj2",
  "public.obj3",
  "public.obj4",
  "public.obj5",
];

export function PublicAboutPage() {
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

  const currentYear = new Date().getFullYear();
  const yearsActive = currentYear - 2018;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t("public.aboutTitle")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("public.aboutSubtitle")}
          </p>
        </div>
      </section>

      {/* Stats bar — inside the gradient section */}
      <section className="py-10 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {statsLoading ? (
            <PublicAboutStatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border rounded-xl border bg-card shadow-sm overflow-hidden">
              {[
                { value: `${yearsActive}+`, label: t("public.yearsOfService"), isText: true },
                { value: stats?.members ?? 0, label: t("public.totalMembers"), isText: false },
                { value: stats?.families ?? 0, label: t("public.totalFamilies"), isText: false },
                { value: stats?.cases ?? 0, label: t("public.casesHandled"), isText: false },
              ].map(({ value, label, isText }) => (
                <div key={label} className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-primary leading-none">
                    {isText ? value : <AnimatedNumber value={value as number} />}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mission */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">{t("public.ourMission")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("public.ourMissionText")}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">{t("public.ourStory")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("public.ourStoryText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-14 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">
            {t("public.objectives")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {objectives.map((key) => (
              <Card key={key}>
                <CardContent className="pt-4 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm">{t(key)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Chairman Message */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-5">
              <MessageSquareQuote className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {t("public.chairmanMessage")}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t("public.chairmanName")}
            </p>
            <blockquote className="text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-4 text-left">
              {t("public.chairmanMessageText")}
            </blockquote>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">
            {t("public.howItWorks")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            {[
              {
                icon: Users,
                step: "1",
                titleKey: "public.step1Title",
                descKey: "public.step1Desc",
              },
              {
                icon: Heart,
                step: "2",
                titleKey: "public.step2Title",
                descKey: "public.step2Desc",
              },
              {
                icon: Home,
                step: "3",
                titleKey: "public.step3Title",
                descKey: "public.step3Desc",
              },
            ].map(({ step, titleKey, descKey }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">{t(titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
