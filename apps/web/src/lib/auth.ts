import { OAuthProvider } from 'appwrite'
import { account } from './appwrite'

export function loginWithGitHub() {
    account.createOAuth2Session({
        provider: OAuthProvider.Github,
        success: `${window.location.origin}/dashboard`,
        failure: `${window.location.origin}/`
    })
}

export async function logout() {
    await account.deleteSession({ sessionId: 'current' })
}

export async function getUser() {
    try {
        return await account.get()
    } catch {
        return null
    }
}
