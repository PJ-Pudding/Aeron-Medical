// MODULE: mod05_calendar/DemoReportModal.js

function DemoReportModal({ isOpen, onClose, demoBookings = [], products = [], projects = [], members = [] }) {
  if (!isOpen) return null;

  const [filterProduct, setFilterProduct] = useState('all');
  const [filterSales, setFilterSales] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [activeTab, setActiveTab] = useState('journey'); // 'journey' | 'machine_stats'

  // Calculate days difference
  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  // Enriched bookings data
  const enrichedBookings = useMemo(() => {
    return (demoBookings || []).map(b => {
      const prod = products.find(p => p.id === b.productId);
      const proj = projects.find(p => p.id === b.projectId || (p.hospital && p.hospital.includes(b.hospitalName)));
      const days = calculateDays(b.startDate, b.endDate);
      const expense = Number(b.expenseAmount) || Number(b.demoCost) || 0;
      
      // Auto outcome if linked to project status
      let outcome = b.outcomeStatus || 'กำลังทดสอบ / รอผล';
      if (!b.outcomeStatus && proj) {
        if (['won', 'closed_won', 'delivered'].includes(proj.status)) outcome = 'ชนะประมูล / ปิดการขายสำเร็จ';
        else if (['lost', 'closed_lost', 'cancelled'].includes(proj.status)) outcome = 'แพ้ประมูล / ปิดไม่สำเร็จ';
      }

      return {
        ...b,
        productName: b.productName || (prod ? prod.name : 'เครื่องมือแพทย์'),
        productCategory: b.productCategory || (prod ? prod.category : 'อุปกรณ์แพทย์'),
        demoSerial: b.demoSerial || (prod && prod.demoSerialNumbers ? prod.demoSerialNumbers[0] : 'DEMO-SN-01'),
        days,
        expense,
        outcome,
        projectValue: proj ? Number(proj.budget || proj.value || 0) : 0,
        linkedProject: proj
      };
    });
  }, [demoBookings, products, projects]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return enrichedBookings.filter(b => {
      if (filterProduct !== 'all' && b.productId !== filterProduct) return false;
      if (filterSales !== 'all' && b.salesPerson !== filterSales) return false;
      if (filterOutcome !== 'all' && b.outcome !== filterOutcome) return false;
      if (dateStart && b.startDate < dateStart) return false;
      if (dateEnd && b.endDate > dateEnd) return false;
      return true;
    });
  }, [enrichedBookings, filterProduct, filterSales, filterOutcome, dateStart, dateEnd]);

  // Overall KPI Analytics
  const kpis = useMemo(() => {
    const totalDemos = filteredData.length;
    const totalDays = filteredData.reduce((sum, b) => sum + b.days, 0);
    const avgDays = totalDemos > 0 ? (totalDays / totalDemos).toFixed(1) : 0;
    const totalExpenses = filteredData.reduce((sum, b) => sum + b.expense, 0);
    
    const wonDemos = filteredData.filter(b => b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ'))).length;
    const winRate = totalDemos > 0 ? ((wonDemos / totalDemos) * 100).toFixed(1) : 0;
    
    const wonValue = filteredData
      .filter(b => b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ')))
      .reduce((sum, b) => sum + b.projectValue, 0);

    return { totalDemos, totalDays, avgDays, totalExpenses, wonDemos, winRate, wonValue };
  }, [filteredData]);

  // Machine Stats Grouping
  const machineStats = useMemo(() => {
    const map = {};
    filteredData.forEach(b => {
      const key = (b.productName || '') + '__' + (b.demoSerial || '');
      if (!map[key]) {
        map[key] = {
          productName: b.productName,
          serial: b.demoSerial,
          count: 0,
          totalDays: 0,
          totalExpense: 0,
          wonCount: 0,
          lastHospital: b.hospitalName,
          lastDate: b.endDate
        };
      }
      map[key].count += 1;
      map[key].totalDays += b.days;
      map[key].totalExpense += b.expense;
      if (b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ'))) {
        map[key].wonCount += 1;
      }
      if (b.endDate > map[key].lastDate) {
        map[key].lastDate = b.endDate;
        map[key].lastHospital = b.hospitalName;
      }
    });
    return Object.values(map);
  }, [filteredData]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ลำดับ', 'โรงพยาบาล/สถานที่เดโม่', 'รุ่นเครื่อง', 'Serial Number (S/N)', 
      'ผู้รับผิดชอบเดโม่', 'วันเริ่มเดโม่', 'วันสิ้นสุด', 'จำนวนวันที่วางเครื่อง (วัน)', 
      'ค่าใช้จ่ายเดโม่ (บาท)', 'ผลลัพธ์การเดโม่', 'หมายเหตุ'
    ];

    const rows = filteredData.map((b, idx) => [
      idx + 1,
      '"' + (b.hospitalName || '').replace(/"/g, '""') + '"',
      '"' + (b.productName || '').replace(/"/g, '""') + '"',
      '"' + (b.demoSerial || '').replace(/"/g, '""') + '"',
      '"' + (b.salesPerson || '').replace(/"/g, '""') + '"',
      b.startDate || '',
      b.endDate || '',
      b.days,
      b.expense,
      '"' + (b.outcome || '').replace(/"/g, '""') + '"',
      '"' + (b.note || '').replace(/"/g, '""') + '"'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AERON_Demo_Analytics_Report_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[850] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">รายงานประวัติ & สถิติการ Demo (Demo Analytics Report)</h3>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  AERON MEDICAL
                </span>
              </div>
              <p className="text-xs text-slate-400">สรุปการเดินทางของแต่ละเครื่อง, ระยะเวลาวางเครื่อง, ผู้ดูแล, ค่าใช้จ่าย และอัตรา Win Rate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>📥 ส่งออก Excel (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              ✕ ปิด
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* Top 5 KPI Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">🧪 จำนวนการเดโม่ทั้งหมด</span>
              <div className="text-xl font-extrabold text-purple-300 font-mono">{kpis.totalDemos} <span className="text-xs font-sans text-slate-400 font-normal">ครั้ง</span></div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">⏳ วันเฉลี่ยที่วางเครื่อง</span>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">{kpis.avgDays} <span className="text-xs font-sans text-slate-400 font-normal">วัน/ที่</span></div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">💸 ค่าใช้จ่ายเดโม่รวม</span>
              <div className="text-xl font-extrabold text-amber-300 font-mono">{formatCurrency(kpis.totalExpenses)}</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">🎯 อัตราปิดการขาย (Win Rate)</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">{kpis.winRate}% <span className="text-xs font-sans text-emerald-500 font-normal">({kpis.wonDemos}/{kpis.totalDemos})</span></div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium">💰 มูลค่างานที่ปิดได้</span>
              <div className="text-xl font-extrabold text-emerald-300 font-mono">{formatCurrency(kpis.wonValue)}</div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <span>🔍 ตัวกรอง:</span>
            </div>

            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none"
            >
              <option value="all">กรองทุกรุ่นสินค้า</option>
              {(products || []).map(p => (
                <option key={p.id} value={p.id}>📦 {p.name}</option>
              ))}
            </select>

            <select
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none"
            >
              <option value="all">กรองทุกพนักงานขาย</option>
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>👤 {m.name}</option>
              ))}
            </select>

            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none"
            >
              <option value="all">กรองทุกสถานะผลลัพธ์</option>
              <option value="กำลังทดสอบ / รอผล">⏳ กำลังทดสอบ / รอผล</option>
              <option value="ชนะประมูล / ปิดการขายสำเร็จ">🏆 ชนะประมูล / ปิดการขายสำเร็จ</option>
              <option value="แพ้ประมูล / ปิดไม่สำเร็จ">❌ แพ้ประมูล / ปิดไม่สำเร็จ</option>
            </select>

            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-1.5 px-2 text-slate-200 outline-none font-mono text-[11px]"
                title="ตั้งแต่วันที่"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-1.5 px-2 text-slate-200 outline-none font-mono text-[11px]"
                title="ถึงวันที่"
              />
            </div>

            {(filterProduct !== 'all' || filterSales !== 'all' || filterOutcome !== 'all' || dateStart || dateEnd) && (
              <button
                onClick={() => { setFilterProduct('all'); setFilterSales('all'); setFilterOutcome('all'); setDateStart(''); setDateEnd(''); }}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline font-semibold ml-auto"
              >
                ✕ ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex border-b border-slate-800 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('journey')}
              className={'pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ' + (activeTab === 'journey' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200')}
            >
              <span>🏥 1. รายละเอียดประวัติการเดินทางของเครื่อง (Journey Log)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">{filteredData.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('machine_stats')}
              className={'pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ' + (activeTab === 'machine_stats' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200')}
            >
              <span>📦 2. สรุปสถิติ & ประสิทธิภาพรายเครื่อง (Machine Performance)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">{machineStats.length}</span>
            </button>
          </div>

          {/* Tab 1: Detailed Journey Table */}
          {activeTab === 'journey' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10.5px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 px-3 text-center w-12 border-r border-slate-800">ลำดับ</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 min-w-[160px]">โรงพยาบาล / หน่วยงาน</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 min-w-[160px]">รุ่นเครื่อง & หมายเลข S/N</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 w-32">ผู้รับผิดชอบ</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 text-center w-28">ช่วงวันที่เดโม่</th>
                    <th className="p-2.5 px-2 text-center w-20 border-r border-slate-800">วางไว้ (วัน)</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 text-right w-28">ค่าใช้จ่ายเดโม่</th>
                    <th className="p-2.5 px-3 text-center w-36">ผลลัพธ์ / สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/60 font-sans">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 italic">
                        ไม่พบข้อมูลประวัติการ Demo ตามตัวกรองที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80">
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>🏥</span> <span>{b.hospitalName}</span>
                          </div>
                          {b.note && <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">📝 {b.note}</div>}
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80">
                          <div className="font-semibold text-purple-200">{b.productName}</div>
                          <div className="font-mono text-[10.5px] text-amber-300 font-bold mt-0.5">🔖 S/N: {b.demoSerial}</div>
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80 text-slate-300 font-medium">
                          👤 {b.salesPerson}
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80 font-mono text-[11px] text-slate-300 text-center">
                          <div>{b.startDate}</div>
                          <div className="text-[10px] text-slate-500">ถึง {b.endDate}</div>
                        </td>
                        <td className="p-2.5 px-2 border-r border-slate-800/80 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold text-xs">
                            {b.days} วัน
                          </span>
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80 text-right font-mono font-bold text-amber-300">
                          {b.expense > 0 ? formatCurrency(b.expense) : <span className="text-slate-600 font-normal">-</span>}
                        </td>
                        <td className="p-2.5 px-3 text-center">
                          {b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ')) ? (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-bold inline-flex items-center gap-1">
                              <span>🏆</span> <span>ชนะประมูล/ปิดยอด</span>
                            </span>
                          ) : b.outcome && b.outcome.includes('แพ้') ? (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10.5px] font-bold inline-flex items-center gap-1">
                              <span>❌</span> <span>ไม่ผ่าน/แพ้ประมูล</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10.5px] font-semibold inline-flex items-center gap-1">
                              <span>⏳</span> <span>กำลังทดสอบ/รอผล</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Machine Utilization & Performance */}
          {activeTab === 'machine_stats' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10.5px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 px-3 text-center w-12 border-r border-slate-800">ลำดับ</th>
                    <th className="p-2.5 px-3 border-r border-slate-800">รุ่นเครื่องสาธิต</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 w-36">Serial Number</th>
                    <th className="p-2.5 px-2 text-center w-24 border-r border-slate-800">จำนวนครั้งเดโม่</th>
                    <th className="p-2.5 px-2 text-center w-24 border-r border-slate-800">รวมวันที่ใช้งาน</th>
                    <th className="p-2.5 px-3 text-right w-32 border-r border-slate-800">ค่าใช้จ่ายสะสม</th>
                    <th className="p-2.5 px-3 text-center w-28 border-r border-slate-800">Win Rate</th>
                    <th className="p-2.5 px-3 min-w-[160px]">สถานที่ล่าสุดที่ไป</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/60 font-sans">
                  {machineStats.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 italic">
                        ไม่มีข้อมูลเครื่องสาธิต
                      </td>
                    </tr>
                  ) : (
                    machineStats.map((m, idx) => {
                      const winPct = m.count > 0 ? ((m.wonCount / m.count) * 100).toFixed(0) : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">{idx + 1}</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 font-bold text-white">{m.productName}</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 font-mono font-bold text-amber-300">{m.serial}</td>
                          <td className="p-2.5 px-2 border-r border-slate-800/80 text-center font-mono font-bold text-purple-300">{m.count} ครั้ง</td>
                          <td className="p-2.5 px-2 border-r border-slate-800/80 text-center font-mono font-bold text-cyan-300">{m.totalDays} วัน</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 text-right font-mono font-bold text-amber-300">{formatCurrency(m.totalExpense)}</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-xs">
                              {winPct}% ({m.wonCount}/{m.count})
                            </span>
                          </td>
                          <td className="p-2.5 px-3 text-slate-300">
                            <div className="font-semibold">{m.lastHospital}</div>
                            <div className="text-[10px] text-slate-500">สิ้นสุด: {m.lastDate}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
