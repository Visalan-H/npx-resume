import { logout } from '../lib/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

interface Props {
  showLogout?: boolean
  showDashboard?: boolean
}

export default function NavBar({ showLogout = false, showDashboard = false }: Props) {
  const navigate = useNavigate()
  const { isDark, toggle } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const btnClass = `text-xs tracking-wider px-3 py-1.5 border transition-all duration-150 active:scale-[0.97] ${
    isDark
      ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900/50'
      : 'border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 hover:bg-zinc-100'
  }`

  return (
    <nav
      className={`flex items-center justify-between px-6 sm:px-10 py-4 border-b shrink-0 ${
        isDark ? 'border-zinc-800' : 'border-zinc-200'
      }`}
    >
      <Link to="/" className="text-sm font-bold tracking-widest uppercase text-amber-500 hover:text-amber-400 transition-colors">
        npx-resume
      </Link>

      <div className="flex items-center gap-3">
        <button onClick={toggle} className={btnClass}>
          {isDark ? '[ light ]' : '[ dark ]'}
        </button>
        {showDashboard && (
          <Link to="/dashboard" className={btnClass}>[ dashboard ]</Link>
        )}
        {showLogout && (
          <button onClick={handleLogout} className={btnClass}>
            [ logout ]
          </button>
        )}
      </div>
    </nav>
  )
}
