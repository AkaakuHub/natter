export function decodeHtmlEntities(text: string): string {
  if (!text) return text;

  // HTMLエンティティをデコード
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x60;/g, "`")
    .replace(/&#x3D;/g, "=");
}

export function breakLongWords(text: string): string {
  if (!text) return text;

  return text.replace(/(\S{20,})/g, (match) => {
    // 20文字以上の連続する文字列を改行可能な位置に分割
    return match.replace(/(.{10})/g, "$1\u200B"); // Zero-width space
  });
}
