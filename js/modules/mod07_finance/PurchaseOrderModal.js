// MODULE: mod07_finance/PurchaseOrderModal.js

function PurchaseOrderModal({ po, projects = [], products = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (po) return { ...po };
    const wonProjects = projects.filter(p => p.status === 'stage_won' || p.status === 'stage_ordering' || p.status === 'stage_delivery');
    const firstProj = wonProjects[0] || projects[0] || {};
    return {
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      year: new Date().getFullYear(),
      projectId: firstProj.id || '',
      hospitalName: firstProj.hospitalName || '',
      vendorId: window.VENDOR_LIST[0].id,
      vendorName: window.VENDOR_LIST[0].name,
      vendorCountry: window.VENDOR_LIST[0].country,
      currency: window.VENDOR_LIST[0].currency || 'THB',
      productId: firstProj.productId || (products[0] ? products[0].id : ''),
      productName: firstProj.productName || (products[0] ? products[0].name : ''),
      quantity: firstProj.quantity || 1,
      unitPrice: 100000,
      totalAmountFX: 100000,
      exchangeRate: 1,
      totalAmountTHB: firstProj.budget || 100000,
      poDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      status: 'ร่าง PO',
      note: ''
    };
  });

  const handleProjectSelect = (projId) => {
    const selected = projects.find(p => p.id === projId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        projectId: projId,
        hospitalName: selected.hospitalName,
        productId: selected.productId || prev.productId,
        productName: selected.productName || prev.productName,
        quantity: selected.quantity || prev.quantity,
        totalAmountTHB: selected.budget || prev.totalAmountTHB
      }));
    } else {
      setFormData(prev => ({ ...prev, projectId: projId }));
    }
  };

  const handleVendorSelect = (vendorId) => {
    const v = window.VENDOR_LIST.find(x => x.id === vendorId);
    if (v) {
      let defaultRate = 1;
      if (v.currency === 'USD') defaultRate = 36.5;
      if (v.currency === 'EUR') defaultRate = 39.5;
      if (v.currency === 'JPY') defaultRate = 0.24;

      setFormData(prev => ({
        ...prev,
        vendorId,
        vendorName: v.name,
        vendorCountry: v.country,
        currency: v.currency,
        exchangeRate: defaultRate,
        totalAmountTHB: prev.quantity * prev.unitPrice * defaultRate
      }));
    }
  };

  const updateCalc = (field, val) => {
    const newForm = { ...formData, [field]: val };
    const qty = Number(newForm.quantity) || 1;
    const price = Number(newForm.unitPrice) || 0;
    const rate = Number(newForm.exchangeRate) || 1;
    newForm.totalAmountFX = qty * price;
    newForm.totalAmountTHB = qty * price * rate;
    setFormData(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.poNumber.trim()) {
      alert('กรุณากรอกเลขที่ PO');
      return;
    }
    if (window.saveAeronDictionaryItem) {
      if (formData.hospitalName) window.saveAeronDictionaryItem('hospital', formData.hospitalName);
      if (formData.vendorName) window.saveAeronDictionaryItem('payee', formData.vendorName);
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🛒 {po ? 'แก้ไขใบสั่งซื้อ' : 'ออกใบสั่งซื้อ (Issue Purchase Order)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ PO <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ปีงบประมาณ / สั่งซื้อ</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
              >
                <option value="2026">2026 (พ.ศ. 2569)</option>
                <option value="2025">2025 (พ.ศ. 2568)</option>
                <option value="2024">2024 (พ.ศ. 2567)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เลือกโครงการที่ชนะงาน (เพื่อเชื่อมข้อมูล)</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              <option value="">-- ไม่ระบุ / สั่งซื้ออิสระ --</option>
              {(projects || []).map(p => (
                <option key={p.id} value={p.id}>
                  🏥 {p.hospitalName} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / ลูกค้า</label>
              <SmartSuggestInput
                category="hospital"
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Vendor / ผู้จัดจำหน่าย <span className="text-rose-400">*</span></label>
              <select
                value={formData.vendorId}
                onChange={(e) => handleVendorSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-semibold text-amber-300 outline-none"
              >
                {window.VENDOR_LIST.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.country})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้าที่สั่งซื้อ</label>
              <input
                type="text"
                required
                placeholder="เช่น AERON Cardio 12L-AI"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">จำนวนสั่งซื้อ</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateCalc('quantity', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-center outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ราคาต่อหน่วย (Foreign FX)</label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => updateCalc('unitPrice', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">สกุลเงิน / อัตราแลกเปลี่ยน</label>
              <div className="flex gap-1">
                <select
                  value={formData.currency}
                  onChange={(e) => updateCalc('currency', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold outline-none"
                >
                  <option value="THB">THB (฿)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Rate"
                  value={formData.exchangeRate}
                  onChange={(e) => updateCalc('exchangeRate', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">มูลค่ารวม (บาท THB)</label>
              <input
                type="number"
                value={formData.totalAmountTHB}
                onChange={(e) => setFormData({ ...formData, totalAmountTHB: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ออก PO</label>
              <input
                type="date"
                value={formData.poDate}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">กำหนดรับของ (Expected)</label>
              <input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">สถานะ PO</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold text-indigo-300"
              >
                {window.PO_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / เงื่อนไขจัดส่ง</label>
            <textarea
              rows="2"
              placeholder="ระบุข้อความหรือหมายเหตุถึง Vendor..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">บันทึกใบสั่งซื้อ PO</button>
          </div>

        </form>
      </div>
    </div>
  );
}
