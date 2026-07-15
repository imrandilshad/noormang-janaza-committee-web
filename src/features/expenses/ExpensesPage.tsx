import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Expense } from '@/types/database'

const expenseSchema = z.object({
  funeral_case_id: z.string().min(1),
  category: z.enum(['transportation', 'food', 'shroud', 'miscellaneous']),
  description: z.string().optional(),
  amount: z.number().positive(),
  expense_date: z.string().min(1),
})

type ExpenseForm = z.infer<typeof expenseSchema>

const categoryVariant = {
  transportation: 'default',
  food: 'secondary',
  shroud: 'warning',
  miscellaneous: 'outline',
} as const

export function ExpensesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('expenses')
        .select('*, funeral_cases(case_number, deceased_name)')
        .order('expense_date', { ascending: false })
      return (data ?? []) as (Expense & { funeral_cases: { case_number: string; deceased_name: string } })[]
    },
  })

  const { data: funeralCases = [] } = useQuery({
    queryKey: ['funeral-cases-select'],
    queryFn: async () => {
      const { data } = await supabase
        .from('funeral_cases')
        .select('id, case_number, deceased_name')
        .eq('status', 'open')
        .order('date_of_death', { ascending: false })
      return (data ?? []) as { id: string; case_number: string; deceased_name: string }[]
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { category: 'miscellaneous', expense_date: new Date().toISOString().split('T')[0] },
  })

  const upsert = useMutation({
    mutationFn: async (values: ExpenseForm) => {
      if (editing) {
        await supabase.from('expenses').update(values).eq('id', editing.id)
      } else {
        await supabase.from('expenses').insert(values)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setOpen(false)
      reset()
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('expenses').delete().eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  })

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background pt-4 lg:pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('expense.expenseList')}</h1>
        <Button onClick={() => { setEditing(null); reset({ category: 'miscellaneous', expense_date: new Date().toISOString().split('T')[0] }); setOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('expense.addExpense')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>{t('expense.category')}</TableHead>
                  <TableHead>{t('expense.description')}</TableHead>
                  <TableHead>{t('expense.amount')}</TableHead>
                  <TableHead>{t('expense.expenseDate')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">{t('common.noData')}</TableCell>
                  </TableRow>
                ) : (
                  expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-sm">
                        {(e as typeof e & { funeral_cases: { case_number: string; deceased_name: string } }).funeral_cases?.case_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant={categoryVariant[e.category] as 'default' | 'secondary' | 'outline'}>
                          {t(`expense.${e.category}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{e.description}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(e.amount)}</TableCell>
                      <TableCell>{formatDate(e.expense_date)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditing(e)
                            reset({ funeral_case_id: e.funeral_case_id, category: e.category, description: e.description ?? '', amount: e.amount, expense_date: e.expense_date })
                            setOpen(true)
                          }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('expense.editExpense') : t('expense.addExpense')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => upsert.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Label>Funeral Case *</Label>
              <Select value={watch('funeral_case_id') ?? ''} onValueChange={(v) => setValue('funeral_case_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>
                  {funeralCases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.case_number} – {c.deceased_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.funeral_case_id && <p className="text-xs text-destructive">{errors.funeral_case_id.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('expense.category')}</Label>
                <Select value={watch('category')} onValueChange={(v) => setValue('category', v as ExpenseForm['category'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transportation">{t('expense.transportation')}</SelectItem>
                    <SelectItem value="food">{t('expense.food')}</SelectItem>
                    <SelectItem value="shroud">{t('expense.shroud')}</SelectItem>
                    <SelectItem value="miscellaneous">{t('expense.miscellaneous')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('expense.amount')} *</Label>
                <Input {...register('amount', { valueAsNumber: true })} type="number" min="0" />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('expense.expenseDate')}</Label>
                <Input {...register('expense_date')} type="date" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t('expense.description')}</Label>
                <Textarea {...register('description')} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={isSubmitting || upsert.isPending}>
                {editing ? t('common.update') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
