import { useState, useRef, useEffect } from 'react'

// ── Types ──

type ContactItem = { label: string; url?: string; value?: string }
type EntryItem = { title: string; org?: string; date?: string; url?: string; bullets?: string[] }

type Section =
  | { heading: string; type: 'contact'; items: ContactItem[] }
  | { heading: string; type: 'tags'; items: string[] }
  | { heading: string; type: 'entries'; items: EntryItem[] }
  | { heading: string; type: 'text'; content: string }
  | { heading: string; type: 'list'; items: string[] }

type ResumeData = { name: string; title: string; sections: Section[] }

// ── Shared styles ──

const inputBase = (isDark: boolean) =>
  `bg-transparent border-b font-mono text-sm focus:outline-none transition-colors ${
    isDark
      ? 'text-zinc-200 border-zinc-700 focus:border-amber-400 placeholder:text-zinc-700'
      : 'text-zinc-800 border-zinc-300 focus:border-amber-500 placeholder:text-zinc-300'
  }`

const removeBtn = (isDark: boolean) =>
  `text-[10px] font-mono shrink-0 transition-colors cursor-pointer ${
    isDark ? 'text-zinc-600 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'
  }`

const addBtn = (isDark: boolean) =>
  `text-[11px] font-mono tracking-wider transition-colors cursor-pointer ${
    isDark ? 'text-zinc-600 hover:text-amber-400' : 'text-zinc-400 hover:text-amber-500'
  }`

// ── Auto-resize textarea ──

function AutoTextarea({ value, onChange, isDark, placeholder }: {
  value: string; onChange: (v: string) => void; isDark: boolean; placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className={`${inputBase(isDark)} w-full resize-none overflow-hidden`}
    />
  )
}

// ── Section heading ──

function SectionHeading({ text, isDark, onChange }: { text: string; isDark: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <input
        value={text}
        onChange={(e) => onChange(e.target.value)}
        className={`text-xs font-bold uppercase tracking-widest text-amber-500 bg-transparent border-none focus:outline-none w-full ${
          isDark ? 'placeholder:text-amber-900' : 'placeholder:text-amber-200'
        }`}
        placeholder="Section heading"
      />
      <div className={`mt-1 h-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
    </div>
  )
}

// ── Contact editor ──

function ContactEditor({ items, isDark, onChange }: {
  items: ContactItem[]; isDark: boolean; onChange: (items: ContactItem[]) => void
}) {
  const update = (i: number, patch: Partial<ContactItem>) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))
  const add = () => onChange([...items, { label: '', url: '' }])

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const hasUrl = item.url !== undefined && item.url !== null
        const hasValue = item.value !== undefined && item.value !== null && !hasUrl

        return (
          <div key={i} className={`space-y-1 pl-2 border-l-2 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <div className="flex items-center gap-2">
              <input
                value={item.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="Label"
                className={`${inputBase(isDark)} flex-1 font-bold uppercase`}
              />
              <button onClick={() => remove(i)} className={removeBtn(isDark)}>[ × ]</button>
            </div>
            {(hasUrl || !hasValue) && (
              <input
                value={item.url ?? ''}
                onChange={(e) => update(i, { url: e.target.value })}
                placeholder="https://... or mailto:..."
                className={`${inputBase(isDark)} w-full text-amber-500`}
              />
            )}
            {hasValue && (
              <input
                value={item.value ?? ''}
                onChange={(e) => update(i, { value: e.target.value })}
                placeholder="Phone or plain text"
                className={`${inputBase(isDark)} w-full`}
              />
            )}
          </div>
        )
      })}
      <button onClick={add} className={addBtn(isDark)}>[ + add contact ]</button>
    </div>
  )
}

// ── Tags editor ──

