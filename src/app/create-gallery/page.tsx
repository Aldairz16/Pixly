"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateGalleryPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!title.trim()) {
            setError("Título requerido")
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No autenticado")

            const { error: insertError } = await supabase
                .from("galleries")
                .insert([{ title, user_id: user.id }])

            if (insertError) throw insertError

            router.push("/")
            router.refresh()
        } catch (err: unknown) {
            let msg = "Error al crear galería"
            if (err instanceof Error) msg = err.message
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container" style={{ flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '60px' }}>
            <div style={{ width: '100%', maxWidth: '420px', marginBottom: '20px' }}>
                <Link href="/" className="btn-link" style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: 'var(--foreground)', fontWeight: 600
                }}>
                    <ArrowLeft size={16} />
                    <span>Volver</span>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="login-card">
                <h2 className="login-title" style={{ fontSize: '1.25rem', marginBottom: '24px' }}>
                    📁 Nueva Galería
                </h2>

                {error && <div className="message message-error">{error}</div>}

                <div className="form-group">
                    <label className="label">Nombre (Ej. Viajes 2024)</label>
                    <input
                        className="input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ej. Recuerdos en familia"
                        autoFocus
                    />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "✨ Crear Galería"}
                </button>
            </form>
        </div>
    )
}
