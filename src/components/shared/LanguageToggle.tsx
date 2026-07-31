import { Check, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/useAppStore'

export function LanguageToggle() {
  const { t } = useTranslation()
  const { language, setLanguage } = useAppStore()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2 font-semibold text-xs"
          title={t('settings.language')}
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs font-bold tracking-wide">
            {language === 'en' ? 'EN' : 'ار'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🇬🇧</span>
            {t('settings.english')}
          </span>
          {language === 'en' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('ur')}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🇵🇰</span>
            {t('settings.urdu')}
          </span>
          {language === 'ur' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
