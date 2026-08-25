// MODULE: mod04_logistics/ProductCatalogView.js

function ProductCatalogView({ products = [], demoBookings = [], onOpenNewProduct, onEditProduct, onDeleteProduct, onOpenRepairModal }) {
  const [expandedProduct, setExpandedProduct] = useState(null);

  const statusConfig = {
    'พร้อมใช้งาน': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400', icon: '✅' },
    'ส่งซ่อม':      { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   dot: 'bg-amber-400',   icon: '🔧' },
    'เสีย':         { color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',       dot: 'bg-rose-400',    icon: '❌' },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            📦
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลสินค้า Demo (Central Demo Catalog)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AERON MEDICAL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ประเภทสินค้า รายชื่อรุ่นเครื่องมือแพทย์ และสถานะเครื่องสาธิต (Demo Units) พร้อมอุปกรณ์ประกอบในชุด
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ เพิ่มชนิดสินค้าใหม่</span>
        </button>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(products || []).map(p => {
          const activeBookingsCount = demoBookings.filter(b => b.productId === p.id).length;
          const units = p.demoUnits || (p.demoSerialNumbers || []).map(sn => ({ sn, status: 'พร้อมใช้งาน', location: '', accessories: '' }));
          const readyCount = units.filter(u => u.status === 'พร้อมใช้งาน').length;
          const repairCount = units.filter(u => u.status === 'ส่งซ่อม').length;
          const brokenCount = units.filter(u => u.status === 'เสีย').length;
          const isExpanded = expandedProduct === p.id;

          return (
            <div key={p.id} className="glass-card p-5 rounded-2xl space-y-3 border border-slate-800 hover:border-emerald-500/40 transition-colors relative">
              <div className="flex items-start justify-between">
                <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {p.category}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {formatCurrency(p.price)}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{p.name}</h3>
                <div className="text-xs text-indigo-300 font-medium">แบรนด์: {p.brand || 'AERON MEDICAL'}</div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {p.description || 'ไม่มีรายละเอียดสินค้า'}
              </p>

              {/* Demo Stock Summary */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>🧪 เครื่องสาธิตส่วนกลาง:</span>
                  <span className="font-bold text-emerald-400 font-mono">{units.length} เครื่อง</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>📅 ถูกจองคิวขณะนี้:</span>
                  <span className="font-mono text-purple-300 font-semibold">{activeBookingsCount} คิว</span>
                </div>

                {/* Status Summary Pills */}
                <div className="flex gap-1.5 flex-wrap pt-1 border-t border-slate-800">
                  {readyCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✅ พร้อมใช้ {readyCount}
                    </span>
                  )}
                  {repairCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🔧 ส่งซ่อม {repairCount}
                    </span>
                  )}
                  {brokenCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      ❌ เสีย {brokenCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Expand/Collapse Demo Units & Components Detail */}
              <button
                onClick={() => setExpandedProduct(isExpanded ? null : p.id)}
                className="w-full text-xs py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-2 shadow-sm font-semibold active:scale-[0.99]"
              >
                <span>{isExpanded ? '▲ ซ่อนสเปก & รายการอุปกรณ์' : '📑 ดูตารางอุปกรณ์ในชุด & เครื่องสาธิต'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                  {(p.masterChecklistItems || p.accessoriesList || []).length} รายการ
                </span>
              </button>

              {/* Product Details & Excel Equipment Table (Expanded) */}
              {isExpanded && (
                <div className="space-y-3.5 pt-2 animate-fade-in">
                  
                  {/* 📊 1. Excel-style Components & Accessories Table */}
                  <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-700/80 space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <span>📑</span> <span>ตารางรายการชิ้นส่วน & อุปกรณ์ประกอบในชุด ({ (p.masterChecklistItems || p.accessoriesList || []).length })</span>
                      </span>
                      <button
                        onClick={() => onEditProduct(p)}
                        className="text-[10.5px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1"
                      >
                        <span>✏️ แก้ไขสเปก</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-[11px] border-collapse min-w-[550px]">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                          <tr>
                            <th className="p-1.5 px-2 text-center w-10 border-r border-slate-800">ลำดับ</th>
                            <th className="p-1.5 px-2 border-r border-slate-800 min-w-[140px]">รายการอุปกรณ์</th>
                            <th className="p-1.5 px-2 border-r border-slate-800 w-24">Item No.</th>
                            <th className="p-1.5 px-2 border-r border-slate-800 w-28">Serial No. (S/N)</th>
                            <th className="p-1.5 px-2 text-center w-14 border-r border-slate-800">จำนวน</th>
                            <th className="p-1.5 px-2 text-center w-16 border-r border-slate-800">หน่วย</th>
                            <th className="p-1.5 px-2 min-w-[120px]">หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-sans">
                          {(!p.masterChecklistItems && !p.accessoriesList) || (p.masterChecklistItems || p.accessoriesList || []).length === 0 ? (
                            <tr>
                              <td colSpan="7" className="p-4 text-center text-slate-500 italic">
                                ยังไม่มีการระบุตารางชิ้นส่วนอุปกรณ์ กด "แก้ไขสเปก" เพื่อเพิ่มตาราง Excel
                              </td>
                            </tr>
                          ) : (
                            (p.masterChecklistItems || p.accessoriesList || []).map((item, idx) => (
                              <tr key={item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-1.5 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">{idx + 1}</td>
                                <td className="p-1.5 px-2 font-medium text-slate-200 border-r border-slate-800/80">{item.name}</td>
                                <td className="p-1.5 px-2 font-mono text-indigo-300 border-r border-slate-800/80">{item.itemNo || item.partNo || '-'}</td>
                                <td className="p-1.5 px-2 font-mono text-amber-300 border-r border-slate-800/80">{item.serialNo || '-'}</td>
                                <td className="p-1.5 px-2 text-center font-mono font-bold text-amber-300 border-r border-slate-800/80">{item.qty || 1}</td>
                                <td className="p-1.5 px-2 text-center text-slate-300 border-r border-slate-800/80">{item.unit || 'ชิ้น'}</td>
                                <td className="p-1.5 px-2 text-slate-400 text-[10.5px]">{item.note || '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 🧪 2. Demo Units List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                        <span>🧪</span> <span>เครื่องสาธิตส่วนกลาง ({units.length} เครื่อง)</span>
                      </span>
                    </div>
                    {units.map((unit, idx) => {
                      const cfg = statusConfig[unit.status] || statusConfig['พร้อมใช้งาน'];
                      return (
                        <div key={idx} className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-2 text-[11px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-amber-300 text-[11px]">🔖 SN: {unit.sn || 'ไม่ระบุ'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                              {unit.status}
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5 text-slate-400">
                            <span className="shrink-0 mt-0.5">📍</span>
                            <span className="leading-snug">
                              <span className="text-slate-500 mr-1">สถานที่อยู่ปัจจุบัน:</span>
                              <span className="text-slate-200 font-medium">{unit.location || 'สำนักงาน AERON'}</span>
                            </span>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => onOpenRepairModal(p, unit)}
                              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 text-[10.5px] font-semibold rounded-lg border border-rose-700/50 flex items-center gap-1"
                            >
                              <span>🔧 แจ้งเปิดใบส่งซ่อมเครื่องนี้</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Product Action Buttons (Edit Product & Delete Product) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => onEditProduct(p)}
                  className="px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 font-semibold rounded-xl border border-indigo-700/50 flex items-center gap-1 transition-all"
                >
                  <span>✏️ แก้ไขสินค้า / เครื่อง Demo</span>
                </button>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs px-2.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 transition-all"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
