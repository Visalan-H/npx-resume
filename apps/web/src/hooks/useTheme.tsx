import { useState, useEffect, useCallback, useContext, createContext } from 'react'
import type { ReactNode } from 'react'

interface ThemeCtx {
    isDark: boolean
    toggle: () => void
}

const ThemeContext = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') !== 'light'
        }
        return true
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggle = useCallback(() => setIsDark((d) => !d), [])

    return <ThemeContext value={{ isDark, toggle }}>{children}</ThemeContext>
}

export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
}
