import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [roleMsg, setRoleMsg] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    if (data?.user) {
      // Example: set custom role metadata here if needed
      setRoleMsg('Signup successful! Please check your email to verify.')
    }
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError(error.message)
    if (data?.user) {
      // Example: check user role from metadata
      const role = data.user.user_metadata?.role
      if (role === 'owner' || role === 'admin') {
        router.push('/owner')
      } else {
        setRoleMsg('You are logged in as a customer/seller.')
      }
    }
    setLoading(false)
  }

  return (
    <main className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <h1 className='text-2xl font-bold text-blue-700'>Login / Signup</h1>
        </CardHeader>
        <CardContent>
          <form className='space-y-4'>
            <Input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type='password'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <div className='text-red-500 text-sm'>{error}</div>}
            {roleMsg && <div className='text-green-600 text-sm'>{roleMsg}</div>}
            <div className='flex gap-4'>
              <Button
                type='submit'
                onClick={handleSignIn}
                className='flex-1'
                disabled={loading}
              >
                Login
              </Button>
              <Button
                type='button'
                onClick={handleSignUp}
                variant='secondary'
                className='flex-1'
                disabled={loading}
              >
                Signup
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
