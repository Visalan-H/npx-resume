import { useState, useCallback } from 'react'
import { parseResume } from '../lib/api'
import { getMyResume, saveResume, updateResume, isSlugAvailable } from '../lib/resume'

export type DashboardState = 'loading' | 'empty' | 'processing' | 'preview' | 'published'

interface ResumeData {
    rowId?: string
    slug: string
    resumeText: string
}

export function useResume(userId: string | undefined) {
    const [state, setState] = useState<DashboardState>('loading')
    const [resume, setResume] = useState<ResumeData | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchExisting = useCallback(async () => {
        if (!userId) return
        setState('loading')
        try {
            const existing = await getMyResume(userId)
            if (existing) {
                setResume({
                    rowId: existing.$id,
                    slug: existing.slug,
                    resumeText: existing.resumeText,
                })
                setState('published')
            } else {
                setState('empty')
            }
        } catch {
            setState('empty')
        }
    }, [userId])

    const uploadFile = useCallback(async (file: File) => {
        setError(null)
        setState('processing')
        try {
            const text = await parseResume(file)
            setResume((prev) => ({
                rowId: prev?.rowId,
                slug: prev?.slug ?? '',
                resumeText: text,
            }))
            setState('preview')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            setState('empty')
        }
    }, [])

    const publish = useCallback(
        async (slug: string) => {
            if (!userId || !resume) return
            setError(null)
            if (!slug.trim()) {
                setError('Slug cannot be empty')
                return
            }
            try {
                // Pass rowId so we don't flag our own slug as taken
                const available = await isSlugAvailable(slug, resume.rowId)
                if (!available) {
                    setError('Slug is already taken')
                    return
                }
                if (resume.rowId) {
                    // Updating existing resume
                    await updateResume(resume.rowId, resume.resumeText)
                    setResume({ rowId: resume.rowId, slug, resumeText: resume.resumeText })
                } else {
                    // Creating new resume
                    const row = await saveResume(userId, slug, resume.resumeText)
                    setResume({ rowId: row.$id, slug, resumeText: resume.resumeText })
                }
                setState('published')
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Publish failed')
            }
        },
        [userId, resume]
    )

    const reset = useCallback(() => {
        // Keep rowId so updates work correctly
        setResume((prev) => prev?.rowId ? { rowId: prev.rowId, slug: prev.slug, resumeText: '' } : null)
        setError(null)
        setState('empty')
    }, [])

    return { state, resume, error, fetchExisting, uploadFile, publish, reset }
}
