// System Data Integrity Protected (No automatic localStorage wipe)

function App() {
  // Navigation & View Sub-states
  const [activeView, setActiveView] = useState('manager');
  const [toastNotification, setToastNotification] = useState(null);
  const [isGlobalCategoryManagerOpen, setIsGlobalCategoryManagerOpen] = useState(false);
    
  // 1. Logistics Domain Hook (Products, Shipments, Sold Assets, Repairs, FDA)
  const logistics = useAeronLogistics({ setActiveView });
  const {
    productCategories, setProductCategories,
    handleUpdateCategories,
    products, setProducts,
    soldProducts, setSoldProducts,
    shipments, setShipments,
    repairTickets, setRepairTickets,
    fdaRegistrations, setFdaRegistrations,
    isProductModalOpen, setIsProductModalOpen,
    editingProduct, setEditingProduct,
    isSoldModalOpen, setIsSoldModalOpen,
    editingSoldAsset, setEditingSoldAsset,
    isShipmentModalOpen, setIsShipmentModalOpen,
    editingShipment, setEditingShipment,
    isRepairModalOpen, setIsRepairModalOpen,
    editingRepairTicket, setEditingRepairTicket,
    isFDAModalOpen, setIsFDAModalOpen,
    editingFDA, setEditingFDA,
    handleSaveProduct,
    handleSaveSoldAsset,
    handleDeleteSoldAsset,
    handleSaveShipment,
    handleDeleteShipment,
    handleSaveRepairTicket,
    handleDeleteRepairTicket,
    handleOpenRepairFromCatalog,
    handleSaveFDA,
    handleDeleteFDA
  } = logistics;

  // 2. Accounting Domain Hook (Transactions, Bank Accounts, Purchase Orders)
  const accounting = useAeronAccounting({ setShipments });
  const {
    transactions, setTransactions,
    purchaseOrders, setPurchaseOrders,
    isPOModalOpen, setIsPOModalOpen,
    editingPO, setEditingPO,
    handleSaveTransaction,
    handleBatchImportTransactions,
    handleDeleteTransaction,
    handleSavePO,
    handleDeletePO
  } = accounting;

  // 3. Projects Domain Hook (Kanban Projects, Cost Sheets, Demo Bookings)
  const projectsHook = useAeronProjects({ soldProducts, setSoldProducts, setToastNotification });
  const {
    projects, setProjects,
    costCalculations, setCostCalculations,
    demoBookings, setDemoBookings,
    isModalOpen, setIsModalOpen,
    editingProject, setEditingProject,
    isLogModalOpen, setIsLogModalOpen,
    logTargetProject, setLogTargetProject,
    isCostModalOpen, setIsCostModalOpen,
    editingCostCalc, setEditingCostCalc,
    isHistoryModalOpen, setIsHistoryModalOpen,
    historyTargetProject, setHistoryTargetProject,
    isChecklistModalOpen, setIsChecklistModalOpen,
    checklistTargetBooking, setChecklistTargetBooking,
    isDemoBookingModalOpen, setIsDemoBookingModalOpen,
    editingDemoBooking, setEditingDemoBooking,
    handleMoveProject,
    handleSaveProject,
    handleDeleteProject,
    handleAddWeeklyLog,
    handleSaveDemoBooking,
    handleUpdateBookingStatus,
    handleSaveCostCalc,
    handleDeleteCostCalc,
    handleOpenHistoryModal
  } = projectsHook;

  // Team Members State
  // ⚡ Auto-Sync Bridge: Update members state whenever user accounts are modified
  useEffect(() => {
    const handleMembersUpdate = (e) => {
      if (Array.isArray(e.detail)) {
        setMembers(e.detail);
      }
    };
    window.addEventListener('aeron_members_updated', handleMembersUpdate);
    return () => window.removeEventListener('aeron_members_updated', handleMembersUpdate);
  }, []);

  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('gov_hospital_members');
      return saved ? JSON.parse(saved) : window.INITIAL_MEMBERS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for gov_hospital_members:', e);
      return window.INITIAL_MEMBERS || [];
    }
  });

  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  // --- Auth & RBAC State: Mandatory Login Protection Every Time ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState(false);

  // ⚡ Ensure currentUser is present in members list if missing
  useEffect(() => {
    if (currentUser && Array.isArray(members)) {
      const exists = members.some(m => m.name === currentUser.name || m.id === currentUser.memberId);
      if (!exists) {
        const newM = {
          id: currentUser.memberId || currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          avatar: currentUser.avatar || '👨‍⚕️'
        };
        setMembers(prev => [...prev, newM]);
      }
    }
  }, [currentUser, members]);

  // 4. HR Domain Hook (Leave Requests, Attendance Logs)
  const hr = useAeronHR({ currentUser });
  const {
    leaveRequests, setLeaveRequests,
    attendanceLogs, setAttendanceLogs,
    isLeaveModalOpen, setIsLeaveModalOpen,
    isAttendanceModalOpen, setIsAttendanceModalOpen,
    handleApproveLeave,
    handleDeleteLeave,
    handleSaveLeave,
    handleDeleteAttendance,
    handleSaveAttendance
  } = hr;

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsLoginModalOpen(false);
    if (userData.role === 'MESSENGER') {
      setActiveSidebarTab('messenger');
    } else {
      const allowed = ROLES_PERMISSIONS[userData.role]?.allowedTabs || ['dashboard'];
      if (!allowed.includes(activeSidebarTab)) {
        setActiveSidebarTab(allowed[0]);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aeron_auth_user');
    localStorage.removeItem('aeron_jwt_token');
    sessionStorage.clear();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  // 🔄 Live Sync Centralized User Accounts from Cloud/Server DB on Startup
  useEffect(() => {
    async function syncRemoteUsers() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (fetcher) {
          const remoteUsers = await fetcher('users', null);
          if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
            const rawStr = JSON.stringify(remoteUsers);
            if (!rawStr.includes('à¸') && !rawStr.includes('à¹') && !rawStr.includes('ðŸ')) {
              localStorage.setItem('aeron_user_accounts', rawStr);
            }
          }
        }
      } catch (e) {
        console.warn('[User Sync Notice]:', e.message);
      }
    }
    syncRemoteUsers();
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logisticSubView, setLogisticSubView] = useState('product_catalog');
  const [reportSubView, setReportSubView] = useState('hub');
  const [financeSubView, setFinanceSubView] = useState('cost_calculation');
  const [hrSubView, setHRSubView] = useState('leave_attendance');
  const [accountingSubTab, setAccountingSubTab] = useState('daily_entries');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClientType, setFilterClientType] = useState('all'); // all, รัฐบาล, เอกชน
  const [filterBudgetType, setFilterBudgetType] = useState('all'); // all, งบลงทุน, งบเงินบำรุง, งบบริจาค...

  // Modals

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoPrefill, setDemoPrefill] = useState(null);

    // Activity / Audit Log State
  const [activityLogs, setActivityLogs] = useState(window.INITIAL_ACTIVITY_LOGS || []);

  // Leave & Attendance States

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Universal Report Hub & Modal States
  const [isUniversalReportModalOpen, setIsUniversalReportModalOpen] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);

  const handleOpenReport = useCallback((reportId) => {
    setActiveReportId(reportId);
    setIsUniversalReportModalOpen(true);
  }, []);

  const handleOpenVoiceModal = (p) => {
    setToastNotification({ title: '🎙️ Voice AI', message: `พร้อมรับคำสั่งเสียงสำหรับโครงการ ${p ? p.hospitalName : ''}` });
  };


  // Scoped Projects based on User Role Scope
  const scopedProjects = useMemo(() => getScopedProjects(currentUser, projects), [projects, currentUser]);

  // 🔔 Cross-Module Smart Action Checklist / Alerts Aggregator (Personalized by currentUser & Role)
  const systemAlerts = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const userRole = currentUser ? String(currentUser.role).toUpperCase() : 'SALES';
    const isOwnerOrAdmin = ['OWNER', 'HEAD_ADMIN', 'ADMIN'].includes(userRole);

    // 1. 🎯 Kanban Projects Missing Cost Sheets (เฉพาะงานของ User หรือ Admin เห็นทั้งหมด)
    (projects || []).forEach(p => {
      const isMyProject = isOwnerOrAdmin || (currentUser && (
        p.salesPerson === currentUser.name || 
        p.salesRep === currentUser.name || 
        p.memberId === currentUser.id ||
        (currentUser.name && p.hospitalName && p.hospitalName.includes(currentUser.name))
      ));
      if (!isMyProject) return;

      // Check if project has cost calculation
      const hasCostSheet = (costCalculations || []).some(c => 
        (c.projectId && c.projectId === p.id) || 
        (c.projectName && p.hospitalName && c.projectName.includes(p.hospitalName))
      );

      if (!hasCostSheet) {
        let parsedDf = 0;
        let dfMissing = true;
        if (p.dfAmount) {
          dfMissing = false;
          const numStr = String(p.dfAmount).replace(/[^0-9.]/g, '');
          parsedDf = Number(numStr) || 0;
        }

        list.push({
          id: `cost-missing-${p.id}`,
          category: 'cost_sheet',
          icon: '🔴',
          title: 'ยังไม่ได้จัดทำใบคำนวณต้นทุน (Cost Sheet)',
          badgeText: 'งานด่วน Kanban',
          severity: 'urgent',
          description: `โครงการ: ${p.hospitalName || ''} - ${p.title || ''}`,
          detail: `งบประมาณ: ${formatCurrency(p.budget || 0)} | เซลส์ผู้ดูแล: ${p.salesPerson || currentUser?.name || 'ทีมขาย'}`,
          actionText: 'คำนวณต้นทุนงานนี้',
          onAction: () => {
            const tempCalc = {
              id: `temp-${p.id}`,
              projectId: p.id,
              projectName: `${p.hospitalName || ''} - ${p.title || ''}`,
              sellingPriceInVat: p.budget || 0,
              costInVat: Math.round((p.budget || 0) * 0.7),
              dfType: 'amount',
              dfValue: parsedDf,
              dfMissing: dfMissing,
              salesCommPercent: 2.0,
              interestPercent: 7.0,
              taxPercent: 20.0,
              retentionPercent: 5.0,
              date: new Date().toISOString().split('T')[0]
            };
            setEditingCostCalc(tempCalc);
            setIsCostModalOpen(true);
          }
        });
      }
    });

    // 2. 🧪 Demo Bookings Overdue / Pending Result
    if (checkTabAccess(userRole, 'calendar')) {
      (demoBookings || []).forEach(b => {
        const isMyDemo = isOwnerOrAdmin || (currentUser && b.salesPerson === currentUser.name);
        if (!isMyDemo) return;

        const isOverdue = b.endDate <= todayStr;
        const isPendingOutcome = !b.outcomeStatus || b.outcomeStatus === 'กำลังทดสอบ / รอผล';
        if (isOverdue && isPendingOutcome) {
          list.push({
            id: `demo-overdue-${b.id}`,
            category: 'demo',
            icon: '🧪',
            title: 'ครบกำหนดเดโม่ / รอสรุปผลลัพธ์',
            badgeText: 'คิวเดโม่',
            severity: 'warning',
            description: `เครื่อง ${b.productName || 'สาธิต'} ที่ ${b.hospitalName}`,
            detail: `กำหนดสิ้นสุด: ${b.endDate} | ผู้รับผิดชอบ: ${b.salesPerson}`,
            actionText: 'ไปที่ปฏิทินเดโม่',
            onAction: () => {
              setActiveSidebarTab('calendar');
            }
          });
        }
      });
    }

    // 3. 🛒 Purchase Orders Pending Action / Approval
    if (checkTabAccess(userRole, 'finance')) {
      (purchaseOrders || []).forEach(po => {
        if (po.status === 'รออนุมัติ' || po.paymentStatus === 'รอชำระเงิน') {
          list.push({
            id: `po-pending-${po.id}`,
            category: 'finance',
            icon: '🛒',
            title: po.status === 'รออนุมัติ' ? 'ใบสั่งซื้อรอการอนุมัติ (PO Pending)' : 'ใบสั่งซื้อรอชำระเงิน',
            badgeText: 'จัดซื้อ & การเงิน',
            severity: 'info',
            description: `PO: ${po.poNumber} (${po.vendorName}) - ${po.productName}`,
            detail: `ยอดรวม: ${formatCurrency(po.totalAmount || 0)}`,
            actionText: 'ดูรายการ PO',
            onAction: () => {
              setActiveSidebarTab('finance');
              setFinanceSubView('purchase_orders');
            }
          });
        }
      });
    }

    // 4. 🚢 Import Shipments Arrived in Thailand
    if (checkTabAccess(userRole, 'logistic')) {
      (shipments || []).forEach(shp => {
        if (shp.status === 'ถึงประเทศไทย รอออกของ') {
          list.push({
            id: `shp-arrived-${shp.id}`,
            category: 'import',
            icon: '🚢',
            title: 'สินค้าชิปปิ้งถึงประเทศไทย รอออกของ',
            badgeText: 'นำเข้าสินค้า',
            severity: 'info',
            description: `${shp.shipmentNumber} (${shp.productName})`,
            detail: `ผู้จัดส่ง: ${shp.shippingCompany} | AWB: ${shp.trackingNumber || '-'}`,
            actionText: 'ดูสถานะนำเข้า',
            onAction: () => {
              setActiveSidebarTab('logistic');
              setLogisticSubView('shipment_tracking');
            }
          });
        }
      });
    }

    // 5. 🛡️ FDA Registrations Expiring Soon (Within 60 days)
    if (checkTabAccess(userRole, 'report')) {
      (fdaRegistrations || []).forEach(fda => {
        if (fda.expiryDate) {
          const exp = new Date(fda.expiryDate);
          const now = new Date();
          const daysLeft = Math.ceil((exp - now) / 86400000);
          if (daysLeft >= 0 && daysLeft <= 60) {
            list.push({
              id: `fda-exp-${fda.id}`,
              category: 'fda',
              icon: '🛡️',
              title: `ใบอนุญาต อย. ใกล้หมดอายุ (เหลือ ${daysLeft} วัน)`,
              badgeText: 'งาน อย.',
              severity: 'warning',
              description: `สินค้า: ${fda.productName} (เลข อย. ${fda.fdaNumber || '-'})`,
              detail: `วันหมดอายุ: ${fda.expiryDate}`,
              actionText: 'ดูทะเบียน อย.',
              onAction: () => {
                setActiveSidebarTab('report');
                setReportSubView('fda_registration');
              }
            });
          }
        }
      });
    }

    return list;
  }, [projects, costCalculations, demoBookings, purchaseOrders, shipments, fdaRegistrations, currentUser]);

  // Pending PO Projects Count (โครงการที่ชนะงานแล้วแต่ยังไม่ได้ออก PO)
  const pendingPOCount = useMemo(() => {
    const wonStages = ['stage_won', 'stage_ordering', 'stage_delivery'];
    return scopedProjects.filter(p => {
      if (!wonStages.includes(p.status)) return false;
      return !purchaseOrders.some(po => po.projectId === p.id);
    }).length;
  }, [projects, purchaseOrders]);

  // Active Repair Count
  const activeRepairCount = useMemo(() => {
    return repairTickets.filter(t => t.status === 'ส่งซ่อมอยู่' || t.status === 'รอส่งซ่อม' || t.status === 'ระหว่างขนส่ง').length;
  }, [repairTickets]);

  // Active Shipments Count
  const activeShipmentCount = useMemo(() => {
    return shipments.filter(s => s.status !== 'ส่งลูกค้าแล้ว' && s.status !== 'ของถึง ออฟฟิศ').length;
  }, [shipments]);

  // Active FDA Count (Pending or Expiry Warning)
  const activeFDACount = useMemo(() => {
    return fdaRegistrations.filter(f => f.status !== 'อนุมัติใบอนุญาตแล้ว').length;
  }, [fdaRegistrations]);

  // ⚡ Members Master Sync with Hydration Guard
  const isMembersHydrated = useRef(false);

  useEffect(() => {
    localStorage.setItem('gov_hospital_members', JSON.stringify(members));
    if (isMembersHydrated.current && typeof syncToDB === 'function') {
      syncToDB('members', members);
    }
  }, [members]);

  useEffect(() => {
    async function hydrateMembers() {
      try {
        const fetcher = window.loadFromDB;
        if (!fetcher) return;
        const remoteMembers = await fetcher('members', null);
        if (Array.isArray(remoteMembers) && remoteMembers.length > 0) {
          setMembers(remoteMembers);
        }
      } catch(e) {}
      finally {
        isMembersHydrated.current = true;
      }
    }
    hydrateMembers();
  }, []);

  const filteredProjects = useMemo(() => {
    return scopedProjects.filter(p => {
      // Member view filter
      if (activeView !== 'manager' && activeView !== 'demo_calendar' && activeView !== 'product_catalog' && activeView !== 'purchase_orders' && activeView !== 'repair_service' && activeView !== 'sold_products' && activeView !== 'shipment_tracking' && activeView !== 'fda_registration' && activeView !== 'kanban_all' && activeView !== 'cost_calculation') {
        const currentMember = members.find(m => m.id === activeView);
        if (currentMember && p.assignee !== currentMember.name) {
          return false;
        }
      }

      // Client Type Filter
      if (filterClientType !== 'all' && p.clientType !== filterClientType) {
        return false;
      }

      // Budget Type Filter
      if (filterBudgetType !== 'all' && p.budgetType !== filterBudgetType) {
        return false;
      }

      // Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(term);
        const matchHosp = p.hospitalName.toLowerCase().includes(term);
        const matchAssignee = p.assignee.toLowerCase().includes(term);
        const matchProd = (p.productName || '').toLowerCase().includes(term);
        const matchDoctors = (p.decisionMakers || '').toLowerCase().includes(term);
        const matchComp = (p.competitors || '').toLowerCase().includes(term);
        return matchTitle || matchHosp || matchAssignee || matchProd || matchDoctors || matchComp;
      }

      return true;
    });
  }, [scopedProjects, projects, currentUser, activeView, members, filterClientType, filterBudgetType, searchTerm]);

  // Export Data to CSV
  const exportToCSV = () => {
    const headers = ["ชื่องาน/โครงการ", "โรงพยาบาล", "ประเภทลูกค้า", "ผู้รับผิดชอบ", "ชนิดสินค้า/รุ่น", "แบรนด์", "งบประมาณ(บาท)", "ประเภทงบประมาณ", "ทิศทางงบ", "สถานะขั้นตอน", "กำหนดจัดซื้อ", "สถานะเดโม่", "วันนัดเดโม่", "อาจารย์ผู้ตัดสินใจ", "ค่า DF", "คู่แข่ง", "โอกาสได้งาน(%)"];
    const rows = (projects || []).map(p => {
      const stageName = (window.STAGES.find(s => s.id === p.status) || {}).title || p.status;
      return [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.hospitalName.replace(/"/g, '""')}"`,
        `"${p.clientType}"`,
        `"${p.assignee}"`,
        `"${p.productName || ''}"`,
        `"${p.productBrand || 'AERON MEDICAL'}"`,
        p.budget || 0,
        `"${p.budgetType}"`,
        `"${p.budgetTrend}"`,
        `"${stageName}"`,
        `"${p.procurementDate || ''}"`,
        `"${p.demoStatus || ''}"`,
        `"${p.demoStartDate ? p.demoStartDate + ' ถึง ' + p.demoEndDate : ''}"`,
        `"${(p.decisionMakers || '').replace(/"/g, '""')}"`,
        `"${p.dfAmount || ''}"`,
        `"${(p.competitors || '').replace(/"/g, '""')}"`,
        p.winProbability || 0
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AERON_Project_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตกลับเป็นข้อมูลตัวอย่างตั้งต้นของ AERON MEDICAL ทั้งหมดใช่หรือไม่?')) {
      localStorage.removeItem('gov_hospital_projects');
      localStorage.removeItem('gov_hospital_members');
      localStorage.removeItem('aeron_products');
      localStorage.removeItem('aeron_demo_bookings');
      localStorage.removeItem('aeron_purchase_orders');
      localStorage.removeItem('aeron_repair_tickets');
      localStorage.removeItem('aeron_sold_products');
      localStorage.removeItem('aeron_shipments');
      localStorage.removeItem('aeron_fda_registrations');
      setProjects(window.INITIAL_PROJECTS);
      setMembers(window.INITIAL_MEMBERS);
      setProducts(window.CENTRAL_PRODUCT_CATALOG);
      setDemoBookings(window.INITIAL_DEMO_BOOKINGS);
      setPurchaseOrders(window.INITIAL_PURCHASE_ORDERS || []);
      setRepairTickets(window.INITIAL_REPAIR_TICKETS || []);
      setSoldProducts(window.INITIAL_SOLD_PRODUCTS || []);
      setShipments(window.INITIAL_SHIPMENTS || []);
      setFdaRegistrations(window.INITIAL_FDA_REGISTRATIONS || []);
    }
  };

  // 🔒 Security Guard: If not logged in, enforce Full-Screen Login Screen
  if (!currentUser) {
    return (
      <LoginModal 
        onLoginSuccess={handleLoginSuccess}
        isSwitching={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* 📌 Left Slim Icon Sidebar Rail (Always Visible on Desktop) */}
      <SidebarIconRail 
        currentUser={currentUser}
        activeTab={activeSidebarTab}
        setActiveTab={setActiveSidebarTab}
        onOpenFullDrawer={() => setIsSidebarOpen(true)}
        pendingPOCount={pendingPOCount}
        activeRepairCount={activeRepairCount}
        activeShipmentCount={activeShipmentCount}
        activeFDACount={activeFDACount}
      />

      {/* 🚀 Slide-out Pop-up Navigation Drawer Modal */}
      <SidebarNavDrawer 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeSidebarTab}
        setActiveTab={setActiveSidebarTab}
        currentUser={currentUser}
        pendingPOCount={pendingPOCount}
        activeRepairCount={activeRepairCount}
        activeShipmentCount={activeShipmentCount}
        activeFDACount={activeFDACount}
      />

      {/* Right Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header 
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenUserAccountModal={() => setIsUserAccountModalOpen(true)}
        onLogout={handleLogout}
        alerts={systemAlerts}
        onOpenNotificationModal={() => setIsNotificationModalOpen(true)}
        activeSidebarTab={activeSidebarTab}
        setActiveSidebarTab={setActiveSidebarTab}
        activeView={activeView}
        setActiveView={setActiveView}
        logisticSubView={logisticSubView}
        setLogisticSubView={setLogisticSubView}
        reportSubView={reportSubView}
        setReportSubView={setReportSubView}
        financeSubView={financeSubView}
        setFinanceSubView={setFinanceSubView}
        hrSubView={hrSubView}
        setHRSubView={setHRSubView}
        accountingSubTab={accountingSubTab}
        setAccountingSubTab={setAccountingSubTab}
        members={members}
        projects={projects}
        pendingPOCount={pendingPOCount}
        activeRepairCount={activeRepairCount}
        soldProductsCount={soldProducts.length}
        activeShipmentCount={activeShipmentCount}
        activeFDACount={activeFDACount}
        activityLogsCount={activityLogs.length}
        onOpenNewModal={() => { setEditingProject(null); setIsModalOpen(true); }}
        onOpenMemberModal={() => setIsMemberModalOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterClientType={filterClientType}
        setFilterClientType={setFilterClientType}
        filterBudgetType={filterBudgetType}
        setFilterBudgetType={setFilterBudgetType}
        exportToCSV={exportToCSV}
        onResetDemo={handleResetDemoData}
        onOpenDemoModal={() => { setDemoPrefill(null); setIsDemoModalOpen(true); }}
        onOpenProductModal={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
        onOpenRepairModal={() => { setEditingRepairTicket(null); setIsRepairModalOpen(true); }}
        onOpenSoldModal={() => { setEditingSoldAsset(null); setIsSoldModalOpen(true); }}
        onOpenShipmentModal={() => { setEditingShipment(null); setIsShipmentModalOpen(true); }}
        onOpenFDAModal={() => { setEditingFDA(null); setIsFDAModalOpen(true); }}
      />

      {/* Main Content Body: Natural document flow with no isolated scroll lock */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
          
          {/* TAB 1: Dashboard */}
          {activeSidebarTab === 'dashboard' && checkTabAccess(currentUser?.role, 'dashboard') && (
            <ManagerDashboard 
              projects={filteredProjects}
              allProjects={projects}
              members={members}
              products={products}
              demoBookings={demoBookings}
              purchaseOrders={purchaseOrders}
              shipments={shipments}
              repairTickets={repairTickets}
              soldProducts={soldProducts}
              fdaRegistrations={fdaRegistrations}
              costCalculations={costCalculations}
              currentUser={currentUser}
              initialTab={activeView === 'dashboard_ceo' ? 'ceo' : activeView === 'dashboard_cfo' ? 'cfo' : activeView === 'dashboard_manager' ? 'manager' : activeView === 'dashboard_classic' ? 'classic' : undefined}
              onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
              onAddLog={(p) => { setLogTargetProject(p); setIsLogModalOpen(true); }}
              onViewHistory={handleOpenHistoryModal}
              onMoveProject={handleMoveProject}
              onBookDemo={(p) => { setDemoPrefill({ projectId: p.id, hospitalName: p.hospitalName, productId: p.productId, salesPerson: p.assignee }); setIsDemoModalOpen(true); }}
              onOpenReport={handleOpenReport}
            />
          )}

          {/* TAB 2: Clients */}
          {activeSidebarTab === 'clients' && checkTabAccess(currentUser?.role, 'clients') && (
            <ClientsDirectoryView
              projects={projects}
              members={members}
              demoBookings={demoBookings}
              soldProducts={soldProducts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterClientType={filterClientType}
              setFilterClientType={setFilterClientType}
              onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
              onBookDemo={(p) => { setDemoPrefill({ projectId: p.id, hospitalName: p.hospitalName, productId: p.productId, salesPerson: p.assignee }); setIsDemoModalOpen(true); }}
              onAddLog={(p) => { setLogTargetProject(p); setIsLogModalOpen(true); }}
              onOpenProjectDetail={(p) => { setHistoryTargetProject(p); setIsHistoryModalOpen(true); }}
            />
          )}

          {/* TAB 3: Project (Sales Kanban) */}
          {activeSidebarTab === 'project' && checkTabAccess(currentUser, 'project') && (
            <MemberKanban 
              projects={filteredProjects} 
              currentUser={currentUser}
              stages={window.STAGES}
              members={members}
              products={products}
              activeMemberId={activeView}
              demoBookings={demoBookings}
              onMoveProject={handleMoveProject}
              onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
              onDeleteProject={handleDeleteProject}
              onAddLog={(p) => { setLogTargetProject(p); setIsLogModalOpen(true); }}
              onViewHistory={handleOpenHistoryModal}
              onOpenVoiceModal={handleOpenVoiceModal}
              onOpenNewModal={() => { setEditingProject(null); setIsModalOpen(true); }}
              onBookDemo={(p) => { setDemoPrefill({ projectId: p.id, hospitalName: p.hospitalName, productId: p.productId, salesPerson: p.assignee }); setIsDemoModalOpen(true); }}
              onOpenChecklist={(b) => { setChecklistTargetBooking(b); setIsChecklistModalOpen(true); }}
            />
          )}

          {/* TAB 4: Logistic */}
          {activeSidebarTab === 'logistic' && checkTabAccess(currentUser?.role, 'logistic') && (
            <div className="space-y-6">

              {logisticSubView === 'product_catalog' && (
                <ProductCatalogView 
                  products={products}
                  demoBookings={demoBookings}
                  onOpenNewProduct={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                  onEditProduct={(product) => { setEditingProduct(product); setIsProductModalOpen(true); }}
                  onDeleteProduct={(id) => {
                    setProducts(prev => {
                      const updated = prev.filter(p => p.id !== id);
                      if (typeof window.syncToDB === 'function') {
                        window.syncToDB('products', updated);
                      }
                      return updated;
                    });
                  }}
                  onOpenRepairModal={handleOpenRepairFromCatalog}
                />
              )}

              {logisticSubView === 'shipment_tracking' && (
                <ShipmentTrackingView 
                  shipments={shipments}
                  purchaseOrders={purchaseOrders}
                  products={products}
                  onOpenNewShipment={(prefill) => { setEditingShipment(prefill); setIsShipmentModalOpen(true); }}
                  onEditShipment={(shipment) => { setEditingShipment(shipment); setIsShipmentModalOpen(true); }}
                  onDeleteShipment={handleDeleteShipment}
                />
              )}

              {logisticSubView === 'repair_service' && (
                <RepairServiceView 
                  repairTickets={repairTickets}
                  products={products}
                  members={members}
                  onOpenNewTicket={(prefill) => { setEditingRepairTicket(prefill); setIsRepairModalOpen(true); }}
                  onEditTicket={(ticket) => { setEditingRepairTicket(ticket); setIsRepairModalOpen(true); }}
                  onDeleteTicket={handleDeleteRepairTicket}
                  onViewInCatalog={(pName) => { setLogisticSubView('product_catalog'); }}
                />
              )}

              {logisticSubView === 'sold_products' && (
                <SoldProductsView 
                  soldProducts={soldProducts}
                  projects={projects}
                  members={members}
                  onOpenNewAsset={(prefill) => { setEditingSoldAsset(prefill); setIsSoldModalOpen(true); }}
                  onEditAsset={(asset) => { setEditingSoldAsset(asset); setIsSoldModalOpen(true); }}
                  onDeleteAsset={handleDeleteSoldAsset}
                  onOpenReport={handleOpenReport}
                />
              )}
            </div>
          )}

          {/* TAB 5: Calendar */}
          {activeSidebarTab === 'calendar' && checkTabAccess(currentUser?.role, 'calendar') && (
            <DemoCalendarView 
              demoBookings={demoBookings}
              products={products}
              projects={projects}
              members={members}
              currentUser={currentUser}
              onOpenBookDemo={() => { setDemoPrefill(null); setIsDemoModalOpen(true); }}
              onDeleteBooking={(id) => setDemoBookings(prev => prev.filter(b => b.id !== id))}
              onUpdateStatus={handleUpdateBookingStatus}
              onOpenChecklist={(b) => { setChecklistTargetBooking(b); setIsChecklistModalOpen(true); }}
            />
          )}

          {/* TAB 6: Report */}
          {activeSidebarTab === 'report' && checkTabAccess(currentUser?.role, 'report') && (
            <div className="space-y-6">

              {(reportSubView === 'hub' || !reportSubView || reportSubView === 'analytics_reports') && (
                <CentralReportsHubView 
                  appState={{
                    projects,
                    members,
                    products,
                    demoBookings,
                    purchaseOrders,
                    shipments,
                    repairTickets,
                    soldProducts,
                    fdaRegistrations,
                    costCalculations,
                    leaveRequests,
                    attendanceLogs,
                    accountingTransactions: window.INITIAL_ACCOUNTING_TRANSACTIONS || [],
                    currentUser
                  }}
                  onOpenReport={handleOpenReport}
                />
              )}

              {reportSubView === 'fda_registration' && (
                <FDARegistrationView 
                  fdaRegistrations={fdaRegistrations}
                  products={products}
                  members={members}
                  onOpenNewFDA={(prefill) => { setEditingFDA(prefill); setIsFDAModalOpen(true); }}
                  onEditFDA={(fda) => { setEditingFDA(fda); setIsFDAModalOpen(true); }}
                  onDeleteFDA={handleDeleteFDA}
                />
              )}

              {reportSubView === 'activity_logs' && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                      <span>🔐 ประวัติการใช้งานระบบ (System Activity Audit Logs)</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">ทั้งหมด {activityLogs.length} รายการ</span>
                  </div>
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 uppercase text-[10px] text-slate-400 sticky top-0">
                        <tr>
                          <th className="p-3">วัน-เวลา</th>
                          <th className="p-3">ผู้ใช้งาน</th>
                          <th className="p-3">ตำแหน่ง</th>
                          <th className="p-3">กิจกรรมที่ทำ</th>
                          <th className="p-3">เป้าหมาย/ระบบ</th>
                          <th className="p-3">รายละเอียดเพิ่มเติม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {activityLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-900/40">
                            <td className="p-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                            <td className="p-3 font-bold text-amber-300">{log.fullName}</td>
                            <td className="p-3 text-slate-400">{log.role}</td>
                            <td className="p-3 font-bold text-emerald-400">{log.action}</td>
                            <td className="p-3 text-indigo-300">{log.target}</td>
                            <td className="p-3 text-slate-300 text-[11px]">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Finance */}
          {activeSidebarTab === 'finance' && checkTabAccess(currentUser?.role, 'finance') && (
            <div className="space-y-6">

              {financeSubView === 'cost_calculation' && (
                <CostCalculationView 
                  costCalculations={costCalculations}
                  projects={projects}
                  members={members}
                  onOpenNewCalc={(prefill) => { setEditingCostCalc(prefill); setIsCostModalOpen(true); }}
                  onEditCalc={(calc) => { setEditingCostCalc(calc); setIsCostModalOpen(true); }}
                  onDeleteCalc={handleDeleteCostCalc}
                  onOpenReport={handleOpenReport}
                />
              )}

              {financeSubView === 'cash_forecast' && (
                <CashForecastView
                  projects={projects}
                  purchaseOrders={purchaseOrders}
                  transactions={transactions}
                  costCalculations={costCalculations}
                  currentUser={currentUser}
                />
              )}

              {financeSubView === 'purchase_orders' && (
                <PurchaseOrderView 
                  purchaseOrders={purchaseOrders}
                  projects={projects}
                  products={products}
                  onOpenNewPO={(prefillProj) => { setEditingPO(prefillProj ? { projectId: prefillProj.id, hospitalName: prefillProj.hospitalName, productName: prefillProj.productName, quantity: prefillProj.quantity, totalAmountTHB: prefillProj.budget } : null); setIsPOModalOpen(true); }}
                  onEditPO={(po) => { setEditingPO(po); setIsPOModalOpen(true); }}
                  onDeletePO={handleDeletePO}
                />
              )}
            </div>
          )}

          {/* TAB 9: ACCOUNTING */}
          {activeSidebarTab === 'accounting' && checkTabAccess(currentUser?.role, 'accounting') && (
            <AccountingModule
              transactions={transactions}
              purchaseOrders={purchaseOrders}
              projects={projects}
              products={products}
              initialFrozenMonths={window.INITIAL_ACCOUNTING_FROZEN_MONTHS}
              initialRecurringTemplates={window.INITIAL_ACCOUNTING_RECURRING}
              currentUser={currentUser}
              accountingSubTab={accountingSubTab}
              onSubTabChange={setAccountingSubTab}
              onSaveTxn={handleSaveTransaction}
              onDeleteTxn={handleDeleteTransaction}
              onBatchImportTxns={handleBatchImportTransactions}
              onOpenPOModal={(po) => { setEditingPO(po || null); setIsPOModalOpen(true); }}
              onDeletePO={handleDeletePO}
            />
          )}

          {/* MESSENGER VIEW */}
          {(activeSidebarTab === 'messenger' || (currentUser && currentUser.role === 'MESSENGER')) && (
            <MessengerDispatchView
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}

          {/* TAB 8: HR */}
          {activeSidebarTab === 'hr' && checkTabAccess(currentUser?.role, 'hr') && (
            <div className="space-y-6">
              {/* Sub-view Toggle Tabs */}

              {hrSubView === 'leave_attendance' && (
                <LeaveAttendanceView
                  leaveRequests={leaveRequests}
                  attendanceLogs={attendanceLogs}
                  members={members}
                  currentUser={currentUser}
                  onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
                  onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
                  onApproveLeave={handleApproveLeave}
                  onDeleteLeave={handleDeleteLeave}
                  onDeleteAttendance={handleDeleteAttendance}
                />
              )}

              {hrSubView === 'team_roster' && (
                <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-2xl shadow-inner">
                      👥
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span>ทีม Sales & บริหารทรัพยากรบุคคล (Sales Team & HR Roster)</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                          {members.length} ท่าน
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        จัดการรายชื่อเซลล์ผู้ดูแลโครงการ สิทธิ์การเข้าถึง และโปรไฟล์บุคลากร
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMemberModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    + เพิ่มสมาชิกทีม
                  </button>
                </div>
              )}
            </div>
          )}

        </main>

      {/* Floating Action Button (Mobile Quick Add Task) */}
      <button
        onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
        className="fixed bottom-5 right-5 z-40 sm:hidden flex items-center justify-center w-14 h-14 bg-gradient-to-r from-lime-500 to-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-transform"
        title="เพิ่มโครงการใหม่"
      >
        <span className="text-2xl font-bold">+</span>
      </button>

      {/* Project Create / Edit Modal */}
      {isModalOpen && (
        <ProjectModal 
          project={editingProject} 
          members={members}
          stages={window.STAGES}
          products={products}
          currentUser={currentUser}
          onSave={handleSaveProject}
          onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
        />
      )}

      {/* Weekly Progress Log Modal */}
      {isLogModalOpen && logTargetProject && (
        <WeeklyLogModal
          project={logTargetProject}
          members={members}
          onSave={(note, author) => handleAddWeeklyLog(logTargetProject.id, note, author)}
          onClose={() => { setIsLogModalOpen(false); setLogTargetProject(null); }}
        />
      )}

      {/* Team Member Management Modal */}
      {isMemberModalOpen && (
        <MemberManagementModal
          members={members}
          setMembers={setMembers}
          onClose={() => setIsMemberModalOpen(false)}
        />
      )}

      </div>
      
      {/* 🚀 Centralized App Modals & Popups Container */}
      <AppModalsContainer
        isDemoModalOpen={isDemoModalOpen}
        setIsDemoModalOpen={setIsDemoModalOpen}
        demoPrefill={demoPrefill}
        setDemoPrefill={setDemoPrefill}
        projects={projects}
        products={products}
        members={members}
        demoBookings={demoBookings}
        handleSaveDemoBooking={handleSaveDemoBooking}
        isProductModalOpen={isProductModalOpen}
        setIsProductModalOpen={setIsProductModalOpen}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        productCategories={productCategories}
        handleUpdateCategories={handleUpdateCategories}
        handleSaveProduct={handleSaveProduct}
        isPOModalOpen={isPOModalOpen}
        setIsPOModalOpen={setIsPOModalOpen}
        editingPO={editingPO}
        setEditingPO={setEditingPO}
        handleSavePO={handleSavePO}
        isRepairModalOpen={isRepairModalOpen}
        setIsRepairModalOpen={setIsRepairModalOpen}
        editingRepairTicket={editingRepairTicket}
        setEditingRepairTicket={setEditingRepairTicket}
        handleSaveRepairTicket={handleSaveRepairTicket}
        isSoldModalOpen={isSoldModalOpen}
        setIsSoldModalOpen={setIsSoldModalOpen}
        editingSoldAsset={editingSoldAsset}
        setEditingSoldAsset={setEditingSoldAsset}
        handleSaveSoldAsset={handleSaveSoldAsset}
        isShipmentModalOpen={isShipmentModalOpen}
        setIsShipmentModalOpen={setIsShipmentModalOpen}
        editingShipment={editingShipment}
        setEditingShipment={setEditingShipment}
        purchaseOrders={purchaseOrders}
        handleSaveShipment={handleSaveShipment}
        isFDAModalOpen={isFDAModalOpen}
        setIsFDAModalOpen={setIsFDAModalOpen}
        editingFDA={editingFDA}
        setEditingFDA={setEditingFDA}
        handleSaveFDA={handleSaveFDA}
        isHistoryModalOpen={isHistoryModalOpen}
        setIsHistoryModalOpen={setIsHistoryModalOpen}
        historyTargetProject={historyTargetProject}
        setHistoryTargetProject={setHistoryTargetProject}
        handleAddWeeklyLog={handleAddWeeklyLog}
        isCostModalOpen={isCostModalOpen}
        setIsCostModalOpen={setIsCostModalOpen}
        editingCostCalc={editingCostCalc}
        setEditingCostCalc={setEditingCostCalc}
        handleSaveCostCalc={handleSaveCostCalc}
        isChecklistModalOpen={isChecklistModalOpen}
        setIsChecklistModalOpen={setIsChecklistModalOpen}
        checklistTargetBooking={checklistTargetBooking}
        setChecklistTargetBooking={setChecklistTargetBooking}
        toastNotification={toastNotification}
        setToastNotification={setToastNotification}
        setActiveView={setActiveView}
        isLeaveModalOpen={isLeaveModalOpen}
        setIsLeaveModalOpen={setIsLeaveModalOpen}
        currentUser={currentUser}
        handleSaveLeave={handleSaveLeave}
        isAttendanceModalOpen={isAttendanceModalOpen}
        setIsAttendanceModalOpen={setIsAttendanceModalOpen}
        handleSaveAttendance={handleSaveAttendance}
        isUserAccountModalOpen={isUserAccountModalOpen}
        setIsUserAccountModalOpen={setIsUserAccountModalOpen}
        isNotificationModalOpen={isNotificationModalOpen}
        setIsNotificationModalOpen={setIsNotificationModalOpen}
        systemAlerts={systemAlerts}
        isUniversalReportModalOpen={isUniversalReportModalOpen}
        setIsUniversalReportModalOpen={setIsUniversalReportModalOpen}
        activeReportId={activeReportId}
        soldProducts={soldProducts}
        fdaRegistrations={fdaRegistrations}
        costCalculations={costCalculations}
        leaveRequests={leaveRequests}
        attendanceLogs={attendanceLogs}
        isGlobalCategoryManagerOpen={isGlobalCategoryManagerOpen}
        setIsGlobalCategoryManagerOpen={setIsGlobalCategoryManagerOpen}
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
        handleLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

window.App = App;

// Mount App to DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
