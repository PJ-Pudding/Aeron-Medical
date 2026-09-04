// MODULE: mod04_logistics/ShipmentModal.js

function ShipmentModal({ shipment, purchaseOrders = [], products = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (shipment) return { ...shipment };
    const firstPO = purchaseOrders[0] || {};
    const delivYr = new Date().getFullYear();

    return {
      shipmentNumber: `SHP-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      poNumber: firstPO.poNumber || `PO-${delivYr}-101`,
      poId: firstPO.id || '',
      productName: firstPO.productName || (products[0] ? products[0].name : ''),
      productCategory: firstPO.productCategory || (products[0] ? products[0].category : ''),
      quantity: firstPO.quantity || 1,
      vendorName: firstPO.vendorName || 'Mindray Medical Singapore',
      vendorCountry: firstPO.vendorCountry || 'สิงคโปร์',
      hospitalDestination: firstPO.hospitalName || 'โรงพยาบาลศิริราช',
      shippingCompany: 'DHL Global Forwarding',
      trackingNumber: `AWB-${Math.floor(Math.random() * 89999999) + 10000000}`,
      cbm: 2.5,
      grossWeight: 150.0,
      transportType: window.TRANSPORT_TYPES[0],
      shippingCost: 35000,
      dutyTaxes: 12000,
      customsBroker: 'V-Cargo Logistics (Thailand)',
      paymentDate: shipment?.paymentDate || '',
      etd: new Date().toISOString().split('T')[0],
      eta: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: window.SHIPMENT_STATUSES[0],
      notes: ''
    };
  });

  const handlePOSelect = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setFormData(prev => ({
        ...prev,
        poId: po.id,
        poNumber: po.poNumber,
        productName: po.productName,
        vendorName: po.vendorName,
        vendorCountry: po.vendorCountry,
        hospitalDestination: po.hospitalName || prev.hospitalDestination,
        quantity: po.quantity || prev.quantity
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.vendorName.trim()) {
      alert('กรุณากรอกชื่อสินค้าและชื่อบริษัทผู้ผลิต');
      return;
    }
    if (window.saveAeronDictionaryItem) {
      if (formData.productName) window.saveAeronDictionaryItem('product', formData.productName);
      if (formData.vendorName) window.saveAeronDictionaryItem('payee', formData.vendorName);
      if (formData.shippingCompany) window.saveAeronDictionaryItem('forwarder', formData.shippingCompany);
    }
    onSave({
      ...formData,
      cbm: Number(formData.cbm) || 0,
      grossWeight: Number(formData.grossWeight) || 0,
      shippingCost: Number(formData.shippingCost) || 0,
      dutyTaxes: Number(formData.dutyTaxes) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🚢 {shipment ? 'แก้ไขข้อมูลนำเข้าสินค้า' : 'บันทึกรายการนำเข้าสินค้าใหม่ (Shipment Tracking)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ชิปปิ้ง / Tracking ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.shipmentNumber}
                onChange={(e) => setFormData({ ...formData, shipmentNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เชื่อมโยงใบสั่งซื้อ (PO)</label>
              <select
                value={formData.poId}
                onChange={(e) => handlePOSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
              >
                <option value="">-- เลือก PO ในระบบ --</option>
                {(purchaseOrders || []).map(po => (
                  <option key={po.id} value={po.id}>
                    📄 {po.poNumber} - {po.vendorName} ({po.productName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อรุ่นสินค้าที่นำเข้า <span className="text-rose-400">*</span></label>
              <SmartSuggestInput
                category="product"
                required
                placeholder="เช่น AERON Cardio 12L-AI"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทผู้ผลิต / Vendor <span className="text-rose-400">*</span></label>
              <SmartSuggestInput
                category="payee"
                required
                placeholder="เช่น Mindray Medical, Sonoscape"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทขนส่ง (Freight Carrier)</label>
              <SmartSuggestInput
                category="forwarder"
                placeholder="เช่น DHL, Kuehne+Nagel, FedEx"
                value={formData.shippingCompany}
                onChange={(e) => setFormData({ ...formData, shippingCompany: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลข Air Waybill / Bill of Lading</label>
              <input
                type="text"
                placeholder="เช่น AWB-98765432"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ขนส่งทางไหน</label>
              <select
                value={formData.transportType}
                onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold"
              >
                {window.TRANSPORT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">ปริมาตร (CBM)</label>
              <input
                type="number"
                step="0.1"
                value={formData.cbm}
                onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">น้ำหนักรวม (kg)</label>
              <input
                type="number"
                step="0.5"
                value={formData.grossWeight}
                onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าขนส่ง (บาท)</label>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ภาษีศุลกากร (บาท)</label>
              <input
                type="number"
                value={formData.dutyTaxes}
                onChange={(e) => setFormData({ ...formData, dutyTaxes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-purple-300 font-bold font-mono outline-none"
              />
            </div>
          </div>

          {/* 📅 Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* วันที่จ่ายเงิน */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>💳 วันที่จ่ายเงิน</span>
                {formData.paymentDate && (
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    {(() => {
                      const p = new Date(formData.paymentDate);
                      const t = new Date();
                      p.setHours(0,0,0,0);
                      t.setHours(0,0,0,0);
                      const diff = Math.floor((t - p) / 86400000);
                      return diff >= 0 ? `(ผ่านมา ${diff} วัน)` : `(อีก ${Math.abs(diff)} วัน)`;
                    })()}
                  </span>
                )}
              </label>
              <input
                type="date"
                value={formData.paymentDate || ''}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-300 font-mono font-bold outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            {/* วันที่ส่งออก (ETD) */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-slate-300">🛫 ส่งออกจากต้นทาง (ETD)</label>
              <input
                type="date"
                value={formData.etd}
                onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            {/* วันที่คาดว่าถึงไทย (ETA) */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-slate-300">🛬 คาดว่าถึงไทย (ETA)</label>
              <input
                type="date"
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            {/* สถานะการนำเข้า */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-slate-300">🏷️ สถานะนำเข้า <span className="text-rose-400">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-2 text-cyan-300 font-bold outline-none focus:border-cyan-400 text-xs"
              >
                {window.SHIPMENT_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชิปปิ้ง / ตัวแทนศุลกากร & หมายเหตุ</label>
            <input
              type="text"
              placeholder="ระบุบริษัทชิปปิ้ง เที่ยวบิน หรือข้อความเพิ่มเติม..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30">
              บันทึกรายการนำเข้า
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
