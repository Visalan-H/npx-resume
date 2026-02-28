import ReactMarkdown from 'react-markdown'
import SlugInput from './SlugInput'

interface Props {
  isDark: boolean
  markdown: string
  slug: string
  onSlugChange: (slug: string) => void
  onPublish: () => void
  onReUpload: () => void
  error: string | null
  currentRowId?: string
}

export default function ResumePreview({
  isDark,
  markdown,
  slug,
  onSlugChange,
  onPublish,
  onReUpload,
  error,
  currentRowId,
}: Props) {
  const slugValid = slug.trim().length > 0

  return (
    <div className="space-y-8">
      {/* Markdown preview */}
      <div
        className={`prose max-w-none ${isDark ? 'prose-invert' : ''} p-0`}
      >
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>

      {/* Divider */}
      <div className={`border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`} />

      {/* Slug editor */}
      <SlugInput isDark={isDark} value={slug} onChange={onSlugChange} currentRowId={currentRowId} />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onPublish}
          disabled={!slugValid}
          className={`text-xs tracking-wider px-5 py-2.5 font-bold transition-all duration-150 ${
            slugValid
              ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-[0.97] cursor-pointer'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
          }`}
        >
          [ looks good — publish ]
        </button>
        <button
          onClick={onReUpload}
          className={`text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] ${
            isDark
              ? 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/50'
              : 'border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100'
          }`}
        >
          [ re-upload ]
        </button>
      </div>
    </div>
  )
}
