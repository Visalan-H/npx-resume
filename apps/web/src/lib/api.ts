import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_PARSE_API_URL,
})

export async function parseResume(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('resume', file)

    const { data } = await api.post('/api/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (!data.success) {
        throw new Error(data.error || 'Failed to parse resume')
    }

    return data.text
}
