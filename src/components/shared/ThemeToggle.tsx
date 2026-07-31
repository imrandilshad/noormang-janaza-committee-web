import { Check, Moon, Sun, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/store/useAppStore'

export function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, setTheme } = useAppStore()

  const themeLabel =
    theme === 'dark'
      ? t('settings.darkMode')
      : theme === 'light'
        ? t('settings.lightMode')
        : t('settings.systemMode')

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title={themeLabel}>
          {theme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : theme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
          <span className="sr-only">{themeLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            {t('settings.lightMode')}
          </span>
          {theme === 'light' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            {t('settings.darkMode')}
          </span>
          {theme === 'dark' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            {t('settings.systemMode')}
          </span>
          {theme === 'system' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
