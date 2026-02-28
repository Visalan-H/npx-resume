import { useState, useCallback } from 'react'
import { parseResume } from '../lib/api'
import { getMyResume, saveResume, updateResume, deleteResume, isSlugAvailable } from '../lib/resume'

export type DashboardState = 'loading' | 'empty' | 'processing' | 'preview' | 'editing' | 'published'

interface ResumeData {
    rowId?: string
    slug: string
    resumeJSON: string
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
                    resumeJSON: existing.resumeData,
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
                resumeJSON: text,
            }))
            setState('preview')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            setState('empty')
        }
    }, [])

    const publish = useCallback(
        async (slug: string, overrideJSON?: string) => {
            if (!userId || !resume) return
            setError(null)
            if (!slug.trim()) {
                setError('Slug cannot be empty')
                return
            }
            const jsonToPublish = overrideJSON ?? resume.resumeJSON
            try {
                // Pass rowId so we don't flag our own slug as taken
                const available = await isSlugAvailable(slug, resume.rowId)
                if (!available) {
                    setError('Slug is already taken')
                    return
                }
                if (resume.rowId) {
                    // Updating existing resume (include slug in update)
                    await updateResume(resume.rowId, jsonToPublish, slug)
                    setResume({ rowId: resume.rowId, slug, resumeJSON: jsonToPublish })
                } else {
                    // Creating new resume
                    const row = await saveResume(userId, slug, jsonToPublish)
                    setResume({ rowId: row.$id, slug, resumeJSON: jsonToPublish })
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
        setResume((prev) => prev?.rowId ? { rowId: prev.rowId, slug: prev.slug, resumeJSON: '' } : null)
        setError(null)
        setState('empty')
    }, [])

    const startEditing = useCallback(() => {
        setState('editing')
    }, [])

    const updateResumeJSON = useCallback((json: string) => {
        setResume((prev) => prev ? { ...prev, resumeJSON: json } : null)
    }, [])

    const remove = useCallback(async () => {
        if (!resume?.rowId) return
        setError(null)
        try {
            await deleteResume(resume.rowId)
            setResume(null)
            setState('empty')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed')
        }
    }, [resume?.rowId])

    return { state, setState, resume, error, fetchExisting, uploadFile, publish, reset, startEditing, updateResumeJSON, remove }
}
