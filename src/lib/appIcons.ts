// Every app icon KiJi offers in Settings → App icon, in the app's order. The PNGs are copied
// from kiji-app by scripts/make-site-icons.mjs (keep its APP_ICONS in sync).
export interface AppIcon {
  id: string;
  label: string;
  isDefault?: boolean;
}

export const APP_ICONS: AppIcon[] = [
  { id: 'ripple', label: 'Ripple', isDefault: true },
  { id: 'ripple-dark', label: 'Ripple Dark' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'circle', label: 'Circle' },
  { id: 'circle-dark', label: 'Circle Dark' },
];

export const appIconPath = (id: string) => `/images/app-icons/kiji-icon-${id}.png`;
