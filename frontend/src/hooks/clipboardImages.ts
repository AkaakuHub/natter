interface ClipboardImageItem {
  kind: string;
  type: string;
  getAsFile: () => File | null;
}

export function imageFilesFromClipboardItems(
  items: Iterable<ClipboardImageItem>,
): File[] {
  return Array.from(items)
    .map((item) => {
      if (item.kind !== "file" || !item.type.startsWith("image/")) {
        return null;
      }
      return item.getAsFile();
    })
    .filter((file): file is File => file !== null);
}
