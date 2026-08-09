// ----------------------------------------------------
// Financial Math Helper for Cost & Minimum Selling Price Sheet
// ----------------------------------------------------
function computeCostSheet(calc) {
  const saleInVat = Number(calc.sellingPriceInVat) || 0;
  const saleExVat = saleInVat / 1.07;
  const costInVat = Number(calc.costInVat) || 0;
  const costExVat = costInVat / 1.07;
  const costExVatPercent = saleExVat > 0 ? (costExVat / saleExVat) * 100 : 0;

  // DF Fee
  let dfAmount = 0;
  let dfPercent = 0;
  if (calc.dfType === 'percent') {
    dfPercent = Number(calc.dfValue) || 0;
    dfAmount = saleExVat * (dfPercent / 100);
  } else {
    dfAmount = Number(calc.dfValue) || 0;
    dfPercent = saleExVat > 0 ? (dfAmount / saleExVat) * 100 : 0;
  }

  // Sales Comm (Default 2% of Sale Ex VAT)
  const salesCommPercent = calc.salesCommPercent !== undefined && calc.salesCommPercent !== '' ? Number(calc.salesCommPercent) : 2;
  const salesCommAmount = saleExVat * (salesCommPercent / 100);

  // Interest (Default 7% of Cost In VAT)
  const interestPercent = calc.interestPercent !== undefined && calc.interestPercent !== '' ? Number(calc.interestPercent) : 7;
  const interestAmount = costInVat * (interestPercent / 100);

  // Tax (Default 20% of Margin Ex VAT)
  const taxPercent = calc.taxPercent !== undefined && calc.taxPercent !== '' ? Number(calc.taxPercent) : 20;
  const marginExVat = Math.max(0, saleExVat - costExVat);
  const taxAmount = marginExVat * (taxPercent / 100);

  // Retention (Default 5% of Sale Ex VAT)
  const retentionPercent = calc.retentionPercent !== undefined && calc.retentionPercent !== '' ? Number(calc.retentionPercent) : 5;
  const retentionAmount = saleExVat * (retentionPercent / 100);

  // Net Profit before Tax
  const netProfitAmount = saleExVat - costExVat - dfAmount - salesCommAmount - interestAmount - taxAmount - retentionAmount;
  const netProfitPercent = saleExVat > 0 ? (netProfitAmount / saleExVat) * 100 : 0;

  // Status Rules
  let statusKey = 'approved';
  let statusText = '🎉 อนุมัติให้ทำได้';
  let statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let statusBadgeBg = 'bg-emerald-600';

  if (netProfitPercent < 10) {
    statusKey = 'danger';
    statusText = '🛑 ให้คุยกะคุณตู้';
    statusColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    statusBadgeBg = 'bg-rose-600';
  } else if (netProfitPercent <= 15) {
    statusKey = 'warning';
    statusText = '⚠️ ให้รีวิวอีกที';
    statusColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    statusBadgeBg = 'bg-amber-600';
  }

  return {
    saleInVat,
    saleExVat,
    costInVat,
    costExVat,
    costExVatPercent,
    dfAmount,
    dfPercent,
    salesCommPercent,
    salesCommAmount,
    interestPercent,
    interestAmount,
    taxPercent,
    taxAmount,
    retentionPercent,
    retentionAmount,
    netProfitAmount,
    netProfitPercent,
    statusKey,
    statusText,
    statusColor,
    statusBadgeBg
  };
}

