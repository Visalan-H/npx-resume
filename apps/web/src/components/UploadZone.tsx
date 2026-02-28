import { useRef, useState, useCallback } from 'react'

interface Props {
  isDark: boolean
  onFile: (file: File) => void
}

export default function UploadZone({ isDark, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type === 'application/pdf') onFile(file)
    },
    [onFile]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center gap-4 py-10 sm:py-16 px-4 border-2 border-dashed transition-colors cursor-pointer ${
        dragOver
          ? 'border-amber-500 bg-amber-500/5'
          : isDark
          ? 'border-zinc-700 hover:border-amber-500'
          : 'border-zinc-300 hover:border-amber-500'
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
        drag &amp; drop your resume PDF here
      </p>
      <button
        type="button"
        className={`text-xs tracking-wider px-4 py-2 border ${
          isDark
            ? 'border-zinc-700 text-zinc-300 hover:border-amber-500 hover:text-amber-500'
            : 'border-zinc-300 text-zinc-600 hover:border-amber-500 hover:text-amber-500'
        }`}
      >
        [ browse file ]
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}
