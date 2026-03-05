"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                })
                if (error) throw error
                setMessage({ text: "¡Revisa tu email para confirmar tu cuenta!", type: "success" })
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.refresh()
                router.push("/")
            }
        } catch (err: unknown) {
            let errorMessage = "Ocurrió un error"
            if (err instanceof Error) {
                errorMessage = err.message
            }
            setMessage({ text: errorMessage, type: "error" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, var(--primary), #C084A0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '6px'
                    }}>
                        Pixly
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Comparte tus momentos favoritos en familia 📸
                    </p>
                </div>
                <h2 className="login-title" style={{ fontSize: '1.25rem' }}>
                    {isSignUp ? "Crear Cuenta" : "¡Bienvenido de vuelta!"}
                </h2>

                <form onSubmit={handleAuth}>
                    {message && (
                        <div className={`message ${message.type === 'error' ? 'message-error' : 'message-success'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            required
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            required
                            minLength={6}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4">
                        {loading ? (
                            <div className="flex-center">
                                <Loader2 className="animate-spin" size={18} />
                                <span>Procesando...</span>
                            </div>
                        ) : (isSignUp ? "Registrarme" : "Iniciar Sesión")}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <span>{isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}</span>{" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="btn-link"
                        style={{ color: 'var(--primary)', fontWeight: 700 }}
                    >
                        {isSignUp ? "Iniciar Sesión" : "Regístrate"}
                    </button>
                </div>
            </div>
        </div>
    )
}
