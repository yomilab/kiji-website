/**
 * Apps on 1.9 read /release.json and can't be changed. For them the Mac downloads
 * are the transition disk images, whose bundle is still named KiJi.app, so
 * dragging it in replaces their copy. Everything else reads /release-current.json.
 */
export const splitReleaseManifest = (manifest) => {
  const { legacyMacDownloads = [], ...current } = manifest;
  const legacyById = new Map(legacyMacDownloads.map((download) => [download.id, download]));
  const legacy = {
    ...current,
    downloadOptions: (current.downloadOptions ?? []).map((option) => {
      const download = legacyById.get(option.id);
      return download
        ? { ...option, fileName: download.fileName, url: download.url, size: download.size }
        : option;
    }),
  };
  return { current, legacy };
};
