"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface StatsData {
    total: number;
    arztCount: number;
    byMonth: { month: string; count: number }[];
    byAbteilung: { abteilung: string; count: number }[];
    byVerletzungsart: { verletzungsart: string; count: number }[];
    byKoerperteil: { koerperteil: string; count: number }[];
    abteilungen: string[];
    verletzungsarten: string[];
    jahre: string[];
}

const MONATE = [
    { value: "1", label: "Januar" }, { value: "2", label: "Februar" },
    { value: "3", label: "März" }, { value: "4", label: "April" },
    { value: "5", label: "Mai" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Dezember" },
];


const COLORS = [
    "rgba(59,130,246,0.8)", "rgba(6,182,212,0.8)", "rgba(139,92,246,0.8)",
    "rgba(236,72,153,0.8)", "rgba(245,158,11,0.8)", "rgba(34,197,94,0.8)",
    "rgba(239,68,68,0.8)", "rgba(251,146,60,0.8)", "rgba(99,102,241,0.8)",
];

export default function AdminStatsPage() {
    const router = useRouter();
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", abteilung: "", verletzungsart: "", year: "", month: "" });

    const chartMonthRef = useRef<HTMLCanvasElement>(null);
    const chartAbteilungRef = useRef<HTMLCanvasElement>(null);
    const chartVerletzungRef = useRef<HTMLCanvasElement>(null);
    const chartKoerperteilRef = useRef<HTMLCanvasElement>(null);

    const chartInstances = useRef<Record<string, Chart>>({});

    const destroyChart = (key: string) => {
        if (chartInstances.current[key]) {
            chartInstances.current[key].destroy();
            delete chartInstances.current[key];
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);
        if (filters.abteilung) params.set("abteilung", filters.abteilung);
        if (filters.verletzungsart) params.set("verletzungsart", filters.verletzungsart);
        if (filters.year) params.set("year", filters.year);
        if (filters.month) params.set("month", filters.month);
        const res = await fetch(`/api/admin/stats?${params}`);
        if (res.status === 401) { router.push("/admin/login"); return; }
        const d = await res.json();
        setData(d);
        setLoading(false);
    }, [filters, router]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (!data) return;

        const gridColor = "rgba(255,255,255,0.06)";
        const tickColor = "rgba(148,163,184,0.8)";
        const defaultOpts = {
            scales: {
                x: { ticks: { color: tickColor }, grid: { color: gridColor } },
                y: { ticks: { color: tickColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true },
            },
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: true,
        };

        // Monthly Line Chart
        if (chartMonthRef.current) {
            destroyChart("month");
            chartInstances.current.month = new Chart(chartMonthRef.current, {
                type: "line",
                data: {
                    labels: data.byMonth.map(m => { const [y, mo] = m.month.split("-"); return `${mo}/${y}`; }),
                    datasets: [{
                        label: "Unfälle",
                        data: data.byMonth.map(m => m.count),
                        borderColor: "rgba(59,130,246,1)",
                        backgroundColor: "rgba(59,130,246,0.15)",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: "rgba(59,130,246,1)",
                    }],
                },
                options: { ...defaultOpts, plugins: { legend: { display: true, labels: { color: tickColor } } } } as never,
            });
        }

        // Abteilung Bar Chart
        if (chartAbteilungRef.current) {
            destroyChart("abteilung");
            chartInstances.current.abteilung = new Chart(chartAbteilungRef.current, {
                type: "bar",
                data: {
                    labels: data.byAbteilung.map(a => a.abteilung),
                    datasets: [{ label: "Unfälle", data: data.byAbteilung.map(a => a.count), backgroundColor: COLORS, borderRadius: 6 }],
                },
                options: defaultOpts as never,
            });
        }

        // Verletzungsart Doughnut
        if (chartVerletzungRef.current) {
            destroyChart("verletzung");
            chartInstances.current.verletzung = new Chart(chartVerletzungRef.current, {
                type: "doughnut",
                data: {
                    labels: data.byVerletzungsart.map(v => v.verletzungsart),
                    datasets: [{ data: data.byVerletzungsart.map(v => v.count), backgroundColor: COLORS, borderColor: "transparent", borderWidth: 2 }],
                },
                options: {
                    responsive: true, maintainAspectRatio: true,
                    plugins: { legend: { position: "bottom", labels: { color: tickColor, padding: 12, font: { size: 11 } } } },
                } as never,
            });
        }

        // Koerperteil Bar Chart
        if (chartKoerperteilRef.current) {
            destroyChart("koerperteil");
            chartInstances.current.koerperteil = new Chart(chartKoerperteilRef.current, {
                type: "bar",
                data: {
                    labels: data.byKoerperteil.map(k => k.koerperteil),
                    datasets: [{ label: "Verletzungen", data: data.byKoerperteil.map(k => k.count), backgroundColor: COLORS.slice(2), borderRadius: 6 }],
                },
                options: { ...defaultOpts, indexAxis: "y" as const } as never,
            });
        }

        return () => { Object.keys(chartInstances.current).forEach(destroyChart); };
    }, [data]);

    const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); };
    const setFilter = (field: string, value: string) => setFilters(f => ({ ...f, [field]: value }));

    const arztRate = data && data.total > 0 ? Math.round((data.arztCount / data.total) * 100) : 0;
    const topAbteilung = data?.byAbteilung[0]?.abteilung ?? "–";

    return (
        <div>
            <nav className="navbar">
                <div className="container-wide navbar-inner">
                    <Link href="/" className="navbar-brand">
                        <div className="logo-icon">🩹</div>
                        <div><div className="brand-text">Verbandbuch</div><div className="brand-sub">Admin-Bereich</div></div>
                    </Link>
                    <div className="navbar-links">
                        <Link href="/admin" className="nav-link">Meldungen</Link>
                        <Link href="/admin/stats" className="nav-link active">Statistiken</Link>
                        <Link href="/admin/documents" className="nav-link">Dokumente</Link>
                        <Link href="/admin/users" className="nav-link">Benutzer</Link>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Abmelden</button>
                    </div>
                </div>
            </nav>

            <main className="container-wide" style={{ padding: "2rem 1.5rem" }}>
                <div className="mb-3">
                    <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Statistiken</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Auswertungen und Trends aus dem Verbandbuch</p>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    {/* ── Schnellfilter: Jahr + Monat ── */}
                    <div className="filter-group">
                        <label>Jahr</label>
                        <select value={filters.year} onChange={(e) => setFilter("year", e.target.value)}>
                            <option value="">Alle Jahre</option>
                            {data?.jahre.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Monat</label>
                        <select value={filters.month} onChange={(e) => setFilter("month", e.target.value)}>
                            <option value="">Alle Monate</option>
                            {MONATE.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                    {/* ── Trennlinie ── */}
                    <div style={{ width: "1px", background: "var(--border)", alignSelf: "stretch", margin: "0 0.25rem" }} />
                    {/* ── Datumsbereich ── */}
                    <div className="filter-group">
                        <label>Von (Datum)</label>
                        <input type="date" value={filters.dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Bis (Datum)</label>
                        <input type="date" value={filters.dateTo} onChange={(e) => setFilter("dateTo", e.target.value)} />
                    </div>
                    {/* ── Kategorie-Filter ── */}
                    <div className="filter-group">
                        <label>Abteilung</label>
                        <select value={filters.abteilung} onChange={(e) => setFilter("abteilung", e.target.value)}>
                            <option value="">Alle</option>
                            {data?.abteilungen.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Verletzungsart</label>
                        <select value={filters.verletzungsart} onChange={(e) => setFilter("verletzungsart", e.target.value)}>
                            <option value="">Alle</option>
                            {data?.verletzungsarten.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <div className="filter-group" style={{ flex: "0 0 auto" }}>
                        <label>&nbsp;</label>
                        <button className="btn btn-secondary" onClick={() => setFilters({ dateFrom: "", dateTo: "", abteilung: "", verletzungsart: "", year: "", month: "" })}>
                            ✕ Zurücksetzen
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ width: 40, height: 40, margin: "0 auto 1rem" }}></div><p>Daten werden geladen…</p></div>
                ) : !data || data.total === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📊</div><p>Keine Daten für den gewählten Zeitraum.</p></div>
                ) : (
                    <>
                        {/* KPIs */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{data.total}</div>
                                <div className="stat-label">Unfälle gesamt</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{data.arztCount}</div>
                                <div className="stat-label">Arztbesuche</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{arztRate}<span style={{ fontSize: "1.2rem" }}>%</span></div>
                                <div className="stat-label">Arztbesuchsrate</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value" style={{ fontSize: "1.4rem", paddingTop: "0.4rem" }}>{topAbteilung}</div>
                                <div className="stat-label">Häufigste Abteilung</div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="charts-grid">
                            <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
                                <h3>📈 Unfälle pro Monat</h3>
                                <canvas ref={chartMonthRef}></canvas>
                            </div>
                            <div className="chart-card">
                                <h3>🏢 Unfälle nach Abteilung</h3>
                                <canvas ref={chartAbteilungRef}></canvas>
                            </div>
                            <div className="chart-card">
                                <h3>🩹 Verletzungsarten</h3>
                                <canvas ref={chartVerletzungRef}></canvas>
                            </div>
                            <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
                                <h3>🦵 Betroffene Körperteile</h3>
                                <canvas ref={chartKoerperteilRef}></canvas>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