function TagsEditor({ items, isDark, onChange }: {
  items: string[]; isDark: boolean; onChange: (items: string[]) => void
}) {
  const [newTag, setNewTag] = useState('')
  const update = (i: number, v: string) => {
    const next = [...items]
    next[i] = v
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))
  const add = () => {
    if (newTag.trim()) {
      onChange([...items, newTag.trim()])
      setNewTag('')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((tag, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border ${
              isDark
                ? 'border-zinc-800 text-zinc-300 bg-zinc-900/50'
                : 'border-zinc-200 text-zinc-600 bg-zinc-50'
            }`}
          >
            <input
              value={tag}
              onChange={(e) => update(i, e.target.value)}
              className={`bg-transparent border-none focus:outline-none w-auto font-mono text-xs ${
                isDark ? 'text-zinc-300' : 'text-zinc-600'
              }`}
              style={{ width: Math.max(tag.length * 7.5, 30) + 'px' }}
            />
            <button onClick={() => remove(i)} className={`${removeBtn(isDark)} text-[9px]`}>×</button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="new tag…"
          className={`${inputBase(isDark)} w-40 shrink-0`}
        />
        <button onClick={add} className={addBtn(isDark)}>[ + ]</button>
      </div>
    </div>
  )
}

// ── Entries editor ──

function EntriesEditor({ items, isDark, onChange }: {
  items: EntryItem[]; isDark: boolean; onChange: (items: EntryItem[]) => void
}) {
  const update = (i: number, patch: Partial<EntryItem>) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  const updateBullet = (entryIdx: number, bulletIdx: number, v: string) => {
    const next = [...items]
    const bullets = [...(next[entryIdx].bullets ?? [])]
    bullets[bulletIdx] = v
    next[entryIdx] = { ...next[entryIdx], bullets }
    onChange(next)
  }
  const removeBullet = (entryIdx: number, bulletIdx: number) => {
    const next = [...items]
    next[entryIdx] = {
      ...next[entryIdx],
      bullets: (next[entryIdx].bullets ?? []).filter((_, j) => j !== bulletIdx),
    }
    onChange(next)
  }
  const addBullet = (entryIdx: number) => {
    const next = [...items]
    next[entryIdx] = {
      ...next[entryIdx],
      bullets: [...(next[entryIdx].bullets ?? []), ''],
    }
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))
  const add = () => onChange([...items, { title: '', org: '', date: '', url: '', bullets: [] }])

  return (
    <div className="space-y-5">
      {items.map((entry, i) => (
        <div key={i} className={`space-y-2 pl-2 border-l-2 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-2">
            <input
              value={entry.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Title / Role"
              className={`${inputBase(isDark)} flex-1 font-bold`}
            />
            <button onClick={() => remove(i)} className={removeBtn(isDark)}>[ × remove ]</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <span className={`text-xs shrink-0 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>at</span>
              <input
                value={entry.org ?? ''}
                onChange={(e) => update(i, { org: e.target.value || undefined })}
                placeholder="Organization"
                className={`${inputBase(isDark)} flex-1 min-w-0`}
              />
            </div>
            <div className="flex items-center gap-1 sm:w-40 shrink-0">
              <span className={`text-xs shrink-0 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>(</span>
              <input
                value={entry.date ?? ''}
                onChange={(e) => update(i, { date: e.target.value || undefined })}
                placeholder="Date range"
                className={`${inputBase(isDark)} flex-1 min-w-0 text-center sm:text-left`}
              />
              <span className={`text-xs shrink-0 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>)</span>
            </div>
          </div>
          <input
            value={entry.url ?? ''}
            onChange={(e) => update(i, { url: e.target.value || undefined })}
            placeholder="URL (optional)"
            className={`${inputBase(isDark)} w-full text-amber-500`}
          />
          {/* Bullets */}
          <div className="space-y-1 pl-2">
            {(entry.bullets ?? []).map((b, j) => (
              <div key={j} className="flex items-start gap-1.5">
                <span className={`text-xs mt-1.5 shrink-0 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>·</span>
                <input
                  value={b}
                  onChange={(e) => updateBullet(i, j, e.target.value)}
                  placeholder="Bullet point"
                  className={`${inputBase(isDark)} flex-1 text-xs`}
                />
                <button onClick={() => removeBullet(i, j)} className={removeBtn(isDark)}>×</button>
              </div>
            ))}
            <button onClick={() => addBullet(i)} className={addBtn(isDark)}>[ + bullet ]</button>
          </div>
        </div>
      ))}
      <button onClick={add} className={addBtn(isDark)}>[ + add entry ]</button>
    </div>
  )
}

