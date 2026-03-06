"use client"

import { useState, useRef } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Upload, X, Loader2, Calendar } from "lucide-react"

export default function CreateAlbumForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const galleryId = searchParams.get("galleryId")

    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    // Use local date parts to avoid UTC shift with toISOString()
    const today = new Date()
    const [date, setDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)
    const [externalLink, setExternalLink] = useState("")
    const [error, setError] = useState<string | null>(null)

    // Image & Cropping State
    const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    const containerRef = useRef<HTMLDivElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const url = URL.createObjectURL(file)
            setImageSrc(url)

            // Reset crop state
            setZoom(1)
            setOffset({ x: 0, y: 0 })

            const img = new Image()
            img.src = url
            img.onload = () => setOriginalImage(img)
        }
    }

    // Simple Drag Logic for cropping
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        })
    }

    const handleMouseUp = () => setIsDragging(false)
    const handleMouseLeave = () => setIsDragging(false)

    // Crop Processing
    const getCroppedImageBlob = async (): Promise<Blob | null> => {
        if (!originalImage || !containerRef.current) return null

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        // 16:9 Aspect Ratio Output (e.g., 1280x720)
        canvas.width = 1280
        canvas.height = 720

        // Clear
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const container = containerRef.current
        const scaleX = canvas.width / container.clientWidth
        const scaleY = canvas.height / container.clientHeight

        // Use the larger scale to cover
        const scale = Math.max(scaleX, scaleY) * zoom

        const x = (canvas.width / 2) - (originalImage.width * scale / 2) + (offset.x * (canvas.width / container.clientWidth))
        const y = (canvas.height / 2) - (originalImage.height * scale / 2) + (offset.y * (canvas.height / container.clientHeight))

        ctx.drawImage(originalImage, x, y, originalImage.width * scale, originalImage.height * scale)

        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!imageSrc || !title) {
            setError("Por favor escribe un título y selecciona una imagen.")
            setLoading(false)
            return
        }

        if (!galleryId) {
            setError("No se seleccionó ninguna galería. Vuelve atrás e intenta de nuevo.")
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Usuario no autenticado")

            // Process Image
            const croppedBlob = await getCroppedImageBlob()
            if (!croppedBlob) throw new Error("Error al procesar la imagen")

            const fileName = `${user.id}/${Date.now()}.jpg`

            // Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from("covers")
                .upload(fileName, croppedBlob)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from("covers")
                .getPublicUrl(fileName)

            // Insert Album
            const { error: insertError } = await supabase
                .from("albums")
                .insert([
                    {
                        title,
                        external_link: externalLink || null,
                        cover_url: publicUrl,
                        user_id: user.id,
                        gallery_id: galleryId,
                        album_date: date
                    },
                ])

            if (insertError) throw insertError

            router.push(`/gallery/${galleryId}`)
            router.refresh()
        } catch (err: unknown) {
            console.error(err)
            const msg = err instanceof Error ? err.message : "Algo salió mal"
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="login-card">
            <h2 className="login-title" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>
                📸 Nuevo Álbum
            </h2>

            {error && <div className="message message-error">{error}</div>}

            {/* Image Preview / Cropper */}
            <div className="form-group">
                <label className="label">Portada (Arrastra para ajustar)</label>
                {!imageSrc ? (
                    <div style={{
                        border: '2px dashed var(--primary)',
                        borderRadius: 'var(--radius)',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        backgroundColor: 'var(--primary-light)',
                        transition: 'all 0.3s ease'
                    }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        <div className="flex-center" style={{ flexDirection: 'column', color: 'var(--primary)', gap: '8px' }}>
                            <Upload size={28} />
                            <span style={{ fontWeight: 700 }}>Click para subir imagen</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>JPG, PNG o WEBP</span>
                        </div>
                    </div>
                ) : (
                    <div style={{ width: '100%' }}>
                        <div
                            ref={containerRef}
                            style={{
                                position: 'relative',
                                borderRadius: 'var(--radius)',
                                overflow: 'hidden',
                                aspectRatio: '16/9',
                                backgroundColor: 'var(--background)',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                touchAction: 'none',
                                border: '1px solid var(--border)'
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img
                                src={imageSrc}
                                alt="Preview"
                                draggable={false}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                    transition: isDragging ? 'none' : 'transform 0.1s',
                                    userSelect: 'none',
                                    pointerEvents: 'none'
                                }}
                            />

                            {/* Overlay Guidelines */}
                            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(126, 181, 168, 0.3)', pointerEvents: 'none', borderRadius: 'var(--radius)' }} />
                        </div>

                        {/* Zoom Control */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>Zoom:</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                style={{ flex: 1, accentColor: 'var(--primary)' }}
                            />
                            <button
                                type="button"
                                onClick={() => { setImageSrc(null); setOriginalImage(null); }}
                                style={{
                                    color: 'var(--error)', border: 'none', background: 'none',
                                    fontSize: '12px', cursor: 'pointer', fontWeight: 700
                                }}
                            >
                                Cambiar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="label">Título</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Viaje a Cancún"
                    className="input"
                    required
                />
            </div>

            <div className="form-group">
                <label className="label">Fecha</label>
                <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input"
                        style={{ paddingLeft: '38px', colorScheme: 'light' }}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="label">Link Externo (Opcional)</label>
                <input
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://photos.google.com/..."
                    className="input"
                    type="url"
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Link donde está el álbum completo
                </p>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-4">
                {loading ? (
                    <div className="flex-center">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Creando...</span>
                    </div>
                ) : (
                    "✨ Crear Álbum"
                )}
            </button>
        </form>
    )
}
