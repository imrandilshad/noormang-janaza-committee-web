import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Users, HomeIcon, BookOpen, Coins, TrendingUp, AlertCircle, Heart, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  totalFamilies: number
  openCases: number
  closedCases: number
  totalFuneralCases: number
  totalExpenses: number
  totalCollections: number
  pendingCollections: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [allMembers, activeMembers, families, openCases, closedCases, totalCases, expenses, collections] = await Promise.all([
    supabase.from('members').select('id', { count: 'exact', head: true }),
    supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('families').select('id', { count: 'exact', head: true }),
    supabase.from('funeral_cases').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('funeral_cases').select('id', { count: 'exact', head: true }).eq('status', 'closed'),
    supabase.from('funeral_cases').select('id', { count: 'exact', head: true }),
    supabase.from('expenses').select('amount'),
    supabase.from('collections').select('amount_due, amount_paid, status'),
  ])

  const expenseRows = (expenses.data ?? []) as { amount: number }[]
  const collectionRows = (collections.data ?? []) as { amount_due: number; amount_paid: number; status: string }[]

  const totalExpenses = expenseRows.reduce((s, e) => s + e.amount, 0)
  const totalCollections = collectionRows.reduce((s, c) => s + c.amount_paid, 0)
  const pendingCollections = collectionRows
    .filter((c) => c.status !== 'paid')
    .reduce((s, c) => s + (c.amount_due - c.amount_paid), 0)

  return {
    totalMembers: allMembers.count ?? 0,
    activeMembers: activeMembers.count ?? 0,
    totalFamilies: families.count ?? 0,
    openCases: openCases.count ?? 0,
    closedCases: closedCases.count ?? 0,
    totalFuneralCases: totalCases.count ?? 0,
    totalExpenses,
    totalCollections,
    pendingCollections,
  }
}

interface StatCard {
  key: keyof DashboardStats
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
  isCurrency?: boolean
}

const statCards: StatCard[] = [
  { key: 'totalMembers',       icon: Users,         color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  { key: 'activeMembers',      icon: Users,         color: 'text-green-500',   bg: 'bg-green-500/10' },
  { key: 'totalFamilies',      icon: HomeIcon,      color: 'text-purple-500',  bg: 'bg-purple-500/10' },
  { key: 'totalFuneralCases',  icon: Heart,         color: 'text-gray-500',    bg: 'bg-gray-500/10' },
  { key: 'openCases',          icon: BookOpen,      color: 'text-red-500',     bg: 'bg-red-500/10' },
  { key: 'closedCases',        icon: CheckCircle,   color: 'text-teal-500',    bg: 'bg-teal-500/10' },
  { key: 'totalExpenses',      icon: Coins,         color: 'text-orange-500',  bg: 'bg-orange-500/10',  isCurrency: true },
  { key: 'totalCollections',   icon: TrendingUp,    color: 'text-emerald-500', bg: 'bg-emerald-500/10', isCurrency: true },
  { key: 'pendingCollections', icon: AlertCircle,   color: 'text-yellow-500',  bg: 'bg-yellow-500/10',  isCurrency: true },
]

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map(({ key, icon: Icon, color, bg, isCurrency }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t(`dashboard.${key}`)}
                </CardTitle>
                <div className={`rounded-full p-2 ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedNumber
                    value={stats?.[key as keyof DashboardStats] as number ?? 0}
                    format={isCurrency ? formatCurrency : undefined}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
