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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { TableSkeleton } from '@/components/shared/Skeletons'
import type { Family } from '@/types/database'

const familySchema = z.object({
  family_name: z.string().min(1),
  address: z.string().optional(),
  village: z.string().optional(),
})
type FamilyForm = z.infer<typeof familySchema>

export function FamiliesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Family | null>(null)
  const [search, setSearch] = useState('')

  const { data: families = [], isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: async () => {
      const { data } = await supabase.from('families').select('*').order('family_name')
      return data ?? []
    },
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FamilyForm>({
    resolver: zodResolver(familySchema),
  })

  const upsert = useMutation({
    mutationFn: async (values: FamilyForm) => {
      if (editing) {
        await supabase.from('families').update(values).eq('id', editing.id)
      } else {
        await supabase.from('families').insert(values)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      setOpen(false)
      reset()
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('families').delete().eq('id', id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['families'] }),
  })

  const openEdit = (family: Family) => {
    setEditing(family)
    reset({ family_name: family.family_name, address: family.address ?? '', village: family.village ?? '' })
    setOpen(true)
  }

  const openAdd = () => {
    setEditing(null)
    reset({ family_name: '', address: '', village: '' })
    setOpen(true)
  }

  const filtered = families.filter((f) =>
    f.family_name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background pt-4 lg:pt-6 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('family.familyList')}</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {t('family.addFamily')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('family.familyName')}</TableHead>
                  <TableHead>{t('family.village')}</TableHead>
                  <TableHead>{t('family.address')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((family) => (
                    <TableRow key={family.id}>
                      <TableCell className="font-medium">{family.family_name}</TableCell>
                      <TableCell>
                        {family.village && <Badge variant="secondary">{family.village}</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{family.address}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(family)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(family.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
            <DialogTitle>{editing ? t('family.editFamily') : t('family.addFamily')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => upsert.mutate(v))} className="space-y-4">
            <div className="space-y-2">
              <Label>{t('family.familyName')} *</Label>
              <Input {...register('family_name')} />
              {errors.family_name && <p className="text-xs text-destructive">{errors.family_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t('family.village')}</Label>
              <Input {...register('village')} />
            </div>
            <div className="space-y-2">
              <Label>{t('family.address')}</Label>
              <Input {...register('address')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
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
