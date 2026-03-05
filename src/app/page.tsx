
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Plus, Folder, ImageIcon } from "lucide-react"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/LogoutButton"

export const revalidate = 0

export default async function Home() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch Galleries instead of albums
    const { data: galleries } = await supabase
        .from("galleries")
        .select("*, albums(count)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    return (
        <>
            <header className="app-header">
                <div className="logo">
                    <span>Pixly</span> Familia
                </div>

                <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
                    <LogoutButton />
                </div>
            </header>

            <main className="main-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        paddingLeft: '2px'
                    }}>
                        📸 Mis Galerías
                    </h2>
                    <Link href="/create-gallery" className="btn btn-primary" style={{ height: '34px', fontSize: '13px', borderRadius: '12px' }}>
                        <Plus size={15} style={{ marginRight: '4px' }} />
                        <span>Nueva Galería</span>
                    </Link>
                </div>

                {galleries && galleries.length > 0 ? (
                    <div className="gallery-grid">
                        {galleries.map((gallery, index) => (
                            <Link key={gallery.id} href={`/gallery/${gallery.id}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    backgroundColor: 'var(--surface)',
                                    borderRadius: 'var(--radius)',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: '1px solid var(--border)',
                                    transition: 'all 0.3s ease',
                                    height: '100%',
                                    minHeight: '130px',
                                    cursor: 'pointer',
                                    animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)'
                                        e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                                        e.currentTarget.style.borderColor = 'var(--primary)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                                        e.currentTarget.style.borderColor = 'var(--border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--foreground)' }}>
                                        <div style={{
                                            width: '36px', height: '36px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Folder size={18} color="var(--primary)" />
                                        </div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{gallery.title}</h3>
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: 'var(--text-secondary)',
                                        marginTop: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <ImageIcon size={13} />
                                        {gallery.albums?.[0]?.count || 0} álbumes
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 0',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{
                            width: '80px', height: '80px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '20px'
                        }}>
                            <Folder size={36} color="var(--primary)" />
                        </div>
                        <p style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 700, color: 'var(--foreground)' }}>
                            ¡Empieza a crear recuerdos!
                        </p>
                        <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Crea tu primera galería para organizar tus fotos
                        </p>
                        <Link href="/create-gallery" className="btn btn-primary">
                            ✨ Crear Galería
                        </Link>
                    </div>
                )}
            </main>
        </>
    )
}
