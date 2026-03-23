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
    "rgba(19,1,124,0.85)", "rgba(228,0,28,0.75)", "rgba(91,84,222,0.8)",
    "rgba(0,120,200,0.8)", "rgba(245,158,11,0.8)", "rgba(30,140,69,0.8)",
    "rgba(192,57,43,0.8)", "rgba(251,146,60,0.8)", "rgba(99,102,241,0.8)",
];

export default function AdminStatsPage() {
    const router = useRouter();
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", abteilung: "", verletzungsart: "", year: "", month: "" });

    const chartMonthRef = useRef<HTMLCanvasElement>(null);
    const chartAbteilungRef = useRef<HTMLCanvasElement>(null);
    const chartVerletzungRef = useRef<HTMLCanvasElement>(null);
    const chartKoerperteilRef = useRef<HTMLCanvasElement>(null);
    const printAreaRef = useRef<HTMLDivElement>(null);

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

        const gridColor = "rgba(0,0,0,0.06)";
        const tickColor = "#555";
        const defaultOpts = {
            scales: {
                x: { ticks: { color: tickColor }, grid: { color: gridColor } },
                y: { ticks: { color: tickColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true },
            },
            plugins: { legend: { display: false } },
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 400 },
        };

        if (chartMonthRef.current) {
            destroyChart("month");
            chartInstances.current.month = new Chart(chartMonthRef.current, {
                type: "line",
                data: {
                    labels: data.byMonth.map(m => { const [y, mo] = m.month.split("-"); return `${mo}/${y}`; }),
                    datasets: [{
                        label: "Unfälle",
                        data: data.byMonth.map(m => m.count),
                        borderColor: "rgba(19,1,124,1)",
                        backgroundColor: "rgba(19,1,124,0.1)",
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: "rgba(228,0,28,1)",
                        pointRadius: 5,
                    }],
                },
                options: { ...defaultOpts, plugins: { legend: { display: true, labels: { color: tickColor } } } } as never,
            });
        }

        if (chartAbteilungRef.current) {
            destroyChart("abteilung");
            chartInstances.current.abteilung = new Chart(chartAbteilungRef.current, {
                type: "bar",
                data: {
                    labels: data.byAbteilung.map(a => a.abteilung),
                    datasets: [{ label: "Unfälle", data: data.byAbteilung.map(a => a.count), backgroundColor: COLORS, borderRadius: 4 }],
                },
                options: defaultOpts as never,
            });
        }

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

        if (chartKoerperteilRef.current) {
            destroyChart("koerperteil");
            chartInstances.current.koerperteil = new Chart(chartKoerperteilRef.current, {
                type: "bar",
                data: {
                    labels: data.byKoerperteil.map(k => k.koerperteil),
                    datasets: [{ label: "Verletzungen", data: data.byKoerperteil.map(k => k.count), backgroundColor: COLORS.slice(2), borderRadius: 4 }],
                },
                options: {
                    indexAxis: "y" as const,
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        x: { ticks: { color: tickColor, stepSize: 1 }, grid: { color: gridColor }, beginAtZero: true },
                        y: { ticks: { color: tickColor }, grid: { color: gridColor } },
                    },
                    plugins: { legend: { display: false } },
                } as never,
            });
        }

        return () => { Object.keys(chartInstances.current).forEach(destroyChart); };
    }, [data]);

    const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); };
    const setFilter = (field: string, value: string) => setFilters(f => ({ ...f, [field]: value }));

    const arztRate = data && data.total > 0 ? Math.round((data.arztCount / data.total) * 100) : 0;
    const topAbteilung = data?.byAbteilung[0]?.abteilung ?? "–";

    const handlePdfExport = async () => {
        if (!data) return;
        setPdfLoading(true);
        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: html2canvas } = await import("html2canvas");

            const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pageW = 210;
            const pageH = 297;
            const margin = 14;
            const contentW = pageW - margin * 2;
            let y = 0;

            // ── Header Banner ────────────────────────────────────────────
            pdf.setFillColor(19, 1, 124); // HS-Blau
            pdf.rect(0, 0, pageW, 28, "F");

            // Roter Akzent-Streifen
            pdf.setFillColor(228, 0, 28); // HS-Rot
            pdf.rect(0, 28, pageW, 2.5, "F");

            // Titel
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(18);
            pdf.setTextColor(255, 255, 255);
            pdf.text("Verbandbuch – Statistikbericht", margin, 12);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(200, 200, 230);
            pdf.text("Hochschule Anhalt · Digitale Unfallmeldung", margin, 20);

            // Datum rechts
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(200, 200, 230);
            const dateStr = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
            pdf.text(`Erstellt am ${dateStr}`, pageW - margin, 12, { align: "right" });

            // Aktive Filter
            const activeFilters: string[] = [];
            if (filters.year) activeFilters.push(`Jahr: ${filters.year}`);
            if (filters.month) activeFilters.push(`Monat: ${MONATE.find(m => m.value === filters.month)?.label ?? filters.month}`);
            if (filters.dateFrom) activeFilters.push(`Von: ${filters.dateFrom}`);
            if (filters.dateTo) activeFilters.push(`Bis: ${filters.dateTo}`);
            if (filters.abteilung) activeFilters.push(`Abteilung: ${filters.abteilung}`);
            if (filters.verletzungsart) activeFilters.push(`Verletzungsart: ${filters.verletzungsart}`);
            const filterLine = activeFilters.length > 0 ? activeFilters.join(" · ") : "Alle Daten (kein Filter)";
            pdf.text(`Filter: ${filterLine}`, pageW - margin, 20, { align: "right" });

            y = 38;

            // ── KPI Kacheln ───────────────────────────────────────────────
            const kpis = [
                { label: "Unfälle gesamt", value: String(data.total) },
                { label: "Arztbesuche", value: String(data.arztCount) },
                { label: "Arztbesuchsrate", value: `${arztRate} %` },
                { label: "Häufigste Abteilung", value: topAbteilung },
            ];
            const kpiW = (contentW - 6) / 4;
            kpis.forEach((kpi, i) => {
                const kx = margin + i * (kpiW + 2);
                pdf.setFillColor(248, 248, 250);
                pdf.roundedRect(kx, y, kpiW, 20, 2, 2, "F");
                pdf.setDrawColor(19, 1, 124);
                pdf.setLineWidth(0.5);
                pdf.roundedRect(kx, y, kpiW, 20, 2, 2, "S");
                // Top border accent
                pdf.setFillColor(228, 0, 28);
                pdf.rect(kx, y, kpiW, 1.2, "F");

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(kpi.value.length > 8 ? 10 : 16);
                pdf.setTextColor(19, 1, 124);
                pdf.text(kpi.value, kx + kpiW / 2, y + 12, { align: "center" });

                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(7.5);
                pdf.setTextColor(100, 100, 120);
                pdf.text(kpi.label, kx + kpiW / 2, y + 17.5, { align: "center" });
            });
            y += 26;

            // ── Helper: Chart canvas → PDF image ─────────────────────────
            const addChart = async (
                canvas: HTMLCanvasElement | null,
                title: string,
                chartY: number,
                chartW: number,
                chartH: number,
                chartX: number = margin
            ): Promise<number> => {
                if (!canvas) return chartY;
                // Section header
                pdf.setFillColor(19, 1, 124);
                pdf.rect(chartX, chartY, 3, 6, "F");
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(10);
                pdf.setTextColor(19, 1, 124);
                pdf.text(title, chartX + 5, chartY + 5);
                chartY += 9;

                const imgData = canvas.toDataURL("image/png", 1.0);
                const canvasRatio = canvas.height / canvas.width;
                const imgH = Math.min(chartW * canvasRatio, chartH);

                pdf.setFillColor(255, 255, 255);
                pdf.roundedRect(chartX, chartY, chartW, imgH + 4, 2, 2, "F");
                pdf.setDrawColor(220, 220, 230);
                pdf.setLineWidth(0.3);
                pdf.roundedRect(chartX, chartY, chartW, imgH + 4, 2, 2, "S");
                pdf.addImage(imgData, "PNG", chartX + 2, chartY + 2, chartW - 4, imgH);
                return chartY + imgH + 10;
            };

            // ── Chart 1: Verlauf pro Monat (volle Breite) ─────────────────
            y = await addChart(chartMonthRef.current, "Unfälle pro Monat", y, contentW, 65);

            // ── Charts 2 & 3 nebeneinander ────────────────────────────────
            const halfW = (contentW - 4) / 2;

            // Check if new page needed
            if (y + 80 > pageH - 10) {
                pdf.addPage();
                y = 16;
            }

            const yBefore = y;
            const y2 = await addChart(chartAbteilungRef.current, "Unfälle nach Abteilung", yBefore, halfW, 65, margin);
            const y3 = await addChart(chartVerletzungRef.current, "Verletzungsarten", yBefore, halfW, 65, margin + halfW + 4);
            y = Math.max(y2, y3);

            // ── Chart 4: Körperteile (volle Breite) ───────────────────────
            if (y + 70 > pageH - 10) {
                pdf.addPage();
                y = 16;
            }
            y = await addChart(chartKoerperteilRef.current, "Betroffene Körperteile", y, contentW, 65);

            // ── Tabellen (falls genug Platz) ──────────────────────────────
            const addTable = (
                title: string,
                rows: { label: string; count: number }[],
                tableY: number,
                tableX: number = margin,
                tableW: number = contentW
            ): number => {
                if (rows.length === 0) return tableY;
                if (tableY + rows.length * 6 + 16 > pageH - 10) {
                    pdf.addPage();
                    tableY = 16;
                }
                pdf.setFillColor(19, 1, 124);
                pdf.rect(tableX, tableY, 3, 6, "F");
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(10);
                pdf.setTextColor(19, 1, 124);
                pdf.text(title, tableX + 5, tableY + 5);
                tableY += 9;

                // Header row
                pdf.setFillColor(19, 1, 124);
                pdf.rect(tableX, tableY, tableW, 6, "F");
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(8);
                pdf.setTextColor(255, 255, 255);
                pdf.text("Bezeichnung", tableX + 3, tableY + 4.2);
                pdf.text("Anzahl", tableX + tableW - 3, tableY + 4.2, { align: "right" });
                tableY += 6;

                rows.forEach((row, i) => {
                    pdf.setFillColor(i % 2 === 0 ? 250 : 244, i % 2 === 0 ? 250 : 244, i % 2 === 0 ? 252 : 249);
                    pdf.rect(tableX, tableY, tableW, 6, "F");
                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(8);
                    pdf.setTextColor(40, 40, 60);
                    pdf.text(row.label, tableX + 3, tableY + 4.2);
                    pdf.setFont("helvetica", "bold");
                    pdf.setTextColor(19, 1, 124);
                    pdf.text(String(row.count), tableX + tableW - 3, tableY + 4.2, { align: "right" });
                    tableY += 6;
                });

                // Border
                pdf.setDrawColor(200, 200, 220);
                pdf.setLineWidth(0.3);
                pdf.rect(tableX, tableY - rows.length * 6 - 6, tableW, rows.length * 6 + 6, "S");
                return tableY + 6;
            };

            if (y + 20 > pageH - 10) { pdf.addPage(); y = 16; }

            y = addTable("Übersicht nach Abteilung",
                data.byAbteilung.map(a => ({ label: a.abteilung, count: a.count })), y);
            y = addTable("Übersicht nach Verletzungsart",
                data.byVerletzungsart.map(v => ({ label: v.verletzungsart, count: v.count })), y);
            y = addTable("Übersicht nach Körperteil",
                data.byKoerperteil.map(k => ({ label: k.koerperteil, count: k.count })), y);

            // ── Footer auf jeder Seite ────────────────────────────────────
            const pageCount = (pdf as { getNumberOfPages?: () => number }).getNumberOfPages?.() ?? 1;
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFillColor(19, 1, 124);
                pdf.rect(0, pageH - 10, pageW, 10, "F");
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(7.5);
                pdf.setTextColor(190, 190, 220);
                pdf.text("Digitales Verbandbuch – Vertraulich", margin, pageH - 4);
                pdf.text(`Seite ${i} / ${pageCount}`, pageW - margin, pageH - 4, { align: "right" });
            }

            const fileName = `Statistik_Verbandbuch_${new Date().toISOString().slice(0, 10)}.pdf`;
            pdf.save(fileName);
        } catch (err) {
            console.error(err);
        }
        setPdfLoading(false);
    };

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
                        <Link href="/admin/settings" className="nav-link">Einstellungen</Link>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Abmelden</button>
                    </div>
                </div>
            </nav>

            <main className="container-wide" style={{ padding: "2rem 1.5rem" }}>
                <div className="flex items-center justify-between mb-3" style={{ flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Statistiken</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Auswertungen und Trends aus dem Verbandbuch</p>
                    </div>
                    {data && data.total > 0 && (
                        <button
                            id="btn-pdf-export"
                            className="btn btn-primary"
                            onClick={handlePdfExport}
                            disabled={pdfLoading}
                        >
                            {pdfLoading ? <><span className="spinner"></span> PDF wird erstellt…</> : "📄 Als PDF exportieren"}
                        </button>
                    )}
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
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
                    <div style={{ width: "1px", background: "var(--border)", alignSelf: "stretch", margin: "0 0.25rem" }} />
                    <div className="filter-group">
                        <label>Von (Datum)</label>
                        <input type="date" value={filters.dateFrom} onChange={(e) => setFilter("dateFrom", e.target.value)} />
                    </div>
                    <div className="filter-group">
                        <label>Bis (Datum)</label>
                        <input type="date" value={filters.dateTo} onChange={(e) => setFilter("dateTo", e.target.value)} />
                    </div>
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
                    <div ref={printAreaRef}>
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
                    </div>
                )}
            </main>
        </div>
    );
}
