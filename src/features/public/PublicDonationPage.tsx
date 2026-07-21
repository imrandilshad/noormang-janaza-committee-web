import { useTranslation } from 'react-i18next'
import { Heart, Banknote, Smartphone, Copy, CheckCheck, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={handleCopy}
      title="Copy"
    >
      {copied
        ? <CheckCheck className="h-3.5 w-3.5 text-green-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-sm font-semibold text-right break-all">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  )
}

type PaymentMethod = {
  id: string
  badge: string
  badgeColor: string
  accentColor: string
  bgColor: string
  icon: React.ElementType
  fields: { labelKey: string; value: string }[]
  noteKey?: string
}

export function PublicDonationPage() {
  const { t } = useTranslation()

  const methods: PaymentMethod[] = [
    {
      id: 'bank',
      badge: t('public.bankTransfer'),
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      accentColor: 'border-t-blue-500',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
      icon: Banknote,
      fields: [
        { labelKey: 'public.bankName', value: 'HBL / MCB' },
        { labelKey: 'public.accountTitle', value: 'Noormang Mutual Committee' },
        { labelKey: 'public.accountNumber', value: 'XXXX-XXXX-XXXX' },
        { labelKey: 'public.ibanNumber', value: 'PKXX XXXX XXXX XXXX XXXX' },
      ],
    },
    {
      id: 'easypaisa',
      badge: 'Easypaisa',
      badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
      accentColor: 'border-t-green-500',
      bgColor: 'bg-green-50/50 dark:bg-green-950/20',
      icon: Smartphone,
      fields: [
        { labelKey: 'public.accountName', value: 'Muhammad Aslam' },
        { labelKey: 'public.mobileNumber', value: '0300-XXXXXXX' },
      ],
      noteKey: 'public.transferDesc',
    },
    {
      id: 'jazzcash',
      badge: 'JazzCash',
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
      accentColor: 'border-t-orange-500',
      bgColor: 'bg-orange-50/50 dark:bg-orange-950/20',
      icon: Smartphone,
      fields: [
        { labelKey: 'public.accountName', value: 'Muhammad Aslam' },
        { labelKey: 'public.mobileNumber', value: '0300-XXXXXXX' },
      ],
      noteKey: 'public.transferDesc',
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t('public.donateTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('public.donateSubtitle')}
          </p>
        </div>
      </section>

      <div className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {methods.map((method) => {
              const Icon = method.icon
              return (
                <Card
                  key={method.id}
                  className={`overflow-hidden border-t-4 ${method.accentColor}`}
                >
                  <div className={`px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4 ${method.bgColor}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card shadow-sm">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <CardContent className="px-4 sm:px-5 pt-1 pb-3 sm:pb-4">
                    {method.fields.map((f, i) => (
                      <div key={f.labelKey}>
                        <Field label={t(f.labelKey)} value={f.value} />
                        {i < method.fields.length - 1 && <Separator />}
                      </div>
                    ))}
                    {method.noteKey && (
                      <p className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        {t(method.noteKey)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-8 sm:mt-10 max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2">{t('public.donateGuidanceTitle')}</h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        {t('public.donateGuidance1')}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        {t('public.donateGuidance2')}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        {t('public.donateGuidance3')}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
