import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Calendar, Briefcase, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MemberCardSkeleton } from "@/components/shared/Skeletons";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Member = {
  id: string;
  member_number: string;
  full_name: string;
  father_name: string | null;
  occupation: string | null;
  status: string;
  joined_date: string;
  families: { family_name: string } | null;
};

export function PublicMembersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["public-members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select(
          "id, member_number, full_name, father_name, occupation, status, joined_date, families(family_name)",
        )
        .order("member_number", { ascending: true });
      return (data ?? []) as unknown as Member[];
    },
  });

  const statusVariant: Record<string, "success" | "secondary" | "destructive"> =
    {
      active: "success",
      inactive: "secondary",
      deceased: "destructive",
    };
  const statusLabel: Record<string, string> = {
    active: t("public.active"),
    inactive: t("public.inactive"),
    deceased: t("public.deceased"),
  };

  const filtered = (data ?? []).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.member_number.toLowerCase().includes(q) ||
      (m.father_name ?? "").toLowerCase().includes(q) ||
      (m.families?.family_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col">
      {/* Sticky header + search */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm  px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {t("public.memberDirectory")}
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 pr-8"
              placeholder={t("public.searchMembers")}
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
        <div className="mx-auto max-w-5xl">
          {isLoading ? (
            <MemberCardSkeleton count={6} />
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {search ? "No results found." : t("public.noMembers")}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => (
                <Card key={m.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm">{m.full_name}</p>
                        {m.father_name && (
                          <p className="text-xs text-muted-foreground">
                            s/o {m.father_name}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={statusVariant[m.status] ?? "secondary"}
                        className="text-xs shrink-0"
                      >
                        {statusLabel[m.status] ?? m.status}
                      </Badge>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p className="font-mono font-medium text-foreground">
                        {m.member_number}
                      </p>
                      {m.families?.family_name && (
                        <p className="flex items-center gap-1">
                          <span className="text-foreground font-medium">
                            {t("public.family")}:
                          </span>
                          {m.families.family_name}
                        </p>
                      )}
                      {m.occupation && (
                        <p className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 shrink-0" />
                          {m.occupation}
                        </p>
                      )}
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {t("public.joined")}: {formatDate(m.joined_date)}
                      </p>
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
