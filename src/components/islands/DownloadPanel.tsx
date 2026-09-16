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
          console.warn('Using bundled KiJi release manifest fallback.', error);
        }
      }
    };

    void loadManifest();

    return () => {
      controller.abort();
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
      <div className="split-download" aria-label={text.panelAria}>
        <a className="download-primary" href={selectedDownload.url}>
          <span className="download-kicker">{text.kicker}</span>
          <strong>{selectedDownloadText.label}</strong>
          <span>KiJi {selectedDownload.version} · {selectedDownload.fileType}</span>
        </a>
        <details className="download-menu" ref={downloadMenuRef}>
          <summary aria-label={text.chooseAria}>⌄</summary>
          <div className="download-options">
            {downloadOptions.map((option) => {
              const localized = getLocalizedDownloadOption(option, optionText);
              return (
                <button
                  key={option.id}
                  type="button"
                  className={option.id === selectedDownload.id ? 'download-option active' : 'download-option'}
                  onClick={(event) => {
                    setSelectedDownloadId(option.id);
                    event.currentTarget.closest('details')?.removeAttribute('open');
                  }}
                >
                  <span>{localized.label}</span>
                  <small>KiJi {option.version} · {option.fileType} · {localized.detail}</small>
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
