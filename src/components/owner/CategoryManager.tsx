import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'

interface Category {
  id: number
  name: string
  parent_id: number | null
  description?: string
  created_at: string
  children?: Category[]
}

export default function CategoryManager() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [form, setForm] = useState<{
    name: string
    description?: string
    parent_id: number | null
  }>({ name: '', description: '', parent_id: null })
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const queryClient = useQueryClient()

  // Fetch categories with React Query
  const { data: categoriesRaw, isLoading } = useQuery({
    queryKey: ['categories', search],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })
      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`)
      }
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return (data as Category[]) || []
    },
  })
  const categories = buildTree(
    Array.isArray(categoriesRaw) ? categoriesRaw : []
  )

  // Build tree from flat array
  function buildTree(list: Category[]): Category[] {
    const map = new Map<number, Category>()
    list.forEach((cat) => map.set(cat.id, { ...cat, children: [] }))
    const tree: Category[] = []
    list.forEach((cat) => {
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children!.push(map.get(cat.id)!)
      } else {
        tree.push(map.get(cat.id)!)
      }
    })
    return tree
  }

  // Handle form change
  function handleFormChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]: name === 'parent_id' ? (value ? Number(value) : null) : value,
    }))
  }

  // Create or update category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (payload: {
      form: { name: string; description?: string; parent_id: number | null }
      editCategory: Category | null
    }) => {
      if (payload.editCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload.form)
          .eq('id', payload.editCategory.id)
        if (error) throw new Error(error.message)
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({ ...payload.form, created_at: new Date().toISOString() })
        if (error) throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false)
      setEditCategory(null)
      setForm({ name: '', description: '', parent_id: null })
      setError('')
    },
    onError: (err: Error) => setError(err.message),
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    saveCategoryMutation.mutate({ form, editCategory })
  }

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleteId(null)
      setError('')
    },
    onError: (err: Error) => setError(err.message),
  })

  function handleDelete() {
    if (!deleteId) return
    setError('')
    deleteCategoryMutation.mutate(deleteId)
  }

  // Open modal for create/edit or add subcategory
  function openModal(category?: Category, parentId?: number) {
    if (category) {
      // Edit mode
      setEditCategory(category)
      setForm({
        name: category.name,
        description: category.description,
        parent_id: category.parent_id,
      })
    } else if (parentId) {
      // Add subcategory mode
      setEditCategory(null)
      setForm({ name: '', description: '', parent_id: parentId })
    } else {
      // Add main category mode
      setEditCategory(null)
      setForm({ name: '', description: '', parent_id: null })
    }
    setShowModal(true)
  }

  // Render tree recursively
  function renderTree(tree: Category[], level = 0) {
    return tree.map((cat) => (
      <div
        key={cat.id}
        className={`pl-${
          level * 4
        } py-2 border-b flex items-center justify-between bg-white rounded mb-1`}
      >
        <div>
          <span
            className={`font-semibold ${level === 0 ? 'text-lg' : 'text-base'}`}
          >
            {cat.name}
          </span>
          {cat.description && (
            <span className='ml-2 text-xs text-gray-500'>
              ({cat.description})
            </span>
          )}
          {level === 0 && (
            <Button
              size='sm'
              className='ml-2 bg-blue-100 text-blue-700 border border-blue-300'
              onClick={() => openModal(undefined, cat.id)}
            >
              + Add Subcategory
            </Button>
          )}
        </div>
        <div className='flex gap-2'>
          <Button size='sm' variant='outline' onClick={() => openModal(cat)}>
            Edit
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='text-red-600'
            onClick={() => setDeleteId(cat.id)}
          >
            Delete
          </Button>
        </div>
        {cat.children && cat.children.length > 0 && (
          <div className='ml-4'>{renderTree(cat.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <section className='mb-8'>
      <div className='flex flex-col sm:flex-row items-center justify-between mb-4 gap-2'>
        <h2 className='text-xl font-semibold'>Manage Product Categories</h2>
        <Button
          className='bg-green-600 text-white w-full sm:w-auto'
          onClick={() => openModal()}
        >
          + Add Category
        </Button>
      </div>
      <div className='flex flex-col sm:flex-row gap-2 mb-4'>
        <input
          type='text'
          placeholder='Search categories...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='border rounded px-3 py-2 w-full sm:w-64'
        />
      </div>
      <div className='bg-gray-50 rounded p-4 shadow'>
        {isLoading ? (
          <div className='text-center text-gray-400'>Loading...</div>
        ) : categories.length === 0 ? (
          <div className='text-center text-gray-400'>No categories found</div>
        ) : (
          renderTree(categories)
        )}
      </div>
      {/* Modal for create/edit */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative'>
            <button
              className='absolute top-2 right-2 text-gray-500'
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h3 className='text-lg font-bold mb-2'>
              {editCategory
                ? 'Edit Category'
                : form.parent_id
                ? 'Add Subcategory'
                : 'Add Main Category'}
            </h3>
            {error && <div className='text-red-400 text-sm mb-2'>{error}</div>}
            <form className='space-y-3' onSubmit={handleSave}>
              <input
                type='text'
                name='name'
                placeholder={
                  form.parent_id ? 'Subcategory Name' : 'Category Name'
                }
                value={form.name}
                onChange={handleFormChange}
                required
                className='border rounded px-3 py-2 w-full'
              />
              <textarea
                name='description'
                placeholder='Description'
                value={form.description}
                onChange={handleFormChange}
                className='border rounded px-3 py-2 w-full'
              />
              {/* Only show parent dropdown for main category or edit mode */}
              {editCategory || !form.parent_id ? (
                <select
                  name='parent_id'
                  value={form.parent_id ?? ''}
                  onChange={handleFormChange}
                  className='border rounded px-3 py-2 w-full'
                >
                  <option value=''>Main Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className='bg-gray-100 rounded px-3 py-2 text-sm text-gray-700'>
                  Parent:{' '}
                  {categories.find((c) => c.id === form.parent_id)?.name ||
                    'Main Category'}
                </div>
              )}
              <div className='flex gap-2 mt-2'>
                <Button type='submit' className='bg-green-600 text-white'>
                  Save
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
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
            <h3 className='text-lg font-bold mb-2'>Delete Category</h3>
            <div className='mb-4'>
              Are you sure you want to delete this category?
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
