import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthPage() {
  const [isNGO, setIsNGO] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ email: '', password: '', name: '', first_name: '', last_name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (error) throw error
        setMessage('✅ Logged in successfully!')
      } else {
        // SIGNUP
        const role = isNGO ? 'ngo' : 'user'
        const metadata = isNGO
          ? { role, name: formData.name, phone: formData.phone }
          : { role, first_name: formData.first_name, last_name: formData.last_name, contact_number: formData.phone }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { data: metadata },
        })
        if (error) throw error

        setMessage('🎉 Registration successful! Please check your email for confirmation.')
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>

        <div className="flex justify-center gap-3 mb-4">
          <button className={`px-3 py-1 rounded ${!isNGO ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setIsNGO(false)}>User</button>
          <button className={`px-3 py-1 rounded ${isNGO ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setIsNGO(true)}>NGO</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {!isLogin && (
            <>
              {isNGO ? (
                <>
                  <input name="name" placeholder="NGO Name" onChange={handleChange} className="border p-2 rounded" required />
                  <input name="phone" placeholder="Contact Phone" onChange={handleChange} className="border p-2 rounded" />
                </>
              ) : (
                <>
                  <input name="first_name" placeholder="First Name" onChange={handleChange} className="border p-2 rounded" required />
                  <input name="last_name" placeholder="Last Name" onChange={handleChange} className="border p-2 rounded" />
                  <input name="phone" placeholder="Contact Number" onChange={handleChange} className="border p-2 rounded" />
                </>
              )}
            </>
          )}
          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="border p-2 rounded" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border p-2 rounded" required />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 rounded mt-3 hover:bg-green-700"
          >
            {loading ? 'Please wait…' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? 'Don’t have an account?' : 'Already registered?'}{' '}
          <button className="text-green-700 font-medium" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        {message && <p className="text-center mt-3 text-sm">{message}</p>}
      </div>
    </div>
  )
}
