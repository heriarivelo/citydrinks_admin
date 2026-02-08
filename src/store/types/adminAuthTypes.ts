export type TMe = {
  id: number
  email: string
  phone_number: string
  phone: string
  user_name: string
  company: string
  address: any
  vat: string
  first_name: string
  last_name: string
  one_time_password: any
  status: number
  created_at: string
  updated_at: string
  old_password: string
  password: string
  password_confirmation: string
}

export type TMeError = {
  id: number
  email: string
  phone_number: string
  phone: string
  user_name: string
  company: string
  address: any
  vat: string
  first_name: string
  last_name: string
  one_time_password: any
  status: number
  created_at: string
  updated_at: string
  old_password: string
  password: string
  password_confirmation: string
}

export type TAuth = {
  username?: string
  email?: string
  password?: string
  password_confirmation?: string
}
