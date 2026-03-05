"use client"

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="btn"
            style={{
                backgroundColor: 'var(--surface)',
                color: 'var(--text-secondary)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                transition: 'all 0.2s ease'
            }}
        >
            <LogOut size={14} style={{ marginRight: '6px' }} />
            <span>Salir</span>
        </button>
    )
}
