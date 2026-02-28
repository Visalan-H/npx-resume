import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useResume } from '../hooks/useResume'
import { useTheme } from '../hooks/useTheme'
import NavBar from '../components/NavBar'
import TerminalWindow from '../components/TerminalWindow'
import UploadZone from '../components/UploadZone'
import ProcessingState from '../components/ProcessingState'
import ResumePreview from '../components/ResumePreview'
import NpxCommand from '../components/NpxCommand'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { isDark } = useTheme()

  // Strip Appwrite OAuth hash fragment
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const {
    state,
    resume,
    error,
    fetchExisting,
    uploadFile,
    publish,
    reset,
  } = useResume(user?.$id)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/')
    }
  }, [authLoading, user, navigate])

  // Fetch existing resume on mount
  useEffect(() => {
    if (user) {
      fetchExisting()
    }
  }, [user, fetchExisting])

  const [slug, setSlug] = useState('')

  // Sync slug from existing resume
  useEffect(() => {
    if (resume?.slug) {
      setSlug(resume.slug)
    }
  }, [resume?.slug])

  if (authLoading || state === 'loading') {
    return (
      <div className="h-dvh flex flex-col overflow-hidden">
        <NavBar showLogout />
        <div className="flex-1 flex items-center justify-center">
          <span
            className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
          >
            loading...
          </span>
        </div>
      </div>
    )
  }

  const terminalTitle =
    state === 'empty'
      ? 'drop your resume'
      : state === 'processing'
      ? 'processing...'
      : state === 'preview'
      ? 'resume.md'
      : 'published'

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <NavBar showLogout />

      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-6 sm:py-10 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <TerminalWindow title={terminalTitle} isDark={isDark}>
            {state === 'empty' && (
              <UploadZone isDark={isDark} onFile={uploadFile} />
            )}

            {state === 'processing' && <ProcessingState isDark={isDark} />}

            {state === 'preview' && resume && (
              <ResumePreview
                isDark={isDark}
                markdown={resume.resumeText}
                slug={slug}
                onSlugChange={setSlug}
                onPublish={() => publish(slug)}
                onReUpload={reset}
                error={error}
                currentRowId={resume.rowId}
              />
            )}

            {state === 'published' && resume && (
              <NpxCommand
                isDark={isDark}
                slug={resume.slug}
                onUpdate={reset}
              />
            )}
          </TerminalWindow>

          {error && state === 'empty' && (
            <p className="text-xs text-red-500 mt-4">{error}</p>
          )}
        </div>
      </main>
    </div>
  )
}
