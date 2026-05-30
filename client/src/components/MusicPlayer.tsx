import { useState, useRef, useEffect } from 'react';

// Uses a local audio file placed in `public/assets/basshunter.m4a`
export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(30);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.min(Math.max(volume / 100, 0), 1);
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val / 100;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio
        ref={audioRef}
        src="/assets/basshunter.m4a"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

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
