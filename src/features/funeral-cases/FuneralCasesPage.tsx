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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { FuneralCase } from '@/types/database'

const caseSchema = z.object({
  deceased_name: z.string().min(1),
  date_of_death: z.string().min(1),
  date_of_funeral: z.string().optional(),
  location: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['open', 'closed']),
})

type CaseForm = z.infer<typeof caseSchema>

export function FuneralCasesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FuneralCase | null>(null)
  const [search, setSearch] = useState('')

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['funeral-cases'],
    queryFn: async () => {
      const { data } = await supabase
        .from('funeral_cases')
        .select('*, expenses(amount)')
        .order('date_of_death', { ascending: false })
      return (data ?? []) as (FuneralCase & { expenses: { amount: number }[] })[]
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<CaseForm>({
    resolver: zodResolver(caseSchema),
    defaultValues: { status: 'open', date_of_death: new Date().toISOString().split('T')[0] },
  })

  const upsert = useMutation({
    mutationFn: async (values: CaseForm) => {
      const payload = {
        ...values,
        date_of_funeral: values.date_of_funeral || null,
      }
      if (editing) {
        await supabase.from('funeral_cases').update(payload).eq('id', editing.id)
      } else {
        const year = new Date().getFullYear()
        const { data: last } = await supabase
          .from('funeral_cases')
          .select('case_number')
          .ilike('case_number', `FC-${year}-%`)
          .order('case_number', { ascending: false })
          .limit(1)
        let nextNum = 1
        if (last && last.length > 0) {
          const parts = (last[0] as { case_number: string }).case_number.split('-')
          const n = parseInt(parts[parts.length - 1] || '0', 10)
          if (!isNaN(n)) nextNum = n + 1
        }
        const case_number = `FC-${year}-${String(nextNum).padStart(3, '0')}`
        await supabase.from('funeral_cases').insert({ ...payload, case_number })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funeral-cases'] })
      setOpen(false)
      reset()
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('funeral_cases').delete().eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['funeral-cases'] }),
  })

  const openEdit = (c: FuneralCase) => {
    setEditing(c)
    reset({
      deceased_name: c.deceased_name,
      date_of_death: c.date_of_death,
      date_of_funeral: c.date_of_funeral ?? '',
      location: c.location ?? '',
      contact_person: c.contact_person ?? '',
      contact_phone: c.contact_phone ?? '',
      notes: c.notes ?? '',
      status: c.status,
    })
    setOpen(true)
  }

  const filtered = cases.filter(
    (c) =>
      c.deceased_name.toLowerCase().includes(search.toLowerCase()) ||
      c.case_number.includes(search),
  )

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background pt-4 lg:pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('funeral.caseList')}</h1>
        <Button onClick={() => { setEditing(null); reset({ status: 'open', date_of_death: new Date().toISOString().split('T')[0] }); setOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('funeral.addCase')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Input placeholder={t('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('common.loading')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('funeral.caseNumber')}</TableHead>
                  <TableHead>{t('funeral.deceasedName')}</TableHead>
                  <TableHead>{t('funeral.dateOfDeath')}</TableHead>
                  <TableHead>{t('funeral.location')}</TableHead>
                  <TableHead>{t('funeral.totalExpense')}</TableHead>
                  <TableHead>{t('funeral.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">{t('common.noData')}</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono">{c.case_number}</TableCell>
                      <TableCell className="font-medium">{c.deceased_name}</TableCell>
                      <TableCell>{formatDate(c.date_of_death)}</TableCell>
                      <TableCell className="text-muted-foreground">{c.location}</TableCell>
                      <TableCell>{formatCurrency((c as typeof c & { expenses: { amount: number }[] }).expenses?.reduce((s, e) => s + e.amount, 0) ?? 0)}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'open' ? 'default' : 'secondary'}>
                          {t(`funeral.${c.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t('funeral.editCase') : t('funeral.addCase')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => upsert.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {editing && (
                <div className="space-y-2">
                  <Label>{t('funeral.caseNumber')}</Label>
                  <div className="font-mono text-sm px-3 py-2 border rounded-md bg-muted text-muted-foreground">{editing.case_number}</div>
                </div>
              )}
              <div className="space-y-2">
                <Label>{t('funeral.status')}</Label>
                <Select value={watch('status')} onValueChange={(v) => setValue('status', v as 'open' | 'closed')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t('funeral.open')}</SelectItem>
                    <SelectItem value="closed">{t('funeral.closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t('funeral.deceasedName')} *</Label>
                <Input {...register('deceased_name')} />
                {errors.deceased_name && <p className="text-xs text-destructive">{errors.deceased_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t('funeral.dateOfDeath')} *</Label>
                <Input {...register('date_of_death')} type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t('funeral.dateOfFuneral')}</Label>
                <Input {...register('date_of_funeral')} type="date" />
              </div>
              <div className="space-y-2">
                <Label>{t('funeral.location')}</Label>
                <Input {...register('location')} />
              </div>
              <div className="space-y-2">
                <Label>{t('funeral.contactPerson')}</Label>
                <Input {...register('contact_person')} />
              </div>
              <div className="space-y-2">
                <Label>{t('funeral.contactPhone')}</Label>
                <Input {...register('contact_phone')} type="tel" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{t('funeral.notes')}</Label>
                <Textarea {...register('notes')} rows={3} />
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
