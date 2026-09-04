// MODULE: mod04_logistics/SoldProductsView.js

function SoldProductsView({ soldProducts = [], projects = [], members = [], onOpenNewAsset, onEditAsset, onDeleteAsset, onOpenProjectDetail, onOpenReport }) {
  const [filterYear, setFilterYear] = useState('all');
  const [filterSales, setFilterSales] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAsset, setPreviewAsset] = useState(null);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return soldProducts.filter(a => {
      if (filterYear !== 'all') {
        const yr = a.deliveryDate ? new Date(a.deliveryDate).getFullYear() : 2026;
        if (Number(yr) !== Number(filterYear)) return false;
      }
      if (filterSales !== 'all' && a.salesPerson !== filterSales) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mAsset = (a.assetNumber || '').toLowerCase().includes(q);
        const mContract = (a.contractNumber || '').toLowerCase().includes(q);
        const mHosp = (a.hospitalName || '').toLowerCase().includes(q);
        const mProd = (a.productName || '').toLowerCase().includes(q);
        const mBrand = (a.brand || '').toLowerCase().includes(q);
        const mSN = (a.serialNumber || '').toLowerCase().includes(q);
        const mSales = (a.salesPerson || '').toLowerCase().includes(q);
        return mAsset || mContract || mHosp || mProd || mBrand || mSN || mSales;
      }
      return true;
    });
  }, [soldProducts, filterYear, filterSales, searchQuery]);

  // Metrics KPI
  const totalDeliveredValue = filteredAssets.reduce((sum, a) => sum + (Number(a.projectValue) || 0), 0);
  const totalGuaranteeAmount = filteredAssets.reduce((sum, a) => sum + (Number(a.bidGuaranteeAmount) || 0), 0);
  const totalAssetsCount = filteredAssets.length;
  const pmDueCount = filteredAssets.filter(a => a.pmStatus === '⏳ ถึงกำหนดทำ PM' || a.pmStatus === '🚨 เลยกำหนด PM').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            🏆
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลสินค้าที่ขายแล้ว & ประกันสินค้า (Delivered Assets & Warranty)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                INSTALLED BASE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามสินค้าที่ส่งมอบและตรวจรับแล้ว การรับคืนเงินค้ำประกันซอง วันหมดประกัน และรอบ PM บำรุงรักษา
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewAsset(null)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ เพิ่มรายการส่งมอบสินค้า</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💎 มูลค่างานส่งมอบรวมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalDeliveredValue)}
          </div>
          <div className="text-[11px] text-slate-400">
            จากทั้งหมด {totalAssetsCount} สัญญาจัดซื้อ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🛡️ รวมเงินค้ำประกันซอง/สัญญา</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalGuaranteeAmount)}
          </div>
          <div className="text-[11px] text-slate-400">
            เงินประกันสัญญาที่รอรับคืนจาก รพ.
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🩺 เครื่องที่ติดตั้งใช้งานจริง</span>
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300">🏥</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-300 tracking-tight font-mono">
            {totalAssetsCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ติดตั้ง ณ โรงพยาบาลคู่ค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>⚙️ กำหนดทำ PM บำรุงรักษา</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">📅</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {pmDueCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ถึงรอบ Preventive Maintenance
          </div>
        </div>

      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางรายการสินค้าที่ขายแล้ว (Delivered Assets List)</span>
            </h3>
            <p className="text-xs text-slate-400">รายละเอียดสินค้า ของแถม มูลค่างาน ค่า DF เงินประกันซอง และกำหนด PM</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา รพ. / เครื่อง / SN / เซลส์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามปีที่ส่งมอบ (ทุกปี)</option>
              <option value="2026">ส่งมอบปี 2026 (2569)</option>
              <option value="2025">ส่งมอบปี 2025 (2568)</option>
              <option value="2024">ส่งมอบปี 2024 (2567)</option>
            </select>

            <select
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามเซลส์ผู้รับผิดชอบ</option>
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>

            <button
              onClick={() => onOpenReport && onOpenReport('warranty_expiry_matrix')}
              className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              title="เปิดรายงานสัญญาประกันและเครื่องใกล้หมดประกัน"
            >
              <span>🛡️</span>
              <span>รายงานประกัน & MA</span>
            </button>
          </div>
        </div>

        {/* Delivered Assets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขรหัสสินค้า / วันส่งมอบ</th>
                <th className="p-3">โรงพยาบาล & ผู้ติดต่อ / เซลส์</th>
                <th className="p-3">ยี่ห้อ & รุ่นสินค้า / หมายเลข SN</th>
                <th className="p-3">🎁 รายการของแถม</th>
                <th className="p-3 text-right">มูลค่างาน & ค่า DF</th>
                <th className="p-3 text-right">เงินประกันซอง & วันคืน</th>
                <th className="p-3 text-center">หมดประกัน & รอบ PM</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการสินค้าที่ขายแล้วตรงตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const isWarrantyActive = new Date(asset.warrantyExpiryDate) >= new Date();

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Asset Number & Delivery Date */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-emerald-300">{asset.assetNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">สัญญา: {asset.contractNumber || 'N/A'}</div>
                        <div className="text-[9.5px] text-amber-300 font-mono mt-1">🚚 ส่งมอบ: {window.formatAeronDate(asset.deliveryDate)}</div>
                      </td>

                      {/* Hospital & Sales */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">🏥 {asset.hospitalName}</div>
                        {asset.department && (
                          <div className="text-[10.5px] text-slate-300">📍 {asset.department}</div>
                        )}
                        {asset.contactPerson && (
                          <div className="text-[10px] text-slate-400">👨‍⚕️ {asset.contactPerson}</div>
                        )}
                        <div className="text-[10.5px] text-emerald-300 font-medium mt-0.5">💼 เซลส์: {asset.salesPerson}</div>
                      </td>

                      {/* Brand & Model & SN */}
                      <td className="p-3">
                        <div className="font-bold text-white">{asset.productName}</div>
                        <div className="text-[10px] text-indigo-300">แบรนด์: {asset.brand || 'AERON MEDICAL'}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-amber-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          SN: {asset.serialNumber || 'ไม่ระบุ'}
                        </div>
                      </td>

                      {/* Freebies */}
                      <td className="p-3 max-w-xs">
                        {asset.freebies ? (
                          <div className="text-[11px] text-slate-300 leading-snug bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                            🎁 <span className="text-slate-200">{asset.freebies}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[10.5px]">ไม่มีของแถม</span>
                        )}
                      </td>

                      {/* Project Value & DF */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-emerald-400 text-sm">{formatCurrency(asset.projectValue)}</div>
                        <div className="text-[10px] text-purple-300 font-medium">DF: {asset.dfAmount || 'ไม่ระบุ'}</div>
                      </td>

                      {/* Bid Guarantee & Refund Date */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400">{formatCurrency(asset.bidGuaranteeAmount)}</div>
                        <div className="text-[10px] text-slate-400">
                          📅 คืนเงิน: <span className="text-amber-300 font-semibold">{asset.bidGuaranteeRefundDate || 'ไม่ระบุ'}</span>
                        </div>
                      </td>

                      {/* Warranty & PM Status */}
                      <td className="p-3 text-center space-y-1">
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isWarrantyActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {isWarrantyActive ? `🛡️ ประกันถึง ${asset.warrantyExpiryDate}` : `❌ หมดประกัน (${asset.warrantyExpiryDate})`}
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            ⚙️ PM ถัดไป: {asset.nextPmDate || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบรับมอบ"
                        >
                          👁️ ดู
                        </button>
                        {asset.projectId && (
                          <button
                            onClick={() => {
                              const proj = projects.find(p => p.id === asset.projectId || p.id === Number(asset.projectId));
                              if (proj && onOpenProjectDetail) onOpenProjectDetail(proj);
                            }}
                            className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs rounded-lg border border-purple-700/50"
                            title="ดูโครงการของเซลส์ที่เชื่อมโยง"
                          >
                            🔗 โครงการ
                          </button>
                        )}
                        <button
                          onClick={() => onEditAsset(asset)}
                          className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
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

      {/* Asset Certificate / Delivery Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                  DELIVERY & WARRANTY CERTIFICATE
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewAsset.assetNumber}</h3>
                <p className="text-xs text-slate-400">เลขที่สัญญา: {previewAsset.contractNumber}</p>
              </div>
              <button onClick={() => setPreviewAsset(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">โรงพยาบาล / ลูกค้า:</div>
                <div className="font-bold text-emerald-300 text-sm mt-0.5">{previewAsset.hospitalName}</div>
                <div className="text-slate-400">แผนก: {previewAsset.department}</div>
                <div className="text-slate-400">ผู้ติดต่อ: {previewAsset.contactPerson}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการส่งมอบ:</div>
                <div className="text-amber-300 font-semibold mt-0.5">📅 วันส่งมอบ: {window.formatAeronDate(previewAsset.deliveryDate)}</div>
                <div className="text-slate-300">💼 เซลส์: {previewAsset.salesPerson}</div>
                <div className="text-slate-300 font-mono font-bold">💰 มูลค่างาน: {formatCurrency(previewAsset.projectValue)}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📦 รายละเอียดสินค้า & ของแถมที่ได้รับ</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>รุ่นสินค้า: <span className="font-bold text-white">{previewAsset.productName}</span></div>
                <div>แบรนด์: <span className="text-indigo-300">{previewAsset.brand}</span></div>
                <div>Serial Number: <span className="font-mono text-amber-300 font-bold">{previewAsset.serialNumber}</span></div>
                <div>ค่า DF: <span className="text-purple-300 font-semibold">{previewAsset.dfAmount}</span></div>
              </div>
              <div className="pt-2 border-t border-slate-900 text-slate-300">
                <span className="font-bold text-emerald-300">🎁 ของแถม / รายการอุปกรณ์ประกอบ:</span>
                <p className="text-slate-200 mt-0.5 italic">{previewAsset.freebies || 'ไม่มีของแถม'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div>
                <div className="text-amber-400 font-bold">🛡️ เงินค้ำประกันซอง / สัญญา:</div>
                <div className="text-lg font-mono font-bold text-amber-300">{formatCurrency(previewAsset.bidGuaranteeAmount)}</div>
                <div className="text-slate-400">📅 กำหนดรับเงินคืน: <span className="text-white font-semibold">{previewAsset.bidGuaranteeRefundDate}</span></div>
              </div>
              <div>
                <div className="text-purple-300 font-bold">⚙️ การรับประกัน & รอบ PM:</div>
                <div className="text-slate-200">วันหมดประกัน: <span className="font-semibold text-emerald-300">{previewAsset.warrantyExpiryDate}</span></div>
                <div className="text-slate-200">วันทำ PM ถัดไป: <span className="font-semibold text-purple-300">{previewAsset.nextPmDate}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์เอกสารรับมอบ
              </button>
              <button onClick={() => setPreviewAsset(null)} className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
