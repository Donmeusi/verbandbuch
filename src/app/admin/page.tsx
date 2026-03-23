"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Report } from "@/lib/db";

const ABTEILUNGEN = ["Produktion", "Lager", "Verwaltung", "Technik", "Versand", "Qualitätssicherung", "Küche/Kantine", "Reinigung", "Sonstiges"];
const VERLETZUNGSARTEN = ["Schnittwunde", "Schürfwunde", "Prellung", "Stauchung", "Verbrühung/Verbrennung", "Fremdkörper im Auge", "Quetschung", "Zerrung", "Gefahrstoffunfall", "Verätzung", "Augenverletzung", "Elektrischer Schlag", "Insektenstich/-biss", "Hitzschlag/Sonnenstich", "Inhalation von Dämpfen/Gasen", "Knochenbruch", "Sonstiges"];
const KOERPERTEILE = ["Finger", "Hand", "Handgelenk", "Arm", "Schulter", "Kopf", "Gesicht", "Auge", "Fuß", "Zeh", "Knie", "Bein", "Rücken", "Sonstiges"];

export default function AdminDashboard() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editReport, setEditReport] = useState<Report | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const fetchReports = useCallback(async () => {
        const res = await fetch("/api/admin/reports");
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const handleSave = async () => {
        if (!editReport) return;
        setSaving(true);
        const res = await fetch(`/api/admin/reports/${editReport.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...editReport }),
        });
        setSaving(false);
        const data = await res.json();
        if (data.success) { setEditReport(null); fetchReports(); showToast("✅ Meldung gespeichert!"); }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        setDeleting(true);
        const res = await fetch(`/api/admin/reports/${deleteId}`, { method: "DELETE" });
        setDeleting(false);
        const data = await res.json();
        if (data.success) { setDeleteId(null); fetchReports(); showToast("🗑️ Meldung gelöscht!"); }
    };

    const exportCSV = () => {
        const headers = ["ID", "Datum", "Uhrzeit", "Name", "Abteilung", "Unfallort", "Verletzungsart", "Körperteil", "Ersthelfer", "Arzt", "Erfasst am"];
        const rows = filtered.map(r => [r.id, r.datum, r.uhrzeit, r.name, r.abteilung, r.unfallort, r.verletzungsart, r.koerperteil, r.ersthelfer, r.arzt_aufgesucht ? "Ja" : "Nein", r.created_at]);
        const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `verbandbuch_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const filtered = reports.filter(r =>
        !search || [r.name, r.abteilung, r.unfallort, r.verletzungsart].some(f => f.toLowerCase().includes(search.toLowerCase()))
    );

    const setEdit = (field: string, value: string | number) => setEditReport((r) => r ? { ...r, [field]: value } : r);

    const formatDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("de-DE") : "-";

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
                        <Link href="/admin" className="nav-link active">Meldungen</Link>
                        <Link href="/admin/stats" className="nav-link">Statistiken</Link>
                        <Link href="/admin/documents" className="nav-link">Dokumente</Link>
                        <Link href="/admin/users" className="nav-link">Benutzer</Link>
                        <Link href="/admin/settings" className="nav-link">Einstellungen</Link>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Abmelden</button>
                    </div>
                    <button className={`navbar-toggle${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menü">
                        <span className="navbar-toggle-icon" />
                    </button>
                </div>
                <div className={`navbar-mobile${menuOpen ? " open" : ""}`}>
                    <Link href="/admin" className="nav-link active" onClick={() => setMenuOpen(false)}>📋 Meldungen</Link>
                    <Link href="/admin/stats" className="nav-link" onClick={() => setMenuOpen(false)}>📊 Statistiken</Link>
                    <Link href="/admin/documents" className="nav-link" onClick={() => setMenuOpen(false)}>📄 Dokumente</Link>
                    <Link href="/admin/users" className="nav-link" onClick={() => setMenuOpen(false)}>👤 Benutzer</Link>
                    <Link href="/admin/settings" className="nav-link" onClick={() => setMenuOpen(false)}>⚙️ Einstellungen</Link>
                    <button onClick={handleLogout} className="btn btn-secondary">Abmelden</button>
                </div>
            </nav>

            <main className="container-wide admin-page-main" style={{ padding: "2rem 1.5rem" }}>
                <div className="flex items-center justify-between mb-3" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Alle Meldungen</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>{reports.length} Einträge insgesamt</p>
                    </div>
                    <button onClick={exportCSV} className="btn btn-secondary">📥 CSV exportieren</button>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍 Suchen nach Name, Abteilung, Unfallort…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }}></div></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📋</div><p>Keine Meldungen gefunden.</p></div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Datum</th>
                                    <th>Name</th>
                                    <th>Abteilung</th>
                                    <th>Unfallort</th>
                                    <th>Verletzung</th>
                                    <th>Körperteil</th>
                                    <th>Arzt</th>
                                    <th>Ersthelfer</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r) => (
                                    <tr key={r.id}>
                                        <td style={{ color: "var(--text-muted)" }}>{r.id}</td>
                                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(r.datum)} {r.uhrzeit}</td>
                                        <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{r.name}</td>
                                        <td>{r.abteilung}</td>
                                        <td>{r.unfallort}</td>
                                        <td>{r.verletzungsart}</td>
                                        <td>{r.koerperteil}</td>
                                        <td><span className={`badge ${r.arzt_aufgesucht ? "badge-yes" : "badge-no"}`}>{r.arzt_aufgesucht ? "Ja" : "Nein"}</span></td>
                                        <td>{r.ersthelfer}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button className="btn btn-secondary btn-sm" onClick={() => setEditReport(r)}>✏️</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(r.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Edit Modal */}
            {editReport && (
                <div className="modal-backdrop" onClick={() => setEditReport(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px" }}>
                        <div className="modal-title">
                            ✏️ Meldung #{editReport.id} bearbeiten
                            <button onClick={() => setEditReport(null)} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label>Datum</label><input type="date" value={editReport.datum} onChange={(e) => setEdit("datum", e.target.value)} /></div>
                            <div className="form-group"><label>Uhrzeit</label><input type="time" value={editReport.uhrzeit} onChange={(e) => setEdit("uhrzeit", e.target.value)} /></div>
                            <div className="form-group"><label>Name</label><input type="text" value={editReport.name} onChange={(e) => setEdit("name", e.target.value)} /></div>
                            <div className="form-group"><label>Abteilung</label><select value={editReport.abteilung} onChange={(e) => setEdit("abteilung", e.target.value)}>{ABTEILUNGEN.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                            <div className="form-group full"><label>Unfallort</label><input type="text" value={editReport.unfallort} onChange={(e) => setEdit("unfallort", e.target.value)} /></div>
                            <div className="form-group full"><label>Unfallhergang</label><textarea value={editReport.unfallhergang} onChange={(e) => setEdit("unfallhergang", e.target.value)} rows={3} /></div>
                            <div className="form-group"><label>Verletzungsart</label><select value={editReport.verletzungsart} onChange={(e) => setEdit("verletzungsart", e.target.value)}>{VERLETZUNGSARTEN.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                            <div className="form-group"><label>Körperteil</label><select value={editReport.koerperteil} onChange={(e) => setEdit("koerperteil", e.target.value)}>{KOERPERTEILE.map(k => <option key={k} value={k}>{k}</option>)}</select></div>
                            <div className="form-group"><label>Ersthelfer</label><input type="text" value={editReport.ersthelfer} onChange={(e) => setEdit("ersthelfer", e.target.value)} /></div>
                            <div className="form-group full"><label>Erste-Hilfe-Maßnahmen</label><textarea value={editReport.erste_hilfe} onChange={(e) => setEdit("erste_hilfe", e.target.value)} rows={2} /></div>
                            <div className="form-group full">
                                <div className="checkbox-group" onClick={() => setEdit("arzt_aufgesucht", editReport.arzt_aufgesucht ? 0 : 1)}>
                                    <input type="checkbox" checked={!!editReport.arzt_aufgesucht} onChange={() => { }} />
                                    <label>Arzt aufgesucht</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button onClick={() => setEditReport(null)} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Speichern…</> : "💾 Speichern"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId !== null && (
                <div className="modal-backdrop" onClick={() => setDeleteId(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
                        <div className="modal-title">🗑️ Meldung löschen?</div>
                        <div className="alert alert-error mb-2">Diese Aktion kann nicht rückgängig gemacht werden!</div>
                        <div className="modal-actions">
                            <button onClick={() => setDeleteId(null)} className="btn btn-secondary">Abbrechen</button>
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
