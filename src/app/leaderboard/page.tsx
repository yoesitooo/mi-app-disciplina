'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getRank } from '@/lib/constants'

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
      if (data) setProfiles(data)
    }
    fetchLeaderboard()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-black italic mb-8 border-b-4 border-orange-600 inline-block">TOP DISCIPLINA</h1>
      <div className="space-y-4">
        {profiles.map((p, index) => {
          const rank = getRank(p.xp)
          return (
            <div key={p.id} className="flex items-center justify-between bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-neutral-600">#{index + 1}</span>
                <div>
                  <p className="font-bold">{p.email.split('@')[0]}</p>
                  <p className={`text-xs font-black ${rank.color}`}>{rank.name}</p>
                </div>
              </div>
              <p className="text-xl font-black italic">{p.xp} XP</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}