'use client'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import AppToaster from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { registerSeller, registerCustomer } from '@/lib/api'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [type, setType] = useState<'seller' | 'customer'>('seller')
  // Seller fields
  const [sellerName, setSellerName] = useState('')
  const [groupName, setGroupName] = useState('')
  const [sellerEmail, setSellerEmail] = useState('')
  const [sellerPhone, setSellerPhone] = useState('')
  // Customer fields
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPassword, setCustomerPassword] = useState('')
  const [customerConfirm, setCustomerConfirm] = useState('')
  const [error, setError] = useState('')
  // Removed unused loading state

  const sellerMutation = useMutation({
    mutationFn: async () => {
      return await registerSeller({
        name: sellerName,
        groupName,
        email: sellerEmail,
        phone: sellerPhone,
      })
    },
    onError: (err) => setError(err.message || 'Registration failed'),
    onSuccess: () => {
      setError('')
      setSellerName('')
      setGroupName('')
      setSellerEmail('')
      setSellerPhone('')
      toast.success(
        'You will be provided username and password. Please check your email.'
      )
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    },
  })

  function validateSeller() {
    if (
      !sellerName.trim() ||
      !groupName.trim() ||
      !sellerEmail.trim() ||
      !sellerPhone.trim()
    ) {
      setError('All fields are required.')
      return false
    }
    if (!/^[0-9]{10}$/.test(sellerPhone)) {
      setError('Phone number must be 10 digits.')
      return false
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(sellerEmail)) {
      setError('Invalid email address.')
      return false
    }
    return true
  }

  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateSeller()) return
    sellerMutation.mutate()
  }

  const customerMutation = useMutation({
    mutationFn: async () => {
      return await registerCustomer({
        name: customerName,
        email: customerEmail,
        password: customerPassword,
      })
    },
    onError: (err) => setError(err.message || 'Registration failed'),
    onSuccess: () => {
      setError('')
      setCustomerName('')
      setCustomerEmail('')
      setCustomerPassword('')
      setCustomerConfirm('')
      router.push('/auth/login')
    },
  })

  function validateCustomer() {
    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPassword.trim() ||
      !customerConfirm.trim()
    ) {
      setError('All fields are required.')
      return false
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
      setError('Invalid email address.')
      return false
    }
    if (customerPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return false
    }
    if (customerPassword !== customerConfirm) {
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateCustomer()) return
    customerMutation.mutate()
  }

  return (
    <>
      <AppToaster />
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
              <div className='flex justify-center gap-4 mb-4'>
                <Button
                  variant={type === 'seller' ? 'default' : 'outline'}
                  onClick={() => setType('seller')}
                  className='w-32'
                >
                  Seller
                </Button>
                <Button
                  variant={type === 'customer' ? 'default' : 'outline'}
                  onClick={() => setType('customer')}
                  className='w-32'
                >
                  Customer
                </Button>
              </div>
              <h1 className='text-2xl font-bold mb-2'>
                Sign Up as {type === 'seller' ? 'Seller' : 'Customer'}
              </h1>
            </CardHeader>
            <CardContent>
              {type === 'seller' ? (
                <form className='space-y-4' onSubmit={handleSellerSubmit}>
                  <Input
                    type='text'
                    placeholder='Name'
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                  />
                  <Input
                    type='text'
                    placeholder='Online Group Name'
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                  />
                  <Input
                    type='email'
                    placeholder='Email Address'
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                  />
                  <Input
                    type='tel'
                    placeholder='Phone Number'
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                    maxLength={10}
                  />
                  {error && <div className='text-red-400 text-sm'>{error}</div>}
                  <Button
                    type='submit'
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded'
                    disabled={sellerMutation.isPending}
                  >
                    Register Seller
                  </Button>
                  <div className='text-center text-xs text-gray-400 mt-4'>
                    Already have an account?
                    <Link
                      href='/auth/login'
                      className='text-blue-400 hover:underline ml-2'
                    >
                      Login
                    </Link>
                  </div>
                </form>
              ) : (
                <form className='space-y-4' onSubmit={handleCustomerSubmit}>
                  <Input
                    type='text'
                    placeholder='Name'
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                  />
                  <Input
                    type='email'
                    placeholder='Email Address'
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                  />
                  <Input
                    type='password'
                    placeholder='Password'
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                  />
                  <Input
                    type='password'
                    placeholder='Confirm Password'
                    value={customerConfirm}
                    onChange={(e) => setCustomerConfirm(e.target.value)}
                    required
                    className='bg-neutral-900 text-white border border-neutral-700 placeholder-gray-400'
                  />
                  {error && <div className='text-red-400 text-sm'>{error}</div>}
                  <Button
                    type='submit'
                    className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded'
                    disabled={customerMutation.isPending}
                  >
                    Register Customer
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
                    {/* Google SVG icon */}
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
                    Sign up with Google
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
