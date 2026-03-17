"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSettingsPage() {
    const router = useRouter();
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((r) => {
                if (r.status === 401) { router.push("/admin/login"); return null; }
                return r.json();
            })
            .then((d) => {
                if (d) { setText(d.arztbesuch_beschreibung ?? ""); setLoading(false); }
            });
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arztbesuch_beschreibung: text }),
        });
        setSaving(false);
        const data = await res.json();
        if (data.success) {
            showToast("✅ Einstellung gespeichert!");
        } else {
            showToast("❌ Fehler beim Speichern.");
        }
    };

    return (
        <div>
            {toast && (
                <div style={{ position: "fixed", top: "80px", right: "1.5rem", zIndex: 300, animation: "slideUp 0.2s ease" }}>
                    <div className="alert alert-success">{toast}</div>
                </div>
            )}

            <nav className="navbar">
                <div className="container-wide navbar-inner">
                    <Link href="/" className="navbar-brand">
                        <div className="logo-icon">🩹</div>
                        <div><div className="brand-text">Verbandbuch</div><div className="brand-sub">Admin-Bereich</div></div>
                    </Link>
                    <div className="navbar-links">
                        <Link href="/admin" className="nav-link">Meldungen</Link>
                        <Link href="/admin/stats" className="nav-link">Statistiken</Link>
                        <Link href="/admin/documents" className="nav-link">Dokumente</Link>
                        <Link href="/admin/users" className="nav-link">Benutzer</Link>
                        <Link href="/admin/settings" className="nav-link active">Einstellungen</Link>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Abmelden</button>
                    </div>
                </div>
            </nav>

            <main className="container-wide" style={{ padding: "2rem 1.5rem" }}>
                <div className="mb-3">
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Einstellungen</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Texte und Hinweise der Anwendung anpassen</p>
                </div>

                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }}></div><p>Laden…</p></div>
                ) : (
                    <div className="card" style={{ maxWidth: "800px" }}>
                        <div className="card-title">🏥 Hinweistext bei Arztbesuch</div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                            Dieser Text erscheint im Meldeformular, wenn die Option <strong>„Ja, ein Arzt wurde aufgesucht bzw. ist erforderlich"</strong> aktiviert wird.
                        </p>
                        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                            <label htmlFor="arztText">Hinweistext</label>
                            <textarea
                                id="arztText"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={6}
                                placeholder="Hinweistext für Arztbesuch eingeben…"
                                style={{ resize: "vertical" }}
                            />
                        </div>

                        <div className="alert alert-warning mb-2" style={{ fontSize: "0.85rem" }}>
                            <strong>Vorschau:</strong>
                            <div style={{ marginTop: "0.4rem", whiteSpace: "pre-wrap" }}>{text || <em style={{ opacity: 0.5 }}>Kein Text eingegeben</em>}</div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                            style={{ marginTop: "0.5rem" }}
                        >
                            {saving ? <><span className="spinner"></span> Speichern…</> : "💾 Einstellung speichern"}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
