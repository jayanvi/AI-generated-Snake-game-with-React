import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Neon Drive',
    artist: 'AI Synth',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'Cyber City',
    artist: 'Neural Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'Synthwave Dreams',
    artist: 'DeepMind Audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
];

const formatTime = (time: number) => {
  if (isNaN(time)) return '00:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnd = () => nextTrack();

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-sm bg-[#151619] rounded-xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-zinc-800/50">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Hardware Display Screen */}
      <div className="bg-[#0a0a0c] border border-zinc-800 rounded-lg p-4 mb-6 relative overflow-hidden">
        {/* Scanlines effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
        
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Now Playing</span>
            <h3 className="text-emerald-400 font-mono text-sm truncate w-48">{currentTrack.title}</h3>
            <p className="text-emerald-400/60 font-mono text-xs truncate w-48">{currentTrack.artist}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse' : 'bg-zinc-700'}`} />
              <span className="text-zinc-300 font-mono text-xs">{isPlaying ? 'PLAY' : 'STOP'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mt-4">
          <span className="font-mono text-emerald-400/80 text-xs">{formatTime(currentTime)}</span>
          <div className="flex gap-1 h-4 items-end">
            {Array.from({ length: 12 }).map((_, i) => {
              const isActive = isPlaying && Math.random() > 0.3;
              return (
                <div 
                  key={i} 
                  className={`w-1.5 rounded-t-sm transition-all duration-75 ${isActive ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'bg-zinc-800'}`}
                  style={{ height: isActive ? `${Math.random() * 100}%` : '20%' }}
                />
              )
            })}
          </div>
          <span className="font-mono text-zinc-600 text-xs">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mb-8 relative">
        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Hardware Controls */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevTrack} className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors border border-zinc-700 active:scale-95">
          <SkipBack size={18} />
        </button>

        <button onClick={togglePlay} className={`w-16 h-16 flex items-center justify-center rounded-full transition-all border-2 active:scale-95 ${isPlaying ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'}`}>
          {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
        </button>

        <button onClick={nextTrack} className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full transition-colors border border-zinc-700 active:scale-95">
          <SkipForward size={18} />
        </button>
      </div>

      {/* Volume Dial Area */}
      <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
        <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-zinc-300 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-800"
          />
        </div>
      </div>
    </div>
  );
};
