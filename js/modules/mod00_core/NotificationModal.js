// MODULE: mod00_core/NotificationModal.js

function NotificationModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  alerts = [], 
  onAction 
}) {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'ทั้งหมด', icon: '🔔' },
    { id: 'cost_sheet', label: 'คำนวณต้นทุน', icon: '🔴' },
    { id: 'demo', label: 'คิว Demo', icon: '🧪' },
    { id: 'finance', label: 'จัดซื้อ & การเงิน', icon: '🛒' },
    { id: 'import', label: 'นำเข้าสินค้า', icon: '🚢' },
    { id: 'fda', label: 'งาน อย.', icon: '🛡️' },
    { id: 'hr', label: 'งาน HR', icon: '👥' }
  ];

  const filteredAlerts = useMemo(() => {
    if (activeCategory === 'all') return alerts;
    return alerts.filter(a => a.category === activeCategory);
  }, [alerts, activeCategory]);

  const urgentCount = alerts.filter(a => a.severity === 'urgent').length;

  return (
    <div className="fixed inset-0 z-[950] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-modal max-h-[90vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center text-xl shadow-inner">
                🔔
              </div>
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-extrabold text-white items-center justify-center">
                    {alerts.length > 99 ? '99+' : alerts.length}
                  </span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">ศูนย์แจ้งเตือนอัจฉริยะ (Action Center)</h3>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  {currentUser ? currentUser.name : 'ผู้ใช้งาน'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                รวบรวมงานที่ต้องดำเนินการจากทุกระบบ {urgentCount > 0 && <span className="text-rose-400 font-bold">(มีงานด่วน {urgentCount} รายการ)</span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 text-xs scrollbar-none">
          {categories.map(cat => {
            const count = cat.id === 'all' ? alerts.length : alerts.filter(a => a.category === cat.id).length;
            if (cat.id !== 'all' && count === 0) return null; // hide empty categories

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Alerts List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-[220px]">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
              <div className="text-4xl">🎉</div>
              <div className="text-sm font-bold text-slate-200">ไม่มีงานค้างที่ต้องดำเนินการในขณะนี้!</div>
              <p className="text-xs text-slate-500 max-w-sm">
                งานและโครงการทั้งหมดของคุณได้รับการอัปเดตข้อมูลและลงบันทึกต้นทุนเรียบร้อยสมบูรณ์แล้ว
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert, idx) => {
              const borderCol = alert.severity === 'urgent'
                ? 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/70'
                : alert.severity === 'warning'
                ? 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/70'
                : 'border-slate-700/60 bg-slate-950/60 hover:border-slate-600';

              const badgeCol = alert.severity === 'urgent'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : alert.severity === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

              return (
                <div
                  key={alert.id || idx}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${borderCol}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5 shrink-0">{alert.icon || '📌'}</span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-white text-xs sm:text-sm">{alert.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeCol}`}>
                          {alert.badgeText || (alert.severity === 'urgent' ? 'งานด่วน' : 'แจ้งเตือน')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{alert.description}</p>
                      {alert.detail && (
                        <div className="text-[11px] font-mono text-amber-300 font-semibold">{alert.detail}</div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      onClick={() => {
                        onClose();
                        if (alert.onAction) alert.onAction();
                        else if (onAction) onAction(alert);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <span>🚀 {alert.actionText || 'ดำเนินการทันที'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500 shrink-0">
          <span>* รายการแจ้งเตือนจะหายไปอัตโนมัติเมื่อท่านบันทึกข้อมูลของงานนั้นเสร็จสิ้น</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
}
