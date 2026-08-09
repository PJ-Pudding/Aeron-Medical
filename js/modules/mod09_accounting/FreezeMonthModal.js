// MODULE: mod09_accounting/FreezeMonthModal.js

function FreezeMonthModal({ frozenMonths = [], onToggleFreeze, onClose }) {
  const [targetMonth, setTargetMonth] = useState('2026-06');

  const handleToggle = (monthStr) => {
    onToggleFreeze(monthStr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shadow-inner">
              🔒
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">ระบบล็อกงบการเงินรายเดือน (Freeze Month)</h3>
              <p className="text-xs text-slate-400">ปิดงบประจำเดือน ห้ามไม่ให้เพิ่ม แก้ไข หรือลบรายการ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Quick Month Freeze Selector */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="font-bold text-slate-200">🔒 เลือกเดือนที่ต้องการ ปิดงบ / ล็อก (Freeze):</div>
          
          <div className="flex gap-2">
            <input
              type="month"
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none"
            />
            <button
              onClick={() => handleToggle(targetMonth)}
              className={`px-4 py-2.5 font-bold rounded-xl text-xs shadow-md transition-all ${
                frozenMonths.includes(targetMonth)
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {frozenMonths.includes(targetMonth) ? '🔓 ปลดล็อก (Unfreeze)' : '🔒 ล็อกงบ (Freeze)'}
            </button>
          </div>
        </div>

        {/* Current Frozen Months List */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-300">📋 รายการเดือนที่ถูกปิดงบแล้ว (Frozen Months):</div>
          
          <div className="flex flex-wrap gap-2 max-h-[30vh] overflow-y-auto p-1">
            {frozenMonths.length === 0 ? (
              <div className="text-slate-500 italic p-2">ยังไม่มีเดือนที่ถูกปิดงบ</div>
            ) : (
              frozenMonths.map(m => (
                <div key={m} className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl flex items-center gap-2 font-mono font-bold">
                  <span>🔒 {m}</span>
                  <button
                    onClick={() => handleToggle(m)}
                    className="text-slate-400 hover:text-white text-[11px]"
                    title="ปลดล็อกเดือนนี้"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
