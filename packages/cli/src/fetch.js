const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1'
const PROJECT_ID = '69a1af4f000fd06684fa'
const DATABASE_ID = '69a1aff800008a592124'
const TABLE_ID = 'resumes'

const TIMEOUT_MS = 8000

export async function fetchResume(slug) {
    const query = JSON.stringify({
        method: 'equal',
        attribute: 'slug',
        values: [slug]
    })

    const url = new URL(
        `/v1/tablesdb/${DATABASE_ID}/tables/${TABLE_ID}/rows`,
        ENDPOINT
    )
    url.searchParams.append('queries[]', query)

    let res

    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

        res = await fetch(url.toString(), {
            headers: {
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Response-Format': '1.8.0',
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        })

        clearTimeout(timer)
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('request timed out — check your connection and try again')
        }
        throw new Error('could not connect to the server — check your connection and try again')
    }

    if (!res.ok) {
        throw new Error(`server returned an error (${res.status}) — try again later`)
    }

    let data
    try {
        data = await res.json()
    } catch {
        throw new Error('received an invalid response from the server')
    }

    if (!data.rows || data.rows.length === 0) {
        throw new Error(`no resume found for "${slug}" — double-check the username`)
    }

    const resumeData = data.rows[0]?.resumeData

    if (!resumeData || typeof resumeData !== 'string') {
        throw new Error(`resume data for "${slug}" appears to be empty`)
    }

    // strip all ANSI/OSC escape sequences from server data before it touches the terminal
    // prevents terminal injection attacks via malicious resume content
    const safe = resumeData.replace(/\x1b(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1b\\))/g, '')

    return safe
}