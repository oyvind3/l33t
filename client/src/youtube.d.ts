declare namespace YT {
  interface PlayerOptions {
    height?: string | number;
    width?: string | number;
    videoId?: string;
    playerVars?: Record<string, unknown>;
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: PlayerEvent) => void;
    };
  }

  interface PlayerEvent {
    target: Player;
    data?: number;
  }

  class Player {
    constructor(elementId: string, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    destroy(): void;
  }
}
