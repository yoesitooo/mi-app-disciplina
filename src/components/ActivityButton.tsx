'use client'
import { supabase } from '@/lib/supabase'

export default function ActivityButton({ userId }: { userId: string }) {
  const addActivity = async () => {
    // 1. Registrar la actividad en los logs
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert([{ 
        user_id: userId, 
        activity_name: 'Gimnasio', 
        xp_earned: 50 
      }])

    if (logError) return alert('Error al registrar')

    // 2. Sumar XP al perfil del usuario
    // Nota: Aquí podrías añadir la lógica de subir de nivel si XP > 200
    alert('¡+50 XP ganados! Disciplina de acero. 🔥')
  }

  return (
    <button 
      onClick={addActivity}
      className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition active:scale-95"
    >
      Registrar Gimnasio 💪
    </button>
  )
}