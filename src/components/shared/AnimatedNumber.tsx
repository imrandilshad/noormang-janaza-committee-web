import { useCountUp } from '@/hooks/useCountUp'

interface Props {
  value: number
  /** Optional formatter — receives the animated count, returns display string */
  format?: (n: number) => string
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, format, duration, className }: Props) {
  const count = useCountUp(value, duration)
  const display = format ? format(count) : count.toLocaleString()
  return <span className={className}>{display}</span>
}
