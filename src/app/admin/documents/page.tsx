"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Doc {
    id: number;
    name: string;
    description: string;
    filename: string;
    mimetype: string;
    size: number;
    created_at: string;
}

function formatBytes(b: number) {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
    if (mime.includes("pdf")) return "📄";
    if (mime.includes("word") || mime.includes("document")) return "📝";
    if (mime.includes("sheet") || mime.includes("excel")) return "📊";
    if (mime.includes("image")) return "🖼️";
    return "📎";
}

export default function AdminDocumentsPage() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [docs, setDocs] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");
    const [editDoc, setEditDoc] = useState<Doc | null>(null);
    const [deleteDoc, setDeleteDoc] = useState<Doc | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    // Upload form
    const [uploadName, setUploadName] = useState("");
    const [uploadDesc, setUploadDesc] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Arztbesuch-Beschreibung
    const [arztText, setArztText] = useState("");
    const [arztTextSaving, setArztTextSaving] = useState(false);
    const [arztTextLoaded, setArztTextLoaded] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const fetchDocs = useCallback(async () => {
        const res = await fetch("/api/documents");
        if (res.status === 401) { router.push("/admin/login"); return; }
        setDocs(await res.json());
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchDocs(); }, [fetchDocs]);

    // Load arztbesuch description
    useEffect(() => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(d => { setArztText(d.arztbesuch_beschreibung ?? ""); setArztTextLoaded(true); })
            .catch(() => setArztTextLoaded(true));
    }, []);

    const handleSaveArztText = async (e: React.FormEvent) => {
        e.preventDefault();
        setArztTextSaving(true);
        const res = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arztbesuch_beschreibung: arztText }),
        });
        setArztTextSaving(false);
        const data = await res.json();
        if (data.success) showToast("✅ Hinweistext gespeichert!");
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!selectedFile) { setError("Bitte eine Datei auswählen."); return; }
        if (!uploadName.trim()) { setError("Bitte einen Namen eingeben."); return; }
        setUploading(true);
        const fd = new FormData();
        fd.append("file", selectedFile);
        fd.append("name", uploadName.trim());
        fd.append("description", uploadDesc.trim());
        const res = await fetch("/api/documents", { method: "POST", body: fd });
        const data = await res.json();
        setUploading(false);
        if (data.success) {
            setUploadName(""); setUploadDesc(""); setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchDocs(); showToast("✅ Dokument hochgeladen!");
        } else { setError(data.error || "Fehler beim Hochladen"); }
    };

    const handleSaveEdit = async () => {
        if (!editDoc) return;
        setSaving(true);
        const res = await fetch(`/api/documents/${editDoc.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: editName, description: editDesc }),
        });
        setSaving(false);
        const data = await res.json();
        if (data.success) { setEditDoc(null); fetchDocs(); showToast("✅ Gespeichert!"); }
    };

    const handleDelete = async () => {
        if (!deleteDoc) return;
        setDeleting(true);
        const res = await fetch(`/api/documents/${deleteDoc.id}`, { method: "DELETE" });
        setDeleting(false);
        const data = await res.json();
        if (data.success) { setDeleteDoc(null); fetchDocs(); showToast("🗑️ Dokument gelöscht!"); }
        else setError(data.error || "Fehler");
    };

    const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); };

    return (
        <div>
            {toast && (
                <div style={{ position: "fixed", top: "80px", right: "1.5rem", zIndex: 300, animation: "slideUp 0.2s ease" }}>
                    <div className="alert alert-success">{toast}</div>
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
                        <Link href="/admin/documents" className="nav-link active">Dokumente</Link>
                        <Link href="/admin/users" className="nav-link">Benutzer</Link>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Abmelden</button>
                    </div>
                    <button className={`navbar-toggle${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menü">
                        <span className="navbar-toggle-icon" />
                    </button>
                </div>
                <div className={`navbar-mobile${menuOpen ? " open" : ""}`}>
                    <Link href="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>📋 Meldungen</Link>
                    <Link href="/admin/stats" className="nav-link" onClick={() => setMenuOpen(false)}>📊 Statistiken</Link>
                    <Link href="/admin/documents" className="nav-link active" onClick={() => setMenuOpen(false)}>📄 Dokumente</Link>
                    <Link href="/admin/users" className="nav-link" onClick={() => setMenuOpen(false)}>👤 Benutzer</Link>
                    <Link href="/admin/settings" className="nav-link" onClick={() => setMenuOpen(false)}>⚙️ Einstellungen</Link>
                    <button onClick={handleLogout} className="btn btn-secondary">Abmelden</button>
                </div>
            </nav>

            <main className="container admin-page-main" style={{ padding: "2rem 1.5rem" }}>
                <div className="mb-3">
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Dokumente</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Formulare und Vorlagen zum Download für Meldende anbieten</p>
                </div>

                <div className="alert alert-info mb-3">
                    🩺 Dokumente hier werden bei Meldungen mit Arztbesuch als Download-Links angezeigt (z.B. Unfallanzeige-Vorlagen, Formulare der Berufsgenossenschaft).
                </div>

                {/* Upload Form */}
                <div className="card mb-3">
                    <div className="card-title">📤 Neues Dokument hochladen</div>
                    {error && <div className="alert alert-error mb-2">⚠️ {error}</div>}
                    <form onSubmit={handleUpload}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Anzeigename *</label>
                                <input type="text" value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="z.B. Unfallanzeige BG" required />
                            </div>
                            <div className="form-group">
                                <label>Beschreibung (optional)</label>
                                <input type="text" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="z.B. Auszufüllen bei Arztbesuch" />
                            </div>
                            <div className="form-group full">
                                <label>Datei * (PDF, Word, Excel, etc.)</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,.png,.jpg"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                    style={{ padding: "0.5rem 0.85rem" }}
                                    required
                                />
                            </div>
                        </div>
                        {selectedFile && (
                            <div className="alert alert-info mb-2" style={{ marginTop: "0.75rem" }}>
                                📎 {selectedFile.name} ({formatBytes(selectedFile.size)})
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: "0.75rem" }} disabled={uploading}>
                            {uploading ? <><span className="spinner"></span> Wird hochgeladen…</> : "📤 Hochladen"}
                        </button>
                    </form>
                </div>

                {/* Document List */}
                <div className="card" style={{ padding: 0 }}>
                    {loading ? (
                        <div className="empty-state"><div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 1rem" }}></div></div>
                    ) : docs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📂</div>
                            <p>Noch keine Dokumente hochgeladen.</p>
                        </div>
                    ) : (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Dokument</th>
                                        <th>Beschreibung</th>
                                        <th>Typ</th>
                                        <th>Größe</th>
                                        <th>Hochgeladen</th>
                                        <th>Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docs.map((d) => (
                                        <tr key={d.id}>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                    <span style={{ fontSize: "1.4rem" }}>{fileIcon(d.mimetype)}</span>
                                                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{d.description || "–"}</td>
                                            <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{d.mimetype.split("/")[1]?.toUpperCase() ?? d.mimetype}</td>
                                            <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{formatBytes(d.size)}</td>
                                            <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                                                {new Date(d.created_at).toLocaleDateString("de-DE")}
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <a href={`/api/documents/${d.id}/download`} className="btn btn-success btn-sm" download>⬇️</a>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditDoc(d); setEditName(d.name); setEditDesc(d.description); }}>✏️</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteDoc(d)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Modal */}
            {editDoc && (
                <div className="modal-backdrop" onClick={() => setEditDoc(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
                        <div className="modal-title">
                            ✏️ Dokument bearbeiten
                            <button onClick={() => setEditDoc(null)} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        <div className="form-grid single">
                            <div className="form-group">
                                <label>Anzeigename *</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Beschreibung</label>
                                <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setEditDoc(null)} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleSaveEdit} className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Speichern…</> : "💾 Speichern"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteDoc && (
                <div className="modal-backdrop" onClick={() => setDeleteDoc(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
                        <div className="modal-title">
                            🗑️ Dokument löschen?
                            <button onClick={() => setDeleteDoc(null)} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        <div className="alert alert-error mb-2">
                            «<strong>{deleteDoc.name}</strong>» wird dauerhaft gelöscht. Die Download-Links werden für Meldende nicht mehr verfügbar sein.
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setDeleteDoc(null)} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
                                {deleting ? <><span className="spinner"></span> Löschen…</> : "🗑️ Löschen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
