"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminSettingsPage() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");

    // Backup / Restore state
    const [restoring, setRestoring] = useState(false);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast(msg); setToastType(type); setTimeout(() => setToast(""), 4000);
    };

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
            showToast("❌ Fehler beim Speichern.", "error");
        }
    };

    const handleBackup = () => {
        const a = document.createElement("a");
        a.href = "/api/admin/backup";
        a.click();
        showToast("✅ Backup-Download gestartet!");
    };

    const handleRestore = async () => {
        if (!restoreFile) return;
        setRestoring(true);
        try {
            const fileText = await restoreFile.text();
            const json = JSON.parse(fileText);
            const res = await fetch("/api/admin/restore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(json),
            });
            const data = await res.json();
            if (data.success) {
                showToast(`✅ Wiederhergestellt: ${data.restored} neu, ${data.skipped} bereits vorhanden.`);
                setRestoreFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                showToast(`❌ Fehler: ${data.error}`, "error");
            }
        } catch {
            showToast("❌ Ungültige Backup-Datei.", "error");
        }
        setRestoring(false);
    };

    return (
        <div>
            {toast && (
                <div style={{ position: "fixed", top: "80px", right: "1.5rem", zIndex: 300, animation: "slideUp 0.2s ease", maxWidth: "420px" }}>
                    <div className={`alert alert-${toastType === "error" ? "error" : "success"}`}>{toast}</div>
                </div>
            )}

            <nav className="navbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
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
                    <button className={`navbar-toggle${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menü">
                        <span className="navbar-toggle-icon" />
                    </button>
                </div>
                <div className={`navbar-mobile${menuOpen ? " open" : ""}`}>
                    <Link href="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>📋 Meldungen</Link>
                    <Link href="/admin/stats" className="nav-link" onClick={() => setMenuOpen(false)}>📊 Statistiken</Link>
                    <Link href="/admin/documents" className="nav-link" onClick={() => setMenuOpen(false)}>📄 Dokumente</Link>
                    <Link href="/admin/users" className="nav-link" onClick={() => setMenuOpen(false)}>👤 Benutzer</Link>
                    <Link href="/admin/settings" className="nav-link active" onClick={() => setMenuOpen(false)}>⚙️ Einstellungen</Link>
                    <button onClick={handleLogout} className="btn btn-secondary">Abmelden</button>
                </div>
            </nav>

            <main className="container-wide admin-page-main" style={{ padding: "2rem 1.5rem" }}>
                <div className="mb-3">
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Einstellungen</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Texte, Hinweise und Datensicherung verwalten</p>
                </div>

                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }}></div><p>Laden…</p></div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px" }}>

                        {/* ── Arztbesuch Hinweis ─────────────────── */}
                        <div className="card">
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

                        {/* ── Datensicherung ─────────────────────── */}
                        <div className="card">
                            <div className="card-title">🗄️ Datensicherung & Wiederherstellung</div>

                            {/* Export */}
                            <div style={{ marginBottom: "2rem" }}>
                                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem" }}>Backup erstellen</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                                    Alle Unfallmeldungen und Einstellungen als JSON-Datei herunterladen. Die Datei kann zur Wiederherstellung verwendet werden.
                                </p>
                                <button className="btn btn-primary" onClick={handleBackup} id="btn-backup-download">
                                    💾 Backup herunterladen
                                </button>
                            </div>

                            <hr style={{ border: "none", borderTop: "1px solid var(--border)", marginBottom: "1.5rem" }} />

                            {/* Import */}
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.4rem" }}>Wiederherstellen</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                                    Backup-Datei auswählen und importieren. Bereits vorhandene Meldungen werden nicht überschrieben – nur fehlende Einträge werden ergänzt.
                                </p>

                                <div className="alert alert-warning mb-2" style={{ fontSize: "0.85rem" }}>
                                    ⚠️ <strong>Hinweis:</strong> Nur Meldungen, die noch nicht in der Datenbank vorhanden sind, werden importiert. Einstellungen werden aktualisiert.
                                </div>

                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginTop: "1rem" }}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        id="restoreFile"
                                        style={{
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "var(--radius-sm)",
                                            background: "#fff",
                                            fontSize: "0.875rem",
                                            color: "var(--text-primary)",
                                            flex: 1,
                                            minWidth: "200px",
                                        }}
                                        onChange={(e) => setRestoreFile(e.target.files?.[0] ?? null)}
                                    />
                                    <button
                                        id="btn-restore"
                                        className="btn btn-secondary"
                                        onClick={handleRestore}
                                        disabled={!restoreFile || restoring}
                                    >
                                        {restoring ? <><span className="spinner"></span> Importieren…</> : "📤 Wiederherstellen"}
                                    </button>
                                </div>
                                {restoreFile && (
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                                        Ausgewählt: <strong>{restoreFile.name}</strong> ({(restoreFile.size / 1024).toFixed(1)} KB)
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
