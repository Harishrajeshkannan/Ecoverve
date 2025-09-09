import { useState } from 'react'
import './App.css'
import DonationPage from './components/DonationPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DonationPage />
    </>
  )
}

export default App;
