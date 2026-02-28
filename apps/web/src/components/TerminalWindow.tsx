import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  isDark: boolean
}

export default function TerminalWindow({ title, children, isDark }: Props) {
  return (
    <div
      className={`w-full rounded-none border ${
        isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'
      }`}
    >
      {/* Title bar */}
      <div
        className={`flex items-center gap-2 px-4 py-3 border-b ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}
      >
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span
          className={`ml-2 text-xs tracking-wider uppercase ${
            isDark ? 'text-zinc-500' : 'text-zinc-400'
          }`}
        >
          {title}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed">{children}</div>
    </div>
  )
}
