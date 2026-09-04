// MODULE: mod06_fda/FDARegistrationView.js

function FDARegistrationView({ fdaRegistrations = [], products = [], members = [], onOpenNewFDA, onEditFDA, onDeleteFDA }) {
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFDA, setPreviewFDA] = useState(null);

  // Filtered FDA Registrations
  const filteredFDAs = useMemo(() => {
    return fdaRegistrations.filter(f => {
      if (filterClass !== 'all' && f.deviceClass !== filterClass) return false;
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mReg = (f.registrationNumber || '').toLowerCase().includes(q);
        const mLic = (f.fdaLicenseNo || '').toLowerCase().includes(q);
        const mProd = (f.productName || '').toLowerCase().includes(q);
        const mVendor = (f.vendorName || '').toLowerCase().includes(q);
        const mAgency = (f.agencyName || '').toLowerCase().includes(q);
        const mRA = (f.raSpecialist || '').toLowerCase().includes(q);
        return mReg || mLic || mProd || mVendor || mAgency || mRA;
      }
      return true;
    });
  }, [fdaRegistrations, filterClass, filterStatus, searchQuery]);

  // Metrics KPI
  const totalRegistrations = filteredFDAs.length;
  const approvedCount = filteredFDAs.filter(f => f.status === 'อนุมัติใบอนุญาตแล้ว').length;
  
  // Overdue count (Red Alert)
  const overdueCount = filteredFDAs.filter(f => {
    if (f.status === 'อนุมัติใบอนุญาตแล้ว') return false;
    const elapsed = calculateWorkingDays(f.paymentDate, f.approvalDate);
    const target = f.targetDays || 30;
    return elapsed > target;
  }).length;

  // Expiring count (Orange Alert <= 6 months)
  const expiringCount = filteredFDAs.filter(f => {
    if (!f.expiryDate) return false;
    const exp = new Date(f.expiryDate);
    const today = new Date();
    const diffMonths = (exp.getFullYear() - today.getFullYear()) * 12 + (exp.getMonth() - today.getMonth());
    return diffMonths >= 0 && diffMonths <= 6;
  }).length;

  const totalCost = filteredFDAs.reduce((sum, f) => sum + (Number(f.costTHB) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
            🛡️
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>การจดทะเบียน อย. เครื่องมือแพทย์ (Thai FDA Medical Device Registration)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                REGULATORY COMPLIANCE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามระยะเวลา SLA ใบอนุญาต อย. ตาม Class เครื่องมือแพทย์ เตือนความเสี่ยงเกินกำหนด และวันหมดอายุต่อสัญญา
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewFDA(null)}
          className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ บันทึกการยื่นขอ อย. ใหม่</span>
        </button>
      </div>

      {/* SLA Benchmarks Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟢 Class 1 (ความเสี่ยงต่ำ)</span>
            <span className="text-emerald-400 font-mono">30 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับจดแจ้ง (Low Risk Medical Device)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟡 Class 2 (เสี่ยงปานกลางต่ำ)</span>
            <span className="text-amber-400 font-mono">120 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับแจ้งรายการละเอียด (90 - 150 วัน)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟠 Class 3 (เสี่ยงปานกลางสูง)</span>
            <span className="text-orange-400 font-mono">180 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับแจ้งรายการละเอียด (150 - 200 วัน)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🔴 Class 4 (ความเสี่ยงสูง)</span>
            <span className="text-rose-400 font-mono">300 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบอนุญาต (High Risk / Invasive Device)</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📋 ยื่นขอ อย. ทั้งหมด</span>
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">📄</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-tight font-mono">
            {totalRegistrations} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            อนุมัติแล้ว {approvedCount} รายการ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🚨 ยื่นเกินเวลา อย. (Overdue)</span>
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">🚨</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight font-mono">
            {overdueCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-rose-300 font-medium">
            เกินจำนวนวันทำการที่ อย. กำหนด
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🟧 ใบอย. ใกล้หมดอายุ (6 เดือน)</span>
            <span className="p-1 rounded-lg bg-orange-500/20 text-orange-300">🔔</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-400 tracking-tight font-mono">
            {expiringCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-orange-300 font-medium">
            ต้องเริ่มดำเนินการยื่นต่ออายุ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💵 รวมค่าใช้จ่ายจด อย.</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalCost)}
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าธรรมเนียม + ค่าบริการเอเยนต์
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางติดตามสถานะ อย. และการแจ้งเตือน SLA (FDA Registrations)</span>
            </h3>
            <p className="text-xs text-slate-400">ระบบเตือนสีแดง (เกิน SLA), สีเหลือง (สุ่มเสี่ยงเหลือ 30%), สีส้ม (ใกล้หมดอายุ 6 เดือน)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา สินค้า / เลข อย. / บริษัท / เอเยนต์ / RA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุก Class อย.</option>
              {(window.FDA_CLASSES || []).map(c => typeof c === 'object' ? (
                <option key={c.code || c.label} value={c.code || c.label}>{c.label || c.code}</option>
              ) : (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะ</option>
              {(window.FDA_STATUSES || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FDA Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่คำขอ / เลขใบอนุญาต อย.</th>
                <th className="p-3">สินค้าที่จด & บริษัทผู้ผลิต</th>
                <th className="p-3">Class ความเสี่ยง & บริษัทรับจด</th>
                <th className="p-3 text-center">วันเริ่มจ่ายเงิน ➔ อนุมัติ</th>
                <th className="p-3 text-center">วันทำการที่ใช้ / เกณฑ์ SLA</th>
                <th className="p-3 text-center">วันหมดอายุใบ อย.</th>
                <th className="p-3 text-right">ค่าบริการจด (บาท)</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFDAs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการจดทะเบียน อย. ตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredFDAs.map(fda => {
                  const elapsedDays = calculateWorkingDays(fda.paymentDate, fda.approvalDate);
                  const targetDays = fda.targetDays || 30;
                  const isApproved = fda.status === 'อนุมัติใบอนุญาตแล้ว';

                  // SLA Alert Logic
                  const isOverdue = !isApproved && elapsedDays > targetDays;
                  const isWarningSLA = !isApproved && !isOverdue && elapsedDays >= Math.floor(targetDays * 0.7);

                  // License Expiry Logic (< 6 months)
                  let isNearExpiry = false;
                  if (fda.expiryDate) {
                    const exp = new Date(fda.expiryDate);
                    const today = new Date();
                    const diffMonths = (exp.getFullYear() - today.getFullYear()) * 12 + (exp.getMonth() - today.getMonth());
                    if (diffMonths >= 0 && diffMonths <= 6) {
                      isNearExpiry = true;
                    }
                  }

                  // Row background style based on alert
                  let rowStyle = 'hover:bg-slate-800/40';
                  if (isOverdue) rowStyle = 'bg-rose-950/20 hover:bg-rose-950/40 border-l-4 border-l-rose-500';
                  else if (isWarningSLA) rowStyle = 'bg-amber-950/20 hover:bg-amber-950/40 border-l-4 border-l-amber-500';
                  else if (isNearExpiry) rowStyle = 'bg-orange-950/20 hover:bg-orange-950/40 border-l-4 border-l-orange-500';

                  return (
                    <tr key={fda.id} className={`transition-colors ${rowStyle}`}>
                      
                      {/* Registration & License Number */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-amber-300">{fda.registrationNumber}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-emerald-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {fda.fdaLicenseNo || 'รอใบอนุญาต'}
                        </div>
                      </td>

                      {/* Product Name & Vendor */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{fda.productName}</div>
                        <div className="text-[10px] text-indigo-300">แบรนด์: {fda.brand}</div>
                        <div className="text-[10.5px] text-slate-400 font-medium">🏭 {fda.vendorName}</div>
                      </td>

                      {/* Class & Agency */}
                      <td className="p-3">
                        <div className="font-bold text-amber-400">{fda.deviceClass}</div>
                        <div className="text-[10px] text-slate-300">🏢 {fda.agencyName}</div>
                        <div className="text-[10px] text-indigo-300">👤 {fda.raSpecialist}</div>
                      </td>

                      {/* Payment & Approval Date */}
                      <td className="p-3 text-center font-mono text-[10.5px]">
                        <div className="text-slate-400">เริ่ม: <span className="text-white font-semibold">{fda.paymentDate}</span></div>
                        <div className="text-emerald-300 font-bold mt-0.5">เสร็จ: {fda.approvalDate || 'กำลังดำเนินการ'}</div>
                      </td>

                      {/* Elapsed Working Days & SLA Badge */}
                      <td className="p-3 text-center space-y-1 font-mono">
                        <div className="font-bold text-sm text-slate-100">
                          {elapsedDays} <span className="text-[10px] font-normal text-slate-400">วันทำการ</span>
                        </div>

                        <div>
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              🚨 เกิน SLA ({targetDays} วัน)
                            </span>
                          ) : isWarningSLA ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ⚠️ สุ่มเสี่ยง (เหลือ 30%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              เกณฑ์มาตรฐาน {targetDays} วัน
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiration Date & Expiry Alert */}
                      <td className="p-3 text-center font-mono">
                        <div className="font-bold text-slate-200 text-[11px]">{fda.expiryDate ? window.formatAeronDate(fda.expiryDate) : 'ยังไม่มีวันหมดอายุ'}</div>
                        {isNearExpiry && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-bounce">
                              🟧 เตือนยื่นต่ออายุ 6 เดือน
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(fda.costTHB)}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewFDA(fda)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบ อย."
                        >
                          👁️ ดู
                        </button>
                        <button
                          onClick={() => onEditFDA(fda)}
                          className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 text-xs rounded-lg border border-amber-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteFDA(fda.id)}
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

      {/* FDA Certificate Preview Modal */}
      {previewFDA && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  THAI FDA COMPLIANCE CERTIFICATE
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewFDA.registrationNumber}</h3>
                <p className="text-xs text-emerald-300 font-mono font-bold">เลขที่ใบอนุญาต อย.: {previewFDA.fdaLicenseNo || 'อยู่ระหว่างพิจารณา'}</p>
              </div>
              <button onClick={() => setPreviewFDA(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">รายละเอียดสินค้า & ผู้ผลิต:</div>
                <div className="font-bold text-white text-sm mt-0.5">{previewFDA.productName}</div>
                <div className="text-indigo-300">แบรนด์: {previewFDA.brand}</div>
                <div className="text-slate-400">ผู้ผลิต: {previewFDA.vendorName}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการรับจด อย.:</div>
                <div className="text-amber-400 font-bold mt-0.5">Class ความเสี่ยง: {previewFDA.deviceClass}</div>
                <div className="text-slate-300">บริษัทรับจด: {previewFDA.agencyName}</div>
                <div className="text-purple-300 font-semibold">ผู้ดูแล RA: {previewFDA.raSpecialist}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-bold">วันเริ่มจ่ายเงิน/ยื่น:</span>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{previewFDA.paymentDate}</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">วันอนุมัติเสร็จ:</span>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{previewFDA.approvalDate || 'กำลังรอดำเนินการ'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">วันหมดอายุใบ อย.:</span>
                <div className="text-orange-400 font-bold text-sm mt-0.5">{previewFDA.expiryDate ? window.formatAeronDate(previewFDA.expiryDate) : 'N/A'}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📍 สถานะขั้นตอนคำขอ</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {previewFDA.status}
                </span>
                <span className="text-slate-400">ค่าธรรมเนียมรวม: <span className="text-emerald-400 font-bold font-mono">{formatCurrency(previewFDA.costTHB)}</span></span>
              </div>
              {previewFDA.notes && (
                <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                  "{previewFDA.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์รายละเอียด อย.
              </button>
              <button onClick={() => setPreviewFDA(null)} className="px-5 py-2 bg-amber-600 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
