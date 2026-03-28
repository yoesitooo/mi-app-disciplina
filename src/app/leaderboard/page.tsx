'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    supabase.from('profiles').select('*').order('xp', { ascending: false })
      .then(({ data }) => setUsers(data || []))
  }, [])

  return (
    <div className="p-6 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-black italic mb-8 uppercase text-orange-500">Ranking del Clan</h1>
      <div className="space-y-4">
        {users.map((u, i) => (
          <div key={u.id} className="flex justify-between items-center p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
            <span className="font-bold text-orange-500">#{i + 1}</span>
            <span className="flex-1 ml-4 font-bold">{u.username || u.email}</span>
            <span className="font-black italic">{u.xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}