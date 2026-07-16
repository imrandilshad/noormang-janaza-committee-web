import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scrolls window to top whenever the route pathname changes */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}
