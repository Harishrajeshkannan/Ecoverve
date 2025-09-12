import { useState } from 'react'
import DonationPage from './components/DonationPage'
import LandingPage from './components/LandingPage'
import NGODashboard from './components/NgoDashboard'
import UserDashboard from './components/UserDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LandingPage />
      <NGODashboard />
      <UserDashboard />
      <DonationPage />
    </>
  )
}

export default App;
