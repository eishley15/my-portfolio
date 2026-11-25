import { authHeaders } from "./galleryAuth";
import { GalleryDownloadError } from "./gallerySession";

// Fetch a signed URL for one gallery file and trigger the browser download.
// The gallery is identified by the session token (access-code or share link);
// `accessCode` is accepted for backwards compatibility but no longer sent.
// Throws GalleryDownloadError (code "pin_required" | "role_forbidden") when the
// share link needs a PIN or doesn't allow downloads, so runDownload() can react;
// throws a plain Error for anything else.
// eslint-disable-next-line no-unused-vars
export async function downloadGalleryFile({ accessCode, filename }) {
  const res = await fetch(
    `/api/download?fileName=${encodeURIComponent(filename)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (body.code === "pin_required" || body.code === "role_forbidden") {
      throw new GalleryDownloadError(body.error, body.code);
    }
    throw new Error(`Download failed (${res.status})`);
  }
  const { url } = await res.json();
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
