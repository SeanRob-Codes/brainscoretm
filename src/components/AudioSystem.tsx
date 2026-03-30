import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music, Upload, Play, Pause, SkipForward } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

const ARCADE_TRACKS = [
  { name: 'Focus Flow', url: '' },
  { name: 'Brain Beats', url: '' },
  { name: 'Neural Groove', url: '' },
];

// Generate simple audio tones as placeholder arcade music
function generateTone(ctx: AudioContext, freq: number, duration: number, startTime: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.05, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function AudioSystem() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>('Focus Flow');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const customUrlRef = useRef<string>('');

  const togglePlay = () => {
    if (customFile && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Built-in ambient: use Web Audio API for simple ambient tone
      if (!isPlaying) {
        try {
          const ctx = new AudioContext();
          const notes = [261, 329, 392, 523, 392, 329];
          notes.forEach((freq, i) => {
            generateTone(ctx, freq, 0.8, i * 0.5);
          });
        } catch {}
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setCustomFile(file);
      if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
      const url = URL.createObjectURL(file);
      customUrlRef.current = url;
      setCurrentTrack(file.name);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.volume = volume;
        audioRef.current.loop = true;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (customUrlRef.current) URL.revokeObjectURL(customUrlRef.current);
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} loop />
      
      {/* Floating music button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed left-4 bottom-20 z-40 h-10 w-10 rounded-full border border-border bg-card/90 shadow-lg flex items-center justify-center hover:border-accent/50 transition-all"
      >
        <Music className={`h-4 w-4 ${isPlaying ? 'text-accent' : 'text-muted-foreground'}`} />
      </button>

      {/* Music panel */}
      {showPanel && (
        <div className="fixed left-4 bottom-32 z-[100] w-[260px] animate-pop-in rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[10px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1">
              <Music className="h-3 w-3" /> Audio
            </span>
            <button onClick={() => setShowPanel(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>

          {/* Now playing */}
          <div className="rounded-xl border border-border bg-secondary/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Now Playing</p>
            <p className="text-xs font-semibold text-foreground truncate mt-0.5">{currentTrack}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={togglePlay}
              className="h-10 w-10 rounded-full gradient-accent flex items-center justify-center text-accent-foreground hover:brightness-110 transition-all"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <VolumeX className="h-3 w-3 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="flex-1 accent-[hsl(var(--accent))]"
            />
            <Volume2 className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* Built-in tracks */}
          <div className="space-y-1">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Built-in Tracks</p>
            {ARCADE_TRACKS.map(t => (
              <button
                key={t.name}
                onClick={() => { setCurrentTrack(t.name); setCustomFile(null); }}
                className={`w-full text-left rounded-lg px-2.5 py-1.5 text-[11px] transition-all ${
                  currentTrack === t.name && !customFile ? 'bg-accent/10 text-accent font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🎵 {t.name}
              </button>
            ))}
          </div>

          {/* Upload custom */}
          <label className="flex items-center gap-2 rounded-xl border border-dashed border-accent/30 bg-accent/5 p-2.5 cursor-pointer hover:bg-accent/10 transition-all">
            <Upload className="h-4 w-4 text-accent" />
            <span className="text-[11px] text-accent font-semibold">Upload Your Music</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}
    </>
  );
}
