'use client'
import { useState } from 'react'
import { getRank, RANKS } from '@/lib/constants'

export default function Home() {
  // Estado temporal (luego lo traeremos de Supabase)
  const [xp, setXp] = useState(0)
  const currentRank = getRank(xp)
  
  // Calcular progreso para la barra
  const nextRank = RANKS.find(r => r.minXP > xp) || RANKS[RANKS.length - 1]
  const progress = Math.min((xp / nextRank.minXP) * 100, 100)

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8 bg-neutral-900 p-8 rounded-3xl border border-neutral-800 shadow-2xl">
        
        {/* Encabezado de Rango */}
        <div className="text-center space-y-2">
          <p className="text-neutral-500 text-xs font-black tracking-[0.2em] uppercase">Rango Actual</p>
          <div className={`inline-block px-8 py-3 rounded-xl border-2 ${currentRank.borderColor} ${currentRank.bg} ${currentRank.color} font-black text-3xl italic tracking-tighter shadow-[0_0_20px_rgba(0,0,0,0.5)]`}>
            {currentRank.name}
          </div>
        </div>

        {/* Barra de Progreso Animada */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-neutral-400">
            <span>{xp} XP</span>
            <span>{nextRank.minXP} XP</span>
          </div>
          <div className="h-4 w-full bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div 
              className={`h-full transition-all duration-500 ease-out bg-gradient-to-r from-orange-600 to-yellow-400 shadow-[0_0_15px_rgba(234,88,12,0.5)]`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-[10px] text-neutral-500 uppercase tracking-widest pt-1">
            Faltan {nextRank.minXP - xp} XP para {nextRank.name}
          </p>
        </div>

        {/* Acciones de Disciplina */}
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setXp(prev => prev + 50)}
            className="group relative overflow-hidden bg-white text-black font-black py-4 rounded-2xl transition-all active:scale-95 hover:bg-neutral-200"
          >
            <span className="relative z-10 text-lg uppercase italic">Registrar Gimnasio +50 XP</span>
          </button>
          
          <button 
            onClick={() => setXp(0)}
            className="text-neutral-600 text-xs hover:text-red-500 transition-colors uppercase font-bold"
          >
            Resetear Progreso (Debug)
          </button>
        </div>

      </div>
    </main>
  )
}