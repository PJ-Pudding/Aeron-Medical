// MODULE: mod04_logistics/RepairTicketModal.js

function RepairTicketModal({ ticket, products = [], members = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (ticket) return { ...ticket };
    const firstProd = products[0] || {};
    const firstSN = firstProd.demoSerialNumbers ? firstProd.demoSerialNumbers[0] : '';
    return {
      ticketNumber: `REP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      productCategory: '',
      productName: '',
      sn: '',
      repairedItems: '',
      issueDescription: '',
      lastHospital: '',
      lastUser: '',
      salesPerson: '',
      repairVendor: '',
      sentDate: new Date().toISOString().split('T')[0],
      returnedDate: '',
      repairCost: '',
      shippingCost: '',
      category: '',
      status: '',
      location: ''
    };
  });

  const handleProductSelect = (pName) => {
    const p = products.find(prod => prod.name === pName);
    if (p) {
      const snList = p.demoSerialNumbers || [];
      setFormData(prev => ({
        ...prev,
        productName: p.name,
        productCategory: p.category,
        sn: snList[0] || prev.sn
      }));
    } else {
      setFormData(prev => ({ ...prev, productName: pName }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.issueDescription.trim()) {
      alert('กรุณากรอกชื่อรุ่นสินค้าและอาการเสีย');
      return;
    }
    if (window.batchSaveAeronDictionary) {
      window.batchSaveAeronDictionary({
        product: formData.productName ? [formData.productName] : [],
        accessory: formData.repairedItems ? [formData.repairedItems] : [],
        repair_symptom: formData.issueDescription ? [formData.issueDescription] : [],
        hospital: formData.lastHospital ? [formData.lastHospital] : [],
        doctor: formData.lastUser ? [formData.lastUser] : []
      });
    } else if (window.saveAeronDictionaryItem) {
      if (formData.productName) window.saveAeronDictionaryItem('product', formData.productName);
      if (formData.repairedItems) window.saveAeronDictionaryItem('accessory', formData.repairedItems);
      if (formData.issueDescription) window.saveAeronDictionaryItem('repair_symptom', formData.issueDescription);
      if (formData.lastHospital) window.saveAeronDictionaryItem('hospital', formData.lastHospital);
      if (formData.lastUser) window.saveAeronDictionaryItem('doctor', formData.lastUser);
    }
    onSave({
      ...formData,
      repairCost: parseAeronNumber(formData.repairCost),
      shippingCost: parseAeronNumber(formData.shippingCost)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🔧 {ticket ? 'แก้ไขใบส่งซ่อม' : 'เปิดใบส่งซ่อมใหม่ (Repair Service Ticket)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ใบส่งซ่อม <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.ticketNumber}
                onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-rose-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category สินค้าที่ส่งซ่อม</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              >
                <option value="">-- เลือกประเภทการซ่อม --</option>
                {window.REPAIR_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้าที่ส่งซ่อม <span className="text-rose-400">*</span></label>
              <SmartSuggestInput
                category="product"
                required
                placeholder="เลือกหรือพิมพ์ชื่อรุ่นสินค้า"
                value={formData.productName}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลข SN เครื่อง</label>
              <input
                type="text"
                placeholder="เช่น AERON-DEMO-ECG-01"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชิ้นส่วน หรือ อุปกรณ์ในเซ็ต ที่ส่งซ่อม <span className="text-rose-400">*</span></label>
            <SmartSuggestInput
              category="accessory"
              required
              placeholder="เช่น ตัวเครื่องหลัก, หัวโพรบ Linear Probe, สาย Lead 10 เส้น, แท่นชาร์จ..."
              value={formData.repairedItems}
              onChange={(e) => setFormData({ ...formData, repairedItems: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">อาการเสีย / สิ่งที่ชำรุด <span className="text-rose-400">*</span></label>
            <SmartSuggestInput
              category="repair_symptom"
              required
              placeholder="อธิบายอาการเสีย เช่น ชาร์จไฟไม่เข้า, หน้าจอไม่ติด, สายขาด..."
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ใช้ครั้งสุดท้ายจาก รพ. ไหน</label>
              <SmartSuggestInput
                category="hospital"
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.lastHospital}
                onChange={(e) => setFormData({ ...formData, lastHospital: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ระบุตัวคนใช้ / อาจารย์ผู้ใช้</label>
              <SmartSuggestInput
                category="doctor"
                placeholder="เช่น พญ.สมศรี / พยาบาล ER"
                value={formData.lastUser}
                onChange={(e) => setFormData({ ...formData, lastUser: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ที่รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                <option value="">-- เลือกเซลส์ที่รับผิดชอบ --</option>
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ส่งซ่อมกับเจ้าไหน / ศูนย์ซ่อม</label>
              <input
                type="text"
                placeholder="เช่น AERON Service Center (ไทย) / Drager Germany"
                value={formData.repairVendor}
                onChange={(e) => setFormData({ ...formData, repairVendor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ที่อยู่ / สถานที่ประจำเครื่องปัจจุบัน</label>
              <input
                type="text"
                placeholder="เช่น ศูนย์ซ่อม AERON กรุงเทพฯ / คลังสินค้า"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ส่งเข้าซ่อม</label>
              <input
                type="date"
                value={formData.sentDate}
                onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ได้รับของคืน (Expected Return)</label>
              <input
                type="date"
                value={formData.returnedDate}
                onChange={(e) => setFormData({ ...formData, returnedDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าใช้จ่ายในการซ่อม (บาท)</label>
              <AeronNumberInput
                placeholder="0"
                value={formData.repairCost}
                onChange={(e) => setFormData({ ...formData, repairCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
                unit="บาท"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าขนส่ง (บาท)</label>
              <AeronNumberInput
                placeholder="0"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
                unit="บาท"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">สถานะการส่งซ่อม</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-bold outline-none"
              >
                <option value="">-- เลือกสถานะการส่งซ่อม --</option>
                {window.REPAIR_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30">
              บันทึกใบส่งซ่อม
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
