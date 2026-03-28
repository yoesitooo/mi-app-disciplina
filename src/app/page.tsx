'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getRank, RANKS } from '@/lib/constants'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  // 1. Cargar datos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
        if (data) setXp(data.xp)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // 2. Función de Login (Magic Link)
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert('Error: ' + error.message)
    else alert('¡Revisa tu correo para entrar!')
  }

  // 3. Registrar Actividad y Subir XP
  const addXP = async (amount: number) => {
    const newXP = xp + amount
    const oldRank = getRank(xp)
    const newRank = getRank(newXP)

    // Efectos si sube de rango
    if (newRank.name !== oldRank.name) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3')
      audio.play()
      document.body.classList.add('flash-white')
      setTimeout(() => document.body.classList.remove('flash-white'), 500)
    }

    setXp(newXP)
    await supabase.from('profiles').update({ xp: newXP }).eq('id', user?.id)
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center">Cargando...</div>

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-black italic">ENTRAR AL RPG</h2>
          <input 
            type="email" 
            placeholder="Tu email" 
            className="w-full p-4 rounded-xl bg-black border border-neutral-700 focus:border-orange-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase">Enviar Enlace Mágico</button>
        </div>
      </div>
    )
  }

  const currentRank = getRank(xp)

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-6">
      <style>{`.flash-white { background-color: white !important; transition: background 0.1s; }`}</style>
      
      <div className="max-w-md w-full space-y-8 mt-20 bg-neutral-900 p-8 rounded-3xl border border-neutral-800">
        <div className="text-center">
          <div className={`inline-block px-8 py-3 rounded-xl border-2 ${currentRank.borderColor} ${currentRank.bg} ${currentRank.color} font-black text-3xl italic tracking-tighter`}>
            {currentRank.name}
          </div>
          <p className="mt-4 text-neutral-400 font-bold">{xp} XP TOTALES</p>
        </div>

        <button 
          onClick={() => addXP(50)}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-2xl shadow-lg transition-transform active:scale-95 uppercase italic text-xl"
        >
          Registrar Disciplina +50 XP
        </button>

        <button onClick={() => supabase.auth.signOut()} className="text-xs text-neutral-600 w-full">Cerrar Sesión</button>
      </div>
    </main>
  )
}