// MODULE: mod00_core/SidebarNavDrawer.js

function SidebarNavDrawer({ isOpen, onClose, activeTab, setActiveTab, currentUser = null, pendingPOCount = 0, activeRepairCount = 0, activeShipmentCount = 0, activeFDACount = 0 }) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวมผลงาน & ดัชนีหลัก', icon: '📊', tabName: 'Dashboard', desc: 'Executive Dashboard & KPI' },
    { id: 'clients', label: 'ฐานข้อมูลลูกค้า รพ. & แพทย์', icon: '🏥', tabName: 'Clients', desc: 'Hospitals & Decision Makers' },
    { id: 'project', label: 'กระดานติดตามงานขาย Sales Kanban', icon: '📋', tabName: 'Projects', desc: 'All Sales Pipelines' },
    { id: 'logistic', label: 'คลังสินค้า เครื่อง Demo & ขนส่ง', icon: '🚚', tabName: 'Logistic', badge: (activeShipmentCount + activeRepairCount) > 0 ? (activeShipmentCount + activeRepairCount) : null, desc: 'Demo Assets & Shipment' },
    { id: 'calendar', label: 'ปฏิทินจองคิวเครื่อง Demo', icon: '📅', tabName: 'Calendar', desc: 'Demo Booking Schedules' },
    { id: 'report', label: 'ทะเบียน อย. & ศูนย์รายงานสรุป', icon: '📑', tabName: 'Report', badge: activeFDACount > 0 ? activeFDACount : null, desc: 'Thai FDA & Executive Reports' },
    { id: 'finance', label: 'ตารางคำนวณต้นทุน & ใบสั่งซื้อ PO', icon: '💰', tabName: 'Finance', badge: pendingPOCount > 0 ? pendingPOCount : null, desc: 'Cost Sheet & Vendor POs' },
    { id: 'hr', label: 'ตารางวันลา & บุคลากรทีม Sales', icon: '👥', tabName: 'HR', desc: 'Leave Requests & Team Roster' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-start animate-modal">
      <aside className="w-80 sm:w-96 bg-slate-900 border-r border-slate-800 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl space-y-6">
        
        {/* Drawer Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-700 h-10 w-10 flex items-center justify-center flex-shrink-0">
                <img src="./assets/logo.jpg" alt="AERON Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-wider">AERON MEDICAL</h3>
                <p className="text-[10px] text-slate-400">เมนูระบบหลัก (Primary Navigation)</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-sm font-bold">✕</button>
          </div>

          {/* Nav Items List */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 mb-1">
              เลือกเมนูการทำงานหลัก (8 แท็บ):
            </div>
            {menuItems.filter(item => currentUser && checkTabAccess(currentUser, item.id)).map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all group border ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div className="text-left">
                      <div className="font-bold text-xs">{item.label}</div>
                      <div className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{item.desc}</div>
                    </div>
                  </div>
                  {item.badge !== null && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold shadow">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          {currentUser && (
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentUser.avatar}</span>
                <div>
                  <div className="font-bold text-white text-xs">{currentUser.fullName}</div>
                  <div className="text-[10px] text-amber-300 font-semibold">{currentUser.roleLabel}</div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors"
          >
            ✕ ปิดเมนูหลัก
          </button>
        </div>
      </aside>
    </div>
  );
}
