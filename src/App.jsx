import { useState } from 'react'
import './App.css'
import DonationPage from './components/DonationPage'
import LandingPage from './components/LandingPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DonationPage />
      <LandingPage />
    </>
  )
}

export default App;
