import { useState, useRef, useEffect } from 'react';

// Basshunter - DotA (YouTube video ID)
const YOUTUBE_VIDEO_ID = 'jkO-MqPVcRs';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(30);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if ((window as unknown as Record<string, unknown>).YT) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    (window as unknown as Record<string, () => void>).onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      (window as unknown as Record<string, undefined>).onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  useEffect(() => {
    if ((window as unknown as Record<string, unknown>).YT && (window as unknown as { YT: { Player: unknown } }).YT.Player) {
      initPlayer();
    }
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;
    const YT = (window as unknown as { YT: typeof globalThis.YT }).YT;
    playerRef.current = new YT.Player('yt-player', {
      height: '0',
      width: '0',
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID,
        origin: window.location.origin,
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          event.target.setVolume(volume);
        },
      },
    });
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (playerRef.current) {
      playerRef.current.setVolume(val);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-50"
    >
      {/* Hidden YouTube player */}
      <div id="yt-player" className="hidden" />

      {expanded ? (
        <div className="bg-bg-card border border-neon-blue/30 rounded-xl p-4 shadow-lg animate-slide-in w-64">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-neon-blue">🎵 BASSHUNTER</span>
            <button
              onClick={() => setExpanded(false)}
              className="text-text-secondary hover:text-text-primary text-xs transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="font-mono text-[10px] text-text-secondary mb-3">DotA (Vi sitter i Ventrilo)</p>

          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                isPlaying
                  ? 'border-neon-green text-neon-green bg-neon-green/10 box-glow-green'
                  : 'border-neon-blue/50 text-neon-blue hover:border-neon-blue'
              }`}
            >
              <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolume}
                className="w-full h-1 appearance-none bg-white/10 rounded-full cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-blue"
              />
              <div className="flex justify-between font-mono text-[9px] text-text-secondary mt-1">
                <span>🔈</span>
                <span>{volume}%</span>
                <span>🔊</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all shadow-lg ${
            isPlaying
              ? 'border-neon-green bg-bg-card text-neon-green box-glow-green animate-pulse'
              : 'border-neon-blue/30 bg-bg-card text-neon-blue hover:border-neon-blue'
          }`}
          title="Basshunter - DotA 🎵"
        >
          <span className="text-lg">🎵</span>
        </button>
      )}
    </div>
  );
}
