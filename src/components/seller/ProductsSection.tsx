'use client'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import '@mantine/tiptap/styles.css'
import Image from 'next/image'

// Mantine Tiptap RichTextEditor wrapper
type TiptapEditorProps = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type product description here...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editable: true,
    autofocus: false,
    immediatelyRender: false, // Required for SSR
  })

  if (!mounted)
    return (
      <div className='border p-3 min-h-[100px] bg-gray-50'>
        Loading editor...
      </div>
    )

  return (
    <RichTextEditor editor={editor} className='min-h-[200px]'>
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  )
}

const PAGE_SIZE = 10

// Update Product interface so tags/colors/sizes are string[] | string to match form usage and fix type error.
interface Product {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  size_prices: any
  id: number
  user_id: number
  name: string
  slug: string
  category: string
  images: string[]
  brand: string
  description: string
  price: number
  list_price: number
  count_in_stock: number
  tags: string[] | string
  colors: string[] | string
  sizes: string[] | string
  avg_rating: number
  num_reviews: number
  rating_distribution: Record<string, number>
  num_sales: number
  is_published: boolean
  created_at: string
  seller_id: number
}

interface Category {
  id: number
  name: string
  parent_id: number | null
}

export default function ProductsSection() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  // Fix form type to allow string for tags/colors/sizes
  const [form, setForm] = useState<
    Partial<Product> & { tags?: string; colors?: string; sizes?: string }
  >({})
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const [mainCategoryId, setMainCategoryId] = useState<number | null>(null)
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null)
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Get sellerId from localStorage.admin_for_seller_id
  const [sellerId, setSellerId] = useState<number | null>(null)
  useEffect(() => {
    // Read from localStorage.user (JSON) on mount (client only)
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      let sellerIdValue: number | null = null
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          if (userObj && userObj.admin_for_seller_id) {
            sellerIdValue = Number(userObj.admin_for_seller_id)
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // ignore JSON parse error
        }
      }
      setSellerId(sellerIdValue)
    }
  }, [])

  // React Query: fetch products
  const {
    data: productsData,
    isLoading: loading,
    error: productsError,
  } = useQuery<{ data: Product[]; count: number }, Error>({
    queryKey: ['products', search, page, sellerId],
    queryFn: async () => {
      if (!sellerId) return { data: [], count: 0 }
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`)
      }
      const { data, error, count } = await query
      if (error) throw new Error(error.message)
      return { data: (data as Product[]) || [], count: count || 0 }
    },
    placeholderData: { data: [], count: 0 },
  })
  const products: Product[] = productsData?.data || []
  const total: number = productsData?.count || 0
  if (productsError) setError(productsError.message)

  // React Query: fetch categories
  const { data: categories, error: categoriesError } = useQuery<
    Category[],
    Error
  >({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*')
      if (error) throw new Error(error.message)
      return (data as Category[]) || []
    },
    placeholderData: [],
  })
  if (categoriesError) setError(categoriesError.message)

  // Slug generator
  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Handle form change
  function handleFormChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target
    if (name === 'mainCategory') {
      setMainCategoryId(value ? Number(value) : null)
      setSubCategoryId(null)
    } else if (name === 'subCategory') {
      setSubCategoryId(value ? Number(value) : null)
    } else if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }))
    } else if (name === 'name') {
      setForm((f) => ({ ...f, name: value, slug: generateSlug(value) }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  // Tiptap change
  function handleDescriptionChange(value: string) {
    setForm((f) => ({ ...f, description: value }))
  }

  // Handle image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newImages = [...images]
    for (let i = 0; i < files.length && newImages.length < 3; i++) {
      const file = files[i]
      // Upload to Supabase Storage or Cloudinary (here just base64 preview for demo)
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        setImages([...newImages])
      }
      reader.readAsDataURL(file)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(idx: number) {
    setImages((imgs) => imgs.filter((_, i) => i !== idx))
  }

  // React Query: create/update product
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveProductMutation = useMutation<any, any, any, unknown>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (payload: any) => {
      if (editProduct) {
        return await supabase
          .from('products')
          .update(payload)
          .eq('id', editProduct.id)
      } else {
        return await supabase.from('products').insert(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowModal(false)
      setEditProduct(null)
      setForm({})
      setImages([])
      setMainCategoryId(null)
      setSubCategoryId(null)
      setPage(1)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => setError(error.message),
  })

  const [sizePrices, setSizePrices] = useState<Record<string, number>>({})

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const categoryId = subCategoryId || mainCategoryId
    const categoryName =
      (categories ?? []).find((c) => c.id === categoryId)?.name || ''
    // Parse tags/colors/sizes safely
    const tags: string[] = Array.isArray(form.tags)
      ? form.tags
      : typeof form.tags === 'string'
      ? (form.tags as string)
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : []
    const colors: string[] = Array.isArray(form.colors)
      ? form.colors
      : typeof form.colors === 'string'
      ? (form.colors as string)
          .split(',')
          .map((c: string) => c.trim())
          .filter(Boolean)
      : []
    const sizes: string[] = Array.isArray(form.sizes)
      ? form.sizes
      : typeof form.sizes === 'string'
      ? (form.sizes as string)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
      : []
    const payload = {
      ...form,
      category: categoryName,
      images,
      tags,
      colors,
      sizes,
      size_prices: Object.keys(sizePrices).length > 0 ? sizePrices : undefined,
      seller_id: sellerId,
      created_at: new Date().toISOString(),
    }
    saveProductMutation.mutate(payload)
  }

  // React Query: delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await supabase.from('products').delete().eq('id', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeleteId(null)
      setPage(1)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => setError(error.message),
  })

  function handleDelete() {
    if (!deleteId) return
    setError('')
    deleteProductMutation.mutate(deleteId)
  }

  // Open modal for create/edit
  function openModal(product?: Product) {
    setEditProduct(product || null)
    if (product) {
      // Set form fields
      setForm({
        ...product,
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      })
      // Set images
      setImages(Array.isArray(product.images) ? product.images : [])
      // Set mainCategoryId and subCategoryId based on product.category
      if (categories && categories.length > 0) {
        const cat = categories.find((c) => c.name === product.category)
        if (cat) {
          if (cat.parent_id) {
            setMainCategoryId(cat.parent_id)
            setSubCategoryId(cat.id)
          } else {
            setMainCategoryId(cat.id)
            setSubCategoryId(null)
          }
        } else {
          setMainCategoryId(null)
          setSubCategoryId(null)
        }
      }
      // Accept both snake_case and camelCase for DB compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSizePrices(product.size_prices || (product as any).sizePrices || {})
    } else {
      setForm({})
      setImages([])
      setMainCategoryId(null)
      setSubCategoryId(null)
      setSizePrices({})
    }
    setShowModal(true)
  }

  // Responsive UI
  return (
    <section className='mb-8'>
      <div className='flex flex-col sm:flex-row items-center justify-between mb-4 gap-2'>
        <h2 className='text-xl font-semibold'>Add & Manage Products</h2>
        <Button
          className='bg-green-600 text-white w-full sm:w-auto'
          onClick={() => openModal()}
        >
          + Add Product
        </Button>
      </div>
      <div className='flex flex-col sm:flex-row gap-2 mb-4'>
        <input
          type='text'
          placeholder='Search products...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border rounded px-3 py-2 w-full sm:w-64'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left bg-white rounded shadow text-sm'>
          <thead>
            <tr className='border-b'>
              <th className='py-2'>Name</th>
              <th className='py-2'>Category</th>
              <th className='py-2'>Price</th>
              <th className='py-2'>Stock</th>
              <th className='py-2'>Published</th>
              <th className='py-2'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className='py-8 text-center'>
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <svg
                      className='animate-spin h-6 w-6 text-blue-500 mb-1'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                      ></path>
                    </svg>
                    <span className='text-gray-400 text-base'>
                      Loading products...
                    </span>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className='py-4 text-center text-gray-400'>
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product: Product) => (
                <tr key={product.id}>
                  <td className='py-2'>{product.name}</td>
                  <td className='py-2'>{product.category}</td>
                  <td className='py-2'>Rs. {product.price}</td>
                  <td className='py-2'>{product.count_in_stock}</td>
                  <td className='py-2'>
                    {product.is_published ? 'Yes' : 'No'}
                  </td>
                  <td className='py-2 flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => openModal(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='text-red-600'
                      onClick={() => setDeleteId(product.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className='flex justify-center items-center gap-2 mt-4'>
        <Button
          size='sm'
          variant='outline'
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>
        <span className='text-sm'>
          Page {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </span>
        <Button
          size='sm'
          variant='outline'
          disabled={page * PAGE_SIZE >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
      {/* Modal for create/edit */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div
            className='bg-white rounded-xl shadow-lg w-full max-w-xl relative p-0 sm:p-6 flex flex-col h-full sm:h-auto sm:justify-center sm:items-center'
            style={{ maxHeight: '100vh', overflow: 'auto' }}
          >
            <button
              className='absolute top-3 right-3 text-gray-500 text-3xl sm:text-xl z-10 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-sm'
              onClick={() => setShowModal(false)}
              aria-label='Close modal'
            >
              &times;
            </button>
            <div className='w-full h-full sm:h-auto flex flex-col sm:flex-none overflow-auto sm:overflow-visible p-4 sm:p-0'>
              <h3 className='text-lg font-bold mb-2 mt-2 sm:mt-0'>
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              {error && (
                <div className='text-red-400 text-sm mb-2'>{error}</div>
              )}
              <form className='space-y-3 mt-[130px]' onSubmit={handleSave}>
                <div className='flex flex-col md:flex-row gap-6'>
                  {/* Left Side: Product Details */}
                  <div className='flex-1 space-y-3'>
                    {/* Category Selection */}
                    <div className='flex flex-col gap-2'>
                      <label className='text-sm font-medium'>
                        Main Category
                      </label>
                      <select
                        name='mainCategory'
                        value={mainCategoryId ?? ''}
                        onChange={handleFormChange}
                        className='border rounded px-3 py-2 w-full text-base bg-white'
                        required
                      >
                        <option value=''>Select main category</option>
                        {(categories ?? [])
                          .filter((c) => c.parent_id === null)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    {/* Subcategory Selection */}
                    {mainCategoryId && (
                      <div className='flex flex-col gap-2'>
                        <label className='text-sm font-medium'>
                          Subcategory
                        </label>
                        <select
                          name='subCategory'
                          value={subCategoryId ?? ''}
                          onChange={handleFormChange}
                          className='border rounded px-3 py-2 w-full text-base bg-white'
                          required
                        >
                          <option value=''>Select subcategory</option>
                          {(categories ?? [])
                            .filter((c) => c.parent_id === mainCategoryId)
                            .map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                    <input
                      type='text'
                      name='name'
                      placeholder='Product Name'
                      value={form.name || ''}
                      onChange={handleFormChange}
                      required
                      className='border rounded px-3 py-2 w-full text-base'
                    />
                    <input
                      type='text'
                      name='slug'
                      placeholder='Slug (auto)'
                      value={form.slug || ''}
                      readOnly
                      className='border rounded px-3 py-2 w-full bg-gray-100 text-base'
                    />
                    <input
                      type='text'
                      name='brand'
                      placeholder='Brand'
                      value={form.brand || ''}
                      onChange={handleFormChange}
                      className='border rounded px-3 py-2 w-full text-base'
                    />
                    <input
                      type='text'
                      name='tags'
                      placeholder='Tags (comma separated)'
                      value={form.tags || ''}
                      onChange={handleFormChange}
                      className='border rounded px-3 py-2 w-full text-base'
                    />
                    <input
                      type='text'
                      name='colors'
                      placeholder='Colors (comma separated)'
                      value={form.colors || ''}
                      onChange={handleFormChange}
                      className='border rounded px-3 py-2 w-full text-base'
                    />
                    <input
                      type='text'
                      name='sizes'
                      placeholder='Sizes (comma separated)'
                      value={form.sizes || ''}
                      onChange={handleFormChange}
                      className='border rounded px-3 py-2 w-full text-base'
                    />
                    {/* Per-size price UI */}
                    {(() => {
                      const sizeList = Array.isArray(form.sizes)
                        ? form.sizes
                        : typeof form.sizes === 'string'
                        ? (form.sizes as string)
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                        : []
                      if (sizeList.length === 0) return null
                      return (
                        <div className='space-y-2'>
                          <label className='text-sm font-medium'>
                            Price per Size
                          </label>
                          <div className='flex flex-col gap-2'>
                            {sizeList.map((size) => (
                              <div
                                key={size}
                                className='flex items-center gap-2'
                              >
                                <span className='w-10'>{size}</span>
                                <input
                                  type='number'
                                  min={0}
                                  step={1}
                                  className='border rounded px-2 py-1 w-32 text-base'
                                  placeholder={`Price for ${size}`}
                                  value={sizePrices[size] ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setSizePrices((prev) => {
                                      const updated = { ...prev }
                                      if (val === '' || isNaN(Number(val))) {
                                        delete updated[size]
                                      } else {
                                        updated[size] = Number(val)
                                      }
                                      return updated
                                    })
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    <input
                      type='number'
                      name='price'
                      placeholder='Price'
                      value={form.price || ''}
                      onChange={handleFormChange}
                      required
                      className='border rounded px-3 py-2 w-full text-base'
                    />
                    <input
                      type='number'
                      name='count_in_stock'
                      placeholder='Stock'
                      value={form.count_in_stock || ''}
                      onChange={handleFormChange}
                      required
                      className='border rounded px-3 py-2 w-full text-base'
                    />
                    <div className='flex gap-2 items-center'>
                      <label className='text-sm'>Published:</label>
                      <input
                        type='checkbox'
                        name='is_published'
                        checked={!!form.is_published}
                        onChange={handleFormChange}
                        className='w-5 h-5'
                      />
                    </div>
                  </div>
                  {/* Right Side: Description & Images */}
                  <div className='flex-1 space-y-6'>
                    <div className='mb-2'>
                      <h4 className='text-base font-semibold mb-3 text-blue-700'>
                        Product Description
                      </h4>
                      <div className='min-h-[180px] border-blue-300 rounded-lg overflow-hidden bg-blue-50 focus-within:border-blue-500 transition-all p-2 sm:p-3'>
                        <TiptapEditor
                          value={
                            typeof form.description === 'string'
                              ? form.description
                              : ''
                          }
                          onChange={handleDescriptionChange}
                          placeholder='Type product description here...'
                        />
                      </div>
                    </div>
                    <div className='mb-2'>
                      <label className='block text-sm mb-2 font-medium'>
                        Images (max 3):
                      </label>
                      <div className='flex gap-2 flex-wrap mb-2'>
                        {images?.map((img, idx) => (
                          <div
                            key={idx}
                            className='relative w-20 h-20 rounded overflow-hidden border bg-white'
                          >
                            <Image
                              src={img}
                              alt={`Product image ${idx + 1}`}
                              width={80}
                              height={80}
                              className='object-cover w-full h-full'
                            />
                            <button
                              type='button'
                              className='absolute top-0 right-0 bg-black/60 text-white rounded-bl px-1 text-xs w-6 h-6 flex items-center justify-center'
                              onClick={() => removeImage(idx)}
                              aria-label='Remove image'
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        {images.length < 3 && (
                          <label className='w-20 h-20 flex items-center justify-center border-2 border-dashed rounded cursor-pointer bg-gray-100 hover:bg-blue-100'>
                            <span className='text-2xl text-blue-400'>+</span>
                            <input
                              type='file'
                              accept='image/*'
                              multiple
                              className='hidden'
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                            />
                          </label>
                        )}
                      </div>
                      <div className='text-xs text-gray-500'>
                        JPG, PNG, WEBP supported. Max 3 images.
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex gap-2 mt-6 justify-end'>
                  <Button
                    type='submit'
                    className='bg-green-600 text-white flex items-center gap-2'
                    disabled={saveProductMutation.isPending}
                  >
                    {saveProductMutation.isPending && (
                      <svg
                        className='animate-spin h-4 w-4 mr-1 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        ></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                        ></path>
                      </svg>
                    )}
                    {saveProductMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowModal(false)}
                    disabled={saveProductMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirmation */}
      {deleteId && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative'>
            <button
              className='absolute top-2 right-2 text-gray-500'
              onClick={() => setDeleteId(null)}
            >
              &times;
            </button>
            <h3 className='text-lg font-bold mb-2'>Delete Product</h3>
            <div className='mb-4'>
              Are you sure you want to delete this product?
            </div>
            <div className='flex gap-2'>
              <Button className='bg-red-600 text-white' onClick={handleDelete}>
                Delete
              </Button>
              <Button variant='outline' onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
