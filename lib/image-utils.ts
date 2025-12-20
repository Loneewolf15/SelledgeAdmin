import { api } from './api'

/**
 * Constructs a proper image URL ensuring /public is included
 */
export function getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith('http')) return imagePath

    // Logic: ensure base URL doesn't have /public (strip it if it does)
    // then append /public explicitly.
    // This handles both cases where API_BASE_URL has /public or not.
    const baseUrl = api.API_BASE_URL ? api.API_BASE_URL.replace(/\/public\/?$/, '') : ''

    // Remove leading slash from imagePath
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath

    return `${baseUrl}/public/${cleanPath}`
}
