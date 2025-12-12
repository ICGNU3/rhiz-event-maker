import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export async function uploadFile(file: File, folder: string = "uploads"): Promise<string> {
  const filename = `${folder}/${nanoid()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
  
  const blob = await put(filename, file, {
    access: "public",
  });

  return blob.url;
}

export async function deleteFile(url: string) {
    // Vercel Blob doesn't have a simple delete by URL in 'put' return types usually exposed this simply without the del() method import
    // But for MVP we focus on upload.
    // To implement delete, we'd need: import { del } from '@vercel/blob'; await del(url);
    const { del } = await import("@vercel/blob");
    await del(url);
}
