import { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export function Header() {
  const { t } = useTranslation()
  const { toggleSidebar } = useAppStore()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const email = session?.user?.email ?? ''
  const initials = email
    ? email.slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuPrimitive.Trigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none">
                {initials}
              </div>
            </Button>
          </DropdownMenuPrimitive.Trigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-60">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold select-none">
                {initials}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold leading-tight">{t('auth.administrator')}</span>
                <span className="truncate text-xs text-muted-foreground leading-snug">{email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t('menu.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
