"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import AlbumCard from "@/components/AlbumCard"
import ShareButton from "@/components/ShareButton"
import Link from "next/link"
import { ArrowLeft, Plus, Search, Calendar, ChevronDown, Edit2, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface Album {
    id: string
    title: string
    cover_url: string
    created_at: string
    album_date?: string // New field for manual date
    external_link?: string
    gallery_id?: string
}

interface Gallery {
    id: string
    title: string
    is_public: boolean
    user_id: string
}

interface Props {
    gallery: Gallery
    initialAlbums: Album[]
    isOwner: boolean
}

type SortOption = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'

export default function GalleryView({ gallery, initialAlbums, isOwner }: Props) {
    const router = useRouter()
    const supabase = createClient()

    // State
    const [albums, setAlbums] = useState(initialAlbums)

    // Sync state with props when router.refresh() happens
    useMemo(() => {
        setAlbums(initialAlbums)
    }, [initialAlbums])

    const [galleryTitle, setGalleryTitle] = useState(gallery.title)
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>('date_desc')
    const [showSortMenu, setShowSortMenu] = useState(false)

    // Editing Gallery Title
    const handleSaveTitle = async () => {
        if (!galleryTitle.trim()) return

        const { error } = await supabase
            .from('galleries')
            .update({ title: galleryTitle })
            .eq('id', gallery.id)

        if (!error) {
            setIsEditingTitle(false)
            router.refresh()
        }
    }

    // Filtering & Sorting
    const processedAlbums = useMemo(() => {
        let result = [...albums]

        // 1. Search (Fuzzy -ish)
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(album =>
                album.title.toLowerCase().includes(query)
            )
        }

        // 2. Sort
        result.sort((a, b) => {
            // Use album_date if available, otherwise created_at
            // Append T00:00:00 to date-only strings to avoid UTC shift
            const parseDate = (d: string) => new Date(d.length === 10 ? d + 'T00:00:00' : d)
            const dateA = a.album_date ? parseDate(a.album_date).getTime() : new Date(a.created_at).getTime()
            const dateB = b.album_date ? parseDate(b.album_date).getTime() : new Date(b.created_at).getTime()

            switch (sortBy) {
                case 'date_desc':
                    return dateB - dateA
                case 'date_asc':
                    return dateA - dateB
                case 'name_asc':
                    return a.title.localeCompare(b.title)
                case 'name_desc':
                    return b.title.localeCompare(a.title)
                default:
                    return 0
            }
        })

        return result
    }, [albums, searchQuery, sortBy])

    // Grouping by Month/Year
    const groupedAlbums = useMemo(() => {
        const groups: { [key: string]: Album[] } = {}

        processedAlbums.forEach(album => {
            // Use album_date for grouping if available
            // Append T00:00:00 to date-only strings to avoid UTC shift
            const date = album.album_date
                ? new Date(album.album_date.length === 10 ? album.album_date + 'T00:00:00' : album.album_date)
                : new Date(album.created_at)
            // Helper for Spanish Month
            const months = [
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ]
            const monthName = months[date.getMonth()]
            const year = date.getFullYear()
            const key = `${monthName} ${year}`

            if (!groups[key]) groups[key] = []
            groups[key].push(album)
        })

        return groups
    }, [processedAlbums])

    return (
        <>
            <header className="app-header" style={{
                height: 'auto', padding: 'calc(20px + env(safe-area-inset-top, 0px)) 16px 16px', flexDirection: 'column',
                gap: '12px', alignItems: 'stretch',
                background: 'rgba(251, 248, 244, 0.9)',
                backdropFilter: 'blur(12px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                        {isOwner && (
                            <Link href="/" style={{
                                color: 'var(--text-secondary)',
                                display: 'flex', alignItems: 'center',
                                padding: '6px',
                                borderRadius: '10px',
                                transition: 'all 0.2s ease'
                            }}>
                                <ArrowLeft size={20} />
                            </Link>
                        )}

                        {isEditingTitle ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    value={galleryTitle}
                                    onChange={(e) => setGalleryTitle(e.target.value)}
                                    className="input"
                                    style={{ fontSize: '1.5rem', fontWeight: 'bold', padding: '6px 10px', width: 'auto', minWidth: '200px' }}
                                    autoFocus
                                />
                                <button onClick={handleSaveTitle} className="btn btn-primary" style={{ padding: '8px', borderRadius: '10px' }}>
                                    <Check size={16} />
                                </button>
                                <button onClick={() => { setIsEditingTitle(false); setGalleryTitle(gallery.title); }}
                                    className="btn"
                                    style={{ padding: '8px', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px' }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h1 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.75rem)', fontWeight: 800, color: 'var(--foreground)', wordBreak: 'break-word' }}>{galleryTitle}</h1>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditingTitle(true)}
                                        className="btn"
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: 'var(--text-tertiary)',
                                            border: 'none',
                                            padding: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            transition: 'color 0.2s',
                                            cursor: 'pointer',
                                            borderRadius: '8px'
                                        }}
                                        title="Editar Título"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                        {isOwner && (
                            <>
                                <ShareButton galleryId={gallery.id} initialIsPublic={gallery.is_public} />
                                <Link href={`/create?galleryId=${gallery.id}`} className="btn btn-primary" style={{ height: '36px', borderRadius: '12px', whiteSpace: 'nowrap', fontSize: '13px' }}>
                                    <Plus size={16} style={{ marginRight: '4px' }} />
                                    <span>Álbum</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '400px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar álbumes..."
                            className="input"
                            style={{ paddingLeft: '38px', height: '38px' }}
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="btn"
                            style={{
                                height: '38px',
                                backgroundColor: 'var(--surface)',
                                border: '1.5px solid var(--border)',
                                paddingRight: '10px',
                                color: 'var(--text-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                fontWeight: 600
                            }}
                        >
                            <span style={{ marginRight: '6px' }}>Ordenar por</span>
                            <ChevronDown size={14} />
                        </button>
                        {showSortMenu && (
                            <>
                                <div style={{
                                    position: 'absolute', top: '100%', right: 0, marginTop: '6px',
                                    backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-sm)',
                                    zIndex: 50, width: '190px', boxShadow: 'var(--shadow-lg)',
                                    padding: '4px',
                                    animation: 'slideDown 0.2s ease-out'
                                }}>
                                    {[
                                        { label: 'Fecha (Reciente)', value: 'date_desc' },
                                        { label: 'Fecha (Antigua)', value: 'date_asc' },
                                        { label: 'Nombre (A-Z)', value: 'name_asc' },
                                        { label: 'Nombre (Z-A)', value: 'name_desc' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => { setSortBy(opt.value as SortOption); setShowSortMenu(false); }}
                                            style={{
                                                display: 'block', width: '100%', textAlign: 'left',
                                                padding: '8px 12px',
                                                backgroundColor: sortBy === opt.value ? 'var(--primary-light)' : 'transparent',
                                                color: sortBy === opt.value ? 'var(--primary)' : 'var(--foreground)',
                                                border: 'none', cursor: 'pointer', fontSize: '13px',
                                                borderRadius: '8px', fontWeight: sortBy === opt.value ? 700 : 600,
                                                transition: 'background-color 0.15s'
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div onClick={() => setShowSortMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="main-content">
                {Object.keys(groupedAlbums).length > 0 ? (
                    Object.entries(groupedAlbums).map(([groupTitle, groupAlbums]) => (
                        <div key={groupTitle} style={{ marginBottom: '36px', animation: 'fadeIn 0.4s ease-out' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                marginBottom: '18px', color: 'var(--text-secondary)',
                                fontSize: '14px', fontWeight: 700
                            }}>
                                <Calendar size={14} />
                                <span>{groupTitle}</span>
                                <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border)' }} />
                            </div>

                            <div className="gallery-grid" style={{ minHeight: '100px' }}>
                                {groupAlbums.map((album) => (
                                    <AlbumCard key={album.id} album={album} isOwner={isOwner} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center', padding: '80px 0',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        {searchQuery ? (
                            <div>
                                <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                                    No se encontraron álbumes &quot;{searchQuery}&quot;
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>
                                    Esta galería está vacía
                                </p>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                                    ¡Agrega tu primer álbum de fotos!
                                </p>
                            </div>
                        )}
                        {isOwner && !searchQuery && (
                            <Link href={`/create?galleryId=${gallery.id}`} className="btn btn-primary">
                                📸 Crear Álbum
                            </Link>
                        )}
                    </div>
                )}
            </main>
        </>
    )
}
