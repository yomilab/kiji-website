import { useEffect, useMemo, useRef, useState } from 'react';
import type { DownloadOption, LocalizedText } from '../../i18n/types';
import {
  DOWNLOAD_MANIFEST_URL,
  detectRecommendedDownload,
  downloadOptionsFromManifest,
  type ReleaseManifest,
} from '../../lib/release';

interface DownloadPanelProps {
  initialManifest: ReleaseManifest;
  text: LocalizedText['download'];
  optionText: LocalizedText['downloadOptions'];
}

const getLocalizedDownloadOption = (
  option: DownloadOption,
  optionText: LocalizedText['downloadOptions']
): Pick<DownloadOption, 'label' | 'detail'> => (
  optionText[option.id] ?? { label: option.label, detail: option.detail }
);

const DownloadIcon = () => (
  <svg className="download-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 3v9.5M6 9l4 4 4-4M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg className="download-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function DownloadPanel({ initialManifest, text, optionText }: DownloadPanelProps) {
  const [manifest, setManifest] = useState<ReleaseManifest>(initialManifest);
  const downloadMenuRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadManifest = async (): Promise<void> => {
      try {
        const response = await fetch(DOWNLOAD_MANIFEST_URL, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Release manifest request failed with ${response.status}`);
        }

        const nextManifest = (await response.json()) as ReleaseManifest;
        if (downloadOptionsFromManifest(nextManifest).length === 0) {
          throw new Error('Release manifest did not include download options');
        }
        setManifest(nextManifest);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('Using bundled Yomi Reader release manifest fallback.', error);
        }
      }
    };

    void loadManifest();

    return () => {
      controller.abort();
    };
  }, []);

  const closeMenu = (): void => {
    downloadMenuRef.current?.removeAttribute('open');
  };

  // Close the platform menu on Escape or a click outside it.
  useEffect(() => {
    const onPointerDown = (event: PointerEvent): void => {
      const menu = downloadMenuRef.current;
      if (menu?.open && !menu.contains(event.target as Node)) {
        closeMenu();
      }
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      const menu = downloadMenuRef.current;
      if (event.key === 'Escape' && menu?.open) {
        closeMenu();
        menu.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const downloadOptions = useMemo(() => downloadOptionsFromManifest(manifest), [manifest]);
  const recommendedDownload = useMemo(
    () => (downloadOptions.length > 0 ? detectRecommendedDownload(downloadOptions) : undefined),
    [downloadOptions]
  );
  const [selectedDownloadId, setSelectedDownloadId] = useState<string | null>(null);
  const selectedDownload = recommendedDownload
    ? downloadOptions.find((option) => option.id === selectedDownloadId) ?? recommendedDownload
    : undefined;

  useEffect(() => {
    if (recommendedDownload && (!selectedDownloadId || !downloadOptions.some((option) => option.id === selectedDownloadId))) {
      setSelectedDownloadId(recommendedDownload.id);
    }
  }, [downloadOptions, recommendedDownload, selectedDownloadId]);

  if (!selectedDownload) {
    return null;
  }

  const selectedDownloadText = getLocalizedDownloadOption(selectedDownload, optionText);

  return (
    <div className="download-panel">
      <div className="split-download" role="group" aria-label={text.panelAria}>
        <a className="download-primary" href={selectedDownload.url}>
          <DownloadIcon />
          <span className="download-text">
            <strong>{text.primaryLabel.replace('{platform}', selectedDownloadText.label)}</strong>
            <span>Yomi Reader {selectedDownload.version} · {selectedDownload.fileType}</span>
          </span>
        </a>
        <details className="download-menu" ref={downloadMenuRef}>
          <summary aria-label={text.chooseAria}>
            <ChevronIcon />
          </summary>
          <div className="download-options">
            {downloadOptions.map((option) => {
              const localized = getLocalizedDownloadOption(option, optionText);
              return (
                <button
                  key={option.id}
                  type="button"
                  className={option.id === selectedDownload.id ? 'download-option active' : 'download-option'}
                  aria-pressed={option.id === selectedDownload.id}
                  onClick={() => {
                    setSelectedDownloadId(option.id);
                    closeMenu();
                  }}
                >
                  <span>{localized.label}</span>
                  <small>Yomi Reader {option.version} · {option.fileType} · {localized.detail}</small>
                </button>
              );
            })}
          </div>
        </details>
      </div>
      <p className="muted download-note">
        {text.directUrl} <a href={selectedDownload.url}>{selectedDownload.url}</a>
      </p>
    </div>
  );
}
