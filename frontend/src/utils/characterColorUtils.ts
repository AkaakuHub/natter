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
