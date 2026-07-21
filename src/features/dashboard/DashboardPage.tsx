import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Users, HomeIcon, BookOpen, Coins, TrendingUp, AlertCircle, Heart, CheckCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

interface RecentCase {
  id: string
  case_number: string
  deceased_name: string
  date_of_death: string
  status: string
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
  const pendingCollections = totalExpenses - totalCollections

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

async function fetchRecentCases(): Promise<RecentCase[]> {
  const { data } = await supabase
    .from('funeral_cases')
    .select('id, case_number, deceased_name, date_of_death, status')
    .order('created_at', { ascending: false })
    .limit(5)
  return (data ?? []) as RecentCase[]
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
  isCurrency?: boolean
  description: string
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, isCurrency, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full p-2 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <AnimatedNumber value={value} format={isCurrency ? formatCurrency : undefined} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        {children}
      </span>
      <span className="flex-1 h-px bg-border" />
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  })
  const { data: recentCases = [] } = useQuery({
    queryKey: ['dashboard-recent-cases'],
    queryFn: fetchRecentCases,
  })

  const collectionRate =
    stats && stats.totalExpenses > 0
      ? Math.min(100, Math.round((stats.totalCollections / stats.totalExpenses) * 100))
      : 0

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background pt-3 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.welcome')}</p>
          </div>
          <div className="text-right shrink-0 hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5" />
            {dateStr}
          </div>
        </div>
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
        <div className="space-y-6">
          {/* Members & Families */}
          <section>
            <SectionHeading>Members &amp; Families</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title={t('dashboard.totalMembers')}
                value={stats?.totalMembers ?? 0}
                icon={Users}
                iconColor="text-blue-500"
                iconBg="bg-blue-500/10"
                description="Registered members"
              />
              <StatCard
                title={t('dashboard.activeMembers')}
                value={stats?.activeMembers ?? 0}
                icon={Users}
                iconColor="text-green-500"
                iconBg="bg-green-500/10"
                description="Currently active"
              />
              <StatCard
                title={t('dashboard.totalFamilies')}
                value={stats?.totalFamilies ?? 0}
                icon={HomeIcon}
                iconColor="text-purple-500"
                iconBg="bg-purple-500/10"
                description="Registered families"
              />
            </div>
          </section>

          {/* Funeral Cases */}
          <section>
            <SectionHeading>Funeral Cases</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                title={t('dashboard.totalFuneralCases')}
                value={stats?.totalFuneralCases ?? 0}
                icon={Heart}
                iconColor="text-gray-500"
                iconBg="bg-gray-500/10"
                description="All time cases"
              />
              <StatCard
                title={t('dashboard.openCases')}
                value={stats?.openCases ?? 0}
                icon={BookOpen}
                iconColor="text-red-500"
                iconBg="bg-red-500/10"
                description="Requires attention"
              />
              <StatCard
                title={t('dashboard.closedCases')}
                value={stats?.closedCases ?? 0}
                icon={CheckCircle}
                iconColor="text-teal-500"
                iconBg="bg-teal-500/10"
                description="Fully resolved"
              />
            </div>
          </section>

          {/* Financial Summary */}
          <section>
            <SectionHeading>Financial Summary</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <StatCard
                title={t('dashboard.totalExpenses')}
                value={stats?.totalExpenses ?? 0}
                icon={Coins}
                iconColor="text-orange-500"
                iconBg="bg-orange-500/10"
                isCurrency
                description="Total disbursed"
              />
              <StatCard
                title={t('dashboard.totalCollections')}
                value={stats?.totalCollections ?? 0}
                icon={TrendingUp}
                iconColor="text-emerald-500"
                iconBg="bg-emerald-500/10"
                isCurrency
                description="Collected so far"
              />
              <StatCard
                title={t('dashboard.pendingCollections')}
                value={stats?.pendingCollections ?? 0}
                icon={AlertCircle}
                iconColor="text-yellow-500"
                iconBg="bg-yellow-500/10"
                isCurrency
                description="Yet to be collected"
              />
            </div>

            {/* Collection Progress Bar */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Collection Progress</p>
                  <span className="text-sm font-bold text-emerald-600">{collectionRate}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${collectionRate}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>
                    Collected:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(stats?.totalCollections ?? 0)}
                    </span>
                  </span>
                  <span>
                    Total:{' '}
                    <span className="font-medium text-foreground">
                      {formatCurrency(stats?.totalExpenses ?? 0)}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Recent Funeral Cases */}
          {recentCases.length > 0 && (
            <section>
              <SectionHeading>Recent Funeral Cases</SectionHeading>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <div className="divide-y">
                    {recentCases.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1"
                      >
                        <div>
                          <p className="font-medium text-sm">{c.deceased_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {c.case_number}
                            {c.date_of_death
                              ? ` · ${new Date(c.date_of_death).toLocaleDateString('en-PK', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}`
                              : ''}
                          </p>
                        </div>
                        <Badge variant={c.status === 'open' ? 'destructive' : 'outline'} className="shrink-0">
                          {c.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
