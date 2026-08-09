// MODULE: mod01_dashboard/ManagerDashboard.js

function ManagerDashboard({ projects, allProjects, members, costCalculations = [], onEditProject, onAddLog, onViewHistory, onMoveProject, onBookDemo }) {
  const chartRefWorkload = useRef(null);
  const chartRefStage = useRef(null);
  const chartInstanceWorkload = useRef(null);
  const chartInstanceStage = useRef(null);

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Filtered Projects
  const filteredProjects = useMemo(() => {
    return (projects || []).filter(p => {
      const pDate = p.procurementDate || p.createdDate || '';
      if (pDate) {
        if (startDate && pDate < startDate) return false;
        if (endDate && pDate > endDate) return false;
      }
      return true;
    });
  }, [projects, startDate, endDate]);

  const totalProjects = filteredProjects.length;
  const totalBudget = filteredProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const weightedForecast = filteredProjects.reduce((sum, p) => sum + ((Number(p.budget) || 0) * (Number(p.winProbability) || 0) / 100), 0);
  const wonProjects = filteredProjects.filter(p => p.status === 'stage_won' || p.status === 'stage_ordering' || p.status === 'stage_delivery');
  const wonBudget = wonProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const avgWinRate = totalProjects > 0 ? ((filteredProjects.reduce((sum, p) => sum + (Number(p.winProbability) || 0), 0) / totalProjects) || 0).toFixed(0) : '0';

  // Stage 4+ Capital Required for Purchasing Products
  const stage4Metrics = useMemo(() => {
    const stage4PlusIds = ['stage_approved', 'stage_won', 'stage_ordering', 'stage_delivery'];
    const stage4Projects = (filteredProjects || []).filter(p => stage4PlusIds.includes(p.status));
    
    let totalCapital = 0;
    stage4Projects.forEach(proj => {
      const existingCalc = (costCalculations || []).find(c => c.projectId === proj.id || (c.projectName && c.projectName.includes(proj.hospitalName)));
      if (existingCalc && Number(existingCalc.costInVat) > 0) {
        totalCapital += Number(existingCalc.costInVat);
      } else {
        totalCapital += Math.round((proj.budget || 0) * 0.65);
      }
    });

    return {
      totalCapital,
      count: stage4Projects.length,
      projects: stage4Projects
    };
  }, [filteredProjects, costCalculations]);

  const scheduledDemos = filteredProjects.filter(p => p.demoStatus === 'นัดหมายแล้ว' || p.demoStatus === 'กำลังเดโม่');

  useEffect(() => {
    if (chartRefWorkload.current) {
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.destroy();

      const memberNames = (members || []).map(m => m.name);
      const budgetPerMember = (members || []).map(m => filteredProjects.filter(p => p.assignee === m.name).reduce((sum, p) => sum + (Number(p.budget) || 0), 0) / 1000000);
      const countPerMember = (members || []).map(m => filteredProjects.filter(p => p.assignee === m.name).length);

      const ctx = chartRefWorkload.current.getContext('2d');
      chartInstanceWorkload.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: memberNames,
          datasets: [
            {
              label: 'มูลค่ารวม (ล้านบาท)',
              data: budgetPerMember,
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1.5,
              borderRadius: 8,
              yAxisID: 'y'
            },
            {
              label: 'จำนวนโครงการ',
              data: countPerMember,
              type: 'line',
              borderColor: 'rgba(245, 158, 11, 1)',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#94a3b8' } } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' }, title: { display: true, text: 'ล้านบาท', color: '#94a3b8' } },
            y1: { position: 'right', ticks: { color: '#f59e0b', stepSize: 1 }, grid: { drawOnChartArea: false }, title: { display: true, text: 'จำนวนโครงการ', color: '#f59e0b' } }
          }
        }
      });
    }

    if (chartRefStage.current) {
      if (chartInstanceStage.current) chartInstanceStage.current.destroy();

      const stageLabels = window.STAGES.map(s => s.name);
      const stageCounts = window.STAGES.map(s => filteredProjects.filter(p => p.status === s.id).length);
      const stageColors = ['#94a3b8', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];

      const ctx = chartRefStage.current.getContext('2d');
      chartInstanceStage.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: stageLabels,
          datasets: [{
            data: stageCounts,
            backgroundColor: stageColors,
            borderColor: '#0f172a',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 } } }
          }
        }
      });
    }

    return () => {
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.destroy();
      if (chartInstanceStage.current) chartInstanceStage.current.destroy();
    };
  }, [filteredProjects, members]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Executive Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>📊 ภาพรวมผลงานทีมขาย (Manager Sales Dashboard)</span>
          </h2>
          <p className="text-xs text-slate-400">ภาพรวมโครงการประมูล, ยอดขายพยากรณ์, ทุนหมุนเวียนซื้อสินค้า และภาระงานทีม</p>
        </div>

        {/* High-Contrast Vibrant Yellow Date Range Picker Control */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>เลือกช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>🎯 โครงการทั้งหมด</span>
            <span>📂</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalProjects}</div>
          <div className="text-[11px] text-slate-400">มูลค่ารวม {formatCurrency(totalBudget)}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-1">
          <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
            <span>💸 ทุนสั่งของ Stage 4+</span>
            <span>🛒</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {formatCurrency(stage4Metrics.totalCapital)}
          </div>
          <div className="text-[11px] text-amber-200/80 font-medium">
            {stage4Metrics.count} โครงการต้องการทุนสั่งของ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-1">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
            <span>🎉 ชนะประมูลแล้ว</span>
            <span>🏆</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{formatCurrency(wonBudget)}</div>
          <div className="text-[11px] text-emerald-300/80 font-medium">{wonProjects.length} โครงการเซ็นสัญญา</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>📈 คาดการณ์ Weighted</span>
            <span>🔮</span>
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">{formatCurrency(weightedForecast)}</div>
          <div className="text-[11px] text-slate-400">ตาม % โอกาสชนะประมูล</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>🩺 เดโม่เครื่องมือ</span>
            <span>🏥</span>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">{scheduledDemos.length}</div>
          <div className="text-[11px] text-slate-400">นัดหมายเดโม่โรงพยาบาล</div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="font-extrabold text-white text-sm">📊 ภาระงานและมูลค่าโครงการแยกรายบุคคล (Workload per Rep)</h3>
          <div className="h-64 relative">
            <canvas ref={chartRefWorkload}></canvas>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="font-extrabold text-white text-sm">🍩 สัดส่วนโครงการตามขั้นตอน Stage (Pipeline Funnel)</h3>
          <div className="h-64 relative">
            <canvas ref={chartRefStage}></canvas>
          </div>
        </div>
      </div>

      {/* Scheduled Demos Table */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>🧪 คิวสาธิตเครื่อง (Demo Schedule) & สินค้าที่ต้องเข้าทดสอบ</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                {scheduledDemos.length} รายการ
              </span>
            </h3>
            <p className="text-xs text-slate-400">โครงการที่มีนัดหมายเดโม่เครื่องกับโรงพยาบาล</p>
          </div>
        </div>

        {scheduledDemos.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            ไม่มีโครงการที่อยู่ในช่วงนัดสาธิตเครื่องในขณะนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">โรงพยาบาล / โครงการ</th>
                  <th className="p-3">สินค้าที่เดโม่</th>
                  <th className="p-3">เซลส์ผู้รับผิดชอบ</th>
                  <th className="p-3">ช่วงวันที่นัดสาธิต</th>
                  <th className="p-3 text-right">งบประมาณ</th>
                  <th className="p-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scheduledDemos.map(p => {
                  let demoDaysStr = '';
                  if (p.demoStartDate && p.demoEndDate) {
                    const start = new Date(p.demoStartDate);
                    const end = new Date(p.demoEndDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    demoDaysStr = ` (${diffDays} วัน)`;
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{p.hospitalName}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{p.title}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-lg text-[10.5px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                          📦 {p.productName || 'ไม่ระบุรุ่น'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-emerald-300">{p.assignee}</td>
                      <td className="p-3 text-amber-300 font-mono">
                        {p.demoStartDate ? `${p.demoStartDate} ถึง ${p.demoEndDate || 'N/A'}${demoDaysStr}` : 'ยังไม่ระบุ'}
                      </td>
                      <td className="p-3 text-right font-semibold text-emerald-400">
                        {formatCurrency(p.budget)}
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => onViewHistory(p)}
                          className="px-2 py-1 bg-indigo-900/50 hover:bg-indigo-800/70 text-indigo-200 text-xs rounded-lg border border-indigo-700/60 font-medium"
                          title="ดูประวัติความเคลื่อนไหวย้อนหลัง"
                        >
                          📜 ประวัติ ({p.weeklyLogs ? p.weeklyLogs.length : 0})
                        </button>
                        <button
                          onClick={() => onBookDemo(p)}
                          className="px-2 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs rounded-lg border border-purple-700/50"
                        >
                          🧪 จองคิว
                        </button>
                        <button
                          onClick={() => onEditProject(p)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                        >
                          ✏️ แก้ไข
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
