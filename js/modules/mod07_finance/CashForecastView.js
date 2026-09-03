// MODULE: mod07_finance/CashForecastView.js
// 🔮 Cash Flow Forecast & Budget Planning Engine (Rolling TTM Runway, Pipeline Inflow/Outflow & Editable Plans)

function CashForecastView({
  projects = [],
  purchaseOrders = [],
  transactions = [],
  costCalculations = [],
  currentUser = null
}) {
  const [delayDays, setDelayDays] = useState(0); // What-if delay slider (0, 15, 30, 45, 60 days)
  const [customStartingCash, setCustomStartingCash] = useState(12450000); // Current liquid cash default
  const [selectedHorizon, setSelectedHorizon] = useState('6m'); // 3m, 6m, 12m
  const [overrideMonthlyOpex, setOverrideMonthlyOpex] = useState(null);

  // 1. State for User-Editable Hospital Collections (เงินสดรับเข้า - เก็บเงินจากโรงพยาบาล)
  const [customHospitalCollections, setCustomHospitalCollections] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_forecast_hospital_collections');
      return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
  });

  // 2. State for User-Editable Projected Expenses (เงินสดจ่ายออก - ค่าใช้จ่ายที่คาดการณ์)
  const [customProjectedExpenses, setCustomProjectedExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_forecast_projected_expenses');
      return saved ? JSON.parse(saved) : {};
    } catch(e) { return {}; }
  });

  // ⚡ Live Cloud Sync & Local Storage Persistence
  useEffect(() => {
    try {
      localStorage.setItem('aeron_forecast_hospital_collections', JSON.stringify(customHospitalCollections));
      if (typeof syncToDB === 'function') {
        syncToDB('forecast_hospital_collections', customHospitalCollections);
      }
    } catch(e) {}
  }, [customHospitalCollections]);

  useEffect(() => {
    try {
      localStorage.setItem('aeron_forecast_projected_expenses', JSON.stringify(customProjectedExpenses));
      if (typeof syncToDB === 'function') {
        syncToDB('forecast_projected_expenses', customProjectedExpenses);
      }
    } catch(e) {}
  }, [customProjectedExpenses]);

  // ⚡ Startup Cloud Hydration: Fetch latest live forecast adjustments from Supabase
  useEffect(() => {
    async function hydrateForecast() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;
        const remoteColl = await fetcher('forecast_hospital_collections', null);
        if (remoteColl && typeof remoteColl === 'object' && Object.keys(remoteColl).length > 0) {
          setCustomHospitalCollections(remoteColl);
        }
        const remoteExp = await fetcher('forecast_projected_expenses', null);
        if (remoteExp && typeof remoteExp === 'object' && Object.keys(remoteExp).length > 0) {
          setCustomProjectedExpenses(remoteExp);
        }
      } catch(e) {
        console.warn('[Forecast Hydration Notice]:', e.message);
      }
    }
    hydrateForecast();
  }, []);

  // Handlers for cell editing
  const handleCollectionChange = (monthKey, val) => {
    const num = val === '' ? 0 : Number(val);
    setCustomHospitalCollections(prev => ({ ...prev, [monthKey]: num }));
  };

  const handleExpenseChange = (monthKey, val) => {
    const num = val === '' ? 0 : Number(val);
    setCustomProjectedExpenses(prev => ({ ...prev, [monthKey]: num }));
  };

  // Dynamic Rolling Trailing 12 Months (T12M / LTM) Calculation
  const { avgMonthlyOpex, totalT12Expenses, t12Count, t12RangeLabel } = useMemo(() => {
    const now = new Date();
    const curYr = now.getFullYear();
    const curM = now.getMonth();

    // Generate rolling 12 months prior to the current month (e.g. 2025-09 to 2026-08)
    const t12Keys = [];
    const t12BeKeys = [];
    for (let i = 12; i >= 1; i--) {
      const d = new Date(curYr, curM - i, 1);
      const yr = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      t12Keys.push(`${yr}-${m}`);
      t12BeKeys.push(`${yr + 543}-${m}`);
    }

    const rangeLabel = `${t12Keys[0]} ถึง ${t12Keys[t12Keys.length - 1]}`;

    if (!transactions || transactions.length === 0) {
      return { avgMonthlyOpex: 1564311, totalT12Expenses: 18771730, t12Count: 1013, t12RangeLabel: rangeLabel };
    }

    const t12Expenses = transactions.filter(t => {
      const isExp = t.type === 'expense' || t.transaction_type === 'รายจ่าย';
      if (!isExp) return false;
      const d = String(t.date || t.transaction_date || t.created_at || '');
      const prefix = d.slice(0, 7);
      return t12Keys.includes(prefix) || t12BeKeys.includes(prefix);
    });

    const totalExp = t12Expenses.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const avg = totalExp > 0 ? Math.round(totalExp / 12) : 1564311;

    return {
      avgMonthlyOpex: avg,
      totalT12Expenses: totalExp,
      t12Count: t12Expenses.length,
      t12RangeLabel: rangeLabel
    };
  }, [transactions]);

  const effectiveMonthlyOpex = overrideMonthlyOpex !== null ? overrideMonthlyOpex : avgMonthlyOpex;

  // Generate rolling forecast months
  const forecastMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    const count = selectedHorizon === '3m' ? 3 : selectedHorizon === '12m' ? 12 : 6;
    
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const yr = d.getFullYear();
      const mIdx = d.getMonth();
      const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const key = `${yr}-${String(mIdx + 1).padStart(2, '0')}`;
      const label = `${monthNames[mIdx]} ${yr + 543} (${monthNamesEn[mIdx]})`;
      months.push({ key, yr, mIdx, label, index: i });
    }
    return months;
  }, [selectedHorizon]);

  // Calculate Inflows, Outflows and Ending Balances for each forecast month
  const forecastMatrix = useMemo(() => {
    let runningCash = Number(customStartingCash) || 0;

    return forecastMonths.map((m, idx) => {
      // 1. Inflows: Stage 8 Projects (ตรวจรับ & รับเช็ค - หัก ณ ที่จ่าย 1%) + User Editable Collections
      const monthInflowProjects = (projects || []).filter(p => {
        const isStage8Complete = p.status === 'stage_complete';
        if (!isStage8Complete) return false;

        let baseDateStr = p.deliveryDate || p.procurementDate || p.createdDate;
        if (!baseDateStr) return false;

        let baseDate = new Date(baseDateStr);
        if (delayDays > 0) {
          baseDate = new Date(baseDate.getTime() + delayDays * 24 * 60 * 60 * 1000);
        }

        const pYr = baseDate.getFullYear();
        const pM = baseDate.getMonth();
        return pYr === m.yr && pM === m.mIdx;
      });

      // Calculate net inflow after 1% Withholding Tax (หัก ณ ที่จ่าย 1%)
      const projectInflowTotal = monthInflowProjects.reduce((s, p) => {
        const rawBudget = Number(p.budget) || 0;
        const netAfter1PercentWHT = rawBudget * 0.99; // หัก ณ ที่จ่าย 1%
        return s + netAfter1PercentWHT;
      }, 0);

      const retentionInflow = Math.round(projectInflowTotal * 0.05);
      const manualHospitalCollection = Number(customHospitalCollections[m.key]) || 0;
      const totalInflow = projectInflowTotal + manualHospitalCollection;

      // 2. Outflows: Purchase Orders + OPEX + Duties + User Editable Projected Expenses
      const monthPOs = (purchaseOrders || []).filter(po => {
        let poDateStr = po.expectedDelivery || po.poDate;
        if (!poDateStr) return false;
        const poDate = new Date(poDateStr);
        return poDate.getFullYear() === m.yr && poDate.getMonth() === m.mIdx;
      });

      const poOutflowTotal = monthPOs.reduce((s, po) => s + (Number(po.totalAmountTHB || po.totalAmount) || 0), 0);
      const estimatedDuties = Math.round(poOutflowTotal * 0.03); // 3% Estimated customs/import fees
      const opexOutflow = effectiveMonthlyOpex;
      const manualProjectedExpense = Number(customProjectedExpenses[m.key]) || 0;

      const totalOutflow = poOutflowTotal + estimatedDuties + opexOutflow + manualProjectedExpense;

      // 3. Net Cash Flow & Ending Balance
      const netMonthlyCashFlow = totalInflow - totalOutflow;
      const startingCash = runningCash;
      runningCash = startingCash + netMonthlyCashFlow;

      return {
        ...m,
        startingCash,
        inflowProjects: monthInflowProjects,
        projectInflowTotal,
        retentionInflow,
        manualHospitalCollection,
        totalInflow,
        poList: monthPOs,
        poOutflowTotal,
        estimatedDuties,
        opexOutflow,
        manualProjectedExpense,
        totalOutflow,
        netMonthlyCashFlow,
        endingCash: runningCash,
        isDeficit: runningCash < 0,
        isTight: runningCash > 0 && runningCash < 3000000
      };
    });
  }, [forecastMonths, projects, purchaseOrders, effectiveMonthlyOpex, customStartingCash, delayDays, customHospitalCollections, customProjectedExpenses]);

  // Aggregate Horizon Summary
  const horizonSummary = useMemo(() => {
    const totalIn = forecastMatrix.reduce((s, m) => s + m.totalInflow, 0);
    const totalOut = forecastMatrix.reduce((s, m) => s + m.totalOutflow, 0);
    const minCash = forecastMatrix.reduce((min, m) => Math.min(min, m.endingCash), customStartingCash);
    const maxCash = forecastMatrix.reduce((max, m) => Math.max(max, m.endingCash), customStartingCash);
    const endCash = forecastMatrix[forecastMatrix.length - 1]?.endingCash || customStartingCash;
    const hasDeficit = forecastMatrix.some(m => m.isDeficit);
    const firstDeficitMonth = forecastMatrix.find(m => m.isDeficit);

    return { totalIn, totalOut, minCash, maxCash, endCash, hasDeficit, firstDeficitMonth };
  }, [forecastMatrix, customStartingCash]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 font-sans pb-12">
      
      {/* Top Header & Simulation Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl border border-indigo-500/30 shadow-md">
              🔮
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>ประมาณการกระแสเงินสด & วางแผนสภาพคล่อง (Cash Forecast & Runway)</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                  PROACTIVE FINANCIAL PLANNING
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                พยากรณ์เงินสดรับเข้าจากโครงการ Sales Kanban เทียบกับภาระจ่าย PO & ค่าใช้จ่าย พร้อมช่องปรับแผนรับ-จ่ายอิสระ
              </p>
            </div>
          </div>
        </div>

        {/* Horizon Switcher & What-If Simulation Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">ช่วงเวลา:</span>
            {['3m', '6m', '12m'].map(h => (
              <button
                key={h}
                onClick={() => setSelectedHorizon(h)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedHorizon === h
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {h === '3m' ? '3 เดือน' : h === '6m' ? '6 เดือน' : '1 ปีเต็ม'}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Delay Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">จำลอง รพ. เบิกจ่ายช้า:</span>
            <select
              value={delayDays}
              onChange={(e) => setDelayDays(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-amber-300 text-xs rounded-xl px-2.5 py-1 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value={0}>⚡ ตามกำหนดปกติ (0 วัน)</option>
              <option value={15}>⏳ ล่าช้า +15 วัน</option>
              <option value={30}>⏳ ล่าช้า +30 วัน (1 เดือน)</option>
              <option value={45}>⚠️ ล่าช้า +45 วัน</option>
              <option value={60}>🚨 ล่าช้า +60 วัน (2 เดือน)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Big KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Starting Cash */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>💵 เงินสดสภาพคล่องตั้งต้น</span>
            <span>🏦</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {formatCurrency(customStartingCash)}
          </div>
          <div className="text-[11px] text-slate-400">
            ยอดเงินสดใน 5 บัญชีธนาคาร + เงินสดย่อย
          </div>
        </div>

        {/* Card 2: Projected Inflow */}
        <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
            <span>📥 เงินสดคาดว่าจะรับเข้า ({selectedHorizon === '3m' ? '3 เดือน' : selectedHorizon === '12m' ? '12 เดือน' : '6 เดือน'})</span>
            <span>💰</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            +{formatCurrency(horizonSummary.totalIn)}
          </div>
          <div className="text-[11px] text-slate-400">
            จากโครงการ Stage 8 (หัก 1%) & แผนเก็บเงิน รพ.
          </div>
        </div>

        {/* Card 3: Projected Outflow */}
        <div className="glass-card p-5 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-2">
          <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
            <span>📤 เงินสดคาดว่าจะจ่ายออก</span>
            <span>🛒</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            -{formatCurrency(horizonSummary.totalOut)}
          </div>
          <div className="text-[11px] text-slate-400">
            ภาระจ่าย Vendor PO + ค่าใช้จ่ายดำเนินงาน TTM
          </div>
        </div>

        {/* Card 4: Projected Ending Cash & Runway Health */}
        <div className={`glass-card p-5 rounded-3xl border space-y-2 ${
          horizonSummary.hasDeficit 
            ? 'border-rose-500/50 bg-rose-950/30' 
            : horizonSummary.endCash < 3000000 
            ? 'border-amber-500/50 bg-amber-950/30' 
            : 'border-indigo-500/30 bg-indigo-950/20'
        }`}>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={horizonSummary.hasDeficit ? 'text-rose-300' : 'text-indigo-300'}>
              🛡️ สภาพคล่องสุทธิปลายงวด
            </span>
            <span>{horizonSummary.hasDeficit ? '⚠️' : '✅'}</span>
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${
            horizonSummary.hasDeficit ? 'text-rose-400' : 'text-indigo-300'
          }`}>
            {formatCurrency(horizonSummary.endCash)}
          </div>
          <div className="text-[11px] flex items-center justify-between">
            <span className="text-slate-400">สถานะสุขภาพเงินสด:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              horizonSummary.hasDeficit
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {horizonSummary.hasDeficit ? '🚨 มีช่วงเงินสดติดลบ' : '✨ สภาพคล่องเพียงพอ'}
            </span>
          </div>
        </div>

      </div>

      {/* Alert Banner if Cash Deficit Detected */}
      {horizonSummary.hasDeficit && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 text-xs text-rose-200 animate-pulse">
          <span className="text-lg">🚨</span>
          <div>
            <div className="font-bold text-sm text-rose-300">แจ้งเตือนจุดเสี่ยงสภาพคล่อง (Liquidity Deficit Warning):</div>
            <p className="mt-0.5 text-rose-200/90">
              ตรวจพบว่าในเดือน <strong>{horizonSummary.firstDeficitMonth?.label}</strong> เงินสดคงเหลือจะติดลบ ({formatCurrency(horizonSummary.firstDeficitMonth?.endingCash)}) เนื่องจากมียอดจ่าย PO/ค่าใช้จ่ายสูงกว่าเงินรับเข้าจาก รพ. แนะนำให้ระบุแผนเก็บเงิน รพ. หรือเตรียมขอวงเงินสินเชื่อ P/N
            </p>
          </div>
        </div>
      )}

      {/* 6-Month Visual Bar Breakdown */}
      <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>📊 แนวโน้มกระแสเงินสดรับ-จ่ายรายเดือน (Rolling Cash Trajectory)</span>
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> รับเข้า (Inflow)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> จ่ายออก (Outflow)
            </span>
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> เงินสดคงเหลือสิ้นเดือน
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {forecastMatrix.map((m, idx) => (
            <div 
              key={m.key} 
              className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                m.isDeficit 
                  ? 'bg-rose-950/30 border-rose-500/40 shadow-lg shadow-rose-950/20' 
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-300 border-b border-slate-800/80 pb-1.5 flex items-center justify-between">
                <span>{m.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">M{idx + 1}</span>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-emerald-400">
                  <span className="text-slate-400 font-sans">รับ:</span>
                  <span>+{formatShortCurrency(m.totalInflow)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span className="text-slate-400 font-sans">จ่าย:</span>
                  <span>-{formatShortCurrency(m.totalOutflow)}</span>
                </div>
                <div className="border-t border-slate-800 pt-1 flex justify-between font-bold">
                  <span className="text-slate-400 font-sans">สุทธิ:</span>
                  <span className={m.netMonthlyCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    {m.netMonthlyCashFlow >= 0 ? '+' : ''}{formatShortCurrency(m.netMonthlyCashFlow)}
                  </span>
                </div>
              </div>

              <div className={`mt-2 p-2 rounded-xl text-center font-mono font-bold text-xs ${
                m.isDeficit 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                  : 'bg-slate-900 text-amber-300 border border-slate-700'
              }`}>
                <div className="text-[9.5px] text-slate-400 font-sans font-normal">เงินสดสิ้นเดือน:</div>
                <div className="truncate">{formatCurrency(m.endingCash)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Forecast Spreadsheet Matrix Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <span>📋 ตารางแจกแจงกระแสเงินสดรับ-จ่ายเชิงลึก (Detailed Cash Forecast Matrix)</span>
            </h3>
            <p className="text-xs text-slate-400">
              💡 คุณสามารถ <strong>พิมพ์แก้ไขช่อง "เก็บเงินจาก รพ." และ "ค่าใช้จ่ายที่คาดการณ์"</strong> ในตารางด้านล่างได้อิสระ ระบบจะคำนวณเงินสดยกไปให้อัตโนมัติ
            </p>
          </div>
          <div className="text-xs text-emerald-300 font-mono font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto">
            <span>✏️</span> <span>Interactive Editable Mode</span>
          </div>
        </div>

        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-right text-[11px] font-mono border-collapse select-text">
            <thead>
              <tr className="bg-[#0b1329] text-white font-sans text-xs border-b-2 border-slate-700">
                <th className="p-3 text-left font-bold min-w-[280px] sticky left-0 bg-[#0b1329] z-10 border-r border-slate-800">
                  รายการกระแสเงินสด / เดือน
                </th>
                {forecastMatrix.map(m => (
                  <th key={m.key} className="p-3 font-bold min-w-[150px] border-r border-slate-800/60 text-center">
                    {m.label}
                  </th>
                ))}
                <th className="p-3 font-black min-w-[150px] bg-[#111c38] text-amber-300 text-center border-l-2 border-slate-700">
                  ยอดรวมทั้งช่วง
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/40">
              
              {/* 1. CASH INFLOW SECTION */}
              <tr className="bg-emerald-950/30 text-emerald-300 font-extrabold text-xs">
                <td colSpan={forecastMatrix.length + 2} className="p-2.5 text-left bg-emerald-950/40">
                  📥 กระแสเงินสดรับเข้า (Project Cash Inflows)
                </td>
              </tr>

              <tr className="bg-slate-900/40 text-slate-300">
                <td className="p-2 text-left font-sans sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">
                  ยอดเบิกจ่ายเงินจากโครงการ รพ. (Stage 8 อัตโนมัติ - หัก ณ ที่จ่าย 1%)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-2 border-r border-slate-800/40 text-emerald-400 font-bold">
                    {m.projectInflowTotal > 0 ? `+${formatCurrency(m.projectInflowTotal)}` : '0 ฿'}
                  </td>
                ))}
                <td className="p-2 font-bold text-emerald-300 border-l-2 border-slate-700">
                  +{formatCurrency(forecastMatrix.reduce((s, m) => s + m.projectInflowTotal, 0))}
                </td>
              </tr>

              {/* ⭐ USER EDITABLE ROW: เก็บเงินจากโรงพยาบาล */}
              <tr className="bg-emerald-950/20 text-emerald-200 border-y border-emerald-500/20">
                <td className="p-2.5 text-left font-sans font-bold sticky left-0 bg-[#062c1d] border-r border-slate-800 pl-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span>✏️</span> <span>เก็บเงินจากโรงพยาบาล (กำหนดเอง)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal bg-emerald-900/50 px-1.5 py-0.5 rounded">กรอกได้</span>
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-1.5 border-r border-slate-800/40 text-center">
                    <input
                      type="number"
                      placeholder="0"
                      value={customHospitalCollections[m.key] !== undefined && customHospitalCollections[m.key] !== 0 ? customHospitalCollections[m.key] : ''}
                      onChange={(e) => handleCollectionChange(m.key, e.target.value)}
                      className="w-full bg-slate-950/90 border border-emerald-500/40 hover:border-emerald-400 focus:border-emerald-300 text-emerald-300 text-right font-mono font-bold text-xs px-2 py-1.5 rounded-lg outline-none transition-all shadow-inner focus:ring-1 focus:ring-emerald-400"
                    />
                  </td>
                ))}
                <td className="p-2.5 font-black text-emerald-300 border-l-2 border-slate-700 bg-emerald-950/40">
                  +{formatCurrency(forecastMatrix.reduce((s, m) => s + (Number(customHospitalCollections[m.key]) || 0), 0))}
                </td>
              </tr>

              <tr className="bg-[#022c22] text-emerald-100 font-black border-y border-emerald-500/40">
                <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#022c22] border-r border-slate-800">
                  รวมเงินสดรับเข้าทั้งหมด (Total Inflow)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-2.5 border-r border-slate-800/40 text-emerald-300">
                    +{formatCurrency(m.totalInflow)}
                  </td>
                ))}
                <td className="p-2.5 font-black text-amber-300 border-l-2 border-slate-700">
                  +{formatCurrency(horizonSummary.totalIn)}
                </td>
              </tr>

              {/* 2. CASH OUTFLOW SECTION */}
              <tr className="bg-rose-950/30 text-rose-300 font-extrabold text-xs">
                <td colSpan={forecastMatrix.length + 2} className="p-2.5 text-left bg-rose-950/40">
                  📤 กระแสเงินสดจ่ายออก (Project & Operational Outflows)
                </td>
              </tr>

              <tr className="bg-slate-900/40 text-slate-300">
                <td className="p-2 text-left font-sans sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">
                  ภาระจ่ายชำระค่าสินค้า Vendor (Purchase Orders)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-2 border-r border-slate-800/40 text-rose-400">
                    {m.poOutflowTotal > 0 ? `-${formatCurrency(m.poOutflowTotal)}` : '0 ฿'}
                  </td>
                ))}
                <td className="p-2 font-bold text-rose-300 border-l-2 border-slate-700">
                  -{formatCurrency(forecastMatrix.reduce((s, m) => s + m.poOutflowTotal, 0))}
                </td>
              </tr>

              <tr className="bg-slate-900/40 text-slate-300">
                <td className="p-2 text-left font-sans sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">
                  ภาษีนำเข้า & พิธีการศุลกากร (Estimated Import Duties)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-2 border-r border-slate-800/40 text-rose-300/80">
                    {m.estimatedDuties > 0 ? `-${formatCurrency(m.estimatedDuties)}` : '0 ฿'}
                  </td>
                ))}
                <td className="p-2 font-bold text-rose-300/80 border-l-2 border-slate-700">
                  -{formatCurrency(forecastMatrix.reduce((s, m) => s + m.estimatedDuties, 0))}
                </td>
              </tr>

              <tr className="bg-slate-900/40 text-slate-300">
                <td className="p-2 text-left font-sans sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">
                  ค่าใช้จ่ายดำเนินงานประจำ (เฉลี่ย 12 เดือนย้อนหลัง TTM: {t12RangeLabel || '12M'} หาร 12)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-2 border-r border-slate-800/40 text-rose-300/80">
                    -{formatCurrency(m.opexOutflow)}
                  </td>
                ))}
                <td className="p-2 font-bold text-rose-300/80 border-l-2 border-slate-700">
                  -{formatCurrency(forecastMatrix.reduce((s, m) => s + m.opexOutflow, 0))}
                </td>
              </tr>

              {/* ⭐ USER EDITABLE ROW: ค่าใช้จ่ายที่คาดการณ์ */}
              <tr className="bg-rose-950/20 text-rose-200 border-y border-rose-500/20">
                <td className="p-2.5 text-left font-sans font-bold sticky left-0 bg-[#350713] border-r border-slate-800 pl-4 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <span>✏️</span> <span>ค่าใช้จ่ายที่คาดการณ์ (กำหนดเอง)</span>
                  </span>
                  <span className="text-[10px] text-rose-400 font-normal bg-rose-900/50 px-1.5 py-0.5 rounded">กรอกได้</span>
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-1.5 border-r border-slate-800/40 text-center">
                    <input
                      type="number"
                      placeholder="0"
                      value={customProjectedExpenses[m.key] !== undefined && customProjectedExpenses[m.key] !== 0 ? customProjectedExpenses[m.key] : ''}
                      onChange={(e) => handleExpenseChange(m.key, e.target.value)}
                      className="w-full bg-slate-950/90 border border-rose-500/40 hover:border-rose-400 focus:border-rose-300 text-rose-300 text-right font-mono font-bold text-xs px-2 py-1.5 rounded-lg outline-none transition-all shadow-inner focus:ring-1 focus:ring-rose-400"
                    />
                  </td>
                ))}
                <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700 bg-rose-950/40">
                  -{formatCurrency(forecastMatrix.reduce((s, m) => s + (Number(customProjectedExpenses[m.key]) || 0), 0))}
                </td>
              </tr>

              <tr className="bg-[#4c0519] text-rose-200 font-black border-y border-rose-600/50">
                <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#4c0519] border-r border-slate-800">
                  รวมเงินสดจ่ายออกทั้งหมด (Total Outflow)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className="p-2.5 border-r border-slate-800/40 text-rose-300">
                    -{formatCurrency(m.totalOutflow)}
                  </td>
                ))}
                <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700">
                  -{formatCurrency(horizonSummary.totalOut)}
                </td>
              </tr>

              {/* 3. NET CASH FLOW & ENDING RUNWAY */}
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-700">
                <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-slate-950 border-r border-slate-800">
                  กระแสเงินสดสุทธิประจำเดือน (Net Monthly Cash Flow)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className={`p-2.5 border-r border-slate-800/40 font-black ${
                    m.netMonthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {m.netMonthlyCashFlow >= 0 ? '+' : ''}{formatCurrency(m.netMonthlyCashFlow)}
                  </td>
                ))}
                <td className={`p-2.5 font-black border-l-2 border-slate-700 ${
                  (horizonSummary.totalIn - horizonSummary.totalOut) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(horizonSummary.totalIn - horizonSummary.totalOut) >= 0 ? '+' : ''}
                  {formatCurrency(horizonSummary.totalIn - horizonSummary.totalOut)}
                </td>
              </tr>

              <tr className="bg-[#1e1b4b] text-indigo-100 font-black text-xs border-y-2 border-indigo-500">
                <td className="p-3 text-left font-sans sticky left-0 bg-[#1e1b4b] border-r border-slate-800">
                  🏛️ เงินสดคงเหลือสุทธิยกไปสิ้นเดือน (Ending Cash Balance)
                </td>
                {forecastMatrix.map(m => (
                  <td key={m.key} className={`p-3 border-r border-slate-800/40 font-mono text-sm font-black ${
                    m.isDeficit ? 'text-rose-400' : 'text-amber-300'
                  }`}>
                    {formatCurrency(m.endingCash)}
                  </td>
                ))}
                <td className="p-3 font-black text-amber-300 border-l-2 border-slate-700 text-sm">
                  {formatCurrency(horizonSummary.endCash)}
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

window.CashForecastView = CashForecastView;
