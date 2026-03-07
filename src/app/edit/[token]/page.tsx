"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Report } from "@/lib/db";

interface Doc { id: number; name: string; description: string; mimetype: string; size: number; }
function fileIcon(mime: string) {
    if (mime.includes("pdf")) return "📄";
    if (mime.includes("word") || mime.includes("document")) return "📝";
    if (mime.includes("sheet") || mime.includes("excel")) return "📊";
    return "📎";
}

const ABTEILUNGEN = ["Produktion", "Lager", "Verwaltung", "Technik", "Versand", "Qualitätssicherung", "Küche/Kantine", "Reinigung", "Sonstiges"];
const VERLETZUNGSARTEN = ["Schnittwunde", "Schürfwunde", "Prellung", "Stauchung", "Verbrühung/Verbrennung", "Fremdkörper im Auge", "Quetschung", "Zerrung", "Sonstiges"];
const KOERPERTEILE = ["Finger", "Hand", "Handgelenk", "Arm", "Schulter", "Kopf", "Gesicht", "Auge", "Fuß", "Zeh", "Knie", "Bein", "Rücken", "Sonstiges"];

interface Params { token: string; }

export default function EditPage({ params }: { params: Promise<Params> }) {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [form, setForm] = useState<Partial<Report>>({});
    const [docs, setDocs] = useState<Doc[]>([]);

    useEffect(() => {
        params.then((p) => {
            setToken(p.token);
            fetch(`/api/reports/${p.token}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.error) { setError(data.error); } else { setForm(data); }
                    setLoading(false);
                })
                .catch(() => { setError("Meldung konnte nicht geladen werden."); setLoading(false); });
        });
    }, [params]);

    useEffect(() => {
        if (form.arzt_aufgesucht) {
            fetch("/api/documents").then(r => r.json()).then(setDocs).catch(() => { });
        }
    }, [form.arzt_aufgesucht]);

    const set = (field: string, value: string | boolean | number) =>
        setForm((f) => ({ ...f, [field]: value }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setError(""); setSuccess("");
        const res = await fetch(`/api/reports/${token}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, arzt_aufgesucht: form.arzt_aufgesucht ? 1 : 0 }),
        });
        const data = await res.json();
        setSaving(false);
        if (data.success) { setSuccess("Meldung erfolgreich gespeichert!"); } else { setError(data.error || "Fehler beim Speichern"); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const res = await fetch(`/api/reports/${token}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { router.push("/?deleted=1"); } else { setError(data.error || "Fehler beim Löschen"); setDeleting(false); }
    };

    if (loading) return (
        <>
            <nav className="navbar"><div className="container-wide navbar-inner"><Link href="/" className="navbar-brand"><div className="logo-icon">🩹</div><div><div className="brand-text">Verbandbuch</div><div className="brand-sub">Digitale Unfallmeldung</div></div></Link></div></nav>
            <div className="container" style={{ textAlign: "center", padding: "4rem" }}><div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }}></div><p style={{ color: "var(--text-muted)" }}>Meldung wird geladen…</p></div>
        </>
    );

    if (error && !form.id) return (
        <>
            <nav className="navbar"><div className="container-wide navbar-inner"><Link href="/" className="navbar-brand"><div className="logo-icon">🩹</div><div><div className="brand-text">Verbandbuch</div><div className="brand-sub">Digitale Unfallmeldung</div></div></Link></div></nav>
            <div className="container"><div className="page-header"><h1>Meldung nicht gefunden</h1><p>Dieser Link ist ungültig oder die Meldung wurde bereits gelöscht.</p></div><div className="text-center"><Link href="/" className="btn btn-primary">Neue Meldung erfassen</Link></div></div>
        </>
    );

    return (
        <>
            <nav className="navbar">
                <div className="container-wide navbar-inner">
                    <Link href="/" className="navbar-brand">
                        <div className="logo-icon">🩹</div>
                        <div><div className="brand-text">Verbandbuch</div><div className="brand-sub">Digitale Unfallmeldung</div></div>
                    </Link>
                </div>
            </nav>

            <main className="container">
                <div className="page-header">
                    <h1>Meldung bearbeiten</h1>
                    <p>Sie können Ihre Meldung hier bearbeiten oder löschen.</p>
                </div>

                <div className="section">
                    {success && <div className="alert alert-success">✅ {success}</div>}
                    {error && <div className="alert alert-error">⚠️ {error}</div>}

                    <form onSubmit={handleSave}>
                        <div className="card mb-3">
                            <div className="card-title">📋 Grunddaten des Unfalls</div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Datum des Unfalls *</label>
                                    <input type="date" value={form.datum || ""} onChange={(e) => set("datum", e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Uhrzeit *</label>
                                    <input type="time" value={form.uhrzeit || ""} onChange={(e) => set("uhrzeit", e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Name der verletzten Person *</label>
                                    <input type="text" value={form.name || ""} onChange={(e) => set("name", e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Abteilung *</label>
                                    <input type="text" value={form.abteilung || ""} onChange={(e) => set("abteilung", e.target.value)} placeholder="z.B. Produktion, Lager, Verwaltung…" required />
                                </div>
                                <div className="form-group full">
                                    <label>Unfallort *</label>
                                    <input type="text" value={form.unfallort || ""} onChange={(e) => set("unfallort", e.target.value)} required />
                                </div>
                                <div className="form-group full">
                                    <label>Unfallhergang *</label>
                                    <textarea value={form.unfallhergang || ""} onChange={(e) => set("unfallhergang", e.target.value)} rows={4} required />
                                </div>
                            </div>
                        </div>

                        <div className="card mb-3">
                            <div className="card-title">🏥 Art der Verletzung</div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Verletzungsart *</label>
                                    <select value={form.verletzungsart === "" || VERLETZUNGSARTEN.includes(form.verletzungsart ?? "") ? (form.verletzungsart || "") : "Sonstiges"} onChange={(e) => set("verletzungsart", e.target.value)} required>
                                        <option value="">Bitte wählen…</option>
                                        {VERLETZUNGSARTEN.map((v) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                    {(form.verletzungsart === "Sonstiges" || (!VERLETZUNGSARTEN.slice(0, -1).includes(form.verletzungsart ?? "") && !!form.verletzungsart)) && (
                                        <input
                                            type="text"
                                            style={{ marginTop: "0.5rem" }}
                                            placeholder="Bitte beschreiben…"
                                            value={form.verletzungsart === "Sonstiges" ? "" : (form.verletzungsart || "")}
                                            onChange={(e) => set("verletzungsart", e.target.value || "Sonstiges")}
                                            required
                                        />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Betroffenes Körperteil *</label>
                                    <select value={form.koerperteil === "" || KOERPERTEILE.includes(form.koerperteil ?? "") ? (form.koerperteil || "") : "Sonstiges"} onChange={(e) => set("koerperteil", e.target.value)} required>
                                        <option value="">Bitte wählen…</option>
                                        {KOERPERTEILE.map((k) => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                    {(form.koerperteil === "Sonstiges" || (!KOERPERTEILE.slice(0, -1).includes(form.koerperteil ?? "") && !!form.koerperteil)) && (
                                        <input
                                            type="text"
                                            style={{ marginTop: "0.5rem" }}
                                            placeholder="Bitte beschreiben…"
                                            value={form.koerperteil === "Sonstiges" ? "" : (form.koerperteil || "")}
                                            onChange={(e) => set("koerperteil", e.target.value || "Sonstiges")}
                                            required
                                        />
                                    )}
                                </div>
                                <div className="form-group full">
                                    <label>Arztbesuch erforderlich?</label>
                                    <div className="checkbox-group" onClick={() => set("arzt_aufgesucht", form.arzt_aufgesucht ? 0 : 1)}>
                                        <input type="checkbox" checked={!!form.arzt_aufgesucht} onChange={() => { }} />
                                        <label>Ja, ein Arzt wurde aufgesucht bzw. ist erforderlich</label>
                                    </div>
                                    {!!form.arzt_aufgesucht && (
                                        <div className="alert alert-warning" style={{ marginTop: "0.75rem" }}>
                                            🏥 <strong>Arztbesuch erfordert eine offizielle Unfallanzeige bei der BG!</strong><br />
                                            <span style={{ fontSize: "0.9em" }}>Bitte reichen Sie die erforderlichen Formulare über Ihre Personalabteilung ein. Siehe Download-Links unten.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card mb-3">
                            <div className="card-title">⛑️ Erste-Hilfe-Maßnahmen</div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Ersthelfer (Name) *</label>
                                    <input type="text" value={form.ersthelfer || ""} onChange={(e) => set("ersthelfer", e.target.value)} required />
                                </div>
                                <div className="form-group full">
                                    <label>Durchgeführte Maßnahmen *</label>
                                    <textarea value={form.erste_hilfe || ""} onChange={(e) => set("erste_hilfe", e.target.value)} rows={3} required />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-3" style={{ flexWrap: "wrap" }}>
                            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                                {saving ? <><span className="spinner"></span> Speichern…</> : "💾 Änderungen speichern"}
                            </button>
                            <button type="button" className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)} style={{ flex: 1, justifyContent: "center" }}>
                                🗑️ Meldung löschen
                            </button>
                        </div>
                    </form>

                    {/* ── Arztbesuch: Formulare zum Download ─────── */}
                    {!!form.arzt_aufgesucht && (
                        <div className="card mt-2" style={{ border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.07)" }}>
                            <div className="card-title" style={{ color: "var(--warning)" }}>🏥 Pflichtformulare – Arztbesuch</div>
                            <div className="alert alert-warning mb-3">
                                Da ein Arzt aufgesucht wurde, muss eine <strong>Unfallanzeige bei der Berufsgenossenschaft</strong> eingereicht werden (Frist: 3 Werktage).
                            </div>
                            {docs.length > 0 ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                                    {docs.map(d => (
                                        <a key={d.id} href={`/api/documents/${d.id}/download`} download
                                            className="card"
                                            style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "0.75rem 1rem", textDecoration: "none", border: "1px solid var(--border)", cursor: "pointer" }}
                                        >
                                            <span style={{ fontSize: "1.5rem" }}>{fileIcon(d.mimetype)}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>{d.name}</div>
                                                {d.description && <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{d.description}</div>}
                                            </div>
                                            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem" }}>⬇️ Herunterladen</span>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="alert alert-info">ℹ️ Wenden Sie sich an Ihre Personalabteilung für die erforderlichen Formulare.</div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {showDeleteConfirm && (
                <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">
                            ⚠️ Meldung wirklich löschen?
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary btn-sm">✕</button>
                        </div>
                        <div className="alert alert-error mb-2">Diese Aktion kann nicht rückgängig gemacht werden. Die Meldung wird dauerhaft gelöscht.</div>
                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Abbrechen</button>
                            <button onClick={handleDelete} className="btn btn-danger" disabled={deleting}>
                                {deleting ? <><span className="spinner"></span> Löschen…</> : "🗑️ Endgültig löschen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
