import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { TableSkeleton, ReportsSkeleton } from '@/components/shared/Skeletons'
import { formatCurrency, formatDate } from '@/lib/utils'

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981']

export function ReportsPage() {
  const { t } = useTranslation()
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])

  const { data: expenseData = [], isLoading: expLoading } = useQuery({
    queryKey: ['report-expenses', from, to],
    queryFn: async () => {
      const { data } = await supabase
        .from('expenses')
        .select('category, amount, expense_date, funeral_cases(case_number, deceased_name)')
        .gte('expense_date', from)
        .lte('expense_date', to)
      return data ?? []
    },
  })

  const { data: collectionData = [] } = useQuery({
    queryKey: ['report-collections', from, to],
    queryFn: async () => {
      const { data } = await supabase
        .from('collections')
        .select('amount_due, amount_paid, status, members(full_name), funeral_cases(case_number)')
        .gte('created_at', from)
        .lte('created_at', to)
      return data ?? []
    },
  })

  const totalExpenses = expenseData.reduce((s, e) => s + e.amount, 0)
  const totalCollected = collectionData.reduce((s, c) => s + c.amount_paid, 0)

  const byCategory = ['transportation', 'food', 'shroud', 'miscellaneous']
    .map((cat) => ({
      name: t(`expense.${cat}`),
      value: expenseData.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    }))
    .filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2">
        <h1 className="text-2xl font-bold">{t('report.financialReport')}</h1>
      </div>

      {/* Date range filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>{t('report.from')}</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1">
              <Label>{t('report.to')}</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary + Charts — skeleton while data loads */}
      {expLoading ? (
        <ReportsSkeleton />
      ) : (
        <>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('report.totalExpenses')}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('report.totalIncome')}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold text-green-600">{formatCurrency(totalCollected)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t('report.balance')}</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatCurrency(totalCollected - totalExpenses)}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense by Category Pie Chart */}
        <Card>
          <CardHeader><CardTitle>Expenses by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  innerRadius={40}
                >
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend
                  formatter={(value, entry) => (
                    <span className="text-xs">{value}: {formatCurrency((entry.payload as { value: number }).value)}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Collections Bar Chart */}
        <Card>
          <CardHeader><CardTitle>Collection Summary</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { name: 'Due', amount: collectionData.reduce((s, c) => s + c.amount_due, 0) },
                { name: 'Paid', amount: totalCollected },
                { name: 'Outstanding', amount: collectionData.reduce((s, c) => s + c.amount_due - c.amount_paid, 0) },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="amount" fill="#3b82f6" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
        </>
      )}

      {/* Expense Details Table */}
      <Card>
        <CardHeader><CardTitle>Expense Details</CardTitle></CardHeader>
        <CardContent>
          {expLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>{t('expense.category')}</TableHead>
                  <TableHead>{t('expense.amount')}</TableHead>
                  <TableHead>{t('expense.expenseDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseData.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-sm">{(e as typeof e & { funeral_cases: { case_number: string } }).funeral_cases?.case_number}</TableCell>
                    <TableCell>{t(`expense.${e.category}`)}</TableCell>
                    <TableCell>{formatCurrency(e.amount)}</TableCell>
                    <TableCell>{formatDate(e.expense_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
