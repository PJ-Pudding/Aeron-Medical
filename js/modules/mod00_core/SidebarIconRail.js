// MODULE: mod00_core/SidebarIconRail.js

const SidebarIconRail = React.memo(function SidebarIconRail({ activeTab, setActiveTab, onOpenFullDrawer, pendingPOCount, activeRepairCount, activeShipmentCount, activeFDACount, currentUser }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', badge: null, desc: 'ภาพรวมผลงาน & ดัชนีหลัก' },
    { id: 'clients', label: 'Clients', icon: '🏥', badge: null, desc: 'ฐานข้อมูลลูกค้า รพ. & แพทย์' },
    { id: 'project', label: 'Project', icon: '📋', badge: null, desc: 'กระดาน Sales Kanban' },
    { id: 'logistic', label: 'Logistic', icon: '🚚', badge: (activeShipmentCount + activeRepairCount) > 0 ? (activeShipmentCount + activeRepairCount) : null, desc: 'คลังสินค้า & ขนส่ง' },
    { id: 'calendar', label: 'Calendar', icon: '📅', badge: null, desc: 'ปฏิทินจอง Demo' },
    { id: 'report', label: 'Report', icon: '📑', badge: activeFDACount > 0 ? activeFDACount : null, desc: 'ศูนย์รวมรายงานทุกระบบ & เอกสาร' },
    { id: 'finance', label: 'Finance', icon: '💰', badge: pendingPOCount > 0 ? pendingPOCount : null, desc: 'ต้นทุน & ใบสั่งซื้อ PO' },
    { id: 'hr', label: 'HR', icon: '👥', badge: null, desc: 'ตารางวันลา & บุคลากร' },
    { id: 'accounting', label: 'Accounting', icon: '🧾', badge: null, desc: 'ลงบันทึกรายรับ-รายจ่าย & งบการเงิน' }
  ];

  const accessibleItems = menuItems.filter(item => currentUser && checkTabAccess(currentUser, item.id));

  return (
    <>
      {/* 📌 Desktop Left Slim Icon Sidebar Rail (Hidden on Mobile) */}
      <aside className="hidden md:flex sticky top-0 z-40 h-screen w-16 bg-slate-900/95 border-r border-slate-800/80 flex-col justify-between items-center py-4 flex-shrink-0 backdrop-blur-md">
        
        {/* Top Logo & Expand Drawer Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onOpenFullDrawer}
            className="bg-white p-1 rounded-xl shadow-lg border border-slate-700 hover:scale-110 transition-transform w-10 h-10 flex items-center justify-center overflow-hidden group relative"
            title="เปิดเมนูป๊อปอัปแบบขยาย (Pop-up Full Menu)"
          >
            <img 
              src="./assets/logo.jpg" 
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=AERON&background=4f46e5&color=fff&size=128'; }}
              alt="AERON Logo" 
              className="h-full w-full object-contain" 
            />
          </button>

          <div className="w-8 h-[1px] bg-slate-800/80 my-1" />

          {/* Vertical List of Icon Menu Buttons */}
          <nav className="flex flex-col gap-2">
            {accessibleItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/40 scale-105 border border-emerald-400/40'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{item.icon}</span>

                    {/* Notification Badge Dot */}
                    {item.badge !== null && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-md animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Pop-up Hover Tooltip Badge */}
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl shadow-xl z-50 whitespace-nowrap animate-modal pointer-events-none">
                    <div className="text-left">
                      <div className="text-xs font-bold text-white leading-none">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu Drawer Toggle Icon */}
        <button
          onClick={onOpenFullDrawer}
          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all shadow-md active:scale-95"
          title="เปิดเมนูป๊อปอัปแบบขยาย (Pop-up Full Menu)"
        >
          <span>☰</span>
        </button>
      </aside>

      {/* 📱 Mobile Bottom Navigation Bar (Visible only on Mobile & Tablet < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-xl flex items-center justify-around py-1.5 px-2 shadow-2xl">
        {accessibleItems.slice(0, 4).map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-lg leading-tight">{item.icon}</span>
              <span className="text-[10px] truncate max-w-[60px]">{item.label}</span>
              {item.badge !== null && (
                <span className="absolute top-0.5 right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center shadow">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={onOpenFullDrawer}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all"
        >
          <span className="text-lg leading-tight">☰</span>
          <span className="text-[10px]">เมนู</span>
        </button>
      </div>
    </>
  );
});

window.SidebarIconRail = SidebarIconRail;
