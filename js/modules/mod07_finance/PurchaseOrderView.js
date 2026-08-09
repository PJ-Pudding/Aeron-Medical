// MODULE: mod07_finance/PurchaseOrderView.js

function PurchaseOrderView({ purchaseOrders = [], projects = [], products = [], onOpenNewPO, onEditPO, onDeletePO }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterVendor, setFilterVendor] = useState('all');
  const [searchPO, setSearchPO] = useState('');
  const [previewPO, setPreviewPO] = useState(null);

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // 1. Calculate Won Projects that don't have a PO issued yet
  const pendingWonProjects = useMemo(() => {
    const wonStages = ['stage_won', 'stage_ordering', 'stage_delivery'];
    return (projects || []).filter(p => {
      if (!wonStages.includes(p.status)) return false;
      const hasPO = (purchaseOrders || []).some(po => po.projectId === p.id);
      return !hasPO;
    });
  }, [projects, purchaseOrders]);

  // 2. Filtered Pending Won Projects for Table
  const filteredPendingProjects = useMemo(() => {
    return pendingWonProjects.filter(p => {
      const yr = p.procurementDate ? new Date(p.procurementDate).getFullYear() : (p.createdDate ? new Date(p.createdDate).getFullYear() : 2026);
      if (selectedYear !== 'all' && Number(yr) !== Number(selectedYear)) return false;
      
      const pDate = p.procurementDate || p.createdDate || '';
      if (pDate) {
        if (startDate && pDate < startDate) return false;
        if (endDate && pDate > endDate) return false;
      }

      if (searchPO.trim()) {
        const term = searchPO.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(term);
        const matchHosp = (p.hospitalName || '').toLowerCase().includes(term);
        const matchAssignee = (p.assignee || '').toLowerCase().includes(term);
        const matchProd = (p.productName || '').toLowerCase().includes(term);
        return matchTitle || matchHosp || matchAssignee || matchProd;
      }
      return true;
    });
  }, [pendingWonProjects, selectedYear, startDate, endDate, searchPO]);

  // 3. Available Years
  const availableYears = useMemo(() => {
    const years = new Set((purchaseOrders || []).map(p => p.year || new Date(p.poDate).getFullYear()));
    years.add(2026);
    years.add(2025);
    return Array.from(years).sort((a, b) => b - a);
  }, [purchaseOrders]);

  // 4. Filtered POs by Year, Vendor, Date Range and Search
  const filteredPOs = useMemo(() => {
    return (purchaseOrders || []).filter(po => {
      const poYear = po.year || new Date(po.poDate).getFullYear();
      if (selectedYear !== 'all' && Number(poYear) !== Number(selectedYear)) return false;
      if (filterVendor !== 'all' && po.vendorId !== filterVendor && po.vendorName !== filterVendor) return false;

      if (po.poDate) {
        if (startDate && po.poDate < startDate) return false;
        if (endDate && po.poDate > endDate) return false;
      }

      if (searchPO.trim()) {
        const term = searchPO.toLowerCase();
        const matchNo = po.poNumber.toLowerCase().includes(term);
        const matchVendor = po.vendorName.toLowerCase().includes(term);
        const matchHosp = (po.hospitalName || '').toLowerCase().includes(term);
        const matchProd = (po.productName || '').toLowerCase().includes(term);
        return matchNo || matchVendor || matchHosp || matchProd;
      }
      return true;
    });
  }, [purchaseOrders, selectedYear, filterVendor, startDate, endDate, searchPO]);

  // 5. Summary Metrics
  const totalSpentTHB = useMemo(() => {
    return filteredPOs.reduce((sum, po) => sum + (Number(po.totalAmountTHB) || 0), 0);
  }, [filteredPOs]);

  const uniqueVendorsCount = useMemo(() => {
    return new Set(filteredPOs.map(po => po.vendorName)).size;
  }, [filteredPOs]);

  const receivedCount = useMemo(() => {
    return filteredPOs.filter(po => po.status === 'รับสินค้าแล้ว' || po.status === 'สินค้าถึงไทย').length;
  }, [filteredPOs]);

  // 6. Vendor Spend Breakdown
  const vendorBreakdown = useMemo(() => {
    const map = {};
    filteredPOs.forEach(po => {
      const vName = po.vendorName || 'ไม่ระบุ Vendor';
      if (!map[vName]) {
        map[vName] = {
          name: vName,
          country: po.vendorCountry || '',
          totalTHB: 0,
          ordersCount: 0,
          products: {},
          statuses: {}
        };
      }
      map[vName].totalTHB += Number(po.totalAmountTHB) || 0;
      map[vName].ordersCount += 1;
      
      const pName = po.productName || 'สินค้าอื่นๆ';
      if (!map[vName].products[pName]) map[vName].products[pName] = { name: pName, qty: 0, amountTHB: 0 };
      map[vName].products[pName].qty += Number(po.quantity) || 1;
      map[vName].products[pName].amountTHB += Number(po.totalAmountTHB) || 0;

      const st = po.status || 'ร่าง PO';
      map[vName].statuses[st] = (map[vName].statuses[st] || 0) + 1;
    });

    return Object.values(map).sort((a, b) => b.totalTHB - a.totalTHB);
  }, [filteredPOs]);

  const statusColors = {
    'ร่าง PO': 'bg-slate-700/50 text-slate-300 border-slate-600',
    'รออนุมัติ': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'อนุมัติแล้ว': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'ส่ง PO ให้ Vendor': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Vendor ยืนยันรับ PO': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'รอผลิต / รอของ': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'สินค้าถึงไทย': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'รับสินค้าแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400">
            🛒
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>การสั่งสินค้า Vendor (Admin Purchase Orders)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                หลังชนะงานประมูล
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ระบบออกใบสั่งซื้อ (PO) สรุปยอดซื้อสินค้าแยกตาม Vendor ผู้ผลิต และติดตามสถานะการส่งมอบสินค้า
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewPO(null)}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ ออกใบสั่งซื้อ PO ใหม่</span>
        </button>
      </div>

      {/* Pending PO Notification Alert Section */}
      {pendingWonProjects.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/70 p-5 rounded-2xl border-2 border-amber-500/60 shadow-xl shadow-amber-500/10 space-y-3 relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl animate-bounce text-amber-400">
                🔔
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <span>แจ้งเตือนสั่งของ: มี {pendingWonProjects.length} โครงการชนะงานที่ยังไม่ออกใบสั่งซื้อ (Pending PO)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-bold animate-pulse">
                    ด่วน
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  เซลส์ในทีมชนะงานและเซ็นสัญญาเรียบร้อยแล้ว กรุณาออกใบสั่งซื้อ (PO) ส่งให้ Vendor เพื่อเริ่มผลิตและจัดส่งสินค้า
                </p>
              </div>
            </div>
          </div>

          {/* Pending Won Projects List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingWonProjects.map(proj => (
              <div key={proj.id} className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/40 space-y-2 relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🎉 ชนะงานแล้ว
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{proj.hospitalName}</h4>
                    <p className="text-xs text-indigo-300 line-clamp-1">{proj.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-amber-400">{formatCurrency(proj.budget)}</div>
                    <div className="text-[10.5px] text-emerald-300 font-medium mt-0.5">👤 {proj.assignee}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-400">
                    📦 สินค้า: <span className="text-slate-200 font-semibold">{proj.productName || 'ไม่ระบุ'}</span> ({proj.quantity || 1} ชุด)
                  </span>
                  <button
                    onClick={() => onOpenNewPO(proj)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 flex items-center gap-1 transition-all"
                  >
                    <span>🛒 ออก PO งานนี้</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Year & Date Range Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* High-Contrast Vibrant Yellow Date Range Inputs */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 rounded-xl p-1.5 text-xs shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span>ช่วงวันที่ออก PO:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold outline-none text-xs rounded-lg p-1"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold outline-none text-xs rounded-lg p-1"
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white text-xs px-1">✕</button>
            )}
          </div>

          {availableYears.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr.toString())}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedYear === yr.toString()
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>📅 ปี {yr + 543}</span>
              <span className="text-[10px] opacity-75 font-mono">({yr})</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedYear === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            🌐 สรุปทุกปี
          </button>
        </div>

        <div className="text-xs text-slate-400">
          แสดงข้อมูล {filteredPOs.length + filteredPendingProjects.length} รายการ (ใบสั่งซื้อ + งานรอ PO)
        </div>
      </div>

      {/* Executive KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💳 ยอดสั่งซื้อรวมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalSpentTHB)}
          </div>
          <div className="text-[11px] text-slate-400">
            {selectedYear === 'all' ? 'รวมยอดสั่งซื้อจากทุกปี' : `ยอดรวมเฉพาะปี ${Number(selectedYear) + 543}`}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📄 จำนวนใบสั่งซื้อ (PO)</span>
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-300 tracking-tight font-mono">
            {filteredPOs.length} <span className="text-xs font-normal text-slate-400">ฉบับ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ออก PO จาก Vendor ในช่วงเวลานี้
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🏢 จำนวน Vendor ผู้ผลิต</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">🏭</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {uniqueVendorsCount} <span className="text-xs font-normal text-slate-400">บริษัท</span>
          </div>
          <div className="text-[11px] text-slate-400">
            คู่ค้าที่เปิด PO สั่งสินค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🚛 ส่งมอบ / รับของแล้ว</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">📦</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {receivedCount} / {filteredPOs.length} <span className="text-xs font-normal text-slate-400">PO</span>
          </div>
          <div className="text-[11px] text-slate-400">
            คิดเป็น {filteredPOs.length > 0 ? Math.round((receivedCount / filteredPOs.length) * 100) : 0}% ของรายการทั้งหมด
          </div>
        </div>

      </div>

      {/* Vendor Spend Breakdown Dashboard Cards */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📊 สรุปยอดสั่งซื้อแยกตาม Vendor ผู้ผลิต (Vendor Purchasing Summary)</span>
            </h3>
            <p className="text-xs text-slate-400">
              สรุปจำนวนเงินที่สั่งซื้อ ชนิดสินค้าที่ซื้อ และสัดส่วนยอดสั่งซื้อของแต่ละ Vendor
            </p>
          </div>
        </div>

        {vendorBreakdown.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            ไม่มีรายการสั่งซื้อในช่วงเวลาที่เลือก
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorBreakdown.map((vb, idx) => {
              const pct = totalSpentTHB > 0 ? (((vb.totalTHB / totalSpentTHB) * 100) || 0).toFixed(1) : '0';
              const productItems = Object.values(vb.products);

              return (
                <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3 relative hover:border-amber-500/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>🏭 {vb.name}</span>
                      </h4>
                      {vb.country && (
                        <span className="text-[10px] text-slate-400">ประเทศ: {vb.country}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                      {vb.ordersCount} PO
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">ยอดรวมสั่งซื้อ:</span>
                    <span className="text-sm font-bold font-mono text-amber-400">{formatCurrency(vb.totalTHB)}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>สัดส่วนยอดซื้อ:</span>
                      <span className="text-amber-300 font-mono">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <div className="text-[10.5px] font-semibold text-indigo-300">📦 รายการสินค้าที่สั่งซื้อ:</div>
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {productItems.map((pi, pIdx) => (
                        <div key={pIdx} className="flex justify-between items-center text-[10.5px] bg-slate-950/60 p-1.5 rounded border border-slate-900">
                          <span className="text-slate-200 line-clamp-1 font-medium">{pi.name} ({pi.qty} ชิ้น)</span>
                          <span className="text-slate-400 font-mono shrink-0 ml-2">{formatCurrency(pi.amountTHB)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PO List Table & Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 รายการใบสั่งซื้อจาก Vendor (Purchase Orders List)</span>
            </h3>
            <p className="text-xs text-slate-400">รายการใบสั่งซื้อทั้งหมด สามารถแก้ไขและติดตามสถานะจัดส่งได้</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหาเลข PO / รพ. / สินค้า..."
              value={searchPO}
              onChange={(e) => setSearchPO(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุก Vendor</option>
              {window.VENDOR_LIST.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ PO / วันที่</th>
                <th className="p-3">Vendor / ผู้จัดจำหน่าย</th>
                <th className="p-3">โครงการ / โรงพยาบาล</th>
                <th className="p-3">สินค้าที่สั่ง</th>
                <th className="p-3 text-right">จำนวนเงิน (FX & THB)</th>
                <th className="p-3 text-center">สถานะ PO</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Render Pending Won Projects Waiting for PO */}
              {filteredPendingProjects.map(proj => (
                <tr key={`pending-${proj.id}`} className="bg-amber-950/40 hover:bg-amber-900/50 transition-colors border-l-4 border-l-amber-500">
                  <td className="p-3">
                    <div className="font-mono font-bold text-amber-300 flex items-center gap-1">
                      <span>🔔</span> <span>(รอออก PO)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ชนะงานเมื่อ: {proj.procurementDate || 'ล่าสุด'}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-amber-200/90 italic">ยังไม่ได้ออก PO ให้ Vendor</div>
                    <div className="text-[10px] text-slate-400">รอดำเนินการออกใบสั่งซื้อ</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white text-sm">{proj.hospitalName}</div>
                    <div className="text-[11px] text-emerald-300 font-medium">👤 เซลส์: {proj.assignee}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-200">{proj.productName || 'ไม่ระบุ'}</div>
                    <div className="text-[10px] text-slate-400">จำนวน: <span className="font-mono font-bold text-amber-300">{proj.quantity || 1}</span> ชุด</div>
                  </td>
                  <td className="p-3 text-right font-mono">
                    <div className="font-bold text-amber-400 text-sm">{formatCurrency(proj.budget)}</div>
                    <div className="text-[10px] text-slate-400">(งบชนะประมูล)</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/30 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse">
                      ⏳ รอออกใบสั่งซื้อ
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onOpenNewPO(proj)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/30 flex items-center gap-1 mx-auto transition-all hover:scale-105"
                    >
                      <span>🛒 ออก PO ทันที</span>
                    </button>
                  </td>
                </tr>
              ))}

              {/* Render Issued POs */}
              {filteredPOs.length === 0 && filteredPendingProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการใบสั่งซื้อ PO ตรงตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const badgeStyle = statusColors[po.status] || 'bg-slate-800 text-slate-300';
                  return (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-bold text-amber-300">{po.poNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">📅 {po.poDate || 'ไม่ระบุ'}</div>
                        {po.expectedDelivery && (
                          <div className="text-[9.5px] text-indigo-300 font-mono">🚛 ครบกำหนด: {po.expectedDelivery}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{po.vendorName}</div>
                        {po.vendorCountry && (
                          <div className="text-[10px] text-slate-400">🌍 {po.vendorCountry}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-emerald-300">{po.hospitalName || 'ไม่ระบุ รพ.'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{po.productName}</div>
                        <div className="text-[10px] text-slate-400">จำนวน: <span className="font-mono font-bold text-amber-300">{po.quantity}</span> ชุด</div>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400 text-sm">{formatCurrency(po.totalAmountTHB)}</div>
                        {po.currency && po.currency !== 'THB' && po.totalAmountFX && (
                          <div className="text-[10px] text-slate-400">
                            ({po.totalAmountFX.toLocaleString()} {po.currency} @ {po.exchangeRate})
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border ${badgeStyle}`}>
                          {po.status || 'ร่าง PO'}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewPO(po)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบสั่งซื้อ"
                        >
                          👁️ ดู PO
                        </button>
                        <button
                          onClick={() => onEditPO(po)}
                          className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeletePO(po.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO View Modal Preview */}
      {previewPO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal font-sans text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  PURCHASE ORDER (PO)
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewPO.poNumber}</h3>
                <p className="text-xs text-slate-400">วันที่ออก PO: {previewPO.poDate}</p>
              </div>
              <button onClick={() => setPreviewPO(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">VENDOR / ผู้จัดจำหน่าย:</div>
                <div className="font-bold text-amber-300 text-sm mt-0.5">{previewPO.vendorName}</div>
                <div className="text-slate-400">ประเทศ: {previewPO.vendorCountry || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">โครงการ / โรงพยาบาล:</div>
                <div className="font-bold text-emerald-300 text-sm mt-0.5">{previewPO.hospitalName || 'ไม่ระบุ'}</div>
                <div className="text-slate-400">สถานะสั่งซื้อ: <span className="text-indigo-300 font-bold">{previewPO.status}</span></div>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">รายการสินค้า (Product Description)</th>
                    <th className="p-3 text-center">จำนวน</th>
                    <th className="p-3 text-right">ราคา/หน่วย</th>
                    <th className="p-3 text-right">มูลค่ารวม (THB)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/60">
                    <td className="p-3 font-semibold text-white">
                      {previewPO.productName}
                      <div className="text-[10px] text-slate-400 font-normal">{previewPO.productCategory}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-300">{previewPO.quantity}</td>
                    <td className="p-3 text-right font-mono">
                      {previewPO.unitPrice ? previewPO.unitPrice.toLocaleString() + ' ' + (previewPO.currency || 'THB') : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(previewPO.totalAmountTHB)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {previewPO.note && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-amber-400">📝 หมายเหตุ / เงื่อนไข:</span> {previewPO.note}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700"
              >
                🖨️ พิมพ์เอกสาร
              </button>
              <button
                onClick={() => setPreviewPO(null)}
                className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
