export default function OrdersSection() {
  return (
    <section>
      <h2 className='text-xl font-semibold mb-4'>Your Sales & Orders</h2>
      <div className='overflow-x-auto'>
        <table className='w-full text-left bg-white rounded shadow text-sm'>
          <thead>
            <tr className='border-b'>
              <th className='py-2'>Order ID</th>
              <th className='py-2'>Product</th>
              <th className='py-2'>Amount</th>
              <th className='py-2'>Status</th>
              <th className='py-2'>Date</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className='py-2'>#12345</td>
              <td className='py-2'>Sample Product</td>
              <td className='py-2'>Rs. 1000</td>
              <td className='py-2'>Completed</td>
              <td className='py-2'>2025-07-30</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
