"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ABTEILUNGEN = ["Produktion", "Lager", "Verwaltung", "Technik", "Versand", "Qualitätssicherung", "Küche/Kantine", "Reinigung", "Sonstiges"];
const VERLETZUNGSARTEN = ["Schnittwunde", "Schürfwunde", "Prellung", "Stauchung", "Verbrühung/Verbrennung", "Fremdkörper im Auge", "Quetschung", "Zerrung", "Sonstiges"];
const KOERPERTEILE = ["Finger", "Hand", "Handgelenk", "Arm", "Schulter", "Kopf", "Gesicht", "Auge", "Fuß", "Zeh", "Knie", "Bein", "Rücken", "Sonstiges"];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    datum: new Date().toISOString().split("T")[0],
    uhrzeit: new Date().toTimeString().slice(0, 5),
    name: "",
    abteilung: "",
    unfallort: "",
    unfallhergang: "",
    verletzungsart: "",
    koerperteil: "",
    ersthelfer: "",
    erste_hilfe: "",
    arzt_aufgesucht: false,
  });

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Validation
    const required = ["name", "abteilung", "unfallort", "unfallhergang", "verletzungsart", "koerperteil", "ersthelfer", "erste_hilfe"];
    for (const f of required) {
      if (!form[f as keyof typeof form]) {
        setError("Bitte alle Pflichtfelder ausfüllen.");
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/confirmation?token=${data.token}&arzt=${form.arzt_aufgesucht ? "1" : "0"}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLoading(false);
    }
  };

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
          <div className="navbar-links">
            <Link href="/admin/login" className="nav-link">Admin-Bereich</Link>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="page-header">
          <h1>Unfallmeldung erfassen</h1>
          <p>Bagatellunfall dokumentieren gemäß DGUV Vorschrift 1 §24</p>
        </div>

        <div className="section">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {/* Block 1: Grunddaten */}
            <div className="card mb-3">
              <div className="card-title">📋 Grunddaten des Unfalls</div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="datum">Datum des Unfalls *</label>
                  <input id="datum" type="date" value={form.datum} onChange={(e) => set("datum", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="uhrzeit">Uhrzeit *</label>
                  <input id="uhrzeit" type="time" value={form.uhrzeit} onChange={(e) => set("uhrzeit", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="name">Name der verletzten Person *</label>
                  <input id="name" type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Vor- und Nachname" required />
                </div>
                <div className="form-group">
                  <label htmlFor="abteilung">Abteilung *</label>
                  <input id="abteilung" type="text" value={form.abteilung} onChange={(e) => set("abteilung", e.target.value)} placeholder="z.B. Produktion, Lager, Verwaltung…" required />
                </div>
                <div className="form-group full">
                  <label htmlFor="unfallort">Unfallort *</label>
                  <input id="unfallort" type="text" value={form.unfallort} onChange={(e) => set("unfallort", e.target.value)} placeholder="z.B. Halle 3, Maschine 12" required />
                </div>
                <div className="form-group full">
                  <label htmlFor="unfallhergang">Unfallhergang (Beschreibung) *</label>
                  <textarea id="unfallhergang" value={form.unfallhergang} onChange={(e) => set("unfallhergang", e.target.value)} rows={4} placeholder="Bitte beschreiben Sie, wie der Unfall passiert ist…" required />
                </div>
              </div>
            </div>

            {/* Block 2: Verletzung */}
            <div className="card mb-3">
              <div className="card-title">🏥 Art der Verletzung</div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="verletzungsart">Verletzungsart *</label>
                  <select id="verletzungsart" value={form.verletzungsart === "" || VERLETZUNGSARTEN.includes(form.verletzungsart) ? form.verletzungsart : "Sonstiges"} onChange={(e) => set("verletzungsart", e.target.value)} required>
                    <option value="">Bitte wählen…</option>
                    {VERLETZUNGSARTEN.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {(form.verletzungsart === "Sonstiges" || (!VERLETZUNGSARTEN.slice(0, -1).includes(form.verletzungsart) && form.verletzungsart !== "")) && (
                    <input
                      type="text"
                      style={{ marginTop: "0.5rem" }}
                      placeholder="Bitte beschreiben…"
                      value={form.verletzungsart === "Sonstiges" ? "" : form.verletzungsart}
                      onChange={(e) => set("verletzungsart", e.target.value || "Sonstiges")}
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="koerperteil">Betroffenes Körperteil *</label>
                  <select id="koerperteil" value={form.koerperteil === "" || KOERPERTEILE.includes(form.koerperteil) ? form.koerperteil : "Sonstiges"} onChange={(e) => set("koerperteil", e.target.value)} required>
                    <option value="">Bitte wählen…</option>
                    {KOERPERTEILE.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  {(form.koerperteil === "Sonstiges" || (!KOERPERTEILE.slice(0, -1).includes(form.koerperteil) && form.koerperteil !== "")) && (
                    <input
                      type="text"
                      style={{ marginTop: "0.5rem" }}
                      placeholder="Bitte beschreiben…"
                      value={form.koerperteil === "Sonstiges" ? "" : form.koerperteil}
                      onChange={(e) => set("koerperteil", e.target.value || "Sonstiges")}
                      required
                    />
                  )}
                </div>
                <div className="form-group full">
                  <label>Arztbesuch erforderlich?</label>
                  <div className="checkbox-group" onClick={() => set("arzt_aufgesucht", !form.arzt_aufgesucht)}>
                    <input type="checkbox" id="arzt" checked={form.arzt_aufgesucht} onChange={() => { }} />
                    <label htmlFor="arzt">Ja, ein Arzt wurde aufgesucht bzw. ist erforderlich</label>
                  </div>
                  {form.arzt_aufgesucht && (
                    <div className="alert alert-warning" style={{ marginTop: "0.75rem" }}>
                      🏥 <strong>Wichtig: Arztbesuch erfordert eine offizielle Unfallmeldung!</strong><br />
                      <span style={{ fontSize: "0.9em" }}>
                        Bei einem Arztbesuch muss eine <strong>Unfallanzeige bei der Berufsgenossenschaft</strong> eingereicht werden.
                        Nach dem Absenden dieser Meldung erhalten Sie Download-Links für die erforderlichen Formulare.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Block 3: Erste Hilfe */}
            <div className="card mb-3">
              <div className="card-title">⛑️ Erste-Hilfe-Maßnahmen</div>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="ersthelfer">Ersthelfer (Name) *</label>
                  <input id="ersthelfer" type="text" value={form.ersthelfer} onChange={(e) => set("ersthelfer", e.target.value)} placeholder="Name des Ersthelfers" required />
                </div>
                <div className="form-group full">
                  <label htmlFor="erste_hilfe">Durchgeführte Maßnahmen *</label>
                  <textarea id="erste_hilfe" value={form.erste_hilfe} onChange={(e) => set("erste_hilfe", e.target.value)} rows={3} placeholder="z.B. Wunde gereinigt, Pflaster angelegt, Verband angelegt…" required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? <><span className="spinner"></span> Wird gespeichert…</> : "✅ Meldung einreichen"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
