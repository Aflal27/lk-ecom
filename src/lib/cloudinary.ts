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
