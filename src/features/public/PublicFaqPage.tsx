import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const faqKeys = [
  { qKey: 'public.faq1Q', aKey: 'public.faq1A', category: 'membership' },
  { qKey: 'public.faq2Q', aKey: 'public.faq2A', category: 'membership' },
  { qKey: 'public.faq3Q', aKey: 'public.faq3A', category: 'membership' },
  { qKey: 'public.faq4Q', aKey: 'public.faq4A', category: 'funeral' },
  { qKey: 'public.faq5Q', aKey: 'public.faq5A', category: 'funeral' },
  { qKey: 'public.faq6Q', aKey: 'public.faq6A', category: 'funeral' },
  { qKey: 'public.faq7Q', aKey: 'public.faq7A', category: 'payment' },
  { qKey: 'public.faq8Q', aKey: 'public.faq8A', category: 'payment' },
]

function FaqItem({ qKey, aKey }: { qKey: string; aKey: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
        aria-expanded={open}
      >
        <span className="font-medium text-sm pr-4">{t(qKey)}</span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-primary" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        }
      </button>
      <div className={cn('overflow-hidden transition-all duration-200', open ? 'max-h-96' : 'max-h-0')}>
        <CardContent className="pt-0 pb-4 px-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{t(aKey)}</p>
        </CardContent>
      </div>
    </Card>
  )
}

export function PublicFaqPage() {
  const { t } = useTranslation()

  const membershipFaqs = faqKeys.filter((f) => f.category === 'membership')
  const funeralFaqs = faqKeys.filter((f) => f.category === 'funeral')
  const paymentFaqs = faqKeys.filter((f) => f.category === 'payment')

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t('public.faqTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('public.faqSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-10">

            {/* Membership FAQs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('public.faqMembershipSection')}</h2>
              <div className="space-y-3">
                {membershipFaqs.map((faq) => (
                  <FaqItem key={faq.qKey} qKey={faq.qKey} aKey={faq.aKey} />
                ))}
              </div>
            </div>

            {/* Funeral FAQs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('public.faqFuneralSection')}</h2>
              <div className="space-y-3">
                {funeralFaqs.map((faq) => (
                  <FaqItem key={faq.qKey} qKey={faq.qKey} aKey={faq.aKey} />
                ))}
              </div>
            </div>

            {/* Payment FAQs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('public.faqPaymentSection')}</h2>
              <div className="space-y-3">
                {paymentFaqs.map((faq) => (
                  <FaqItem key={faq.qKey} qKey={faq.qKey} aKey={faq.aKey} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
