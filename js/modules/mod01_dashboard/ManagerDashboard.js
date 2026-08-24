// MODULE: mod01_dashboard/ManagerDashboard.js
// Multi-Role Executive & Operational Dashboard (Classic, CEO, CFO, Manager Views)

function ManagerDashboard({ 
  projects = [], 
  allProjects = [], 
  members = [], 
  products = [],
  demoBookings = [],
  purchaseOrders = [],
  shipments = [],
  repairTickets = [],
  soldProducts = [],
  fdaRegistrations = [],
  costCalculations = [],
  currentUser = null,
  initialTab = 'classic',
  onEditProject = () => {}, 
  onAddLog = () => {}, 
  onViewHistory = () => {}, 
  onMoveProject = () => {}, 
  onBookDemo = () => {},
  onOpenReport = () => {}
}) {
  // Chart references for Classic View
  const chartRefWorkload = useRef(null);
  const chartRefStage = useRef(null);
  const chartInstanceWorkload = useRef(null);
  const chartInstanceStage = useRef(null);

  // Determine default tab based on user role or initialTab prop
  const defaultTab = useMemo(() => {
    if (initialTab) return initialTab;
    if (!currentUser) return 'classic';
    const role = String(currentUser.role).toUpperCase();
    if (role === 'ACCOUNTANT' || role === 'FINANCE') return 'cfo';
    if (role === 'SALES_MANAGER' || role === 'OPERATIONS') return 'manager';
    return 'classic';
  }, [currentUser, initialTab]);

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync if initialTab prop changes from Header view switcher
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

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

  // --- CORE METRICS CALCULATIONS ---
  const totalProjects = filteredProjects.length;
  const totalBudget = filteredProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const weightedForecast = filteredProjects.reduce((sum, p) => sum + ((Number(p.budget) || 0) * (Number(p.winProbability || (p.status.includes('won') ? 100 : 30)) || 0) / 100), 0);
  const wonProjects = filteredProjects.filter(p => ['stage_won', 'stage_ordering', 'stage_delivery', 'stage_complete'].includes(p.status));
  const wonBudget = wonProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const targetYearBudget = 60000000; // Annual Target 60M
  const targetAttainment = targetYearBudget > 0 ? (wonBudget / targetYearBudget) * 100 : 0;

  // Margin Calculations
  const calculatedCostSheets = useMemo(() => {
    return filteredProjects.map(p => {
      const calc = (costCalculations || []).find(c => c.projectId === p.id || (c.projectName && p.hospitalName && c.projectName.includes(p.hospitalName)));
      if (calc) {
        const computed = computeCostSheet(calc);
        return { proj: p, calc, computed, hasCalc: true };
      }
      const defaultCalc = {
        sellingPriceInVat: p.budget || 0,
        costInVat: Math.round((p.budget || 0) * 0.70),
        dfType: 'amount',
        dfValue: p.dfAmount ? Number(String(p.dfAmount).replace(/[^0-9.]/g, '')) || 0 : 0,
        salesCommPercent: 2.0,
        interestPercent: 7.0,
        taxPercent: 20.0,
        retentionPercent: 5.0
      };
      const computed = computeCostSheet(defaultCalc);
      return { proj: p, calc: defaultCalc, computed, hasCalc: false };
    });
  }, [filteredProjects, costCalculations]);

  const totalNetProfit = calculatedCostSheets.reduce((sum, item) => sum + item.computed.netProfit, 0);
  const avgMarginPercent = totalBudget > 0 ? (totalNetProfit / (totalBudget / 1.07)) * 100 : 0;

  // High-Value Deals at Risk (Budget >= 4M & stalled or in e-Bidding/Prospect)
  const highValueRisks = useMemo(() => {
    return filteredProjects.filter(p => (Number(p.budget) || 0) >= 4000000 && p.status !== 'stage_complete' && p.status !== 'stage_won')
      .slice(0, 4);
  }, [filteredProjects]);

  // Stage 4+ Capital Required
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
    return { totalCapital, count: stage4Projects.length, projects: stage4Projects };
  }, [filteredProjects, costCalculations]);

  // Demo Metrics
  const scheduledDemos = demoBookings.filter(b => b.status === 'อนุมัติคิว' || b.status === 'กำลังเดโม่' || b.status === 'นัดหมายแล้ว');
  const today = new Date();
  today.setHours(0,0,0,0);

  // Warranty & MA Alert
  const warrantyAlerts = useMemo(() => {
    return (soldProducts || []).map(p => {
      let days = 999;
      if (p.warrantyExpiry) {
        const exp = new Date(p.warrantyExpiry);
        exp.setHours(0,0,0,0);
        days = Math.ceil((exp - today) / 86400000);
      }
      return { ...p, daysLeft: days };
    }).filter(p => p.daysLeft <= 60).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [soldProducts]);

  // --- CHART.JS RENDERING FOR CLASSIC OVERVIEW ---
  useEffect(() => {
    if (activeTab !== 'classic') return;

    if (chartRefWorkload.current && typeof Chart !== 'undefined') {
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.destroy();

      const memberNames = (members || []).map(m => m.name);
      const budgetPerMember = (members || []).map(m => filteredProjects.filter(p => (p.salesPerson === m.name || p.assignee === m.name)).reduce((sum, p) => sum + (Number(p.budget) || 0), 0) / 1000000);
      const countPerMember = (members || []).map(m => filteredProjects.filter(p => (p.salesPerson === m.name || p.assignee === m.name)).length);

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

    if (chartRefStage.current && typeof Chart !== 'undefined') {
      if (chartInstanceStage.current) chartInstanceStage.current.destroy();

      const stages = window.STAGES || [];
      const stageLabels = stages.map(s => s.title || s.name);
      const stageCounts = stages.map(s => filteredProjects.filter(p => p.status === s.id).length);
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

    const handleResize = () => {
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.resize();
      if (chartInstanceStage.current) chartInstanceStage.current.resize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.destroy();
      if (chartInstanceStage.current) chartInstanceStage.current.destroy();
    };
  }, [activeTab, filteredProjects, members]);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      
      {/* 1. Header & 4-Tab Role Switcher Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AERON ENTERPRISE DASHBOARD
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-time Analytics</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>
              {activeTab === 'classic' ? '📊 ภาพรวมองค์กรดั้งเดิม (Classic Overview)' :
               activeTab === 'ceo' ? '👑 แดชบอร์ดภาพรวมยุทธศาสตร์ (CEO View)' : 
               activeTab === 'cfo' ? '💰 แดชบอร์ดสภาพคล่อง & ต้นทุน (CFO View)' : 
               '🎯 แดชบอร์ดปฏิบัติการ & ทีมขาย (Manager View)'}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === 'classic' ? 'กราฟวิเคราะห์ภาระงานทีมขาย, สัดส่วนสถานะโครงการ และตารางคิวสาธิตเครื่อง' :
             activeTab === 'ceo' ? 'ติดตามยอดขายเทียบเป้า ฿60M, สุขภาพ Pipeline, กำไรสุทธิ และดีลเสี่ยงสูง' : 
             activeTab === 'cfo' ? 'ควบคุมเงินสดสำรอง, ทุนสั่งของ Stage 4+, ภาระหนี้ PO และ Margin กำไร' : 
             'ควบคุมการหมุนเวียนเครื่อง Demo, ติดตามการนำเข้าชิปปิ้ง, งานซ่อม และเตือนต่อประกัน MA'}
          </p>
        </div>

        {/* Controls: 4 Tabs Switcher & Date Range */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
          
          {/* 4 Role Tabs Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('classic')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'classic'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>ภาพรวมดั้งเดิม</span>
            </button>

            <button
              onClick={() => setActiveTab('ceo')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ceo'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👑</span>
              <span>มุมมอง CEO</span>
            </button>

            <button
              onClick={() => setActiveTab('cfo')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'cfo'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💰</span>
              <span>มุมมอง CFO</span>
            </button>

            <button
              onClick={() => setActiveTab('manager')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'manager'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎯</span>
              <span>มุมมอง Manager</span>
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 px-3 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold">📅 วันที่:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] rounded-lg px-2 py-1 outline-none"
            />
            <span className="text-slate-600">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] rounded-lg px-2 py-1 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📊 TAB 0: CLASSIC ALL-IN-ONE OVERVIEW (ดั้งเดิมพร้อมกราฟคู่) */}
      {/* ========================================================= */}
      {activeTab === 'classic' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 5 Classic KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>🎯 โครงการทั้งหมด</span>
                <span>📂</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{totalProjects}</div>
              <div className="text-[11px] text-slate-400 truncate">มูลค่ารวม {formatCurrency(totalBudget)}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-1">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>💸 ทุนสั่งของ Stage 4+</span>
                <span>🛒</span>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono truncate">
                {formatCurrency(stage4Metrics.totalCapital)}
              </div>
              <div className="text-[11px] text-amber-200/80 font-medium truncate">
                {stage4Metrics.count} โครงการต้องการทุนสั่งของ
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-1">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>🎉 ชนะประมูลแล้ว</span>
                <span>🏆</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono truncate">{formatCurrency(wonBudget)}</div>
              <div className="text-[11px] text-emerald-300/80 font-medium truncate">{wonProjects.length} โครงการเซ็นสัญญา</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>📈 คาดการณ์ Weighted</span>
                <span>🔮</span>
              </div>
              <div className="text-2xl font-black text-indigo-300 font-mono truncate">{formatCurrency(weightedForecast)}</div>
              <div className="text-[11px] text-slate-400 truncate">ตาม % โอกาสชนะประมูล</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>🩺 เดโม่เครื่องมือ</span>
                <span>🏥</span>
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono">{scheduledDemos.length}</div>
              <div className="text-[11px] text-slate-400 truncate">นัดหมายเดโม่โรงพยาบาล</div>
            </div>

          </div>

          {/* Dual Charts Grid (Workload per Rep + Pipeline Doughnut) */}
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
                      } else if (p.startDate && p.endDate) {
                        const start = new Date(p.startDate);
                        const end = new Date(p.endDate);
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        demoDaysStr = ` (${diffDays} วัน)`;
                      }

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-slate-100">{p.hospitalName}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{p.title || p.productName}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-lg text-[10.5px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                              📦 {p.productName || 'ไม่ระบุรุ่น'}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-emerald-300">{p.salesPerson || p.assignee}</td>
                          <td className="p-3 text-amber-300 font-mono">
                            {(p.demoStartDate || p.startDate) ? `${p.demoStartDate || p.startDate} ถึง ${p.demoEndDate || p.endDate || 'N/A'}${demoDaysStr}` : 'ยังไม่ระบุ'}
                          </td>
                          <td className="p-3 text-right font-semibold text-emerald-400">
                            {formatCurrency(p.budget || p.projectValue)}
                          </td>
                          <td className="p-3 text-center space-x-1">
                            <button
                              onClick={() => onViewHistory(p)}
                              className="px-2 py-1 bg-indigo-900/50 hover:bg-indigo-800/70 text-indigo-200 text-xs rounded-lg border border-indigo-700/60 font-medium"
                              title="ดูประวัติความเคลื่อนไหวย้อนหลัง"
                            >
                              📜 ประวัติ
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
      )}

      {/* ========================================================= */}
      {/* 👑 TAB 1: CEO STRATEGIC DASHBOARD                         */}
      {/* ========================================================= */}
      {activeTab === 'ceo' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 CEO Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Revenue vs Target */}
            <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>🎯 ยอดขายชนะจริง vs เป้าหมายปี</span>
                <span>🏆</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{formatCurrency(wonBudget)}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>เป้า ฿60.0M</span>
                  <span className="text-emerald-400 font-bold">{targetAttainment.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, targetAttainment)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: Net Profit & Margin */}
            <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between text-indigo-300 text-xs font-bold">
                <span>📈 กำไรสุทธิรวม (Net Profit)</span>
                <span>💰</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">{formatCurrency(totalNetProfit)}</div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>อัตรากำไรสุทธิเฉลี่ย</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold font-mono">{avgMarginPercent.toFixed(1)}%</span>
              </div>
            </div>

            {/* Card 3: Weighted Forecast */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>🔮 มูลค่าคาดการณ์ 90 วัน</span>
                <span>📊</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">{formatCurrency(weightedForecast)}</div>
              <div className="text-[11px] text-slate-400">
                คำนวณถ่วงน้ำหนักจาก {totalProjects} โครงการในมือ
              </div>
            </div>

            {/* Card 4: High Value Deals at Risk */}
            <div className="glass-card p-5 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-2">
              <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
                <span>🚨 ดีลเสี่ยงสูง (เกิน ฿4M)</span>
                <span>⚠️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">{highValueRisks.length} <span className="text-xs font-normal text-slate-400">โครงการ</span></div>
              <div className="text-[11px] text-rose-300/80 font-medium truncate">
                มูลค่ารวม {formatCurrency(highValueRisks.reduce((s, r) => s + (Number(r.budget) || 0), 0))}
              </div>
            </div>

          </div>

          {/* Middle Section: Sales Funnel & High Value Risk Watchlist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Sales Pipeline Funnel Breakdown */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>📊 กระบวนการขาย (Sales Pipeline Funnel)</span>
                </h3>
                <button
                  onClick={() => onOpenReport('sales_pipeline_funnel')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <span>รายงานเชิงลึก</span> <span>➔</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(window.STAGES || []).map(stage => {
                  const stageProjects = filteredProjects.filter(p => p.status === stage.id);
                  const stageValue = stageProjects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
                  const percentOfTotal = totalBudget > 0 ? (stageValue / totalBudget) * 100 : 0;

                  return (
                    <div key={stage.id} className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{stage.title || stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{stageProjects.length} งาน</span>
                          <span className="font-mono font-bold text-emerald-400">{formatCurrency(stageValue)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentOfTotal}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* High-Value Deals Watchlist */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🚨 ดีลใหญ่ที่ต้องจับตาเป็นพิเศษ (High-Value Watchlist)</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  งบประมาณ ฿4.0M ขึ้นไป
                </span>
              </div>

              <div className="space-y-3">
                {highValueRisks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    🎉 ไม่มีดีลเสี่ยงสูงที่ค้างอยู่ในขณะนี้
                  </div>
                ) : (
                  highValueRisks.map(p => (
                    <div key={p.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-xs sm:text-sm">{p.hospitalName}</div>
                        <div className="text-[11px] text-slate-400">{p.title}</div>
                        <div className="flex items-center gap-2 text-[10.5px]">
                          <span className="text-emerald-400 font-bold font-mono">งบ {formatCurrency(p.budget)}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300">เซลส์: {p.salesPerson || p.assignee}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onEditProject(p)}
                        className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        ดูโครงการ
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom Section: Top Hospitals & Sales Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Top Hospitals */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-white text-sm">🏥 สรุปยอดขายรายโรงพยาบาล (Hospital Share)</h3>
                <button onClick={() => onOpenReport('hospital_penetration')} className="text-xs text-indigo-400 font-bold">ดูทั้งหมด ➔</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {filteredProjects.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="font-semibold text-slate-200">{p.hospitalName}</div>
                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(p.budget)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Leaderboard */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-white text-sm">🏆 อันดับผลงานทีมขาย (Sales Leaderboard)</h3>
                <button onClick={() => onOpenReport('sales_rep_performance')} className="text-xs text-indigo-400 font-bold">ดูทั้งหมด ➔</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {(members || []).map((m, idx) => {
                  const myProjects = filteredProjects.filter(p => p.salesPerson === m.name || p.assignee === m.name);
                  const myWon = myProjects.filter(p => ['stage_won', 'stage_ordering', 'stage_delivery', 'stage_complete'].includes(p.status));
                  const myWonRev = myWon.reduce((s, p) => s + (Number(p.budget) || 0), 0);
                  return (
                    <div key={m.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">{idx + 1}</span>
                        <span className="font-bold text-slate-200">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({myProjects.length} งาน)</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-400">{formatCurrency(myWonRev)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 💰 TAB 2: CFO FINANCIAL DASHBOARD                         */}
      {/* ========================================================= */}
      {activeTab === 'cfo' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 CFO Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Liquid Cash on Hand */}
            <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>💵 เงินสดสภาพคล่องพร้อมใช้</span>
                <span>🏦</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">฿12,450,000</div>
              <div className="text-[11px] text-slate-400">รวม 5 บัญชีธนาคารและเงินสดย่อย</div>
            </div>

            {/* Card 2: Stage 4+ Capital Required */}
            <div className="glass-card p-5 rounded-3xl border border-amber-500/30 bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>📦 เงินทุนสำรองสั่งของ Stage 4+</span>
                <span>🛒</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{formatCurrency(stage4Metrics.totalCapital)}</div>
              <div className="text-[11px] text-slate-400">สำหรับ {stage4Metrics.count} โครงการที่ชนะงานแล้ว</div>
            </div>

            {/* Card 3: Vendor PO Commitments */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>🛒 ภาระหนี้ PO รอชำระ Vendor</span>
                <span>🧾</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
                {formatCurrency((purchaseOrders || []).filter(po => po.paymentStatus !== 'ชำระแล้ว').reduce((s, p) => s + (Number(p.totalAmount) || 0), 0))}
              </div>
              <div className="text-[11px] text-slate-400">กำหนดชำระภายใน 30 วัน</div>
            </div>

            {/* Card 4: Retention 5% */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>⏳ เงินประกันสัญญา / Retention 5%</span>
                <span>🛡️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {formatCurrency(totalBudget * 0.05)}
              </div>
              <div className="text-[11px] text-slate-400">เงินค้ำประกันที่จะได้รับคืนจาก รพ.</div>
            </div>

          </div>

          {/* Middle CFO Section: Upcoming Payables & Margin Auditing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Upcoming Payables */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>📅 ปฏิทินวันครบกำหนดจ่ายเงิน (Upcoming Payables)</span>
                </h3>
                <span className="text-xs text-amber-400 font-bold">เตรียมเงินสด</span>
              </div>

              <div className="space-y-3">
                {(purchaseOrders || []).slice(0, 3).map((po, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200">PO: {po.poNumber} ({po.vendorName})</div>
                      <div className="text-[11px] text-slate-400">{po.productName}</div>
                      <div className="text-[10px] text-amber-300 font-mono">กำหนดส่ง: {po.deliveryDate || 'N/A'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(po.totalAmount)}</div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {po.paymentStatus || 'รอชำระเงิน'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Margin Audit */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🧮 ตรวจสอบโครงสร้างกำไรรายโครงการ (Margin Audit)</span>
                </h3>
                <button onClick={() => onOpenReport('cost_margin_sheet')} className="text-xs text-indigo-400 font-bold">ดูรายงานต้นทุน ➔</button>
              </div>

              <div className="space-y-3">
                {calculatedCostSheets.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{item.proj.hospitalName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ราคาขาย {formatCurrency(item.proj.budget)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-indigo-400">กำไร {formatCurrency(item.computed.netProfit)}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.computed.netProfitPercent >= 15 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {item.computed.netProfitPercent.toFixed(1)}% Margin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🎯 TAB 3: MANAGER OPERATIONS DASHBOARD                    */}
      {/* ========================================================= */}
      {activeTab === 'manager' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 Manager Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Active Projects */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>📋 โครงการที่กำลังดำเนินการ</span>
                <span>📂</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalProjects} <span className="text-xs font-normal text-slate-400">โครงการ</span></div>
              <div className="text-[11px] text-slate-400">ดูแลโดยทีมขาย {members.length} ท่าน</div>
            </div>

            {/* Card 2: Demo Fleet Active */}
            <div className="glass-card p-5 rounded-3xl border border-purple-500/30 bg-purple-950/20 space-y-2">
              <div className="flex items-center justify-between text-purple-300 text-xs font-bold">
                <span>🧪 เครื่อง Demo ประจำอยู่ รพ.</span>
                <span>🏥</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">{scheduledDemos.length} <span className="text-xs font-normal text-slate-400">เครื่อง</span></div>
              <div className="text-[11px] text-slate-400">ระยะเวลาสาธิตเฉลี่ย 4.5 วัน</div>
            </div>

            {/* Card 3: Active Shipments */}
            <div className="glass-card p-5 rounded-3xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
              <div className="flex items-center justify-between text-cyan-300 text-xs font-bold">
                <span>🚢 ชิปปิ้งนำเข้ากำลังเดินทาง</span>
                <span>✈️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">{(shipments || []).length} <span className="text-xs font-normal text-slate-400">ล็อต</span></div>
              <div className="text-[11px] text-slate-400">ติดตามผ่านระบบนับวันจ่ายเงิน</div>
            </div>

            {/* Card 4: Active Repairs */}
            <div className="glass-card p-5 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-2">
              <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
                <span>🔧 คิวงานแจ้งส่งซ่อม</span>
                <span>⚙️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">{(repairTickets || []).length} <span className="text-xs font-normal text-slate-400">เคส</span></div>
              <div className="text-[11px] text-slate-400">เวลาซ่อมเฉลี่ย 3 วันทำการ</div>
            </div>

          </div>

          {/* Middle Manager Section: Demo Schedule & Warranty Expiring Soon */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Demo Return Deadlines */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🧪 คิวเครื่อง Demo & วันครบกำหนดคืน</span>
                </h3>
                <button onClick={() => onOpenReport('demo_journey_log')} className="text-xs text-indigo-400 font-bold">ดูประวัติเดโม่ ➔</button>
              </div>

              <div className="space-y-3">
                {scheduledDemos.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">ไม่มีคิวเดโม่ที่กำลังดำเนินการ</div>
                ) : (
                  scheduledDemos.map((b, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{b.productName}</div>
                        <div className="text-[11px] text-slate-400">ณ {b.hospitalName} ({b.salesPerson})</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold">
                          สิ้นสุด {b.endDate}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Warranty Alerts (Opportunity to Sell MA) */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🛡️ เครื่องที่ใกล้หมดประกัน (โอกาสขายสัญญา MA)</span>
                </h3>
                <button onClick={() => onOpenReport('warranty_expiry_matrix')} className="text-xs text-indigo-400 font-bold">ดูทั้งหมด ➔</button>
              </div>

              <div className="space-y-3">
                {warrantyAlerts.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">เครื่องทั้งหมดอยู่ในประกันปกติ</div>
                ) : (
                  warrantyAlerts.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{item.productName} ({item.serialNumber})</div>
                        <div className="text-[11px] text-slate-400">{item.hospitalName}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${item.daysLeft < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {item.daysLeft < 0 ? '🔴 หมดประกันแล้ว' : `🟡 เหลือ ${item.daysLeft} วัน`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

window.ManagerDashboard = ManagerDashboard;
