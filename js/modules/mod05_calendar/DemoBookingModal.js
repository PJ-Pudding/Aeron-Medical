// MODULE: mod05_calendar/DemoBookingModal.js

function DemoBookingModal({ prefill, projects = [], products = [], members = [], existingBookings = [], onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: prefill?.id || undefined,
    projectId: prefill?.projectId || '',
    hospitalName: prefill?.hospitalName || '',
    productId: prefill?.productId || (products[0] ? products[0].id : ''),
    demoSerial: prefill?.demoSerial || '',
    salesPerson: prefill?.salesPerson || (members[0] ? members[0].name : ''),
    startDate: prefill?.startDate || new Date().toISOString().split('T')[0],
    endDate: prefill?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: prefill?.status || 'อนุมัติคิว',
    expenseAmount: prefill?.expenseAmount || prefill?.demoCost || '',
    outcomeStatus: prefill?.outcomeStatus || 'กำลังทดสอบ / รอผล',
    note: prefill?.note || ''
  });

  const [conflictWarning, setConflictWarning] = useState('');

  const selectedProduct = products.find(p => p.id === formData.productId);

  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !formData.productId) {
      setConflictWarning('');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    const conflicts = existingBookings.filter(b => {
      if (b.id === formData.id) return false;
      if (b.productId !== formData.productId) return false;

      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);

      return (start <= bEnd && end >= bStart);
    });

    if (conflicts.length > 0) {
      const c = conflicts[0];
      setConflictWarning(`⚠️ คำเตือน: เครื่องรุ่นนี้ถูกจองคิวแล้วโดย ${c.salesPerson} ที่ ${c.hospitalName} ช่วงวันที่ ${c.startDate} ถึง ${c.endDate}`);
    } else {
      setConflictWarning('');
    }
  }, [formData.startDate, formData.endDate, formData.productId, existingBookings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.productId) {
      alert('กรุณากรอกชื่อโรงพยาบาลและเลือกรุ่นสินค้าสาธิต');
      return;
    }

    if (window.saveAeronDictionaryItem && formData.hospitalName) {
      window.saveAeronDictionaryItem('hospital', formData.hospitalName);
    }
    const prod = products.find(p => p.id === formData.productId);
    onSave({
      ...formData,
      productName: prod ? prod.name : 'เครื่องมือแพทย์ AERON',
      productCategory: prod ? prod.category : 'อุปกรณ์แพทย์'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-modal font-sans text-slate-100">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧪</span>
            <h3 className="font-extrabold text-white text-base">ระบบจองคิวเครื่องสาธิต (Demo Booking)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {conflictWarning && (
          <div className="bg-amber-950/70 border border-amber-500/50 p-3 rounded-2xl text-amber-200 text-xs flex items-start gap-2 shadow-md">
            <span className="text-base leading-none">⚠️</span>
            <div className="leading-snug">{conflictWarning}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่อโรงพยาบาล / โครงการ <span className="text-rose-400">*</span></label>
            <SmartSuggestInput
              category="hospital"
              required
              placeholder="ระบุชื่อโรงพยาบาล..."
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เครื่องสาธิตส่วนกลาง (Product Model) <span className="text-rose-400">*</span></label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-bold"
            >
              {(products || []).map(p => (
                <option key={p.id} value={p.id}>
                  📦 {p.name} (มี {p.demoUnitsAvailable || 1} เครื่อง)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="text-white text-sm">📅</span>
                <span>วันเริ่มนัดเดโม่</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-purple-500 shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="text-white text-sm">📅</span>
                <span>ถึงวันที่ (สิ้นสุด)</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-purple-500 shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้จอง / เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
              >
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>👤 {m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลขอุปกรณ์ (SN)</label>
              <select
                value={formData.demoSerial}
                onChange={(e) => setFormData({ ...formData, demoSerial: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-mono"
              >
                <option value="">-- เลือกหมายเลข SN เครื่อง --</option>
                {selectedProduct && selectedProduct.serials ? (
                  selectedProduct.serials.map(sn => (
                    <option key={sn} value={sn}>🔹 {sn}</option>
                  ))
                ) : (
                  <option value="SN-AERON-DEMO-01">🔹 SN-AERON-DEMO-01</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">💸 ค่าใช้จ่ายเดโม่ (บาท THB)</label>
              <input
                type="number"
                placeholder="เช่น 1500 (ค่าน้ำมัน/ขนส่ง)"
                value={formData.expenseAmount}
                onChange={(e) => setFormData({ ...formData, expenseAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">🎯 สถานะผลลัพธ์การเดโม่</label>
              <select
                value={formData.outcomeStatus}
                onChange={(e) => setFormData({ ...formData, outcomeStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-semibold"
              >
                <option value="กำลังทดสอบ / รอผล">⏳ กำลังทดสอบ / รอผล</option>
                <option value="ชนะประมูล / ปิดการขายสำเร็จ">🏆 ชนะประมูล / ปิดการขายสำเร็จ</option>
                <option value="แพ้ประมูล / ปิดไม่สำเร็จ">❌ แพ้ประมูล / ปิดไม่สำเร็จ</option>
                <option value="ขยายเวลาทดสอบ">🔄 ขยายเวลาทดสอบ</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุการประสานงาน / ติดตั้ง</label>
            <textarea
              rows="2"
              placeholder="ระบุสถานที่ แผนก หรือช่างผู้เข้าติดตั้งเครื่อง..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30"
            >
              บันทึกการจองคิว
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
