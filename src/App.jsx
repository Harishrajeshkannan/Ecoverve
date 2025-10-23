import { useState, useEffect } from 'react'
import DonationPage from './components/DonationPage'
import LandingPage from './components/LandingPage'
import NGODashboard from './components/NgoDashboard'
import UserDashboard from './components/UserDashboard'
import { supabase } from './lib/supabaseClient'
import AuthPage from './components/AuthPage'

function App() {
  const [session, setSession] = useState(null)
  const [route, setRoute] = useState('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Determine role from session metadata (set during signUp in AuthPage)
  const role = session?.user?.user_metadata?.role || session?.user?.role || null

  const navigate = (to) => setRoute(to)

  // When not authenticated, show LandingPage by default.
  // Only show AuthPage when the user explicitly navigates to the login route.
  if (!session) {
    if (route === 'login') return <AuthPage navigate={navigate} />
    if (route === 'signup') return <AuthPage navigate={navigate} initialIsLogin={false} initialIsNGO={false} />
    if (route === 'signup-ngo') return <AuthPage navigate={navigate} initialIsLogin={false} initialIsNGO={true} />
    return <LandingPage navigate={navigate} />
  }

  // simple routing: donate page is top-level; otherwise render dashboards
  if (route === 'donate') return <DonationPage navigate={navigate} />

  return role === 'ngo' ? <NGODashboard session={session} navigate={navigate} /> : <UserDashboard session={session} navigate={navigate} />
}

export default App


