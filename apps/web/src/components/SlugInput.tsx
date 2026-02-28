import { useState, useEffect, useRef } from 'react'
import { isSlugAvailable } from '../lib/resume'

interface Props {
  isDark: boolean
  value: string
  onChange: (value: string) => void
  currentRowId?: string
}

export default function SlugInput({ isDark, value, onChange, currentRowId }: Props) {
  const [local, setLocal] = useState(value)
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync when parent value changes
  useEffect(() => {
    setLocal(value)
  }, [value])

  const clean = (raw: string) =>
    raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const cleaned = clean(raw)
    setLocal(cleaned)
    onChange(cleaned)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!cleaned.trim()) {
      setStatus('idle')
      return
    }

    setStatus('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(cleaned, currentRowId)
        setStatus(available ? 'available' : 'taken')
      } catch {
        setStatus('idle')
      }
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const statusColor =
    status === 'available'
      ? 'text-green-400'
      : status === 'taken'
      ? 'text-red-400'
      : status === 'checking'
      ? isDark ? 'text-zinc-500' : 'text-zinc-400'
      : ''

  const statusText =
    status === 'available'
      ? '\u2713 available'
      : status === 'taken'
      ? '\u2717 taken'
      : status === 'checking'
      ? 'checking...'
      : ''

  const borderColor =
    status === 'available'
      ? 'border-green-500/60'
      : status === 'taken'
      ? 'border-red-500/60'
      : isDark
      ? 'border-zinc-700 focus-within:border-amber-500'
      : 'border-zinc-300 focus-within:border-amber-500'

  return (
    <div className="space-y-2">
      <label
        className={`block text-xs tracking-wider uppercase ${
          isDark ? 'text-zinc-500' : 'text-zinc-400'
        }`}
      >
        pick your slug
      </label>
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-2 border px-4 py-3 transition-colors ${borderColor} ${
          isDark ? 'bg-zinc-900/50' : 'bg-zinc-50'
        }`}
      >
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-amber-500 text-sm">$</span>
          <span className={`text-sm whitespace-nowrap ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            npx npx-resume
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="text"
            value={local}
            onChange={handleChange}
            placeholder="yourname"
            spellCheck={false}
            autoFocus
            className={`bg-transparent text-sm font-mono flex-1 outline-none min-w-0 ${
              isDark ? 'text-zinc-100 placeholder-zinc-600' : 'text-zinc-900 placeholder-zinc-400'
            }`}
          />
          {statusText && (
            <span className={`text-xs tracking-wider whitespace-nowrap ${statusColor}`}>
              {statusText}
            </span>
          )}
        </div>
      </div>
      {status === 'taken' && (
        <p className="text-xs text-red-400">
          That slug is already taken. Try another.
        </p>
      )}
    </div>
  )
}
