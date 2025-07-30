import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useState, useRef } from 'react'

interface Seller {
  id: number
  name: string
  email: string
  group_name?: string
  role: string
  verify_seller?: boolean
  username?: string
  password?: string
  price_range?: number
  sales?: number
  blocked?: boolean
}

export default function ManageSellers() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSeller, setModalSeller] = useState<Seller | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [updating, setUpdating] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'new' | 'verified'>('new')

  // Fetch sellers from Supabase
  const { data: sellers, isLoading } = useQuery<Seller[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
      if (error) throw error
      return (data as Seller[]) || []
    },
  })

  // Owner actions (scaffolded, not implemented)
  const verifySeller = useMutation({
    mutationFn: async (seller: Seller) => {
      // Generate username and password
      const genUsername = seller.email.split('@')[0]
      const genPassword = Math.random().toString(36).slice(-8)
      setUsername(genUsername)
      setPassword(genPassword)
      setModalSeller(seller)
      setModalOpen(true)
      // Mark seller as verified and save credentials
      await supabase
        .from('users')
        .update({
          verify_seller: true,
          username: genUsername,
          password: genPassword,
        })
        .eq('id', seller.id)
      // TODO: Send username/password to seller's email
    },
  })
  const setPriceRange = useMutation({
    mutationFn: async ({
      sellerId,
      price,
    }: {
      sellerId: number
      price: number
    }) => {
      await supabase
        .from('users')
        .update({ price_range: price })
        .eq('id', sellerId)
    },
  })
  const blockSeller = useMutation({
    mutationFn: async (sellerId: number) => {
      await supabase.from('users').update({ blocked: true }).eq('id', sellerId)
    },
  })
  const unblockSeller = useMutation({
    mutationFn: async (sellerId: number) => {
      await supabase.from('users').update({ blocked: false }).eq('id', sellerId)
    },
  })

  // Split sellers by verified status
  const newSellers = (sellers || []).filter((s: Seller) => !s.verify_seller)
  const verifiedSellers = (sellers || []).filter((s: Seller) => s.verify_seller)

  return (
    <section id='manage-sellers' className='mb-8'>
      {/* Modal for viewing/updating seller credentials */}
      {modalOpen && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative'>
            <button
              className='absolute top-2 right-2 text-gray-500'
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h3 className='text-lg font-bold mb-2'>Seller Credentials</h3>
            <div className='mb-2'>
              <b>Name:</b> {modalSeller?.name}
            </div>
            <div className='mb-2'>
              <b>Email:</b> {modalSeller?.email}
            </div>
            <div className='mb-2'>
              <b>Username:</b>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='border px-2 py-1 rounded w-full'
              />
            </div>
            <div className='mb-2'>
              <b>Password:</b>
              <input
                type='text'
                value={password}
                ref={passwordRef}
                onChange={(e) => setPassword(e.target.value)}
                className='border px-2 py-1 rounded w-full'
              />
            </div>
            <button
              className='bg-blue-600 text-white px-4 py-2 rounded mt-2 w-full font-semibold'
              disabled={updating}
              onClick={async () => {
                if (!modalSeller) return
                setUpdating(true)
                await supabase
                  .from('users')
                  .update({ name: username, password, verify_seller: true })
                  .eq('id', modalSeller.id)
                setUpdating(false)
                setModalOpen(false)
              }}
            >
              Update Credentials
            </button>
          </div>
        </div>
      )}
      <h2 className='text-2xl font-bold mb-4'>Manage Sellers</h2>
      <div className='flex gap-4 mb-4'>
        <button
          className={`px-4 py-2 rounded ${
            tab === 'new'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-blue-700'
          }`}
          onClick={() => setTab('new')}
        >
          New Sellers
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tab === 'verified'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-blue-700'
          }`}
          onClick={() => setTab('verified')}
        >
          Verified Sellers
        </button>
      </div>
      <div className='bg-white rounded-xl shadow p-6'>
        {isLoading ? (
          <div>Loading sellers...</div>
        ) : tab === 'new' ? (
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b'>
                <th className='py-2'>Name</th>
                <th className='py-2'>Group</th>
                <th className='py-2'>Email</th>
                <th className='py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newSellers.length === 0 && (
                <tr>
                  <td colSpan={4} className='py-4 text-center text-gray-400'>
                    No new sellers
                  </td>
                </tr>
              )}
              {newSellers.map((seller: Seller) => (
                <tr key={seller.id}>
                  <td className='py-2'>{seller.name}</td>
                  <td className='py-2'>{seller.group_name}</td>
                  <td className='py-2'>{seller.email}</td>
                  <td className='py-2 flex gap-2'>
                    <button
                      className='px-2 py-1 bg-blue-100 rounded text-blue-700 text-xs'
                      onClick={() => verifySeller.mutate(seller)}
                    >
                      Verify & Send Login
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b'>
                <th className='py-2'>Name</th>
                <th className='py-2'>Group</th>
                <th className='py-2'>Email</th>
                <th className='py-2'>Price Range</th>
                <th className='py-2'>Sales</th>
                <th className='py-2'>Status</th>
                <th className='py-2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifiedSellers.length === 0 && (
                <tr>
                  <td colSpan={7} className='py-4 text-center text-gray-400'>
                    No verified sellers
                  </td>
                </tr>
              )}
              {verifiedSellers.map((seller: Seller) => {
                const sales = seller.sales ?? 0
                const priceRange = seller.price_range ?? 0
                return (
                  <tr key={seller.id}>
                    <td className='py-2'>{seller.name}</td>
                    <td className='py-2'>{seller.group_name}</td>
                    <td className='py-2'>{seller.email}</td>
                    <td className='py-2'>
                      <input
                        type='number'
                        defaultValue={priceRange}
                        className='w-24 px-2 py-1 border rounded'
                        onBlur={(e) =>
                          setPriceRange.mutate({
                            sellerId: seller.id,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className='py-2'>{sales}</td>
                    <td
                      className={`py-2 ${
                        seller.blocked ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {seller.blocked ? 'Blocked' : 'Active'}
                    </td>
                    <td className='py-2 flex gap-2'>
                      <button
                        className={`px-2 py-1 rounded text-xs ${
                          sales >= priceRange
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        disabled={sales < priceRange}
                      >
                        Request Transfer
                      </button>
                      <button
                        className='px-2 py-1 bg-yellow-100 rounded text-yellow-700 text-xs'
                        onClick={() => {
                          setUsername(
                            seller.username || seller.email.split('@')[0]
                          )
                          setPassword(seller.password || '')
                          setModalSeller(seller)
                          setModalOpen(true)
                        }}
                      >
                        Edit Credentials
                      </button>
                      {seller.blocked ? (
                        <button
                          className='px-2 py-1 bg-blue-100 rounded text-blue-700 text-xs'
                          onClick={() => unblockSeller.mutate(seller.id)}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          className='px-2 py-1 bg-red-100 rounded text-red-700 text-xs'
                          onClick={() => blockSeller.mutate(seller.id)}
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <div className='text-xs text-gray-400 mt-2'>
          * Transfer is enabled only when sales reach price range. Block
          disables seller account and product sales. Owner can set price range
          for any seller.
        </div>
      </div>
    </section>
  )
}
