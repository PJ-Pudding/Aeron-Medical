// MODULE: mod04_logistics/ShipmentTrackingView.js

function ShipmentTrackingView({ shipments = [], purchaseOrders = [], products = [], onOpenNewShipment, onEditShipment, onDeleteShipment }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTransport, setFilterTransport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewShipment, setPreviewShipment] = useState(null);

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return (shipments || []).filter(s => {
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (filterTransport !== 'all' && s.transportType !== filterTransport) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mShp = (s.shipmentNumber || '').toLowerCase().includes(q);
        const mPO = (s.poNumber || '').toLowerCase().includes(q);
        const mProd = (s.productName || '').toLowerCase().includes(q);
        const mVendor = (s.vendorName || '').toLowerCase().includes(q);
        const mCarrier = (s.shippingCompany || '').toLowerCase().includes(q);
        const mTrack = (s.trackingNumber || '').toLowerCase().includes(q);
        const mHosp = (s.hospitalDestination || '').toLowerCase().includes(q);
        return mShp || mPO || mProd || mVendor || mCarrier || mTrack || mHosp;
      }
      return true;
    });
  }, [shipments, filterStatus, filterTransport, searchQuery]);

  // Metrics KPI
  const totalShipments = filteredShipments.length;
  const inTransitCount = filteredShipments.filter(s => s.status === 'ระหว่างขนส่ง' || s.status === 'ถึงประเทศไทย รอออกของ').length;
  const totalCBM = filteredShipments.reduce((sum, s) => sum + (Number(s.cbm) || 0), 0);
  const totalShippingCosts = filteredShipments.reduce((sum, s) => sum + (Number(s.shippingCost) || 0) + (Number(s.dutyTaxes) || 0), 0);

  const statusColors = {
    'รอจ่ายเงิน': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'จ่ายเงินแล้ว รอผลิต': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'ผลิตเสร็จแล้ว รอส่ง': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    'ระหว่างขนส่ง': 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
    'ถึงประเทศไทย รอออกของ': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'ของถึง ออฟฟิศ': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    'ส่งลูกค้าแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner">
            🚢
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ติดตามการนำเข้าสินค้า (Import Logistics & Shipment Tracking)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                IMPORT LOGISTICS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามสถานะชิปปิ้งนำเข้าจากต่างประเทศ ค่าขนส่ง CBM ด่านศุลกากร และกำหนดสินค้าเข้าออฟฟิศ/ส่งมอบ
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewShipment(null)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ บันทึกรายการนำเข้าใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📦 รวมรายการนำเข้าสินค้า</span>
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-400 tracking-tight font-mono">
            {totalShipments} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ใบสั่งซื้อที่ดำเนินการนำเข้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>✈️ อยู่ระหว่างขนส่ง / ด่านศุลกากร</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">⚓</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {inTransitCount} <span className="text-xs font-normal text-slate-400">ล็อต</span>
          </div>
          <div className="text-[11px] text-slate-400">
            กำลังเดินทาง / รอดำเนินการออกของ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📐 ปริมาตรรวม (Total CBM)</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">📐</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {(Number(totalCBM) || 0).toFixed(1)} <span className="text-xs font-normal text-slate-400">CBM</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ลูกบาศก์เมตร (Volume)
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💵 รวมค่าขนส่ง & ภาษีนำเข้า</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalShippingCosts)}
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าระวาง + ชิปปิ้ง + ภาษีศุลกากร
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางติดตามสถานะสินค้าชิปปิ้ง (Import Shipments List)</span>
            </h3>
            <p className="text-xs text-slate-400">ตรวจสอบสถานะนำเข้า 7 ขั้นตอน เลข AWB ค่าขนส่ง CBM และด่านศุลกากร</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา PO / สินค้า / AWB / ชิปปิ้ง / รพ...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะนำเข้า</option>
              {(window.SHIPMENT_STATUSES || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterTransport}
              onChange={(e) => setFilterTransport(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามประเภทการขนส่ง</option>
              {(window.TRANSPORT_TYPES || []).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ชิปปิ้ง / PO</th>
                <th className="p-3">สินค้าที่สั่ง & บริษัทผู้ผลิต</th>
                <th className="p-3">ผู้จัดขนส่ง & เลข AWB/BL</th>
                <th className="p-3">ปริมาตร CBM / น้ำหนัก</th>
                <th className="p-3 text-right">ค่าขนส่ง & ภาษีศุลกากร</th>
                <th className="p-3 text-center min-w-[130px]">💳 วันจ่ายเงิน / นับวัน</th>
                <th className="p-3 text-center">วันที่ ETD / ETA</th>
                <th className="p-3 text-center">สถานะนำเข้า</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการนำเข้าสินค้าตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredShipments.map(shp => {
                  const badgeStyle = statusColors[shp.status] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={shp.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Shipment & PO Number */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-cyan-300">{shp.shipmentNumber}</div>
                        <div className="text-[10.5px] font-mono text-amber-300 font-semibold mt-0.5">PO: {shp.poNumber}</div>
                        {shp.hospitalDestination && (
                          <div className="text-[9.5px] text-emerald-300 line-clamp-1 mt-0.5">🏥 {shp.hospitalDestination}</div>
                        )}
                      </td>

                      {/* Product Name & Vendor */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{shp.productName}</div>
                        <div className="text-[10px] text-slate-400">{shp.productCategory}</div>
                        <div className="text-[10.5px] text-indigo-300 font-medium mt-0.5">🏭 {shp.vendorName} ({shp.vendorCountry})</div>
                      </td>

                      {/* Carrier & Tracking Number */}
                      <td className="p-3">
                        <div className="font-semibold text-purple-300">{shp.shippingCompany || 'ไม่ระบุสายส่ง'}</div>
                        <div className="text-[10px] text-slate-300">{shp.transportType}</div>
                        {shp.trackingNumber && (
                          <div className="inline-block mt-1 font-mono font-bold text-slate-200 text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            🏷️ {shp.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* CBM & Weight */}
                      <td className="p-3 font-mono">
                        <div className="font-bold text-amber-300 text-sm">{shp.cbm} <span className="text-[10px] font-normal text-slate-400">CBM</span></div>
                        <div className="text-[10px] text-slate-400">{shp.grossWeight ? `${shp.grossWeight} kg` : '-'}</div>
                      </td>

                      {/* Shipping Cost & Duties */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-emerald-400">{formatCurrency(shp.shippingCost)}</div>
                        {shp.dutyTaxes > 0 && (
                          <div className="text-[10px] text-purple-300">+ ภาษี {formatCurrency(shp.dutyTaxes)}</div>
                        )}
                      </td>

                      {/* Payment Date & Elapsed Days Counter */}
                      <td className="p-3 text-center">
                        {shp.paymentDate ? (
                          <div className="space-y-1">
                            <div className="font-mono text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                              <span>💳</span> <span>{shp.paymentDate}</span>
                            </div>
                            <div>
                              {(() => {
                                const p = new Date(shp.paymentDate);
                                const t = new Date();
                                p.setHours(0,0,0,0);
                                t.setHours(0,0,0,0);
                                const diff = Math.floor((t - p) / 86400000);
                                if (diff >= 0) {
                                  return (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10.5px] font-mono font-bold inline-flex items-center gap-1">
                                      <span>⏱️</span> <span>ผ่านมา {diff} วัน</span>
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                                      อีก {Math.abs(diff)} วัน
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 text-[10.5px] border border-slate-700">
                            ⏳ ยังไม่ระบุวันจ่าย
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="p-3 text-center font-mono text-[10.5px]">
                        <div className="text-slate-400">ออก: <span className="text-slate-200">{shp.etd || 'N/A'}</span></div>
                        <div className="text-cyan-300 font-bold mt-0.5">ถึง: {shp.eta || 'N/A'}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border ${badgeStyle}`}>
                          {shp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewShipment(shp)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบชิปปิ้ง"
                        >
                          👁️ ดู
                        </button>
                        <button
                          onClick={() => onEditShipment(shp)}
                          className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 text-xs rounded-lg border border-cyan-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteShipment(shp.id)}
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

      {/* Shipment Preview Modal */}
      {previewShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  IMPORT LOGISTICS DOCUMENT
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewShipment.shipmentNumber}</h3>
                <p className="text-xs text-slate-400">อ้างอิงใบสั่งซื้อ PO: {previewShipment.poNumber}</p>
              </div>
              <button onClick={() => setPreviewShipment(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลสินค้า & บริษัทผู้ผลิต:</div>
                <div className="font-bold text-white text-sm mt-0.5">{previewShipment.productName}</div>
                <div className="text-indigo-300">บริษัท: {previewShipment.vendorName} ({previewShipment.vendorCountry})</div>
                <div className="text-emerald-300 font-medium">ส่งถึง: {previewShipment.hospitalDestination || 'สำนักงาน AERON'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการขนส่งชิปปิ้ง:</div>
                <div className="text-purple-300 font-bold mt-0.5">บริษัทขนส่ง: {previewShipment.shippingCompany}</div>
                <div className="text-slate-300">รูปแบบ: {previewShipment.transportType}</div>
                <div className="text-amber-300 font-mono">AWB/BL: {previewShipment.trackingNumber || 'N/A'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-bold">💳 วันที่จ่ายเงิน:</span>
                <div className="text-emerald-300 font-bold text-sm">{previewShipment.paymentDate || 'ยังไม่ระบุ'}</div>
                {previewShipment.paymentDate && (
                  <div className="text-amber-300 text-[10.5px] font-bold mt-0.5">
                    {(() => {
                      const p = new Date(previewShipment.paymentDate);
                      const t = new Date();
                      p.setHours(0,0,0,0);
                      t.setHours(0,0,0,0);
                      const diff = Math.floor((t - p) / 86400000);
                      return diff >= 0 ? `⏱️ ผ่านมา ${diff} วันแล้ว` : `อีก ${Math.abs(diff)} วัน`;
                    })()}
                  </div>
                )}
              </div>
              <div>
                <span className="text-slate-500 font-bold">ปริมาตร (CBM):</span>
                <div className="text-amber-400 font-bold text-sm">{previewShipment.cbm} CBM</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">น้ำหนักรวม (Weight):</span>
                <div className="text-slate-200 font-bold text-sm">{previewShipment.grossWeight || 0} kg</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">ค่าขนส่งรวม:</span>
                <div className="text-emerald-400 font-bold text-sm">{formatCurrency(previewShipment.shippingCost)}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📍 สถานะการนำเข้าปัจจุบัน</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {previewShipment.status}
                </span>
                <span className="text-slate-400">ชิปปิ้ง/พิธีการศุลกากร: <span className="text-slate-200 font-semibold">{previewShipment.customsBroker || 'N/A'}</span></span>
              </div>
              {previewShipment.notes && (
                <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                  "{previewShipment.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์เอกสารนำเข้า
              </button>
              <button onClick={() => setPreviewShipment(null)} className="px-5 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl hover:bg-cyan-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
