import { useEffect, useRef, useState, useCallback } from 'react';
import { RotateCcw, Pause } from 'lucide-react';
import { motion } from 'motion/react';

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number };

const GRID_SIZE = 20;
const CELL_SIZE = 40;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const MOVE_INTERVAL = 100;

const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export const CanvasSnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [shake, setShake] = useState(false);

  const state = useRef({
    snake: [...INITIAL_SNAKE],
    direction: { ...INITIAL_DIRECTION },
    nextDirection: { ...INITIAL_DIRECTION },
    food: { x: 5, y: 5 },
    particles: [] as Particle[],
    moveTimer: 0,
    score: 0,
    gameOver: false,
    paused: false,
  });

  const generateFood = useCallback(() => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!state.current.snake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    state.current.food = newFood;
  }, []);

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      state.current.particles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 0,
        maxLife: 20 + Math.random() * 30,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  };

  const resetGame = () => {
    state.current = {
      snake: [...INITIAL_SNAKE],
      direction: { ...INITIAL_DIRECTION },
      nextDirection: { ...INITIAL_DIRECTION },
      food: { x: 5, y: 5 },
      particles: [],
      moveTimer: 0,
      score: 0,
      gameOver: false,
      paused: false,
    };
    generateFood();
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setShake(false);
  };

  useEffect(() => {
    generateFood();
  }, [generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.current.gameOver) return;
      
      const { direction } = state.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y !== 1) state.current.nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y !== -1) state.current.nextDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x !== 1) state.current.nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x !== -1) state.current.nextDirection = { x: 1, y: 0 };
          break;
        case ' ':
          state.current.paused = !state.current.paused;
          setPaused(state.current.paused);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const update = (dt: number) => {
    if (state.current.gameOver || state.current.paused) return;

    // Update particles
    state.current.particles = state.current.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      return p.life < p.maxLife;
    });

    state.current.moveTimer += dt;
    if (state.current.moveTimer >= MOVE_INTERVAL) {
      state.current.moveTimer = 0;
      state.current.direction = { ...state.current.nextDirection };
      
      const head = state.current.snake[0];
      const newHead = {
        x: head.x + state.current.direction.x,
        y: head.y + state.current.direction.y,
      };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        state.current.gameOver = true;
        setGameOver(true);
        setShake(true);
        spawnParticles(head.x, head.y, '#f43f5e'); // Rose 500
        return;
      }

      // Self collision
      if (state.current.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        state.current.gameOver = true;
        setGameOver(true);
        setShake(true);
        spawnParticles(head.x, head.y, '#f43f5e');
        return;
      }

      state.current.snake.unshift(newHead);

      // Food collision
      if (newHead.x === state.current.food.x && newHead.y === state.current.food.y) {
        state.current.score += 10;
        setScore(state.current.score);
        spawnParticles(newHead.x, newHead.y, '#34d399'); // Emerald 400
        generateFood();
      } else {
        state.current.snake.pop();
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#09090b'; // zinc-950
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw food
    const { food } = state.current;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    state.current.snake.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.shadowBlur = isHead ? 20 : 10;
      ctx.shadowColor = '#34d399';
      ctx.fillStyle = isHead ? '#34d399' : '#10b981';
      
      ctx.fillRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
    });

    // Draw particles
    state.current.particles.forEach(p => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 1 - p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    
    ctx.shadowBlur = 0; // Reset shadow
  };

  const gameLoop = useCallback((time: number) => {
    if (lastTimeRef.current !== 0) {
      const dt = time - lastTimeRef.current;
      update(dt);
    }
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[600px] mx-auto">
      <div className="flex w-full justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tighter">
          NEON SNAKE
        </h2>
        <div className="bg-[#151619] px-4 py-2 rounded-lg border border-zinc-800/50 flex items-center gap-3 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
          <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Score</span>
          <span className="text-emerald-400 font-mono text-xl font-bold">{score}</span>
        </div>
      </div>

      <div className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 border-zinc-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${shake ? 'animate-shake' : ''}`} onAnimationEnd={() => setShake(false)}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full bg-[#0a0a0c] block"
        />

        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20"
          >
            <h3 className="text-5xl font-black text-rose-500 mb-2 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] tracking-tighter">
              SYSTEM FAILURE
            </h3>
            <p className="text-zinc-400 mb-8 font-mono text-lg">Final Score: <span className="text-white">{score}</span></p>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full transition-all hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
            >
              <RotateCcw size={18} />
              Reboot System
            </button>
          </motion.div>
        )}

        {paused && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20"
          >
            <Pause size={64} className="text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            <h3 className="text-3xl font-black text-white tracking-widest">PAUSED</h3>
            <p className="text-zinc-400 font-mono mt-4 text-sm">Press SPACE to resume</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
