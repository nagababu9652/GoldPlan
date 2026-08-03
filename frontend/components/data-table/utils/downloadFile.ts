export interface DownloadFileOptions {
  filename: string;
  content: BlobPart;
  type?: string;
}

export function downloadFile({
  filename,
  content,
  type = "text/plain;charset=utf-8;",
}: DownloadFileOptions) {
  const blob = new Blob([content], {
    type,
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}