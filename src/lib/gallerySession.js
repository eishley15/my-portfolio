import { createContext, useContext } from "react";

// What the current gallery visitor may do. Owners (access-code login) get
// everything; share-link visitors get what their link's role allows.
export const OWNER_PERMISSIONS = Object.freeze({ favorite: true, download: true, testimonial: true });

export const DEFAULT_GALLERY_SESSION = Object.freeze({
  role:        "owner",
  isShare:     false,
  permissions: OWNER_PERMISSIONS,
  pinRequired: false,
  // Runs a download task, asking for the PIN first (or after a pin_required
  // response) when needed. Resolves to the task's result, or null if cancelled.
  runDownload: (task) => task(),
});

export const GallerySessionContext = createContext(DEFAULT_GALLERY_SESSION);

export function useGallerySession() {
  return useContext(GallerySessionContext);
}

export class GalleryDownloadError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export const ROLE_LABELS = {
  view:  "View only",
  pick:  "View + favorites",
  owner: "Full access",
};
