import { useRef, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import type { Stats, MemberFilter, ChartMode, PieMode } from "../../types";
import styles from "../../pages/AdminDashboard.module.css";

interface StatsViewProps {
  statsData: Stats | null;
  pieStatsData: Stats | null;
  loadingStats: boolean;
  loadingPieStats: boolean;
  memberFilter: MemberFilter;
  chartMode: ChartMode;
  pieMode: PieMode;
  activeBar: { id: string; name: string } | null;
  onMemberFilterChange: (f: MemberFilter) => void;
  onChartModeChange: (m: ChartMode) => void;
  onPieModeChange: (m: PieMode) => void;
  onBarClick: (entry: Record<string, unknown>) => void;
  onClearBarFilter: () => void;
}

const memberLabels: Record<MemberFilter, string> = {
  ALL: "Todos", SIM: "Membro IBB", GR: "Freq. GR", NAO: "Não membro",
};

export function StatsView({
  statsData, pieStatsData, loadingStats, loadingPieStats,
  memberFilter, chartMode, pieMode, activeBar,
  onMemberFilterChange, onChartModeChange, onPieModeChange,
  onBarClick, onClearBarFilter,
}: StatsViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, mouseDownX: 0, dragged: false });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    const d = dragRef.current;
    d.isDown = true;
    d.dragged = false;
    d.mouseDownX = e.pageX;
    d.startX = e.pageX - scrollRef.current.offsetLeft;
    d.scrollLeft = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    dragRef.current.isDown = false;
    dragRef.current.dragged = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    dragRef.current.isDown = false;
    setTimeout(() => {
      dragRef.current.dragged = false;
      setIsDragging(false);
    }, 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const d = dragRef.current;
    if (!d.isDown || !scrollRef.current) return;
    const delta = Math.abs(e.pageX - d.mouseDownX);
    if (!d.dragged && delta > 8) {
      d.dragged = true;
      setIsDragging(true);
    }
    if (!d.dragged) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - d.startX) * 2;
    scrollRef.current.scrollLeft = d.scrollLeft - walk;
  };

  function buildPieData(src: Stats, mode: "gender" | "membership" | "payment") {
    if (mode === "gender") return [
      { name: "Masculino", value: src.genderCount.MASCULINO, color: "#3b82f6" },
      { name: "Feminino", value: src.genderCount.FEMININO, color: "#c084fc" },
    ];
    if (mode === "membership") return [
      { name: "Membro IBB", value: src.memberCount.SIM, color: "#0aad9f" },
      { name: "Freq. GR", value: src.memberCount.GR, color: "#3b82f6" },
      { name: "Não membro", value: src.memberCount.NAO, color: "#f59e0b" },
    ];
    return [
      { name: "Pago", value: src.paymentCount.PAGO, color: "#10b981" },
      { name: "Pendente", value: src.paymentCount.PENDENTE, color: "#f59e0b" },
      { name: "Cancelado", value: src.paymentCount.CANCELADO, color: "#ef4444" },
    ];
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Estatísticas</h2>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          🖨️ Imprimir Gráficos
        </button>
      </div>

      <div className={styles.memberFilterRow}>
        {(["ALL", "SIM", "GR", "NAO"] as MemberFilter[]).map((f) => (
          <button
            key={f}
            className={`${styles.filterPill} ${memberFilter === f ? styles.filterPillActive : ""}`}
            onClick={() => onMemberFilterChange(f)}
          >
            {memberLabels[f]}
          </button>
        ))}
      </div>

      {loadingStats && <p className={styles.loading}>Carregando estatísticas...</p>}

      {statsData && (
        <>
          {/* Bar chart */}
          <div className={`${styles.chartSection} ${styles.noPrint}`}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTabs}>
                <button
                  className={`${styles.chartTab} ${chartMode === "modalities" ? styles.chartTabActive : ""}`}
                  onClick={() => onChartModeChange("modalities")}
                >
                  Por modalidade
                </button>
                <button
                  className={`${styles.chartTab} ${chartMode === "ageGroups" ? styles.chartTabActive : ""}`}
                  onClick={() => onChartModeChange("ageGroups")}
                >
                  Faixas etárias
                </button>
              </div>
            </div>

            {chartMode === "modalities" && (() => {
              const sortedData = [...statsData.modalityStats].sort((a, b) => b.count - a.count);
              return (
                <div
                  className={styles.chartScrollWrapper}
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeave}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove}
                  style={{ cursor: isDragging ? "grabbing" : "grab" }}
                >
                  <div style={{ width: "100%", minWidth: Math.max(sortedData.length * 120, 1400) }}>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={sortedData} margin={{ top: 8, right: 24, bottom: 120, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "rgba(200,230,225,0.6)", fontSize: 11 }}
                          axisLine={false} tickLine={false}
                          interval={0} angle={-45} textAnchor="end"
                        />
                        <YAxis allowDecimals={false} tick={{ fill: "rgba(200,230,225,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#0f2133", border: "1px solid rgba(10,157,143,0.3)", borderRadius: 8, color: "#e8f4f3" }}
                          itemStyle={{ color: "#e8f4f3", fontWeight: "bold" }}
                          cursor={{ fill: "rgba(10,157,143,0.08)" }}
                        />
                        <Bar
                          dataKey="count"
                          radius={[4, 4, 0, 0]}
                          name="Inscritos"
                          style={{ cursor: "pointer" }}
                          onClick={(barData) => {
                            if (!dragRef.current.dragged) {
                              onBarClick(barData.payload as Record<string, unknown>);
                            }
                          }}
                        >
                          {sortedData.map((entry) => (
                            <Cell
                              key={entry.id}
                              fill={activeBar?.id === entry.id ? "#14d6c5" : "#0aad9f"}
                              opacity={activeBar && activeBar.id !== entry.id ? 0.4 : 1}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })()}

            {chartMode === "ageGroups" && (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={Object.entries(statsData.ageGroups).map(([label, count]) => ({ label: `${label} anos`, count }))}
                  margin={{ top: 8, right: 24, bottom: 8, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="label" tick={{ fill: "rgba(200,230,225,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "rgba(200,230,225,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f2133", border: "1px solid rgba(10,157,143,0.3)", borderRadius: 8, color: "#e8f4f3" }}
                    itemStyle={{ color: "#e8f4f3", fontWeight: "bold" }}
                    cursor={{ fill: "rgba(10,157,143,0.08)" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Inscritos" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Interactive pie charts */}
          {(() => {
            const src = pieStatsData ?? statsData;
            const pieData = buildPieData(src, pieMode);
            const pieTotal = pieData.reduce((acc, d) => acc + d.value, 0);
            return (
              <div className={`${styles.chartSection} ${styles.noPrint}`}>
                <div className={styles.chartHeader}>
                  <div className={styles.chartTabs}>
                    {(["gender", "membership", "payment"] as const).map((mode) => {
                      const label = mode === "gender" ? "Gênero" : mode === "membership" ? "Vínculo" : "Pagamento";
                      return (
                        <button
                          key={mode}
                          className={`${styles.chartTab} ${pieMode === mode ? styles.chartTabActive : ""}`}
                          onClick={() => onPieModeChange(mode)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {activeBar && (
                    <button className={styles.activeBarBadge} onClick={onClearBarFilter}>
                      {activeBar.name} ×
                    </button>
                  )}
                </div>
                <div className={styles.pieRow} style={loadingPieStats ? { opacity: 0.45, pointerEvents: "none", transition: "opacity 0.2s" } : { transition: "opacity 0.2s" }}>
                  <div className={styles.pieChartWrap}>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: "none" }}>
                          <tspan x="50%" dy="-0.4em" fill="#e8f4f3" fontSize="30" fontWeight="700">{pieTotal}</tspan>
                          <tspan x="50%" dy="1.5em" fill="rgba(200,230,225,0.45)" fontSize="11">
                            {pieTotal === 1 ? "inscrito" : "inscritos"}
                          </tspan>
                        </text>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={72} outerRadius={108} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip
                          formatter={(value) => {
                            const v = typeof value === "number" ? value : 0;
                            return [`${v} (${pieTotal > 0 ? Math.round((v / pieTotal) * 100) : 0}%)`, ""];
                          }}
                          contentStyle={{ background: "#0f2133", border: "1px solid rgba(10,157,143,0.3)", borderRadius: 8, color: "#e8f4f3" }}
                          itemStyle={{ color: "#e8f4f3", fontWeight: "bold" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.pieLegend}>
                    {pieData.map((entry) => (
                      <div key={entry.name} className={styles.pieLegendItem}>
                        <span className={styles.pieLegendDot} style={{ background: entry.color }} />
                        <span className={styles.pieLegendName}>{entry.name}</span>
                        <span className={styles.pieLegendVal}>
                          {entry.value}
                          <span className={styles.pieLegendPct}>
                            {" "}({pieTotal > 0 ? Math.round((entry.value / pieTotal) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Print-only pies */}
          <div className={`${styles.chartSection} ${styles.printOnlyPies}`}>
            <h3 className={styles.printPiesTitle}>
              {activeBar ? `Modalidade: ${activeBar.name}` : "Geral"}
            </h3>
            <div className={styles.printPiesGrid}>
              {(["gender", "membership", "payment"] as const).map((mode) => {
                const src = pieStatsData ?? statsData;
                const pieData = buildPieData(src, mode);
                const pieTotal = pieData.reduce((acc, d) => acc + d.value, 0);
                const title = mode === "gender" ? "Gênero" : mode === "membership" ? "Vínculo" : "Pagamento";
                return (
                  <div className={styles.printPieItem} key={mode}>
                    <h4 style={{ textAlign: "center", marginBottom: "16px", color: "black" }}>{title}</h4>
                    <div className={styles.pieRow}>
                      <div className={styles.pieChartWrap} style={{ minWidth: 200, width: 200 }}>
                        <PieChart width={200} height={200}>
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: "none" }}>
                            <tspan x="50%" dy="-0.4em" fill="black" fontSize="24" fontWeight="700">{pieTotal}</tspan>
                            <tspan x="50%" dy="1.5em" fill="black" fontSize="11">{pieTotal === 1 ? "inscrito" : "inscritos"}</tspan>
                          </text>
                          <Pie isAnimationActive={false} data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </div>
                      <div className={styles.pieLegend}>
                        {pieData.map((entry) => (
                          <div key={entry.name} className={styles.pieLegendItem}>
                            <span className={styles.pieLegendDot} style={{ background: entry.color }} />
                            <span className={styles.pieLegendName}>{entry.name}</span>
                            <span className={styles.pieLegendVal}>
                              {entry.value}
                              <span className={styles.pieLegendPct}>
                                {" "}({pieTotal > 0 ? Math.round((entry.value / pieTotal) * 100) : 0}%)
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
