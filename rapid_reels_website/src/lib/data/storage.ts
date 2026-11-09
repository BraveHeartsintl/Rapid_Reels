import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { getStorageInstance } from "@/lib/firebase";

/** Uploads a file to Firebase Storage and resolves with its download URL. */
export function uploadFile(
  path: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ url: string; path: string; size: number; contentType: string }> {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(getStorageInstance(), path), file, {
      contentType: file.type || undefined,
    });
    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path, size: file.size, contentType: file.type });
        } catch (e) {
          reject(e);
        }
      },
    );
  });
}

export function safeFileName(name: string): string {
  return `${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}
