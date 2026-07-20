import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
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
import { TableSkeleton } from '@/components/shared/Skeletons'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Payment } from '@/types/database'

const paymentSchema = z.object({
  collection_id: z.string().min(1),
  amount: z.number().positive(),
  payment_date: z.string().min(1),
  payment_method: z.enum(['cash', 'easypaisa', 'jazzcash', 'bank_transfer']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})
type PaymentForm = z.infer<typeof paymentSchema>

const methodVariant = { cash: 'default', easypaisa: 'secondary', jazzcash: 'secondary', bank_transfer: 'outline' } as const

export function PaymentsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('payments')
        .select('*, collections(amount_due, members(full_name), funeral_cases(case_number))')
        .order('payment_date', { ascending: false })
      return (data ?? []) as (Payment & {
        collections: { amount_due: number; members: { full_name: string }; funeral_cases: { case_number: string } }
      })[]
    },
  })

  const { data: pendingCollections = [] } = useQuery({
    queryKey: ['pending-collections'],
    queryFn: async () => {
      const { data } = await supabase
        .from('collections')
        .select('id, amount_due, amount_paid, members(full_name), funeral_cases(case_number)')
        .neq('status', 'paid')
      return (data ?? []) as unknown as {
        id: string
        amount_due: number
        amount_paid: number
        members: { full_name: string } | null
        funeral_cases: { case_number: string } | null
      }[]
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0] },
  })

  const create = useMutation({
    mutationFn: async (values: PaymentForm) => {
      await supabase.from('payments').insert(values)
      // Update collection status
      const col = pendingCollections.find((c) => c.id === values.collection_id)
      if (col) {
        const newPaid = col.amount_paid + values.amount
        const status = newPaid >= col.amount_due ? 'paid' : 'partial'
        await supabase.from('collections').update({ amount_paid: newPaid, status }).eq('id', values.collection_id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['collections'] })
      queryClient.invalidateQueries({ queryKey: ['pending-collections'] })
      setOpen(false)
      reset()
    },
  })

  return (
    <div className="space-y-4 pb-4">
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('payment.paymentHistory')}</h1>
        <Button onClick={() => { reset({ payment_method: 'cash', payment_date: new Date().toISOString().split('T')[0] }); setOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('payment.recordPayment')}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>{t('member.fullName')}</TableHead>
                  <TableHead>{t('payment.amountPaid')}</TableHead>
                  <TableHead>{t('payment.paymentDate')}</TableHead>
                  <TableHead>{t('payment.paymentMethod')}</TableHead>
                  <TableHead>Ref #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">{t('common.noData')}</TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.collections?.funeral_cases?.case_number}</TableCell>
                      <TableCell>{p.collections?.members?.full_name}</TableCell>
                      <TableCell className="font-semibold text-green-600">{formatCurrency(p.amount)}</TableCell>
                      <TableCell>{formatDate(p.payment_date)}</TableCell>
                      <TableCell>
                        <Badge variant={methodVariant[p.payment_method] as 'default' | 'secondary' | 'outline'}>
                          {t(`payment.${p.payment_method === 'bank_transfer' ? 'bankTransfer' : p.payment_method}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{p.reference_number}</TableCell>
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
        <DialogContent>
          <DialogHeader><DialogTitle>{t('payment.recordPayment')}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Label>Collection *</Label>
              <Select value={watch('collection_id') ?? ''} onValueChange={(v) => setValue('collection_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select member/case" /></SelectTrigger>
                <SelectContent>
                  {pendingCollections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.funeral_cases?.case_number} – {c.members?.full_name} (Due: {formatCurrency(c.amount_due - c.amount_paid)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.collection_id && <p className="text-xs text-destructive">{errors.collection_id.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('payment.amountPaid')} *</Label>
                <Input {...register('amount', { valueAsNumber: true })} type="number" min="0" />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('payment.paymentDate')}</Label>
                <Input {...register('payment_date')} type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t('payment.paymentMethod')}</Label>
                <Select value={watch('payment_method')} onValueChange={(v) => setValue('payment_method', v as PaymentForm['payment_method'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t('payment.cash')}</SelectItem>
                    <SelectItem value="easypaisa">{t('payment.easypaisa')}</SelectItem>
                    <SelectItem value="jazzcash">{t('payment.jazzcash')}</SelectItem>
                    <SelectItem value="bank_transfer">{t('payment.bankTransfer')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('payment.referenceNumber')}</Label>
                <Input {...register('reference_number')} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t('payment.notes')}</Label>
                <Textarea {...register('notes')} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={isSubmitting || create.isPending}>{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
