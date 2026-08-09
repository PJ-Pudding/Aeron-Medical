// MODULE: mod08_hr/LeaveModal.js

function LeaveModal({ members = [], currentUser, onSave, onClose }) {
  const [employeeName, setEmployeeName] = useState(() => {
    if (currentUser && currentUser.name) return currentUser.name;
    return members.length > 0 ? members[0].name : 'สมชาย สายลุย';
  });
  const [leaveType, setLeaveType] = useState('🤒 ลาป่วย (Sick Leave)');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalDays, setTotalDays] = useState(1);
  const [reason, setReason] = useState('');

  // Auto calculate working days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateWorkingDays(startDate, endDate);
      setTotalDays(days > 0 ? days : 1);
    }
  }, [startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('กรุณาระบุเหตุผลการยื่นลา');
      return;
    }

    // Auto approve if submitted by OWNER or HEAD_ADMIN or SALES_HEAD
    const userRole = currentUser?.role ? String(currentUser.role).toUpperCase() : '';
    const autoApprove = ['OWNER', 'HEAD_ADMIN', 'SALES_HEAD'].includes(userRole);

    const leaveData = {
      id: `leave-${Date.now()}`,
      employeeName,
      leaveType,
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason,
      status: autoApprove ? '✅ อนุมัติแล้ว' : '⏳ รออนุมัติ',
      approvedBy: autoApprove ? (currentUser?.name || 'หัวหน้างาน') : '',
      createdAt: new Date().toISOString()
    };

    onSave(leaveData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
              🌴
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">แบบฟอร์มยื่นคำขอลา (Leave Request Form)</h3>
              <p className="text-xs text-slate-400">ลงบันทึกวันลาป่วย / ลากิจ / ลาพักร้อน เข้าสู่ระบบ HR</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">พนักงานผู้ยื่นขอลา <span className="text-rose-400">*</span></label>
            <select
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500 font-medium"
            >
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ประเภทการลา <span className="text-rose-400">*</span></label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 outline-none focus:border-emerald-500 font-bold"
            >
              <option value="🤒 ลาป่วย (Sick Leave)">🤒 ลาป่วย (Sick Leave) - สิทธิ์ 30 วัน/ปี</option>
              <option value="🌴 ลากิจ (Personal Leave)">🌴 ลากิจ (Personal Leave) - สิทธิ์ 6 วัน/ปี</option>
              <option value="🏖️ ลาพักร้อน (Vacation Leave)">🏖️ ลาพักร้อน (Vacation Leave) - สิทธิ์ 6 วัน/ปี</option>
              <option value="🏥 ลาคลอด / ลากิจพิเศษ">🏥 ลาคลอด / ลากิจพิเศษกรณีจำเป็น</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่เริ่มลา <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none font-mono focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ถึงวันที่ <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none font-mono focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">จำนวนวันลาทั้งหมด</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={totalDays}
                onChange={(e) => setTotalDays(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-bold font-mono outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center">
              <div className="text-[11px] text-slate-400">สถานะเริ่มต้นคำขอ:</div>
              <div className="font-bold text-amber-300 text-xs mt-0.5">
                {['OWNER', 'HEAD_ADMIN', 'SALES_HEAD'].includes(currentUser?.role ? String(currentUser.role).toUpperCase() : '') ? '✅ อนุมัติอัตโนมัติ (สิทธิ์หัวหน้า)' : '⏳ รอหัวหน้างานอนุมัติ'}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เหตุผลประกอบการลา <span className="text-rose-400">*</span></label>
            <textarea
              rows="3"
              required
              placeholder="เช่น มีไข้สูงไปพบแพทย์, ลากิจติดต่อหน่วยงานราชการ, ลาพักร้อนท่องเที่ยวประจำปี..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500"
            ></textarea>
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
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
            >
              <span>🌴 ยื่นคำขอลา</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
