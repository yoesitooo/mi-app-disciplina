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

  const handleAuth = async () => {
    setLoading(true)
    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else alert('¡Cuenta creada! Ya puedes iniciar sesión.')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert('Error: Credenciales inválidas')
      else window.location.reload()
    }
    setLoading(false)
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
        user_id: user.id, category, xp_earned: puntos, photo_url: publicUrl 
      }])

      setXp(newXP)
      alert(`¡${act?.label} registrado! +${puntos} XP 🔥`)
    } catch (err: any) {
      alert('Error de subida: Asegúrate de que el bucket "evidencias" sea público.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">CARGANDO...</div>

  if (!user) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-neutral-900 p-8 rounded-[2rem] border border-neutral-800 w-full max-w-sm space-y-6 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-black italic text-orange-500 tracking-tighter">
              {isRegistering ? 'ÚNETE AL CLAN' : 'BIENVENIDO'}
            </h2>
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest mt-1">Disciplina y Constancia</p>
          </div>
          
          <div className="space-y-3">
            <input 
              type="email" placeholder="Correo" 
              className="w-full p-4 rounded-xl bg-black border border-neutral-800 focus:border-orange-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Contraseña" 
              className="w-full p-4 rounded-xl bg-black border border-neutral-800 focus:border-orange-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button onClick={handleAuth} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase hover:bg-orange-500 transition-all active:scale-95">
            {isRegistering ? 'Crear mi cuenta' : 'Entrar al sistema'}
          </button>

          <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-xs text-neutral-500 font-bold hover:text-white uppercase">
            {isRegistering ? '¿Ya tienes cuenta? Entra' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </main>
    )
  }

  const currentRank = getRank(xp)

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-24 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-orange-500">Disciplina App</h1>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-[10px] bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full text-neutral-400 font-black uppercase">Cerrar Sesión</button>
        </header>

        <section className={`p-6 rounded-[2rem] border-2 shadow-2xl ${currentRank.borderColor} ${currentRank.bg}`}>
          <p className="text-[10px] font-black uppercase opacity-50 tracking-[0.2em] mb-1">Status Actual</p>
          <h2 className={`text-5xl font-black italic tracking-tighter ${currentRank.color}`}>{currentRank.name}</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-current transition-all duration-500" style={{ width: `${(xp % 200) / 2}%` }}></div>
            </div>
            <span className="text-xs font-bold tracking-tighter">{xp} XP</span>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4">
          {ACTIVIDADES.map((act) => (
            <button 
              key={act.id}
              onClick={() => setCategory(act.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${category === act.id ? 'border-orange-500 bg-orange-500/10 scale-105 shadow-[0_0_20px_rgba(234,88,12,0.2)]' : 'border-neutral-900 bg-neutral-900/40 opacity-50'}`}
            >
              <span className="text-3xl">{act.icon}</span>
              <span className="font-black text-[10px] uppercase tracking-widest">{act.label}</span>
              <span className="text-[10px] font-bold text-orange-500">+{act.xp} XP</span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-6 rounded-3xl shadow-xl transition-all active:scale-95 uppercase italic text-xl disabled:opacity-50"
        >
          {uploading ? 'PROCESANDO...' : 'REGISTRAR ACTIVIDAD 📸'}
        </button>
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleUpload} />
      </div>
    </main>
  )
}