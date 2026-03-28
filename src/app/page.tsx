'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getRank, RANKS } from '@/lib/constants'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [xp, setXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [email, setEmail] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. Cargar datos iniciales
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

  // 2. Login con Enlace Mágico
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) alert('Error: ' + error.message)
    else alert('¡Revisa tu correo para entrar!')
  }

  // 3. LA FUNCIÓN MAESTRA: Subir Foto + XP
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploading(true)

      // A. Subir imagen al Bucket 'evidencias'
      const fileName = `${user.id}/${Date.now()}_${file.name}`
      const { error: storageError } = await supabase.storage
        .from('evidencias')
        .upload(fileName, file)

      if (storageError) throw storageError

      // B. Obtener URL de la foto
      const { data: { publicUrl } } = supabase.storage
        .from('evidencias')
        .getPublicUrl(fileName)

      // C. Registrar en Activity Logs y actualizar Profile
      const newXP = xp + 50
      
      // Actualizar XP en la tabla Profiles
      await supabase.from('profiles').update({ xp: newXP }).eq('id', user.id)
      
      // Guardar el log con la foto
      await supabase.from('activity_logs').insert([{ 
        user_id: user.id, 
        xp_earned: 50, 
        photo_url: publicUrl,
        description: 'Gimnasio/Disciplina'
      }])

      // D. Efectos Visuales y Sonoros
      const oldRank = getRank(xp)
      const newRank = getRank(newXP)

      if (newRank.name !== oldRank.name) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3')
        audio.play()
        document.body.classList.add('flash-white')
        setTimeout(() => document.body.classList.remove('flash-white'), 500)
      }

      setXp(newXP)
      alert('¡Prueba subida! +50 XP y Disciplina aumentada. 🔥')

    } catch (error: any) {
      alert('Error en el proceso: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic">CARGANDO...</div>

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-neutral-900 p-8 rounded-3xl border border-neutral-800 w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-black italic tracking-tighter">ACCESO AL CLAN</h2>
          <input 
            type="email" 
            placeholder="Tu email" 
            className="w-full p-4 rounded-xl bg-black border border-neutral-700 focus:border-orange-500 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-white text-black font-black py-4 rounded-xl uppercase hover:bg-orange-500 transition-colors">Entrar</button>
        </div>
      </div>
    )
  }

  const currentRank = getRank(xp)

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center p-6 font-sans">
      <style>{`.flash-white { background-color: white !important; transition: background 0.1s; }`}</style>
      
      <div className="max-w-md w-full space-y-8 mt-12 bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl">
        
        {/* Badge de Rango */}
        <div className="text-center space-y-4">
          <div className={`inline-block px-10 py-4 rounded-2xl border-2 ${currentRank.borderColor} ${currentRank.bg} ${currentRank.color} font-black text-4xl italic tracking-tighter shadow-lg`}>
            {currentRank.name}
          </div>
          <p className="text-neutral-500 font-bold tracking-widest text-sm">{xp} XP TOTALES</p>
        </div>

        {/* Botón de Acción con Input Oculto */}
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" // Esto abre la cámara directo en móviles
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`w-full ${uploading ? 'bg-neutral-700' : 'bg-orange-600 hover:bg-orange-500'} text-white font-black py-6 rounded-3xl shadow-xl transition-all active:scale-95 uppercase italic text-xl flex flex-col items-center gap-1`}
          >
            {uploading ? 'SUBIENDO PRUEBA...' : (
              <>
                <span>REGISTRAR DISCIPLINA</span>
                <span className="text-xs opacity-80">+50 XP (REQUIERE FOTO)</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
          <button onClick={() => window.location.href = '/leaderboard'} className="text-sm font-bold text-orange-500 hover:underline">Ver Ranking 🏆</button>
          <button onClick={() => supabase.auth.signOut()} className="text-[10px] text-neutral-600 uppercase font-black tracking-widest">Cerrar Sesión</button>
        </div>
      </div>
    </main>
  )
}