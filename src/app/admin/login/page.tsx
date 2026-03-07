"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/admin");
                router.refresh();
            } else {
                setError(data.error || "Anmeldung fehlgeschlagen");
                setLoading(false);
            }
        } catch {
            setError("Verbindungsfehler. Bitte erneut versuchen.");
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
                </div>
            </nav>

            <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 65px)", padding: "2rem" }}>
                <div style={{ width: "100%", maxWidth: "400px" }}>
                    <div className="page-header" style={{ paddingTop: "0" }}>
                        <h1>Admin-Login</h1>
                        <p>Melden Sie sich an, um den Admin-Bereich aufzurufen.</p>
                    </div>

                    <div className="card">
                        <form onSubmit={handleSubmit}>
                            {error && <div className="alert alert-error mb-2">⚠️ {error}</div>}
                            <div className="form-group mb-2">
                                <label htmlFor="username">Benutzername</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label htmlFor="password">Passwort</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? <><span className="spinner"></span> Anmelden…</> : "🔐 Anmelden"}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-sm text-muted mt-2">
                        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>← Zurück zur Meldungserfassung</Link>
                    </p>
                </div>
            </main>
        </>
    );
}
