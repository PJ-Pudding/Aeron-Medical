// MODULE: mod07_finance/CostCalculationView.js

function CostCalculationView({ costCalculations = [], projects = [], members = [], onOpenNewCalc, onEditCalc, onDeleteCalc, onOpenReport }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('excel'); // 'excel' | 'list'

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Number & Currency Formatters
  const fmtExcelNum = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const fmtPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00%';
    return `${Number(val).toFixed(2)}%`;
  };

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

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let totalBudget = 0;
    let totalCost = 0;
    let totalNetProfit = 0;

    filteredItems.forEach(item => {
      totalBudget += Number(item.computed.saleInVat) || 0;
      totalCost += Number(item.computed.costInVat) || 0;
      totalNetProfit += Number(item.computed.netProfitAmount) || 0;
    });

    const avgMargin = totalBudget > 0 ? (totalNetProfit / totalBudget) * 100 : 0;
    return { totalBudget, totalCost, totalNetProfit, avgMargin };
  }, [filteredItems]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Banner & Date Range Controls + View Mode Switcher */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400 flex-shrink-0">
            🧮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                COST & MARGIN ANALYTICS
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                ({filteredItems.length} โครงการ)
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white mt-0.5">ระบบคำนวณต้นทุน กำไรสุทธิ และจุดคุ้มทุน (Cost Sheet Engine)</h2>
          </div>
        </div>

        {/* Date Range Picker & View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
          
          {/* 🎛️ View Switcher (ข้างการเลือกช่วงวันที่) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-amber-500/40 text-xs shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('excel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'excel'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="มุมมองใบคํานวณ Excel Sheet แยกรายโครงการ"
            >
              <span>📊</span>
              <span>แบบ Excel Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="มุมมองตารางสรุปภาพรวม (List Table)"
            >
              <span>📋</span>
              <span>แบบตารางสรุป</span>
            </button>
          </div>

          {/* High-Contrast Date Range Picker */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 px-2.5 rounded-2xl border border-amber-500/40 text-xs shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span className="hidden sm:inline">ช่วงวันที่:</span>
            </span>
            
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-1.5 px-2 outline-none text-xs"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-1.5 px-2 outline-none text-xs"
            />

            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }} 
                className="text-slate-400 hover:text-white px-1.5 text-xs font-bold"
                title="ล้างช่วงวันที่"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => onOpenReport && onOpenReport('cost_margin_sheet')}
            className="px-3.5 py-2 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            title="ออกรายงานโครงสร้างต้นทุนและส่งออก Excel"
          >
            <span>📑</span>
            <span>รายงาน Cost Sheet</span>
          </button>

          <button
            onClick={() => onOpenNewCalc(null)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>+ สร้าง Cost Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💰 มูลค่างานรวม (Sales Budget)</div>
          <div className="text-base sm:text-xl font-black font-mono text-white truncate">
            {formatCurrency(summaryMetrics.totalBudget)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📦 ต้นทุนสินค้ารวม (Cost in VAT)</div>
          <div className="text-base sm:text-xl font-black font-mono text-rose-400 truncate">
            {formatCurrency(summaryMetrics.totalCost)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💵 กำไรสุทธิตามคำนวณ (Net Profit)</div>
          <div className="text-base sm:text-xl font-black font-mono text-emerald-400 truncate">
            {formatCurrency(summaryMetrics.totalNetProfit)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📊 อัตรากำไรเฉลี่ย (Avg Margin %)</div>
          <div className="text-base sm:text-xl font-black font-mono text-indigo-300">
            {(Number(summaryMetrics?.avgMargin) || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📊 VIEW 1: EXCEL BREAKDOWN SHEET GRID VIEW (มุมมองใหม่ตามรูป) */}
      {/* ========================================================= */}
      {viewMode === 'excel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>📑</span>
              <span>ใบคํานวณต้นทุนโครงสร้าง Excel (Cost Margin Sheets)</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              แสดง {filteredItems.length} ใบคํานวณ
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center text-slate-400 italic">
              ไม่พบใบคํานวณต้นทุนในช่วงเวลาที่เลือก
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredItems.map(item => {
                const c = item.computed;
                const rawDate = item.calc.date || item.proj.procurementDate || item.proj.createdDate || '-';
                const dateStr = window.formatAeronDate ? window.formatAeronDate(rawDate) : rawDate;
                const productCode = item.proj.productId || 'BJ3500';
                const hospital = item.proj.hospitalName || 'ไม่ระบุ รพ.';
                const qtyStr = item.proj.quantity ? `${item.proj.quantity} เครื่อง` : '1 เครื่อง';
                const headerTitle = `${productCode} ${hospital} ${qtyStr}`;

                return (
                  <div 
                    key={item.calc.id} 
                    className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden flex flex-col hover:border-amber-500/60 transition-all group font-sans"
                  >
                    {/* Excel Table Structure */}
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-xs text-slate-200 border-collapse">
                        
                        {/* Header Row: วันที่ | [รหัสรุ่น] [รพ.] [จำนวน] */}
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-700 text-white font-bold">
                            <th className="p-2.5 px-3 text-left w-36 border-r border-slate-700 text-slate-300 font-medium">
                              วันที่
                            </th>
                            <th colSpan="2" className="p-2.5 px-3 text-left text-amber-300 font-bold tracking-wide">
                              <div className="truncate" title={headerTitle}>
                                {headerTitle}
                              </div>
                            </th>
                          </tr>
                          
                          {/* Sub-Header: Blank | % | ราคา */}
                          <tr className="bg-slate-950/80 border-b border-slate-700 text-[11px] text-slate-400 font-mono">
                            <th className="p-1.5 px-3 border-r border-slate-700 text-slate-500 font-normal">
                              {dateStr}
                            </th>
                            <th className="p-1.5 px-2.5 text-center w-20 border-r border-slate-700 font-bold text-slate-300">
                              %
                            </th>
                            <th className="p-1.5 px-3 text-right font-bold text-slate-300">
                              ราคา
                            </th>
                          </tr>
                        </thead>

                        {/* Excel Data Rows */}
                        <tbody className="divide-y divide-slate-800 text-[12px] font-mono">
                          
                          {/* 1. ราคาขาย In vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ราคาขาย In vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-slate-500">-</td>
                            <td className="p-2 px-3 text-right font-bold text-emerald-300 bg-emerald-950/30">
                              {fmtExcelNum(c.saleInVat)}
                            </td>
                          </tr>

                          {/* 2. ราคาขาย Ex vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ราคาขาย Ex vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-slate-500">-</td>
                            <td className="p-2 px-3 text-right font-semibold text-slate-200">
                              {fmtExcelNum(c.saleExVat)}
                            </td>
                          </tr>

                          {/* 3. ทุน In vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ทุน In vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-slate-500">-</td>
                            <td className="p-2 px-3 text-right font-bold text-rose-300 bg-emerald-950/30">
                              {fmtExcelNum(c.costInVat)}
                            </td>
                          </tr>

                          {/* 4. ทุน Ex vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ทุน Ex vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-rose-300 font-bold">
                              {fmtPercent(c.costExVatPercent)}
                            </td>
                            <td className="p-2 px-3 text-right text-rose-300/90 font-medium">
                              {fmtExcelNum(c.costExVat)}
                            </td>
                          </tr>

                          {/* 5. df */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              df
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-indigo-300 bg-emerald-950/30">
                              {c.dfPercent > 0 ? fmtPercent(c.dfPercent) : '0%'}
                            </td>
                            <td className="p-2 px-3 text-right text-indigo-300 bg-emerald-950/30">
                              {fmtExcelNum(c.dfAmount)}
                            </td>
                          </tr>

                          {/* 6. Sales */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              Sales
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.salesCommPercent ? `${c.salesCommPercent}%` : '4%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.salesCommAmount)}
                            </td>
                          </tr>

                          {/* 7. ดอก */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ดอก
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.interestPercent ? `${c.interestPercent}%` : '7%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.interestAmount)}
                            </td>
                          </tr>

                          {/* 8. ภาษี */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ภาษี
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.taxPercent ? `${c.taxPercent}%` : '20%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.taxAmount)}
                            </td>
                          </tr>

                          {/* 9. Retention */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              Retention
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.retentionPercent ? `${c.retentionPercent}%` : '5%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.retentionAmount)}
                            </td>
                          </tr>

                          {/* 10. กำไรก่อนภาษี (Highlight Total Row) */}
                          <tr className="bg-slate-950 border-t-2 border-slate-700 font-black">
                            <td className="p-2.5 px-3 text-left font-sans text-white border-r border-slate-700">
                              กำไรก่อนภาษี
                            </td>
                            <td className="p-2.5 px-2.5 text-center border-r border-slate-700 text-emerald-400 text-sm">
                              {fmtPercent(c.netProfitPercent)}
                            </td>
                            <td className="p-2.5 px-3 text-right text-emerald-400 text-sm">
                              {fmtExcelNum(c.netProfitAmount)}
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>

                    {/* Card Footer: Status & Edit Button */}
                    <div className="p-2.5 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.statusColor || 'bg-slate-800 text-slate-300'}`}>
                        {c.statusText || 'อนุมัติ'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onEditCalc(item.calc)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white rounded-lg text-xs font-bold border border-amber-500/40 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>✏️ คำนวณ</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📋 VIEW 2: LIST TABLE VIEW (มุมมองแบบตารางสรุปเดิม) */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm">📋 รายการ Cost Sheet ประเมินต้นทุนแบบตาราง</h3>
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
                        {formatCurrency(item.computed.saleInVat)}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-400">
                        {formatCurrency(item.computed.costInVat)}
                      </td>
                      <td className="p-3 text-right font-mono text-indigo-300">
                        {formatCurrency(item.computed.dfAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-emerald-400 text-sm">
                        {formatCurrency(item.computed.netProfitAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-indigo-300">
                        {(Number(item.computed?.netProfitPercent) || 0).toFixed(1)}%
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
      )}

    </div>
  );
}
