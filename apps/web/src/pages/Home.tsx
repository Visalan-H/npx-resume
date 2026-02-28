import { motion } from 'motion/react'
import { OAuthProvider } from 'appwrite'
import { account } from '../lib/appwrite'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import NavBar from '../components/NavBar'

export default function Home() {
  const { isDark } = useTheme()
  const { user } = useAuth()

  const handleLogin = () => {
    account.createOAuth2Session({
      provider: OAuthProvider.Github,
      success: `${window.location.origin}/dashboard`,
      failure: `${window.location.origin}/`
    })
  }

  const transition = {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1] as const,
  }

  return (
    <div
      className={`home-bg min-h-screen flex flex-col font-mono selection:bg-amber-500/30 ${
        isDark ? 'bg-[#000000] text-zinc-100' : 'bg-[#FAFAFA] text-zinc-900'
      }`}
    >
      <NavBar showDashboard={!!user} />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-20 w-full max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.1 }}
          className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-amber-500"
        >
          Terminal Resume Hosting
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.25 }}
          className="mt-8 font-mono font-bold uppercase tracking-tight text-[clamp(2.5rem,6vw,5rem)] leading-[1.1]"
        >
          Your Resume
          <br />
          <span className={isDark ? 'text-zinc-600' : 'text-zinc-400'}>In The Terminal.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.4 }}
          className={`mt-8 max-w-xl text-xs sm:text-sm uppercase tracking-widest leading-relaxed ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          Upload once, get one command, and let anyone run your profile with zero setup.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.55 }}
          className={`mt-12 inline-flex items-center border px-6 sm:px-8 py-4 sm:py-5 rounded-none ${
            isDark ? 'bg-[#0A0A0A] border-zinc-800' : 'bg-white border-zinc-300'
          }`}
        >
          <span className="text-amber-500 font-bold text-sm sm:text-base mr-3">&gt;</span>
          <span className={`text-sm sm:text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            npx showresume yourname
          </span>
          <span className="home-cursor ml-2 text-sm sm:text-base" aria-hidden="true">
            _
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          transition={{ ...transition, delay: 0.7 }}
          onClick={handleLogin}
          className={`mt-14 rounded-none border-2 px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-150 ${
            isDark
              ? 'border-zinc-800 bg-zinc-900 text-white hover:border-amber-500 hover:text-amber-500'
              : 'border-zinc-300 bg-white text-black hover:border-amber-500 hover:text-amber-600'
          }`}
        >
          [ SIGN IN WITH GITHUB ]
        </motion.button>
      </main>


    </div>
  )
}
