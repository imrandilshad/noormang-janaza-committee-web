import { useTranslation } from 'react-i18next'
import { Users, CheckCircle, Banknote, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const benefits = [
  'public.benefit1',
  'public.benefit3',
  'public.benefit4',
  'public.benefit5',
]

const eligibility = [
  'public.elig1',
  'public.elig2',
  'public.elig3',
  'public.elig4',
]

export function PublicMembershipPage() {
  const { t } = useTranslation()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t('public.membershipTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('public.membershipSubtitle')}
          </p>
        </div>
      </section>

      <div className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {t('public.membershipBenefits')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Eligibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t('public.membershipEligibility')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {eligibility.map((key) => (
                    <li key={key} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Fee Structure — contribution only, no registration fee */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" />
                  {t('public.feeStructure')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="text-sm font-medium">{t('public.feePerCase')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('public.feeNote')}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {t('public.feePerCaseAmount')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
