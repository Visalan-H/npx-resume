import { Query, ID, Permission, Role } from 'appwrite'
import { tablesDB } from './appwrite'

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID

export async function getMyResume(userId: string) {
    const result = await tablesDB.listRows({
        databaseId: DB_ID,
        tableId: TABLE_ID,
        queries: [Query.equal('userId', userId)],
    })
    return result.rows[0] ?? null
}

export async function isSlugAvailable(slug: string, excludeRowId?: string): Promise<boolean> {
    const result = await tablesDB.listRows({
        databaseId: DB_ID,
        tableId: TABLE_ID,
        queries: [Query.equal('slug', slug)],
    })
    if (result.rows.length === 0) return true
    // If the only match is the user's own row, it's still available
    if (excludeRowId && result.rows.length === 1 && result.rows[0].$id === excludeRowId) return true
    return false
}

export async function saveResume(
    userId: string,
    slug: string,
    resumeText: string
) {
    return tablesDB.createRow({
        databaseId: DB_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: { userId, slug, resumeText },
        permissions: [
            Permission.read(Role.any()),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
        ],
    })
}

export async function updateResume(rowId: string, resumeText: string) {
    return tablesDB.updateRow({
        databaseId: DB_ID,
        tableId: TABLE_ID,
        rowId,
        data: { resumeText },
    })
}
