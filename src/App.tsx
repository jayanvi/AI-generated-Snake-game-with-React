import { CanvasSnakeGame } from './components/CanvasSnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-8 lg:gap-16">
      {/* Background ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Game Area - Scales to fit */}
      <div className="relative z-10 w-full max-w-[600px] flex-shrink-1">
        <CanvasSnakeGame />
      </div>

      {/* Hardware Panel Area */}
      <div className="relative z-10 flex flex-col gap-6 w-full max-w-sm flex-shrink-0">
        <div className="bg-[#151619] p-6 rounded-xl border border-zinc-800/50 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <h1 className="text-3xl font-black tracking-tighter text-white mb-1">
            SYNTH<span className="text-emerald-500">SNAKE</span>
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">
            System Module v2.0
          </p>
          
          <div className="mt-6 pt-6 border-t border-zinc-800/50">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Input Mapping</h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-zinc-400">
              <div className="flex justify-between items-center bg-[#0a0a0c] px-3 py-2 rounded border border-zinc-800/50">
                <span>DIR</span>
                <span className="text-emerald-400">WASD</span>
              </div>
              <div className="flex justify-between items-center bg-[#0a0a0c] px-3 py-2 rounded border border-zinc-800/50">
                <span>HALT</span>
                <span className="text-emerald-400">SPACE</span>
              </div>
            </div>
          </div>
        </div>
        
        <MusicPlayer />
      </div>
    </div>
  );
}
