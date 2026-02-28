import { OAuthProvider } from 'appwrite'
import { account } from './appwrite'

export function loginWithGitHub() {
    account.createOAuth2Session(
        OAuthProvider.Github,
        `${window.location.origin}/dashboard`,
        `${window.location.origin}/`
    )
}

export async function logout() {
    await account.deleteSession('current')
}

export async function getUser() {
    try {
        return await account.get()
    } catch {
        return null
    }
}
