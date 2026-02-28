import SlugInput from './SlugInput'

// ── Types ──

type ContactItem = { label: string; url?: string; value?: string }
type EntryItem = { title: string; org?: string; date?: string; url?: string; bullets?: string[] }

type Section =
  | { heading: string; type: 'contact'; items: ContactItem[] }
  | { heading: string; type: 'tags'; items: string[] }
  | { heading: string; type: 'entries'; items: EntryItem[] }
  | { heading: string; type: 'text'; content: string }
  | { heading: string; type: 'list'; items: string[] }

type ResumeSchema = {
  name: string
  title: string
  sections: Section[]
}

// ── Section renderers ──

function SectionHeading({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">{text}</h2>
      <div className={`mt-1 h-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
    </div>
  )
}

function ContactSection({ items, isDark }: { items: ContactItem[]; isDark: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
      {items.map((item, i) => (
        <span key={i}>
          <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.label}</span>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1.5 text-amber-500 hover:underline"
            >
              {item.url.replace(/^mailto:/, '')}
            </a>
          ) : item.value ? (
            <span className={`ml-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.value}</span>
          ) : null}
        </span>
      ))}
    </div>
  )
}

function TagsSection({ items, isDark }: { items: string[]; isDark: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((tag, i) => (
        <span
          key={i}
          className={`px-2 py-0.5 text-xs border ${
            isDark
              ? 'border-zinc-800 text-zinc-300 bg-zinc-900/50'
              : 'border-zinc-200 text-zinc-600 bg-zinc-50'
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

function EntriesSection({ items, isDark }: { items: EntryItem[]; isDark: boolean }) {
  return (
    <div className="space-y-4">
      {items.map((entry, i) => (
        <div key={i} className="space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {entry.title}
            </span>
            {entry.org && (
              <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                at {entry.org}
              </span>
            )}
            {entry.date && (
              <span className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                ({entry.date})
              </span>
            )}
          </div>
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-500 hover:underline block"
            >
              {entry.url}
            </a>
          )}
          {entry.bullets && entry.bullets.length > 0 && (
            <ul className="space-y-0.5 pl-1 pt-1">
              {entry.bullets.map((b, j) => (
                <li key={j} className={`text-xs flex gap-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  <span className="text-zinc-600 shrink-0">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function TextSection({ content, isDark }: { content: string; isDark: boolean }) {
  return (
    <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
      {content}
    </p>
  )
}

function ListSection({ items, isDark }: { items: string[]; isDark: boolean }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className={`text-xs flex gap-2 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
          <span className="text-amber-500/60 shrink-0">▸</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SectionRenderer({ section, isDark }: { section: Section; isDark: boolean }) {
  return (
    <div className="space-y-2">
      <SectionHeading text={section.heading} isDark={isDark} />
      {section.type === 'contact' && <ContactSection items={section.items} isDark={isDark} />}
      {section.type === 'tags' && <TagsSection items={section.items} isDark={isDark} />}
      {section.type === 'entries' && <EntriesSection items={section.items} isDark={isDark} />}
      {section.type === 'text' && <TextSection content={section.content} isDark={isDark} />}
      {section.type === 'list' && <ListSection items={section.items} isDark={isDark} />}
    </div>
  )
}

// ── Main component ──

interface Props {
  isDark: boolean
  resumeJSON: string
  slug: string
  onSlugChange: (slug: string) => void
  onEditAndPublish: () => void
  onSkipToPublish: () => void
  onReUpload: () => void
  error: string | null
  currentRowId?: string
}

export default function ResumePreview({
  isDark,
  resumeJSON,
  slug,
  onSlugChange,
  onEditAndPublish,
  onSkipToPublish,
  onReUpload,
  error,
  currentRowId,
}: Props) {
  let data: ResumeSchema
  try {
    data = JSON.parse(resumeJSON)
  } catch {
    return <div className="text-red-400 font-mono text-sm p-4">Invalid resume data</div>
  }

  const slugValid = slug.trim().length > 0

  return (
    <div className="space-y-8">
      {/* Resume preview */}
      <div className="space-y-5">
        <div>
          <h1 className={`text-xl font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{data.name}</h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{data.title}</p>
        </div>

        {data.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} isDark={isDark} />
        ))}
      </div>

      {/* Divider */}
      <div className={`border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`} />

      {/* Slug editor */}
      <SlugInput isDark={isDark} value={slug} onChange={onSlugChange} currentRowId={currentRowId} />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
        <button
          onClick={onEditAndPublish}
          disabled={!slugValid}
          className={`w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 font-bold transition-all duration-150 whitespace-nowrap ${
            slugValid
              ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] active:scale-[0.97] cursor-pointer'
              : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
          }`}
        >
          [ looks good → edit & publish ]
        </button>
        <button
          onClick={onSkipToPublish}
          disabled={!slugValid}
          className={`w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
            slugValid
              ? isDark
                ? 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 cursor-pointer'
                : 'border-zinc-300 text-zinc-400 hover:text-zinc-600 hover:border-zinc-400 cursor-pointer'
              : isDark
                ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                : 'border-zinc-200 text-zinc-300 cursor-not-allowed'
          }`}
        >
          [ skip → publish ]
        </button>
        <button
          onClick={onReUpload}
          className={`w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
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
