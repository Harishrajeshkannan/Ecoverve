import { useState, useEffect } from 'react'
import DonationPage from './components/DonationPage'
import LandingPage from './components/LandingPage'
import NGODashboard from './components/NgoDashboard'
import UserDashboard from './components/UserDashboard'
import BlogPage from './components/BlogPage'
import BlogDetail from './components/BlogDetail'
import { supabase } from './lib/supabaseClient'
import AuthPage from './components/AuthPage'

function App() {
  const [session, setSession] = useState(null)
  const [route, setRoute] = useState('home')
  const [routeParams, setRouteParams] = useState(null)

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

  const navigate = (to, params) => {
    setRoute(to)
    setRouteParams(params)
  }

  // When not authenticated, show LandingPage by default.
  // Only show AuthPage when the user explicitly navigates to the login route.
  if (!session) {
    if (route === 'login') return <AuthPage navigate={navigate} />
    if (route === 'signup') return <AuthPage navigate={navigate} initialIsLogin={false} initialIsNGO={false} />
    if (route === 'signup-ngo') return <AuthPage navigate={navigate} initialIsLogin={false} initialIsNGO={true} />
    if (route === 'blogs') return <BlogPage navigate={navigate} />
    if (route === 'blog-detail') return <BlogDetail navigate={navigate} blogId={routeParams?.id} />
    if (route === 'donate') return <DonationPage navigate={navigate} />
    return <LandingPage navigate={navigate} />
  }

  // Handle top-level routes
  if (route === 'donate') return <DonationPage navigate={navigate} />
  if (route === 'blogs') return <BlogPage navigate={navigate} />
  if (route === 'blog-detail') return <BlogDetail navigate={navigate} blogId={routeParams?.id} />
  if (route === 'edit-blog') return <BlogPage navigate={navigate} editId={routeParams?.id} />

  // Default to dashboard based on role
  return role === 'ngo' ? <NGODashboard session={session} navigate={navigate} /> : <UserDashboard session={session} navigate={navigate} />
}

export default App


