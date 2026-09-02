// One-time System Data Reset Check for Day 1 Clean Go-Live (with 100% Matched Categories)
const DAY1_RESET_VERSION = 'v2.8.3_matched_filters';
try {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('aeron_sys_data_version') !== DAY1_RESET_VERSION) {
    const keptAuth = localStorage.getItem('aeron_auth_user');
    const keptJwt = localStorage.getItem('aeron_jwt_token');
    const keptMembers = localStorage.getItem('gov_hospital_members');
    localStorage.clear();
    if (keptAuth) localStorage.setItem('aeron_auth_user', keptAuth);
    if (keptJwt) localStorage.setItem('aeron_jwt_token', keptJwt);
    if (keptMembers) localStorage.setItem('gov_hospital_members', keptMembers);
    localStorage.setItem('aeron_sys_data_version', DAY1_RESET_VERSION);
  }
} catch (e) {
  console.warn('Storage reset sync notice:', e);
}

function App() {
  // Projects State
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('gov_hospital_projects');
      return saved ? JSON.parse(saved) : window.INITIAL_PROJECTS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for gov_hospital_projects:', e);
      return window.INITIAL_PROJECTS || [];
    }
  });

  // Team Members State
  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('gov_hospital_members');
      return saved ? JSON.parse(saved) : window.INITIAL_MEMBERS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for gov_hospital_members:', e);
      return window.INITIAL_MEMBERS || [];
    }
  });

  // Central Product Catalog State
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_products');
      return saved ? JSON.parse(saved) : window.CENTRAL_PRODUCT_CATALOG || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_products:', e);
      return window.CENTRAL_PRODUCT_CATALOG || [];
    }
  });

  // Demo Bookings State
  const [demoBookings, setDemoBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_demo_bookings');
      return saved ? JSON.parse(saved) : window.INITIAL_DEMO_BOOKINGS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_demo_bookings:', e);
      return window.INITIAL_DEMO_BOOKINGS || [];
    }
  });

  // Vendor Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_purchase_orders');
      return saved ? JSON.parse(saved) : window.INITIAL_PURCHASE_ORDERS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_purchase_orders:', e);
      return window.INITIAL_PURCHASE_ORDERS || [];
    }
  });

  // Repair Tickets State
  const [repairTickets, setRepairTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_repair_tickets');
      return saved ? JSON.parse(saved) : window.INITIAL_REPAIR_TICKETS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_repair_tickets:', e);
      return window.INITIAL_REPAIR_TICKETS || [];
    }
  });

  // Delivered / Sold Products State
  const [soldProducts, setSoldProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_sold_products');
      return saved ? JSON.parse(saved) : window.INITIAL_SOLD_PRODUCTS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_sold_products:', e);
      return window.INITIAL_SOLD_PRODUCTS || [];
    }
  });

  // Import Logistics / Shipments State
  const [shipments, setShipments] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_shipments');
      return saved ? JSON.parse(saved) : window.INITIAL_SHIPMENTS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_shipments:', e);
      return window.INITIAL_SHIPMENTS || [];
    }
  });

  // MOD-09 Accounting Transactions State
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_accounting_txns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= (window.INITIAL_ACCOUNTING_TRANSACTIONS?.length || 0)) {
          return parsed;
        }
      }
      return window.INITIAL_ACCOUNTING_TRANSACTIONS || [];
    } catch(e) { return window.INITIAL_ACCOUNTING_TRANSACTIONS || []; }
  });
  // Thai FDA Registrations State
  const [fdaRegistrations, setFdaRegistrations] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_fda_registrations');
      return saved ? JSON.parse(saved) : window.INITIAL_FDA_REGISTRATIONS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_fda_registrations:', e);
      return window.INITIAL_FDA_REGISTRATIONS || [];
    }
  });


  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  // --- Auth & RBAC State: Mandatory Login Protection Every Time ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState(false);

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
        if (typeof loadFromDB === 'function') {
          const remoteUsers = await loadFromDB('users', null);
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
  const [activeView, setActiveView] = useState('manager');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClientType, setFilterClientType] = useState('all'); // all, รัฐบาล, เอกชน
  const [filterBudgetType, setFilterBudgetType] = useState('all'); // all, งบลงทุน, งบเงินบำรุง, งบบริจาค...

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logTargetProject, setLogTargetProject] = useState(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoPrefill, setDemoPrefill] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [editingRepairTicket, setEditingRepairTicket] = useState(null);

  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [editingSoldAsset, setEditingSoldAsset] = useState(null);

  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

  const [isFDAModalOpen, setIsFDAModalOpen] = useState(false);
  const [editingFDA, setEditingFDA] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetProject, setHistoryTargetProject] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistTargetBooking, setChecklistTargetBooking] = useState(null);

  const [costCalculations, setCostCalculations] = useState(() => {
    const saved = localStorage.getItem('aeron_cost_calculations');
    return saved ? JSON.parse(saved) : (window.INITIAL_COST_CALCULATIONS || []);
  });
  // Activity / Audit Log State
  const [activityLogs, setActivityLogs] = useState(window.INITIAL_ACTIVITY_LOGS || []);

  // Leave & Attendance States
  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_leave_requests');
      return saved ? JSON.parse(saved) : (window.INITIAL_LEAVE_REQUESTS || []);
    } catch(e) { return window.INITIAL_LEAVE_REQUESTS || []; }
  });
  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_attendance_logs');
      return saved ? JSON.parse(saved) : (window.INITIAL_ATTENDANCE_LOGS || []);
    } catch(e) { return window.INITIAL_ATTENDANCE_LOGS || []; }
  });
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingCostCalc, setEditingCostCalc] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Universal Report Hub & Modal States
  const [isUniversalReportModalOpen, setIsUniversalReportModalOpen] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);

  const handleOpenReport = (reportId) => {
    setActiveReportId(reportId);
    setIsUniversalReportModalOpen(true);
  };

  const handleOpenHistoryModal = (proj) => {
    setHistoryTargetProject(proj);
    setIsHistoryModalOpen(true);
  };

  const handleOpenVoiceModal = (p) => {
    setToastNotification({ title: '🎙️ Voice AI', message: `พร้อมรับคำสั่งเสียงสำหรับโครงการ ${p ? p.hospitalName : ''}` });
  };

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    setDemoBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };

  const handleSaveCostCalc = (calcData) => {
    setCostCalculations(prev => {
      const idx = prev.findIndex(c => c.id === calcData.id || c.projectId === calcData.projectId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...calcData, id: copy[idx].id };
        return copy;
      } else {
        return [{ ...calcData, id: `calc-${Date.now()}` }, ...prev];
      }
    });
    setIsCostModalOpen(false);
    setEditingCostCalc(null);
  };

  const handleDeleteCostCalc = (calcId) => {
    if (window.confirm('ยืนยันลบสเปรดชีตคำนวณต้นทุนนี้?')) {
      setCostCalculations(prev => prev.filter(c => c.id !== calcId));
    }
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

  // Save to LocalStorage & Sync to db/*.json subfolder
  useEffect(() => {
    localStorage.setItem('gov_hospital_projects', JSON.stringify(projects));
    syncToDB('projects', projects);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('gov_hospital_members', JSON.stringify(members));
    syncToDB('members', members);
  }, [members]);

  useEffect(() => {
    localStorage.setItem('aeron_products', JSON.stringify(products));
    syncToDB('products', products);
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aeron_demo_bookings', JSON.stringify(demoBookings));
    syncToDB('demo_bookings', demoBookings);
  }, [demoBookings]);

  useEffect(() => {
    localStorage.setItem('aeron_purchase_orders', JSON.stringify(purchaseOrders));
    syncToDB('purchase_orders', purchaseOrders);
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('aeron_repair_tickets', JSON.stringify(repairTickets));
    syncToDB('repair_tickets', repairTickets);
  }, [repairTickets]);

  useEffect(() => {
    localStorage.setItem('aeron_sold_products', JSON.stringify(soldProducts));
    syncToDB('sold_products', soldProducts);
  }, [soldProducts]);

  useEffect(() => {
    localStorage.setItem('aeron_shipments', JSON.stringify(shipments));
    syncToDB('shipments', shipments);
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('aeron_fda_registrations', JSON.stringify(fdaRegistrations));
    syncToDB('fda_registrations', fdaRegistrations);
  }, [fdaRegistrations]);

  useEffect(() => {
    localStorage.setItem('aeron_cost_calculations', JSON.stringify(costCalculations));
    syncToDB('cost_calculations', costCalculations);
  }, [costCalculations]);


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
  }, [projects, activeView, members, filterClientType, filterBudgetType, searchTerm]);

  // Handle move project stage in Kanban
  const handleMoveProject = (projectId, targetStageId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const isWon = targetStageId === 'stage_won' || targetStageId === 'stage_ordering';
        if (isWon && p.status !== targetStageId) {
          setToastNotification({
            show: true,
            title: `🎉 เซลส์ ${p.assignee} เปลี่ยนสถานะโครงการเป็นชนะงาน/ได้สัญญา!`,
            message: `โครงการ "${p.hospitalName}" (${formatCurrency(p.budget)}) ได้ถูกย้ายเข้าสู่หน้ารอสั่งซื้อ PO จาก Vendor`,
            projectId: p.id
          });
        }

        const isDelivered = targetStageId === 'stage_delivery' || targetStageId === 'stage_completed';
        if (isDelivered && p.status !== targetStageId) {
          const exists = soldProducts.some(sp => sp.projectId === p.id);
          if (!exists) {
            const delivDate = p.procurementDate || new Date().toISOString().split('T')[0];
            const delivYr = new Date(delivDate).getFullYear();
            const newAsset = {
              id: 'sold-' + Date.now(),
              assetNumber: `AST-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
              contractNumber: `PO-HOSP-${delivYr}/${Math.floor(Math.random() * 80) + 10}`,
              projectId: p.id,
              hospitalName: p.hospitalName,
              department: 'แผนกห้องผ่าตัด / CCU',
              productName: p.productName || 'เครื่องมือแพทย์ AERON',
              brand: p.productBrand || 'AERON MEDICAL',
              productCategory: p.productCategory || 'อุปกรณ์ทางการแพทย์',
              serialNumber: `SN-AERON-${Math.floor(Math.random() * 899999) + 100000}`,
              freebies: 'กระดาษบันทึกมาตรฐาน 10 ม้วน, สายสัญญาณสำรอง, รถเข็นสแตนเลส, คู่มือการใช้งานภาษาไทย',
              salesPerson: p.assignee,
              contactPerson: p.decisionMakers || 'อาจารย์แพทย์ / หัวหน้าพยาบาล',
              deliveryDate: delivDate,
              projectValue: p.budget || 0,
              dfAmount: p.dfAmount || '100,000 บาท',
              bidGuaranteeAmount: Math.round((p.budget || 0) * 0.05),
              bidGuaranteeRefundDate: `${delivYr}-12-15`,
              warrantyYears: 1,
              warrantyExpiryDate: `${delivYr + 1}-${delivDate.substring(5)}`,
              nextPmDate: `${delivYr}-12-15`,
              pmFrequency: 'ทุก 6 เดือน (ปีละ 2 ครั้ง)',
              pmStatus: '⏳ ถึงกำหนดทำ PM',
              status: 'รับมอบเรียบร้อย'
            };
            setSoldProducts(prevSold => [newAsset, ...prevSold]);

            setToastNotification({
              show: true,
              title: `🚚 ส่งมอบสินค้าสำเร็จ! บันทึกเข้าตาราง "สินค้าที่ขายแล้ว" อัตโนมัติ`,
              message: `โครงการ "${p.hospitalName}" (${formatCurrency(p.budget)}) ได้ถูกบันทึกเข้าสู่หน้ารายการสินค้าที่ขายแล้ว พร้อมตั้งวันหมดประกันและนัด PM อัตโนมัติ`,
              projectId: p.id
            });
          }
        }

        return { ...p, status: targetStageId };
      }
      return p;
    }));
  };

  // Add Project
  const handleSaveProject = (projectData) => {
    if (projectData.id) {
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
    } else {
      const newProj = {
        ...projectData,
        id: 'proj-' + Date.now(),
        createdDate: new Date().toISOString().split('T')[0],
        weeklyLogs: []
      };
      setProjects(prev => [newProj, ...prev]);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  // Delete Project
  const handleDeleteProject = (projectId) => {
    if (window.confirm('คุณต้องการลบโครงการนี้ออกจากระบบใช่หรือไม่?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  // Add Weekly Log Note
  const handleAddWeeklyLog = (projectId, note, author) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newLog = {
          date: new Date().toISOString().split('T')[0],
          author: author || p.assignee,
          note
        };
        const updatedLogs = [newLog, ...(p.weeklyLogs || [])];
        const updatedProj = {
          ...p,
          weeklyLogs: updatedLogs
        };

        if (historyTargetProject && historyTargetProject.id === projectId) {
          setHistoryTargetProject(updatedProj);
        }

        return updatedProj;
      }
      return p;
    }));
    setIsLogModalOpen(false);
    setLogTargetProject(null);
  };

  // Save Demo Booking
  const handleSaveDemoBooking = (bookingData) => {
    if (bookingData.id) {
      setDemoBookings(prev => prev.map(b => b.id === bookingData.id ? bookingData : b));
    } else {
      const newBooking = {
        ...bookingData,
        id: 'booking-' + Date.now()
      };
      setDemoBookings(prev => [newBooking, ...prev]);

      if (bookingData.projectId) {
        setProjects(prev => prev.map(p => {
          if (p.id === bookingData.projectId) {
            return {
              ...p,
              demoStatus: 'นัดหมายแล้ว',
              demoStartDate: bookingData.startDate,
              demoEndDate: bookingData.endDate
            };
          }
          return p;
        }));
      }
    }

    setIsDemoModalOpen(false);
    setDemoPrefill(null);
  };

  // Save Central Product
  const handleSaveProduct = (productData) => {
    if (productData.id) {
      setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
    } else {
      const newProd = {
        ...productData,
        id: 'prod-' + Date.now()
      };
      setProducts(prev => [newProd, ...prev]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Save Purchase Order (PO) with Auto-Linking to Shipment Tracking
  const handleSavePO = (poData) => {
    let savedPO = poData;
    if (poData.id) {
      setPurchaseOrders(prev => prev.map(po => po.id === poData.id ? poData : po));
    } else {
      savedPO = {
        ...poData,
        id: 'po-' + Date.now()
      };
      setPurchaseOrders(prev => [savedPO, ...prev]);
    }

    // Auto Link: Create Shipment Tracking Entry if not existing
    if (savedPO.poNumber) {
      setShipments(prevShipments => {
        const exists = prevShipments.some(s => s.poNumber === savedPO.poNumber || s.poId === savedPO.id);
        if (!exists) {
          const delivYr = new Date().getFullYear();
          const newShipment = {
            id: 'shp-' + Date.now(),
            shipmentNumber: `SHP-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
            poNumber: savedPO.poNumber,
            poId: savedPO.id,
            productName: savedPO.productName || 'เครื่องมือแพทย์ AERON',
            productCategory: savedPO.productCategory || 'อุปกรณ์แพทย์',
            quantity: savedPO.quantity || 1,
            vendorName: savedPO.vendorName || 'Vendor Manufacturer',
            vendorCountry: savedPO.vendorCountry || 'ต่างประเทศ',
            hospitalDestination: savedPO.hospitalName || 'โรงพยาบาลเป้าหมาย',
            shippingCompany: 'DHL Global Forwarding',
            trackingNumber: `AWB-${Math.floor(Math.random() * 89999999) + 10000000}`,
            cbm: 2.5,
            grossWeight: 150.0,
            transportType: '✈️ ทางอากาศ (Air Freight)',
            shippingCost: 35000,
            dutyTaxes: 12000,
            customsBroker: 'V-Cargo Logistics (Thailand)',
            etd: savedPO.poDate || new Date().toISOString().split('T')[0],
            eta: savedPO.expectedDelivery || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            status: 'รอจ่ายเงิน',
            notes: `ออก PO ส่งให้ Vendor ${savedPO.vendorName} เรียบร้อยแล้ว`
          };
          return [newShipment, ...prevShipments];
        }
        return prevShipments;
      });
    }

    setIsPOModalOpen(false);
    setEditingPO(null);
  };

  // Delete Purchase Order
  const handleDeletePO = (poId) => {
    if (window.confirm('คุณต้องการลบใบสั่งซื้อ PO นี้ออกจากระบบใช่หรือไม่?')) {
      setPurchaseOrders(prev => prev.filter(po => po.id !== poId));
    }
  };

  // Save Repair Ticket (Bi-directional Link with Demo Catalog)
  const handleSaveRepairTicket = (ticketData) => {
    if (ticketData.id) {
      setRepairTickets(prev => prev.map(t => t.id === ticketData.id ? ticketData : t));
    } else {
      const newTicket = {
        ...ticketData,
        id: 'rep-' + Date.now()
      };
      setRepairTickets(prev => [newTicket, ...prev]);
    }

    // Auto Link back to Central Demo Catalog if category is "สินค้า Demo"
    if (ticketData.category === 'สินค้า Demo' && ticketData.sn) {
      const isFixed = ticketData.status === 'ซ่อมเสร็จแล้ว' || ticketData.status === 'ส่งคืนลูกค้า';
      const newUnitStatus = isFixed ? 'พร้อมใช้งาน' : 'ส่งซ่อม';

      setProducts(prevProducts => prevProducts.map(p => {
        const hasMatchingUnit = (p.demoUnits || []).some(u => u.sn === ticketData.sn);
        if (hasMatchingUnit) {
          const updatedUnits = p.demoUnits.map(u => {
            if (u.sn === ticketData.sn) {
              return {
                ...u,
                status: newUnitStatus,
                location: isFixed ? (ticketData.location || 'สำนักงาน AERON') : (ticketData.repairVendor || 'ศูนย์ซ่อม AERON')
              };
            }
            return u;
          });
          return { ...p, demoUnits: updatedUnits };
        }
        return p;
      }));
    }

    setIsRepairModalOpen(false);
    setEditingRepairTicket(null);
  };

  // Delete Repair Ticket
  const handleDeleteRepairTicket = (ticketId) => {
    if (window.confirm('คุณต้องการลบรายการส่งซ่อมนี้ใช่หรือไม่?')) {
      setRepairTickets(prev => prev.filter(t => t.id !== ticketId));
    }
  };

  // Open Repair Modal from Demo Catalog
  const handleOpenRepairFromCatalog = (product, unit) => {
    setEditingRepairTicket({
      category: 'สินค้า Demo',
      productName: product.name,
      productCategory: product.category,
      sn: unit ? unit.sn : '',
      repairedItems: unit ? (unit.accessories || 'ตัวเครื่องหลัก และ อุปกรณ์ประกอบ') : 'ตัวเครื่องหลัก',
      lastHospital: unit ? (unit.location || 'สำนักงาน AERON (กรุงเทพฯ)') : 'สำนักงาน AERON',
      location: 'ศูนย์ซ่อม AERON Service Center (กรุงเทพฯ)',
      status: 'ส่งซ่อมอยู่',
      repairVendor: 'AERON Service Center (กรุงเทพฯ)',
      sentDate: new Date().toISOString().split('T')[0]
    });
    setActiveView('repair_service');
    setIsRepairModalOpen(true);
  };

  useEffect(() => {
    localStorage.setItem('aeron_leave_requests', JSON.stringify(leaveRequests));
    syncToDB('leave_requests', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('aeron_attendance_logs', JSON.stringify(attendanceLogs));
    syncToDB('attendance_logs', attendanceLogs);
  }, [attendanceLogs]);
  useEffect(() => {
    localStorage.setItem('aeron_accounting_txns', JSON.stringify(transactions));
    syncToDB('accounting', transactions);
  }, [transactions]);
  // MOD-09 Accounting Handlers
  const handleSaveTransaction = (txnData) => {
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === txnData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...txnData };
        return copy;
      } else {
        return [{ ...txnData }, ...prev];
      }
    });
  };

  const handleDeleteTransaction = (txnId) => {
    if (window.confirm('ยืนยันลบรายการบัญชีนี้?')) {
      setTransactions(prev => prev.filter(t => t.id !== txnId));
    }
  };
  // Leave & Attendance Handlers
  const handleApproveLeave = (leaveId, newStatus = '✅ อนุมัติแล้ว') => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: newStatus, approvedBy: currentUser?.name || 'หัวหน้างาน' } : l));
  };

  const handleDeleteLeave = (leaveId) => {
    if (window.confirm('ยืนยันลบคำขอลานี้?')) {
      setLeaveRequests(prev => prev.filter(l => l.id !== leaveId));
    }
  };

  const handleSaveLeave = (leaveData) => {
    if (leaveData.id) {
      setLeaveRequests(prev => prev.map(l => l.id === leaveData.id ? leaveData : l));
    } else {
      setLeaveRequests(prev => [{ ...leaveData, id: 'leave-' + Date.now(), status: '⏳ รออนุมัติ' }, ...prev]);
    }
    setIsLeaveModalOpen(false);
  };

  const handleDeleteAttendance = (attId) => {
    if (window.confirm('ยืนยันลบรายการนี้?')) {
      setAttendanceLogs(prev => prev.filter(a => a.id !== attId));
    }
  };

  const handleSaveAttendance = (attData) => {
    if (attData.id) {
      setAttendanceLogs(prev => prev.map(a => a.id === attData.id ? attData : a));
    } else {
      setAttendanceLogs(prev => [{ ...attData, id: 'att-' + Date.now() }, ...prev]);
    }
    setIsAttendanceModalOpen(false);
  };

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

  // Save Delivered / Sold Asset
  const handleSaveSoldAsset = (assetData) => {
    if (assetData.id) {
      setSoldProducts(prev => prev.map(a => a.id === assetData.id ? assetData : a));
    } else {
      const newAsset = {
        ...assetData,
        id: 'sold-' + Date.now()
      };
      setSoldProducts(prev => [newAsset, ...prev]);
    }
    setIsSoldModalOpen(false);
    setEditingSoldAsset(null);
  };

  // Delete Delivered / Sold Asset
  const handleDeleteSoldAsset = (assetId) => {
    if (window.confirm('คุณต้องการลบรายการสินค้าที่ขายแล้วนี้ใช่หรือไม่?')) {
      setSoldProducts(prev => prev.filter(a => a.id !== assetId));
    }
  };

  // Save Shipment Tracking Record
  const handleSaveShipment = (shipmentData) => {
    if (shipmentData.id) {
      setShipments(prev => prev.map(s => s.id === shipmentData.id ? shipmentData : s));
    } else {
      const newShipment = {
        ...shipmentData,
        id: 'shp-' + Date.now()
      };
      setShipments(prev => [newShipment, ...prev]);
    }
    setIsShipmentModalOpen(false);
    setEditingShipment(null);
  };

  // Delete Shipment Record
  const handleDeleteShipment = (shipmentId) => {
    if (window.confirm('คุณต้องการลบรายการนำเข้าลูกค้านี้ใช่หรือไม่?')) {
      setShipments(prev => prev.filter(s => s.id !== shipmentId));
    }
  };

  // Save FDA Registration Record
  const handleSaveFDA = (fdaData) => {
    if (fdaData.id) {
      setFdaRegistrations(prev => prev.map(f => f.id === fdaData.id ? fdaData : f));
    } else {
      const newFDA = {
        ...fdaData,
        id: 'fda-' + Date.now()
      };
      setFdaRegistrations(prev => [newFDA, ...prev]);
    }
    setIsFDAModalOpen(false);
    setEditingFDA(null);
  };

  // Delete FDA Registration Record
  const handleDeleteFDA = (fdaId) => {
    if (window.confirm('คุณต้องการลบรายการยื่นขอ อย. นี้ใช่หรือไม่?')) {
      setFdaRegistrations(prev => prev.filter(f => f.id !== fdaId));
    }
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
                  onDeleteProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
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
              initialFrozenMonths={window.INITIAL_ACCOUNTING_FROZEN_MONTHS}
              initialRecurringTemplates={window.INITIAL_ACCOUNTING_RECURRING}
              currentUser={currentUser}
              accountingSubTab={accountingSubTab}
              onSubTabChange={setAccountingSubTab}
              onSaveTxn={handleSaveTransaction}
              onDeleteTxn={handleDeleteTransaction}
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

      {/* Demo Booking Modal */}
      {isDemoModalOpen && (
        <DemoBookingModal
          prefill={demoPrefill}
          projects={projects}
          products={products}
          members={members}
          existingBookings={demoBookings}
          onSave={handleSaveDemoBooking}
          onClose={() => { setIsDemoModalOpen(false); setDemoPrefill(null); }}
        />
      )}

      {/* Product Master Modal */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        />
      )}

      {/* Purchase Order Modal */}
      {isPOModalOpen && (
        <PurchaseOrderModal
          po={editingPO}
          projects={projects}
          products={products}
          onSave={handleSavePO}
          onClose={() => { setIsPOModalOpen(false); setEditingPO(null); }}
        />
      )}

      {/* Repair Ticket Modal */}
      {isRepairModalOpen && (
        <RepairTicketModal
          ticket={editingRepairTicket}
          products={products}
          members={members}
          onSave={handleSaveRepairTicket}
          onClose={() => { setIsRepairModalOpen(false); setEditingRepairTicket(null); }}
        />
      )}

      {/* Delivered / Sold Product Modal */}
      {isSoldModalOpen && (
        <SoldProductModal
          asset={editingSoldAsset}
          projects={projects}
          members={members}
          onSave={handleSaveSoldAsset}
          onClose={() => { setIsSoldModalOpen(false); setEditingSoldAsset(null); }}
        />
      )}

      {/* Import Logistics / Shipment Modal */}
      {isShipmentModalOpen && (
        <ShipmentModal
          shipment={editingShipment}
          purchaseOrders={purchaseOrders}
          products={products}
          onSave={handleSaveShipment}
          onClose={() => { setIsShipmentModalOpen(false); setEditingShipment(null); }}
        />
      )}

      {/* Thai FDA Registration Modal */}
      {isFDAModalOpen && (
        <FDAModal
          fda={editingFDA}
          products={products}
          members={members}
          onSave={handleSaveFDA}
          onClose={() => { setIsFDAModalOpen(false); setEditingFDA(null); }}
        />
      )}

      {/* Project History & Activity Timeline Modal */}
      {isHistoryModalOpen && historyTargetProject && (
        <ProjectHistoryModal
          project={historyTargetProject}
          members={members}
          stages={window.STAGES}
          products={products}
          onAddLog={handleAddWeeklyLog}
          onClose={() => { setIsHistoryModalOpen(false); setHistoryTargetProject(null); }}
        />
      )}

      {/* Cost & Minimum Selling Price Financial Sheet Modal */}
      {isCostModalOpen && (
        <CostSheetModal 
          calc={editingCostCalc}
          projects={projects}
          onSave={handleSaveCostCalc}
          onClose={() => { setIsCostModalOpen(false); setEditingCostCalc(null); }}
        />
      )}

      {/* Demo Checklist Modal */}
      {isChecklistModalOpen && checklistTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>📋 รายการตรวจสอบคิวเครื่อง Demo (Checklist)</span>
              </h3>
              <button 
                onClick={() => { setIsChecklistModalOpen(false); setChecklistTargetBooking(null); }}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-400">🏥 โรงพยาบาล: {checklistTargetBooking.hospitalName || checklistTargetBooking.hospital}</div>
                <div className="text-slate-400">📦 สินค้า: {checklistTargetBooking.productName}</div>
                <div className="text-amber-300 font-mono">📅 {checklistTargetBooking.startDate || 'N/A'} ถึง {checklistTargetBooking.endDate || 'N/A'}</div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950/40 rounded-lg hover:bg-slate-950/80">
                  <input type="checkbox" defaultChecked className="accent-emerald-500 rounded" />
                  <span>ตรวจสอบสภาพเครื่องก่อนส่งมอบ (Hardware Inspection)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950/40 rounded-lg hover:bg-slate-950/80">
                  <input type="checkbox" defaultChecked className="accent-emerald-500 rounded" />
                  <span>อุปกรณ์เสริมครบถ้วน (Accessories Checklist)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950/40 rounded-lg hover:bg-slate-950/80">
                  <input type="checkbox" className="accent-emerald-500 rounded" />
                  <span>ใบรับ-ส่งเครื่อง และเอกสารยินยอมทดลองใช้งาน</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => { setIsChecklistModalOpen(false); setChecklistTargetBooking(null); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                บันทึกเรียบร้อย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification when Sales Wins a Project */}
      {toastNotification && toastNotification.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 border-2 border-amber-500/80 p-4 rounded-2xl shadow-2xl shadow-amber-500/30 text-white backdrop-blur-md animate-modal space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🔔</span>
              <h4 className="font-bold text-amber-300 text-sm leading-snug">{toastNotification.title}</h4>
            </div>
            <button onClick={() => setToastNotification(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <p className="text-xs text-slate-300">{toastNotification.message}</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => { setActiveView('purchase_orders'); setToastNotification(null); }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/30"
            >
              🛒 ไปยังหน้าสั่งซื้อ Vendor (PO)
            </button>
            <button
              onClick={() => setToastNotification(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
      </div>
      
      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <LeaveModal
          members={members}
          currentUser={currentUser}
          onSave={handleSaveLeave}
          onClose={() => setIsLeaveModalOpen(false)}
        />
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <AttendanceModal
          members={members}
          onSave={handleSaveAttendance}
          onClose={() => setIsAttendanceModalOpen(false)}
        />
      )}

      {/* User Account Management Modal (Root Level - Top Z-Index 1000) */}
      {isUserAccountModalOpen && (
        <UserAccountManagementModal
          isOpen={isUserAccountModalOpen}
          onClose={() => setIsUserAccountModalOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* 🔔 Smart Notification Action Center Modal */}
      {isNotificationModalOpen && (
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          currentUser={currentUser}
          alerts={systemAlerts}
        />
      )}

      {/* 📊 Universal Report Viewer Modal */}
      {isUniversalReportModalOpen && (
        <UniversalReportModal
          isOpen={isUniversalReportModalOpen}
          onClose={() => setIsUniversalReportModalOpen(false)}
          reportId={activeReportId}
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
        />
      )}

      {/* Login & Role Switcher Modal */}
      {(isLoginModalOpen || !currentUser) && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsLoginModalOpen(false)}
          isSwitching={!!currentUser}
        />
      )}
    </div>
  );
}

// Mount App to DOM
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
