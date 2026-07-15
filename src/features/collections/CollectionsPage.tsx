import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import type { Collection } from '@/types/database'

const statusVariant = {
  pending: 'destructive',
  partial: 'warning',
  paid: 'success',
} as const

export function CollectionsPage() {
  const { t } = useTranslation()

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await supabase
        .from('collections')
        .select('*, members(member_number, full_name), funeral_cases(case_number, deceased_name)')
        .order('created_at', { ascending: false })
      return (data ?? []) as (Collection & {
        members: { member_number: string; full_name: string }
        funeral_cases: { case_number: string; deceased_name: string }
      })[]
    },
  })

  const totals = collections.reduce(
    (acc, c) => ({
      due: acc.due + c.amount_due,
      paid: acc.paid + c.amount_paid,
    }),
    { due: 0, paid: 0 },
  )

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background pt-4 lg:pt-6 pb-3">
        <h1 className="text-2xl font-bold">{t('collection.collectionList')}</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('collection.amountDue')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.due)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('collection.amountPaid')}</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('collection.outstanding')}</p>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totals.due - totals.paid)}</p>
          </CardContent>
        </Card>
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
                  <TableHead>{t('member.fullName')}</TableHead>
                  <TableHead>{t('collection.amountDue')}</TableHead>
                  <TableHead>{t('collection.amountPaid')}</TableHead>
                  <TableHead>{t('collection.outstanding')}</TableHead>
                  <TableHead>{t('collection.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">{t('common.noData')}</TableCell>
                  </TableRow>
                ) : (
                  collections.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">{c.funeral_cases?.case_number}</TableCell>
                      <TableCell>{c.members?.full_name}</TableCell>
                      <TableCell>{formatCurrency(c.amount_due)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(c.amount_paid)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(c.amount_due - c.amount_paid)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[c.status] as 'default' | 'secondary' | 'destructive' | 'outline'}>
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
    </div>
  )
}
