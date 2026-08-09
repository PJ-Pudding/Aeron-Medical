// MODULE: mod07_finance/CostCalculationView.js

function CostCalculationView({ costCalculations = [], projects = [], members = [], onOpenNewCalc, onEditCalc, onDeleteCalc }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Combine projects from Sales Kanban with calculation records
  const calculatedItems = useMemo(() => {
    return (projects || []).map(proj => {
      const existingCalc = (costCalculations || []).find(c => c.projectId === proj.id || (c.projectName && c.projectName.includes(proj.hospitalName)));
      if (existingCalc) {
        const computed = computeCostSheet(existingCalc);
        return {
          proj,
          calc: existingCalc,
          computed,
          hasCalc: true
        };
      } else {
        // Fallback default calculation object
        let parsedDf = 0;
        let dfMissing = true;
        if (proj.dfAmount) {
          dfMissing = false;
          const numStr = String(proj.dfAmount).replace(/[^0-9.]/g, '');
          parsedDf = Number(numStr) || 0;
        }

        const defaultCalc = {
          id: `temp-${proj.id}`,
          projectId: proj.id,
          projectName: `${proj.hospitalName || ''} - ${proj.title || ''}`,
          sellingPriceInVat: proj.budget || 0,
          costInVat: Math.round((proj.budget || 0) * 0.7),
          dfType: 'amount',
          dfValue: parsedDf,
          dfMissing: dfMissing,
          salesCommPercent: 2.0,
          interestPercent: 7.0,
          taxPercent: 20.0,
          retentionPercent: 5.0,
          date: new Date().toISOString().split('T')[0]
        };

        const computed = computeCostSheet(defaultCalc);
        return {
          proj,
          calc: defaultCalc,
          computed,
          hasCalc: false
        };
      }
    });
  }, [projects, costCalculations]);

  // Date Filtered Items
  const filteredItems = useMemo(() => {
    return calculatedItems.filter(item => {
      const itemDate = item.calc.date || item.proj.procurementDate || item.proj.createdDate || '';
      if (itemDate) {
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
      }

      if (filterStatus === 'has_calc' && !item.hasCalc) return false;
      if (filterStatus === 'no_calc' && item.hasCalc) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.proj.title || '').toLowerCase().includes(q);
        const matchHosp = (item.proj.hospitalName || '').toLowerCase().includes(q);
        const matchAssignee = (item.proj.assignee || '').toLowerCase().includes(q);
        return matchTitle || matchHosp || matchAssignee;
      }
      return true;
    });
  }, [calculatedItems, startDate, endDate, filterStatus, searchQuery]);

  // Stage 4+ Capital Required for Purchasing Products
  const stage4Metrics = useMemo(() => {
    const stage4PlusIds = ['stage_approved', 'stage_won', 'stage_ordering', 'stage_delivery'];
    const stage4Projects = (projects || []).filter(p => stage4PlusIds.includes(p.status));
    
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
  }, [projects, costCalculations]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let totalBudget = 0;
    let totalCost = 0;
    let totalNetProfit = 0;

    filteredItems.forEach(item => {
      totalBudget += Number(item.computed.sellingPriceInVat) || 0;
      totalCost += Number(item.computed.costInVat) || 0;
      totalNetProfit += Number(item.computed.netProfit) || 0;
    });

    const avgMargin = totalBudget > 0 ? (totalNetProfit / totalBudget) * 100 : 0;
    return { totalBudget, totalCost, totalNetProfit, avgMargin };
  }, [filteredItems]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Banner & Date Range Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400">
            🧮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                COST & MARGIN ANALYTICS
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">ระบบคำนวณต้นทุน กำไรสุทธิ และจุดคุ้มทุน (Cost Sheet Engine)</h2>
          </div>
        </div>

        {/* High-Contrast Vibrant Yellow Date Range Picker Controls */}
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

          <button
            onClick={() => onOpenNewCalc(null)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-md transition-all flex items-center gap-1 ml-2"
          >
            <span>+ สร้าง Cost Sheet ใหม่</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💰 มูลค่างานรวม (Sales Budget)</div>
          <div className="text-xl font-black font-mono text-white">
            {formatCurrency(summaryMetrics.totalBudget)}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📦 ต้นทุนสินค้ารวม (Cost in VAT)</div>
          <div className="text-xl font-black font-mono text-rose-400">
            {formatCurrency(summaryMetrics.totalCost)}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💵 กำไรสุทธิตามคำนวณ (Net Profit)</div>
          <div className="text-xl font-black font-mono text-emerald-400">
            {formatCurrency(summaryMetrics.totalNetProfit)}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📊 อัตรากำไรเฉลี่ย (Avg Margin %)</div>
          <div className="text-xl font-black font-mono text-indigo-300">
            {(Number(summaryMetrics?.avgMargin) || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Cost Sheets Grid Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm">📋 รายการ Cost Sheet ประเมินต้นทุน</h3>
          <span className="text-xs text-amber-300 font-mono font-bold">{filteredItems.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">โรงพยาบาล / โครงการ</th>
                <th className="p-3 text-right">งบประมาณขาย</th>
                <th className="p-3 text-right">ต้นทุนสินค้า (Cost)</th>
                <th className="p-3 text-right">DF แพทย์</th>
                <th className="p-3 text-right">กำไรสุทธิ (Net Profit)</th>
                <th className="p-3 text-right">Net Margin %</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                    ไม่พบใบคํานวณต้นทุนในช่วงเวลาที่เลือก
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.calc.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white text-sm">{item.proj.hospitalName}</div>
                      <div className="text-slate-400 text-[11px]">{item.proj.title}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      {formatCurrency(item.computed.sellingPriceInVat)}
                    </td>
                    <td className="p-3 text-right font-mono text-rose-400">
                      {formatCurrency(item.computed.costInVat)}
                    </td>
                    <td className="p-3 text-right font-mono text-indigo-300">
                      {formatCurrency(item.computed.dfAmount)}
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-emerald-400 text-sm">
                      {formatCurrency(item.computed.netProfit)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-300">
                      {(Number(item.computed?.netMarginPercent) || 0).toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onEditCalc(item.calc)}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30"
                      >
                        ✏️ คำนวณ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
