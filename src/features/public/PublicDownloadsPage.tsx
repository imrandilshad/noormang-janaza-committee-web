import { useTranslation } from 'react-i18next'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type DownloadItem = {
  titleKey: string
  descKey: string
  href?: string
  available: boolean
}

const downloads: DownloadItem[] = [
  {
    titleKey: 'public.dlMembershipForm',
    descKey: 'public.dlMembershipFormDesc',
    href: undefined,
    available: false,
  },
  {
    titleKey: 'public.dlRulesBook',
    descKey: 'public.dlRulesBookDesc',
    href: undefined,
    available: false,
  },
  {
    titleKey: 'public.dlAnnualReport',
    descKey: 'public.dlAnnualReportDesc',
    href: undefined,
    available: false,
  },
  {
    titleKey: 'public.dlConstitution',
    descKey: 'public.dlConstitutionDesc',
    href: undefined,
    available: false,
  },
]

export function PublicDownloadsPage() {
  const { t } = useTranslation()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
            <Download className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t('public.downloadsTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('public.downloadsSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {downloads.map((item) => (
              <Card key={item.titleKey}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{t(item.titleKey)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t(item.descKey)}</p>
                      <div className="mt-3">
                        {item.available && item.href ? (
                          <a href={item.href} download>
                            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                              <Download className="h-3.5 w-3.5" />
                              {t('common.download')}
                            </Button>
                          </a>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {t('public.comingSoon')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