// ── Text editor ──

function TextEditor({ content, isDark, onChange }: {
  content: string; isDark: boolean; onChange: (v: string) => void
}) {
  return <AutoTextarea value={content} onChange={onChange} isDark={isDark} placeholder="Paragraph text…" />
}

// ── List editor ──

function ListEditor({ items, isDark, onChange }: {
  items: string[]; isDark: boolean; onChange: (items: string[]) => void
}) {
  const update = (i: number, v: string) => {
    const next = [...items]
    next[i] = v
    onChange(next)
  }
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))
  const add = () => onChange([...items, ''])

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-amber-500/60 shrink-0 text-xs">▸</span>
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder="List item"
            className={`${inputBase(isDark)} flex-1 text-xs`}
          />
          <button onClick={() => remove(i)} className={removeBtn(isDark)}>×</button>
        </div>
      ))}
      <button onClick={add} className={addBtn(isDark)}>[ + add item ]</button>
    </div>
  )
}

// ── Section editor dispatcher ──

function SectionEditor({ section, isDark, onChange }: {
  section: Section; isDark: boolean; onChange: (s: Section) => void
}) {
  const updateHeading = (heading: string) => onChange({ ...section, heading })

  return (
    <div className="space-y-2">
      <SectionHeading text={section.heading} isDark={isDark} onChange={updateHeading} />
      {section.type === 'contact' && (
        <ContactEditor items={section.items} isDark={isDark} onChange={(items) => onChange({ ...section, items })} />
      )}
      {section.type === 'tags' && (
        <TagsEditor items={section.items} isDark={isDark} onChange={(items) => onChange({ ...section, items })} />
      )}
      {section.type === 'entries' && (
        <EntriesEditor items={section.items} isDark={isDark} onChange={(items) => onChange({ ...section, items })} />
      )}
      {section.type === 'text' && (
        <TextEditor content={section.content} isDark={isDark} onChange={(content) => onChange({ ...section, content })} />
      )}
      {section.type === 'list' && (
        <ListEditor items={section.items} isDark={isDark} onChange={(items) => onChange({ ...section, items })} />
      )}
    </div>
  )
}

// ── Main editor component ──

interface Props {
  isDark: boolean
  resumeJSON: string
  onSave: (updatedJSON: string) => void
  onSkip: () => void
}

export default function ResumeEditor({ isDark, resumeJSON, onSave, onSkip }: Props) {
  const [data, setData] = useState<ResumeData | null>(() => {
    try { return JSON.parse(resumeJSON) } catch { return null }
  })

  if (!data) {
    return <div className="text-red-400 font-mono text-sm p-4">Invalid resume data — cannot edit</div>
  }

  const updateSection = (i: number, section: Section) => {
    const next = { ...data, sections: [...data.sections] }
    next.sections[i] = section
    setData(next)
  }

  const btnClass = (isDark: boolean) =>
    `w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 border transition-all duration-150 active:scale-[0.97] whitespace-nowrap ${
      isDark
        ? 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800/50'
        : 'border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100'
    }`

  return (
    <div className="space-y-8">
      {/* Header fields */}
      <div className="space-y-2">
        <input
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder="Full name"
          className={`${inputBase(isDark)} w-full text-xl font-bold`}
        />
        <input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Job title / headline"
          className={`${inputBase(isDark)} w-full text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
        />
      </div>

      {/* Editable sections */}
      {data.sections.map((section, i) => (
        <SectionEditor key={i} section={section} isDark={isDark} onChange={(s) => updateSection(i, s)} />
      ))}

      {/* Actions */}
      <div className={`border-t pt-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <button
            onClick={() => onSave(JSON.stringify(data))}
            className={`w-full sm:w-auto text-center text-xs tracking-wider px-5 py-2.5 font-bold transition-all duration-150 active:scale-[0.97] cursor-pointer bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)] whitespace-nowrap`}
          >
            [ save & continue ]
          </button>
          <button onClick={onSkip} className={btnClass(isDark)}>
            [ skip & publish ]
          </button>
        </div>
      </div>
    </div>
  )
}
