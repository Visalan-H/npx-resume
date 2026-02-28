import { useState } from 'react'

interface Props {
  isDark: boolean
  slug: string
  onEditJSON: () => void
  onReUpload: () => void
  onDelete: () => void
}

export default function NpxCommand({ isDark, slug, onEditJSON, onReUpload, onDelete }: Props) {
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const command = `npx showresume ${slug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    onDelete()
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

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 bg-amber-500 text-black font-bold hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          {copied ? '[ copied! ]' : '[ copy command ]'}
        </button>
        <button
          onClick={onEditJSON}
          className={`w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap ${
            isDark
              ? 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/50'
              : 'border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100'
          }`}
        >
          [ edit resume ]
        </button>
        <button
          onClick={onReUpload}
          className={`w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap ${
            isDark
              ? 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/50'
              : 'border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100'
          }`}
        >
          [ re-upload ]
        </button>
        <button
          onClick={handleDelete}
          className={`w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] cursor-pointer whitespace-nowrap ${
            confirming
              ? 'border-red-500 text-red-400 hover:bg-red-500/10'
              : isDark
                ? 'border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-500/50'
                : 'border-zinc-300 text-zinc-400 hover:text-red-500 hover:border-red-400'
          }`}
        >
          {confirming ? '[ confirm delete? ]' : '[ delete ]'}
        </button>
      </div>
    </div>
  )
}
