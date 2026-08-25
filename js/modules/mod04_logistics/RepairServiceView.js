// MODULE: mod04_logistics/RepairServiceView.js

function RepairServiceView({ repairTickets = [], products = [], members = [], onOpenNewTicket, onEditTicket, onDeleteTicket, onViewInCatalog }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return (repairTickets || []).filter(t => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mNo = (t.ticketNumber || '').toLowerCase().includes(q);
        const mProd = (t.productName || '').toLowerCase().includes(q);
        const mSN = (t.sn || '').toLowerCase().includes(q);
        const mHosp = (t.lastHospital || '').toLowerCase().includes(q);
        const mSales = (t.salesPerson || '').toLowerCase().includes(q);
        const mVendor = (t.repairVendor || '').toLowerCase().includes(q);
        return mNo || mProd || mSN || mHosp || mSales || mVendor;
      }
      return true;
    });
  }, [repairTickets, filterCategory, filterStatus, searchQuery]);

  // Metrics KPI
  const totalTickets = filteredTickets.length;
  const inRepairCount = filteredTickets.filter(t => t.status === 'ส่งซ่อมอยู่' || t.status === 'รอส่งซ่อม' || t.status === 'ระหว่างขนส่ง').length;
  const completedCount = filteredTickets.filter(t => t.status === 'ซ่อมเสร็จแล้ว' || t.status === 'ส่งคืนลูกค้า').length;
  const totalRepairCost = filteredTickets.reduce((sum, t) => sum + (Number(t.repairCost) || 0), 0);
  const totalShippingCost = filteredTickets.reduce((sum, t) => sum + (Number(t.shippingCost) || 0), 0);

  const statusColors = {
    'รอส่งซ่อม': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'ส่งซ่อมอยู่': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'ระหว่างขนส่ง': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'ซ่อมเสร็จแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'ส่งคืนลูกค้า': 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  };

  const categoryColors = {
    'สินค้า Demo': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'สินค้าส่งซ่อมจาก รพ': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'สินค้าอยู่ในประกันของ บริษัท': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'สินค้า นอกประกันของบริษัท': 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-2xl shadow-inner">
            🔧
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ศูนย์ซ่อม & เคลมสินค้า (Repair Service & Claims)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                AERON SERVICE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามตารางสินค้าส่งซ่อม ทั้งเครื่อง Demo, สินค้าส่งซ่อมจาก รพ., สินค้าในประกัน และนอกประกัน
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewTicket(null)}
          className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ แจ้งเปิดใบส่งซ่อมใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🔧 รวมเคสส่งซ่อมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight font-mono">
            {totalTickets} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ประวัติงานซ่อมและเคลมสินค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>⏳ อยู่ระหว่างการซ่อม/ขนส่ง</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">⚙️</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {inRepairCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ยังไม่ได้รับของคืนจากศูนย์ซ่อม
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>✅ ซ่อมเสร็จ / ส่งคืนแล้ว</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">🎉</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {completedCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            พร้อมกลับมาใช้งาน / ส่งคืน รพ.
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💰 รวมค่าใช้จ่ายซ่อม & ขนส่ง</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalRepairCost + totalShippingCost)}
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>ค่าซ่อม: {formatShortCurrency(totalRepairCost)}</span>
            <span>ค่าส่ง: {formatShortCurrency(totalShippingCost)}</span>
          </div>
        </div>

      </div>

      {/* Controls & Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางรายการสินค้าส่งซ่อม (Repair Orders List)</span>
            </h3>
            <p className="text-xs text-slate-400">ตรวจสอบรายละเอียดอาการเสีย สถานะการซ่อม และอุปกรณ์ในเซ็ต</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา เลขซ่อม / SN / รุ่น / รพ...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตาม Category ทุกประเภท</option>
              {(window.REPAIR_CATEGORIES || []).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะ</option>
              {(window.REPAIR_STATUSES || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Repair Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ซ่อม / ประเภท</th>
                <th className="p-3">รุ่นสินค้า & หมายเลข SN</th>
                <th className="p-3">ชิ้นส่วนส่งซ่อม & อาการเสีย</th>
                <th className="p-3">รพ.ใช้ล่าสุด & ผู้ใช้ / เซลส์</th>
                <th className="p-3">ส่งซ่อมกับเจ้าไหน / ที่อยู่เครื่อง</th>
                <th className="p-3 text-right">ค่าซ่อม / ขนส่ง</th>
                <th className="p-3 text-center">สถานะ</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการสินค้าส่งซ่อมตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const catStyle = categoryColors[ticket.category] || 'bg-slate-800 text-slate-300';
                  const stStyle = statusColors[ticket.status] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Ticket Number & Category */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-rose-300">{ticket.ticketNumber}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-semibold border ${catStyle}`}>
                          {ticket.category}
                        </span>
                        <div className="text-[9.5px] text-slate-400 font-mono mt-1">📅 ส่ง: {ticket.sentDate || 'N/A'}</div>
                        {ticket.returnedDate && (
                          <div className="text-[9.5px] text-emerald-300 font-mono">📅 รับ: {ticket.returnedDate}</div>
                        )}
                      </td>

                      {/* Product Name & SN */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{ticket.productName}</div>
                        <div className="text-[10px] text-slate-400">{ticket.productCategory}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-amber-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          SN: {ticket.sn || 'ไม่ระบุ'}
                        </div>
                      </td>

                      {/* Repaired Items & Issue */}
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-slate-200 leading-snug">
                          🧰 <span className="text-slate-300">{ticket.repairedItems || 'ตัวเครื่องหลัก'}</span>
                        </div>
                        <div className="text-[11px] text-rose-300/90 italic mt-1 line-clamp-2 bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                          ❌ "{ticket.issueDescription}"
                        </div>
                      </td>

                      {/* Last Hospital & User / Sales */}
                      <td className="p-3">
                        <div className="font-semibold text-emerald-300">🏥 {ticket.lastHospital || 'สำนักงาน AERON'}</div>
                        {ticket.lastUser && (
                          <div className="text-[10.5px] text-slate-300">👤 ผู้ใช้: {ticket.lastUser}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">💼 เซลส์: {ticket.salesPerson}</div>
                      </td>

                      {/* Repair Vendor & Location */}
                      <td className="p-3">
                        <div className="font-semibold text-purple-300">🏭 {ticket.repairVendor || 'ศูนย์ซ่อมทั่วไป'}</div>
                        <div className="text-[10.5px] text-slate-300 flex items-start gap-1 mt-0.5">
                          <span>📍</span> <span className="line-clamp-2">{ticket.location || 'ศูนย์ซ่อม'}</span>
                        </div>
                      </td>

                      {/* Costs */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400">{formatCurrency(ticket.repairCost)}</div>
                        {ticket.shippingCost > 0 && (
                          <div className="text-[10px] text-slate-400">+ ส่ง {formatCurrency(ticket.shippingCost)}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${stStyle}`}>
                          {ticket.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-y-1">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => onEditTicket(ticket)}
                            className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                            title="แก้ไขใบส่งซ่อม"
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                            title="ลบ"
                          >
                            🗑️
                          </button>
                        </div>
                        {ticket.category === 'สินค้า Demo' && (
                          <button
                            onClick={() => onViewInCatalog(ticket.productName)}
                            className="w-full text-[10px] px-2 py-0.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded border border-emerald-700/50 block font-semibold"
                            title="ไปที่หน้าคลัง Demo"
                          >
                            📦 ดูในคลัง Demo
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
