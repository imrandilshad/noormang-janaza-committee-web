import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <CardContent className="pt-4 pb-4 overflow-x-auto">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("collection.searchPlaceholder")}
            className="w-full mb-4"
          />
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>{t("member.fullName")}</TableHead>
                  <TableHead>{t("collection.amountDue")}</TableHead>
                  <TableHead>{t("collection.amountPaid")}</TableHead>
                  <TableHead>{t("collection.outstanding")}</TableHead>
                  <TableHead>{t("collection.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      {search ? t("common.noData") : t("collection.emptyState")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">
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
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Generate Collections Dialog */}
      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("collection.generateCollections")}</DialogTitle>
            <DialogDescription>
              {t("collection.generateDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("funeral.caseNumber")} *</Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder={t("collection.selectCase")} />
                </SelectTrigger>
                <SelectContent>
                  {funeralCases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number} – {c.deceased_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
