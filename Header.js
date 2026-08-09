function Header({ 
  currentUser,
  onOpenLoginModal = () => {},
  onLogout = () => {},
  activeSidebarTab = 'dashboard', 
  setActiveSidebarTab = () => {}, 
  activeView, 
  setActiveView, 
  logisticSubView = 'product_catalog', 
  setLogisticSubView = () => {}, 
  reportSubView = 'fda_registration', 
  setReportSubView = () => {}, 
  financeSubView = 'cost_calculation', 
  setFinanceSubView = () => {}, 
  hrSubView = 'leave_attendance', 
  setHRSubView = () => {}, 
  members = [], 
  projects = [], 
  pendingPOCount = 0, 
  activeRepairCount = 0, 
  soldProductsCount = 0, 
  activeShipmentCount = 0, 
  activeFDACount = 0, 
  activityLogsCount = 0, 
  onOpenNewModal = () => {}, 
  onOpenMemberModal = () => {}, 
  searchTerm = '', 
  setSearchTerm = () => {}, 
  filterClientType = 'all', 
  setFilterClientType = () => {}, 
  filterBudgetType = 'all', 
  setFilterBudgetType = () => {}, 
  exportToCSV = () => {}, 
  onResetDemo = () => {}, 
  onOpenDemoModal = () => {}, 
  onOpenProductModal = () => {}, 
  onOpenRepairModal = () => {}, 
  onOpenSoldModal = () => {}, 
  onOpenShipmentModal = () => {}, 
  onOpenFDAModal = () => {},
  onOpenKanbanModal = () => {} 
}) {
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState(false);
  const [isMobileActionSheetOpen, setIsMobileActionSheetOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncTime: null,
    message: ''
  });

  const triggerCloudSync = async () => {
    setCloudStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const res = await fetch('/api/sync-all-to-cloud', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCloudStatus({
          isOnline: true,
          isSyncing: false,
          lastSyncTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          message: `ซิงค์สำเร็จ (${data.syncedCount || 15} ตาราง)`
        });
      } else {
        setCloudStatus(prev => ({ ...prev, isSyncing: false }));
      }
    } catch (err) {
      setCloudStatus(prev => ({ ...prev, isOnline: false, isSyncing: false }));
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setCloudStatus(prev => ({ ...prev, isOnline: true }));
      triggerCloudSync();
    };
    const handleOffline = () => {
      setCloudStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount
    triggerCloudSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSelectViewChange = (newView) => {
    let targetTab = 'dashboard';
    if (newView === 'manager') targetTab = 'dashboard';
    else if (newView === 'kanban_all') targetTab = 'project';
    else if (newView === 'cost_calculation' || newView === 'purchase_orders') targetTab = 'finance';
    else if (newView === 'demo_calendar') targetTab = 'calendar';
    else if (['product_catalog', 'shipment_tracking', 'repair_service', 'sold_products'].includes(newView)) targetTab = 'logistic';
    else if (newView === 'fda_registration') targetTab = 'report';
    else if (newView === 'daily_transactions' || newView === 'accounting' || newView === 'financial_statements') targetTab = 'accounting';
    else if (members.some(m => m.id === newView)) targetTab = 'project';

    if (currentUser && !checkTabAccess(currentUser.role, targetTab)) {
      console.warn('RBAC Blocked view change:', newView, 'for role:', currentUser.role);
      return;
    }

    setActiveView(newView);

    if (newView === 'manager') {
      setActiveSidebarTab('dashboard');
    } else if (newView === 'kanban_all') {
      setActiveSidebarTab('project');
      if (onOpenKanbanModal) onOpenKanbanModal('kanban_all');
    } else if (newView === 'cost_calculation') {
      setActiveSidebarTab('finance');
      setFinanceSubView('cost_calculation');
    } else if (newView === 'purchase_orders') {
      setActiveSidebarTab('finance');
      setFinanceSubView('purchase_orders');
    } else if (newView === 'demo_calendar') {
      setActiveSidebarTab('calendar');
    } else if (newView === 'product_catalog') {
      setActiveSidebarTab('logistic');
      setLogisticSubView('product_catalog');
    } else if (newView === 'shipment_tracking') {
      setActiveSidebarTab('logistic');
      setLogisticSubView('shipment_tracking');
    } else if (newView === 'repair_service') {
      setActiveSidebarTab('logistic');
      setLogisticSubView('repair_service');
    } else if (newView === 'sold_products') {
      setActiveSidebarTab('logistic');
      setLogisticSubView('sold_products');
    } else if (newView === 'fda_registration') {
      setActiveSidebarTab('report');
      setReportSubView('fda_registration');
    } else if (newView === 'daily_transactions' || newView === 'accounting' || newView === 'financial_statements') {
      setActiveSidebarTab('accounting');
    } else if (members.some(m => m.id === newView)) {
      setActiveSidebarTab('project');
      if (onOpenKanbanModal) onOpenKanbanModal(newView);
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800">
      <div className="px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Company Logo */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="bg-white p-1.5 rounded-2xl shadow-xl shadow-emerald-500/20 border-2 border-slate-700/80 flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden transition-transform hover:scale-105">
                <img 
                  src="./assets/logo.jpg" 
                  alt="AERON MEDICAL Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-base sm:text-xl font-black tracking-wider leading-tight font-sans flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-[#a3e635] via-[#65a30d] to-[#16a34a] bg-clip-text text-transparent font-extrabold drop-shadow">
                    AERON
                  </span>
                  <span className="text-white font-bold">
                    MEDICAL
                  </span>
                </h1>
                <div className="text-xs sm:text-sm font-semibold text-indigo-200/90 tracking-wide">
                  Project Tracker
                </div>
                <p className="text-[11px] text-slate-400 font-normal">ระบบติดตามงานขายและโครงการราชการ / โรงพยาบาล</p>
              </div>
            </div>
          </div>

          {/* View Switcher Dropdown & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Active Profile / System View Select */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/70 rounded-xl p-1 text-xs relative">
              <span className="pl-2 text-slate-400 font-medium hidden sm:inline">มุมมอง:</span>
              <select
                value={activeView}
                onChange={(e) => handleSelectViewChange(e.target.value)}
                className="bg-slate-800 text-slate-100 font-semibold py-1.5 px-2.5 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none"
              >
                {(!currentUser || checkTabAccess(currentUser.role, 'dashboard')) && (
                  <option value="manager">📊 ภาพรวมหัวหน้างาน (Executive Overview)</option>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'project')) && (
                  <option value="kanban_all">📋 Kanban Board รวมทุกโครงการ (All Projects Kanban)</option>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'finance')) && (
                  <option value="cost_calculation">🧮 คำนวณต้นทุน & ราคาขายต่ำสุด (Financial Calculator)</option>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'calendar')) && (
                  <option value="demo_calendar">📅 ปฏิทินจองคิวเครื่อง Demo (Demo Calendar)</option>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'logistic')) && (
                  <>
                    <option value="product_catalog">📦 ฐานข้อมูลสินค้า Demo (Central Demo Catalog)</option>
                    <option value="repair_service">
                      🔧 สินค้าส่งซ่อม Repair Service {activeRepairCount > 0 ? `(⚙️ ${activeRepairCount} เครื่อง)` : ''}
                    </option>
                    <option value="sold_products">
                      🏆 สินค้าที่ขายแล้ว & ประกัน (Delivered Assets)
                    </option>
                    <option value="shipment_tracking">
                      🚢 ติดตามการนำเข้าสินค้า (Shipment Tracking) {activeShipmentCount > 0 ? `(✈️ ${activeShipmentCount} ล็อต)` : ''}
                    </option>
                  </>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'finance')) && (
                  <option value="purchase_orders">
                    🛒 จัดซื้อสินค้า Vendor {pendingPOCount > 0 ? `(🔔 มี ${pendingPOCount} งานรอสั่งของ)` : ''}
                  </option>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'report')) && (
                  <option value="fda_registration">
                    🛡️ การจดทะเบียน อย. (Thai FDA Registration) {activeFDACount > 0 ? `(📋 ${activeFDACount} คำขอ)` : ''}
                  </option>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'accounting')) && (
                  <option value="daily_transactions">
                    🧾 ลงบันทึกรายรับ-รายจ่ายรายวัน (Daily Transactions Entry)
                  </option>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'project')) && (
                  <optgroup label="-- Kanban รายบุคคล --">
                    {(members || []).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} Kanban {m.name} ({m.role})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Client Type Filter */}
            <select
              value={filterClientType}
              onChange={(e) => setFilterClientType(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/70 text-slate-200 text-xs py-2 px-2.5 rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="all">ทุกประเภทลูกค้า</option>
              <option value="รัฐบาล">🏛️ รัฐบาล</option>
              <option value="เอกชน">🏢 เอกชน</option>
            </select>

            {/* Budget Type Filter */}
            <select
              value={filterBudgetType}
              onChange={(e) => setFilterBudgetType(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/70 text-slate-200 text-xs py-2 px-2.5 rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="all">ทุกประเภทงบ</option>
              {window.BUDGET_TYPES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[200px]">
              <input
                type="text"
                placeholder="ค้นหา รพ./ชื่องาน/หมอ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
              />
              <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
            </div>

            {/* Desktop Action Buttons (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={onOpenNewModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs py-2 px-3.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span className="text-base font-bold leading-none">+</span>
                <span>เพิ่มโครงการ</span>
              </button>

              <button
                onClick={onOpenDemoModal}
                className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 p-2 px-2.5 rounded-xl border border-purple-700 text-xs transition-colors flex items-center gap-1 font-medium"
                title="จองคิวเครื่อง Demo"
              >
                🧪 จอง Demo
              </button>

              <button
                onClick={onOpenRepairModal}
                className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 p-2 px-2.5 rounded-xl border border-rose-700 text-xs transition-colors flex items-center gap-1 font-medium"
                title="แจ้งส่งซ่อมสินค้า"
              >
                🔧 ส่งซ่อม
              </button>

              <button
                onClick={exportToCSV}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 text-xs transition-colors"
                title="ส่งออกรายงานเป็น CSV"
              >
                📥 CSV
              </button>

              <button
                onClick={onOpenMemberModal}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 text-xs transition-colors"
                title="จัดการทีม"
              >
                👥 ทีม
              </button>

              <button
                onClick={onResetDemo}
                className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 p-2 rounded-xl border border-rose-800/60 text-xs transition-colors"
                title="รีเซ็ตข้อมูลตัวอย่าง"
              >
                🔄 รีเซ็ต
              </button>

              {currentUser && ['OWNER', 'HEAD_ADMIN'].includes(String(currentUser.role).toUpperCase()) && (
                <button
                  onClick={() => setIsUserAccountModalOpen(true)}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 p-2 px-2.5 rounded-xl border border-amber-500/40 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  title="ระบบสร้าง & จัดการบัญชีผู้ใช้งาน (OWNER & HEAD ADMIN)"
                >
                  <span>🔐 จัดการบัญชี</span>
                </button>
              )}

              {/* ☁️ Cloud Sync Status & Manual Re-sync Button */}
              <button
                onClick={triggerCloudSync}
                disabled={cloudStatus.isSyncing}
                className={`flex items-center gap-1.5 p-2 px-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                  cloudStatus.isSyncing
                    ? 'bg-indigo-950/70 border-indigo-500/50 text-indigo-300 animate-pulse'
                    : cloudStatus.isOnline
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/40 text-amber-300'
                }`}
                title={cloudStatus.isOnline ? `คลิกเพื่อซิงค์ข้อมูลกับ Supabase Cloud ทันที (ล่าสุด: ${cloudStatus.lastSyncTime || 'เรียบร้อย'})` : 'ออฟไลน์: ข้อมูลจะบันทึกในเครื่อง และซิงค์ขึ้น Cloud อัตโนมัติเมื่อต่อเน็ต'}
              >
                {cloudStatus.isSyncing ? (
                  <>
                    <span className="animate-spin text-xs">🔄</span>
                    <span className="inline text-[11px]">กำลังซิงค์...</span>
                  </>
                ) : cloudStatus.isOnline ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-xs">☁️</span>
                    <span className="inline text-[11px] font-bold">Cloud Synced</span>
                    {cloudStatus.lastSyncTime && <span className="hidden 2xl:inline text-[10px] text-emerald-400/80 font-mono">({cloudStatus.lastSyncTime})</span>}
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                    <span className="text-xs">📴</span>
                    <span className="inline text-[11px] font-bold text-amber-300">Offline</span>
                  </>
                )}
              </button>

              {/* User Profile & Role Badge Switcher */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {currentUser ? (
                  <button
                    onClick={onOpenLoginModal}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 p-1.5 px-2.5 rounded-xl border border-slate-700 text-xs transition-all active:scale-95 group"
                    title="คลิกเพื่อสลับสิทธิ์การใช้งาน / เปลี่ยนบทบาทผู้ใช้"
                  >
                    <span className="text-base">{currentUser.avatar || '👤'}</span>
                    <div className="text-left">
                      <div className="font-bold text-white leading-none text-[11px]">{currentUser.name.split(' ')[0]}</div>
                      <div className="text-[9.5px] font-mono text-emerald-300 font-bold">{currentUser.role}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-white">🔒 สลับสิทธิ์</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenLoginModal}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-md shadow-indigo-600/30"
                  >
                    🔑 เข้าสู่ระบบ
                  </button>
                )}
              </div>
            </div>

            {/* 📱 Mobile Action & Quick Menu Controls (Visible on Mobile/Tablet < lg) */}
            <div className="lg:hidden flex items-center gap-1.5 w-full justify-between pt-1 border-t border-slate-800/80">
              <button
                onClick={onOpenNewModal}
                className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs py-2 px-2.5 rounded-xl shadow-md active:scale-95 touch-manipulation"
              >
                <span className="text-sm font-bold">+</span>
                <span>เพิ่มโครงการ</span>
              </button>

              {/* Mobile Cloud Status Pill */}
              <button
                onClick={triggerCloudSync}
                disabled={cloudStatus.isSyncing}
                className={`p-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 active:scale-95 ${
                  cloudStatus.isOnline ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                }`}
                title="คลิกเพื่อซิงค์ข้อมูลกับ Cloud"
              >
                <span>{cloudStatus.isSyncing ? '🔄' : cloudStatus.isOnline ? '☁️' : '📴'}</span>
              </button>

              {/* Mobile Action Sheet Trigger */}
              <button
                onClick={() => setIsMobileActionSheetOpen(true)}
                className="p-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 touch-manipulation"
              >
                <span>⚡ จัดการ</span>
              </button>

              {/* Mobile User Profile Button */}
              {currentUser && (
                <button
                  onClick={onOpenLoginModal}
                  className="p-1.5 px-2 bg-slate-900 border border-slate-700 rounded-xl text-xs flex items-center gap-1 active:scale-95"
                >
                  <span className="text-base">{currentUser.avatar || '👤'}</span>
                  <span className="text-[10px] font-bold text-emerald-300 font-mono">{currentUser.role.substring(0, 5)}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Dynamic Module Sub-Navigation Bar */}
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
              🚚 ติดตามการขนส่ง ({activeShipmentCount})
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
              <span>💰 การเงิน & จัดซื้อ:</span>
            </span>

            <button
              onClick={() => setFinanceSubView('cost_calculation')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
                financeSubView === 'cost_calculation'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              🧮 คำนวณต้นทุน & กำไร (Cost Calculator)
            </button>

            <button
              onClick={() => setFinanceSubView('purchase_orders')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all border ${
                financeSubView === 'purchase_orders'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
              }`}
            >
              🛒 ใบสั่งซื้อ PO (Vendor) {pendingPOCount > 0 ? `(🔔 ${pendingPOCount})` : ''}
            </button>
          </div>
        )}

        {/* REPORT MODULE SUB-VIEWS */}
        {activeSidebarTab === 'report' && (
          <div className="flex items-center gap-2 flex-shrink-0 w-full">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
              <span>📜 ทะเบียน & Audit Logs:</span>
            </span>

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

      {/* 📱 Mobile Quick Action Bottom Sheet */}
      {isMobileActionSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="font-bold text-white text-sm">เมนูจัดการด่วน (Quick Actions)</h3>
              </div>
              <button
                onClick={() => setIsMobileActionSheetOpen(false)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
              >
                ✕ ปิด
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { setIsMobileActionSheetOpen(false); onOpenNewModal(); }}
                className="p-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
              >
                <span className="text-xl">➕</span>
                <span className="font-bold text-xs text-white">เพิ่มโครงการ</span>
                <span className="text-[10px] text-emerald-300">สร้างโครงการใหม่</span>
              </button>

              <button
                onClick={() => { setIsMobileActionSheetOpen(false); onOpenDemoModal(); }}
                className="p-3 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
              >
                <span className="text-xl">🧪</span>
                <span className="font-bold text-xs text-white">จองเครื่อง Demo</span>
                <span className="text-[10px] text-purple-300">ลงคิวทดสอบสินค้า</span>
              </button>

              <button
                onClick={() => { setIsMobileActionSheetOpen(false); onOpenRepairModal(); }}
                className="p-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
              >
                <span className="text-xl">🔧</span>
                <span className="font-bold text-xs text-white">แจ้งส่งซ่อม</span>
                <span className="text-[10px] text-rose-300">เปิดใบงานซ่อมบำรุง</span>
              </button>

              <button
                onClick={() => { setIsMobileActionSheetOpen(false); exportToCSV(); }}
                className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
              >
                <span className="text-xl">📥</span>
                <span className="font-bold text-xs text-white">ส่งออก CSV</span>
                <span className="text-[10px] text-slate-400">ดาวน์โหลดรายงาน</span>
              </button>

              <button
                onClick={() => { setIsMobileActionSheetOpen(false); onOpenMemberModal(); }}
                className="p-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
              >
                <span className="text-xl">👥</span>
                <span className="font-bold text-xs text-white">จัดการทีม</span>
                <span className="text-[10px] text-slate-400">รายชื่อสมาชิก Sales</span>
              </button>

              <button
                onClick={() => { setIsMobileActionSheetOpen(false); triggerCloudSync(); }}
                className="p-3 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 rounded-2xl text-left flex flex-col gap-1 active:scale-95 touch-manipulation"
              >
                <span className="text-xl">☁️</span>
                <span className="font-bold text-xs text-white">ซิงค์ Cloud ทันที</span>
                <span className="text-[10px] text-teal-300">{cloudStatus.isSyncing ? 'กำลังซิงค์...' : 'อัปเดต Supabase'}</span>
              </button>
            </div>

            {currentUser && ['OWNER', 'HEAD_ADMIN'].includes(String(currentUser.role).toUpperCase()) && (
              <button
                onClick={() => { setIsMobileActionSheetOpen(false); setIsUserAccountModalOpen(true); }}
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
                onClick={() => { setIsMobileActionSheetOpen(false); onResetDemo(); }}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline"
              >
                🔄 รีเซ็ตข้อมูลตัวอย่าง
              </button>

              <button
                onClick={() => { setIsMobileActionSheetOpen(false); onLogout(); }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <span>🚪 ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Account Management Modal for OWNER & HEAD ADMIN */}
      <UserAccountManagementModal
        isOpen={isUserAccountModalOpen}
        onClose={() => setIsUserAccountModalOpen(false)}
        currentUser={currentUser}
      />
    </header>
  );
}
