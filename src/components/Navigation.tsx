'use client'
import { usePathname, useRouter } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { id: '/', label: 'Inicio', icon: '🏠' },
    { id: '/leaderboard', label: 'Ranking', icon: '🏆' },
    { id: '/perfil', label: 'Perfil', icon: '👤' },
  ]

  return (
    <nav className="fixed bottom-6 left-6 right-6 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-2 rounded-3xl flex justify-around shadow-2xl z-50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.id)}
            className={`flex flex-col items-center p-2 transition-all ${isActive ? 'text-orange-500 scale-110' : 'text-neutral-500 opacity-50'}`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}