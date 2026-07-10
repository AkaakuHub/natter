import { describe, expect, it } from "vitest";
import { decideSwipeBackGesture } from "./swipeBackGesture";

describe("decideSwipeBackGesture", () => {
  it("横方向が確定した時点でブラウザの既定動作を抑止する", () => {
    expect(decideSwipeBackGesture(9, 2)).toEqual({
      shouldCancel: false,
      shouldNavigateBack: false,
      shouldPreventDefault: true,
    });
  });

  it("右へ64pxスワイプすると戻る", () => {
    expect(decideSwipeBackGesture(64, 12)).toEqual({
      shouldCancel: false,
      shouldNavigateBack: true,
      shouldPreventDefault: true,
    });
  });

  it("縦スクロールが確定した場合はスワイプ判定を終了する", () => {
    expect(decideSwipeBackGesture(6, 8)).toEqual({
      shouldCancel: true,
      shouldNavigateBack: false,
      shouldPreventDefault: false,
    });
  });

  it("左方向へ動いた場合はスワイプ判定を終了する", () => {
    expect(decideSwipeBackGesture(-8, 1)).toEqual({
      shouldCancel: true,
      shouldNavigateBack: false,
      shouldPreventDefault: false,
    });
  });

  it("方向が確定するまではタッチ操作を妨げない", () => {
    expect(decideSwipeBackGesture(5, 4)).toEqual({
      shouldCancel: false,
      shouldNavigateBack: false,
      shouldPreventDefault: false,
    });
  });
});
