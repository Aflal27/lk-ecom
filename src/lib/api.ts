import { supabase } from './supabaseClient'

// Seller registration: just insert seller info, no password
export async function registerSeller({ name, groupName, email }: { name: string; groupName: string; email: string }) {
  const { data, error } = await supabase.from('sellers').insert([
    { name, group_name: groupName, email }
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
      data: { name }
    }
  })
  if (error) throw error
  return data
}
