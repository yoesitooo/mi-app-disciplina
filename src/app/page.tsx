'use client'
import { useState, useEffect, useRef } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('gym')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        supabase.from('profiles').select('xp').eq('id', session.user.id).single()
          .then(({ data }) => data && setXp(data.xp))
      }
      setLoading(false)
    })
  }, [])

  const handleAuth = async () => {
    setLoading(true)
    const { data, error } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) alert(error.message)
    else if (!isRegistering) window.location.reload()
    else alert('¡Registrado! Ahora inicia sesión.')
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    try {
      setUploading(true)
      const fileName = `${user.id}/${Date.now()}_${file.name}`
      await supabase.storage.from('evidencias').upload(fileName, file)
      const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(fileName)
      
      const act = ACTIVIDADES.find(a => a.id === category)
      const puntos = act?.xp || 10
      const newXP = xp + puntos

      await supabase.from('profiles').update({ xp: newXP }).eq('id', user.id)
      await supabase.from('activity_logs').insert([{ user_id: user.id, category, xp_earned: puntos, photo_url: publicUrl }])
      setXp(newXP)
      alert(`+${puntos} XP!`)
    } catch (err: any) { alert(err.message) }
    finally { setUploading(false) }
  }

  if (loading) return <div className="h-screen flex items-center justify-center font-black italic">CARGANDO...</div>

  if (!user) return (
    <main className="h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-sm bg-neutral-900 p-8 rounded-[2rem] border border-neutral-800 space-y-4">
        <h2 className="text-3xl font-black italic text-orange-500 text-center uppercase tracking-tighter">Clan Disciplina</h2>
        <input type="email" placeholder="Email" className="w-full p-4 rounded-xl bg-black border border-neutral-800" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" className="w-full p-4 rounded-xl bg-black border border-neutral-800" onChange={e => setPassword(e.target.value)} />
        <button onClick={handleAuth} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase hover:bg-orange-500 transition-all">{isRegistering ? 'Crear Cuenta' : 'Entrar'}</button>
        <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-[10px] text-neutral-500 uppercase font-black tracking-widest">{isRegistering ? '¿Ya tienes cuenta? Entra' : '¿Nuevo aquí? Regístrate'}</button>
      </div>
    </main>
  )

  const currentRank = getRank(xp)

  return (
    <main className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-black italic text-orange-500">DISCIPLINA</h1>
        <span className="text-[10px] text-neutral-500 uppercase font-bold">{user.email}</span>
      </header>

      <section className={`p-6 rounded-[2rem] border-2 shadow-2xl ${currentRank.borderColor} ${currentRank.bg}`}>
        <h2 className={`text-5xl font-black italic tracking-tighter ${currentRank.color}`}>{currentRank.name}</h2>
        <p className="text-xs font-bold mt-2 opacity-70">{xp} XP TOTALES</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {ACTIVIDADES.map(act => (
          <button key={act.id} onClick={() => setCategory(act.id)} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${category === act.id ? 'border-orange-500 bg-orange-500/10 scale-105' : 'border-neutral-900 bg-neutral-900/40 opacity-40'}`}>
            <span className="text-3xl">{act.icon}</span>
            <span className="font-black text-[10px] uppercase mt-1">{act.label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full bg-orange-600 text-white font-black py-6 rounded-3xl shadow-xl uppercase italic text-xl">
        {uploading ? 'SUBIENDO...' : 'REGISTRAR ACTIVIDAD 📸'}
      </button>
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleUpload} />
    </main>
  )
}