import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/lib/i18n'

type Theme = 'light' | 'dark' | 'system'
type Language = 'en' | 'ur'

interface AppState {
  theme: Theme
  language: Language
  sidebarOpen: boolean
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Language) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

function applyLanguage(lang: Language) {
  document.documentElement.setAttribute('lang', lang)
  document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr')
  localStorage.setItem('lang', lang)
  i18n.changeLanguage(lang)
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'en',
      sidebarOpen: true,
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      setLanguage: (language) => {
        applyLanguage(language)
        set({ language })
      },
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'janaza-app-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
          applyLanguage(state.language)
        }
      },
    },
  ),
)
