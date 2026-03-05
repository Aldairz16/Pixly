"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Share2, Lock, Globe, Check, Loader2 } from "lucide-react"

export default function ShareButton({ galleryId, initialIsPublic }: { galleryId: string, initialIsPublic: boolean }) {
    const supabase = createClient()
    const [isPublic, setIsPublic] = useState(initialIsPublic)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const togglePublic = async () => {
        setLoading(true)
        const newValue = !isPublic
        const { error } = await supabase
            .from("galleries")
            .update({ is_public: newValue })
            .eq("id", galleryId)

        if (!error) setIsPublic(newValue)
        setLoading(false)
    }

    const copyLink = () => {
        const url = `${window.location.origin}/gallery/${galleryId}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn"
                style={{
                    backgroundColor: isPublic ? 'var(--success-bg)' : 'var(--surface)',
                    color: isPublic ? 'var(--success)' : 'var(--text-secondary)',
                    border: isPublic ? '1.5px solid #D4F0D4' : '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700
                }}
            >
                {isPublic ? <Globe size={14} style={{ marginRight: '6px' }} /> : <Share2 size={14} style={{ marginRight: '6px' }} />}
                <span>Compartir</span>
            </button>

            {showMenu && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '12px',
                    width: '300px',
                    zIndex: 200,
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : (isPublic ? <Globe size={16} color="var(--success)" /> : <Lock size={16} color="var(--text-secondary)" />)}
                                <div style={{ fontSize: '13px', color: 'var(--foreground)' }}>
                                    <div style={{ fontWeight: 700 }}>{isPublic ? 'Acceso Público' : 'Privado'}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{isPublic ? 'Cualquiera con el link puede ver' : 'Solo tú puedes ver'}</div>
                                </div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px' }}>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={togglePublic}
                                    disabled={loading}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: isPublic ? 'var(--success)' : 'var(--border)',
                                    borderRadius: '20px', transition: '.3s'
                                }}>
                                    <span style={{
                                        position: 'absolute', content: '""', height: '16px', width: '16px', left: '2px', bottom: '2px',
                                        backgroundColor: 'white', borderRadius: '50%', transition: '.3s',
                                        transform: isPublic ? 'translateX(16px)' : 'translateX(0)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }} />
                                </span>
                            </label>
                        </div>

                        {isPublic && (
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                                <input
                                    readOnly
                                    value={`${window.location.origin}/gallery/${galleryId}`}
                                    style={{
                                        width: '100%', fontSize: '12px', padding: '8px 10px',
                                        backgroundColor: 'var(--background)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
                                        marginBottom: '8px', fontFamily: 'var(--font-sans)'
                                    }}
                                />
                                <button
                                    onClick={copyLink}
                                    className="btn btn-full"
                                    style={{
                                        backgroundColor: copied ? 'var(--success)' : 'var(--foreground)',
                                        color: 'white', fontSize: '13px',
                                        borderRadius: 'var(--radius-sm)', fontWeight: 700
                                    }}
                                >
                                    {copied ? <><Check size={14} style={{ marginRight: '6px' }} /> ¡Copiado!</> : 'Copiar Link'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Backdrop to close menu */}
            {showMenu && (
                <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
            )}
        </div>
    )
}
