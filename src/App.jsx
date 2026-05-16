import { useEffect, useState } from 'react'
import './App.css'
import vskvid from './assets/vskvid.mp4'

// ⚠️ Realtime Database එකට අදාළ නිවැරදි Imports මෙන්න:
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyBcsX1C4SpuOL7aUyvzMDMFKdivccFrXyM',
  authDomain: 'vesak-wishes.firebaseapp.com',
  projectId: 'vesak-wishes',
  databaseURL: 'https://vesak-wishes-default-rtdb.firebaseio.com',
  storageBucket: 'vesak-wishes.firebasestorage.app',
  messagingSenderId: '538274609167',
  appId: '1:538274609167:web:41084e797e5d2d979a8b7a',
}

// Initialize Firebase Realtime Database
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

function App() {
  const [isMuted, setIsMuted] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [wishes, setWishes] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  // how long to show the floating sent wish on screen (milliseconds)
  const DISPLAY_MS = 4 * 1000 // 4 seconds
  const [lastSentWish, setLastSentWish] = useState(null)
  // small company label shown above the CTA (change as needed)
  const COMPANY_NAME = 'PM Technologies'

  // 🔄 Database එකෙන් පැතුම් Real-time කියවීම
  useEffect(() => {
    const wishesRef = ref(db, 'wishes')

    return onValue(
      wishesRef,
      (snapshot) => {
        const data = snapshot.val()
        console.debug('Realtime Database data received:', data)
          if (data) {
          const list = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .reverse()
          setWishes(list)
        } else {
          setWishes([])
        }
      },
      (err) => {
        console.error('onValue error', err)
      }
    )
  }, [])

  const closeModal = () => {
    setIsModalOpen(false)
    setName('')
    setMessage('')
  }

  // 💾 අලුත් පැතුමක් සජීවීව Database එකට එකතු කිරීම
  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedMessage = message.trim()

    if (!trimmedName || !trimmedMessage) {
      return
    }

    const left = 50 + (Math.random() * 36 - 18)
    const duration = 5.8 + Math.random() * 1.8
    const createdAt = Date.now()

    try {
      setIsSaving(true)
      const wishesRef = ref(db, 'wishes')

      await push(wishesRef, {
        left,
        name: trimmedName,
        message: trimmedMessage,
        duration,
        createdAt,
      })

      // show this wish briefly as a floating card
      setLastSentWish({ left, name: trimmedName, message: trimmedMessage, duration, createdAt })

      console.debug('Wish saved successfully to Realtime DB')
      closeModal()
    } catch (error) {
      console.error('Failed to save wish', error)
      alert('Failed to send wish: ' + (error && error.message ? error.message : error))
    } finally {
      setIsSaving(false)
    }
  }

  // clear lastSentWish after DISPLAY_MS
  useEffect(() => {
    if (!lastSentWish) return
    const t = setTimeout(() => setLastSentWish(null), DISPLAY_MS)
    return () => clearTimeout(t)
  }, [lastSentWish, DISPLAY_MS])

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover scale-110 border-0 opacity-95"
          src={vskvid}
          title="Vesak background video"
          autoPlay
          loop
          playsInline
          muted={isMuted}
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_40%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_30%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-40 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="hero-header mx-auto flex w-full max-w-5xl flex-col items-center pt-5 text-center sm:pt-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.45em] text-amber-100/80 shadow-[0_0_40px_rgba(251,191,36,0.08)] backdrop-blur-md">
            Vesak Wish 2026
          </div>
          <h1
            className="mt-8 text-balance text-3xl font-semibold tracking-[0.12em] text-amber-100 drop-shadow-[0_0_24px_rgba(245,158,11,0.7)] sm:text-4xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: '"Noto Serif Sinhala", "Noto Serif", Georgia, serif' }}
          >
            වෙසක් ආශිර්වාද
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/78 sm:text-base lg:text-lg">
            May all beings be happy and peaceful
          </p>
        </header>

        {/* Wishes Display Area */}
            <aside className={`wish-list-panel z-20 pointer-events-auto ${panelOpen ? 'open' : ''}`}>
              <h3 className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-100/80">Wishes</h3>
              <ul className="space-y-3">
                {wishes.slice().map((w) => (
                  <li key={w.id} className="rounded-lg border border-white/8 bg-white/6 p-3 text-sm">
                    <div className="text-[11px] text-amber-100/80 uppercase tracking-[0.25em]">{w.name}</div>
                    <div className="mt-1 text-white/92">{w.message}</div>
                    
                  </li>
                ))}
              </ul>
            </aside>

            {/* Floating recent wish (shows only the last-sent message briefly) */}
            {lastSentWish ? (
              <div className="floating-container pointer-events-none">
                <article className="wish-card floating-wish floating-appear pointer-events-auto">
                  <p className="wish-from text-[10px] uppercase tracking-[0.3em] text-amber-100/70">Wish from {lastSentWish.name}</p>
                  <p className="wish-message mt-2.5 text-[0.92rem] leading-6 text-white/92 sm:text-[0.98rem]">{lastSentWish.message}</p>
                </article>
              </div>
            ) : null}

        <div className="fixed right-4 top-4 z-30 sm:right-8 sm:top-8">
          <button
            type="button"
            onClick={() => setIsMuted((currentMuted) => !currentMuted)}
            className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-black/35 px-4 py-2 text-xs font-medium tracking-[0.18em] text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.14)] backdrop-blur-xl transition hover:border-amber-200/40 hover:bg-black/50"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.85)]" />
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        {/* Mobile: navbar-like icon to open/close wishes panel */}
        <div className="fixed left-4 top-4 z-40">
          <button
            type="button"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
            aria-label={panelOpen ? 'Close wishes' : 'Open wishes'}
            className="panel-toggle"
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect y="0" width="20" height="2" rx="1" fill="white" opacity="0.9" />
              <rect y="6" width="20" height="2" rx="1" fill="white" opacity="0.85" />
              <rect y="12" width="20" height="2" rx="1" fill="white" opacity="0.75" />
            </svg>
            <span className="panel-toggle-label">Wishes</span>
          </button>
        </div>

        {/* overlay when mobile panel open */}
        {panelOpen ? <div className="panel-overlay" onClick={() => setPanelOpen(false)} aria-hidden /> : null}

        <div className="fixed bottom-10 left-1/2 z-30 w-full max-w-xl -translate-x-1/2 px-5 sm:bottom-12">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group flex w-full items-center justify-center rounded-full border border-amber-200/20 bg-linear-to-r from-amber-300 via-amber-400 to-yellow-200 px-6 py-4 text-sm font-semibold text-zinc-950 shadow-[0_0_55px_rgba(251,191,36,0.25)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_0_75px_rgba(251,191,36,0.35)] sm:text-base"
          >
            <span className="mr-3 text-base leading-none">✦</span>
            Light a Wish · පැතුමක් එක් කරන්න
          </button>
        </div>

          <div className="cta-company">- {COMPANY_NAME} -</div>
        {isModalOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-xl">
            <div className="absolute inset-0" onClick={closeModal} aria-hidden="true" />
            <div className="relative w-full max-w-[95vw] sm:max-w-xl rounded-4xl border border-white/15 bg-white/10 p-4 sm:p-6 shadow-[0_24px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs uppercase tracking-[0.25em] text-white/70 transition hover:bg-black/45 hover:text-white"
              >
                Close
              </button>

              <div className="mb-6 max-w-md">
                <p className="text-xs uppercase tracking-[0.45em] text-amber-100/70">
                  Offer a blessing
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-amber-50 sm:text-3xl">
                  Add your wish to the lantern sky
                </h2>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block space-y-2">
                  <span className="text-sm text-white/80">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-white placeholder:text-white/38 outline-none transition focus:border-amber-300/50 focus:bg-black/35"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm text-white/80">Message</span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    required
                    rows="5"
                    placeholder="Write a heartfelt blessing..."
                    className="w-full resize-none rounded-2xl border border-white/12 bg-black/25 px-4 py-3 text-white placeholder:text-white/38 outline-none transition focus:border-amber-300/50 focus:bg-black/35"
                  />
                </label>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-full bg-linear-to-r from-amber-300 via-amber-400 to-yellow-200 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_45px_rgba(251,191,36,0.22)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? 'Sending...' : 'Send Wish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

export default App