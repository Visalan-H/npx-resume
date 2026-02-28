import { useState, useEffect } from 'react'

interface Props {
  isDark: boolean
}

const lines = [
  '> reading PDF...',
  '> extracting text...',
  '> formatting with AI...',
]

export default function ProcessingState({ isDark }: Props) {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (visible < lines.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), 800)
      return () => clearTimeout(t)
    }
  }, [visible])

  return (
    <div className="space-y-2">
      {lines.slice(0, visible).map((line, i) => (
        <p
          key={i}
          className={`text-sm animate-fade-in-up ${
            isDark ? 'text-zinc-300' : 'text-zinc-700'
          }`}
        >
          {line}
        </p>
      ))}
      {visible <= lines.length && (
        <span className="inline-block w-2 h-4 bg-amber-500 animate-blink" />
      )}
    </div>
  )
}
