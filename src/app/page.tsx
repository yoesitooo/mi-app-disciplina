'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getRank, RANKS } from '@/lib/constants'

const ACTIVIDADES = [
  { id: 'gym', label: 'Gimnasio', xp: 50, icon: '💪' },
  { id: 'study', label: 'Estudio', xp: 30, icon: '📚' },
  { id: 'food', label: 'Comida Sana', xp: 20, icon: '🥗' },
  { id: 'save', label: 'Ahorro', xp: 40, icon: '💰' },
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('gym')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase.from('profiles').select('xp').eq('id', session.user.id).single()
        if (data) setXp(data.xp)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) alert('Error: ' + error.message)
    else alert('¡Revisa tu correo para entrar!')
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploading(true)
      const fileName = `${user.id}/${Date.now()}_${file.name}`
      const { error: storageError } = await supabase.storage.from('evidencias').upload(fileName, file)
      if (storageError) throw storageError

      const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(fileName)
      
      const act = ACTIVIDADES.find(a => a.id === category)
      const puntos = act ? act.xp : 10
      const newXP = xp + puntos

      await supabase.from('profiles').update({ xp: newXP }).eq('id', user.id)
      await supabase.from('activity_logs').insert([{ 
        user_id: user.id, 
        category, 
        xp_earned: puntos, 
        photo_url: publicUrl 
      }])

      setXp(newXP)
      alert(`¡${act?.label} registrado! +${puntos} XP 🔥`)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando sistema...</div>

  // PANTALLA DE LOGIN
  if (!user) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 w-full max-w-sm space-y-6 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-black italic tracking-tighter text-orange-500">CLAN DISCIPLINA</h2>
            <p className="text-neutral-500 text-xs mt-2 uppercase tracking-widest">Ingresa para subir de rango</p>
          </div>
          <input 
            type="email" 
            placeholder="Tu email real" 
            className="w-full p-4 rounded-xl bg-black border border-neutral-700 focus:border-orange-500 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase hover:bg-orange-500 transition-colors shadow-lg">Enviar Enlace</button>
        </div>
      </main>
    )
  }

  const currentRank = getRank(xp)

  // PANTALLA DASHBOARD (Ya logueado)
  return (
    <main className="min-h-screen bg-black text-white p-6 pb-24 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black italic uppercase">Dashboard</h1>
            <p className="text-neutral-500 text-xs">{user.email}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-[10px] bg-neutral-800 px-3 py-1 rounded-full text-neutral-400 font-bold uppercase">Salir</button>
        </header>

        <section className={`p-6 rounded-[2rem] border-2 transition-all shadow-2xl ${currentRank.borderColor} ${currentRank.bg}`}>
          <p className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em] mb-1">Rango Actual</p>
          <h2 className={`text-5xl font-black italic tracking-tighter ${currentRank.color}`}>{currentRank.name}</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-current transition-all" style={{ width: `${(xp % 200) / 2}%` }}></div>
            </div>
            <span className="text-xs font-bold">{xp} XP</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          {ACTIVIDADES.map((act) => (
            <button 
              key={act.id}
              onClick={() => setCategory(act.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${category === act.id ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' : 'border-neutral-800 bg-neutral-900 opacity-60'}`}
            >
              <span className="text-3xl">{act.icon}</span>
              <span className="font-black text-xs uppercase">{act.label}</span>
              <span className="text-[10px] font-bold text-orange-500">+{act.xp} XP</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-6 rounded-3xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] transition-all active:scale-95 uppercase italic text-xl"
        >
          {uploading ? 'SUBIENDO...' : 'REGISTRAR EVIDENCIA 📸'}
        </button>
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleUpload} />

        <nav className="fixed bottom-6 left-6 right-6 bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 p-4 rounded-3xl flex justify-around shadow-2xl">
          <button className="text-orange-500 font-bold text-xs uppercase">🏠 Inicio</button>
          <button onClick={() => window.location.href='/leaderboard'} className="text-neutral-500 font-bold text-xs uppercase hover:text-white transition-colors">🏆 Ranking</button>
        </nav>
      </div>
    </main>
  )
}