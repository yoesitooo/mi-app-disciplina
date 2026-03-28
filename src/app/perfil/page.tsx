'use client'
import { supabase } from '@/lib/supabase'

export default function Perfil() {
  return (
    <div className="p-6 text-white min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-800 w-full max-w-sm text-center">
        <div className="w-24 h-24 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-black">
          ?
        </div>
        <h2 className="text-2xl font-black uppercase italic">Mi Perfil</h2>
        <p className="text-neutral-500 text-sm mb-8 italic text-center">Próximamente: Cambiar foto y nombre</p>
        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
          className="w-full bg-red-600/20 text-red-500 font-bold py-4 rounded-xl uppercase border border-red-600/30"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}