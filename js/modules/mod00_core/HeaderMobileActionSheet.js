// MODULE: mod00_core/HeaderMobileActionSheet.js
// Mobile Action Sheet & Quick Drawer extracted from Header.js for Clean Architecture

const HeaderMobileActionSheet = React.memo(function HeaderMobileActionSheet({
  isOpen,
  onClose,
  alerts = [],
  onOpenNotificationModal = () => {},
  onOpenNewModal = () => {},
  onOpenDemoModal = () => {},
  onOpenRepairModal = () => {},
  exportToCSV = () => {},
  onOpenMemberModal = () => {},
  triggerCloudSync = () => {},
  cloudStatus = {},
  currentUser,
  onOpenUserAccountModal = () => {},
  onResetDemo = () => {},
  onLogout = () => {}
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="font-bold text-white text-sm">เมนูจัดการด่วน (Quick Actions)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
          >
            ✕ ปิด
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => { onClose(); onOpenNotificationModal(); }}
            className="p-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/50 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🔔</span>
              {alerts && alerts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  {alerts.length} งาน
                </span>
              )}
            </div>
            <span className="font-bold text-xs text-white">ศูนย์แจ้งเตือน</span>
            <span className="text-[10px] text-rose-300">งานค้าง & ลงต้นทุน</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenNewModal(); }}
            className="p-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
          >
            <span className="text-xl">➕</span>
            <span className="font-bold text-xs text-white">เพิ่มโครงการ</span>
            <span className="text-[10px] text-emerald-300">สร้างโครงการใหม่</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenDemoModal(); }}
            className="p-3 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
          >
            <span className="text-xl">🧪</span>
            <span className="font-bold text-xs text-white">จองเครื่อง Demo</span>
            <span className="text-[10px] text-purple-300">ลงคิวทดสอบสินค้า</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenRepairModal(); }}
            className="p-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
          >
            <span className="text-xl">🔧</span>
            <span className="font-bold text-xs text-white">แจ้งส่งซ่อม</span>
            <span className="text-[10px] text-rose-300">เปิดใบงานซ่อมบำรุง</span>
          </button>

          <button
            onClick={() => { onClose(); exportToCSV(); }}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
          >
            <span className="text-xl">📥</span>
            <span className="font-bold text-xs text-white">ส่งออก CSV</span>
            <span className="text-[10px] text-slate-400">ดาวน์โหลดรายงาน</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenMemberModal(); }}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
          >
            <span className="text-xl">👥</span>
            <span className="font-bold text-xs text-white">จัดการทีม</span>
            <span className="text-[10px] text-slate-400">รายชื่อสมาชิก Sales</span>
          </button>

          <button
            onClick={() => { onClose(); triggerCloudSync(); }}
            className="p-3 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
          >
            <span className="text-xl">☁️</span>
            <span className="font-bold text-xs text-white">ซิงค์ Cloud ทันที</span>
            <span className="text-[10px] text-teal-300">{cloudStatus.isSyncing ? 'กำลังซิงค์...' : 'อัปเดต Supabase'}</span>
          </button>
        </div>

        {currentUser && ['OWNER', 'HEAD_ADMIN'].includes(String(currentUser.role).toUpperCase()) && (
          <button
            onClick={() => { onClose(); if (onOpenUserAccountModal) onOpenUserAccountModal(); }}
            className="w-full p-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-2xl text-left flex items-center justify-between text-amber-300 font-bold text-xs active:scale-95"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🔐</span>
              <span>จัดการบัญชีผู้ใช้งานระบบ (OWNER & HEAD ADMIN)</span>
            </div>
            <span>➔</span>
          </button>
        )}

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => { onClose(); onResetDemo(); }}
            className="text-[11px] text-rose-400 hover:text-rose-300 underline"
          >
            🔄 รีเซ็ตข้อมูลตัวอย่าง
          </button>

          <button
            onClick={() => { onClose(); onLogout(); }}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-bold"
          >
            <span>🚪 ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
});

window.HeaderMobileActionSheet = HeaderMobileActionSheet;
