'use client'
import React, { useState } from 'react'
import ManageSellers from '@/components/owner/ManageSellers'

export default function OwnerDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  return (
    <div className='min-h-screen flex'>
      {/* Sidebar - Owner Responsibilities */}
      <aside className='hidden md:flex flex-col w-64 shadow-lg p-6'>
        <div className='flex items-center gap-2 mb-8'>
          <span className='text-xl font-bold text-blue-700'>Owner Panel</span>
        </div>
        <nav className='flex-1'>
          <ul className='space-y-2'>
            <li>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${
                  activeSection === 'dashboard'
                    ? 'text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${
                  activeSection === 'manage-admins'
                    ? 'text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('manage-admins')}
              >
                Manage Admins
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${
                  activeSection === 'manage-sellers'
                    ? 'text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('manage-sellers')}
              >
                Manage Seller
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${
                  activeSection === 'approve-products'
                    ? 'text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('approve-products')}
              >
                Approve Products
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${
                  activeSection === 'all-orders'
                    ? 'text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('all-orders')}
              >
                All Orders
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${
                  activeSection === 'sales-analytics'
                    ? 'text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('sales-analytics')}
              >
                Sales Analytics
              </button>
            </li>
            <li>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full text-left ${
                  activeSection === 'platform-settings'
                    ? 'text-blue-700 font-semibold'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveSection('platform-settings')}
              >
                Platform Settings
              </button>
            </li>
          </ul>
        </nav>
        <div className='mt-8'>
          <h3 className='text-sm font-semibold mb-2'>Quick Actions</h3>
          <ul className='space-y-1'>
            <li className='flex items-center gap-2'>
              <span className='w-6 h-6 rounded-full bg-blue-200' /> Add Admin
            </li>
            <li className='flex items-center gap-2'>
              <span className='w-6 h-6 rounded-full bg-green-200' /> Approve
              Product
            </li>
            <li className='flex items-center gap-2'>
              <span className='w-6 h-6 rounded-full bg-yellow-200' /> View
              Reports
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className='flex-1 p-4 md:p-8'>
        {/* Dynamic Main Content */}
        {activeSection === 'dashboard' && (
          <>
            {/* Header */}
            <div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
              <div className='flex items-center gap-2 w-full md:w-auto'>
                <input
                  type='text'
                  placeholder='Search Anythings'
                  className='w-full md:w-80 px-4 py-2 rounded-lg border border-gray-200 shadow-sm'
                />
              </div>
              <div className='flex items-center gap-6'>
                <span className='font-semibold'>
                  Your Balance <span className='text-blue-700'>$1365</span>
                </span>
                <div className='flex items-center gap-2'>
                  <span className='w-8 h-8 rounded-full bg-gray-300' />
                  <span className='font-medium'>Khandoker Rasel</span>
                </div>
              </div>
            </div>

            {/* Owner Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
              <SummaryCard title='Admins' value='5' percent='+' color='blue' />
              <SummaryCard
                title='Products Pending'
                value='12'
                percent='2 new'
                color='cyan'
              />
              <SummaryCard
                title='Total Sales'
                value='$27,208'
                percent='2.87%'
                color='green'
              />
              <SummaryCard
                title='Orders'
                value='2590'
                percent='+'
                color='pink'
              />
            </div>

            {/* Owner Analytics Section */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-white rounded-xl shadow p-6'>
                  <h2 className='font-semibold text-lg mb-2'>
                    Sales Analytics
                  </h2>
                  {/* Chart Placeholder */}
                  <div className='h-32 bg-gray-100 rounded' />
                  <div className='flex justify-between mt-4'>
                    <div>
                      <span className='font-bold text-xl'>$27,208</span>
                      <span className='ml-2 text-green-500 text-xs'>
                        ▲ 2.87%
                      </span>
                      <div className='text-xs text-gray-400'>Total Sales</div>
                    </div>
                    <div>
                      <span className='font-bold text-xl'>2590</span>
                      <span className='ml-2 text-green-500 text-xs'>
                        ▲ 2.87%
                      </span>
                      <div className='text-xs text-gray-400'>Total Orders</div>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-xl shadow p-6'>
                  <h2 className='font-semibold text-lg mb-2'>
                    Admins Overview
                  </h2>
                  <div className='flex flex-col items-center'>
                    <div className='w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2'>
                      {/* Admins Image Placeholder */}
                      <span className='text-4xl'>👥</span>
                    </div>
                    <div className='font-semibold'>5 Admins</div>
                    <div className='text-gray-500 text-sm'>Active</div>
                  </div>
                </div>
              </div>
              <div className='grid grid-rows-2 gap-6'>
                <div className='bg-white rounded-xl shadow p-6'>
                  <h2 className='font-semibold text-lg mb-2'>
                    Products Pending Approval
                  </h2>
                  <div className='h-24 bg-gray-100 rounded' />
                </div>
                <div className='bg-white rounded-xl shadow p-6'>
                  <h2 className='font-semibold text-lg mb-2'>
                    Platform Settings
                  </h2>
                  <div className='h-24 bg-gray-100 rounded' />
                  <div className='text-xs text-gray-400 mt-2'>
                    Last updated: July 2025
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
              <div className='bg-white rounded-xl shadow p-6'>
                <h2 className='font-semibold text-lg mb-2'>New Comment</h2>
                <div className='mb-2'>
                  <div className='font-semibold'>Kathryn Murphy</div>
                  <div className='text-gray-500 text-sm'>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </div>
                </div>
                <div>
                  <div className='font-semibold'>Leslie Alexander</div>
                  <div className='text-gray-500 text-sm'>
                    Cras nec erat dolor vel erat sed interdum.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeSection === 'manage-sellers' && <ManageSellers />}
        {/* Add more sections here for other sidebar items as needed */}
        {activeSection === 'manage-admins' && (
          <div className='bg-white rounded-xl shadow p-6'>
            <h2 className='text-2xl font-bold mb-4'>Manage Admins</h2>
            {/* TODO: Add Manage Admins content here */}
            <div className='text-gray-500'>
              Admin management features coming soon.
            </div>
          </div>
        )}
        {activeSection === 'approve-products' && (
          <div className='bg-white rounded-xl shadow p-6'>
            <h2 className='text-2xl font-bold mb-4'>Approve Products</h2>
            {/* TODO: Add Approve Products content here */}
            <div className='text-gray-500'>
              Product approval features coming soon.
            </div>
          </div>
        )}
        {activeSection === 'all-orders' && (
          <div className='bg-white rounded-xl shadow p-6'>
            <h2 className='text-2xl font-bold mb-4'>All Orders</h2>
            {/* TODO: Add All Orders content here */}
            <div className='text-gray-500'>
              Order management features coming soon.
            </div>
          </div>
        )}
        {activeSection === 'sales-analytics' && (
          <div className='bg-white rounded-xl shadow p-6'>
            <h2 className='text-2xl font-bold mb-4'>Sales Analytics</h2>
            {/* TODO: Add Sales Analytics content here */}
            <div className='text-gray-500'>
              Sales analytics features coming soon.
            </div>
          </div>
        )}
        {activeSection === 'platform-settings' && (
          <div className='bg-white rounded-xl shadow p-6'>
            <h2 className='text-2xl font-bold mb-4'>Platform Settings</h2>
            {/* TODO: Add Platform Settings content here */}
            <div className='text-gray-500'>
              Platform settings features coming soon.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  percent,
  color,
}: {
  title: string
  value: string
  percent: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700',
    cyan: 'bg-cyan-100 text-cyan-700',
    green: 'bg-green-100 text-green-700',
    pink: 'bg-pink-100 text-pink-700',
  }
  return (
    <div
      className={`rounded-xl shadow p-6 flex flex-col gap-2 ${colorMap[color]}`}
    >
      <div className='font-semibold text-lg'>{title}</div>
      <div className='font-bold text-2xl'>{value}</div>
      <div className='text-xs'>▲ {percent}</div>
    </div>
  )
}
