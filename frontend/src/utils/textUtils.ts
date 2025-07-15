// テキスト処理ユーティリティ

export interface ParsedText {
  segments: TextSegment[];
  effectiveLength: number;
}

export interface TextSegment {
  type: "text" | "url";
  content: string;
  start: number;
  end: number;
}

/**
 * テキスト内のURLを検出し、セグメントに分割する
 * @param text 解析するテキスト
 * @returns ParsedText オブジェクト
 */
export const parseTextWithUrls = (text: string): ParsedText => {
  // まず、テキスト内のゼロ幅文字を除去してからURL検出を行う
  const cleanText = text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");

  // より厳密なURL正規表現（少なくとも2文字以上のTLDを含む完全なドメイン名のみ検出）
  const urlRegex =
    /(https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}[^\s]*)/g;
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match;
  let effectiveLength = 0;

  while ((match = urlRegex.exec(cleanText)) !== null) {
    // URL前のテキスト部分
    if (match.index > lastIndex) {
      const textContent = cleanText.slice(lastIndex, match.index);
      segments.push({
        type: "text",
        content: textContent,
        start: lastIndex,
        end: match.index,
      });
      effectiveLength += textContent.length;
    }

    // URL部分
    const urlContent = match[0];
    segments.push({
      type: "url",
      content: urlContent,
      start: match.index,
      end: match.index + urlContent.length,
    });
    // URLは文字数を1/5として計算
    effectiveLength += Math.ceil(urlContent.length / 5);

    lastIndex = match.index + urlContent.length;
  }

  // 残りのテキスト部分
  if (lastIndex < cleanText.length) {
    const textContent = cleanText.slice(lastIndex);
    segments.push({
      type: "text",
      content: textContent,
      start: lastIndex,
      end: cleanText.length,
    });
    effectiveLength += textContent.length;
  }

  return {
    segments,
    effectiveLength,
  };
};

/**
 * テキストの有効文字数を計算（URLは1/5でカウント）
 * @param text 計算するテキスト
 * @returns 有効文字数
 */
export const calculateEffectiveLength = (text: string): number => {
  return parseTextWithUrls(text).effectiveLength;
};
