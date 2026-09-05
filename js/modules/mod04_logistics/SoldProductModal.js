// MODULE: mod04_logistics/SoldProductModal.js

function SoldProductModal({ asset, projects = [], members = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (asset) return { ...asset };
    const wonProj = projects.find(p => p.status === 'stage_delivery' || p.status === 'stage_completed') || projects[0] || {};
    const delivDate = new Date().toISOString().split('T')[0];
    const delivYr = new Date().getFullYear();

    return {
      assetNumber: `AST-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      contractNumber: '',
      projectId: '',
      hospitalName: '',
      department: '',
      productName: '',
      brand: '',
      productCategory: '',
      serialNumber: '',
      freebies: '',
      salesPerson: '',
      contactPerson: '',
      deliveryDate: delivDate,
      projectValue: '',
      dfAmount: '',
      bidGuaranteeAmount: '',
      bidGuaranteeRefundDate: '',
      warrantyYears: 1,
      warrantyExpiryDate: '',
      nextPmDate: '',
      pmFrequency: '',
      pmStatus: '',
      status: 'รับมอบเรียบร้อย'
    };
  });

  const handleProjectSelect = (pId) => {
    const p = projects.find(x => x.id === pId);
    if (p) {
      setFormData(prev => ({
        ...prev,
        projectId: p.id,
        hospitalName: p.hospitalName,
        productName: p.productName || prev.productName,
        salesPerson: p.assignee || prev.salesPerson,
        projectValue: p.budget || prev.projectValue,
        dfAmount: p.dfAmount || prev.dfAmount,
        bidGuaranteeAmount: Math.round((p.budget || prev.projectValue) * 0.05)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.productName.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาลและชื่อรุ่นสินค้า');
      return;
    }
    if (window.batchSaveAeronDictionary) {
      window.batchSaveAeronDictionary({
        hospital: [formData.hospitalName],
        department: formData.department ? [formData.department] : [],
        product: [formData.productName],
        brand: formData.brand ? [formData.brand] : []
      });
    } else if (window.saveAeronDictionaryItem) {
      if (formData.hospitalName) window.saveAeronDictionaryItem('hospital', formData.hospitalName);
      if (formData.department) window.saveAeronDictionaryItem('department', formData.department);
      if (formData.productName) window.saveAeronDictionaryItem('product', formData.productName);
      if (formData.brand) window.saveAeronDictionaryItem('brand', formData.brand);
    }
    onSave({
      ...formData,
      projectValue: parseAeronNumber(formData.projectValue),
      dfAmount: parseAeronNumber(formData.dfAmount),
      bidGuaranteeAmount: parseAeronNumber(formData.bidGuaranteeAmount)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>📦 {asset ? 'แก้ไขข้อมูลสินค้าที่ขายแล้ว' : 'บันทึกการส่งมอบสินค้าใหม่ (Delivered Asset)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รหัสครุภัณฑ์ / Asset Code <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.assetNumber}
                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่สัญญา / PO โรงพยาบาล</label>
              <input
                type="text"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เชื่อมโยงโครงการในระบบ (ถ้ามี)</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              <option value="">-- ไม่เชื่อมโยง / บันทึกแยกอิสระ --</option>
              {(projects || []).map(p => (
                <option key={p.id} value={p.id}>
                  🏥 {p.hospitalName} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / ลูกค้า <span className="text-rose-400">*</span></label>
              <SmartSuggestInput
                category="hospital"
                required
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">แผนกที่ติดตั้ง</label>
              <SmartSuggestInput
                category="department"
                placeholder="เช่น แผนกห้องผ่าตัด (OR)"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                <option value="">-- เลือกเซลส์ผู้รับผิดชอบ --</option>
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้า <span className="text-rose-400">*</span></label>
              <SmartSuggestInput
                category="product"
                required
                placeholder="เช่น Bojin 5600"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ยี่ห้อ (Brand)</label>
              <SmartSuggestInput
                category="brand"
                placeholder="เช่น Bojin, AERON MEDICAL"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลข Serial Number</label>
              <input
                type="text"
                placeholder="เช่น SN-AERON-..."
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">🎁 ของแถม / รายการอุปกรณ์ประกอบในสัญญา</label>
            <textarea
              rows="2"
              placeholder="ระบุของแถม เช่น กระดาษบันทึก 10 ม้วน, สาย Lead สำรอง, รถเข็นสแตนเลส..."
              value={formData.freebies}
              onChange={(e) => setFormData({ ...formData, freebies: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">วันที่ส่งมอบสินค้า</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">มูลค่างาน (บาท)</label>
              <AeronNumberInput
                placeholder="เช่น 1,000,000"
                value={formData.projectValue}
                onChange={(e) => setFormData({ ...formData, projectValue: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold font-mono outline-none"
                unit="บาท"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่า DF (Doctor Fee)</label>
              <AeronNumberInput
                placeholder="เช่น 100,000"
                value={formData.dfAmount}
                onChange={(e) => setFormData({ ...formData, dfAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-purple-300 font-semibold font-mono outline-none"
                unit="บาท"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">จำนวนเงินค้ำประกันซอง (บาท)</label>
              <AeronNumberInput
                placeholder="เช่น 50,000"
                value={formData.bidGuaranteeAmount}
                onChange={(e) => setFormData({ ...formData, bidGuaranteeAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
                unit="บาท"
              />
            </div>

            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">วันที่กำหนดรับคืนเงินประกันซอง</label>
              <input
                type="date"
                value={formData.bidGuaranteeRefundDate}
                onChange={(e) => setFormData({ ...formData, bidGuaranteeRefundDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-emerald-400 font-semibold">วันหมดอายุการรับประกัน (Warranty)</label>
              <input
                type="date"
                value={formData.warrantyExpiryDate}
                onChange={(e) => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-purple-300 font-semibold">วันที่ต้องเข้าทำ PM ครั้งถัดไป</label>
              <input
                type="date"
                value={formData.nextPmDate}
                onChange={(e) => setFormData({ ...formData, nextPmDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30">
              บันทึกรายการสินค้าที่ขายแล้ว
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
