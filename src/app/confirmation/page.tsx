"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Doc { id: number; name: string; description: string; mimetype: string; size: number; }

function formatBytes(b: number) {
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function fileIcon(mime: string) {
    if (mime.includes("pdf")) return "📄";
    if (mime.includes("word") || mime.includes("document")) return "📝";
    if (mime.includes("sheet") || mime.includes("excel")) return "📊";
    return "📎";
}

function ConfirmationContent() {
    const params = useSearchParams();
    const token = params.get("token");
    const arzt = params.get("arzt") === "1";
    const [copied, setCopied] = useState(false);
    const [docs, setDocs] = useState<Doc[]>([]);

    const editUrl = token ? `${window.location.origin}/edit/${token}` : "";

    useEffect(() => {
        if (arzt) {
            fetch("/api/documents").then(r => r.json()).then(setDocs).catch(() => { });
        }
    }, [arzt]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(editUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!token) {
        return (
            <div className="container">
                <div className="page-header">
                    <h1>Ungültiger Link</h1>
                    <p>Kein gültiges Token gefunden.</p>
                </div>
                <div className="text-center">
                    <Link href="/" className="btn btn-primary">Zur Startseite</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>✅ Meldung eingereicht!</h1>
                <p>Ihre Unfallmeldung wurde erfolgreich gespeichert.</p>
            </div>

            <div className="section">
                <div className="card">
                    <div className="alert alert-success mb-2">
                        🎉 Ihre Meldung wurde erfolgreich im Verbandbuch eingetragen. Bitte notieren oder speichern Sie den folgenden persönlichen Bearbeitungslink.
                    </div>

                    <div className="card-title">🔗 Ihr persönlicher Bearbeitungslink</div>

                    <p className="text-sm text-muted mb-2">
                        Mit diesem Link können Sie Ihre Meldung jederzeit <strong style={{ color: "var(--text-secondary)" }}>bearbeiten oder löschen</strong>. Bitte speichern Sie diesen Link sorgfältig — er kann nicht erneut angezeigt werden!
                    </p>

                    <div className="token-box">
                        <div className="text-sm text-muted mb-1">Ihr persönlicher Link:</div>
                        <div className="token-url">{editUrl}</div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button onClick={copyToClipboard} className={`btn ${copied ? "btn-success" : "btn-primary"}`}>
                            {copied ? "✅ Kopiert!" : "📋 Link kopieren"}
                        </button>
                        <Link href={editUrl} className="btn btn-secondary">
                            Meldung ansehen →
                        </Link>
                    </div>

                    <div className="alert alert-warning mt-2">
                        ⚠️ <strong>Wichtig:</strong> Speichern Sie diesen Link, z.B. als Lesezeichen oder in einer E-Mail an sich selbst. Ohne diesen Link können Sie Ihre Meldung nicht mehr bearbeiten.
                    </div>
                </div>

                {/* ── Arztbesuch: Unfallmeldung erforderlich ───────────────── */}
                {arzt && (
                    <div className="card mt-2" style={{ border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.07)" }}>
                        <div className="card-title" style={{ color: "var(--warning)" }}>
                            🏥 Arztbesuch – Offizielle Unfallmeldung erforderlich!
                        </div>
                        <div className="alert alert-warning mb-3">
                            <strong>Da ein Arzt aufgesucht wurde, muss eine offizielle Unfallanzeige eingereicht werden.</strong>
                            <br />
                            <span style={{ fontSize: "0.9em" }}>
                                Bitte füllen Sie die erforderlichen Formulare aus und senden Sie diese an: <strong>unfallmeldung@hs-anhalt.de</strong>. Eine Unfallanzeige ist gesetzlich vorgeschrieben und muss innerhalb von 3 Tagen eingereicht werden.
                            </span>
                        </div>

                        {docs.length > 0 ? (
                            <>
                                <div className="card-title" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
                                    📥 Formulare zum Herunterladen:
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {docs.map(d => (
                                        <a
                                            key={d.id}
                                            href={`/api/documents/${d.id}/download`}
                                            className="card"
                                            download
                                            style={{
                                                display: "flex", alignItems: "center", gap: "1rem",
                                                padding: "0.85rem 1.1rem", textDecoration: "none",
                                                border: "1px solid var(--border)", cursor: "pointer",
                                                transition: "border-color 0.2s, transform 0.15s",
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                                            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                                        >
                                            <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{fileIcon(d.mimetype)}</span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>{d.name}</div>
                                                {d.description && <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.15rem" }}>{d.description}</div>}
                                                <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.2rem" }}>{formatBytes(d.size)}</div>
                                            </div>
                                            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap" }}>⬇️ Herunterladen</span>
                                        </a>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="alert alert-info">
                                ℹ️ Wenden Sie sich an Ihre Personalabteilung für die erforderlichen Formulare.
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center mt-2">
                    <Link href="/" className="btn btn-secondary">
                        ← Weitere Meldung erfassen
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <>
            <nav className="navbar">
                <div className="container-wide navbar-inner">
                    <Link href="/" className="navbar-brand">
                        <div className="logo-icon">🩹</div>
                        <div>
                            <div className="brand-text">Verbandbuch</div>
                            <div className="brand-sub">Digitale Unfallmeldung</div>
                        </div>
                    </Link>
                </div>
            </nav>
            <Suspense fallback={<div className="container" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Laden…</div>}>
                <ConfirmationContent />
            </Suspense>
        </>
    );
}
