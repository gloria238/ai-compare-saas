"use client"

import { getSupabase } from "@/lib/supabase"

export default function DevPage() {
  const supabase = getSupabase()

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: "test123@test.com",
      password: "12345678",
    })
    console.log(data, error)
  }

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test123@test.com",
      password: "12345678",
    })
    console.log(data, error)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🧪 Dev Tools</h1>

      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn}>Sign In</button>
    </div>
  )
}