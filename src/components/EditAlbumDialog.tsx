"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, X } from "lucide-react"

interface Album {
    id: string
    title: string
    external_link?: string
    album_date?: string
    created_at?: string
}

export default function EditAlbumDialog({ album, onClose }: { album: Album, onClose: () => void }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(album.title)
    // Use local date parts to avoid UTC shift with toISOString()
    const fallbackDate = album.created_at ? (() => { const d = new Date(album.created_at); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() : ''
    const [date, setDate] = useState(album.album_date || fallbackDate)
    const [externalLink, setExternalLink] = useState(album.external_link || "")

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase
            .from('albums')
            .update({
                title,
                external_link: externalLink || null,
                album_date: date || null
            })
            .eq('id', album.id)

        setLoading(false)

        if (!error) {
            router.refresh()
            onClose()
        } else {
            alert('Error al actualizar el álbum')
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(74, 68, 88, 0.3)',
            backdropFilter: 'blur(6px)'
        }}>
            <div style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                width: '100%',
                maxWidth: '420px',
                position: 'relative',
                boxShadow: 'var(--shadow-lg)',
                animation: 'fadeInScale 0.3s ease-out'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: 'none', border: 'none',
                    color: 'var(--text-tertiary)', cursor: 'pointer',
                    padding: '4px', borderRadius: '8px',
                    transition: 'color 0.2s'
                }}>
                    <X size={20} />
                </button>

                <h2 style={{
                    fontSize: '1.25rem', marginBottom: '24px',
                    fontWeight: 800, color: 'var(--foreground)'
                }}>
                    ✏️ Editar Álbum
                </h2>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="label">Título</label>
                        <input
                            className="input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Fecha</label>
                        <input
                            className="input"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{ colorScheme: 'light' }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Link Externo</label>
                        <input
                            className="input"
                            value={externalLink}
                            onChange={e => setExternalLink(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{
                            backgroundColor: 'var(--background)',
                            border: '1.5px solid var(--border)',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700
                        }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>
                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
