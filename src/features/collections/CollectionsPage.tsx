import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { SearchInput } from "@/components/shared/SearchInput";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Collection } from "@/types/database";

const statusVariant = {
  pending: "destructive",
  partial: "warning",
  paid: "success",
} as const;

export function CollectionsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [genOpen, setGenOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const [genError, setGenError] = useState("");
  const [search, setSearch] = useState("");
  const [summaryCase, setSummaryCase] = useState("");

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data } = await supabase
        .from("collections")
        .select(
          "*, members(member_number, full_name), funeral_cases(case_number, deceased_name)",
        )
        .order("created_at", { ascending: false });
      return (data ?? []) as (Collection & {
        members: { member_number: string; full_name: string };
        funeral_cases: { case_number: string; deceased_name: string };
      })[];
    },
  });

  const { data: funeralCases = [] } = useQuery({
    queryKey: ["funeral-cases-for-collection"],
    queryFn: async () => {
      const { data } = await supabase
        .from("funeral_cases")
        .select("id, case_number, deceased_name, expenses(amount)")
        .order("date_of_death", { ascending: false });
      return (data ?? []) as {
        id: string;
        case_number: string;
        deceased_name: string;
        expenses: { amount: number }[];
      }[];
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (caseId: string) => {
      // Get total expenses for this funeral case
      const { data: expData } = await supabase
        .from("expenses")
        .select("amount")
        .eq("funeral_case_id", caseId);
      const totalExpenses = (expData ?? []).reduce((s, e) => s + e.amount, 0);

      // Get all active members
      const { data: memberData } = await supabase
        .from("members")
        .select("id")
        .eq("status", "active");
      const activeMembers = memberData ?? [];

      if (activeMembers.length === 0)
        throw new Error("No active members found");

      const perMemberAmount =
        totalExpenses > 0
          ? Number((totalExpenses / activeMembers.length).toFixed(2))
          : 0;

      // Check which members already have a collection record for this case
      const { data: existing } = await supabase
        .from("collections")
        .select("member_id")
        .eq("funeral_case_id", caseId);
      const existingIds = new Set((existing ?? []).map((r) => r.member_id));

      const newRecords = activeMembers
        .filter((m) => !existingIds.has(m.id))
        .map((m) => ({
          funeral_case_id: caseId,
          member_id: m.id,
          amount_due: perMemberAmount,
          amount_paid: 0,
          status: "pending" as const,
        }));

      if (newRecords.length === 0)
        throw new Error(
          "Collection records already exist for all active members for this case",
        );

      const { error } = await supabase.from("collections").insert(newRecords);
      if (error) throw error;

      return { count: newRecords.length, perMemberAmount };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["pending-collections"] });
      toast.success(
        `${result.count} collection records created`,
        `Per member: ${formatCurrency(result.perMemberAmount)}`,
      );
      setGenOpen(false);
      setSelectedCase("");
    },
    onError: (err: Error) => {
      setGenError(err.message);
      toast.error("Failed to generate collections", err.message);
    },
  });

  const totals = collections.reduce(
    (acc, c) => ({
      due: acc.due + c.amount_due,
      paid: acc.paid + c.amount_paid,
    }),
    { due: 0, paid: 0 },
  );

  const filtered = collections.filter(
    (c) =>
      !search ||
      c.members?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.funeral_cases?.case_number?.includes(search) ||
      c.funeral_cases?.deceased_name
        ?.toLowerCase()
        .includes(search.toLowerCase()),
  );

  const selectedCaseData = funeralCases.find((c) => c.id === selectedCase);
  const selectedCaseTotal =
    selectedCaseData?.expenses?.reduce((s, e) => s + e.amount, 0) ?? 0;

  // Combobox options for the Generate dialog case picker
  const funeralCaseOptions = funeralCases.map((c) => ({
    value: c.id,
    label: `${c.case_number} – ${c.deceased_name}`,
  }));

  // How many collections already exist for the selected case (for inline warning)
  const existingCollectionsCount = selectedCase
    ? collections.filter((c) => c.funeral_case_id === selectedCase).length
    : 0;

  // Group ALL collections (unaffected by the table search) for the summary section
  const allGrouped = collections.reduce(
    (acc, c) => {
      const key = c.funeral_case_id;
      if (!acc[key])
        acc[key] = { caseInfo: c.funeral_cases, items: [] as typeof collections };
      acc[key].items.push(c);
      return acc;
    },
    {} as Record<
      string,
      {
        caseInfo: { case_number: string; deceased_name: string } | null;
        items: typeof collections;
      }
    >,
  );

  // Combobox options for the summary case picker
  const summaryCaseOptions = Object.entries(allGrouped).map(([caseId, { caseInfo }]) => ({
    value: caseId,
    label: `${caseInfo?.case_number ?? "—"} – ${caseInfo?.deceased_name ?? "—"}`,
  }));

  const selectedSummaryEntry = summaryCase ? allGrouped[summaryCase] : null;

  // Group filtered collections by funeral case for clearer display
  const grouped = Object.entries(
    filtered.reduce(
      (acc, c) => {
        const key = c.funeral_case_id;
        if (!acc[key]) acc[key] = { caseInfo: c.funeral_cases, items: [] };
        acc[key].items.push(c);
        return acc;
      },
      {} as Record<
        string,
        {
          caseInfo: { case_number: string; deceased_name: string } | null;
          items: typeof filtered;
        }
      >,
    ),
  );

  return (
    <div className="space-y-4 pb-4">
      {/* Sticky header — compact on mobile */}
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold leading-tight">
            {t("collection.collectionList")}
          </h1>
          <Button
            size="sm"
            onClick={() => setGenOpen(true)}
            className="shrink-0"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">
              {t("collection.generateCollections")}
            </span>
            <span className="sm:hidden">{t("collection.generate")}</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
          {t("collection.subtitle")}
        </p>
      </div>

      {/* Overall Summary — full width on mobile, 3 columns on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <Card className="border-l-4 border-l-foreground/30">
          <CardContent className="px-3 py-3 sm:pt-4 sm:pb-4">
            <p className="text-xs text-muted-foreground">
              {t("collection.amountDue")}
            </p>
            <p className="text-lg sm:text-xl font-bold mt-0.5">
              {formatCurrency(totals.due)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="px-3 py-3 sm:pt-4 sm:pb-4">
            <p className="text-xs text-muted-foreground">
              {t("collection.amountPaid")}
            </p>
            <p className="text-lg sm:text-xl font-bold text-green-600 mt-0.5">
              {formatCurrency(totals.paid)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="px-3 py-3 sm:pt-4 sm:pb-4">
            <p className="text-xs text-muted-foreground">
              {t("collection.outstanding")}
            </p>
            <p className="text-lg sm:text-xl font-bold text-destructive mt-0.5">
              {formatCurrency(totals.due - totals.paid)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-case breakdown summary — case selector */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Per Funeral Case Summary
          </p>
          <Combobox
            options={summaryCaseOptions}
            value={summaryCase}
            onValueChange={setSummaryCase}
            placeholder="Select a funeral case to view summary"
            searchPlaceholder="Search by case number or deceased name…"
            emptyText="No cases found"
            clearable
          />

          {selectedSummaryEntry && (() => {
            const { caseInfo, items } = selectedSummaryEntry;
            const caseDue = items.reduce((s, c) => s + c.amount_due, 0);
            const casePaid = items.reduce((s, c) => s + c.amount_paid, 0);
            const casePending = caseDue - casePaid;
            const allPaid = items.every((c) => c.status === "paid");
            const anyPartial = items.some((c) => c.status === "partial");
            const borderColor = allPaid
              ? "border-l-green-500"
              : anyPartial
              ? "border-l-yellow-500"
              : "border-l-destructive";
            return (
              <div className={`border-l-4 rounded-md border bg-muted/30 p-4 space-y-3 ${borderColor}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {caseInfo?.case_number ?? "—"}
                    </span>
                    <p className="font-semibold text-base leading-tight">
                      {caseInfo?.deceased_name ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
                    {items.length} member{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm w-full">
                  <div className="rounded-md bg-background p-2 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Due</p>
                    <p className="font-bold">{formatCurrency(caseDue)}</p>
                  </div>
                  <div className="rounded-md bg-background p-2 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Paid</p>
                    <p className="font-bold text-green-600">{formatCurrency(casePaid)}</p>
                  </div>
                  <div className="rounded-md bg-background p-2 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Pending</p>
                    <p className={`font-bold ${casePending > 0 ? "text-destructive" : "text-green-600"}`}>
                      {formatCurrency(casePending)}
                    </p>
                  </div>
                </div>
                {/* Collection progress bar */}
                {caseDue > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Collection progress</span>
                      <span>{Math.min(100, Math.round((casePaid / caseDue) * 100))}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${allPaid ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min(100, (casePaid / caseDue) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Table card */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("collection.searchPlaceholder")}
            className="w-full mb-4"
          />
          {isLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case / Deceased</TableHead>
                  <TableHead>{t("member.fullName")}</TableHead>
                  <TableHead>{t("collection.amountDue")}</TableHead>
                  <TableHead>{t("collection.amountPaid")}</TableHead>
                  <TableHead>{t("collection.outstanding")}</TableHead>
                  <TableHead>{t("collection.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      {search ? t("common.noData") : t("collection.emptyState")}
                    </TableCell>
                  </TableRow>
                ) : (
                  grouped.map(([caseId, { caseInfo, items }]) => {
                    const caseDue = items.reduce((s, c) => s + c.amount_due, 0);
                    const casePaid = items.reduce((s, c) => s + c.amount_paid, 0);
                    return (
                      <>
                        {/* Case group header */}
                        <TableRow
                          key={`hdr-${caseId}`}
                          className="bg-muted/40 hover:bg-muted/40 border-t-2"
                        >
                          <TableCell colSpan={6} className="py-2 px-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-semibold">
                                  {caseInfo?.case_number ?? "—"}
                                </span>
                                <span className="text-sm">
                                  <span className="text-muted-foreground">Deceased: </span>
                                  <span className="font-medium">
                                    {caseInfo?.deceased_name ?? "—"}
                                  </span>
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {items.length} member{items.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  Due:{" "}
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(caseDue)}
                                  </span>
                                </span>
                                <span>
                                  Paid:{" "}
                                  <span className="font-medium text-green-600">
                                    {formatCurrency(casePaid)}
                                  </span>
                                </span>
                                <span>
                                  Pending:{" "}
                                  <span className="font-medium text-destructive">
                                    {formatCurrency(caseDue - casePaid)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Member rows */}
                        {items.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="pl-8 text-xs text-muted-foreground font-mono">
                              {c.funeral_cases?.case_number}
                            </TableCell>
                            <TableCell>{c.members?.full_name}</TableCell>
                            <TableCell>{formatCurrency(c.amount_due)}</TableCell>
                            <TableCell className="text-green-600">
                              {formatCurrency(c.amount_paid)}
                            </TableCell>
                            <TableCell className="text-destructive">
                              {formatCurrency(c.amount_due - c.amount_paid)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  statusVariant[c.status] as
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                    | "outline"
                                }
                              >
                                {t(`collection.${c.status}`)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Collections Dialog */}
      <Dialog open={genOpen} onOpenChange={(open) => { setGenOpen(open); if (!open) { setSelectedCase(""); setGenError(""); } }}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("collection.generateCollections")}</DialogTitle>
            <DialogDescription>
              {t("collection.generateDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>{t("funeral.caseNumber")} <span className="text-destructive">*</span></Label>
              <Combobox
                options={funeralCaseOptions}
                value={selectedCase}
                onValueChange={(v) => { setSelectedCase(v); setGenError(""); }}
                placeholder={t("collection.selectCase")}
                searchPlaceholder="Search by case number or deceased name…"
                emptyText="No cases found"
              />
            </div>

            {/* Inline warning: existing collections for this case */}
            {selectedCase && existingCollectionsCount > 0 && (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>
                  {existingCollectionsCount} collection record{existingCollectionsCount !== 1 ? "s" : ""} already exist for this case.
                  New records will only be created for members who don't have one yet.
                </p>
              </div>
            )}

            {/* Inline error from mutation */}
            {genError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{genError}</p>
              </div>
            )}

            {selectedCase && (
              <div className="rounded-md border bg-muted/40 p-3 space-y-1 text-sm">
                <p>
                  {t("collection.totalExpenseForCase")}:{" "}
                  <span className="font-semibold">
                    {formatCurrency(selectedCaseTotal)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("collection.generateNote")}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGenOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={!selectedCase || generateMutation.isPending}
              onClick={() => generateMutation.mutate(selectedCase)}
            >
              {generateMutation.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {t("collection.generate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
