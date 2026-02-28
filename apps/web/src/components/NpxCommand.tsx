import { useState } from 'react'

interface Props {
  isDark: boolean
  slug: string
  onUpdate: () => void
}

export default function NpxCommand({ isDark, slug, onUpdate }: Props) {
  const [copied, setCopied] = useState(false)
  const command = `npx npx-resume ${slug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <p
        className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
      >
        &gt; resume published successfully.
      </p>

      <div
        className={`inline-block px-4 py-2 text-sm ${
          isDark ? 'bg-amber-500/10' : 'bg-amber-500/10'
        }`}
      >
        <span className="text-amber-500">$ </span>
        <span className={isDark ? 'text-zinc-100' : 'text-zinc-900'}>
          {command}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopy}
          className="text-xs tracking-wider px-5 py-2.5 bg-amber-500 text-black font-bold hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-150 active:scale-[0.97]"
        >
          {copied ? '[ copied! ]' : '[ copy command ]'}
        </button>
        <button
          onClick={onUpdate}
          className={`text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] ${
            isDark
              ? 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/50'
              : 'border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100'
          }`}
        >
          [ update resume ]
        </button>
      </div>
    </div>
  )
}
