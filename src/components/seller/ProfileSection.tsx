import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/lib/userStore'
import React from 'react'
import Image from 'next/image'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'
import { toast } from 'react-hot-toast'

export default function ProfileSection() {
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  const [name, setName] = React.useState(user?.name || '')
  const [group, setGroup] = React.useState(user?.group_name || '')
  const [email, setEmail] = React.useState(user?.email || '')
  const [account, setAccount] = React.useState(user?.account_number || '')
  const [bank, setBank] = React.useState(user?.bank_name || '')
  const [imageUrl, setImageUrl] = React.useState(user?.image || '')
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [isDirty, setIsDirty] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    setName(user?.name || '')
    setGroup(user?.group_name || '')
    setEmail(user?.email || '')
    setAccount(user?.account_number || '')
    setBank(user?.bank_name || '')
    setImageUrl(user?.image || '')
    setSelectedImage(null)
    setIsDirty(false)
  }, [user])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsDirty(true)
    // Show preview before upload
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
    setUploading(true)
    try {
      // Delete old image from Cloudinary if exists and is a Cloudinary URL
      if (imageUrl && imageUrl.includes('cloudinary.com')) {
        try {
          await deleteFromCloudinary(imageUrl)
        } catch {
          // Optionally handle error
        }
      }
      // Upload new image
      const url = await uploadToCloudinary(file)
      setImageUrl(url)
    } catch {
      // Optionally handle error
    }
    setUploading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      setUser({
        ...user,
        name,
        group_name: group,
        email,
        account_number: account,
        bank_name: bank,
        image: imageUrl,
      })
      toast.success('Profile updated successfully!')
      setIsDirty(false)
    } catch {
      toast.error('Profile update failed!')
    }
  }
  return (
    <section className='max-w-lg mx-auto'>
      <h2 className='text-xl font-semibold mb-4'>Profile & Account Details</h2>
      <form className='space-y-4' onSubmit={handleSubmit}>
        <div className='flex flex-col items-center gap-2'>
          {(selectedImage || imageUrl) && (
            <Image
              src={selectedImage || imageUrl}
              alt='Profile Image'
              width={100}
              height={400}
              className=' object-fill rounded-b-xl w-[180px] h-[200px] border shadow'
            />
          )}
          <input
            type='file'
            accept='image/*'
            onChange={handleImageChange}
            disabled={uploading}
            className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
          />
          {uploading && (
            <span className='text-xs text-blue-600'>Uploading...</span>
          )}
        </div>
        <Input
          type='text'
          placeholder='Seller Name'
          className='bg-gray-50'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type='text'
          placeholder='WhatsApp Group Name'
          className='bg-gray-50'
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        />
        <Input
          type='email'
          placeholder='Email Address'
          className='bg-gray-50'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type='text'
          placeholder='Bank Account Number'
          className='bg-gray-50'
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <Input
          type='text'
          placeholder='Bank Name'
          className='bg-gray-50'
          value={bank}
          onChange={(e) => setBank(e.target.value)}
        />
        <Button
          type='submit'
          className='w-full bg-blue-600 text-white'
          disabled={!isDirty}
        >
          Update Profile
        </Button>
      </form>
    </section>
  )
}
