import { supabase } from './supabaseClient'

// Seller registration: just insert seller info, no password
export async function registerSeller({ name, groupName, email, phone }: { name: string; groupName: string; email: string; phone: string }) {
  const { data, error } = await supabase.from('users').insert([
    { name, group_name: groupName, email, phone, role: 'admin' }
  ])
  if (error) throw error
  return data
}

// Customer registration: sign up with email/password
export async function registerCustomer({ name, email, password }: { name: string; email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: 'user' }
    }
  })
  if (error) throw error
  // Insert into users table if signup succeeded
  if (data?.user?.id) {
    const { error: userError } = await supabase.from('users').insert([
      {
        auth_id: data.user.id, 
        name,
        email,
        role: 'user'
      }
    ])
    if (userError) throw userError
  }
  return data
}
