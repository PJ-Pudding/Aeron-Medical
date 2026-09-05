// MODULE: mod06_fda/FDAModal.js

function FDAModal({ fda, products = [], members = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (fda) return { ...fda };
    const firstProd = products[0] || {};
    const delivYr = new Date().getFullYear();

    return {
      registrationNumber: `FDA-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      fdaLicenseNo: '',
      productName: '',
      brand: '',
      vendorName: '',
      deviceClass: '',
      targetDays: '',
      agencyName: '',
      raSpecialist: '',
      costTHB: '',
      submissionType: '',
      paymentDate: new Date().toISOString().split('T')[0],
      approvalDate: '',
      expiryDate: '',
      status: '',
      notes: ''
    };
  });

  const handleClassSelect = (classCode) => {
    const clsObj = window.FDA_CLASSES.find(c => c.code === classCode);
    if (clsObj) {
      setFormData(prev => ({
        ...prev,
        deviceClass: clsObj.code,
        targetDays: clsObj.targetDays
      }));
    }
  };

  const handleProductSelect = (pName) => {
    const p = products.find(x => x.name === pName);
    if (p) {
      setFormData(prev => ({
        ...prev,
        productName: p.name,
        brand: p.brand || prev.brand,
        vendorName: p.manufacturer || prev.vendorName
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.vendorName.trim()) {
      alert('กรุณากรอกชื่อสินค้าและบริษัทผู้ผลิต');
      return;
    }
    if (window.batchSaveAeronDictionary) {
      window.batchSaveAeronDictionary({
        brand: formData.brand ? [formData.brand] : [],
        payee: formData.vendorName ? [formData.vendorName] : [],
        product: formData.productName ? [formData.productName] : []
      });
    } else if (window.saveAeronDictionaryItem) {
      if (formData.brand) window.saveAeronDictionaryItem('brand', formData.brand);
      if (formData.vendorName) window.saveAeronDictionaryItem('payee', formData.vendorName);
      if (formData.productName) window.saveAeronDictionaryItem('product', formData.productName);
    }
    onSave({
      ...formData,
      costTHB: parseAeronNumber(formData.costTHB),
      targetDays: parseAeronNumber(formData.targetDays) || 30
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🛡️ {fda ? 'แก้ไขข้อมูลการยื่นขอ อย.' : 'บันทึกการยื่นขอ อย. ใหม่ (Thai FDA Registration)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รหัสอ้างอิงคำขอ / FDA ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ใบรับจดแจ้ง / ใบอนุญาต อย.</label>
              <input
                type="text"
                placeholder="เช่น 65-1-2-2-0008891 (ถ้ามี)"
                value={formData.fdaLicenseNo}
                onChange={(e) => setFormData({ ...formData, fdaLicenseNo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลือกสินค้าในแคตตาล็อก <span className="text-rose-400">*</span></label>
              <select
                value={formData.productName}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              >
                <option value="">-- เลือกรุ่นสินค้าในแคตตาล็อก --</option>
                {(products || []).map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ยี่ห้อ (Brand)</label>
              <SmartSuggestInput
                category="brand"
                placeholder="เช่น Mindray, Sonoscape"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทผู้ผลิต / Vendor ต่างประเทศ <span className="text-rose-400">*</span></label>
              <SmartSuggestInput
                category="payee"
                required
                placeholder="เช่น Mindray Medical Singapore"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">Class เครื่องมือแพทย์ (เกณฑ์เวลา อย.) <span className="text-rose-400">*</span></label>
              <select
                value={formData.deviceClass}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold outline-none"
              >
                <option value="">-- เลือกระดับความเสี่ยง อย. --</option>
                {window.FDA_CLASSES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">จำนวนวันทำการเกณฑ์ SLA อย.</label>
              <AeronNumberInput
                placeholder="เช่น 30"
                allowDecimals={false}
                value={formData.targetDays}
                onChange={(e) => setFormData({ ...formData, targetDays: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold outline-none"
                unit="วัน"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทที่ทำหน้าที่รับจด</label>
              <input
                type="text"
                placeholder="เช่น Pharmatech FDA Consulting"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้รับผิดชอบ RA / เภสัชกร</label>
              <input
                type="text"
                placeholder="เช่น ภก. วิศรุต"
                value={formData.raSpecialist}
                onChange={(e) => setFormData({ ...formData, raSpecialist: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ราคาค่าจด อย. (บาท)</label>
              <AeronNumberInput
                placeholder="เช่น 50,000"
                value={formData.costTHB}
                onChange={(e) => setFormData({ ...formData, costTHB: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold outline-none"
                unit="บาท"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">วันที่เริ่มจ่ายเงิน / ยื่นคำขอ <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-emerald-400 font-semibold">วันที่เสร็จ / อนุมัติใบอนุญาต</label>
              <input
                type="date"
                value={formData.approvalDate}
                onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-orange-400 font-semibold">วันที่ใบ อย. หมดอายุ</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">สถานะคำขอปัจจุบัน <span className="text-rose-400">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
              >
                <option value="">-- เลือกสถานะคำขอ --</option>
                {window.FDA_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทการยื่น</label>
              <select
                value={formData.submissionType}
                onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                <option value="">-- เลือกประเภทการยื่น --</option>
                <option value="ยื่นขอใหม่">ยื่นขอใหม่ (New Filing)</option>
                <option value="ยื่นขอต่ออายุ">ยื่นขอต่ออายุ (Renewal)</option>
                <option value="ขอแก้ไขรายการ">ขอแก้ไขรายการ (Amendment)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / ประวัติการแก้ไขตามสั่ง อย.</label>
            <input
              type="text"
              placeholder="ระบุข้อความหรือประวัติการติดต่อกับเจ้าหน้าที่ อย...."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/30">
              บันทึกรายการจด อย.
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
