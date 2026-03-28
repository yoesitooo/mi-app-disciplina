'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getRank } from '@/lib/constants'

const ACTIVIDADES = [
  { id: 'gym', label: 'Gimnasio', xp: 50, icon: '💪' },
  { id: 'study', label: 'Estudio', xp: 30, icon: '📚' },
  { id: 'food', label: 'Comida Sana', xp: 20, icon: '🥗' },
  { id: 'save', label: 'Ahorro', xp: 40, icon: '💰' },
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [xp, setXp] = useState(0)
  const [category, setCategory] = useState('gym')

  // Cargar usuario y persistir sesión automáticamente
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        supabase.from('profiles').select('xp').eq('id', session.user.id).single()
          .then(({ data }) => data && setXp(data.xp))
      }
    })
  }, [])

  if (!user) return <div className="p-10 text-center">Inicia sesión para continuar...</div>

  const currentRank = getRank(xp)

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header de Bienvenida */}
      <div className="mb-8">
        <h1 className="text-2xl font-black italic">HOLA, {user.email?.split('@')[0]} 👋</h1>
        <p className="text-neutral-500 text-sm">¿Qué disciplina practicaste hoy?</p>
      </div>

      {/* Rango y XP */}
      <div className={`p-6 rounded-3xl border-2 mb-8 ${currentRank.borderColor} ${currentRank.bg}`}>
        <p className="text-xs font-bold uppercase opacity-60">Rango Actual</p>
        <h2 className={`text-4xl font-black italic ${currentRank.color}`}>{currentRank.name}</h2>
        <p className="text-sm mt-2">{xp} XP Acumulados</p>
      </div>

      {/* Selector de Actividad */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {ACTIVIDADES.map((act) => (
          <button 
            key={act.id}
            onClick={() => setCategory(act.id)}
            className={`p-4 rounded-2xl border-2 transition-all ${category === act.id ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-900'}`}
          >
            <span className="text-2xl mb-2 block">{act.icon}</span>
            <span className="font-bold text-sm">{act.label}</span>
            <span className="block text-[10px] opacity-50">+{act.xp} XP</span>
          </button>
        ))}
      </div>

      {/* Botón de Cámara (El que ya teníamos pero mejorado) */}
      <button 
        className="w-full bg-white text-black font-black py-5 rounded-2xl text-xl italic uppercase shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        onClick={() => document.getElementById('cameraInput')?.click()}
      >
        Subir Evidencia 📸
      </button>
      <input 
        id="cameraInput" 
        type="file" 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
        onChange={(e) => {/* Aquí usas la lógica de subida anterior pero enviando la 'category' */}}
      />

      {/* Nav de abajo (Escalabilidad) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 flex justify-around">
        <button className="text-orange-500">🏠 Inicio</button>
        <button onClick={() => window.location.href='/historial'}>📜 Historial</button>
        <button onClick={() => window.location.href='/perfil'}>👤 Perfil</button>
      </nav>
    </main>
  )
}