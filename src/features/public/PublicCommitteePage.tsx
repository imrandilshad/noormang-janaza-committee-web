import { useTranslation } from 'react-i18next'
import { Users, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type CommitteeMember = {
  name: string
  designation: string
  designationKey: string
  phone?: string
}

// Update this list with actual committee members
const committeeMembers: CommitteeMember[] = [
  { name: 'Muhammad Aslam', designation: 'President / Chairman', designationKey: 'public.rolePresident' },
  { name: 'Muhammad Nawaz', designation: 'Vice President', designationKey: 'public.roleVicePresident' },
  { name: 'Muhammad Akram', designation: 'General Secretary', designationKey: 'public.roleSecretary' },
  { name: 'Muhammad Ashraf', designation: 'Finance Secretary', designationKey: 'public.roleFinance' },
  { name: 'Muhammad Latif', designation: 'Member', designationKey: 'public.roleMember' },
  { name: 'Muhammad Yaqoob', designation: 'Member', designationKey: 'public.roleMember' },
]

export function PublicCommitteePage() {
  const { t } = useTranslation()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {t('public.committeeTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('public.committeeSubtitle')}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {committeeMembers.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold">{member.name}</p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {t(member.designationKey)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            {t('public.committeeNote')}
          </p>
        </div>
      </section>
    </div>
  )
}
