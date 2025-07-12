/**
 * 音声ファイルを再生するユーティリティ関数
 */

export class AudioPlayer {
  private static instance: AudioPlayer;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  /**
   * 音声ファイルをプリロード
   */
  preloadAudio(soundPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.audioCache.has(soundPath)) {
        resolve();
        return;
      }

      const audio = new Audio(soundPath);
      audio.preload = "auto";

      audio.addEventListener("canplaythrough", () => {
        this.audioCache.set(soundPath, audio);
        resolve();
      });

      audio.addEventListener("error", (error) => {
        console.warn(`Failed to preload audio: ${soundPath}`, error);
        reject(error);
      });

      // 一定時間後にタイムアウト
      setTimeout(() => {
        reject(new Error(`Audio preload timeout: ${soundPath}`));
      }, 5000);
    });
  }

  /**
   * 音声を再生
   */
  async playSound(soundPath: string, volume: number = 0.5): Promise<void> {
    try {
      let audio = this.audioCache.get(soundPath);

      if (!audio) {
        // キャッシュにない場合は動的に読み込み
        audio = new Audio(soundPath);
        this.audioCache.set(soundPath, audio);
      }

      // 音量設定
      audio.volume = Math.max(0, Math.min(1, volume));

      // 既に再生中の場合は最初から再生
      audio.currentTime = 0;

      await audio.play();
    } catch (error) {
      // 音声再生エラーは基本的に無視（ユーザー体験に影響しない）
      console.warn(`Failed to play sound: ${soundPath}`, error);
    }
  }

  /**
   * リフレッシュ音を再生
   */
  async playRefreshSound(): Promise<void> {
    // 実際の音声ファイルを再生
    await this.playSound("/sounds/refresh-pull.mp3", 0.3);
  }

  /**
   * Web Audio APIを使用した合成音生成（音声ファイルの代替）
   */
  private playWebAudioTone(frequency: number, duration: number): void {
    try {
      // 型安全にWebAudioContextにアクセス
      let audioContext: AudioContext | undefined;

      if (window.AudioContext) {
        audioContext = new window.AudioContext();
      } else {
        // webkit prefixの場合は動的アクセスを使用
        const windowAny = window as unknown as Record<string, unknown>;
        const WebkitAudioContext = windowAny["webkitAudioContext"] as
          | typeof AudioContext
          | undefined;
        if (WebkitAudioContext) {
          audioContext = new WebkitAudioContext();
        }
      }

      if (!audioContext) {
        console.warn("Web Audio API not supported");
        return;
      }
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = "sine";

      // 音量のフェードイン・フェードアウト
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        audioContext.currentTime + duration / 1000,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn("Web Audio API not supported or failed", error);
    }
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.audioCache.clear();
  }
}

// シングルトンインスタンスをエクスポート
export const audioPlayer = AudioPlayer.getInstance();
