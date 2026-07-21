import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, ChevronDown, Check } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
  const [search, setSearch] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [caseDropdownOpen, setCaseDropdownOpen] = useState(false);
  const caseDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(e.target as Node)) {
        setCaseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const filteredFuneralCases = funeralCases.filter(
    (c) =>
      !caseSearch ||
      c.case_number.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.deceased_name.toLowerCase().includes(caseSearch.toLowerCase()),
  );

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

      {/* Summary — always 3 columns, compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card>
          <CardContent className="px-3 pt-3 pb-3 sm:pt-4 sm:pb-4">
            <p className="text-xs text-muted-foreground truncate">
              {t("collection.amountDue")}
            </p>
            <p className="text-sm sm:text-xl font-bold mt-0.5 truncate">
              {formatCurrency(totals.due)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-3 pt-3 pb-3 sm:pt-4 sm:pb-4">
            <p className="text-xs text-muted-foreground truncate">
              {t("collection.amountPaid")}
            </p>
            <p className="text-sm sm:text-xl font-bold text-green-600 mt-0.5 truncate">
              {formatCurrency(totals.paid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-3 pt-3 pb-3 sm:pt-4 sm:pb-4">
            <p className="text-xs text-muted-foreground truncate">
              {t("collection.outstanding")}
            </p>
            <p className="text-sm sm:text-xl font-bold text-destructive mt-0.5 truncate">
              {formatCurrency(totals.due - totals.paid)}
            </p>
          </CardContent>
        </Card>
      </div>

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
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="overflow-visible">
          <DialogHeader>
            <DialogTitle>{t("collection.generateCollections")}</DialogTitle>
            <DialogDescription>
              {t("collection.generateDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("funeral.caseNumber")} *</Label>
              <div className="relative" ref={caseDropdownRef}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setCaseDropdownOpen((o) => !o)}
                >
                  <span className={selectedCase ? "" : "text-muted-foreground"}>
                    {selectedCase
                      ? `${selectedCaseData?.case_number} – ${selectedCaseData?.deceased_name}`
                      : t("collection.selectCase")}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </button>

                {caseDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-md">
                    <div className="p-2">
                      <Input
                        value={caseSearch}
                        onChange={(e) => setCaseSearch(e.target.value)}
                        placeholder="Search by case number or deceased name..."
                        autoFocus
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {filteredFuneralCases.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          No cases found.
                        </p>
                      ) : (
                        filteredFuneralCases.map((c) => (
                          <div
                            key={c.id}
                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-accent ${
                              selectedCase === c.id ? "bg-accent" : ""
                            }`}
                            onClick={() => {
                              setSelectedCase(c.id);
                              setCaseDropdownOpen(false);
                              setCaseSearch("");
                            }}
                          >
                            <Check
                              className={`h-4 w-4 shrink-0 ${selectedCase === c.id ? "opacity-100" : "opacity-0"}`}
                            />
                            <span>
                              <span className="font-mono">{c.case_number}</span>
                              {" – "}
                              {c.deceased_name}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
          <DialogFooter>
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
