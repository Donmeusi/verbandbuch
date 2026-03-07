"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminUser {
    id: number;
    username: string;
}

type ModalMode = "create" | "editUsername" | "editPassword" | "delete" | null;

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<AdminUser | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: "", type: "success" });

    // Form fields
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [formError, setFormError] = useState("");

    const showToast = (msg: string, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
    };

    const fetchUsers = useCallback(async () => {
        const res = await fetch("/api/admin/users");
        if (res.status === 401) { router.push("/admin/login"); return; }
        setUsers(await res.json());
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const closeModal = () => {
        setModal(null); setSelected(null);
        setNewUsername(""); setNewPassword(""); setConfirmPassword(""); setFormError("");
    };

    const openCreate = () => { closeModal(); setModal("create"); };
    const openEditUsername = (u: AdminUser) => { closeModal(); setSelected(u); setNewUsername(u.username); setModal("editUsername"); };
    const openEditPassword = (u: AdminUser) => { closeModal(); setSelected(u); setModal("editPassword"); };
    const openDelete = (u: AdminUser) => { closeModal(); setSelected(u); setModal("delete"); };

    const handleCreate = async () => {
        setFormError("");
        if (!newUsername || newUsername.trim().length < 3) { setFormError("Benutzername muss mindestens 3 Zeichen lang sein."); return; }
        if (!newPassword || newPassword.length < 6) { setFormError("Passwort muss mindestens 6 Zeichen lang sein."); return; }
        if (newPassword !== confirmPassword) { setFormError("Passwörter stimmen nicht überein."); return; }
        setSaving(true);
        const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: newUsername.trim(), password: newPassword }),
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) { closeModal(); fetchUsers(); showToast("✅ Benutzer erstellt!"); }
        else setFormError(data.error || "Fehler beim Erstellen des Benutzers");
    };

    const handleUpdateUsername = async () => {
        if (!selected) return;
        setFormError("");
        if (!newUsername || newUsername.trim().length < 3) { setFormError("Benutzername muss mindestens 3 Zeichen lang sein."); return; }
        setSaving(true);
        const res = await fetch(`/api/admin/users/${selected.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: newUsername.trim() }),
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) { closeModal(); fetchUsers(); showToast("✅ Benutzername geändert!"); }
        else setFormError(data.error || "Fehler beim Ändern des Benutzernamens");
    };

    const handleUpdatePassword = async () => {
        if (!selected) return;
        setFormError("");
        if (!newPassword || newPassword.length < 6) { setFormError("Passwort muss mindestens 6 Zeichen lang sein."); return; }
        if (newPassword !== confirmPassword) { setFormError("Passwörter stimmen nicht überein."); return; }
        setSaving(true);
        const res = await fetch(`/api/admin/users/${selected.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword }),
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) { closeModal(); showToast("✅ Passwort geändert!"); }
        else setFormError(data.error || "Fehler beim Ändern des Passworts");
    };

    const handleDelete = async () => {
        if (!selected) return;
        setSaving(true);
        const res = await fetch(`/api/admin/users/${selected.id}`, { method: "DELETE" });
        const data = await res.json();
        setSaving(false);
        if (data.success) { closeModal(); fetchUsers(); showToast("🗑️ Benutzer gelöscht!", "warning"); }
        else setFormError(data.error || "Fehler beim Löschen");
    };

    const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); };

    return (
        <div>
            {/* Toast */}
            {toast.msg && (
                <div style={{ position: "fixed", top: "80px", right: "1.5rem", zIndex: 300, animation: "slideUp 0.2s ease" }}>
                    <div className={`alert ${toast.type === "warning" ? "alert-warning" : "alert-success"}`}>{toast.msg}</div>
                </div>
            )}

            {/* Navbar */}
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
                        <Link href="/admin/users" className="nav-link active">Benutzerverwaltung</Link>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Abmelden</button>
                    </div>
                </div>
            </nav>

            <main className="container" style={{ padding: "2rem 1.5rem" }}>
                <div className="flex items-center justify-between mb-3" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Benutzerverwaltung</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Administrator-Konten verwalten</p>
                    </div>
                    <button onClick={openCreate} className="btn btn-primary">
                        ➕ Neuen Benutzer erstellen
                    </button>
                </div>

                {/* Info Box */}
                <div className="alert alert-info mb-3">
                    ℹ️ Hier können Sie Admin-Konten verwalten. Der <strong>letzte Administrator</strong> kann nicht gelöscht werden. Passwörter müssen mindestens 6 Zeichen lang sein.
                </div>

                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }}></div></div>
                ) : (
                    <div className="card" style={{ padding: 0 }}>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Benutzername</th>
                                        <th>Rolle</th>
                                        <th>Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td style={{ color: "var(--text-muted)" }}>{u.id}</td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                                                        {u.username[0].toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.username}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-yes">Administrator</span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1" style={{ flexWrap: "wrap" }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditUsername(u)} title="Benutzername ändern">
                                                        ✏️ Benutzername
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEditPassword(u)} title="Passwort ändern">
                                                        🔑 Passwort
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => openDelete(u)}
                                                        title="Benutzer löschen"
                                                        disabled={users.length <= 1}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {users.length <= 1 && !loading && (
                    <p className="text-sm text-muted mt-2 text-center">
                        ⚠️ Es gibt nur einen Administrator. Der letzte Administrator kann nicht gelöscht werden.
                    </p>
                )}
            </main>

            {/* ── Create Modal ──────────────────────────────────── */}
            {modal === "create" && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
                        <div className="modal-title">
                            ➕ Neuen Administrator erstellen
                            <button onClick={closeModal} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        {formError && <div className="alert alert-error mb-2">⚠️ {formError}</div>}
                        <div className="form-grid single">
                            <div className="form-group">
                                <label>Benutzername *</label>
                                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="min. 3 Zeichen" autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Passwort *</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="min. 6 Zeichen" />
                            </div>
                            <div className="form-group">
                                <label>Passwort bestätigen *</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModal} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleCreate} className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Erstellen…</> : "✅ Benutzer erstellen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Username Modal ───────────────────────────── */}
            {modal === "editUsername" && selected && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
                        <div className="modal-title">
                            ✏️ Benutzername ändern
                            <button onClick={closeModal} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        {formError && <div className="alert alert-error mb-2">⚠️ {formError}</div>}
                        <div className="form-group mb-3">
                            <label>Neuer Benutzername *</label>
                            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="min. 3 Zeichen" autoFocus />
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModal} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleUpdateUsername} className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Speichern…</> : "💾 Speichern"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Password Modal ───────────────────────────── */}
            {modal === "editPassword" && selected && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
                        <div className="modal-title">
                            🔑 Passwort ändern – {selected.username}
                            <button onClick={closeModal} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        {formError && <div className="alert alert-error mb-2">⚠️ {formError}</div>}
                        <div className="form-grid single">
                            <div className="form-group">
                                <label>Neues Passwort *</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="min. 6 Zeichen" autoFocus />
                            </div>
                            <div className="form-group">
                                <label>Passwort bestätigen *</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Passwort wiederholen" />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModal} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleUpdatePassword} className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Ändern…</> : "🔑 Passwort ändern"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Modal ──────────────────────────────────── */}
            {modal === "delete" && selected && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
                        <div className="modal-title">
                            🗑️ Benutzer löschen?
                            <button onClick={closeModal} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        <div className="alert alert-error mb-2">
                            Möchten Sie den Benutzer <strong>«{selected.username}»</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </div>
                        {formError && <div className="alert alert-error mb-2">⚠️ {formError}</div>}
                        <div className="modal-actions">
                            <button onClick={closeModal} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleDelete} className="btn btn-danger" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Löschen…</> : "🗑️ Endgültig löschen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
