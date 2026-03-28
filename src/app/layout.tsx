import './globals.css'
import Navigation from '../components/Navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <div className="max-w-md mx-auto min-h-screen relative pb-24">
          {children}
          <Navigation />
        </div>
      </body>
    </html>
  )
}