// ----------------------------------------------------
// Cost Calculation View Component
// ----------------------------------------------------
function CostCalculationView({ costCalculations, projects, members, onOpenNewCalc, onEditCalc, onDeleteCalc }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine projects from Sales Kanban with calculation records
  const calculatedItems = useMemo(() => {
    return projects.map(proj => {
      const existingCalc = costCalculations.find(c => c.projectId === proj.id || (c.projectName && c.projectName.includes(proj.hospitalName)));
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
          projectName: `${proj.hospitalName} - ${proj.title}`,
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

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = calculatedItems.length;
    const approved = calculatedItems.filter(i => i.computed.netProfitPercent > 15).length;
    const warning = calculatedItems.filter(i => i.computed.netProfitPercent >= 10 && i.computed.netProfitPercent <= 15).length;
    const danger = calculatedItems.filter(i => i.computed.netProfitPercent < 10).length;
    const missingDf = calculatedItems.filter(i => i.calc.dfMissing).length;
    return { total, approved, warning, danger, missingDf };
  }, [calculatedItems]);

  const filteredItems = useMemo(() => {
    return calculatedItems.filter(item => {
      if (filterStatus === 'approved' && item.computed.statusKey !== 'approved') return false;
      if (filterStatus === 'warning' && item.computed.statusKey !== 'warning') return false;
      if (filterStatus === 'danger' && item.computed.statusKey !== 'danger') return false;
      if (filterStatus === 'missing_df' && !item.calc.dfMissing) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchHosp = item.proj.hospitalName ? item.proj.hospitalName.toLowerCase().includes(q) : false;
        const matchTitle = item.proj.title ? item.proj.title.toLowerCase().includes(q) : false;
        const matchSales = item.proj.assignee ? item.proj.assignee.toLowerCase().includes(q) : false;
        return matchHosp || matchTitle || matchSales;
      }
      return true;
    });
  }, [calculatedItems, filterStatus, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
              FINANCIAL CALCULATOR & APPROVAL
            </span>
            <h2 className="text-xl font-extrabold text-white">ตารางคำนวณราคาต้นทุนและราคาขายต่ำสุด</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ดึงข้อมูลอัตโนมัติจาก Sales Kanban พร้อมวิเคราะห์กำไรสุทธิ ค่า DF คอมมิชชั่น ดอกเบี้ย ภาษี Retention และเกณฑ์อนุมัติ (>15% เขียว, 10-15% เหลือง, &lt;10% แดง คุณตู้)
          </p>
        </div>

        <button
          onClick={() => onOpenNewCalc(null)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex-shrink-0"
        >
          <span className="text-base font-black">+</span>
          <span>สร้างสเปรดชีตคำนวณต้นทุนใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">โครงการทั้งหมดในระบบ</div>
          <div className="text-2xl font-black font-mono text-white">{metrics.total}</div>
        </div>

        <div className="bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-800/40 space-y-1">
          <div className="text-[11px] text-emerald-300 font-bold flex items-center justify-between">
            <span>🎉 อนุมัติ (&gt;15%)</span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{metrics.approved}</div>
        </div>

        <div className="bg-amber-950/30 p-3.5 rounded-2xl border border-amber-800/40 space-y-1">
          <div className="text-[11px] text-amber-300 font-bold flex items-center justify-between">
            <span>⚠️ ให้รีวิว (10-15%)</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">{metrics.warning}</div>
        </div>

        <div className="bg-rose-950/30 p-3.5 rounded-2xl border border-rose-800/40 space-y-1">
          <div className="text-[11px] text-rose-300 font-bold flex items-center justify-between">
            <span>🛑 คุยกะคุณตู้ (&lt;10%)</span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{metrics.danger}</div>
        </div>

        <div className="bg-purple-950/30 p-3.5 rounded-2xl border border-purple-800/40 space-y-1">
          <div className="text-[11px] text-purple-300 font-bold flex items-center justify-between">
            <span>⚠️ เซลส์ไม่ได้ใส่ DF</span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">{metrics.missingDf}</div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-medium mr-1">ตัวกรอง:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            ทั้งหมด ({metrics.total})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            🎉 อนุมัติ ({metrics.approved})
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${filterStatus === 'warning' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            ⚠️ ให้รีวิว ({metrics.warning})
          </button>
          <button
            onClick={() => setFilterStatus('danger')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${filterStatus === 'danger' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            🛑 คุยกะคุณตู้ ({metrics.danger})
          </button>
          <button
            onClick={() => setFilterStatus('missing_df')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${filterStatus === 'missing_df' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            ⚠️ ไม่ได้ใส่ DF ({metrics.missingDf})
          </button>
        </div>

        <input
          type="text"
          placeholder="ค้นหาชื่อ รพ. / โครงการ / เซลส์..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
        />
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">โครงการ / โรงพยาบาล</th>
                <th className="p-3.5">เซลส์ผู้ดูแล</th>
                <th className="p-3.5 text-right">ราคาขาย Ex VAT</th>
                <th className="p-3.5 text-right">ทุน Ex VAT (% ทุน)</th>
                <th className="p-3.5 text-center">ค่า DF (Doctor Fee)</th>
                <th className="p-3.5 text-right">กำไรก่อนภาษี</th>
                <th className="p-3.5 text-center">เกณฑ์การอนุมัติ</th>
                <th className="p-3.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 font-sans">
                    ไม่พบรายการโครงการตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const { proj, calc, computed, hasCalc } = item;
                  return (
                    <tr key={proj.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Hospital & Title */}
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <span className="text-emerald-400">🏥</span>
                          <span>{proj.hospitalName}</span>
                        </div>
                        <div className="text-slate-400 text-xs line-clamp-1">{proj.title}</div>
                        {proj.productName && (
                          <div className="text-[10.5px] text-emerald-300/90 font-mono">📦 {proj.productName}</div>
                        )}
                      </td>

                      {/* Sales Person */}
                      <td className="p-3.5 font-sans text-slate-300">
                        <span className="flex items-center gap-1">
                          <span>👤</span> {proj.assignee}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="p-3.5 text-right">
                        <div className="font-bold text-amber-400 text-sm">
                          {formatCurrency(computed.saleInVat)}
                        </div>
                        <div className="text-[10.5px] text-slate-400">
                          Ex VAT: {formatCurrency(computed.saleExVat)}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="p-3.5 text-right">
                        <div className="font-bold text-slate-200">
                          {formatCurrency(computed.costInVat)}
                        </div>
                        <div className="text-[10.5px] text-amber-300">
                          Ex VAT: {formatCurrency(computed.costExVat)} ({computed.costExVatPercent.toFixed(1)}%)
                        </div>
                      </td>

                      {/* DF Fee */}
                      <td className="p-3.5 text-center font-sans">
                        {calc.dfMissing ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold animate-pulse">
                            ⚠️ ไม่ได้ใส่มา
                          </span>
                        ) : (
                          <div className="font-bold text-purple-300 font-mono">
                            {formatCurrency(computed.dfAmount)} ({computed.dfPercent.toFixed(1)}%)
                          </div>
                        )}
                      </td>

                      {/* Net Profit */}
                      <td className="p-3.5 text-right">
                        <div className={`font-extrabold text-sm ${computed.netProfitAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(computed.netProfitAmount)}
                        </div>
                        <div className={`text-xs font-bold ${computed.netProfitPercent > 15 ? 'text-emerald-300' : computed.netProfitPercent >= 10 ? 'text-amber-300' : 'text-rose-300'}`}>
                          {computed.netProfitPercent.toFixed(2)}%
                        </div>
                      </td>

                      {/* Approval Status Badge */}
                      <td className="p-3.5 text-center font-sans">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border inline-block ${computed.statusColor}`}>
                          {computed.statusText}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-center font-sans space-x-1">
                        <button
                          onClick={() => onEditCalc(calc)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/40 transition-colors shadow-sm"
                        >
                          🧮 {hasCalc ? 'แก้ไขสเปรดชีต' : 'คำนวณต้นทุน'}
                        </button>
                        {hasCalc && (
                          <button
                            onClick={() => onDeleteCalc(calc.id)}
                            className="px-2 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-xl border border-rose-800/50"
                            title="ลบสเปรดชีต"
                          >
                            🗑️
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// Cost Sheet Modal Component (Excel Replica)
// ----------------------------------------------------
function CostSheetModal({ calc, projects, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (calc) return { ...calc };
    const firstProj = projects[0] || {};
    let parsedDf = 0;
    let dfMissing = true;
    if (firstProj.dfAmount) {
      dfMissing = false;
      const numStr = String(firstProj.dfAmount).replace(/[^0-9.]/g, '');
      parsedDf = Number(numStr) || 0;
    }
    return {
      projectId: firstProj.id || '',
      projectName: firstProj.hospitalName ? `${firstProj.hospitalName} - ${firstProj.title}` : '',
      date: new Date().toISOString().split('T')[0],
      sellingPriceInVat: firstProj.budget || 4500000,
      costInVat: 3240000,
      dfType: 'amount',
      dfValue: parsedDf,
      dfMissing: dfMissing,
      salesCommPercent: 2.0,
      interestPercent: 7.0,
      taxPercent: 20.0,
      retentionPercent: 5.0,
      note: ''
    };
  });

  const handleProjectSelect = (projId) => {
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      let parsedDf = 0;
      let dfMissing = true;
      if (proj.dfAmount) {
        dfMissing = false;
        const numStr = String(proj.dfAmount).replace(/[^0-9.]/g, '');
        parsedDf = Number(numStr) || 0;
      }
      setFormData(prev => ({
        ...prev,
        projectId: projId,
        projectName: `${proj.hospitalName} - ${proj.title}`,
        sellingPriceInVat: proj.budget || prev.sellingPriceInVat,
        dfValue: parsedDf,
        dfMissing: dfMissing
      }));
    }
  };

  const computed = computeCostSheet(formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sellingPriceInVat || !formData.costInVat) {
      alert('กรุณากรอกราคาขายและราคาต้นทุน');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-lg">
              🧮
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">คำนวณราคาต้นทุนและราคาขายต่ำสุด</h3>
              <p className="text-xs text-slate-400">ใบวิเคราะห์ผลกำไรทางการเงินและเกณฑ์อนุมัติ (Financial Viability Sheet)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Project Selector & Date Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-300">เลือกโครงการจาก Sales Kanban <span className="text-rose-400">*</span></label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-semibold outline-none focus:border-emerald-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    🏥 {p.hospitalName} - {p.title} (โดย {p.assignee})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">วันที่คำนวณ</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          {/* Excel Calculation Table Replica */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-1/3 border-r border-slate-800">รายการ</th>
                  <th className="p-3 w-1/4 text-center border-r border-slate-800">%</th>
                  <th className="p-3 text-right">ราคา (บาท THB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                
                {/* 1. ราคาขาย In VAT */}
                <tr className="bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors">
                  <td className="p-3 font-bold text-slate-100 font-sans border-r border-slate-800">
                    ราคาขาย In vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      required
                      value={formData.sellingPriceInVat}
                      onChange={(e) => setFormData({ ...formData, sellingPriceInVat: Number(e.target.value) })}
                      className="w-full max-w-[200px] bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 2. ราคาขาย Ex VAT */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ราคาขาย Ex vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.saleExVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 3. ทุน In VAT */}
                <tr className="bg-amber-950/20 hover:bg-amber-950/40 transition-colors">
                  <td className="p-3 font-bold text-slate-100 font-sans border-r border-slate-800">
                    ทุน In vat <span className="text-rose-400">*</span>
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      required
                      placeholder="ใส่ราคาต้นทุนรวม VAT"
                      value={formData.costInVat}
                      onChange={(e) => setFormData({ ...formData, costInVat: Number(e.target.value) })}
                      className="w-full max-w-[200px] bg-slate-900 border border-amber-500/50 text-amber-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 4. ทุน Ex VAT */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ทุน Ex vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 font-bold text-amber-400">
                    {computed.costExVatPercent.toFixed(2)}%
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.costExVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 5. DF */}
                <tr className="bg-purple-950/20 hover:bg-purple-950/40 transition-colors">
                  <td className="p-3 font-bold text-purple-200 font-sans border-r border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>df (Doctor Fee)</span>
                      {formData.dfMissing && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-normal">
                          ⚠️ เซลส์ไม่ได้ใส่มา (Admin เติมเอง)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.dfType === 'percent' ? formData.dfValue : computed.dfPercent.toFixed(2)}
                        onChange={(e) => setFormData({ ...formData, dfType: 'percent', dfValue: Number(e.target.value), dfMissing: false })}
                        className="w-16 bg-slate-900 border border-purple-500/50 text-purple-300 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      value={formData.dfType === 'amount' ? formData.dfValue : Math.round(computed.dfAmount)}
                      onChange={(e) => setFormData({ ...formData, dfType: 'amount', dfValue: Number(e.target.value), dfMissing: false })}
                      className="w-full max-w-[200px] bg-slate-900 border border-purple-500/50 text-purple-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 6. Sales Commission */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    Sales (คอมเซลส์ 2% ราคาขาย Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.salesCommPercent}
                        onChange={(e) => setFormData({ ...formData, salesCommPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.salesCommAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 7. ดอก (Interest) */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ดอก (ดอกเบี้ยเงินทุน 7% ของทุน In VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.interestPercent}
                        onChange={(e) => setFormData({ ...formData, interestPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 8. ภาษี (Corporate Tax) */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ภาษี (20% ของกำไรขั้นต้น Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxPercent}
                        onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 9. Retention */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    Retention (ประกันผลงาน 5% ราคาขาย Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.retentionPercent}
                        onChange={(e) => setFormData({ ...formData, retentionPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.retentionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 10. กำไรก่อนภาษี / Net Profit Summary Row */}
                <tr className="bg-slate-950 border-t-2 border-slate-700 text-sm font-black">
                  <td className="p-3.5 text-white font-sans border-r border-slate-800">
                    กำไรสุทธิก่อนภาษี (Net Profit)
                  </td>
                  <td className={`p-3.5 text-center border-r border-slate-800 text-base font-extrabold ${
                    computed.netProfitPercent > 15 ? 'text-emerald-400' : computed.netProfitPercent >= 10 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {computed.netProfitPercent.toFixed(2)}%
                  </td>
                  <td className={`p-3.5 text-right text-base font-extrabold ${
                    computed.netProfitAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {computed.netProfitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Profitability Status & Approval Rule Indicator */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${computed.statusColor}`}>
            <div className="space-y-0.5">
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>ผลการประเมินทางการเงิน:</span>
                <span className={`px-3 py-1 rounded-xl text-white text-xs font-bold ${computed.statusBadgeBg}`}>
                  {computed.statusText}
                </span>
              </div>
              <p className="text-xs opacity-90 font-sans">
                {computed.statusKey === 'approved' && 'อัตรากำไรสุทธิสูงกว่า 15% อยู่ในเกณฑ์อนุมัติให้ดำเนินการต่อได้ทันที'}
                {computed.statusKey === 'warning' && 'อัตรากำไรสุทธิระหว่าง 10% - 15% อยู่ในเกณฑ์ให้ทบทวนและตรวจสอบเงื่อนไขเพิ่มเติม'}
                {computed.statusKey === 'danger' && 'อัตรากำไรสุทธิต่ำกว่า 10% อยู่ในเกณฑ์ไม่อนุมัติโดยอัตโนมัติ ต้องเข้าหารือและขออนุมัติพิเศษจากคุณตู้'}
              </p>
            </div>

            <div className="text-right font-mono text-xs flex-shrink-0 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div>&gt;15%: อนุมัติ (เขียว)</div>
              <div>10-15%: รีวิว (เหลือง)</div>
              <div>&lt;10%: คุณตู้ (แดง)</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700"
            >
              🖨️ พิมพ์ใบคำนวณต้นทุน
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">ยกเลิก</button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30">
                💾 บันทึกสเปรดชีตต้นทุน
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

// Render React App into Root
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
