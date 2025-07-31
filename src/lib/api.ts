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
export async function registerCustomer({ name, email, password, seller_id }: { name: string; email: string; password: string; seller_id: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: 'customer', seller_id }
    }
  })
  if (error) throw error
  // Optionally, insert into users table for tracking (if needed)
  if (data?.user?.id) {
    const { error: userError } = await supabase.from('users').insert([
      {
        auth_id: data.user.id,
        name,
        email,
        role: 'customer',
        seller_id
      }
    ])
    if (userError) throw userError
  }
  return data
}
