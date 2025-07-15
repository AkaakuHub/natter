/**
 * HTMLエスケープされたコンテンツをデコードする
 * 特にURLなどのエスケープされた文字列を元に戻す
 */
export function decodeHtmlEntities(content: string): string {
  if (!content) return content;

  const htmlEntities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x2F;": "/",
    "&#x5C;": "\\",
    "&#x60;": "`",
    "&#x3D;": "=",
  };

  let decodedContent = content;

  // HTMLエンティティを元の文字に変換
  for (const [entity, char] of Object.entries(htmlEntities)) {
    decodedContent = decodedContent.replace(new RegExp(entity, "g"), char);
  }

  return decodedContent;
}

/**
 * コンテンツ内のURLを適切にデコードする
 * 編集時にエスケープされたURLを元に戻すために使用
 */
export function decodeContentForEditing(content: string): string {
  if (!content) return content;

  return decodeHtmlEntities(content);
}
