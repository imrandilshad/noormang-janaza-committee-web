import { useTranslation } from 'react-i18next'
import { Heart, Banknote, Smartphone, Copy, CheckCheck, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

      <div className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

            {/* Bank Transfer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Banknote className="h-5 w-5 text-primary" />
                  {t('public.bankTransfer')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label={t('public.bankName')} value="HBL / MCB" />
                <InfoRow label={t('public.accountTitle')} value="Noormang Mutual Committee" />
                <InfoRow label={t('public.accountNumber')} value="XXXX-XXXX-XXXX" />
                <InfoRow label={t('public.ibanNumber')} value="PKXX XXXX XXXX XXXX XXXX" />
              </CardContent>
            </Card>

            {/* Easypaisa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Easypaisa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label={t('public.accountName')} value="Muhammad Aslam" />
                <InfoRow label={t('public.mobileNumber')} value="0300-XXXXXXX" />
                <p className="text-xs text-muted-foreground pt-2">{t('public.transferDesc')}</p>
              </CardContent>
            </Card>

            {/* JazzCash */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Smartphone className="h-5 w-5 text-primary" />
                  JazzCash
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow label={t('public.accountName')} value="Muhammad Aslam" />
                <InfoRow label={t('public.mobileNumber')} value="0300-XXXXXXX" />
                <p className="text-xs text-muted-foreground pt-2">{t('public.transferDesc')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Guidance */}
          <div className="mt-10 max-w-2xl mx-auto">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">{t('public.donateGuidanceTitle')}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>â€¢ {t('public.donateGuidance1')}</li>
                  <li>â€¢ {t('public.donateGuidance2')}</li>
                  <li>â€¢ {t('public.donateGuidance3')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
