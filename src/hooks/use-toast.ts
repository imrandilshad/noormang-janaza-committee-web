import * as React from 'react'
import type { ToastProps } from '@/components/ui/toast'

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
}

let _toasts: ToasterToast[] = []
let _listeners: Array<React.Dispatch<React.SetStateAction<ToasterToast[]>>> = []
let _count = 0

function _emit() {
  _listeners.forEach((l) => l([..._toasts]))
}

function toast(props: Omit<ToasterToast, 'id'>) {
  const id = String(++_count)
  _toasts = [{ ...props, id, open: true }, ..._toasts].slice(0, 5)
  _emit()
  const close = () => {
    _toasts = _toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
    _emit()
    setTimeout(() => {
      _toasts = _toasts.filter((t) => t.id !== id)
      _emit()
    }, 300)
  }
  setTimeout(close, 4000)
  return id
}

toast.success = (title: string, description?: string) =>
  toast({ variant: 'default', title, description })

toast.error = (title: string, description?: string) =>
  toast({ variant: 'destructive', title, description })

function useToast() {
  const [ts, setTs] = React.useState<ToasterToast[]>(_toasts)
  React.useEffect(() => {
    _listeners.push(setTs)
    return () => {
      _listeners = _listeners.filter((l) => l !== setTs)
    }
  }, [])
  return ts
}

export { toast, useToast }
