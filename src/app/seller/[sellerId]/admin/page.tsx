'use client'
import { useUserStore } from '@/lib/userStore'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProfileSection from '@/components/seller/ProfileSection'
import InviteLinkPanel from '@/components/seller/InviteLinkPanel'
import ProductsSection from '@/components/seller/ProductsSection'
import OrdersSection from '@/components/seller/OrdersSection'
import InventorySection from '@/components/seller/InventorySection'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import React from 'react'
import {
  FaUser,
  FaBoxOpen,
  FaClipboardList,
  FaWarehouse,
  FaLink,
} from 'react-icons/fa'

export default function SellerAdminPanel() {
  const user = useUserStore((state) => state.user)
  const router = useRouter()
  const params = useParams()
  const sellerId = params?.sellerId as string
  const [copied, setCopied] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!user) {
      setIsLoading(true)
      return
    }

    setIsLoading(false)

    // Only allow seller_admin for this sellerId
    if (
      user.role !== 'admin' ||
      String(user.admin_for_seller_id) !== sellerId
    ) {
      router.replace('/')
    }
  }, [user, sellerId, router])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Loading...</p>
      </div>
    )
  }

  if (
    !user ||
    user.role !== 'admin' ||
    String(user.admin_for_seller_id) !== sellerId
  ) {
    return null
  }

  // Invite link generator
  const inviteLink = `${
    typeof window !== 'undefined' ? window.location.origin : ''
  }/auth/signup?seller=${sellerId}`
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100'>
      <div className='w-full max-w-6xl px-2 md:px-8'>
        <SellerDashboardContent
          inviteLink={inviteLink}
          copied={copied}
          handleCopy={handleCopy}
          user={user}
        />
      </div>
    </main>
  )
}

// SellerDashboard code as a local component
interface User {
  email: string
  name?: string
  group_name?: string
  account_number?: string
  bank_name?: string
  image?: string
  admin_for_seller_id?: string | number
  role?: string
}

interface SellerDashboardContentProps {
  inviteLink: string
  copied: boolean
  handleCopy: () => void
  user?: User
}

function SellerDashboardContent({
  inviteLink,
  copied,
  handleCopy,
  user,
}: SellerDashboardContentProps) {
  const [tab, setTab] = React.useState<
    'invite' | 'profile' | 'products' | 'orders' | 'inventory'
  >('profile')
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  return (
    <div className='flex flex-col md:flex-row gap-4 w-full relative'>
      {/* Mobile Header */}
      <header className='md:hidden sticky top-0 z-50 bg-white/95 shadow flex items-center justify-between px-4 py-3'>
        <h2 className='text-xl font-bold text-blue-700'>Seller Panel</h2>
        <button
          className='text-blue-700 text-2xl focus:outline-none'
          onClick={() => setSidebarOpen(true)}
          aria-label='Open sidebar'
        >
          &#9776;
        </button>
      </header>
      {/* Sidebar Navigation as Drawer on Mobile */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-50 bg-black bg-opacity-40 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white/95 shadow-xl border-r flex flex-col items-center py-8 px-4 z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto' }}
      >
        <button
          className='md:hidden absolute top-4 right-4 text-2xl text-gray-500'
          onClick={() => setSidebarOpen(false)}
          aria-label='Close sidebar'
        >
          &times;
        </button>
        <nav className='flex flex-col gap-2 w-full mt-8'>
          <Button
            variant={tab === 'invite' ? 'default' : 'outline'}
            onClick={() => {
              setTab('invite')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-2 py-3 text-base ${
              tab === 'invite' ? 'border-l-4 border-blue-600 bg-blue-50' : ''
            }`}
          >
            <FaLink className='text-blue-600' />
            Customer Invite Link
          </Button>
          <Button
            variant={tab === 'profile' ? 'default' : 'outline'}
            onClick={() => {
              setTab('profile')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-2 py-3 text-base ${
              tab === 'profile' ? 'border-l-4 border-blue-600 bg-blue-50' : ''
            }`}
          >
            <FaUser className='text-blue-600' />
            Profile
          </Button>
          <Button
            variant={tab === 'products' ? 'default' : 'outline'}
            onClick={() => {
              setTab('products')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-2 py-3 text-base ${
              tab === 'products' ? 'border-l-4 border-blue-600 bg-blue-50' : ''
            }`}
          >
            <FaBoxOpen className='text-blue-600' />
            Products
          </Button>
          <Button
            variant={tab === 'orders' ? 'default' : 'outline'}
            onClick={() => {
              setTab('orders')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-2 py-3 text-base ${
              tab === 'orders' ? 'border-l-4 border-blue-600 bg-blue-50' : ''
            }`}
          >
            <FaClipboardList className='text-blue-600' />
            Sales/Orders
          </Button>
          <Button
            variant={tab === 'inventory' ? 'default' : 'outline'}
            onClick={() => {
              setTab('inventory')
              setSidebarOpen(false)
            }}
            className={`w-full flex items-center gap-2 py-3 text-base ${
              tab === 'inventory' ? 'border-l-4 border-blue-600 bg-blue-50' : ''
            }`}
          >
            <FaWarehouse className='text-blue-600' />
            Inventory
          </Button>
        </nav>
      </aside>
      {/* Main Content */}
      <section className='flex-1 flex flex-col items-center justify-start py-4 px-2 md:px-8 min-h-[80vh]'>
        <div className='w-full max-w-4xl'>
          {tab === 'invite' ? (
            <InviteLinkPanel
              inviteLink={inviteLink}
              copied={copied}
              handleCopy={handleCopy}
            />
          ) : (
            <Card className='shadow-2xl border-none bg-white/95 rounded-xl'>
              <CardHeader className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <h1 className='text-2xl md:text-3xl font-bold text-blue-700'>
                  Sellers (WhatsApp Group Sellers)
                </h1>
                {user && (
                  <div className='text-sm text-gray-500'>
                    <span className='font-semibold text-blue-600'>
                      {user.email}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className='py-4'>
                {tab === 'profile' && <ProfileSection />}
                {tab === 'products' && <ProductsSection />}
                {tab === 'orders' && <OrdersSection />}
                {tab === 'inventory' && <InventorySection />}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
