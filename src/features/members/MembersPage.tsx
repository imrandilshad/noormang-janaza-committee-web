import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Combobox } from "@/components/ui/combobox";
import { supabase } from "@/lib/supabase";
import { TableSkeleton } from "@/components/shared/Skeletons";
import type { Member } from "@/types/database";

const memberSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  father_name: z.string().optional(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
  occupation: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "deceased"]),
  joined_date: z.string().min(1, "Joined date is required"),
  family_id: z.string().optional(),
});

type MemberForm = z.infer<typeof memberSchema>;

const statusVariant = {
  active: "success",
  inactive: "secondary",
  deceased: "destructive",
} as const;

export function MembersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [search, setSearch] = useState("");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("members")
        .select("*, families(family_name)")
        .order("member_number");
      return (data ?? []) as (Member & {
        families: { family_name: string } | null;
      })[];
    },
  });

  const { data: families = [] } = useQuery({
    queryKey: ["families"],
    queryFn: async () => {
      const { data } = await supabase
        .from("families")
        .select("id, family_name")
        .order("family_name");
      return data ?? [];
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      status: "active",
      joined_date: new Date().toISOString().split("T")[0],
    },
  });

  const upsert = useMutation({
    mutationFn: async (values: MemberForm) => {
      const payload = {
        ...values,
        family_id:
          values.family_id && values.family_id !== "_none"
            ? values.family_id
            : null,
      };
      if (editing) {
        await supabase.from("members").update(payload).eq("id", editing.id);
      } else {
        const { data: last } = await supabase
          .from("members")
          .select("member_number")
          .order("member_number", { ascending: false })
          .limit(1);
        let nextNum = 1;
        if (last && last.length > 0) {
          const n = parseInt(
            (last[0] as { member_number: string }).member_number.replace(
              /\D/g,
              "",
            ),
            10,
          );
          if (!isNaN(n)) nextNum = n + 1;
        }
        const member_number = `JC-${String(nextNum).padStart(3, "0")}`;
        await supabase.from("members").insert({ ...payload, member_number });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setOpen(false);
      reset();
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("members").delete().eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
  });

  const openEdit = (m: Member) => {
    setEditing(m);
    reset({
      full_name: m.full_name,
      father_name: m.father_name ?? "",
      phone: m.phone ?? "",
      cnic: m.cnic ?? "",
      occupation: m.occupation ?? "",
      address: m.address ?? "",
      status: m.status,
      joined_date: m.joined_date,
      family_id: m.family_id ?? "",
    });
    setOpen(true);
  };

  const openAdd = () => {
    setEditing(null);
    reset({
      status: "active",
      joined_date: new Date().toISOString().split("T")[0],
    });
    setOpen(true);
  };

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_number.includes(search) ||
      (m.phone ?? "").includes(search),
  );

  return (
    <div className="space-y-4 pb-4">
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("member.memberList")}</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t("member.addMember")}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t("member.searchPlaceholder")}
            className="w-full sm:max-w-sm mb-4"
          />
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("member.memberId")}</TableHead>
                    <TableHead>{t("member.fullName")}</TableHead>
                    <TableHead>{t("member.fatherName")}</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>{t("member.phone")}</TableHead>
                    <TableHead>{t("member.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        {t("common.noData")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-mono">
                          {member.member_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {member.full_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.father_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {(
                            member as typeof member & {
                              families: { family_name: string } | null;
                            }
                          ).families?.family_name ?? "—"}
                        </TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[member.status]}>
                            {t(`member.${member.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(member)}
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
                                  <AlertDialogTitle>
                                    Delete Member
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Delete <strong>{member.full_name}</strong> (
                                    {member.member_number})? This cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t("common.cancel")}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteMutation.mutate(member.id)
                                    }
                                  >
                                    {t("common.delete")}
                                  </AlertDialogAction>
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
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("member.editMember") : t("member.addMember")}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((v) => upsert.mutate(v))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {editing && (
                <div className="space-y-2">
                  <Label>{t("member.memberId")}</Label>
                  <div className="font-mono text-sm px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                    {editing.member_number}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>{t("member.status")}</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) =>
                    setValue("status", v as "active" | "inactive" | "deceased")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("member.active")}</SelectItem>
                    <SelectItem value="inactive">
                      {t("member.inactive")}
                    </SelectItem>
                    <SelectItem value="deceased">
                      {t("member.deceased")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>
                  {t("member.fullName")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("member.fatherName")}</Label>
                <Input {...register("father_name")} />
              </div>
              <div className="space-y-2">
                <Label>{t("member.phone")}</Label>
                <Input {...register("phone")} type="tel" />
              </div>
              <div className="space-y-2">
                <Label>{t("member.cnic")}</Label>
                <Input {...register("cnic")} placeholder="XXXXX-XXXXXXX-X" />
              </div>
              <div className="space-y-2">
                <Label>{t("member.occupation")}</Label>
                <Input {...register("occupation")} />
              </div>
              <div className="space-y-2">
                <Label>
                  {t("member.joinedDate")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input {...register("joined_date")} type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t("member.family")}</Label>
                <Combobox
                  options={families.map((f) => ({
                    value: f.id,
                    label: f.family_name,
                  }))}
                  value={watch("family_id") ?? ""}
                  onValueChange={(v) => setValue("family_id", v)}
                  placeholder="Select family"
                  searchPlaceholder="Search family name"
                  emptyText="No families found"
                  clearable
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("member.address")}</Label>
                <Input {...register("address")} />
              </div>
            </div>
            <DialogFooter className="gap-2">
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
