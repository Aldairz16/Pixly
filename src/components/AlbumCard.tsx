
import Link from "next/link"
import { MoreVertical, Edit2, Trash2, ExternalLink, Calendar } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import EditAlbumDialog from "./EditAlbumDialog"

interface Album {
    id: string
    title: string
    cover_url: string
    external_link?: string
    album_date?: string
    created_at?: string
}

export default function AlbumCard({ album, isOwner }: { album: Album, isOwner?: boolean }) {
    const router = useRouter()
    const supabase = createClient()
    const [showMenu, setShowMenu] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm("¿Estás seguro de que quieres eliminar este álbum? No se puede deshacer.")) return

        setIsDeleting(true)
        const { error } = await supabase.from('albums').delete().eq('id', album.id)

        if (!error) {
            router.refresh()
        } else {
            alert("Error al eliminar")
            setIsDeleting(false)
        }
    }

    // Format Date
    const dateStr = album.album_date || album.created_at
    const formattedDate = dateStr
        ? new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        : ''

    // Logic to determine Link behavior
    const hasExternalLink = !!album.external_link

    // Link component (reusable for image and title)
    const CardLink = ({ children, className }: { children: React.ReactNode, className?: string }) => {
        if (hasExternalLink) {
            return (
                <a
                    href={album.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    {children}
                </a>
            )
        }
        return (
            <Link
                href={`/album/${album.id}`}
                className={className}
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
                {children}
            </Link>
        )
    }

    return (
        <>
            <div
                style={{
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--surface)',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                }}
            >
                {/* Image Container - Clickable */}
                <CardLink className="block" >
                    <div style={{
                        width: '100%',
                        aspectRatio: '16/9',
                        overflow: 'hidden',
                        backgroundColor: 'var(--background)',
                        position: 'relative',
                        borderTopLeftRadius: 'var(--radius)',
                        borderTopRightRadius: 'var(--radius)'
                    }}>
                        <img
                            src={album.cover_url}
                            alt={album.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                transition: 'transform 0.5s ease',
                                opacity: isDeleting ? 0.5 : 1,
                                display: 'block'
                            }}
                        />
                    </div>
                </CardLink>

                {/* Content Container */}
                <div style={{ padding: '12px 14px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {/* Title and Date - Clickable */}
                        <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                            <CardLink className="block">
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: 'var(--foreground)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginBottom: '2px',
                                }}>
                                    {album.title}
                                </h3>
                                {formattedDate && (
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'var(--text-secondary)',
                                        marginTop: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Calendar size={11} />
                                        <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
                                    </div>
                                )}
                            </CardLink>
                        </div>

                        {/* Actions or Ext Link Icon */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {hasExternalLink && !isOwner && <ExternalLink size={12} style={{ color: 'var(--text-tertiary)' }} />}

                            {isOwner && (
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: 'var(--text-secondary)',
                                            border: 'none',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--background)'
                                            e.currentTarget.style.color = 'var(--foreground)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                            e.currentTarget.style.color = 'var(--text-secondary)'
                                        }}
                                        title="Opciones"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {showMenu && (
                                        <>
                                            <div style={{
                                                position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                                                backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-sm)',
                                                padding: '4px', width: '140px', boxShadow: 'var(--shadow-lg)',
                                                zIndex: 100,
                                                animation: 'slideDown 0.2s ease-out'
                                            }}>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowEditDialog(true); setShowMenu(false); }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                                        padding: '8px 10px', border: 'none', background: 'transparent',
                                                        color: 'var(--foreground)', cursor: 'pointer', fontSize: '13px',
                                                        textAlign: 'left', borderRadius: '8px', fontWeight: 600,
                                                        transition: 'background-color 0.15s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <Edit2 size={14} /> Editar
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                                        padding: '8px 10px', border: 'none', background: 'transparent',
                                                        color: 'var(--error)', cursor: 'pointer', fontSize: '13px',
                                                        textAlign: 'left', borderRadius: '8px', fontWeight: 600,
                                                        transition: 'background-color 0.15s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-bg)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </div>
                                            {/* Backdrop */}
                                            <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} style={{ position: 'fixed', inset: 0, zIndex: 90, cursor: 'default' }} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showEditDialog && (
                <EditAlbumDialog album={album} onClose={() => setShowEditDialog(false)} />
            )}
        </>
    )
}
