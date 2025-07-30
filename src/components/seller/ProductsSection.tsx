import { Button } from '@/components/ui/button'

export default function ProductsSection() {
  return (
    <section>
      <div className='flex flex-col sm:flex-row items-center justify-between mb-4 gap-2'>
        <h2 className='text-xl font-semibold'>Add & Manage Products</h2>
        <Button className='bg-green-600 text-white w-full sm:w-auto'>
          + Add Product
        </Button>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left bg-white rounded shadow text-sm'>
          <thead>
            <tr className='border-b'>
              <th className='py-2'>Product Name</th>
              <th className='py-2'>Price</th>
              <th className='py-2'>Stock</th>
              <th className='py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className='py-2'>Sample Product</td>
              <td className='py-2'>Rs. 1000</td>
              <td className='py-2'>20</td>
              <td className='py-2 flex gap-2'>
                <Button size='sm' variant='outline'>
                  Edit
                </Button>
                <Button size='sm' variant='outline' className='text-red-600'>
                  Delete
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
