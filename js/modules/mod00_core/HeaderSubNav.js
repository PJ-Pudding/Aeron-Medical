// MODULE: mod00_core/HeaderSubNav.js
// Dynamic Module Sub-Navigation Bar extracted from Header.js for Clean Architecture

const HeaderSubNav = React.memo(function HeaderSubNav({
  activeSidebarTab,
  logisticSubView,
  setLogisticSubView,
  activeShipmentCount = 0,
  activeRepairCount = 0,
  soldProductsCount = 0,
  financeSubView,
  setFinanceSubView,
  reportSubView,
  setReportSubView,
  activeFDACount = 0,
  activityLogsCount = 0,
  hrSubView,
  setHRSubView,
  members = [],
  accountingSubTab,
  setAccountingSubTab,
  pendingPOCount = 0,
  activeView,
  handleSelectViewChange,
  projects = [],
  currentUser
}) {
  return (
    <div className="bg-slate-950/90 border-t border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto gap-3 text-xs scrollbar-none">
      
      {/* LOGISTIC MODULE SUB-VIEWS */}
      {activeSidebarTab === 'logistic' && (
        <div className="flex items-center gap-2 flex-shrink-0 w-full">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
            <span>🚚</span> <span>คลังสินค้า & ขนส่ง:</span>
          </span>

          <button
            onClick={() => setLogisticSubView('product_catalog')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              logisticSubView === 'product_catalog'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📦 ฐานข้อมูลสินค้า & เครื่อง Demo
          </button>

          <button
            onClick={() => setLogisticSubView('shipment_tracking')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              logisticSubView === 'shipment_tracking'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            🚢 ติดตามการ Import ({activeShipmentCount})
          </button>

          <button
            onClick={() => setLogisticSubView('repair_service')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              logisticSubView === 'repair_service'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            🔧 ทะเบียนส่งซ่อม ({activeRepairCount})
          </button>

          <button
            onClick={() => setLogisticSubView('sold_products')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              logisticSubView === 'sold_products'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            🏥 เครื่องที่ขายแล้ว ({soldProductsCount})
          </button>
        </div>
      )}

      {/* FINANCE MODULE SUB-VIEWS */}
      {activeSidebarTab === 'finance' && (
        <div className="flex items-center gap-2 flex-shrink-0 w-full">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
            <span>💰 การเงิน & วางแผน:</span>
          </span>

          <button
            onClick={() => setFinanceSubView('cost_calculation')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              financeSubView === 'cost_calculation'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📊 คำนวณต้นทุนโครงการ (Cost Sheet)
          </button>

          <button
            onClick={() => setFinanceSubView('cash_forecast')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              financeSubView === 'cash_forecast'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 font-black shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            🔮 ประมาณการกระแสเงินสด (Cash Forecast)
          </button>
        </div>
      )}

      {/* REPORT MODULE SUB-VIEWS */}
      {activeSidebarTab === 'report' && (
        <div className="flex items-center gap-2 flex-shrink-0 w-full">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
            <span>📊 รายงาน & เอกสาร:</span>
          </span>

          <button
            onClick={() => setReportSubView('hub')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              reportSubView === 'hub' || !reportSubView || reportSubView === 'analytics_reports'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📊 ศูนย์รวมรายงานทุกระบบ (All Reports Hub)
          </button>

          <button
            onClick={() => setReportSubView('fda_registration')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              reportSubView === 'fda_registration'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📜 ทะเบียน อย. / ใบอนุญาต ({activeFDACount})
          </button>

          <button
            onClick={() => setReportSubView('activity_logs')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              reportSubView === 'activity_logs'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            🔐 ประวัติใช้งานระบบ Audit Logs ({activityLogsCount})
          </button>
        </div>
      )}

      {/* HR MODULE SUB-VIEWS */}
      {activeSidebarTab === 'hr' && (
        <div className="flex items-center gap-2 flex-shrink-0 w-full">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
            <span>👥 บุคลากร & HR:</span>
          </span>

          <button
            onClick={() => setHRSubView('leave_attendance')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              hrSubView === 'leave_attendance'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📅 ตารางวันลา & ขาด ลา มาสาย
          </button>

          <button
            onClick={() => setHRSubView('team_roster')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              hrSubView === 'team_roster'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            👥 รายชื่อทีม Sales ({members.length} คน)
          </button>
        </div>
      )}

      {/* ACCOUNTING MODULE SUB-VIEWS */}
      {activeSidebarTab === 'accounting' && (
        <div className="flex items-center gap-2 flex-shrink-0 w-full">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
            <span>🧾 บัญชี & การเงิน:</span>
          </span>

          <button
            onClick={() => setAccountingSubTab('daily_entries')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              accountingSubTab === 'daily_entries'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📋 บันทึกรายรับ-รายจ่ายรายวัน
          </button>

          <button
            onClick={() => setAccountingSubTab('purchase_orders')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              accountingSubTab === 'purchase_orders'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📦 ใบสั่งซื้อ PO (Vendor) {pendingPOCount > 0 ? `(🔔 ${pendingPOCount})` : ''}
          </button>

          <button
            onClick={() => setAccountingSubTab('financial_statements')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              accountingSubTab === 'financial_statements'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            📈 งบการเงิน P&L & Cash Flow
          </button>

          <button
            onClick={() => setAccountingSubTab('pending_transfers')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              accountingSubTab === 'pending_transfers'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            ⏳ ค้างโอนประจำเดือน
          </button>

          <button
            onClick={() => setAccountingSubTab('hospital_payee_analytics')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              accountingSubTab === 'hospital_payee_analytics'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            🏥 รายจ่ายราย รพ./ผู้รับ
          </button>

          <button
            onClick={() => setAccountingSubTab('bank_reconciliation')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
              accountingSubTab === 'bank_reconciliation'
                ? 'bg-teal-600 text-white border-teal-400 font-black shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            🏦 Bank Reconciliation
          </button>
        </div>
      )}

      {/* DASHBOARD / PROJECT / CLIENTS / CALENDAR GENERAL SHORTCUTS */}
      {(activeSidebarTab === 'dashboard' || activeSidebarTab === 'project' || activeSidebarTab === 'clients' || activeSidebarTab === 'calendar') && (
        <>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>📌</span> <span>ทางลัดมุมมอง:</span>
            </span>

            <button
              onClick={() => handleSelectViewChange('manager')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                activeView === 'manager'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <span>📊 ภาพรวมหัวหน้างาน</span>
            </button>

            <button
              onClick={() => handleSelectViewChange('kanban_all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                activeView === 'kanban_all'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <span>📋 Kanban รวมทุกโครงการ ({projects.length})</span>
            </button>

            <button
              onClick={() => handleSelectViewChange('cost_calculation')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
                activeView === 'cost_calculation'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              <span>🧮 คำนวณต้นทุน & ราคาขาย</span>
            </button>
          </div>

          {/* Member Kanban Quick Pills */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-slate-400 font-medium text-[11px] hidden lg:inline mr-1">Kanban เซลส์รายบุคคล:</span>
            {(members || []).filter(m => !currentUser || (window.canViewMemberKanban ? window.canViewMemberKanban(currentUser, m) : true)).map(m => {
              const isSelected = activeView === m.id;
              const count = projects.filter(p => p.assignee === m.name).length;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectViewChange(m.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800/90'
                  }`}
                  title={`คลิกเพื่อดู Kanban Board ของ ${m.name}`}
                >
                  <span>{m.avatar} {m.name.split(' ')[0]}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isSelected ? 'bg-emerald-900 text-white font-bold' : 'bg-slate-950 text-slate-400'
                  }`}>
                    {count} งาน
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
});

window.HeaderSubNav = HeaderSubNav;
