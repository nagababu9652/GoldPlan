export function generateFileName(
  name: string
) {
  const now = new Date();

  const date =
    now.toISOString().split("T")[0];

  return `${name}-${date}`;
}