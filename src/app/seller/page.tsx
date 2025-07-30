'use client'
import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProfileSection from '@/components/seller/ProfileSection'
import ProductsSection from '@/components/seller/ProductsSection'
import OrdersSection from '@/components/seller/OrdersSection'
import InventorySection from '@/components/seller/InventorySection'

export default function SellerDashboard() {
  const [tab, setTab] = useState<
    'profile' | 'products' | 'orders' | 'inventory'
  >('profile')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col md:flex-row'>
      {/* Mobile Header */}
      <header className='md:hidden sticky top-0 z-30 bg-white/95 shadow flex items-center justify-between px-4 py-3'>
        <h2 className='text-xl font-bold text-blue-700'>Seller Panel</h2>
        <button
          className='text-blue-700 text-2xl focus:outline-none'
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label='Open sidebar'
        >
          &#9776;
        </button>
      </header>
      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white/90 shadow-xl border-r flex flex-col items-center py-8 px-4 md:min-h-screen z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ minHeight: '100vh' }}
      >
        <button
          className='md:hidden absolute top-4 right-4 text-2xl text-gray-500'
          onClick={() => setSidebarOpen(false)}
          aria-label='Close sidebar'
        >
          &times;
        </button>
        <h2 className='text-2xl font-bold text-blue-700 mb-8 text-center'>
          Seller Panel
        </h2>
        <nav className='flex md:flex-col gap-2 w-full'>
          <Button
            variant={tab === 'profile' ? 'default' : 'outline'}
            onClick={() => {
              setTab('profile')
              setSidebarOpen(false)
            }}
            className='w-full'
          >
            Profile
          </Button>
          <Button
            variant={tab === 'products' ? 'default' : 'outline'}
            onClick={() => {
              setTab('products')
              setSidebarOpen(false)
            }}
            className='w-full'
          >
            Products
          </Button>
          <Button
            variant={tab === 'orders' ? 'default' : 'outline'}
            onClick={() => {
              setTab('orders')
              setSidebarOpen(false)
            }}
            className='w-full'
          >
            Sales/Orders
          </Button>
          <Button
            variant={tab === 'inventory' ? 'default' : 'outline'}
            onClick={() => {
              setTab('inventory')
              setSidebarOpen(false)
            }}
            className='w-full'
          >
            Inventory
          </Button>
        </nav>
      </aside>
      {/* Main Content */}
      <section className='flex-1 flex flex-col items-center justify-start py-4 px-2 md:px-8'>
        <div className='w-full max-w-4xl'>
          <Card className='shadow-xl border-none bg-white/95'>
            <CardHeader className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <h1 className='text-3xl font-bold text-blue-700'>
                Sellers (WhatsApp Group Sellers)
              </h1>
            </CardHeader>
            <CardContent className='py-4'>
              {tab === 'profile' && <ProfileSection />}
              {tab === 'products' && <ProductsSection />}
              {tab === 'orders' && <OrdersSection />}
              {tab === 'inventory' && <InventorySection />}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
    // End of SellerDashboard component
  )
}
