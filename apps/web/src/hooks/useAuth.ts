import { useState, useEffect } from 'react'
import { getUser } from '../lib/auth'
import type { Models } from 'appwrite'

export function useAuth() {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getUser()
            .then(setUser)
            .finally(() => setLoading(false))
    }, [])

    return { user, loading }
}
