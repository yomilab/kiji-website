// Bump when the icon files in public/ change (scripts/make-site-icons.mjs): the new query
// string makes browsers and the CDN fetch them again instead of serving cached copies.
export const ICON_VERSION = 'circle-2026-10-29';

export const iconUrl = (path: string) => `${path}?v=${ICON_VERSION}`;
