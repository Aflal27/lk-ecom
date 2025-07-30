import { Button } from '@/components/ui/button'

export default function InventorySection() {
  return (
    <section>
      <h2 className='text-xl font-semibold mb-4'>Manage Inventory</h2>
      <div className='overflow-x-auto'>
        <table className='w-full text-left bg-white rounded shadow text-sm'>
          <thead>
            <tr className='border-b'>
              <th className='py-2'>Product</th>
              <th className='py-2'>Stock</th>
              <th className='py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className='py-2'>Sample Product</td>
              <td className='py-2'>20</td>
              <td className='py-2 flex gap-2'>
                <Button size='sm' variant='outline'>
                  Update Stock
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
