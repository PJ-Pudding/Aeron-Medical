// MODULE: mod08_hr/AttendanceModal.js

function AttendanceModal({ members = [], onSave, onClose }) {
  const [employeeName, setEmployeeName] = useState(() => members.length > 0 ? members[0].name : 'สมชาย สายลุย');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('⏰ มาสาย');
  const [lateMinutes, setLateMinutes] = useState(15);
  const [fineAmount, setFineAmount] = useState(150);
  const [note, setNote] = useState('');

  // Auto calculate fine amount when type or minutes change
  useEffect(() => {
    if (type === '⏰ มาสาย') {
      const mins = Number(lateMinutes) || 0;
      setFineAmount(mins * 10); // 10 THB per minute late
    } else if (type === '🚫 ขาดงาน') {
      setLateMinutes(0);
      setFineAmount(500); // 500 THB fine for absence
    } else if (type === '⚠️ ออกก่อนเวลา') {
      const mins = Number(lateMinutes) || 0;
      setFineAmount(mins * 10);
    }
  }, [type, lateMinutes]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const attData = {
      id: `att-${Date.now()}`,
      date,
      employeeName,
      type,
      lateMinutes: Number(lateMinutes) || 0,
      fineAmount: Number(fineAmount) || 0,
      note: note || (type === '⏰ มาสาย' ? `มาสาย ${lateMinutes} นาที` : 'ขาดงานโดยไม่แจ้งล่วงหน้า'),
      createdAt: new Date().toISOString()
    };

    onSave(attData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shadow-inner">
              ⏰
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">แบบฟอร์มบันทึก ขาด - มาสาย (Attendance Log)</h3>
              <p className="text-xs text-slate-400">บันทึกการมาสาย ขาดงาน พร้อมคำนวณหักเงินค่าปรับ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ทำรายการ <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none font-mono focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อพนักงาน <span className="text-rose-400">*</span></label>
              <select
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 outline-none focus:border-indigo-500 font-bold"
              >
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ประเภทรายการ <span className="text-rose-400">*</span></label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-rose-400 outline-none focus:border-rose-500 font-extrabold"
            >
              <option value="⏰ มาสาย">⏰ มาสาย (Tardiness) - หัก 10 บาท/นาที</option>
              <option value="🚫 ขาดงาน">🚫 ขาดงาน (Absence) - หักค่าปรับ 500 บาท/ครั้ง</option>
              <option value="⚠️ ออกก่อนเวลา">⚠️ ออกก่อนเวลา (Early Leave)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {type !== '🚫 ขาดงาน' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">จำนวนนาทีที่สาย</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={lateMinutes}
                  onChange={(e) => setLateMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-bold font-mono outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className={type === '🚫 ขาดงาน' ? 'col-span-2 space-y-1' : 'space-y-1'}>
              <label className="font-semibold text-slate-300">ยอดหักเงินค่าปรับ (บาท)</label>
              <input
                type="number"
                min="0"
                required
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-rose-400 font-extrabold font-mono outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / สาเหตุที่สายหรือขาดงาน</label>
            <input
              type="text"
              placeholder="ระบุ เช่น จราจรติดขัดหนัก, ป่วยกะทันหันไม่ได้แจ้ง..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <span>⏰ บันทึก ขาด / มาสาย</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
