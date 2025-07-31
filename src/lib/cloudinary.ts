// Delete image from Cloudinary by public_id or URL
export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  // Extract public_id from the image URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
  // public_id is everything after '/upload/' and before file extension
  const matches = imageUrl.match(/\/upload\/(.+)\.[a-zA-Z]+$/)
  const publicId = matches ? matches[1] : null
  if (!publicId) return

  // You need a backend API route to securely delete from Cloudinary
  // This function should call that API route
  await fetch('/api/cloudinary-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_id: publicId }),
  })
}
export async function uploadToCloudinary(file: File, uploadPreset = 'lk-ecom') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  const res = await fetch('https://api.cloudinary.com/v1_1/djncajt2f/auto/upload', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Image upload failed')
  const data = await res.json()
  return data.secure_url as string
}
