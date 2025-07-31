'use client'
import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useUserStore } from '@/lib/userStore'

export default function AuthPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const router = useRouter()
  const setUser = useUserStore((state) => state.setUser)
  const user = useUserStore((state) => state.user)

  React.useEffect(() => {
    if (user) {
      if (user.role === 'owner') {
        router.replace('/owner')
      } else if (user.role === 'admin' && user.admin_for_seller_id) {
        router.replace(`/seller/${user.admin_for_seller_id}/admin`)
      } else if (user.role === 'customer' && user.seller_id) {
        router.replace(`/seller/${user.seller_id}`)
      } else {
        router.replace('/')
      }
    }
  }, [user, router])

  const signInMutation = useMutation({
    mutationFn: async () => {
      // Try customer login first (Supabase auth)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error && data?.user) {
        // Customer login success
        return { type: 'customer', data }
      }
      // If customer login fails, try users table for owner/admin
      const { data: userRows, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single()
      if (userError || !userRows) {
        throw error || userError || new Error('Login failed')
      }
      // Owner/Admin login success
      return { type: 'users', data: userRows }
    },
    onError: (err) => setError(err.message || 'Login failed'),
    onSuccess: async (data) => {
      setError('')
      if (data.type === 'customer') {
        const user = data.data?.user || data.data?.session?.user
        setUser({
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'customer',
          name: user.user_metadata?.name,
          seller_id: user.user_metadata?.seller_id,
          admin_for_seller_id: user.user_metadata?.admin_for_seller_id,
        })
        router.push('/')
      } else if (data.type === 'users') {
        const profile = data.data
        setUser({
          id: profile.id,
          email: profile.email,
          role: profile.role,
          name: profile.name,
          seller_id: profile.seller_id,
          admin_for_seller_id: profile.admin_for_seller_id,
          ...profile,
        })
        if (profile.role === 'owner') {
          router.push('/owner')
        } else if (
          profile.role === 'admin' &&
          profile.admin_for_seller_id
        ) {
          router.push(`/seller/${profile.admin_for_seller_id}/admin`)
        } else if (profile.role === 'customer' && profile.seller_id) {
          router.push(`/seller/${profile.seller_id}`)
        } else {
          router.push('/')
        }
      }
    },
  })

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    signInMutation.mutate()
  }
  return (
    <main className='relative min-h-screen flex items-center justify-center'>
      <Image
        src='/images/background.jpg'
        alt='Background'
        width={1920}
        height={1080}
        className='absolute inset-0 w-full h-full object-cover z-0 blur-xs'
      />
      <div className='absolute inset-0 bg-black/60 z-10' />
      <div className='relative z-20 w-full max-w-md mx-auto flex flex-col justify-center items-center min-h-screen'>
        <Card className='w-full max-w-md bg-black/80 text-white border-none shadow-xl'>
          <CardHeader className='text-center'>
            <h1 className='text-3xl font-bold mb-2'>Sign In</h1>
            <div className='text-base text-gray-300 mb-4'>
              Welcome! Please enter your login details below.
            </div>
          </CardHeader>
          <CardContent>
            <form className='space-y-4'>
              <Input
                type='email'
                placeholder='Email Address'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
              />
              <Input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
              />
              <div className='flex justify-end'>
                <a href='#' className='text-xs text-blue-400 hover:underline'>
                  Forgot the password?
                </a>
              </div>
              {error && <div className='text-red-400 text-sm'>{error}</div>}

              <Button
                type='submit'
                onClick={handleSignIn}
                className='w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded'
                disabled={signInMutation.isPending}
              >
                Login
              </Button>
              <div className='flex items-center gap-2 my-2'>
                <span className='flex-1 h-px bg-gray-700' />
                <span className='text-xs text-gray-400'>OR</span>
                <span className='flex-1 h-px bg-gray-700' />
              </div>
              <Button
                type='button'
                variant='outline'
                className='w-full flex items-center justify-center gap-2 border border-neutral-700 text-white'
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 20 20'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <defs>
                    <clipPath id='clip0_17_40'>
                      <rect
                        width='19.86'
                        height='19.25'
                        fill='white'
                        transform='translate(0.195007 0.25)'
                      />
                    </clipPath>
                  </defs>
                  <g clipPath='url(#clip0_17_40)'>
                    <path
                      d='M19.805 10.2306C19.805 9.55098 19.7478 8.86781 19.6247 8.2002H10.195V12.0498H15.805C15.5702 13.2998 14.805 14.3498 13.7302 15.0498V17.2998H16.805C18.5702 15.6998 19.805 13.2306 19.805 10.2306Z'
                      fill='#4285F4'
                    />
                    <path
                      d='M10.195 19.0002C12.7302 19.0002 14.8702 18.1498 16.805 17.2998L13.7302 15.0498C12.6702 15.7498 11.4302 16.1498 10.195 16.1498C7.75501 16.1498 5.73001 14.5498 4.97001 12.2998H1.80501V14.5998C3.73501 17.7998 6.80501 19.0002 10.195 19.0002Z'
                      fill='#34A853'
                    />
                    <path
                      d='M4.97001 12.2998C4.75501 11.5998 4.63501 10.8498 4.63501 10.0998C4.63501 9.34981 4.75501 8.59981 4.97001 7.89981V5.59981H1.80501C1.23501 6.79981 0.945007 8.09981 0.945007 9.39981C0.945007 10.6998 1.23501 11.9998 1.80501 13.1998L4.97001 12.2998Z'
                      fill='#FBBC05'
                    />
                    <path
                      d='M10.195 4.04981C11.5302 4.04981 12.755 4.49981 13.7302 5.29981L16.805 2.19981C14.8702 0.599805 12.7302 -0.250195 10.195 -0.250195C6.80501 -0.250195 3.73501 1.94981 1.80501 5.59981L4.97001 7.89981C5.73001 5.64981 7.75501 4.04981 10.195 4.04981Z'
                      fill='#EA4335'
                    />
                  </g>
                </svg>
                Sign in with Google
              </Button>
              <div className='text-center text-xs text-gray-400 mt-4'>
                Don&apos;t have an account?
                <Link
                  href='/auth/signup'
                  className='text-blue-400 hover:underline'
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
