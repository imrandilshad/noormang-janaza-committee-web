import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/shared/Skeletons";
import { SearchInput } from "@/components/shared/SearchInput";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Expense } from "@/types/database";

const expenseSchema = z.object({
  funeral_case_id: z.string().min(1),
  category: z.enum(["transportation", "food", "shroud", "miscellaneous"]),
  description: z.string().optional(),
  amount: z.number().positive(),
  expense_date: z.string().min(1),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

const categoryVariant = {
  transportation: "default",
  food: "secondary",
  shroud: "warning",
  miscellaneous: "outline",
} as const;

export function ExpensesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*, funeral_cases(case_number, deceased_name)")
        .order("expense_date", { ascending: false });
      return (data ?? []) as (Expense & {
        funeral_cases: { case_number: string; deceased_name: string };
      })[];
    },
  });

  const { data: funeralCases = [] } = useQuery({
    queryKey: ["funeral-cases-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("funeral_cases")
        .select("id, case_number, deceased_name")
        .eq("status", "open")
        .order("date_of_death", { ascending: false });
      return (data ?? []) as {
        id: string;
        case_number: string;
        deceased_name: string;
      }[];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "miscellaneous",
      expense_date: new Date().toISOString().split("T")[0],
    },
  });

  const upsert = useMutation({
    mutationFn: async (values: ExpenseForm) => {
      if (editing) {
        await supabase.from("expenses").update(values).eq("id", editing.id);
      } else {
        await supabase.from("expenses").insert(values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setOpen(false);
      reset();
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("expenses").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });

  return (
    <div className="space-y-4 pb-4">
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("expense.expenseList")}</h1>
        <Button
          onClick={() => {
            setEditing(null);
            reset({
              category: "miscellaneous",
              expense_date: new Date().toISOString().split("T")[0],
            });
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("expense.addExpense")}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("expense.searchPlaceholder")}
              className="w-full sm:max-w-sm"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={t("expense.category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allCategories")}</SelectItem>
                <SelectItem value="transportation">{t("expense.transportation")}</SelectItem>
                <SelectItem value="food">{t("expense.food")}</SelectItem>
                <SelectItem value="shroud">{t("expense.shroud")}</SelectItem>
                <SelectItem value="miscellaneous">{t("expense.miscellaneous")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (() => {
            const filtered = expenses.filter((e) => {
              const fc = (e as typeof e & { funeral_cases: { case_number: string; deceased_name: string } }).funeral_cases
              const matchesSearch = !search || (
                fc?.case_number?.includes(search) ||
                fc?.deceased_name?.toLowerCase().includes(search.toLowerCase()) ||
                e.description?.toLowerCase().includes(search.toLowerCase()) ||
                t(`expense.${e.category}`).toLowerCase().includes(search.toLowerCase())
              )
              const matchesCategory = categoryFilter === "all" || e.category === categoryFilter
              return matchesSearch && matchesCategory
            })
            return (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>{t("expense.category")}</TableHead>
                  <TableHead>{t("expense.description")}</TableHead>
                  <TableHead>{t("expense.amount")}</TableHead>
                  <TableHead>{t("expense.expenseDate")}</TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      {t("common.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-sm">
                        {
                          (
                            e as typeof e & {
                              funeral_cases: {
                                case_number: string;
                                deceased_name: string;
                              };
                            }
                          ).funeral_cases?.case_number
                        }
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            categoryVariant[e.category] as
                              | "default"
                              | "secondary"
                              | "outline"
                          }
                        >
                          {t(`expense.${e.category}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.description}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(e.amount)}
                      </TableCell>
                      <TableCell>{formatDate(e.expense_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditing(e);
                              reset({
                                funeral_case_id: e.funeral_case_id,
                                category: e.category,
                                description: e.description ?? "",
                                amount: e.amount,
                                expense_date: e.expense_date,
                              });
                              setOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete this expense record? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(e.id)}>{t("common.delete")}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
            )
          })()}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("expense.editExpense") : t("expense.addExpense")}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((v) => upsert.mutate(v))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Funeral Case *</Label>
              <Select
                value={watch("funeral_case_id") ?? ""}
                onValueChange={(v) => setValue("funeral_case_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {funeralCases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number} – {c.deceased_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.funeral_case_id && (
                <p className="text-xs text-destructive">
                  {errors.funeral_case_id.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("expense.category")}</Label>
                <Select
                  value={watch("category")}
                  onValueChange={(v) =>
                    setValue("category", v as ExpenseForm["category"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transportation">
                      {t("expense.transportation")}
                    </SelectItem>
                    <SelectItem value="food">{t("expense.food")}</SelectItem>
                    <SelectItem value="shroud">
                      {t("expense.shroud")}
                    </SelectItem>
                    <SelectItem value="miscellaneous">
                      {t("expense.miscellaneous")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("expense.amount")} *</Label>
                <Input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  min="0"
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("expense.expenseDate")}</Label>
                <Input {...register("expense_date")} type="date" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t("expense.description")}</Label>
                <Textarea {...register("description")} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting || upsert.isPending}>
                {editing ? t("common.update") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
