/**
 * キャラクター名の文字列長に基づいて固定色を生成するユーティリティ
 */

// 予め定義された色のパレット（背景色に適した薄い色を選定）
const COLOR_PALETTE = [
  "#fca5a5", // red-300
  "#fdba74", // orange-300
  "#fde047", // yellow-300
  "#86efac", // green-300
  "#67e8f9", // cyan-300
  "#93c5fd", // blue-300
  "#c4b5fd", // violet-300
  "#f9a8d4", // pink-300
  "#fcd34d", // amber-300
  "#6ee7b7", // emerald-300
  "#a5b4fc", // indigo-300
  "#f0abfc", // fuchsia-300
  "#bef264", // lime-300
  "#5eead4", // teal-300
  "#d1d5db", // gray-300
  "#d2b48c", // tan-like
];

/**
 * 文字列の長さに基づいて固定色を生成
 * @param name キャラクター名（自分のものは実名、他人のものは"???"形式）
 * @returns RGB色文字列
 */
export function getCharacterColor(name: string): string {
  // 文字列の長さを取得
  const length = name.length;

  // 長さをインデックスにマッピング（色パレットの範囲内で循環）
  const colorIndex = length % COLOR_PALETTE.length;

  return COLOR_PALETTE[colorIndex];
}

/**
 * キャラクター名に基づいて背景色のスタイルオブジェクトを生成
 * @param name キャラクター名
 * @param opacity 透明度（デフォルト: 0.5）
 * @returns React CSS スタイルオブジェクト
 */
export function getCharacterColorStyle(
  name: string,
  opacity: number = 0.5,
): React.CSSProperties {
  const baseColor = getCharacterColor(name);

  return {
    backgroundColor: `${baseColor}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`,
    borderColor: baseColor,
  };
}

/**
 * キャラクター名に基づいてテキスト色を生成（背景色とのコントラストを考慮）
 * @param name キャラクター名
 * @returns テキスト色文字列
 */
export function getCharacterTextColor(name: string): string {
  const baseColor = getCharacterColor(name);

  // 明度に基づいてテキスト色を決定
  // 薄い背景色には濃いテキストが適している
  const rgb = hexToRgb(baseColor);
  if (!rgb) return "#374151"; // gray-700 (fallback)

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

  // 薄い色パレットなので、基本的に濃いテキストを使用
  // 非常に明るい色（brightness > 200）の場合はより濃いテキスト
  return brightness > 200 ? "#111827" : "#374151"; // gray-900 or gray-700
}

/**
 * HEX色をRGBに変換
 * @param hex HEX色文字列
 * @returns RGB オブジェクト
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
