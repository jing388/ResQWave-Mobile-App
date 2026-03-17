type DeferredAction = () => void;

type MapStyleSheetCloser = (afterClose?: DeferredAction) => boolean;

let registeredCloser: MapStyleSheetCloser | null = null;

export function registerMapStyleSheetCloser(closer: MapStyleSheetCloser) {
  registeredCloser = closer;

  return () => {
    if (registeredCloser === closer) {
      registeredCloser = null;
    }
  };
}

export function closeMapStyleSheetIfOpen(afterClose?: DeferredAction) {
  if (!registeredCloser) {
    afterClose?.();
    return false;
  }

  return registeredCloser(afterClose);
}