// ====================================================
// AERON MEDICAL Project Tracker - Modular Assembly
// Generated dynamically by build.js
// ====================================================

// --- Module File: js/modules/mod00_core/00_Globals.js ---
// ====================================================
// MODULE: mod00_core/00_Globals.js
// React Hooks & Global Utility Helpers
// ====================================================

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Helper: Format Thai currency
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '0 บาท';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
};

// Helper: Format short number (e.g. 4.5ล้าน)
function formatShortCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ฿';
  if (Math.abs(amount) >= 1000000) {
    return ((Number(amount) || 0) / 1000000).toFixed(1) + ' ล้านบาท';
  }
  if (Math.abs(amount) >= 100000) {
    return ((Number(amount) || 0) / 1000).toFixed(0) + ' พันบาท';
  }
  return Number(amount).toLocaleString('th-TH') + ' ฿';
};

// Helper: API Sync to backend endpoint /api/save-db (with Supabase Cloud Sync)
async function syncToDB(tableName, data) {
  try {
    await fetch(`/api/save-db?table=${tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2)
    });
  } catch (err) {
    console.warn('API Sync notice:', err.message);
  }
}

// Helper: Load latest data from Cloud DB / Local API
async function loadFromDB(tableName, defaultVal) {
  try {
    const res = await fetch(`/api/load-db?table=${tableName}`);
    if (res.ok) {
      const data = await res.json();
      if (data) return data;
    }
  } catch (err) {
    console.warn(`[Load DB] Notice for ${tableName}:`, err.message);
  }
  return defaultVal;
}


// --- Company Bank & Petty Cash Accounts System ---
const FIXED_COMPANY_BANK_ACCOUNTS = [
  'Aeron Kbank ออมทรัพย์',
  'Aeron Kbank กระแสรายวัน',
  'Aeron Kbank ฝากประจำ',
  'Aeron SCB ออมทรัพย์',
  'Aeron SCB กระแสรายวัน'
];

function getCompanyAccounts() {
  let pettyCashList = [];
  try {
    const saved = localStorage.getItem('aeron_petty_cash_accounts');
    if (saved) {
      pettyCashList = JSON.parse(saved);
    } else {
      pettyCashList = [
        { id: 'pc-1', empName: 'คุณตู้', limit: 20000, name: 'เงินสดสำรองจ่าย - คุณตู้ (Petty Cash)' },
        { id: 'pc-2', empName: 'คุณแบงค์', limit: 15000, name: 'เงินสดสำรองจ่าย - คุณแบงค์ (Petty Cash)' }
      ];
      localStorage.setItem('aeron_petty_cash_accounts', JSON.stringify(pettyCashList));
    }
  } catch (e) {
    pettyCashList = [
      { id: 'pc-1', empName: 'คุณตู้', limit: 20000, name: 'เงินสดสำรองจ่าย - คุณตู้ (Petty Cash)' }
    ];
  }

  const pettyNames = pettyCashList.map(pc => pc.name || `เงินสดสำรองจ่าย - ${pc.empName}`);
  return [...FIXED_COMPANY_BANK_ACCOUNTS, ...pettyNames];
}

window.FIXED_COMPANY_BANK_ACCOUNTS = FIXED_COMPANY_BANK_ACCOUNTS;
window.getCompanyAccounts = getCompanyAccounts;

// --- Global Master Domain Constants ---
window.SHIPMENT_STATUSES = [
  'รอจ่ายเงิน',
  'จ่ายเงินแล้ว รอผลิต',
  'ผลิตเสร็จแล้ว รอส่ง',
  'ระหว่างขนส่ง',
  'ถึงประเทศไทย รอออกของ',
  'ของถึง ออฟฟิศ',
  'ส่งลูกค้าแล้ว'
];

window.TRANSPORT_TYPES = [
  'ทางเรือ (Sea Freight)',
  'ทางเครื่องบิน (Air Freight)',
  'ทางรถ (Truck / Land)',
  'ขนส่งด่วน (Courier / Express)'
];

window.REPAIR_CATEGORIES = [
  'สินค้า Demo',
  'สินค้าส่งซ่อมจาก รพ',
  'สินค้าอยู่ในประกันของ บริษัท',
  'สินค้า นอกประกันของบริษัท'
];

window.REPAIR_STATUSES = [
  'รอส่งซ่อม',
  'ส่งซ่อมอยู่',
  'ระหว่างขนส่ง',
  'ซ่อมเสร็จแล้ว',
  'ส่งคืนลูกค้า'
];

window.FDA_CLASSES = [
  { code: 'Class 1', label: 'Class 1 (ความเสี่ยงต่ำ)' },
  { code: 'Class 2', label: 'Class 2 (ความเสี่ยงปานกลาง)' },
  { code: 'Class 3', label: 'Class 3 (ความเสี่ยงสูง)' },
  { code: 'Class 4', label: 'Class 4 (ความเสี่ยงสูงสุด)' }
];

window.FDA_STATUSES = [
  'กำลังเตรียมเอกสาร',
  'ยื่นคำขอแล้ว รอ อย. ตรวจ',
  'ขอเอกสารเพิ่มเติม',
  'อนุมัติแล้ว ได้รับใบอนุญาต',
  'ต่ออายุใบอนุญาต'
];

window.PO_STATUSES = [
  'ฉบับร่าง (Draft)',
  'รออนุมัติ (Pending Approval)',
  'อนุมัติแล้ว (Approved)',
  'ส่งสั่งซื้อแล้ว (Ordered)',
  'ของถึงคลังแล้ว (Received)',
  'ยกเลิก (Cancelled)'
];

window.VENDOR_LIST = [
  'Aeron International Ltd.',
  'Mindray Medical',
  'GE Healthcare Partner',
  'Olympus Medical Thailand',
  'Philips Healthcare Supplier',
  'Stryker Global Vendor',
  'Karl Storz Supplier',
  'Local Medical Distributor'
];

// --- Shared Business Calculation Helpers ---

function calculateWorkingDays(startDateStr, endDateStr) {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  let count = 0;
  let cur = new Date(start.getTime());
  cur.setHours(0,0,0,0);
  const finish = new Date(end.getTime());
  finish.setHours(0,0,0,0);

  while (cur <= finish) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function computeCostSheet(calc) {
  const saleInVat = Number(calc.sellingPriceInVat) || 0;
  const saleExVat = saleInVat / 1.07;
  const costInVat = Number(calc.costInVat) || 0;
  const costExVat = costInVat / 1.07;
  const costExVatPercent = saleExVat > 0 ? (costExVat / saleExVat) * 100 : 0;

  // DF Fee
  let dfAmount = 0;
  let dfPercent = 0;
  if (calc.dfType === 'percent') {
    dfPercent = Number(calc.dfValue) || 0;
    dfAmount = saleExVat * (dfPercent / 100);
  } else {
    dfAmount = Number(calc.dfValue) || 0;
    dfPercent = saleExVat > 0 ? (dfAmount / saleExVat) * 100 : 0;
  }

  // Sales Comm (Default 2% of Sale Ex VAT)
  const salesCommPercent = calc.salesCommPercent !== undefined && calc.salesCommPercent !== '' ? Number(calc.salesCommPercent) : 2;
  const salesCommAmount = saleExVat * (salesCommPercent / 100);

  // Interest (Default 7% of Cost In VAT)
  const interestPercent = calc.interestPercent !== undefined && calc.interestPercent !== '' ? Number(calc.interestPercent) : 7;
  const interestAmount = costInVat * (interestPercent / 100);

  // Tax (Default 20% of Margin Ex VAT)
  const taxPercent = calc.taxPercent !== undefined && calc.taxPercent !== '' ? Number(calc.taxPercent) : 20;
  const marginExVat = Math.max(0, saleExVat - costExVat);
  const taxAmount = marginExVat * (taxPercent / 100);

  // Retention (Default 5% of Sale Ex VAT)
  const retentionPercent = calc.retentionPercent !== undefined && calc.retentionPercent !== '' ? Number(calc.retentionPercent) : 5;
  const retentionAmount = saleExVat * (retentionPercent / 100);

  // Net Profit before Tax
  const netProfitAmount = saleExVat - costExVat - dfAmount - salesCommAmount - interestAmount - taxAmount - retentionAmount;
  const netProfitPercent = saleExVat > 0 ? (netProfitAmount / saleExVat) * 100 : 0;

  // Status Rules
  let statusKey = 'approved';
  let statusText = '🎉 อนุมัติให้ทำได้';
  let statusColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let statusBadgeBg = 'bg-emerald-600';

  if (netProfitPercent < 10) {
    statusKey = 'danger';
    statusText = '🛑 ให้คุยกะคุณตู้';
    statusColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    statusBadgeBg = 'bg-rose-600';
  } else if (netProfitPercent <= 15) {
    statusKey = 'warning';
    statusText = '⚠️ ให้รีวิวอีกที';
    statusColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    statusBadgeBg = 'bg-amber-600';
  }

  return {
    saleInVat,
    saleExVat,
    costInVat,
    costExVat,
    costExVatPercent,
    dfAmount,
    dfPercent,
    salesCommPercent,
    salesCommAmount,
    interestPercent,
    interestAmount,
    taxPercent,
    taxAmount,
    retentionPercent,
    retentionAmount,
    netProfitAmount,
    netProfitPercent,
    statusKey,
    statusText,
    statusColor,
    statusBadgeBg
  };
}

// ====================================================
// RBAC (Role-Based Access Control) Configurations
// ====================================================

const ROLES_PERMISSIONS = {
  OWNER: {
    roleId: 'OWNER',
    roleName: '👑 OWNER (ผู้บริหารสูงสุด)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    allowedTabs: ['dashboard', 'clients', 'project', 'logistic', 'calendar', 'report', 'finance', 'hr', 'accounting'],
    canApproveHR: true,
    canViewAuditLogs: true,
    canViewAllFinancials: true,
    dataScope: 'all'
  },
  HEAD_ADMIN: {
    roleId: 'HEAD_ADMIN',
    roleName: '👩‍💼 HEAD_ADMIN (หัวหน้าฝ่ายบริหาร)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    allowedTabs: ['dashboard', 'clients', 'project', 'logistic', 'calendar', 'report', 'finance', 'hr', 'accounting'],
    canApproveHR: true,
    canViewAuditLogs: true,
    canViewAllFinancials: true,
    dataScope: 'all'
  },
  ADMIN: {
    roleId: 'ADMIN',
    roleName: '🏢 ADMIN (เจ้าหน้าที่ธุรการ/จัดซื้อ)',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    allowedTabs: ['clients', 'project', 'logistic', 'calendar', 'report', 'finance', 'hr', 'accounting'],
    canApproveHR: false,
    canViewAuditLogs: false,
    canViewAllFinancials: false,
    dataScope: 'all'
  },
  SALES_HEAD: {
    roleId: 'SALES_HEAD',
    roleName: '👨‍💼 SALES_HEAD (หัวหน้าทีมขาย)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    allowedTabs: ['dashboard', 'clients', 'project', 'logistic', 'calendar', 'report', 'hr'],
    canApproveHR: true,
    canViewAuditLogs: false,
    canViewAllFinancials: false,
    dataScope: 'subordinates'
  },
  SALES: {
    roleId: 'SALES',
    roleName: '👨‍⚕️ SALES (เจ้าหน้าที่ฝ่ายขาย)',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    allowedTabs: ['clients', 'project', 'logistic', 'calendar', 'report', 'hr'],
    canApproveHR: false,
    canViewAuditLogs: false,
    canViewAllFinancials: false,
    dataScope: 'own'
  },
  MESSENGER: {
    roleId: 'MESSENGER',
    roleName: '🛵 MESSENGER (เจ้าหน้าที่ส่งเอกสาร/ขนส่ง)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    allowedTabs: ['messenger'],
    canApproveHR: false,
    canViewAuditLogs: false,
    canViewAllFinancials: false,
    dataScope: 'assigned_jobs'
  }
};

// Pre-configured Demo User Accounts for 1-Click Testing & Authentication
const DEMO_USERS = [
  {
    id: 'usr_owner',
    username: 'owner',
    name: 'คุณตู้ (CEO / Owner)',
    role: 'OWNER',
    avatar: '👑',
    memberId: 'm1'
  },
  {
    id: 'usr_head_admin',
    username: 'head_admin',
    name: 'เกศรา (Head Admin)',
    role: 'HEAD_ADMIN',
    avatar: '👩‍💼',
    memberId: 'm2'
  },
  {
    id: 'usr_admin',
    username: 'admin',
    name: 'วิชัย (Admin Officer)',
    role: 'ADMIN',
    avatar: '🏢',
    memberId: 'm3'
  },
  {
    id: 'usr_sales_head',
    username: 'sales_head',
    name: 'อนันต์ ผู้โชคดี (Sales Head)',
    role: 'SALES_HEAD',
    avatar: '👨‍💼',
    memberId: 'm3',
    subordinates: ['m1', 'm2', 'm3', 'm4']
  },
  {
    id: 'usr_sales_somchai',
    username: 'sales_somchai',
    name: 'สมชาย สายลุย (Sales Specialist)',
    role: 'SALES',
    avatar: '👨‍⚕️',
    memberId: 'm1'
  },
  {
    id: 'usr_messenger',
    username: 'messenger',
    name: 'สมปอง (Messenger Dispatch)',
    role: 'MESSENGER',
    avatar: '🛵',
    memberId: 'm4'
  }
];

function checkTabAccess(roleOrUser, tabId) {
  if (!roleOrUser) return false;
  
  if (typeof roleOrUser === 'object') {
    if (Array.isArray(roleOrUser.allowedTabs)) {
      return roleOrUser.allowedTabs.includes(tabId);
    }
    roleOrUser = roleOrUser.role;
  }

  if (!roleOrUser) return false;
  const upperRole = String(roleOrUser).toUpperCase();
  const config = ROLES_PERMISSIONS[upperRole];
  if (!config) return false;
  return config.allowedTabs.includes(tabId);
}

function getScopedProjects(user, projects = []) {
  if (!user || !user.role) return projects;
  const roleConfig = ROLES_PERMISSIONS[user.role];
  if (!roleConfig || roleConfig.dataScope === 'all') return projects;

  if (roleConfig.dataScope === 'own') {
    return projects.filter(p => p.assignee === user.name || p.memberId === user.memberId);
  }

  if (roleConfig.dataScope === 'subordinates' && user.subordinates) {
    return projects.filter(p => user.subordinates.includes(p.memberId) || p.assignee.includes(user.name.split(' ')[0]));
  }

  return projects;
}

function getUserAccounts() {
  try {
    const saved = localStorage.getItem('aeron_user_accounts');
    if (saved) {
      if (saved.includes('à¸') || saved.includes('à¹') || saved.includes('ðŸ')) {
        console.warn('Sanitizing corrupted user accounts cache in localStorage...');
        localStorage.setItem('aeron_user_accounts', JSON.stringify(DEMO_USERS));
        return DEMO_USERS;
      }
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading user accounts:', e);
  }
  localStorage.setItem('aeron_user_accounts', JSON.stringify(DEMO_USERS));
  return DEMO_USERS;
}

function saveUserAccounts(accounts = []) {
  try {
    localStorage.setItem('aeron_user_accounts', JSON.stringify(accounts));
    if (typeof syncToDB === 'function') {
      syncToDB('users', accounts);
    }
  } catch (e) {
    console.error('Error saving user accounts:', e);
  }
}

function canEditProject(user, project) {
  if (!user || !project) return false;
  const role = String(user.role).toUpperCase();

  // OWNER is the ONLY role that can edit projects of other people!
  if (role === 'OWNER') return true;

  // Other roles (HEAD_ADMIN, ADMIN, SALES_HEAD, SALES) can only edit projects assigned to or created by themselves!
  const userName = (user.name || '').trim().toLowerCase();
  const assignee = (project.assignee || '').trim().toLowerCase();
  const memberId = user.memberId;
  const createdBy = (project.created_by || '').trim().toLowerCase();
  const username = (user.username || '').trim().toLowerCase();

  if (assignee && userName && (assignee.includes(userName.split(' ')[0]) || userName.includes(assignee.split(' ')[0]))) return true;
  if (memberId && project.memberId === memberId) return true;
  if (createdBy && (createdBy === username || createdBy === user.id)) return true;

  return false;
}

function canViewMemberKanban(user, targetMember) {
  if (!user) return false;
  const role = String(user.role).toUpperCase();

  // OWNER, HEAD_ADMIN, ADMIN can view everyone's Kanban!
  if (['OWNER', 'HEAD_ADMIN', 'ADMIN'].includes(role)) return true;

  const targetId = typeof targetMember === 'object' ? targetMember.id : targetMember;
  const targetName = typeof targetMember === 'object' ? targetMember.name : targetMember;

  // SALES can ONLY view their own Kanban!
  if (role === 'SALES') {
    if (targetName && user.name && (targetName.includes(user.name.split(' ')[0]) || user.name.includes(targetName.split(' ')[0]))) return true;
    if (targetId && user.memberId && targetId === user.memberId) return true;
    return false;
  }

  // SALES_HEAD can view assigned subordinates + self!
  if (role === 'SALES_HEAD') {
    if (targetName && user.name && (targetName.includes(user.name.split(' ')[0]) || user.name.includes(targetName.split(' ')[0]))) return true;
    if (targetId && user.memberId && targetId === user.memberId) return true;
    if (Array.isArray(user.subordinates) && (user.subordinates.includes(targetId) || user.subordinates.includes(targetName))) return true;
    return false;
  }

  return false;
}

function getYTDDateRange() {
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const today = new Date().toISOString().split('T')[0];
  return { startDate, endDate: today };
}

window.ROLES_PERMISSIONS = ROLES_PERMISSIONS;
window.DEMO_USERS = DEMO_USERS;
window.getUserAccounts = getUserAccounts;
window.saveUserAccounts = saveUserAccounts;
window.checkTabAccess = checkTabAccess;
window.getScopedProjects = getScopedProjects;
window.canEditProject = canEditProject;
window.canViewMemberKanban = canViewMemberKanban;
window.getYTDDateRange = getYTDDateRange;


// --- Module File: js/modules/mod00_core/Header.js ---
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
  reportSubView = 'hub', 
  setReportSubView = () => {}, 
  financeSubView = 'cost_calculation', 
  setFinanceSubView = () => {}, 
  hrSubView = 'leave_attendance', 
  setHRSubView = () => {}, 
  accountingSubTab = 'daily_entries',
  setAccountingSubTab = () => {}, 
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
  onOpenKanbanModal = () => {},
  onOpenUserAccountModal = () => {},
  alerts = [],
  onOpenNotificationModal = () => {}
}) {
  const [isMobileActionSheetOpen, setIsMobileActionSheetOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollYRef = useRef(0);
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
    else if (newView === 'reports_hub' || newView === 'fda_registration') targetTab = 'report';
    else if (newView === 'daily_transactions' || newView === 'accounting' || newView === 'financial_statements') targetTab = 'accounting';
    else if (members.some(m => m.id === newView)) targetTab = 'project';

    if (currentUser && !checkTabAccess(currentUser.role, targetTab)) {
      console.warn('RBAC Blocked view change:', newView, 'for role:', currentUser.role);
      return;
    }

    setActiveView(newView);

    if (newView === 'manager' || newView === 'dashboard_classic' || newView === 'dashboard_manager' || newView === 'dashboard_ceo' || newView === 'dashboard_cfo') {
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
    } else if (newView === 'reports_hub') {
      setActiveSidebarTab('report');
      setReportSubView('hub');
    } else if (newView === 'fda_registration') {
      setActiveSidebarTab('report');
      setReportSubView('fda_registration');
    } else if (newView === 'daily_transactions') {
      setActiveSidebarTab('accounting');
      setAccountingSubTab('daily_entries');
    } else if (newView === 'financial_statements') {
      setActiveSidebarTab('accounting');
      setAccountingSubTab('financial_statements');
    } else if (newView === 'accounting') {
      setActiveSidebarTab('accounting');
    } else if (members.some(m => m.id === newView)) {
      setActiveSidebarTab('project');
      if (onOpenKanbanModal) onOpenKanbanModal(newView);
    }
  };

  return (
    <header className="relative glass-panel border-b border-slate-800">
      <div className="px-3 py-2 sm:px-6 sm:py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Title & Company Logo (Compact & Sleek for Mobile, Foldables & Tablets) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="bg-white p-1 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-500/20 border-2 border-slate-700/80 flex items-center justify-center h-10 w-10 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden">
                <img 
                  src="./assets/logo.jpg" 
                  alt="AERON MEDICAL Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-sm sm:text-lg font-black tracking-wider leading-tight font-sans flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-[#a3e635] via-[#65a30d] to-[#16a34a] bg-clip-text text-transparent font-extrabold drop-shadow">
                    AERON
                  </span>
                  <span className="text-white font-bold">
                    MEDICAL
                  </span>
                </h1>
                <div className="text-[11px] sm:text-xs font-semibold text-indigo-200/90 tracking-wide">
                  Project Tracker
                </div>
                <p className="text-[10px] text-slate-400 font-normal hidden sm:block">ระบบติดตามงานขายและโครงการราชการ / โรงพยาบาล</p>
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
                  <>
                    <option value="dashboard_classic">📊 ภาพรวมองค์กรดั้งเดิม (Classic All-in-One Overview)</option>
                    <option value="dashboard_ceo">👑 แดชบอร์ด CEO (ภาพรวมยุทธศาสตร์ & ยอดขาย)</option>
                    <option value="dashboard_cfo">💰 แดชบอร์ด CFO (สภาพคล่อง, ทุนสั่งของ & Margin)</option>
                    <option value="dashboard_manager">🎯 แดชบอร์ด Manager (ปฏิบัติการ, คิวเดโม่ & ชิปปิ้ง)</option>
                  </>
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
                  <>
                    <option value="reports_hub">
                      📊 ศูนย์รวมรายงานทุกระบบ (Unified Reports Hub)
                    </option>
                    <option value="fda_registration">
                      🛡️ การจดทะเบียน อย. (Thai FDA Registration) {activeFDACount > 0 ? `(📋 ${activeFDACount} คำขอ)` : ''}
                    </option>
                  </>
                )}
                {(!currentUser || checkTabAccess(currentUser.role, 'accounting')) && (
                  <>
                    <option value="daily_transactions">
                      🧾 ลงบันทึกรายรับ-รายจ่ายรายวัน (Daily Transactions Entry)
                    </option>
                    <option value="financial_statements">
                      📈 งบการเงิน P&L, Cash Flow & งบดุล (Financial Statements)
                    </option>
                  </>
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
                  onClick={() => { if (onOpenUserAccountModal) onOpenUserAccountModal(); }}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 p-2 px-2.5 rounded-xl border border-amber-500/40 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  title="ระบบสร้าง & จัดการบัญชีผู้ใช้งาน (OWNER & HEAD ADMIN)"
                >
                  <span>🔐 จัดการบัญชี</span>
                </button>
              )}

              {/* 🔔 Smart Notification Action Center Button */}
              <button
                onClick={onOpenNotificationModal}
                className="relative bg-slate-900 hover:bg-slate-800 text-slate-200 p-2 px-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 group active:scale-95"
                title="ศูนย์แจ้งเตือนงานคงค้าง (Smart Action Center)"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">🔔</span>
                <span className="hidden xl:inline text-[11px] font-semibold text-slate-300">แจ้งเตือน</span>
                {alerts && alerts.length > 0 && (
                  <span className="flex h-5 min-w-[20px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-extrabold items-center justify-center shadow-md shadow-rose-600/50 animate-pulse">
                    {alerts.length > 99 ? '99+' : alerts.length}
                  </span>
                )}
              </button>

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

              {/* User Profile & Role Badge Switcher + Direct Logout Button */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {currentUser ? (
                  <div className="flex items-center gap-1.5">
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
                      <span className="text-[10px] text-slate-400 group-hover:text-white">🔒 สลับ</span>
                    </button>

                    {/* 🚪 Dedicated Desktop Logout Button */}
                    <button
                      onClick={onLogout}
                      className="p-2 px-2.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
                      title="ออกจากระบบ (Logout) และกลับสู่หน้า Login"
                    >
                      <span>🚪</span>
                      <span className="hidden xl:inline">ออกจากระบบ</span>
                    </button>
                  </div>
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
                <span>เพิ่มงาน</span>
              </button>

              {/* Mobile Cloud Status Pill */}
              <button
                onClick={triggerCloudSync}
                disabled={cloudStatus.isSyncing}
                className={`p-2 px-2 rounded-xl border text-xs font-semibold flex items-center gap-1 active:scale-95 ${
                  cloudStatus.isOnline ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                }`}
                title="คลิกเพื่อซิงค์ข้อมูลกับ Cloud"
              >
                <span>{cloudStatus.isSyncing ? '🔄' : cloudStatus.isOnline ? '☁️' : '📴'}</span>
              </button>

              {/* Mobile Action Sheet Trigger */}
              <button
                onClick={() => setIsMobileActionSheetOpen(true)}
                className="p-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 touch-manipulation"
              >
                <span>⚡ เมนู</span>
              </button>

              {/* Mobile Direct Logout Button */}
              {currentUser && (
                <button
                  onClick={onLogout}
                  className="p-2 px-2.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95"
                  title="ออกจากระบบ (Logout)"
                >
                  <span>🚪 ออก</span>
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
                onClick={() => { setIsMobileActionSheetOpen(false); onOpenNotificationModal(); }}
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
                onClick={() => { setIsMobileActionSheetOpen(false); if (onOpenUserAccountModal) onOpenUserAccountModal(); }}
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
    </header>
  );
}


// --- Module File: js/modules/mod00_core/LoginModal.js ---
// MODULE: mod00_core/LoginModal.js

function LoginModal({ onLoginSuccess, onClose, isSwitching = false }) {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountsList, setAccountsList] = useState(() => {
    return window.getUserAccounts ? window.getUserAccounts() : DEMO_USERS;
  });

  useEffect(() => {
    async function refreshUsers() {
      try {
        if (typeof loadFromDB === 'function') {
          const remoteUsers = await loadFromDB('users', null);
          if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
            const rawStr = JSON.stringify(remoteUsers);
            if (!rawStr.includes('à¸') && !rawStr.includes('à¹') && !rawStr.includes('ðŸ')) {
              localStorage.setItem('aeron_user_accounts', rawStr);
              setAccountsList(remoteUsers);
            }
          }
        }
      } catch (e) {}
    }
    refreshUsers();
  }, []);

  const handleQuickLogin = (demoUser) => {
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      const authPayload = {
        ...demoUser,
        token: `aeron_jwt_token_${(demoUser.role || 'SALES').toLowerCase()}_${Date.now()}`,
        loginTime: new Date().toISOString()
      };
      setLoading(false);
      onLoginSuccess(authPayload);
    }, 120);
  };

  const handleResetDefaultAccounts = () => {
    localStorage.setItem('aeron_user_accounts', JSON.stringify(DEMO_USERS));
    setAccountsList(DEMO_USERS);
    setUsername('owner');
    setPassword('123456');
    setErrorMsg('');
    alert('🔄 รีเซ็ตกู้คืนบัญชีผู้ใช้งานตั้งต้นเรียบร้อยแล้ว (Username: owner / Password: 123456)');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const uClean = username.trim().toLowerCase();
    const currentAccounts = window.getUserAccounts ? window.getUserAccounts() : DEMO_USERS;
    const foundUser = currentAccounts.find(u => (u.username || '').toLowerCase() === uClean || (u.id || '').toLowerCase() === uClean);

    setTimeout(() => {
      if (foundUser) {
        if (foundUser.password && foundUser.password !== password && password !== '123456') {
          setLoading(false);
          setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (รหัสเริ่มต้น: 123456)');
          return;
        }

        const authPayload = {
          ...foundUser,
          token: `aeron_jwt_token_${(foundUser.role || 'SALES').toLowerCase()}_${Date.now()}`,
          loginTime: new Date().toISOString()
        };
        setLoading(false);
        onLoginSuccess(authPayload);
      } else {
        setLoading(false);
        setErrorMsg('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้ หรือเลือกเข้าใช้งานด่วน');
      }
    }, 150);
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950 overflow-y-auto ${isSwitching ? 'backdrop-blur-md bg-slate-950/90' : 'min-h-screen'}`}>
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container: Auto-scales from 280px narrow cover screens up to 900px Vivo X Fold 3 Pro & Tablets */}
      <div className="relative bg-slate-900/95 border border-slate-700/80 w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh] backdrop-blur-xl">
        
        {/* Header with Branding */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 shadow-lg shadow-emerald-500/20 border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
              <img 
                src="./assets/logo.jpg" 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=AERON&background=4f46e5&color=fff&size=128'; }}
                alt="AERON MEDICAL Logo" 
                className="h-full w-full object-contain rounded-xl"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-wider leading-tight">
                  <span className="bg-gradient-to-r from-[#a3e635] via-[#65a30d] to-[#16a34a] bg-clip-text text-transparent font-extrabold">AERON </span>
                  <span className="text-white font-bold">MEDICAL</span>
                </h1>
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-200/90 font-medium">ระบบเข้าสู่ระบบเพื่อความปลอดภัย (Authentication Portal)</p>
            </div>
          </div>

          {isSwitching && (
            <button 
              onClick={onClose} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-sm transition-colors"
              title="ปิดหน้าต่างสลับสิทธิ์"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content Body: Adaptive 1-column on narrow cover screens, 2-column on Vivo X Fold 3 Pro / Tablets */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">
            
            {/* Column 1: Quick Role Switcher (1-Click Login for Demo/Testing) */}
            <div className="space-y-3 bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span> <span>เลือกเข้าใช้งานด่วน (Quick Login):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 max-h-56 md:max-h-72 overflow-y-auto p-0.5">
                {(accountsList || []).map(u => {
                  const config = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[u.role]) || {};
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      disabled={loading}
                      className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group flex items-center gap-2.5 active:scale-95 touch-manipulation"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-base border border-slate-800 group-hover:border-emerald-500/50 flex-shrink-0">
                        {u.avatar || '👤'}
                      </div>
                      <div className="overflow-hidden space-y-0.5 min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {u.name}
                        </div>
                        <div className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border inline-block ${config.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {u.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Standard Username & Password Form */}
            <div className="space-y-4 bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <span>🔑</span>
                <span>กรอก Username & Password:</span>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2">
                    <span>⚠️</span> <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-[11px] sm:text-xs text-slate-300">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น owner, sales_somchai, messenger..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-base sm:text-xs text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[11px] sm:text-xs text-slate-300">รหัสผ่าน (Password)</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      {showPassword ? '🙈 ซ่อน' : '👁️ แสดงรหัส'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-base sm:text-xs text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
                >
                  {loading ? (
                    <span>⌛ กำลังตรวจสอบสิทธิ์...</span>
                  ) : (
                    <>
                      <span>🔓 เข้าสู่ระบบ (Log In)</span>
                    </>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleResetDefaultAccounts}
                    className="text-[10px] text-slate-400 hover:text-amber-300 underline transition-colors"
                  >
                    🔄 รีเซ็ตกู้คืนบัญชีผู้ใช้งานตั้งต้น (รหัสเริ่มต้น: 123456)
                  </button>
                </div>
              </form>
            </div>

          </div>

          <div className="text-center pt-2 text-[10.5px] text-slate-500">
            🛡️ ระบบรักษาความปลอดภัยข้อมูลองค์กร AERON MEDICAL (Thailand)
          </div>

        </div>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod00_core/NotificationModal.js ---
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


// --- Module File: js/modules/mod00_core/SidebarIconRail.js ---
// MODULE: mod00_core/SidebarIconRail.js

function SidebarIconRail({ activeTab, setActiveTab, onOpenFullDrawer, pendingPOCount, activeRepairCount, activeShipmentCount, activeFDACount, currentUser }) {
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
}


// --- Module File: js/modules/mod00_core/SidebarNavDrawer.js ---
// MODULE: mod00_core/SidebarNavDrawer.js

function SidebarNavDrawer({ isOpen, onClose, activeTab, setActiveTab, currentUser = null, pendingPOCount = 0, activeRepairCount = 0, activeShipmentCount = 0, activeFDACount = 0 }) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวมผลงาน & ดัชนีหลัก', icon: '📊', tabName: 'Dashboard', desc: 'Executive Dashboard & KPI' },
    { id: 'clients', label: 'ฐานข้อมูลลูกค้า รพ. & แพทย์', icon: '🏥', tabName: 'Clients', desc: 'Hospitals & Decision Makers' },
    { id: 'project', label: 'กระดานติดตามงานขาย Sales Kanban', icon: '📋', tabName: 'Projects', desc: 'All Sales Pipelines' },
    { id: 'logistic', label: 'คลังสินค้า เครื่อง Demo & ขนส่ง', icon: '🚚', tabName: 'Logistic', badge: (activeShipmentCount + activeRepairCount) > 0 ? (activeShipmentCount + activeRepairCount) : null, desc: 'Demo Assets & Shipment' },
    { id: 'calendar', label: 'ปฏิทินจองคิวเครื่อง Demo', icon: '📅', tabName: 'Calendar', desc: 'Demo Booking Schedules' },
    { id: 'report', label: 'ศูนย์รวมรายงานทุกระบบ & ทะเบียน อย.', icon: '📑', tabName: 'Report', badge: activeFDACount > 0 ? activeFDACount : null, desc: 'Enterprise Reports & Thai FDA' },
    { id: 'finance', label: 'ตารางคำนวณต้นทุน & ใบสั่งซื้อ PO', icon: '💰', tabName: 'Finance', badge: pendingPOCount > 0 ? pendingPOCount : null, desc: 'Cost Sheet & Vendor POs' },
    { id: 'hr', label: 'ตารางวันลา & บุคลากรทีม Sales', icon: '👥', tabName: 'HR', desc: 'Leave Requests & Team Roster' },
    { id: 'accounting', label: 'ลงบันทึกรายรับ-รายจ่าย & งบการเงิน', icon: '🧾', tabName: 'Accounting', desc: 'Daily Transactions & P&L' }
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


// --- Module File: js/modules/mod00_core/UserAccountManagementModal.js ---
// MODULE: mod00_core/UserAccountManagementModal.js

function UserAccountManagementModal({ isOpen, onClose, currentUser, onAccountsUpdated }) {
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const modalContentRef = useRef(null);

  // Check if current logged in user is OWNER
  const isOwner = useMemo(() => {
    return currentUser && String(currentUser.role).toUpperCase() === 'OWNER';
  }, [currentUser]);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [role, setRole] = useState('SALES');
  const [avatar, setAvatar] = useState('👨‍⚕️');

  // Custom Permissions State
  const ALL_SYSTEM_TABS = [
    { id: 'dashboard', label: '📊 Executive Dashboard' },
    { id: 'clients', label: '🏥 ฐานข้อมูลลูกค้า รพ.' },
    { id: 'project', label: '📋 กระดาน Sales Kanban' },
    { id: 'logistic', label: '🚚 คลังสินค้า & ขนส่ง' },
    { id: 'calendar', label: '📅 ปฏิทินจองคิว Demo' },
    { id: 'report', label: '📑 ทะเบียน อย. & สรุปรายงาน' },
    { id: 'finance', label: '💰 ตารางต้นทุน & ใบสั่งซื้อ PO' },
    { id: 'hr', label: '👥 ตารางวันลา & บุคลากร' },
    { id: 'accounting', label: '🧾 บันทึกรายวัน & งบการเงิน' },
    { id: 'messenger', label: '🛵 ขนส่งแมสเซ็นเจอร์' }
  ];

  const [allowedTabs, setAllowedTabs] = useState(['clients', 'project', 'logistic', 'calendar', 'hr']);
  const [subordinates, setSubordinates] = useState(['m1', 'm2', 'm3', 'm4']);
  const [canApproveHR, setCanApproveHR] = useState(false);
  const [canViewAuditLogs, setCanViewAuditLogs] = useState(false);
  const [canViewAllFinancials, setCanViewAllFinancials] = useState(false);

  const ALL_SALES_REPS = [
    { id: 'm1', name: '👨‍⚕️ สมชาย สายลุย' },
    { id: 'm2', name: '👩‍⚕️ สมหญิง ใจดี' },
    { id: 'm3', name: '👨‍💼 อนันต์ ผู้โชคดี' },
    { id: 'm4', name: '👨‍💼 สุชาติ มุ่งมั่น' }
  ];

  const [showPasswords, setShowPasswords] = useState({});

  // Initial Load from localStorage
  useEffect(() => {
    if (isOpen) {
      const userAccs = window.getUserAccounts ? window.getUserAccounts() : [];
      setAccounts(userAccs);
    }
  }, [isOpen]);

  // Auto-update default allowedTabs when role changes (if adding new account)
  useEffect(() => {
    if (!editingId) {
      const roleConfig = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[role]) || {};
      if (roleConfig.allowedTabs) {
        setAllowedTabs(roleConfig.allowedTabs);
        setCanApproveHR(!!roleConfig.canApproveHR);
        setCanViewAuditLogs(!!roleConfig.canViewAuditLogs);
        setCanViewAllFinancials(!!roleConfig.canViewAllFinancials);
      }
    }
  }, [role, editingId]);

  if (!isOpen) return null;

  const handleToggleTab = (tabId) => {
    setAllowedTabs(prev => {
      if (prev.includes(tabId)) {
        return prev.filter(t => t !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  const handleToggleSubordinate = (repId) => {
    setSubordinates(prev => {
      if (prev.includes(repId)) {
        return prev.filter(id => id !== repId);
      } else {
        return [...prev, repId];
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;

    const uClean = username.trim().toLowerCase();

    // Check duplicate username if adding new
    if (!editingId && accounts.some(a => a.username.toLowerCase() === uClean)) {
      alert('ชื่อผู้ใช้งาน (Username) นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น');
      return;
    }

    if (editingId) {
      // Edit existing user account
      const updated = accounts.map(a => {
        if (a.id === editingId) {
          return {
            ...a,
            username: uClean,
            password: password || '123456',
            name: name.trim(),
            role,
            avatar,
            allowedTabs,
            subordinates,
            canApproveHR,
            canViewAuditLogs,
            canViewAllFinancials
          };
        }
        return a;
      });
      setAccounts(updated);
      window.saveUserAccounts(updated);
      setEditingId(null);
    } else {
      // Add new user account
      const newAcc = {
        id: 'usr_' + Date.now(),
        username: uClean,
        password: password || '123456',
        name: name.trim(),
        role,
        avatar,
        allowedTabs,
        subordinates,
        canApproveHR,
        canViewAuditLogs,
        canViewAllFinancials,
        memberId: 'm_' + Date.now()
      };
      const updated = [...accounts, newAcc];
      setAccounts(updated);
      window.saveUserAccounts(updated);
    }

    // Reset Form
    handleCancelEdit();
    if (onAccountsUpdated) onAccountsUpdated();
  };

  const handleEditAccount = (acc) => {
    setEditingId(acc.id);
    setUsername(acc.username);
    setPassword(acc.password || '123456');
    setName(acc.name);
    setRole(acc.role || 'SALES');
    setAvatar(acc.avatar || '👨‍⚕️');

    const roleConfig = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[acc.role]) || {};
    setAllowedTabs(Array.isArray(acc.allowedTabs) ? acc.allowedTabs : (roleConfig.allowedTabs || []));
    setSubordinates(Array.isArray(acc.subordinates) ? acc.subordinates : ['m1', 'm2', 'm3', 'm4']);
    setCanApproveHR(acc.canApproveHR !== undefined ? acc.canApproveHR : !!roleConfig.canApproveHR);
    setCanViewAuditLogs(acc.canViewAuditLogs !== undefined ? acc.canViewAuditLogs : !!roleConfig.canViewAuditLogs);
    setCanViewAllFinancials(acc.canViewAllFinancials !== undefined ? acc.canViewAllFinancials : !!roleConfig.canViewAllFinancials);

    // Smooth scroll to top form
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setUsername('');
    setPassword('123456');
    setName('');
    setRole('SALES');
    setAvatar('👨‍⚕️');
    setAllowedTabs(['clients', 'project', 'logistic', 'calendar', 'hr']);
    setSubordinates(['m1', 'm2', 'm3', 'm4']);
    setCanApproveHR(false);
    setCanViewAuditLogs(false);
    setCanViewAllFinancials(false);
  };

  const handleDeleteAccount = (accId) => {
    if (confirm('คุณต้องการลบบัญชีผู้ใช้นี้ใช่หรือไม่?\n\n🛡️ หมายเหตุ: การลบผู้ใช้จะเป็นการลบสิทธิ์การ Log In เท่านั้น ข้อมูลโครงการ, รายการเงิน และ Activity Logs ทั้งหมดที่เคยสร้างไว้จะยังคงอยู่อย่างสมบูรณ์ 100%')) {
      const updated = accounts.filter(a => a.id !== accId);
      setAccounts(updated);
      window.saveUserAccounts(updated);
      if (onAccountsUpdated) onAccountsUpdated();
    }
  };

  const toggleShowPassword = (accId) => {
    if (!isOwner) {
      alert('🔒 สิทธิ์การดูรหัสผ่านถูกจำกัดไว้สำหรับ OWNER (เจ้าของระบบ/คุณตู้) เท่านั้น');
      return;
    }
    setShowPasswords(prev => ({ ...prev, [accId]: !prev[accId] }));
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 w-screen h-screen flex flex-col overflow-hidden animate-fade-in text-slate-100 font-sans">
      
      {/* Top Header Bar - Fixed 100% */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between flex-shrink-0 w-full shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30 shadow-md">
            🔐
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
              <span>ระบบสร้าง & กำหนดสิทธิ์บัญชีผู้ใช้งาน (User Accounts & Granular RBAC)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                OWNER & HEAD ADMIN
              </span>
            </h3>
            <p className="text-xs text-slate-400">สร้าง/แก้ไขบัญชีผู้ใช้ และติ๊กเลือกกำหนดหน้าเว็บ/ฟังก์ชันที่อนุญาตให้เข้าดูได้แบบรายบุคคล</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
        >
          <span>✕ ปิดหน้าต่าง</span>
        </button>
      </div>

      {/* Middle Scroll Body - Max-W-6XL Centered */}
      <div ref={modalContentRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full scroll-smooth min-h-0">
          
          {/* Create / Edit Account Form Container */}
          <form
            onSubmit={handleFormSubmit}
            className={`p-5 rounded-3xl border transition-all space-y-4 shadow-xl ${
              editingId
                ? 'bg-amber-950/20 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
                <span className="text-base">{editingId ? '✏️' : '➕'}</span>
                <span>{editingId ? 'แก้ไขข้อมูลและกำหนดสิทธิ์ผู้ใช้' : 'สร้างบัญชีผู้ใช้งานใหม่'}</span>
              </span>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                  ✕ ยกเลิกการแก้ไข
                </button>
              )}
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">ชื่อผู้ใช้งาน (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น sales_arm, admin_ketsara"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">รหัสผ่าน (Password) *</label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">ชื่อ-นามสกุลจริง (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อาร์ม สายลุย"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">บทบาทหลัก (Role Preset) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-2.5 outline-none font-bold focus:border-amber-400"
                >
                  <option value="OWNER">👑 OWNER (ผู้บริหารสูงสุด)</option>
                  <option value="HEAD_ADMIN">👩‍💼 HEAD_ADMIN (หัวหน้าฝ่ายบริหาร)</option>
                  <option value="ADMIN">🏢 ADMIN (ธุรการ/จัดซื้อ)</option>
                  <option value="SALES_HEAD">👨‍💼 SALES_HEAD (หัวหน้าทีมขาย)</option>
                  <option value="SALES">👨‍⚕️ SALES (เจ้าหน้าที่ฝ่ายขาย)</option>
                  <option value="MESSENGER">🛵 MESSENGER (ขนส่ง/ส่งเอกสาร)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">รูปประจำตัว (Avatar)</label>
                <select
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none text-center font-bold"
                >
                  <option value="👑">👑 (Owner)</option>
                  <option value="👩‍💼">👩‍💼 (Head Admin)</option>
                  <option value="🏢">🏢 (Admin)</option>
                  <option value="👨‍💼">👨‍💼 (Sales Head)</option>
                  <option value="👨‍⚕️">👨‍⚕️ (Sales)</option>
                  <option value="👩‍⚕️">👩‍⚕️ (Sales Female)</option>
                  <option value="🛵">🛵 (Messenger)</option>
                  <option value="🧑‍💻">🧑‍💻 (IT Support)</option>
                </select>
              </div>
            </div>

            {/* Granular Allowed Tabs Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                <span>🖥️ เลือกหน้าเว็บที่อนุญาตให้ผู้ใช้คนนี้เข้าดูได้ (Allowed System Tabs):</span>
                <span className="text-[11px] text-slate-400 font-normal">({allowedTabs.length} หน้าเลือกอยู่)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                {ALL_SYSTEM_TABS.map(tab => {
                  const isChecked = allowedTabs.includes(tab.id);
                  return (
                    <label
                      key={tab.id}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTab(tab.id)}
                        className="accent-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{tab.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Subordinate Rep Selection for SALES_HEAD */}
            {role === 'SALES_HEAD' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                  <span>👨‍💼 เลือกพนักงานขายที่อนุญาตให้หัวหน้าเซลล์คนนี้ติดตามกระดาน Kanban ได้ (Subordinate Reps):</span>
                  <span className="text-[11px] text-slate-400 font-normal">({subordinates.length} คนเลือกอยู่)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {ALL_SALES_REPS.map(rep => {
                    const isChecked = subordinates.includes(rep.id) || subordinates.includes(rep.name);
                    return (
                      <label
                        key={rep.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubordinate(rep.id)}
                          className="accent-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="truncate">{rep.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Feature Permissions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-amber-300">🔐 สิทธิ์ฟังก์ชันพิเศษ (Special Feature Permissions):</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${canApproveHR ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                  <input type="checkbox" checked={canApproveHR} onChange={(e) => setCanApproveHR(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
                  <span>👥 สิทธิ์อนุมัติการลา HR</span>
                </label>

                <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${canViewAuditLogs ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                  <input type="checkbox" checked={canViewAuditLogs} onChange={(e) => setCanViewAuditLogs(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
                  <span>📜 สิทธิ์ดู Audit Logs ประวัติระบบ</span>
                </label>

                <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${canViewAllFinancials ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                  <input type="checkbox" checked={canViewAllFinancials} onChange={(e) => setCanViewAllFinancials(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
                  <span>💰 สิทธิ์ดูการเงินทั้งหมด</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                  editingId
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                }`}
              >
                <span>{editingId ? '💾 บันทึกการเปลี่ยนแปลงสิทธิ์บัญชีผู้ใช้' : '➕ บันทึกสร้างบัญชีผู้ใช้ใหม่'}</span>
              </button>
            </div>
          </form>

          {/* Accounts List Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-2">
                <span>📋 รายชื่อบัญชีผู้ใช้งานในระบบทั้งหมด ({accounts.length} บัญชี)</span>
              </span>
              <span className="text-[11px] text-slate-400 italic">
                🛡️ ปุ่มดูรหัสผ่าน 👁️ อนุญาตเฉพาะ OWNER (เจ้าของ/คุณตู้) ดูได้คนเดียวเท่านั้น
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map(acc => {
                const roleConfig = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[acc.role]) || {};
                const isShow = showPasswords[acc.id];
                const accTabs = Array.isArray(acc.allowedTabs) ? acc.allowedTabs : (roleConfig.allowedTabs || []);

                return (
                  <div
                    key={acc.id}
                    className={`bg-slate-950 p-4 rounded-2xl border space-y-3 relative transition-all ${
                      editingId === acc.id
                        ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-950/10'
                        : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-800 flex-shrink-0 shadow-inner">
                          {acc.avatar || '👤'}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            <span>{acc.name}</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Username: <span className="text-amber-300 font-bold">{acc.username}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditAccount(acc)}
                          className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1 active:scale-95"
                          title="แก้ไขบัญชีและกำหนดสิทธิ์"
                        >
                          <span>✏️</span>
                          <span>แก้ไข</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-2 bg-slate-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 rounded-xl text-xs border border-slate-800 transition-colors"
                          title="ลบบัญชีผู้ใช้นี้ (ไม่กระทบข้อมูลงาน)"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Allowed Tabs Summary Pills */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">หน้าที่ได้รับอนุญาตให้เข้าดู ({accTabs.length} หน้า):</div>
                      <div className="flex flex-wrap gap-1">
                        {accTabs.map(tId => (
                          <span key={tId} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                            {tId}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-900 text-xs">
                      <span className={`px-2.5 py-0.5 rounded-lg border font-mono text-[10.5px] font-extrabold ${roleConfig.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {acc.role}
                      </span>

                      {/* Password Preview with OWNER Security Guard */}
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-slate-400 text-[11px]">รหัสผ่าน:</span>
                        <span className="font-bold text-amber-300">
                          {isOwner && isShow ? (acc.password || '123456') : '••••••••'}
                        </span>
                        
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(acc.id)}
                            className="text-slate-400 hover:text-white text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-sans"
                          >
                            {isShow ? '👁️‍🗨️ ซ่อน' : '👁️ แสดง'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-sans italic" title="สิทธิ์การดูรหัสผ่านสงวนไว้สำหรับ OWNER เท่านั้น">
                            🔒 (OWNER เท่านั้น)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs flex-shrink-0 w-full">
          <div className="text-slate-400 flex items-center gap-1.5">
            <span>🛡️ ปลอดภัยตามมาตรฐาน RBAC Data Security Protocol & Password Privacy Guard</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold rounded-xl shadow-md"
          >
            ปิดหน้าต่าง
          </button>
        </div>

    </div>
  );
}


// --- Module File: js/modules/mod01_dashboard/ManagerDashboard.js ---
// MODULE: mod01_dashboard/ManagerDashboard.js
// Multi-Role Executive & Operational Dashboard (Classic, CEO, CFO, Manager Views)

function ManagerDashboard({ 
  projects = [], 
  allProjects = [], 
  members = [], 
  products = [],
  demoBookings = [],
  purchaseOrders = [],
  shipments = [],
  repairTickets = [],
  soldProducts = [],
  fdaRegistrations = [],
  costCalculations = [],
  currentUser = null,
  initialTab = 'classic',
  onEditProject = () => {}, 
  onAddLog = () => {}, 
  onViewHistory = () => {}, 
  onMoveProject = () => {}, 
  onBookDemo = () => {},
  onOpenReport = () => {}
}) {
  // Chart references for Classic View
  const chartRefWorkload = useRef(null);
  const chartRefStage = useRef(null);
  const chartInstanceWorkload = useRef(null);
  const chartInstanceStage = useRef(null);

  // Determine default tab based on user role or initialTab prop
  const defaultTab = useMemo(() => {
    if (initialTab) return initialTab;
    if (!currentUser) return 'classic';
    const role = String(currentUser.role).toUpperCase();
    if (role === 'ACCOUNTANT' || role === 'FINANCE') return 'cfo';
    if (role === 'SALES_MANAGER' || role === 'OPERATIONS') return 'manager';
    return 'classic';
  }, [currentUser, initialTab]);

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync if initialTab prop changes from Header view switcher
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Filtered Projects
  const filteredProjects = useMemo(() => {
    return (projects || []).filter(p => {
      const pDate = p.procurementDate || p.createdDate || '';
      if (pDate) {
        if (startDate && pDate < startDate) return false;
        if (endDate && pDate > endDate) return false;
      }
      return true;
    });
  }, [projects, startDate, endDate]);

  // --- CORE METRICS CALCULATIONS ---
  const totalProjects = filteredProjects.length;
  const totalBudget = filteredProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const weightedForecast = filteredProjects.reduce((sum, p) => sum + ((Number(p.budget) || 0) * (Number(p.winProbability || (p.status.includes('won') ? 100 : 30)) || 0) / 100), 0);
  const wonProjects = filteredProjects.filter(p => ['stage_won', 'stage_ordering', 'stage_delivery', 'stage_complete'].includes(p.status));
  const wonBudget = wonProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const targetYearBudget = 60000000; // Annual Target 60M
  const targetAttainment = targetYearBudget > 0 ? (wonBudget / targetYearBudget) * 100 : 0;

  // Margin Calculations
  const calculatedCostSheets = useMemo(() => {
    return filteredProjects.map(p => {
      const calc = (costCalculations || []).find(c => c.projectId === p.id || (c.projectName && p.hospitalName && c.projectName.includes(p.hospitalName)));
      if (calc) {
        const computed = computeCostSheet(calc);
        return { proj: p, calc, computed, hasCalc: true };
      }
      const defaultCalc = {
        sellingPriceInVat: p.budget || 0,
        costInVat: Math.round((p.budget || 0) * 0.70),
        dfType: 'amount',
        dfValue: p.dfAmount ? Number(String(p.dfAmount).replace(/[^0-9.]/g, '')) || 0 : 0,
        salesCommPercent: 2.0,
        interestPercent: 7.0,
        taxPercent: 20.0,
        retentionPercent: 5.0
      };
      const computed = computeCostSheet(defaultCalc);
      return { proj: p, calc: defaultCalc, computed, hasCalc: false };
    });
  }, [filteredProjects, costCalculations]);

  const totalNetProfit = calculatedCostSheets.reduce((sum, item) => sum + item.computed.netProfit, 0);
  const avgMarginPercent = totalBudget > 0 ? (totalNetProfit / (totalBudget / 1.07)) * 100 : 0;

  // High-Value Deals at Risk (Budget >= 4M & stalled or in e-Bidding/Prospect)
  const highValueRisks = useMemo(() => {
    return filteredProjects.filter(p => (Number(p.budget) || 0) >= 4000000 && p.status !== 'stage_complete' && p.status !== 'stage_won')
      .slice(0, 4);
  }, [filteredProjects]);

  // Stage 4+ Capital Required
  const stage4Metrics = useMemo(() => {
    const stage4PlusIds = ['stage_approved', 'stage_won', 'stage_ordering', 'stage_delivery'];
    const stage4Projects = (filteredProjects || []).filter(p => stage4PlusIds.includes(p.status));
    let totalCapital = 0;
    stage4Projects.forEach(proj => {
      const existingCalc = (costCalculations || []).find(c => c.projectId === proj.id || (c.projectName && c.projectName.includes(proj.hospitalName)));
      if (existingCalc && Number(existingCalc.costInVat) > 0) {
        totalCapital += Number(existingCalc.costInVat);
      } else {
        totalCapital += Math.round((proj.budget || 0) * 0.65);
      }
    });
    return { totalCapital, count: stage4Projects.length, projects: stage4Projects };
  }, [filteredProjects, costCalculations]);

  // Demo Metrics
  const scheduledDemos = demoBookings.filter(b => b.status === 'อนุมัติคิว' || b.status === 'กำลังเดโม่' || b.status === 'นัดหมายแล้ว');
  const today = new Date();
  today.setHours(0,0,0,0);

  // Warranty & MA Alert
  const warrantyAlerts = useMemo(() => {
    return (soldProducts || []).map(p => {
      let days = 999;
      if (p.warrantyExpiry) {
        const exp = new Date(p.warrantyExpiry);
        exp.setHours(0,0,0,0);
        days = Math.ceil((exp - today) / 86400000);
      }
      return { ...p, daysLeft: days };
    }).filter(p => p.daysLeft <= 60).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [soldProducts]);

  // --- CHART.JS RENDERING FOR CLASSIC OVERVIEW ---
  useEffect(() => {
    if (activeTab !== 'classic') return;

    if (chartRefWorkload.current && typeof Chart !== 'undefined') {
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.destroy();

      const memberNames = (members || []).map(m => m.name);
      const budgetPerMember = (members || []).map(m => filteredProjects.filter(p => (p.salesPerson === m.name || p.assignee === m.name)).reduce((sum, p) => sum + (Number(p.budget) || 0), 0) / 1000000);
      const countPerMember = (members || []).map(m => filteredProjects.filter(p => (p.salesPerson === m.name || p.assignee === m.name)).length);

      const ctx = chartRefWorkload.current.getContext('2d');
      chartInstanceWorkload.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: memberNames,
          datasets: [
            {
              label: 'มูลค่ารวม (ล้านบาท)',
              data: budgetPerMember,
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1.5,
              borderRadius: 8,
              yAxisID: 'y'
            },
            {
              label: 'จำนวนโครงการ',
              data: countPerMember,
              type: 'line',
              borderColor: 'rgba(245, 158, 11, 1)',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              borderWidth: 2,
              tension: 0.3,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#94a3b8' } } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51, 65, 85, 0.3)' }, title: { display: true, text: 'ล้านบาท', color: '#94a3b8' } },
            y1: { position: 'right', ticks: { color: '#f59e0b', stepSize: 1 }, grid: { drawOnChartArea: false }, title: { display: true, text: 'จำนวนโครงการ', color: '#f59e0b' } }
          }
        }
      });
    }

    if (chartRefStage.current && typeof Chart !== 'undefined') {
      if (chartInstanceStage.current) chartInstanceStage.current.destroy();

      const stages = window.STAGES || [];
      const stageLabels = stages.map(s => s.title || s.name);
      const stageCounts = stages.map(s => filteredProjects.filter(p => p.status === s.id).length);
      const stageColors = ['#94a3b8', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];

      const ctx = chartRefStage.current.getContext('2d');
      chartInstanceStage.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: stageLabels,
          datasets: [{
            data: stageCounts,
            backgroundColor: stageColors,
            borderColor: '#0f172a',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 } } }
          }
        }
      });
    }

    const handleResize = () => {
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.resize();
      if (chartInstanceStage.current) chartInstanceStage.current.resize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.destroy();
      if (chartInstanceStage.current) chartInstanceStage.current.destroy();
    };
  }, [activeTab, filteredProjects, members]);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-10">
      
      {/* 1. Header & 4-Tab Role Switcher Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AERON ENTERPRISE DASHBOARD
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-time Analytics</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>
              {activeTab === 'classic' ? '📊 ภาพรวมองค์กรดั้งเดิม (Classic Overview)' :
               activeTab === 'ceo' ? '👑 แดชบอร์ดภาพรวมยุทธศาสตร์ (CEO View)' : 
               activeTab === 'cfo' ? '💰 แดชบอร์ดสภาพคล่อง & ต้นทุน (CFO View)' : 
               '🎯 แดชบอร์ดปฏิบัติการ & ทีมขาย (Manager View)'}
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === 'classic' ? 'กราฟวิเคราะห์ภาระงานทีมขาย, สัดส่วนสถานะโครงการ และตารางคิวสาธิตเครื่อง' :
             activeTab === 'ceo' ? 'ติดตามยอดขายเทียบเป้า ฿60M, สุขภาพ Pipeline, กำไรสุทธิ และดีลเสี่ยงสูง' : 
             activeTab === 'cfo' ? 'ควบคุมเงินสดสำรอง, ทุนสั่งของ Stage 4+, ภาระหนี้ PO และ Margin กำไร' : 
             'ควบคุมการหมุนเวียนเครื่อง Demo, ติดตามการนำเข้าชิปปิ้ง, งานซ่อม และเตือนต่อประกัน MA'}
          </p>
        </div>

        {/* Controls: 4 Tabs Switcher & Date Range */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
          
          {/* 4 Role Tabs Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('classic')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'classic'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>ภาพรวมดั้งเดิม</span>
            </button>

            <button
              onClick={() => setActiveTab('ceo')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ceo'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👑</span>
              <span>มุมมอง CEO</span>
            </button>

            <button
              onClick={() => setActiveTab('cfo')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'cfo'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>💰</span>
              <span>มุมมอง CFO</span>
            </button>

            <button
              onClick={() => setActiveTab('manager')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'manager'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎯</span>
              <span>มุมมอง Manager</span>
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 px-3 rounded-2xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold">📅 วันที่:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] rounded-lg px-2 py-1 outline-none"
            />
            <span className="text-slate-600">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px] rounded-lg px-2 py-1 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📊 TAB 0: CLASSIC ALL-IN-ONE OVERVIEW (ดั้งเดิมพร้อมกราฟคู่) */}
      {/* ========================================================= */}
      {activeTab === 'classic' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 5 Classic KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            
            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>🎯 โครงการทั้งหมด</span>
                <span>📂</span>
              </div>
              <div className="text-2xl font-black text-white font-mono">{totalProjects}</div>
              <div className="text-[11px] text-slate-400 truncate">มูลค่ารวม {formatCurrency(totalBudget)}</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-1">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>💸 ทุนสั่งของ Stage 4+</span>
                <span>🛒</span>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono truncate">
                {formatCurrency(stage4Metrics.totalCapital)}
              </div>
              <div className="text-[11px] text-amber-200/80 font-medium truncate">
                {stage4Metrics.count} โครงการต้องการทุนสั่งของ
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-1">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>🎉 ชนะประมูลแล้ว</span>
                <span>🏆</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono truncate">{formatCurrency(wonBudget)}</div>
              <div className="text-[11px] text-emerald-300/80 font-medium truncate">{wonProjects.length} โครงการเซ็นสัญญา</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>📈 คาดการณ์ Weighted</span>
                <span>🔮</span>
              </div>
              <div className="text-2xl font-black text-indigo-300 font-mono truncate">{formatCurrency(weightedForecast)}</div>
              <div className="text-[11px] text-slate-400 truncate">ตาม % โอกาสชนะประมูล</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>🩺 เดโม่เครื่องมือ</span>
                <span>🏥</span>
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono">{scheduledDemos.length}</div>
              <div className="text-[11px] text-slate-400 truncate">นัดหมายเดโม่โรงพยาบาล</div>
            </div>

          </div>

          {/* Dual Charts Grid (Workload per Rep + Pipeline Doughnut) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="font-extrabold text-white text-sm">📊 ภาระงานและมูลค่าโครงการแยกรายบุคคล (Workload per Rep)</h3>
              <div className="h-64 relative">
                <canvas ref={chartRefWorkload}></canvas>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <h3 className="font-extrabold text-white text-sm">🍩 สัดส่วนโครงการตามขั้นตอน Stage (Pipeline Funnel)</h3>
              <div className="h-64 relative">
                <canvas ref={chartRefStage}></canvas>
              </div>
            </div>
          </div>

          {/* Scheduled Demos Table */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                  <span>🧪 คิวสาธิตเครื่อง (Demo Schedule) & สินค้าที่ต้องเข้าทดสอบ</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                    {scheduledDemos.length} รายการ
                  </span>
                </h3>
                <p className="text-xs text-slate-400">โครงการที่มีนัดหมายเดโม่เครื่องกับโรงพยาบาล</p>
              </div>
            </div>

            {scheduledDemos.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                ไม่มีโครงการที่อยู่ในช่วงนัดสาธิตเครื่องในขณะนี้
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">โรงพยาบาล / โครงการ</th>
                      <th className="p-3">สินค้าที่เดโม่</th>
                      <th className="p-3">เซลส์ผู้รับผิดชอบ</th>
                      <th className="p-3">ช่วงวันที่นัดสาธิต</th>
                      <th className="p-3 text-right">งบประมาณ</th>
                      <th className="p-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {scheduledDemos.map(p => {
                      let demoDaysStr = '';
                      if (p.demoStartDate && p.demoEndDate) {
                        const start = new Date(p.demoStartDate);
                        const end = new Date(p.demoEndDate);
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        demoDaysStr = ` (${diffDays} วัน)`;
                      } else if (p.startDate && p.endDate) {
                        const start = new Date(p.startDate);
                        const end = new Date(p.endDate);
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        demoDaysStr = ` (${diffDays} วัน)`;
                      }

                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-slate-100">{p.hospitalName}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{p.title || p.productName}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-lg text-[10.5px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                              📦 {p.productName || 'ไม่ระบุรุ่น'}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-emerald-300">{p.salesPerson || p.assignee}</td>
                          <td className="p-3 text-amber-300 font-mono">
                            {(p.demoStartDate || p.startDate) ? `${p.demoStartDate || p.startDate} ถึง ${p.demoEndDate || p.endDate || 'N/A'}${demoDaysStr}` : 'ยังไม่ระบุ'}
                          </td>
                          <td className="p-3 text-right font-semibold text-emerald-400">
                            {formatCurrency(p.budget || p.projectValue)}
                          </td>
                          <td className="p-3 text-center space-x-1">
                            <button
                              onClick={() => onViewHistory(p)}
                              className="px-2 py-1 bg-indigo-900/50 hover:bg-indigo-800/70 text-indigo-200 text-xs rounded-lg border border-indigo-700/60 font-medium"
                              title="ดูประวัติความเคลื่อนไหวย้อนหลัง"
                            >
                              📜 ประวัติ
                            </button>
                            <button
                              onClick={() => onBookDemo(p)}
                              className="px-2 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs rounded-lg border border-purple-700/50"
                            >
                              🧪 จองคิว
                            </button>
                            <button
                              onClick={() => onEditProject(p)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                            >
                              ✏️ แก้ไข
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 👑 TAB 1: CEO STRATEGIC DASHBOARD                         */}
      {/* ========================================================= */}
      {activeTab === 'ceo' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 CEO Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Revenue vs Target */}
            <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>🎯 ยอดขายชนะจริง vs เป้าหมายปี</span>
                <span>🏆</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{formatCurrency(wonBudget)}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>เป้า ฿60.0M</span>
                  <span className="text-emerald-400 font-bold">{targetAttainment.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, targetAttainment)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Card 2: Net Profit & Margin */}
            <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
              <div className="flex items-center justify-between text-indigo-300 text-xs font-bold">
                <span>📈 กำไรสุทธิรวม (Net Profit)</span>
                <span>💰</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">{formatCurrency(totalNetProfit)}</div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>อัตรากำไรสุทธิเฉลี่ย</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold font-mono">{avgMarginPercent.toFixed(1)}%</span>
              </div>
            </div>

            {/* Card 3: Weighted Forecast */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>🔮 มูลค่าคาดการณ์ 90 วัน</span>
                <span>📊</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">{formatCurrency(weightedForecast)}</div>
              <div className="text-[11px] text-slate-400">
                คำนวณถ่วงน้ำหนักจาก {totalProjects} โครงการในมือ
              </div>
            </div>

            {/* Card 4: High Value Deals at Risk */}
            <div className="glass-card p-5 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-2">
              <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
                <span>🚨 ดีลเสี่ยงสูง (เกิน ฿4M)</span>
                <span>⚠️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">{highValueRisks.length} <span className="text-xs font-normal text-slate-400">โครงการ</span></div>
              <div className="text-[11px] text-rose-300/80 font-medium truncate">
                มูลค่ารวม {formatCurrency(highValueRisks.reduce((s, r) => s + (Number(r.budget) || 0), 0))}
              </div>
            </div>

          </div>

          {/* Middle Section: Sales Funnel & High Value Risk Watchlist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Sales Pipeline Funnel Breakdown */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>📊 กระบวนการขาย (Sales Pipeline Funnel)</span>
                </h3>
                <button
                  onClick={() => onOpenReport('sales_pipeline_funnel')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <span>รายงานเชิงลึก</span> <span>➔</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(window.STAGES || []).map(stage => {
                  const stageProjects = filteredProjects.filter(p => p.status === stage.id);
                  const stageValue = stageProjects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
                  const percentOfTotal = totalBudget > 0 ? (stageValue / totalBudget) * 100 : 0;

                  return (
                    <div key={stage.id} className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{stage.title || stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{stageProjects.length} งาน</span>
                          <span className="font-mono font-bold text-emerald-400">{formatCurrency(stageValue)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentOfTotal}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* High-Value Deals Watchlist */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🚨 ดีลใหญ่ที่ต้องจับตาเป็นพิเศษ (High-Value Watchlist)</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  งบประมาณ ฿4.0M ขึ้นไป
                </span>
              </div>

              <div className="space-y-3">
                {highValueRisks.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    🎉 ไม่มีดีลเสี่ยงสูงที่ค้างอยู่ในขณะนี้
                  </div>
                ) : (
                  highValueRisks.map(p => (
                    <div key={p.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-xs sm:text-sm">{p.hospitalName}</div>
                        <div className="text-[11px] text-slate-400">{p.title}</div>
                        <div className="flex items-center gap-2 text-[10.5px]">
                          <span className="text-emerald-400 font-bold font-mono">งบ {formatCurrency(p.budget)}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300">เซลส์: {p.salesPerson || p.assignee}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onEditProject(p)}
                        className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        ดูโครงการ
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom Section: Top Hospitals & Sales Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Top Hospitals */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-white text-sm">🏥 สรุปยอดขายรายโรงพยาบาล (Hospital Share)</h3>
                <button onClick={() => onOpenReport('hospital_penetration')} className="text-xs text-indigo-400 font-bold">ดูทั้งหมด ➔</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {filteredProjects.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="font-semibold text-slate-200">{p.hospitalName}</div>
                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(p.budget)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Leaderboard */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-white text-sm">🏆 อันดับผลงานทีมขาย (Sales Leaderboard)</h3>
                <button onClick={() => onOpenReport('sales_rep_performance')} className="text-xs text-indigo-400 font-bold">ดูทั้งหมด ➔</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {(members || []).map((m, idx) => {
                  const myProjects = filteredProjects.filter(p => p.salesPerson === m.name || p.assignee === m.name);
                  const myWon = myProjects.filter(p => ['stage_won', 'stage_ordering', 'stage_delivery', 'stage_complete'].includes(p.status));
                  const myWonRev = myWon.reduce((s, p) => s + (Number(p.budget) || 0), 0);
                  return (
                    <div key={m.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center">{idx + 1}</span>
                        <span className="font-bold text-slate-200">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({myProjects.length} งาน)</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-400">{formatCurrency(myWonRev)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 💰 TAB 2: CFO FINANCIAL DASHBOARD                         */}
      {/* ========================================================= */}
      {activeTab === 'cfo' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 CFO Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Liquid Cash on Hand */}
            <div className="glass-card p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>💵 เงินสดสภาพคล่องพร้อมใช้</span>
                <span>🏦</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">฿12,450,000</div>
              <div className="text-[11px] text-slate-400">รวม 5 บัญชีธนาคารและเงินสดย่อย</div>
            </div>

            {/* Card 2: Stage 4+ Capital Required */}
            <div className="glass-card p-5 rounded-3xl border border-amber-500/30 bg-amber-950/20 space-y-2">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>📦 เงินทุนสำรองสั่งของ Stage 4+</span>
                <span>🛒</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{formatCurrency(stage4Metrics.totalCapital)}</div>
              <div className="text-[11px] text-slate-400">สำหรับ {stage4Metrics.count} โครงการที่ชนะงานแล้ว</div>
            </div>

            {/* Card 3: Vendor PO Commitments */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>🛒 ภาระหนี้ PO รอชำระ Vendor</span>
                <span>🧾</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono">
                {formatCurrency((purchaseOrders || []).filter(po => po.paymentStatus !== 'ชำระแล้ว').reduce((s, p) => s + (Number(p.totalAmount) || 0), 0))}
              </div>
              <div className="text-[11px] text-slate-400">กำหนดชำระภายใน 30 วัน</div>
            </div>

            {/* Card 4: Retention 5% */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>⏳ เงินประกันสัญญา / Retention 5%</span>
                <span>🛡️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {formatCurrency(totalBudget * 0.05)}
              </div>
              <div className="text-[11px] text-slate-400">เงินค้ำประกันที่จะได้รับคืนจาก รพ.</div>
            </div>

          </div>

          {/* Middle CFO Section: Upcoming Payables & Margin Auditing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Upcoming Payables */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>📅 ปฏิทินวันครบกำหนดจ่ายเงิน (Upcoming Payables)</span>
                </h3>
                <span className="text-xs text-amber-400 font-bold">เตรียมเงินสด</span>
              </div>

              <div className="space-y-3">
                {(purchaseOrders || []).slice(0, 3).map((po, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-200">PO: {po.poNumber} ({po.vendorName})</div>
                      <div className="text-[11px] text-slate-400">{po.productName}</div>
                      <div className="text-[10px] text-amber-300 font-mono">กำหนดส่ง: {po.deliveryDate || 'N/A'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(po.totalAmount)}</div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {po.paymentStatus || 'รอชำระเงิน'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Margin Audit */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🧮 ตรวจสอบโครงสร้างกำไรรายโครงการ (Margin Audit)</span>
                </h3>
                <button onClick={() => onOpenReport('cost_margin_sheet')} className="text-xs text-indigo-400 font-bold">ดูรายงานต้นทุน ➔</button>
              </div>

              <div className="space-y-3">
                {calculatedCostSheets.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{item.proj.hospitalName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ราคาขาย {formatCurrency(item.proj.budget)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-indigo-400">กำไร {formatCurrency(item.computed.netProfit)}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.computed.netProfitPercent >= 15 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {item.computed.netProfitPercent.toFixed(1)}% Margin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🎯 TAB 3: MANAGER OPERATIONS DASHBOARD                    */}
      {/* ========================================================= */}
      {activeTab === 'manager' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 4 Manager Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Active Projects */}
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>📋 โครงการที่กำลังดำเนินการ</span>
                <span>📂</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">{totalProjects} <span className="text-xs font-normal text-slate-400">โครงการ</span></div>
              <div className="text-[11px] text-slate-400">ดูแลโดยทีมขาย {members.length} ท่าน</div>
            </div>

            {/* Card 2: Demo Fleet Active */}
            <div className="glass-card p-5 rounded-3xl border border-purple-500/30 bg-purple-950/20 space-y-2">
              <div className="flex items-center justify-between text-purple-300 text-xs font-bold">
                <span>🧪 เครื่อง Demo ประจำอยู่ รพ.</span>
                <span>🏥</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">{scheduledDemos.length} <span className="text-xs font-normal text-slate-400">เครื่อง</span></div>
              <div className="text-[11px] text-slate-400">ระยะเวลาสาธิตเฉลี่ย 4.5 วัน</div>
            </div>

            {/* Card 3: Active Shipments */}
            <div className="glass-card p-5 rounded-3xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
              <div className="flex items-center justify-between text-cyan-300 text-xs font-bold">
                <span>🚢 ชิปปิ้งนำเข้ากำลังเดินทาง</span>
                <span>✈️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">{(shipments || []).length} <span className="text-xs font-normal text-slate-400">ล็อต</span></div>
              <div className="text-[11px] text-slate-400">ติดตามผ่านระบบนับวันจ่ายเงิน</div>
            </div>

            {/* Card 4: Active Repairs */}
            <div className="glass-card p-5 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-2">
              <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
                <span>🔧 คิวงานแจ้งส่งซ่อม</span>
                <span>⚙️</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">{(repairTickets || []).length} <span className="text-xs font-normal text-slate-400">เคส</span></div>
              <div className="text-[11px] text-slate-400">เวลาซ่อมเฉลี่ย 3 วันทำการ</div>
            </div>

          </div>

          {/* Middle Manager Section: Demo Schedule & Warranty Expiring Soon */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Demo Return Deadlines */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🧪 คิวเครื่อง Demo & วันครบกำหนดคืน</span>
                </h3>
                <button onClick={() => onOpenReport('demo_journey_log')} className="text-xs text-indigo-400 font-bold">ดูประวัติเดโม่ ➔</button>
              </div>

              <div className="space-y-3">
                {scheduledDemos.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">ไม่มีคิวเดโม่ที่กำลังดำเนินการ</div>
                ) : (
                  scheduledDemos.map((b, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{b.productName}</div>
                        <div className="text-[11px] text-slate-400">ณ {b.hospitalName} ({b.salesPerson})</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold">
                          สิ้นสุด {b.endDate}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Warranty Alerts (Opportunity to Sell MA) */}
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>🛡️ เครื่องที่ใกล้หมดประกัน (โอกาสขายสัญญา MA)</span>
                </h3>
                <button onClick={() => onOpenReport('warranty_expiry_matrix')} className="text-xs text-indigo-400 font-bold">ดูทั้งหมด ➔</button>
              </div>

              <div className="space-y-3">
                {warrantyAlerts.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">เครื่องทั้งหมดอยู่ในประกันปกติ</div>
                ) : (
                  warrantyAlerts.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-200">{item.productName} ({item.serialNumber})</div>
                        <div className="text-[11px] text-slate-400">{item.hospitalName}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${item.daysLeft < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {item.daysLeft < 0 ? '🔴 หมดประกันแล้ว' : `🟡 เหลือ ${item.daysLeft} วัน`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

window.ManagerDashboard = ManagerDashboard;


// --- Module File: js/modules/mod02_clients/ClientsDirectoryView.js ---
// MODULE: mod02_clients/ClientsDirectoryView.js

function ClientsDirectoryView({ projects = [], members = [], demoBookings = [], soldProducts = [], searchTerm = '', setSearchTerm = () => {}, filterClientType = 'all', setFilterClientType = () => {}, onEditProject, onBookDemo, onAddLog, onOpenProjectDetail }) {
  const [selectedHospital, setSelectedHospital] = useState(null);

  const hospitalMap = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      const hName = p.hospitalName || 'ไม่ระบุชื่อโรงพยาบาล';
      if (!map[hName]) {
        map[hName] = {
          name: hName,
          clientType: p.clientType || 'รัฐบาล',
          projects: [],
          totalBudget: 0,
          decisionMakers: new Set(),
          salesAssignees: new Set()
        };
      }
      map[hName].projects.push(p);
      map[hName].totalBudget += Number(p.budget) || 0;
      if (p.decisionMakers) map[hName].decisionMakers.add(p.decisionMakers);
      if (p.assignee) map[hName].salesAssignees.add(p.assignee);
    });
    return Object.values(map);
  }, [projects]);

  const filteredHospitals = useMemo(() => {
    return hospitalMap.filter(h => {
      if (filterClientType !== 'all' && h.clientType !== filterClientType) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = h.name.toLowerCase().includes(query);
        const matchDoc = Array.from(h.decisionMakers).some(d => d.toLowerCase().includes(query));
        const matchSales = Array.from(h.salesAssignees).some(s => s.toLowerCase().includes(query));
        return matchName || matchDoc || matchSales;
      }
      return true;
    });
  }, [hospitalMap, filterClientType, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner">
            🏥
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลลูกค้า & โรงพยาบาล (Clients & Hospital Directory)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                {filteredHospitals.length} โรงพยาบาล
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              คลิกที่การ์ดโรงพยาบาลเพื่อเปิดดูรายละเอียดโครงการทั้งหมด อาจารย์แพทย์ผู้ตัดสินใจ คิว Demo และอุปกรณ์ที่ติดตั้งแล้ว
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterClientType}
            onChange={(e) => setFilterClientType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 outline-none font-semibold"
          >
            <option value="all">ทุกประเภทลูกค้า</option>
            <option value="รัฐบาล">🏛️ รัฐบาล</option>
            <option value="เอกชน">🏢 เอกชน</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHospitals.map(h => (
          <div 
            key={h.name} 
            onClick={() => setSelectedHospital(h)}
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all group"
            title="คลิกเพื่อเปิด Pop-up ดูรายละเอียดโรงพยาบาลนี้ทั้งหมด"
          >
            <div className="flex items-start justify-between">
              <span className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-md border ${
                h.clientType === 'รัฐบาล' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {h.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                💰 {formatShortCurrency(h.totalBudget)}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base leading-snug flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                <span>🏥</span>
                <span>{h.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                มี {h.projects.length} โครงการในระบบ
              </p>
            </div>

            {h.decisionMakers.size > 0 && (
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                <span className="text-indigo-300 font-bold flex items-center gap-1">
                  <span>👨‍⚕️</span> อาจารย์ / แพทย์ผู้มีอำนาจสั่งซื้อ:
                </span>
                <p className="text-slate-200 line-clamp-2">
                  {Array.from(h.decisionMakers).join(', ')}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>👤 เซลล์ดูแล: <strong className="text-amber-300">{Array.from(h.salesAssignees).join(', ')}</strong></span>
              <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform">🔍 ดูข้อมูลทั้งหมด ➔</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hospital Detail Pop-up Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          demoBookings={demoBookings}
          soldProducts={soldProducts}
          stages={window.STAGES}
          onClose={() => setSelectedHospital(null)}
          onOpenProjectDetail={(p) => {
            if (onOpenProjectDetail) onOpenProjectDetail(p);
          }}
          onEditProject={onEditProject}
        />
      )}
    </div>
  );
}


// --- Module File: js/modules/mod02_clients/HospitalDetailModal.js ---
// MODULE: mod02_clients/HospitalDetailModal.js

function HospitalDetailModal({ hospital, demoBookings = [], soldProducts = [], stages = window.STAGES || [], onClose, onOpenProjectDetail, onEditProject }) {
  if (!hospital) return null;

  const hospitalProjects = hospital.projects || [];
  const hospitalDemos = demoBookings.filter(b => (b.hospitalName || b.hospital || '').includes(hospital.name));
  const hospitalSoldAssets = soldProducts.filter(s => (s.hospitalName || '').includes(hospital.name));
  const decisionMakersList = Array.from(hospital.decisionMakers || []);
  const salesList = Array.from(hospital.salesAssignees || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-3xl shadow-inner">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${
                  hospital.clientType === 'รัฐบาล' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {hospital.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                  💰 งบประมาณรวม {formatCurrency(hospital.totalBudget)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                <span>{hospital.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {hospitalProjects.length} โครงการ
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex-shrink-0"
          >
            ✕ ปิด
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Key Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">👤 เซลล์ผู้ดูแลพื้นที่</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">{salesList.join(', ') || 'ไม่ระบุ'}</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">👨‍⚕️ แพทย์ผู้มีอำนาจสั่งซื้อ</div>
              <div className="text-sm font-bold text-indigo-300 mt-0.5 line-clamp-1" title={decisionMakersList.join(', ')}>
                {decisionMakersList.join(', ') || 'ไม่ระบุ'}
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">🏆 อุปกรณ์ที่ติดตั้งแล้ว</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{hospitalSoldAssets.length} เครื่อง</div>
            </div>
          </div>

          {/* Section 1: โครงการทั้งหมดในโรงพยาบาลนี้ */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>📋 โครงการจัดซื้อจัดจ้างทั้งหมด ({hospitalProjects.length} งาน)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {hospitalProjects.map(p => {
                const stage = stages.find(s => s.id === p.status) || { title: p.status, badgeColor: 'bg-slate-800 text-slate-300' };
                return (
                  <div key={p.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${stage.badgeColor}`}>
                          {stage.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                          🎯 โอกาส {p.winProbability}%
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          💰 {formatCurrency(p.budget)}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-100 text-xs sm:text-sm">{p.title}</h4>

                      {p.productName && (
                        <div className="text-xs text-emerald-300 font-medium">
                          📦 สินค้า: {p.productName} ({p.productBrand || 'AERON MEDICAL'})
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400">
                        👤 เซลล์: <strong className="text-slate-200">{p.assignee}</strong> | 🏛️ งบ: {p.budgetType}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { onClose(); onOpenProjectDetail(p); }}
                        className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30"
                      >
                        🔍 ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => { onClose(); onEditProject(p); }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700"
                      >
                        ✏️ แก้ไข
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: คิวทดสอบเครื่อง Demo ที่โรงพยาบาลนี้ */}
          {hospitalDemos.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-purple-800/40 space-y-3 bg-purple-950/20">
              <h3 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                <span>🧪 คิวสาธิตเครื่อง Demo ({hospitalDemos.length} รายการ)</span>
              </h3>
              <div className="space-y-2">
                {hospitalDemos.map(b => (
                  <div key={b.id} className="p-3 bg-slate-900 rounded-xl border border-purple-800/40 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">📦 สินค้า: {b.productName}</div>
                      <div className="text-purple-200 font-mono mt-0.5">📅 {b.startDate} ถึง {b.endDate}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-900 text-purple-200 text-[11px] font-bold">
                      {b.status || 'นัดหมายแล้ว'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: ทะเบียนเครื่องที่ติดตั้งแล้ว & สภาพประกัน/PM */}
          {hospitalSoldAssets.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-emerald-800/40 space-y-3 bg-emerald-950/20">
              <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                <span>🏆 อุปกรณ์แพทย์ที่ติดตั้งแล้ว & กำหนด PM ({hospitalSoldAssets.length} เครื่อง)</span>
              </h3>
              <div className="space-y-2">
                {hospitalSoldAssets.map(a => (
                  <div key={a.id} className="p-3 bg-slate-900 rounded-xl border border-emerald-800/40 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">📦 {a.productName} (SN: {a.serialNumber})</div>
                      <div className="text-slate-400 mt-0.5">แผนก: {a.department} | หมดประกัน: {a.warrantyExpiryDate}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                      {a.pmStatus || 'รับมอบเรียบร้อย'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod03_projects/KanbanModal.js ---
// MODULE: mod03_projects/KanbanModal.js

function KanbanModal({ 
  isOpen, 
  onClose, 
  activeMemberId = 'kanban_all', 
  projects = [], 
  stages = window.STAGES || [], 
  members = [], 
  products = [], 
  demoBookings = [], 
  onMoveProject = () => {}, 
  onEditProject = () => {}, 
  onDeleteProject = () => {}, 
  onAddLog = () => {}, 
  onViewHistory = () => {}, 
  onOpenVoiceModal = () => {}, 
  onOpenNewModal = () => {}, 
  onBookDemo = () => {}, 
  onOpenChecklist = () => {} 
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(activeMemberId || 'kanban_all');

  useEffect(() => {
    if (activeMemberId) {
      setSelectedMemberId(activeMemberId);
    }
  }, [activeMemberId]);

  if (!isOpen) return null;

  // Filter projects if specific member selected
  const displayProjects = useMemo(() => {
    if (selectedMemberId === 'kanban_all' || selectedMemberId === 'manager' || selectedMemberId === 'all') {
      return projects;
    }
    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      return projects.filter(p => p.assignee === member.name);
    }
    return projects;
  }, [projects, members, selectedMemberId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-[1700px] h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl shadow-lg shadow-emerald-600/30">
              📋
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>กระดานติดตามงานขาย Sales Kanban Board</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  {displayProjects.length} โครงการ
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ลาก-วาง (Drag & Drop) เพื่อเปลี่ยนสถานะ หรือคลิกไอคอนเพื่ออัปเดตรายละเอียดโครงการ
              </p>
            </div>
          </div>

          {/* Member Filter Pills & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedMemberId('kanban_all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedMemberId === 'kanban_all' || selectedMemberId === 'manager'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 ทุกโครงการ ({projects.length})
              </button>
              {(members || []).map(m => {
                const count = projects.filter(p => p.assignee === m.name).length;
                const isSelected = selectedMemberId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{m.avatar} {m.name.split(' ')[0]}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { onClose(); onOpenNewModal(); }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1"
            >
              <span>+ เพิ่มโครงการ</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700"
              title="ปิด Pop-up"
            >
              ✕ ปิด
            </button>
          </div>
        </div>

        {/* Modal Body with Scrollable Kanban */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          <MemberKanban
            projects={displayProjects}
            stages={stages}
            members={members}
            products={products}
            activeMemberId={selectedMemberId}
            demoBookings={demoBookings}
            onMoveProject={onMoveProject}
            onEditProject={onEditProject}
            onDeleteProject={onDeleteProject}
            onAddLog={onAddLog}
            onViewHistory={onViewHistory}
            onOpenVoiceModal={onOpenVoiceModal}
            onOpenNewModal={onOpenNewModal}
            onBookDemo={onBookDemo}
            onOpenChecklist={onOpenChecklist}
          />
        </div>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod03_projects/MemberKanban.js ---
// MODULE: mod03_projects/MemberKanban.js

function MemberKanban({ projects = [], currentUser, stages = window.STAGES || [], members = [], products = [], activeMemberId, onMoveProject, onEditProject, onDeleteProject, onAddLog, onViewHistory, onOpenNewModal, onBookDemo }) {
  const activeMember = members.find(m => m.id === activeMemberId);
  const [selectedMobileStage, setSelectedMobileStage] = useState(stages[0] ? stages[0].id : 'stage_draft');
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [selectedDetailProject, setSelectedDetailProject] = useState(null);

  const handleDragStart = (e, projectId) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (projectId) {
      onMoveProject(projectId, targetStageId);
      setDraggedProjectId(null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            {activeMember ? activeMember.avatar : '👨‍⚕️'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{activeMember ? activeMember.name : 'กระดาน Sales Kanban Board'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                {activeMember ? activeMember.role : 'ทุกโครงการ'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              แสดงการ์ดสรุปขนาดกะทัดรัด (ชื่อโครงการ, รพ., มูลค่า, เซลล์, โอกาส %) — คลิกที่การ์ดเพื่อดูรายละเอียดฉบับเต็ม
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-3.5 rounded-xl shadow-md transition-colors"
        >
          <span>+ เพิ่มงานใหม่</span>
        </button>
      </div>

      <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {stages.map(stage => {
          const count = projects.filter(p => p.status === stage.id).length;
          const isSelected = selectedMobileStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedMobileStage(stage.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{stage.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-emerald-900 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col lg:flex-row gap-3 min-h-[650px] items-start min-w-full lg:w-[2200px]">
          {stages.map(stage => {
            const stageProjects = projects.filter(p => p.status === stage.id);
            const stageTotalBudget = stageProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
            const isHiddenMobile = selectedMobileStage !== stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3 min-h-[550px] lg:w-[260px] lg:flex-shrink-0 ${
                  isHiddenMobile ? 'hidden lg:flex' : 'flex w-full'
                }`}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stage.headerBg} border border-slate-800 mb-3 space-y-1`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-xs line-clamp-1">{stage.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${stage.badgeColor}`}>
                      {stageProjects.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    รวม: <span className="text-emerald-400 font-semibold">{formatShortCurrency(stageTotalBudget)}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[700px] pr-1">
                  {stageProjects.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800/80 rounded-xl text-slate-600 text-xs font-medium">
                      ไม่มีโครงการในขั้นตอนนี้
                    </div>
                  ) : (
                    stageProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        stages={stages}
                        onDragStart={(e) => handleDragStart(e, project.id)}
                        onMoveProject={onMoveProject}
                        onEditProject={onEditProject}
                        onDeleteProject={onDeleteProject}
                        onAddLog={onAddLog}
                        onViewHistory={onViewHistory}
                        onBookDemo={onBookDemo}
                        onOpenDetail={(p) => setSelectedDetailProject(p)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Pop-up Modal */}
      {selectedDetailProject && (
        <ProjectDetailModal
          project={selectedDetailProject}
          currentUser={currentUser}
          stages={stages}
          members={members}
          products={products}
          onClose={() => setSelectedDetailProject(null)}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          onAddLog={onAddLog}
          onBookDemo={onBookDemo}
          onMoveProject={onMoveProject}
        />
      )}

    </div>
  );
}


// --- Module File: js/modules/mod03_projects/ProjectCard.js ---
// MODULE: mod03_projects/ProjectCard.js

function ProjectCard({ project, stages = window.STAGES || [], onDragStart, onMoveProject, onEditProject, onDeleteProject, onAddLog, onViewHistory, onBookDemo, onOpenDetail }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onOpenDetail && onOpenDetail(project)}
      className="glass-card rounded-2xl p-3 space-y-2 cursor-pointer hover:border-emerald-500/80 hover:shadow-lg hover:shadow-emerald-500/10 transition-all border border-slate-800/90 relative group bg-slate-900/90"
      title="คลิกเพื่อดูรายละเอียดโครงการเต็มทั้งหมด"
    >
      {/* Top Row: Hospital & Win Probability % */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-slate-100 text-xs line-clamp-1 flex items-center gap-1.5 flex-1">
          <span className="text-emerald-400 text-sm">🏥</span>
          <span className="group-hover:text-emerald-300 transition-colors">{project.hospitalName}</span>
        </h4>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-extrabold flex-shrink-0">
          🎯 โอกาส {project.winProbability}%
        </span>
      </div>

      {/* Project Title */}
      <p className="text-xs text-slate-300 font-semibold leading-snug line-clamp-2">
        {project.title}
      </p>

      {/* Bottom Row: Budget & Sales Assignee */}
      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="font-bold text-amber-400 font-mono text-xs">
          💰 {formatCurrency(project.budget)}
        </span>

        <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1">
          <span>👤</span> {project.assignee}
        </span>
      </div>

      {/* Hover Hint */}
      <div className="text-[9.5px] text-slate-500 group-hover:text-emerald-400 text-right font-medium transition-colors">
        🔍 คลิกเพื่อดูรายละเอียดทั้งหมด ➔
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod03_projects/ProjectDetailModal.js ---
// MODULE: mod03_projects/ProjectDetailModal.js

function ProjectDetailModal({ project, currentUser, stages = window.STAGES || [], members = [], products = [], onClose, onEditProject, onDeleteProject, onAddLog, onBookDemo, onMoveProject }) {
  if (!project) return null;

  const canEdit = window.canEditProject ? window.canEditProject(currentUser, project) : true;
  const stageInfo = stages.find(s => s.id === project.status) || { title: project.status, badgeColor: 'bg-slate-800 text-slate-300' };
  const logs = project.weeklyLogs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${
                project.clientType === 'รัฐบาล' 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {project.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
              </span>

              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border ${stageInfo.badgeColor}`}>
                {stageInfo.title}
              </span>

              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                🎯 โอกาสได้งาน {project.winProbability}%
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 mt-1">
              <span className="text-emerald-400">🏥</span>
              <span>{project.hospitalName}</span>
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {project.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex-shrink-0"
          >
            ✕ ปิด
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">💰 มูลค่างานประมูล</div>
              <div className="text-base font-black text-amber-400 font-mono mt-0.5">{formatCurrency(project.budget)}</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">👤 เซลล์ผู้รับผิดชอบ</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">{project.assignee}</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">🏛️ ประเภทงบประมาณ</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{project.budgetType || 'งบประมาณแผ่นดิน'}</div>
            </div>
          </div>

          {/* Product Info */}
          {project.productName && (
            <div className="bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-800/40 space-y-1">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span>📦 สินค้าและแบรนด์ที่เสนอ:</span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {project.productName} <span className="text-emerald-400 font-normal text-xs">({project.productBrand || 'AERON MEDICAL'})</span>
              </p>
            </div>
          )}

          {/* Demo Schedule Status */}
          <div className="bg-purple-950/40 p-3.5 rounded-2xl border border-purple-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <span>🧪 สถานะทดสอบเครื่อง Demo:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-800/60 text-purple-100 text-[11px]">
                  {project.demoStatus || 'ยังไม่ได้เข้าเดโม่'}
                </span>
              </span>
              <button
                onClick={() => { onClose(); onBookDemo(project); }}
                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <span>🧪 จองคิว Demo เครื่องมือ</span>
              </button>
            </div>
            {project.demoStartDate && (
              <p className="text-xs text-purple-200 font-mono mt-1">
                📅 ช่วงวันนัดหมาย: {project.demoStartDate} ถึง {project.demoEndDate || 'N/A'}
              </p>
            )}
          </div>

          {/* Doctor & Competitors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.decisionMakers && (
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                  <span>👨‍⚕️</span> อาจารย์แพทย์ผู้ตัดสินใจ:
                </span>
                <p className="text-xs text-slate-200 font-medium">{project.decisionMakers}</p>
              </div>
            )}

            {project.competitors && (
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <span>⚔️</span> คู่แข่งในงานประมูล:
                </span>
                <p className="text-xs text-rose-200 font-medium">{project.competitors}</p>
              </div>
            )}
          </div>

          {/* Weekly Progress Logs Timeline */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>📝 ประวัติบันทึกความเคลื่อนไหว (Weekly Log History)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {logs.length} รายการ
                </span>
              </h3>
              <button
                onClick={() => { onClose(); onAddLog(project); }}
                className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30"
              >
                + เพิ่ม Log ใหม่
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs italic">
                ยังไม่มีบันทึกประวัติความเคลื่อนไหวสำหรับโครงการนี้
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-emerald-400">👤 {log.author || project.assignee}</span>
                      <span className="font-mono text-[10.5px]">📅 {log.date}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-snug">{log.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {canEdit ? (
              <>
                <button
                  onClick={() => { onClose(); onEditProject(project); }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1"
                >
                  <span>✏️ แก้ไขข้อมูลโครงการ</span>
                </button>

                <button
                  onClick={() => { onClose(); onBookDemo(project); }}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1"
                >
                  <span>🧪 จองคิว Demo</span>
                </button>

                <button
                  onClick={() => { onClose(); onDeleteProject(project.id); }}
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800 transition-colors"
                >
                  🗑️ ลบโครงการ
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 font-medium bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  🔒 อ่านอย่างเดียว (เฉพาะ OWNER เท่านั้นที่แก้ไขงานผู้อื่นได้)
                </span>
                <button
                  onClick={() => { onClose(); onBookDemo(project); }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  <span>🧪 จองคิว Demo</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod03_projects/ProjectHistoryModal.js ---
// MODULE: mod03_projects/ProjectHistoryModal.js

function ProjectHistoryModal({ project, members = [], stages = window.STAGES || [], products = [], onAddLog, onClose }) {
  const [newLogNote, setNewLogNote] = useState('');
  const [logAuthor, setLogAuthor] = useState(project.assignee);
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const currentStageObj = stages.find(s => s.id === project.status) || { title: project.status, badgeColor: 'bg-slate-800 text-slate-300' };

  // Filtered Logs
  const logs = project.weeklyLogs || [];
  const filteredLogs = useMemo(() => {
    if (!logSearchQuery.trim()) return logs;
    const q = logSearchQuery.toLowerCase();
    return logs.filter(l => (l.note || '').toLowerCase().includes(q) || (l.author || '').toLowerCase().includes(q) || (l.date || '').toLowerCase().includes(q));
  }, [logs, logSearchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;
    onAddLog(project.id, newLogNote, logAuthor);
    setNewLogNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStageObj.badgeColor}`}>
                {currentStageObj.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                🎯 โอกาสได้งาน {project.winProbability}%
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {project.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mt-1">
              <span>🏥 {project.hospitalName}</span>
            </h3>
            <p className="text-sm font-semibold text-emerald-300 line-clamp-1">{project.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">💰 งบประมาณโครงการ:</span>
            <span className="text-amber-400 font-bold text-base font-mono">{formatCurrency(project.budget)}</span>
            <span className="text-[10px] text-slate-500 block">({project.budgetType})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">📦 รุ่นสินค้าที่เสนอ:</span>
            <span className="text-emerald-300 font-bold text-sm line-clamp-1">{project.productName || 'ไม่ระบุ'}</span>
            <span className="text-[10px] text-slate-500 block">จำนวน {project.quantity || 1} ชุด</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">👤 เซลส์ผู้รับผิดชอบ:</span>
            <span className="text-white font-bold text-sm">{project.assignee}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">📅 กำหนดจัดซื้อ:</span>
            <span className="text-cyan-300 font-mono font-bold text-sm">{project.procurementDate || 'N/A'}</span>
          </div>
        </div>

        {/* Quick Add Log Form inside History Modal */}
        <form onSubmit={handleAddSubmit} className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>✍️ บันทึก Progress ความเคลื่อนไหวประจำสัปดาห์ใหม่</span>
            </label>
            <select
              value={logAuthor}
              onChange={(e) => setLogAuthor(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
            >
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="พิมพ์รายละเอียดกิจกรรม / การเข้าพบลูกค้าสัปดาห์นี้..."
              value={newLogNote}
              onChange={(e) => setNewLogNote(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex-shrink-0">
              + บันทึก Log
            </button>
          </div>
        </form>

        {/* History Timeline Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span>📜 ประวัติความเคลื่อนไหวย้อนหลัง (Activity Timeline History)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
                {logs.length} บันทึก
              </span>
            </h4>

            {logs.length > 0 && (
              <input
                type="text"
                placeholder="ค้นหาในประวัติ..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            )}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
              {logSearchQuery ? 'ไม่พบบันทึกที่ตรงกับคำค้นหา' : 'ยังไม่มีประวัติการอัปเดตย้อนหลัง สามารถพิมพ์บันทึกแรกได้ที่ช่องด้านบน'}
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {filteredLogs.map((log, index) => (
                <div key={index} className="relative group">
                  {/* Timeline node icon */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md shadow-emerald-500/50"></div>
                  
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs border-b border-slate-900/80 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-300">👤 {log.author || project.assignee}</span>
                        <span className="text-[10.5px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                          {log.date}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{filteredLogs.length - index}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed pt-1 whitespace-pre-wrap">
                      {log.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extra Information Reference */}
        {(project.decisionMakers || project.competitors || project.torDetails || project.details) && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h5 className="font-bold text-slate-300">📋 ข้อมูลประกอบโครงการ</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              {project.decisionMakers && (
                <div><span className="text-indigo-400 font-semibold">👨‍⚕️ ผู้ตัดสินใจ:</span> {project.decisionMakers}</div>
              )}
              {project.competitors && (
                <div><span className="text-rose-400 font-semibold">⚔️ คู่แข่ง:</span> {project.competitors}</div>
              )}
              {project.dfAmount && (
                <div><span className="text-purple-300 font-semibold">💵 ค่า DF:</span> {project.dfAmount}</div>
              )}
              {project.demoStatus && (
                <div><span className="text-purple-300 font-semibold">🧪 สถานะเดโม่:</span> {project.demoStatus} ({project.demoStartDate || 'N/A'})</div>
              )}
            </div>
            {project.details && (
              <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                "{project.details}"
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700"
          >
            🖨️ พิมพ์ประวัติความเคลื่อนไหว
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod03_projects/ProjectModal.js ---
// MODULE: mod03_projects/ProjectModal.js

function ProjectModal({ project, members = [], stages = window.STAGES || [], products = [], onSave, onClose }) {
  const [formData, setFormData] = useState(project || {
    hospitalName: '',
    clientType: 'รัฐบาล',
    title: '',
    details: '',
    assignee: members[0] ? members[0].name : '',
    productId: products[0] ? products[0].id : '',
    productName: products[0] ? products[0].name : '',
    productCategory: products[0] ? products[0].category : '',
    productBrand: products[0] ? products[0].brand : 'AERON MEDICAL',
    quantity: 1,
    budget: '',
    budgetType: 'งบลงทุน',
    budgetTrend: 'ขาขึ้น',
    procurementDate: '',
    demoStatus: 'ยังไม่ได้เข้าเดโม่',
    demoStartDate: '',
    demoEndDate: '',
    decisionMakers: '',
    dfAmount: '',
    competitors: '',
    winProbability: 50,
    status: stages[0].id
  });

  const handleProductSelect = (productId) => {
    const selected = products.find(p => p.id === productId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        productId: selected.id,
        productName: selected.name,
        productCategory: selected.category,
        productBrand: selected.brand || 'AERON MEDICAL'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.title.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาลและชื่องานโครงการ');
      return;
    }
    onSave({
      ...formData,
      budget: Number(formData.budget) || 0,
      quantity: Number(formData.quantity) || 1,
      winProbability: Number(formData.winProbability) || 50
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
            <span>🏥 {project ? 'แก้ไขข้อมูลโครงการ' : 'เพิ่มโครงการโรงพยาบาลใหม่'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">ชื่อโรงพยาบาล / หน่วยงาน <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทลูกค้า</label>
              <select
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                <option value="รัฐบาล">🏛️ รัฐบาล</option>
                <option value="เอกชน">🏢 เอกชน</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่องาน / รายละเอียดโครงการจัดซื้อ <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น จัดซื้อเครื่องตรวจคลื่นหัวใจไฟฟ้า 12 ลีด 5 เครื่อง"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-3">
            <div className="text-emerald-300 font-semibold flex items-center justify-between">
              <span>📦 สินค้าเครื่องมือแพทย์ที่เสนอ (Central Catalog)</span>
              <span className="text-[10.5px] font-normal text-slate-400">เลือกจากคลังสินค้าส่วนกลาง</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300">เลือกรุ่นสินค้า</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none focus:border-emerald-500"
                >
                  {(products || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand || 'AERON'}) - {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">จำนวนที่จัดซื้อ (ชุด)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono text-center outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">งบประมาณรวม (บาท) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                required
                placeholder="เช่น 4500000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทงบประมาณ</label>
              <select
                value={formData.budgetType}
                onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                {window.BUDGET_TYPES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium outline-none focus:border-emerald-500"
              >
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ขั้นตอนการติดตาม (Stage)</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <label className="font-semibold">โอกาสได้งาน (%)</label>
                <span className="font-mono text-purple-300 font-bold">{formData.winProbability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.winProbability}
                onChange={(e) => setFormData({ ...formData, winProbability: e.target.value })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">กำหนดจัดซื้อจัดจ้างเมื่อไหร่</label>
              <input
                type="date"
                value={formData.procurementDate}
                onChange={(e) => setFormData({ ...formData, procurementDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ค่า DF (Doctor Fee / ดำเนินงาน)</label>
              <input
                type="text"
                placeholder="เช่น 150,000 บาท"
                value={formData.dfAmount}
                onChange={(e) => setFormData({ ...formData, dfAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-purple-200 font-semibold">
              <span>🧪 สถานะและวันนัดเดโม่เครื่อง (Demo Schedule)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">สถานะเดโม่</label>
                <select
                  value={formData.demoStatus}
                  onChange={(e) => setFormData({ ...formData, demoStatus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="ยังไม่ได้เข้าเดโม่">ยังไม่ได้เข้าเดโม่</option>
                  <option value="นัดหมายแล้ว">นัดหมายแล้ว</option>
                  <option value="กำลังเดโม่">กำลังเดโม่</option>
                  <option value="เดโม่เสร็จสิ้น">เดโม่เสร็จสิ้น</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">วันเริ่มนัดเดโม่</label>
                <input
                  type="date"
                  value={formData.demoStartDate}
                  onChange={(e) => setFormData({ ...formData, demoStartDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">ถึงวันที่ (สิ้นสุด)</label>
                <input
                  type="date"
                  value={formData.demoEndDate}
                  onChange={(e) => setFormData({ ...formData, demoEndDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รายชื่ออาจารย์ที่ตัดสินใจ</label>
              <textarea
                rows="2"
                placeholder="เช่น ศ.ดร.นพ.สมศักดิ์ (หัวหน้าภาควิชา), นพ.วิชัย"
                value={formData.decisionMakers}
                onChange={(e) => setFormData({ ...formData, decisionMakers: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">คู่แข่งเป็นใคร (Competitors)</label>
              <textarea
                rows="2"
                placeholder="เช่น แบรนด์ A (บริษัท เมดิคอลไบโอ), แบรนด์ B"
                value={formData.competitors}
                onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows="2"
              placeholder="เงื่อนไขสเปก ข้อตกลงพิเศษ หรือข้อคิดเห็นเพิ่มเติม..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-600/30">
              💾 บันทึกโครงการ
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod03_projects/WeeklyLogModal.js ---
// MODULE: mod03_projects/WeeklyLogModal.js

function WeeklyLogModal({ project, members = [], onSave, onClose }) {
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState(project.assignee);
  
  // Voice Recording & AI Summary States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [aiMode, setAiMode] = useState('summary'); // 'direct' | 'summary'
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Sample Preset Audio Scripts for 1-Click Fast Demonstration
  const sampleVoicePresets = [
    {
      title: '🎙️ ตัวอย่างเสียง 1: เข้ายื่นสเปก TOR & เพิ่มฟังก์ชัน',
      speechText: 'วันนี้เข้าพบอาจารย์รัตนาที่โรงพยาบาลเพื่อส่งร่าง TOR เปรียบเทียบสเปกเครื่อง Ultrasound ตัวเดิม อาจารย์ขอเพิ่มฟังก์ชัน Elastography และขอราคาส่วนลดอุปกรณ์เสริมเพิ่มเติม นัดส่งเอกสารปรับปรุงวันจันทร์หน้า'
    },
    {
      title: '🎙️ ตัวอย่างเสียง 2: นัดสาธิตเครื่อง Demo & ทดสอบเครื่อง',
      speechText: 'เข้าไปติดตั้งเครื่องทดสอบเดโม่ที่ห้องผ่าตัด OR ชั้น 3 คณะแพทย์พอใจความคมชัดของภาพมาก แต่ขอปรับช่วงเวลาสาธิตเพิ่มอีกสามวันเพื่อลองใช้งานกับเคสศัลยกรรมตับ'
    },
    {
      title: '🎙️ ตัวอย่างเสียง 3: ประกวดราคา ชนะงานรออนุมัติ',
      speechText: 'ยื่นซองประกวดราคาอิเล็กทรอนิกส์ e-Bidding เรียบร้อยแล้ว ผลการเปิดซองบริษัทเราได้คะแนนสเปกสูงสุดและเสนอราคาต่ำสุด อยู่ระหว่างรอคณะกรรมการจัดซื้อเสนออธิบดีเซ็นอนุมัติสัญญา'
    }
  ];

  // Recording Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Speech Recognition Setup
  const startVoiceRecording = () => {
    setVoiceError('');
    setTranscript('');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'th-TH';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (err) => {
          console.warn('Speech Recognition notice:', err.error);
          if (err.error === 'not-allowed') {
            setVoiceError('ไมโครโฟนถูกปฏิเสธสิทธิ์ คุณสามารถกดใช้ตัวอย่างเสียงจำลองด้านล่างเพื่อทดสอบได้ครับ');
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (e) {
        setVoiceError('ไม่สามารถเปิดใช้งานไมโครโฟนได้ คุณสามารถใช้ตัวอย่างเสียงจำลองด้านล่างได้ครับ');
        setIsRecording(true);
      }
    } else {
      // Browser Speech API unavailable -> Simulate recording mode
      setIsRecording(true);
    }
  };

  const stopVoiceRecordingAndProcess = (customText = null) => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    setIsRecording(false);
    setIsProcessingAI(true);

    const spokenText = customText || transcript || 'วันนี้เข้าพบอาจารย์หมอเพื่อติดตามเอกสาร TOR และปรับปรุงสเปกเครื่องมือแพทย์ อาจารย์ขอเพิ่มฟังก์ชันพิเศษและขยายเวลารับประกันเป็นสองปี';

    setTimeout(() => {
      if (aiMode === 'direct') {
        // Direct Speech-to-Text Transcribe
        const resultText = (note ? note + '\n\n' : '') + `🎙️ [ถอดความจากเสียง]: ${spokenText}`;
        setNote(resultText);
      } else {
        // AI Executive Summary Mode
        const aiSummaryText = (note ? note + '\n\n' : '') + 
`🤖 [AI สรุปสาระสำคัญจากเสียงพูด]:
📌 รายละเอียดเข้าดำเนินการ: ${spokenText}
🎯 ประเด็นหลัก: เข้าพบอาจารย์เพื่อสรุปข้อกำหนด TOR & การใช้งานเครื่อง
💡 ความต้องการลูกค้าเพิ่มเติม: ขอปรับปรุงคุณสมบัติสเปกและเอกสารประกอบการตัดสินใจ
🚀 Action Items สัปดาห์ถัดไป: จัดเตรียมเอกสารข้อเสนอปรับปรุงและนัดติดตามผลกับฝ่ายจัดซื้อ`;

        setNote(aiSummaryText);
      }
      setIsProcessingAI(false);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    onSave(note, author);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
              📝
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">อัปเดต Progress รายสัปดาห์ (Weekly Log)</h3>
              <p className="text-xs text-emerald-300 font-medium line-clamp-1">🏥 {project.hospitalName} - {project.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* AI Voice Assistant Panel */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <span>🎙️</span> <span>ระบบบันทึกด้วยเสียง & AI ผู้ช่วยสรุปงาน:</span>
            </span>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setAiMode('direct')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  aiMode === 'direct'
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="พิมพ์ถอดข้อความตามเสียงพูดตรงๆ คำต่อคำ"
              >
                🎙️ ถอดคำพูดตรงๆ
              </button>

              <button
                type="button"
                onClick={() => setAiMode('summary')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  aiMode === 'summary'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="ให้ AI วิเคราะห์ จัดหมวดหมู่ และสรุปสาระสำคัญ"
              >
                🤖 ให้ AI สรุปงาน
              </button>
            </div>
          </div>

          {/* Recording / Transcribing Control Bar */}
          {!isRecording && !isProcessingAI ? (
            <button
              type="button"
              onClick={startVoiceRecording}
              className="w-full py-3 bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900 hover:from-indigo-800/80 hover:to-purple-800/80 border border-indigo-500/30 hover:border-indigo-400 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 group"
            >
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <span>กดเพื่อเริ่มพูดบันทึกเสียง ({aiMode === 'summary' ? 'โหมด AI สรุปสาระสำคัญ' : 'โหมดถอดความตามจริง'})</span>
            </button>
          ) : isRecording ? (
            <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>🔴 กำลังอัดเสียงพูด... ({formatTimer(recordingSeconds)})</span>
              </div>
              <button
                type="button"
                onClick={() => stopVoiceRecordingAndProcess()}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                ⏹️ หยุดอัด & ประมวลผล
              </button>
            </div>
          ) : (
            <div className="bg-indigo-950/40 border border-indigo-500/40 p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-indigo-300">
              <span className="animate-spin">⏳</span>
              <span>กำลังประมวลผลด้วย AI Smart Engine...</span>
            </div>
          )}

          {/* Realtime Live Speech Transcript Preview */}
          {transcript && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11.5px] text-emerald-300 font-mono">
              <span className="text-slate-400 font-sans">🔊 เสียงที่พูดขณะนี้:</span> "{transcript}"
            </div>
          )}

          {voiceError && (
            <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2 rounded-xl border border-amber-800/50">
              ⚠️ {voiceError}
            </div>
          )}

          {/* Preset Audio Scripts for 1-Click Fast Testing */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
              ⚡ ตัวอย่างเสียงทดสอบด่วน (1-Click Demo Voice Preset):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {sampleVoicePresets.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => stopVoiceRecordingAndProcess(preset.speechText)}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 hover:text-white transition-colors truncate"
                  title={preset.speechText}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs flex-1 flex flex-col">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ผู้บันทึกข้อความ</label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500"
            >
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-300">
                รายละเอียดความคืบหน้าสัปดาห์นี้ <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10.5px] text-slate-400">
                (พิมพ์แก้ไขหรือให้ AI ช่วยเติมข้อความได้)
              </span>
            </div>
            
            <textarea
              rows="5"
              required
              placeholder="ระบุสิ่งที่เข้าดำเนินการ เช่น เข้าพบอาจารย์, ยื่นเอกสาร TOR, ส่งเครื่องเดโม่ หรือกดปุ่มอัดเสียงด้านบน..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 outline-none focus:border-emerald-500 font-sans leading-relaxed text-xs resize-none"
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
              <span>💾 บันทึก Log</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/MessengerDispatchView.js ---
// MODULE: mod04_logistics/MessengerDispatchView.js

function MessengerDispatchView({ currentUser, onLogout }) {
  const [jobs, setJobs] = useState(() => [
    {
      id: 'MSG-2026-101',
      hospitalName: 'โรงพยาบาลศิริราช',
      department: 'แผนกศัลยกรรม (OR ชั้น 3)',
      packageType: '📦 เอกสารสัญญาซื้อขาย TOR & ใบเสนอราคาชุดจริง',
      recipient: 'ศ.ดร.นพ.สมศักดิ์ (หัวหน้าภาควิชา)',
      phone: '081-999-8888',
      salesPerson: 'สมชาย สายลุย',
      status: '🚚 อยู่ระหว่างจัดส่ง',
      updatedAt: '2026-08-01 10:30',
      signature: 'อัมพร (ผู้ช่วยรับแทน)'
    },
    {
      id: 'MSG-2026-102',
      hospitalName: 'โรงพยาบาลรามาธิบดี',
      department: 'แผนกจัดซื้อ ชั้น 4',
      packageType: '📄 ใบสั่งซื้อ PO Vendor & เอกสารประกันซอง',
      recipient: 'คุณปียะนันท์ (ฝ่ายจัดซื้อ)',
      phone: '082-555-1234',
      salesPerson: 'สมหญิง ใจดี',
      status: '📦 รอดำเนินการ',
      updatedAt: '2026-08-01 09:00',
      signature: ''
    },
    {
      id: 'MSG-2026-103',
      hospitalName: 'โรงพยาบาลบำรุงราษฎร์',
      department: 'ศูนย์เครื่องมือแพทย์',
      packageType: '🔧 เครื่องส่งซ่อม Repair Unit & ใบรับประกัน',
      recipient: 'นพ.ชัยวัฒน์ (ผู้อำนวยการแพทย์)',
      phone: '089-111-2222',
      salesPerson: 'อนันต์ ผู้โชคดี',
      status: '📌 ส่งมอบสำเร็จ',
      updatedAt: '2026-08-01 14:15',
      signature: 'นพ.ชัยวัฒน์ (เซ็นรับแล้ว)'
    }
  ]);

  const [selectedJob, setSelectedJob] = useState(null);

  const handleUpdateStatus = (jobId, newStatus) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          updatedAt: new Date().toLocaleString('th-TH')
        };
      }
      return j;
    }));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-3xl shadow-inner">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MESSENGER DISPATCH MOBILE
              </span>
              <span className="text-xs text-slate-400 font-medium">ผู้เข้าใช้งาน: <strong>{currentUser ? currentUser.name : 'พนักงานส่งเอกสาร'}</strong></span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">ระบบรับ-ส่งเอกสาร & จัดส่งสินค้าเครื่องมือแพทย์</h2>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
        >
          <span>🔒 ออกจากระบบ</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📦 รอดำเนินการ</div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {jobs.filter(j => j.status === '📦 รอดำเนินการ').length}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">🚚 ระหว่างจัดส่ง</div>
          <div className="text-2xl font-black font-mono text-blue-400">
            {jobs.filter(j => j.status === '🚚 อยู่ระหว่างจัดส่ง').length}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📌 ส่งมอบสำเร็จ</div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {jobs.filter(j => j.status === '📌 ส่งมอบสำเร็จ').length}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
          <span>📋 รายการเอกสาร & พัสดุที่ต้องจัดส่งวันนี้</span>
        </h3>

        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {job.id}
                  </span>
                  <h4 className="font-bold text-white text-base mt-1 flex items-center gap-2">
                    <span>🏥</span> <span>{job.hospitalName}</span>
                  </h4>
                  <p className="text-xs text-slate-400">{job.department}</p>
                </div>

                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  job.status === '📌 ส่งมอบสำเร็จ' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  job.status === '🚚 อยู่ระหว่างจัดส่ง' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                <div className="font-semibold text-emerald-300">{job.packageType}</div>
                <div className="text-slate-300">👨‍⚕️ ผู้รับ: <strong className="text-white">{job.recipient}</strong> (📞 {job.phone})</div>
                <div className="text-slate-400">💼 เซลส์เจ้าของงาน: {job.salesPerson}</div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">อัปเดตล่าสุด: {job.updatedAt}</span>

                <div className="flex items-center gap-2">
                  {job.status !== '🚚 อยู่ระหว่างจัดส่ง' && job.status !== '📌 ส่งมอบสำเร็จ' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, '🚚 อยู่ระหว่างจัดส่ง')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md text-xs"
                    >
                      🚚 เริ่มจัดส่ง
                    </button>
                  )}

                  {job.status !== '📌 ส่งมอบสำเร็จ' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, '📌 ส่งมอบสำเร็จ')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md text-xs"
                    >
                      📌 บันทึกส่งมอบสำเร็จ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/ProductCatalogView.js ---
// MODULE: mod04_logistics/ProductCatalogView.js

function ProductCatalogView({ products = [], demoBookings = [], onOpenNewProduct, onEditProduct, onDeleteProduct, onOpenRepairModal }) {
  const [expandedProduct, setExpandedProduct] = useState(null);

  const statusConfig = {
    'พร้อมใช้งาน': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400', icon: '✅' },
    'ส่งซ่อม':      { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   dot: 'bg-amber-400',   icon: '🔧' },
    'เสีย':         { color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',       dot: 'bg-rose-400',    icon: '❌' },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            📦
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลสินค้า Demo (Central Demo Catalog)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AERON MEDICAL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ประเภทสินค้า รายชื่อรุ่นเครื่องมือแพทย์ และสถานะเครื่องสาธิต (Demo Units) พร้อมอุปกรณ์ประกอบในชุด
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ เพิ่มชนิดสินค้าใหม่</span>
        </button>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(products || []).map(p => {
          const activeBookingsCount = demoBookings.filter(b => b.productId === p.id).length;
          const units = p.demoUnits || (p.demoSerialNumbers || []).map(sn => ({ sn, status: 'พร้อมใช้งาน', location: '', accessories: '' }));
          const readyCount = units.filter(u => u.status === 'พร้อมใช้งาน').length;
          const repairCount = units.filter(u => u.status === 'ส่งซ่อม').length;
          const brokenCount = units.filter(u => u.status === 'เสีย').length;
          const isExpanded = expandedProduct === p.id;

          return (
            <div key={p.id} className="glass-card p-5 rounded-2xl space-y-3 border border-slate-800 hover:border-emerald-500/40 transition-colors relative">
              <div className="flex items-start justify-between">
                <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {p.category}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {formatCurrency(p.price)}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{p.name}</h3>
                <div className="text-xs text-indigo-300 font-medium">แบรนด์: {p.brand || 'AERON MEDICAL'}</div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {p.description || 'ไม่มีรายละเอียดสินค้า'}
              </p>

              {/* Demo Stock Summary */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>🧪 เครื่องสาธิตส่วนกลาง:</span>
                  <span className="font-bold text-emerald-400 font-mono">{units.length} เครื่อง</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>📅 ถูกจองคิวขณะนี้:</span>
                  <span className="font-mono text-purple-300 font-semibold">{activeBookingsCount} คิว</span>
                </div>

                {/* Status Summary Pills */}
                <div className="flex gap-1.5 flex-wrap pt-1 border-t border-slate-800">
                  {readyCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✅ พร้อมใช้ {readyCount}
                    </span>
                  )}
                  {repairCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🔧 ส่งซ่อม {repairCount}
                    </span>
                  )}
                  {brokenCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      ❌ เสีย {brokenCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Expand/Collapse Demo Units & Components Detail */}
              <button
                onClick={() => setExpandedProduct(isExpanded ? null : p.id)}
                className="w-full text-xs py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center gap-2 shadow-sm font-semibold active:scale-[0.99]"
              >
                <span>{isExpanded ? '▲ ซ่อนสเปก & รายการอุปกรณ์' : '📑 ดูตารางอุปกรณ์ในชุด & เครื่องสาธิต'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                  {(p.masterChecklistItems || p.accessoriesList || []).length} รายการ
                </span>
              </button>

              {/* Product Details & Excel Equipment Table (Expanded) */}
              {isExpanded && (
                <div className="space-y-3.5 pt-2 animate-fade-in">
                  
                  {/* 📊 1. Excel-style Components & Accessories Table */}
                  <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-700/80 space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <span>📑</span> <span>ตารางรายการชิ้นส่วน & อุปกรณ์ประกอบในชุด ({ (p.masterChecklistItems || p.accessoriesList || []).length })</span>
                      </span>
                      <button
                        onClick={() => onEditProduct(p)}
                        className="text-[10.5px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1"
                      >
                        <span>✏️ แก้ไขสเปก</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-left text-[11px] border-collapse min-w-[550px]">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                          <tr>
                            <th className="p-1.5 px-2 text-center w-10 border-r border-slate-800">ลำดับ</th>
                            <th className="p-1.5 px-2 border-r border-slate-800 min-w-[140px]">รายการอุปกรณ์</th>
                            <th className="p-1.5 px-2 border-r border-slate-800 w-24">Item No.</th>
                            <th className="p-1.5 px-2 border-r border-slate-800 w-28">Serial No. (S/N)</th>
                            <th className="p-1.5 px-2 text-center w-14 border-r border-slate-800">จำนวน</th>
                            <th className="p-1.5 px-2 text-center w-16 border-r border-slate-800">หน่วย</th>
                            <th className="p-1.5 px-2 min-w-[120px]">หมายเหตุ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-950/60 font-sans">
                          {(!p.masterChecklistItems && !p.accessoriesList) || (p.masterChecklistItems || p.accessoriesList || []).length === 0 ? (
                            <tr>
                              <td colSpan="7" className="p-4 text-center text-slate-500 italic">
                                ยังไม่มีการระบุตารางชิ้นส่วนอุปกรณ์ กด "แก้ไขสเปก" เพื่อเพิ่มตาราง Excel
                              </td>
                            </tr>
                          ) : (
                            (p.masterChecklistItems || p.accessoriesList || []).map((item, idx) => (
                              <tr key={item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="p-1.5 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">{idx + 1}</td>
                                <td className="p-1.5 px-2 font-medium text-slate-200 border-r border-slate-800/80">{item.name}</td>
                                <td className="p-1.5 px-2 font-mono text-indigo-300 border-r border-slate-800/80">{item.itemNo || item.partNo || '-'}</td>
                                <td className="p-1.5 px-2 font-mono text-amber-300 border-r border-slate-800/80">{item.serialNo || '-'}</td>
                                <td className="p-1.5 px-2 text-center font-mono font-bold text-amber-300 border-r border-slate-800/80">{item.qty || 1}</td>
                                <td className="p-1.5 px-2 text-center text-slate-300 border-r border-slate-800/80">{item.unit || 'ชิ้น'}</td>
                                <td className="p-1.5 px-2 text-slate-400 text-[10.5px]">{item.note || '-'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 🧪 2. Demo Units List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                        <span>🧪</span> <span>เครื่องสาธิตส่วนกลาง ({units.length} เครื่อง)</span>
                      </span>
                    </div>
                    {units.map((unit, idx) => {
                      const cfg = statusConfig[unit.status] || statusConfig['พร้อมใช้งาน'];
                      return (
                        <div key={idx} className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 space-y-2 text-[11px]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-amber-300 text-[11px]">🔖 SN: {unit.sn || 'ไม่ระบุ'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${cfg.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                              {unit.status}
                            </span>
                          </div>

                          <div className="flex items-start gap-1.5 text-slate-400">
                            <span className="shrink-0 mt-0.5">📍</span>
                            <span className="leading-snug">
                              <span className="text-slate-500 mr-1">สถานที่อยู่ปัจจุบัน:</span>
                              <span className="text-slate-200 font-medium">{unit.location || 'สำนักงาน AERON'}</span>
                            </span>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => onOpenRepairModal(p, unit)}
                              className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 text-[10.5px] font-semibold rounded-lg border border-rose-700/50 flex items-center gap-1"
                            >
                              <span>🔧 แจ้งเปิดใบส่งซ่อมเครื่องนี้</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Product Action Buttons (Edit Product & Delete Product) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => onEditProduct(p)}
                  className="px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 font-semibold rounded-xl border border-indigo-700/50 flex items-center gap-1 transition-all"
                >
                  <span>✏️ แก้ไขสินค้า / เครื่อง Demo</span>
                </button>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs px-2.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 transition-all"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/ProductModal.js ---
// MODULE: mod04_logistics/ProductModal.js

function ProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (product) {
      return {
        id: product.id,
        category: product.category || window.PRODUCT_CATEGORIES[0],
        name: product.name || '',
        brand: product.brand || 'AERON MEDICAL',
        price: product.price || '',
        description: product.description || ''
      };
    }
    return {
      category: window.PRODUCT_CATEGORIES[0],
      name: '',
      brand: 'AERON MEDICAL',
      price: '',
      description: ''
    };
  });

  // 📊 Excel-style Product Components & Accessories Breakdown Table State
  const [componentsList, setComponentsList] = useState(() => {
    if (product && Array.isArray(product.masterChecklistItems) && product.masterChecklistItems.length > 0) {
      return product.masterChecklistItems.map(item => ({
        id: item.id || 'comp_' + Math.random().toString(36).substr(2, 6),
        name: item.name || '',
        itemNo: item.itemNo || item.partNo || '',
        serialNo: item.serialNo || '',
        qty: item.qty !== undefined ? item.qty : 1,
        unit: item.unit || 'ชิ้น',
        note: item.note || ''
      }));
    }
    if (product && Array.isArray(product.accessoriesList) && product.accessoriesList.length > 0) {
      return product.accessoriesList.map(item => ({
        id: item.id || 'comp_' + Math.random().toString(36).substr(2, 6),
        name: item.name || '',
        itemNo: item.itemNo || item.partNo || '',
        serialNo: item.serialNo || '',
        qty: item.qty !== undefined ? item.qty : 1,
        unit: item.unit || 'ชิ้น',
        note: item.note || ''
      }));
    }
    // Default starting rows
    return [
      { id: 'comp_1', name: 'ตัวเครื่องหลัก (Main Unit)', itemNo: 'MAIN-01', serialNo: '', qty: 1, unit: 'เครื่อง', note: 'ตรวจ QC พร้อมใช้งาน' },
      { id: 'comp_2', name: 'สายไฟหลัก Power Cord & AC Adapter', itemNo: 'PWR-01', serialNo: '', qty: 1, unit: 'ชุด', note: '' },
      { id: 'comp_3', name: 'คู่มือการใช้งานภาษาไทย', itemNo: 'MAN-TH', serialNo: '', qty: 1, unit: 'เล่ม', note: '' }
    ];
  });

  const handleAddComponent = () => {
    setComponentsList([
      ...componentsList,
      { id: 'comp_' + Date.now(), name: '', itemNo: '', serialNo: '', qty: 1, unit: 'ชิ้น', note: '' }
    ]);
  };

  const handleRemoveComponent = (idx) => {
    setComponentsList(componentsList.filter((_, i) => i !== idx));
  };

  const handleComponentChange = (idx, field, value) => {
    setComponentsList(componentsList.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const [demoUnits, setDemoUnits] = useState(() => {
    if (product && product.demoUnits && product.demoUnits.length > 0) {
      return product.demoUnits.map(u => ({ ...u }));
    }
    if (product && product.demoSerialNumbers && product.demoSerialNumbers.length > 0) {
      return product.demoSerialNumbers.map(sn => ({ sn, status: 'พร้อมใช้งาน', location: '', accessories: '' }));
    }
    return [{ sn: '', status: 'พร้อมใช้งาน', location: '', accessories: '' }];
  });

  const handleAddUnit = () => {
    setDemoUnits([...demoUnits, { sn: '', status: 'พร้อมใช้งาน', location: '', accessories: '' }]);
  };

  const handleRemoveUnit = (idx) => {
    setDemoUnits(demoUnits.filter((_, i) => i !== idx));
  };

  const handleUnitChange = (idx, field, value) => {
    setDemoUnits(demoUnits.map((u, i) => i === idx ? { ...u, [field]: value } : u));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อรุ่นสินค้า');
      return;
    }
    const validUnits = demoUnits.filter(u => u.sn && u.sn.trim());
    const validComponents = componentsList.filter(c => c.name && c.name.trim());
    const autoAccessoriesSummary = validComponents.map(c => `${c.name} (${c.qty} ${c.unit})`).join(', ');

    onSave({
      ...formData,
      price: Number(formData.price) || 0,
      accessoriesList: validComponents,
      masterChecklistItems: validComponents.map(c => ({
        id: c.id,
        name: c.name,
        itemNo: c.itemNo || '',
        partNo: c.itemNo || '',
        serialNo: c.serialNo || '',
        qty: Number(c.qty) || 1,
        unit: c.unit || 'ชิ้น',
        note: c.note || '',
        condition: 'สมบูรณ์'
      })),
      demoUnitsAvailable: validUnits.length || 1,
      demoSerialNumbers: validUnits.map(u => u.sn),
      demoUnits: validUnits.map(u => ({
        ...u,
        accessories: u.accessories || autoAccessoriesSummary
      }))
    });
  };

  return (
    <div className="fixed inset-0 z-[700] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-modal max-h-[94vh] overflow-y-auto text-slate-100">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30 shadow-md">
              📦
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {product ? 'แก้ไขข้อมูลสินค้า & รายการอุปกรณ์' : 'เพิ่มชนิดสินค้าใหม่'}
              </h3>
              <p className="text-xs text-slate-400">บันทึกข้อมูลสเปก, ตารางแจกแจงอุปกรณ์ประกอบ และเครื่องสาธิต (Central Catalog)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs">✕ ปิด</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
              <span>🏷️</span> <span>ข้อมูลพื้นฐานสินค้า</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">หมวดหมู่/ประเภทสินค้า</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none"
                >
                  {window.PRODUCT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">แบรนด์/ผู้ผลิต</label>
                <input
                  type="text"
                  placeholder="เช่น AERON MEDICAL"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">ชื่อรุ่นสินค้า (Model Code) <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="เช่น AERON Cardio 12L-AI, BJ3500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">ราคาขายประมาณการ (บาท THB)</label>
                <input
                  type="number"
                  placeholder="เช่น 900000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none font-mono font-bold text-amber-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รายละเอียดจุดเด่น / สเปกทั่วไป</label>
              <textarea
                rows="2"
                placeholder="คำอธิบายจุดเด่น สเปกการทำงานคร่าวๆ ของตัวเครื่อง..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none"
              ></textarea>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 📊 Section 2: Excel-Style Components Breakdown Table */}
          {/* ========================================================= */}
          <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-700/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <h4 className="font-bold text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>📑</span> <span>ตารางรายการชิ้นส่วน & อุปกรณ์ประกอบในชุด ({componentsList.length} รายการ)</span>
                </h4>
                <p className="text-[11px] text-slate-400">ระบุรายละเอียดแยก Item No., Serial No. (S/N), จำนวน และหมายเหตุแบบชัดเจน</p>
              </div>

              <button
                type="button"
                onClick={handleAddComponent}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95"
              >
                <span>➕ เพิ่มแถวอุปกรณ์</span>
              </button>
            </div>

            {/* Excel-style Table Grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2 px-2.5 text-center w-10 border-r border-slate-800">ลำดับ</th>
                    <th className="p-2 px-3 border-r border-slate-800 min-w-[170px]">ชื่อรายการชิ้นส่วน / อุปกรณ์ <span className="text-rose-400">*</span></th>
                    <th className="p-2 px-2.5 border-r border-slate-800 w-28">Item No. (รหัส)</th>
                    <th className="p-2 px-2.5 border-r border-slate-800 w-32">Serial No. (S/N)</th>
                    <th className="p-2 px-2 text-center w-16 border-r border-slate-800">จำนวน</th>
                    <th className="p-2 px-2 text-center w-24 border-r border-slate-800">หน่วยนับ</th>
                    <th className="p-2 px-3 border-r border-slate-800 min-w-[130px]">หมายเหตุ (Remarks)</th>
                    <th className="p-2 px-2 text-center w-10">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {componentsList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-slate-500 italic">
                        ยังไม่มีรายการอุปกรณ์ประกอบ กดปุ่ม "+ เพิ่มแถวอุปกรณ์" ด้านบนเพื่อเริ่มกรอก
                      </td>
                    </tr>
                  ) : (
                    componentsList.map((comp, idx) => (
                      <tr key={comp.id || idx} className="hover:bg-slate-800/50 transition-colors">
                        
                        {/* 1. ลำดับ */}
                        <td className="p-2 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">
                          {idx + 1}
                        </td>

                        {/* 2. ชื่อรายการชิ้นส่วน */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            required
                            placeholder="เช่น สาย Patient Cable 10-Lead, ลีดดูดสูญญากาศ"
                            value={comp.name}
                            onChange={(e) => handleComponentChange(idx, 'name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 text-slate-100 outline-none text-xs focus:border-emerald-500 font-medium"
                          />
                        </td>

                        {/* 3. Item No. */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            placeholder="เช่น CBL-10L"
                            value={comp.itemNo || ''}
                            onChange={(e) => handleComponentChange(idx, 'itemNo', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 font-mono text-indigo-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 4. Serial No. (S/N) */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            placeholder="เช่น SN-884102"
                            value={comp.serialNo || ''}
                            onChange={(e) => handleComponentChange(idx, 'serialNo', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 font-mono text-amber-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 5. จำนวน */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="number"
                            min="1"
                            value={comp.qty}
                            onChange={(e) => handleComponentChange(idx, 'qty', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 text-center font-mono font-bold text-amber-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 6. หน่วยนับ */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            list="units-datalist"
                            placeholder="เครื่อง/เส้น/ลูก"
                            value={comp.unit}
                            onChange={(e) => handleComponentChange(idx, 'unit', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 text-center text-slate-200 outline-none text-xs focus:border-emerald-500 font-medium"
                          />
                        </td>

                        {/* 7. หมายเหตุ */}
                        <td className="p-1.5 px-2 border-r border-slate-800/80">
                          <input
                            type="text"
                            placeholder="เช่น สภาพสมบูรณ์ / พร้อมใช้งาน"
                            value={comp.note || ''}
                            onChange={(e) => handleComponentChange(idx, 'note', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-1.5 px-2 text-slate-300 outline-none text-xs focus:border-emerald-500"
                          />
                        </td>

                        {/* 8. ลบแถว */}
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                            title="ลบแถวนี้"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <datalist id="units-datalist">
              <option value="เครื่อง" />
              <option value="ชิ้น" />
              <option value="เส้น" />
              <option value="ลูก" />
              <option value="ม้วน" />
              <option value="ชุด" />
              <option value="เล่ม" />
              <option value="ใบ" />
              <option value="กล่อง" />
            </datalist>
          </div>

          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-purple-300 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🧪</span> <span>หมายเลขเครื่องสาธิต Demo ประจำการ ({demoUnits.length} เครื่อง)</span>
                </h4>
                <p className="text-[10.5px] text-slate-400">กำหนดหมายเลข Serial Number และสถานที่เก็บเครื่องสาธิต</p>
              </div>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-3 py-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700 rounded-xl text-xs font-bold shadow-md flex items-center gap-1 transition-all"
              >
                <span>➕ เพิ่มเครื่อง Demo</span>
              </button>
            </div>

            <div className="space-y-3">
              {demoUnits.map((unit, idx) => (
                <div key={idx} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 relative hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <span>📦</span> <span>เครื่องเดโม่ตัวที่ {idx + 1}</span>
                    </span>
                    {demoUnits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(idx)}
                        className="text-rose-400 text-xs hover:text-rose-300 px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center gap-1"
                      >
                        <span>🗑️ ลบ</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">หมายเลข SN เครื่อง <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น AERON-DEMO-ECG-01"
                        value={unit.sn}
                        onChange={(e) => handleUnitChange(idx, 'sn', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-mono text-xs focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">สถานะเครื่องเดโม่</label>
                      <select
                        value={unit.status || 'พร้อมใช้งาน'}
                        onChange={(e) => handleUnitChange(idx, 'status', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-semibold"
                      >
                        <option value="พร้อมใช้งาน">✅ พร้อมใช้งาน</option>
                        <option value="ส่งซ่อม">🔧 ส่งซ่อม</option>
                        <option value="เสีย">❌ เสีย</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">📍 สถานที่ประจำการเครื่องขณะนี้</label>
                    <input
                      type="text"
                      placeholder="เช่น สำนักงาน AERON กรุงเทพฯ / โรงพยาบาลศิริราช (ยืมสาธิต)"
                      value={unit.location || ''}
                      onChange={(e) => handleUnitChange(idx, 'location', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium">ยกเลิก</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 active:scale-95 transition-all">
              💾 บันทึกข้อมูลสินค้า & ตารางอุปกรณ์
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/RepairServiceView.js ---
// MODULE: mod04_logistics/RepairServiceView.js

function RepairServiceView({ repairTickets = [], products = [], members = [], onOpenNewTicket, onEditTicket, onDeleteTicket, onViewInCatalog }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return (repairTickets || []).filter(t => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mNo = (t.ticketNumber || '').toLowerCase().includes(q);
        const mProd = (t.productName || '').toLowerCase().includes(q);
        const mSN = (t.sn || '').toLowerCase().includes(q);
        const mHosp = (t.lastHospital || '').toLowerCase().includes(q);
        const mSales = (t.salesPerson || '').toLowerCase().includes(q);
        const mVendor = (t.repairVendor || '').toLowerCase().includes(q);
        return mNo || mProd || mSN || mHosp || mSales || mVendor;
      }
      return true;
    });
  }, [repairTickets, filterCategory, filterStatus, searchQuery]);

  // Metrics KPI
  const totalTickets = filteredTickets.length;
  const inRepairCount = filteredTickets.filter(t => t.status === 'ส่งซ่อมอยู่' || t.status === 'รอส่งซ่อม' || t.status === 'ระหว่างขนส่ง').length;
  const completedCount = filteredTickets.filter(t => t.status === 'ซ่อมเสร็จแล้ว' || t.status === 'ส่งคืนลูกค้า').length;
  const totalRepairCost = filteredTickets.reduce((sum, t) => sum + (Number(t.repairCost) || 0), 0);
  const totalShippingCost = filteredTickets.reduce((sum, t) => sum + (Number(t.shippingCost) || 0), 0);

  const statusColors = {
    'รอส่งซ่อม': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'ส่งซ่อมอยู่': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'ระหว่างขนส่ง': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'ซ่อมเสร็จแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'ส่งคืนลูกค้า': 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  };

  const categoryColors = {
    'สินค้า Demo': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'สินค้าส่งซ่อมจาก รพ': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'สินค้าอยู่ในประกันของ บริษัท': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'สินค้า นอกประกันของบริษัท': 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-2xl shadow-inner">
            🔧
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ศูนย์ซ่อม & เคลมสินค้า (Repair Service & Claims)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                AERON SERVICE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามตารางสินค้าส่งซ่อม ทั้งเครื่อง Demo, สินค้าส่งซ่อมจาก รพ., สินค้าในประกัน และนอกประกัน
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewTicket(null)}
          className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ แจ้งเปิดใบส่งซ่อมใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🔧 รวมเคสส่งซ่อมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight font-mono">
            {totalTickets} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ประวัติงานซ่อมและเคลมสินค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>⏳ อยู่ระหว่างการซ่อม/ขนส่ง</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">⚙️</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {inRepairCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ยังไม่ได้รับของคืนจากศูนย์ซ่อม
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>✅ ซ่อมเสร็จ / ส่งคืนแล้ว</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">🎉</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {completedCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            พร้อมกลับมาใช้งาน / ส่งคืน รพ.
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💰 รวมค่าใช้จ่ายซ่อม & ขนส่ง</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalRepairCost + totalShippingCost)}
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>ค่าซ่อม: {formatShortCurrency(totalRepairCost)}</span>
            <span>ค่าส่ง: {formatShortCurrency(totalShippingCost)}</span>
          </div>
        </div>

      </div>

      {/* Controls & Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางรายการสินค้าส่งซ่อม (Repair Orders List)</span>
            </h3>
            <p className="text-xs text-slate-400">ตรวจสอบรายละเอียดอาการเสีย สถานะการซ่อม และอุปกรณ์ในเซ็ต</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา เลขซ่อม / SN / รุ่น / รพ...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตาม Category ทุกประเภท</option>
              {(window.REPAIR_CATEGORIES || []).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะ</option>
              {(window.REPAIR_STATUSES || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Repair Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ซ่อม / ประเภท</th>
                <th className="p-3">รุ่นสินค้า & หมายเลข SN</th>
                <th className="p-3">ชิ้นส่วนส่งซ่อม & อาการเสีย</th>
                <th className="p-3">รพ.ใช้ล่าสุด & ผู้ใช้ / เซลส์</th>
                <th className="p-3">ส่งซ่อมกับเจ้าไหน / ที่อยู่เครื่อง</th>
                <th className="p-3 text-right">ค่าซ่อม / ขนส่ง</th>
                <th className="p-3 text-center">สถานะ</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการสินค้าส่งซ่อมตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const catStyle = categoryColors[ticket.category] || 'bg-slate-800 text-slate-300';
                  const stStyle = statusColors[ticket.status] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Ticket Number & Category */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-rose-300">{ticket.ticketNumber}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-semibold border ${catStyle}`}>
                          {ticket.category}
                        </span>
                        <div className="text-[9.5px] text-slate-400 font-mono mt-1">📅 ส่ง: {ticket.sentDate || 'N/A'}</div>
                        {ticket.returnedDate && (
                          <div className="text-[9.5px] text-emerald-300 font-mono">📅 รับ: {ticket.returnedDate}</div>
                        )}
                      </td>

                      {/* Product Name & SN */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{ticket.productName}</div>
                        <div className="text-[10px] text-slate-400">{ticket.productCategory}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-amber-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          SN: {ticket.sn || 'ไม่ระบุ'}
                        </div>
                      </td>

                      {/* Repaired Items & Issue */}
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-slate-200 leading-snug">
                          🧰 <span className="text-slate-300">{ticket.repairedItems || 'ตัวเครื่องหลัก'}</span>
                        </div>
                        <div className="text-[11px] text-rose-300/90 italic mt-1 line-clamp-2 bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                          ❌ "{ticket.issueDescription}"
                        </div>
                      </td>

                      {/* Last Hospital & User / Sales */}
                      <td className="p-3">
                        <div className="font-semibold text-emerald-300">🏥 {ticket.lastHospital || 'สำนักงาน AERON'}</div>
                        {ticket.lastUser && (
                          <div className="text-[10.5px] text-slate-300">👤 ผู้ใช้: {ticket.lastUser}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">💼 เซลส์: {ticket.salesPerson}</div>
                      </td>

                      {/* Repair Vendor & Location */}
                      <td className="p-3">
                        <div className="font-semibold text-purple-300">🏭 {ticket.repairVendor || 'ศูนย์ซ่อมทั่วไป'}</div>
                        <div className="text-[10.5px] text-slate-300 flex items-start gap-1 mt-0.5">
                          <span>📍</span> <span className="line-clamp-2">{ticket.location || 'ศูนย์ซ่อม'}</span>
                        </div>
                      </td>

                      {/* Costs */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400">{formatCurrency(ticket.repairCost)}</div>
                        {ticket.shippingCost > 0 && (
                          <div className="text-[10px] text-slate-400">+ ส่ง {formatCurrency(ticket.shippingCost)}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${stStyle}`}>
                          {ticket.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-y-1">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => onEditTicket(ticket)}
                            className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                            title="แก้ไขใบส่งซ่อม"
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                            title="ลบ"
                          >
                            🗑️
                          </button>
                        </div>
                        {ticket.category === 'สินค้า Demo' && (
                          <button
                            onClick={() => onViewInCatalog(ticket.productName)}
                            className="w-full text-[10px] px-2 py-0.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded border border-emerald-700/50 block font-semibold"
                            title="ไปที่หน้าคลัง Demo"
                          >
                            📦 ดูในคลัง Demo
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/RepairTicketModal.js ---
// MODULE: mod04_logistics/RepairTicketModal.js

function RepairTicketModal({ ticket, products = [], members = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (ticket) return { ...ticket };
    const firstProd = products[0] || {};
    const firstSN = firstProd.demoSerialNumbers ? firstProd.demoSerialNumbers[0] : '';
    return {
      ticketNumber: `REP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      productCategory: firstProd.category || window.PRODUCT_CATEGORIES[0],
      productName: firstProd.name || '',
      sn: firstSN || '',
      repairedItems: 'ตัวเครื่องหลัก และ อุปกรณ์มาตรฐาน',
      issueDescription: '',
      lastHospital: '',
      lastUser: '',
      salesPerson: members[0] ? members[0].name : '',
      repairVendor: 'AERON Service Center (กรุงเทพฯ)',
      sentDate: new Date().toISOString().split('T')[0],
      returnedDate: '',
      repairCost: 0,
      shippingCost: 0,
      category: window.REPAIR_CATEGORIES[0],
      status: window.REPAIR_STATUSES[0],
      location: 'ศูนย์ซ่อม AERON Service Center (กรุงเทพฯ)'
    };
  });

  const handleProductSelect = (pName) => {
    const p = products.find(prod => prod.name === pName);
    if (p) {
      const snList = p.demoSerialNumbers || [];
      setFormData(prev => ({
        ...prev,
        productName: p.name,
        productCategory: p.category,
        sn: snList[0] || prev.sn
      }));
    } else {
      setFormData(prev => ({ ...prev, productName: pName }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.issueDescription.trim()) {
      alert('กรุณากรอกชื่อรุ่นสินค้าและอาการเสีย');
      return;
    }
    onSave({
      ...formData,
      repairCost: Number(formData.repairCost) || 0,
      shippingCost: Number(formData.shippingCost) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🔧 {ticket ? 'แก้ไขใบส่งซ่อม' : 'เปิดใบส่งซ่อมใหม่ (Repair Service Ticket)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ใบส่งซ่อม <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.ticketNumber}
                onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-rose-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category สินค้าที่ส่งซ่อม</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              >
                {window.REPAIR_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้าที่ส่งซ่อม <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                list="products-list"
                placeholder="เลือกหรือพิมพ์ชื่อรุ่นสินค้า"
                value={formData.productName}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
              <datalist id="products-list">
                {(products || []).map(p => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลข SN เครื่อง</label>
              <input
                type="text"
                placeholder="เช่น AERON-DEMO-ECG-01"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชิ้นส่วน หรือ อุปกรณ์ในเซ็ต ที่ส่งซ่อม <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น ตัวเครื่องหลัก, หัวโพรบ Linear Probe, สาย Lead 10 เส้น, แท่นชาร์จ..."
              value={formData.repairedItems}
              onChange={(e) => setFormData({ ...formData, repairedItems: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">อาการเสีย / สิ่งที่ชำรุด <span className="text-rose-400">*</span></label>
            <textarea
              rows="2"
              required
              placeholder="อธิบายอาการเสียโดยละเอียด เช่น ชาร์จไฟไม่เข้า, หน้าจอไม่ติด, สายขาด..."
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-rose-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ใช้ครั้งสุดท้ายจาก รพ. ไหน</label>
              <input
                type="text"
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.lastHospital}
                onChange={(e) => setFormData({ ...formData, lastHospital: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ระบุตัวคนใช้ / อาจารย์ผู้ใช้</label>
              <input
                type="text"
                placeholder="เช่น พญ.สมศรี / พยาบาล ER"
                value={formData.lastUser}
                onChange={(e) => setFormData({ ...formData, lastUser: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ที่รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ส่งซ่อมกับเจ้าไหน / ศูนย์ซ่อม</label>
              <input
                type="text"
                placeholder="เช่น AERON Service Center (ไทย) / Drager Germany"
                value={formData.repairVendor}
                onChange={(e) => setFormData({ ...formData, repairVendor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ที่อยู่ / สถานที่ประจำเครื่องปัจจุบัน</label>
              <input
                type="text"
                placeholder="เช่น ศูนย์ซ่อม AERON กรุงเทพฯ / คลังสินค้า"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ส่งเข้าซ่อม</label>
              <input
                type="date"
                value={formData.sentDate}
                onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ได้รับของคืน (Expected Return)</label>
              <input
                type="date"
                value={formData.returnedDate}
                onChange={(e) => setFormData({ ...formData, returnedDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าใช้จ่ายในการซ่อม (บาท)</label>
              <input
                type="number"
                value={formData.repairCost}
                onChange={(e) => setFormData({ ...formData, repairCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าขนส่ง (บาท)</label>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">สถานะการส่งซ่อม</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-bold outline-none"
              >
                {window.REPAIR_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30">
              บันทึกใบส่งซ่อม
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/ShipmentModal.js ---
// MODULE: mod04_logistics/ShipmentModal.js

function ShipmentModal({ shipment, purchaseOrders = [], products = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (shipment) return { ...shipment };
    const firstPO = purchaseOrders[0] || {};
    const delivYr = new Date().getFullYear();

    return {
      shipmentNumber: `SHP-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      poNumber: firstPO.poNumber || `PO-${delivYr}-101`,
      poId: firstPO.id || '',
      productName: firstPO.productName || (products[0] ? products[0].name : ''),
      productCategory: firstPO.productCategory || (products[0] ? products[0].category : ''),
      quantity: firstPO.quantity || 1,
      vendorName: firstPO.vendorName || 'Mindray Medical Singapore',
      vendorCountry: firstPO.vendorCountry || 'สิงคโปร์',
      hospitalDestination: firstPO.hospitalName || 'โรงพยาบาลศิริราช',
      shippingCompany: 'DHL Global Forwarding',
      trackingNumber: `AWB-${Math.floor(Math.random() * 89999999) + 10000000}`,
      cbm: 2.5,
      grossWeight: 150.0,
      transportType: window.TRANSPORT_TYPES[0],
      shippingCost: 35000,
      dutyTaxes: 12000,
      customsBroker: 'V-Cargo Logistics (Thailand)',
      paymentDate: shipment?.paymentDate || '',
      etd: new Date().toISOString().split('T')[0],
      eta: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: window.SHIPMENT_STATUSES[0],
      notes: ''
    };
  });

  const handlePOSelect = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setFormData(prev => ({
        ...prev,
        poId: po.id,
        poNumber: po.poNumber,
        productName: po.productName,
        vendorName: po.vendorName,
        vendorCountry: po.vendorCountry,
        hospitalDestination: po.hospitalName || prev.hospitalDestination,
        quantity: po.quantity || prev.quantity
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.vendorName.trim()) {
      alert('กรุณากรอกชื่อสินค้าและชื่อบริษัทผู้ผลิต');
      return;
    }
    onSave({
      ...formData,
      cbm: Number(formData.cbm) || 0,
      grossWeight: Number(formData.grossWeight) || 0,
      shippingCost: Number(formData.shippingCost) || 0,
      dutyTaxes: Number(formData.dutyTaxes) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🚢 {shipment ? 'แก้ไขข้อมูลนำเข้าสินค้า' : 'บันทึกรายการนำเข้าสินค้าใหม่ (Shipment Tracking)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ชิปปิ้ง / Tracking ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.shipmentNumber}
                onChange={(e) => setFormData({ ...formData, shipmentNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เชื่อมโยงใบสั่งซื้อ (PO)</label>
              <select
                value={formData.poId}
                onChange={(e) => handlePOSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
              >
                <option value="">-- เลือก PO ในระบบ --</option>
                {(purchaseOrders || []).map(po => (
                  <option key={po.id} value={po.id}>
                    📄 {po.poNumber} - {po.vendorName} ({po.productName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อรุ่นสินค้าที่นำเข้า <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทผู้ผลิต / Vendor <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทขนส่ง (Freight Carrier)</label>
              <input
                type="text"
                placeholder="เช่น DHL, Kuehne+Nagel, FedEx"
                value={formData.shippingCompany}
                onChange={(e) => setFormData({ ...formData, shippingCompany: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลข Air Waybill / Bill of Lading</label>
              <input
                type="text"
                placeholder="เช่น AWB-98765432"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ขนส่งทางไหน</label>
              <select
                value={formData.transportType}
                onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold"
              >
                {window.TRANSPORT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">ปริมาตร (CBM)</label>
              <input
                type="number"
                step="0.1"
                value={formData.cbm}
                onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">น้ำหนักรวม (kg)</label>
              <input
                type="number"
                step="0.5"
                value={formData.grossWeight}
                onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าขนส่ง (บาท)</label>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ภาษีศุลกากร (บาท)</label>
              <input
                type="number"
                value={formData.dutyTaxes}
                onChange={(e) => setFormData({ ...formData, dutyTaxes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-purple-300 font-bold font-mono outline-none"
              />
            </div>
          </div>

          {/* 📅 Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* วันที่จ่ายเงิน */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-emerald-300 flex items-center justify-between">
                <span>💳 วันที่จ่ายเงิน</span>
                {formData.paymentDate && (
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    {(() => {
                      const p = new Date(formData.paymentDate);
                      const t = new Date();
                      p.setHours(0,0,0,0);
                      t.setHours(0,0,0,0);
                      const diff = Math.floor((t - p) / 86400000);
                      return diff >= 0 ? `(ผ่านมา ${diff} วัน)` : `(อีก ${Math.abs(diff)} วัน)`;
                    })()}
                  </span>
                )}
              </label>
              <input
                type="date"
                value={formData.paymentDate || ''}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-300 font-mono font-bold outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            {/* วันที่ส่งออก (ETD) */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-slate-300">🛫 ส่งออกจากต้นทาง (ETD)</label>
              <input
                type="date"
                value={formData.etd}
                onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            {/* วันที่คาดว่าถึงไทย (ETA) */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-slate-300">🛬 คาดว่าถึงไทย (ETA)</label>
              <input
                type="date"
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-300 font-mono font-bold outline-none focus:border-cyan-500 text-xs"
              />
            </div>

            {/* สถานะการนำเข้า */}
            <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <label className="font-semibold text-slate-300">🏷️ สถานะนำเข้า <span className="text-rose-400">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg p-2 text-cyan-300 font-bold outline-none focus:border-cyan-400 text-xs"
              >
                {window.SHIPMENT_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชิปปิ้ง / ตัวแทนศุลกากร & หมายเหตุ</label>
            <input
              type="text"
              placeholder="ระบุบริษัทชิปปิ้ง เที่ยวบิน หรือข้อความเพิ่มเติม..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30">
              บันทึกรายการนำเข้า
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/ShipmentTrackingView.js ---
// MODULE: mod04_logistics/ShipmentTrackingView.js

function ShipmentTrackingView({ shipments = [], purchaseOrders = [], products = [], onOpenNewShipment, onEditShipment, onDeleteShipment }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTransport, setFilterTransport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewShipment, setPreviewShipment] = useState(null);

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return (shipments || []).filter(s => {
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (filterTransport !== 'all' && s.transportType !== filterTransport) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mShp = (s.shipmentNumber || '').toLowerCase().includes(q);
        const mPO = (s.poNumber || '').toLowerCase().includes(q);
        const mProd = (s.productName || '').toLowerCase().includes(q);
        const mVendor = (s.vendorName || '').toLowerCase().includes(q);
        const mCarrier = (s.shippingCompany || '').toLowerCase().includes(q);
        const mTrack = (s.trackingNumber || '').toLowerCase().includes(q);
        const mHosp = (s.hospitalDestination || '').toLowerCase().includes(q);
        return mShp || mPO || mProd || mVendor || mCarrier || mTrack || mHosp;
      }
      return true;
    });
  }, [shipments, filterStatus, filterTransport, searchQuery]);

  // Metrics KPI
  const totalShipments = filteredShipments.length;
  const inTransitCount = filteredShipments.filter(s => s.status === 'ระหว่างขนส่ง' || s.status === 'ถึงประเทศไทย รอออกของ').length;
  const totalCBM = filteredShipments.reduce((sum, s) => sum + (Number(s.cbm) || 0), 0);
  const totalShippingCosts = filteredShipments.reduce((sum, s) => sum + (Number(s.shippingCost) || 0) + (Number(s.dutyTaxes) || 0), 0);

  const statusColors = {
    'รอจ่ายเงิน': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'จ่ายเงินแล้ว รอผลิต': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'ผลิตเสร็จแล้ว รอส่ง': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    'ระหว่างขนส่ง': 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
    'ถึงประเทศไทย รอออกของ': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'ของถึง ออฟฟิศ': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    'ส่งลูกค้าแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner">
            🚢
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ติดตามการนำเข้าสินค้า (Import Logistics & Shipment Tracking)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                IMPORT LOGISTICS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามสถานะชิปปิ้งนำเข้าจากต่างประเทศ ค่าขนส่ง CBM ด่านศุลกากร และกำหนดสินค้าเข้าออฟฟิศ/ส่งมอบ
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewShipment(null)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ บันทึกรายการนำเข้าใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📦 รวมรายการนำเข้าสินค้า</span>
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-400 tracking-tight font-mono">
            {totalShipments} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ใบสั่งซื้อที่ดำเนินการนำเข้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>✈️ อยู่ระหว่างขนส่ง / ด่านศุลกากร</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">⚓</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {inTransitCount} <span className="text-xs font-normal text-slate-400">ล็อต</span>
          </div>
          <div className="text-[11px] text-slate-400">
            กำลังเดินทาง / รอดำเนินการออกของ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📐 ปริมาตรรวม (Total CBM)</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">📐</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {(Number(totalCBM) || 0).toFixed(1)} <span className="text-xs font-normal text-slate-400">CBM</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ลูกบาศก์เมตร (Volume)
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💵 รวมค่าขนส่ง & ภาษีนำเข้า</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalShippingCosts)}
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าระวาง + ชิปปิ้ง + ภาษีศุลกากร
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางติดตามสถานะสินค้าชิปปิ้ง (Import Shipments List)</span>
            </h3>
            <p className="text-xs text-slate-400">ตรวจสอบสถานะนำเข้า 7 ขั้นตอน เลข AWB ค่าขนส่ง CBM และด่านศุลกากร</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา PO / สินค้า / AWB / ชิปปิ้ง / รพ...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะนำเข้า</option>
              {(window.SHIPMENT_STATUSES || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterTransport}
              onChange={(e) => setFilterTransport(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามประเภทการขนส่ง</option>
              {(window.TRANSPORT_TYPES || []).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ชิปปิ้ง / PO</th>
                <th className="p-3">สินค้าที่สั่ง & บริษัทผู้ผลิต</th>
                <th className="p-3">ผู้จัดขนส่ง & เลข AWB/BL</th>
                <th className="p-3">ปริมาตร CBM / น้ำหนัก</th>
                <th className="p-3 text-right">ค่าขนส่ง & ภาษีศุลกากร</th>
                <th className="p-3 text-center min-w-[130px]">💳 วันจ่ายเงิน / นับวัน</th>
                <th className="p-3 text-center">วันที่ ETD / ETA</th>
                <th className="p-3 text-center">สถานะนำเข้า</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการนำเข้าสินค้าตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredShipments.map(shp => {
                  const badgeStyle = statusColors[shp.status] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={shp.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Shipment & PO Number */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-cyan-300">{shp.shipmentNumber}</div>
                        <div className="text-[10.5px] font-mono text-amber-300 font-semibold mt-0.5">PO: {shp.poNumber}</div>
                        {shp.hospitalDestination && (
                          <div className="text-[9.5px] text-emerald-300 line-clamp-1 mt-0.5">🏥 {shp.hospitalDestination}</div>
                        )}
                      </td>

                      {/* Product Name & Vendor */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{shp.productName}</div>
                        <div className="text-[10px] text-slate-400">{shp.productCategory}</div>
                        <div className="text-[10.5px] text-indigo-300 font-medium mt-0.5">🏭 {shp.vendorName} ({shp.vendorCountry})</div>
                      </td>

                      {/* Carrier & Tracking Number */}
                      <td className="p-3">
                        <div className="font-semibold text-purple-300">{shp.shippingCompany || 'ไม่ระบุสายส่ง'}</div>
                        <div className="text-[10px] text-slate-300">{shp.transportType}</div>
                        {shp.trackingNumber && (
                          <div className="inline-block mt-1 font-mono font-bold text-slate-200 text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            🏷️ {shp.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* CBM & Weight */}
                      <td className="p-3 font-mono">
                        <div className="font-bold text-amber-300 text-sm">{shp.cbm} <span className="text-[10px] font-normal text-slate-400">CBM</span></div>
                        <div className="text-[10px] text-slate-400">{shp.grossWeight ? `${shp.grossWeight} kg` : '-'}</div>
                      </td>

                      {/* Shipping Cost & Duties */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-emerald-400">{formatCurrency(shp.shippingCost)}</div>
                        {shp.dutyTaxes > 0 && (
                          <div className="text-[10px] text-purple-300">+ ภาษี {formatCurrency(shp.dutyTaxes)}</div>
                        )}
                      </td>

                      {/* Payment Date & Elapsed Days Counter */}
                      <td className="p-3 text-center">
                        {shp.paymentDate ? (
                          <div className="space-y-1">
                            <div className="font-mono text-emerald-300 font-bold text-xs flex items-center justify-center gap-1">
                              <span>💳</span> <span>{shp.paymentDate}</span>
                            </div>
                            <div>
                              {(() => {
                                const p = new Date(shp.paymentDate);
                                const t = new Date();
                                p.setHours(0,0,0,0);
                                t.setHours(0,0,0,0);
                                const diff = Math.floor((t - p) / 86400000);
                                if (diff >= 0) {
                                  return (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10.5px] font-mono font-bold inline-flex items-center gap-1">
                                      <span>⏱️</span> <span>ผ่านมา {diff} วัน</span>
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                                      อีก {Math.abs(diff)} วัน
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 text-[10.5px] border border-slate-700">
                            ⏳ ยังไม่ระบุวันจ่าย
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="p-3 text-center font-mono text-[10.5px]">
                        <div className="text-slate-400">ออก: <span className="text-slate-200">{shp.etd || 'N/A'}</span></div>
                        <div className="text-cyan-300 font-bold mt-0.5">ถึง: {shp.eta || 'N/A'}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border ${badgeStyle}`}>
                          {shp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewShipment(shp)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบชิปปิ้ง"
                        >
                          👁️ ดู
                        </button>
                        <button
                          onClick={() => onEditShipment(shp)}
                          className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 text-xs rounded-lg border border-cyan-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteShipment(shp.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Preview Modal */}
      {previewShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  IMPORT LOGISTICS DOCUMENT
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewShipment.shipmentNumber}</h3>
                <p className="text-xs text-slate-400">อ้างอิงใบสั่งซื้อ PO: {previewShipment.poNumber}</p>
              </div>
              <button onClick={() => setPreviewShipment(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลสินค้า & บริษัทผู้ผลิต:</div>
                <div className="font-bold text-white text-sm mt-0.5">{previewShipment.productName}</div>
                <div className="text-indigo-300">บริษัท: {previewShipment.vendorName} ({previewShipment.vendorCountry})</div>
                <div className="text-emerald-300 font-medium">ส่งถึง: {previewShipment.hospitalDestination || 'สำนักงาน AERON'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการขนส่งชิปปิ้ง:</div>
                <div className="text-purple-300 font-bold mt-0.5">บริษัทขนส่ง: {previewShipment.shippingCompany}</div>
                <div className="text-slate-300">รูปแบบ: {previewShipment.transportType}</div>
                <div className="text-amber-300 font-mono">AWB/BL: {previewShipment.trackingNumber || 'N/A'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-bold">💳 วันที่จ่ายเงิน:</span>
                <div className="text-emerald-300 font-bold text-sm">{previewShipment.paymentDate || 'ยังไม่ระบุ'}</div>
                {previewShipment.paymentDate && (
                  <div className="text-amber-300 text-[10.5px] font-bold mt-0.5">
                    {(() => {
                      const p = new Date(previewShipment.paymentDate);
                      const t = new Date();
                      p.setHours(0,0,0,0);
                      t.setHours(0,0,0,0);
                      const diff = Math.floor((t - p) / 86400000);
                      return diff >= 0 ? `⏱️ ผ่านมา ${diff} วันแล้ว` : `อีก ${Math.abs(diff)} วัน`;
                    })()}
                  </div>
                )}
              </div>
              <div>
                <span className="text-slate-500 font-bold">ปริมาตร (CBM):</span>
                <div className="text-amber-400 font-bold text-sm">{previewShipment.cbm} CBM</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">น้ำหนักรวม (Weight):</span>
                <div className="text-slate-200 font-bold text-sm">{previewShipment.grossWeight || 0} kg</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">ค่าขนส่งรวม:</span>
                <div className="text-emerald-400 font-bold text-sm">{formatCurrency(previewShipment.shippingCost)}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📍 สถานะการนำเข้าปัจจุบัน</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {previewShipment.status}
                </span>
                <span className="text-slate-400">ชิปปิ้ง/พิธีการศุลกากร: <span className="text-slate-200 font-semibold">{previewShipment.customsBroker || 'N/A'}</span></span>
              </div>
              {previewShipment.notes && (
                <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                  "{previewShipment.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์เอกสารนำเข้า
              </button>
              <button onClick={() => setPreviewShipment(null)} className="px-5 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl hover:bg-cyan-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/SoldProductModal.js ---
// MODULE: mod04_logistics/SoldProductModal.js

function SoldProductModal({ asset, projects = [], members = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (asset) return { ...asset };
    const wonProj = projects.find(p => p.status === 'stage_delivery' || p.status === 'stage_completed') || projects[0] || {};
    const delivDate = new Date().toISOString().split('T')[0];
    const delivYr = new Date().getFullYear();

    return {
      assetNumber: `AST-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      contractNumber: `PO-HOSP-${delivYr}/${Math.floor(Math.random() * 80) + 10}`,
      projectId: wonProj.id || '',
      hospitalName: wonProj.hospitalName || '',
      department: 'แผนกห้องผ่าตัด / CCU',
      productName: wonProj.productName || 'เครื่องมือแพทย์ AERON',
      brand: wonProj.productBrand || 'AERON MEDICAL',
      productCategory: wonProj.productCategory || 'อุปกรณ์แพทย์',
      serialNumber: `SN-AERON-${Math.floor(Math.random() * 899999) + 100000}`,
      freebies: 'กระดาษบันทึกมาตรฐาน 10 ม้วน, สายสัญญาณสำรอง, รถเข็นสแตนเลส',
      salesPerson: wonProj.assignee || (members[0] ? members[0].name : ''),
      contactPerson: wonProj.decisionMakers || '',
      deliveryDate: delivDate,
      projectValue: wonProj.budget || 1000000,
      dfAmount: wonProj.dfAmount || '100,000 บาท',
      bidGuaranteeAmount: Math.round((wonProj.budget || 1000000) * 0.05),
      bidGuaranteeRefundDate: `${delivYr}-12-15`,
      warrantyYears: 1,
      warrantyExpiryDate: `${delivYr + 1}-${delivDate.substring(5)}`,
      nextPmDate: `${delivYr}-12-15`,
      pmFrequency: 'ทุก 6 เดือน (ปีละ 2 ครั้ง)',
      pmStatus: '⏳ ถึงกำหนดทำ PM',
      status: 'รับมอบเรียบร้อย'
    };
  });

  const handleProjectSelect = (pId) => {
    const p = projects.find(x => x.id === pId);
    if (p) {
      setFormData(prev => ({
        ...prev,
        projectId: p.id,
        hospitalName: p.hospitalName,
        productName: p.productName || prev.productName,
        salesPerson: p.assignee || prev.salesPerson,
        projectValue: p.budget || prev.projectValue,
        dfAmount: p.dfAmount || prev.dfAmount,
        bidGuaranteeAmount: Math.round((p.budget || prev.projectValue) * 0.05)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.productName.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาลและชื่อรุ่นสินค้า');
      return;
    }
    onSave({
      ...formData,
      projectValue: Number(formData.projectValue) || 0,
      bidGuaranteeAmount: Number(formData.bidGuaranteeAmount) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>📦 {asset ? 'แก้ไขข้อมูลสินค้าที่ขายแล้ว' : 'บันทึกการส่งมอบสินค้าใหม่ (Delivered Asset)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รหัสครุภัณฑ์ / Asset Code <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.assetNumber}
                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่สัญญา / PO โรงพยาบาล</label>
              <input
                type="text"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เชื่อมโยงโครงการในระบบ (ถ้ามี)</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              <option value="">-- ไม่เชื่อมโยง / บันทึกแยกอิสระ --</option>
              {(projects || []).map(p => (
                <option key={p.id} value={p.id}>
                  🏥 {p.hospitalName} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / ลูกค้า <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">แผนกที่ติดตั้ง</label>
              <input
                type="text"
                placeholder="เช่น แผนกห้องผ่าตัด (OR)"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้า <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ยี่ห้อ (Brand)</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลข Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">🎁 ของแถม / รายการอุปกรณ์ประกอบในสัญญา</label>
            <textarea
              rows="2"
              placeholder="ระบุของแถม เช่น กระดาษบันทึก 10 ม้วน, สาย Lead สำรอง, รถเข็นสแตนเลส..."
              value={formData.freebies}
              onChange={(e) => setFormData({ ...formData, freebies: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">วันที่ส่งมอบสินค้า</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">มูลค่างาน (บาท)</label>
              <input
                type="number"
                value={formData.projectValue}
                onChange={(e) => setFormData({ ...formData, projectValue: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่า DF (Doctor Fee)</label>
              <input
                type="text"
                value={formData.dfAmount}
                onChange={(e) => setFormData({ ...formData, dfAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-purple-300 font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">จำนวนเงินค้ำประกันซอง (บาท)</label>
              <input
                type="number"
                value={formData.bidGuaranteeAmount}
                onChange={(e) => setFormData({ ...formData, bidGuaranteeAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">วันที่กำหนดรับคืนเงินประกันซอง</label>
              <input
                type="date"
                value={formData.bidGuaranteeRefundDate}
                onChange={(e) => setFormData({ ...formData, bidGuaranteeRefundDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-emerald-400 font-semibold">วันหมดอายุการรับประกัน (Warranty)</label>
              <input
                type="date"
                value={formData.warrantyExpiryDate}
                onChange={(e) => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-purple-300 font-semibold">วันที่ต้องเข้าทำ PM ครั้งถัดไป</label>
              <input
                type="date"
                value={formData.nextPmDate}
                onChange={(e) => setFormData({ ...formData, nextPmDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30">
              บันทึกรายการสินค้าที่ขายแล้ว
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod04_logistics/SoldProductsView.js ---
// MODULE: mod04_logistics/SoldProductsView.js

function SoldProductsView({ soldProducts = [], projects = [], members = [], onOpenNewAsset, onEditAsset, onDeleteAsset, onOpenProjectDetail, onOpenReport }) {
  const [filterYear, setFilterYear] = useState('all');
  const [filterSales, setFilterSales] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAsset, setPreviewAsset] = useState(null);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return soldProducts.filter(a => {
      if (filterYear !== 'all') {
        const yr = a.deliveryDate ? new Date(a.deliveryDate).getFullYear() : 2026;
        if (Number(yr) !== Number(filterYear)) return false;
      }
      if (filterSales !== 'all' && a.salesPerson !== filterSales) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mAsset = (a.assetNumber || '').toLowerCase().includes(q);
        const mContract = (a.contractNumber || '').toLowerCase().includes(q);
        const mHosp = (a.hospitalName || '').toLowerCase().includes(q);
        const mProd = (a.productName || '').toLowerCase().includes(q);
        const mBrand = (a.brand || '').toLowerCase().includes(q);
        const mSN = (a.serialNumber || '').toLowerCase().includes(q);
        const mSales = (a.salesPerson || '').toLowerCase().includes(q);
        return mAsset || mContract || mHosp || mProd || mBrand || mSN || mSales;
      }
      return true;
    });
  }, [soldProducts, filterYear, filterSales, searchQuery]);

  // Metrics KPI
  const totalDeliveredValue = filteredAssets.reduce((sum, a) => sum + (Number(a.projectValue) || 0), 0);
  const totalGuaranteeAmount = filteredAssets.reduce((sum, a) => sum + (Number(a.bidGuaranteeAmount) || 0), 0);
  const totalAssetsCount = filteredAssets.length;
  const pmDueCount = filteredAssets.filter(a => a.pmStatus === '⏳ ถึงกำหนดทำ PM' || a.pmStatus === '🚨 เลยกำหนด PM').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            🏆
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลสินค้าที่ขายแล้ว & ประกันสินค้า (Delivered Assets & Warranty)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                INSTALLED BASE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามสินค้าที่ส่งมอบและตรวจรับแล้ว การรับคืนเงินค้ำประกันซอง วันหมดประกัน และรอบ PM บำรุงรักษา
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewAsset(null)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ เพิ่มรายการส่งมอบสินค้า</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💎 มูลค่างานส่งมอบรวมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalDeliveredValue)}
          </div>
          <div className="text-[11px] text-slate-400">
            จากทั้งหมด {totalAssetsCount} สัญญาจัดซื้อ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🛡️ รวมเงินค้ำประกันซอง/สัญญา</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalGuaranteeAmount)}
          </div>
          <div className="text-[11px] text-slate-400">
            เงินประกันสัญญาที่รอรับคืนจาก รพ.
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🩺 เครื่องที่ติดตั้งใช้งานจริง</span>
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300">🏥</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-300 tracking-tight font-mono">
            {totalAssetsCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ติดตั้ง ณ โรงพยาบาลคู่ค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>⚙️ กำหนดทำ PM บำรุงรักษา</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">📅</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {pmDueCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ถึงรอบ Preventive Maintenance
          </div>
        </div>

      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางรายการสินค้าที่ขายแล้ว (Delivered Assets List)</span>
            </h3>
            <p className="text-xs text-slate-400">รายละเอียดสินค้า ของแถม มูลค่างาน ค่า DF เงินประกันซอง และกำหนด PM</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา รพ. / เครื่อง / SN / เซลส์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามปีที่ส่งมอบ (ทุกปี)</option>
              <option value="2026">ส่งมอบปี 2026 (2569)</option>
              <option value="2025">ส่งมอบปี 2025 (2568)</option>
              <option value="2024">ส่งมอบปี 2024 (2567)</option>
            </select>

            <select
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามเซลส์ผู้รับผิดชอบ</option>
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>

            <button
              onClick={() => onOpenReport && onOpenReport('warranty_expiry_matrix')}
              className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              title="เปิดรายงานสัญญาประกันและเครื่องใกล้หมดประกัน"
            >
              <span>🛡️</span>
              <span>รายงานประกัน & MA</span>
            </button>
          </div>
        </div>

        {/* Delivered Assets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขรหัสสินค้า / วันส่งมอบ</th>
                <th className="p-3">โรงพยาบาล & ผู้ติดต่อ / เซลส์</th>
                <th className="p-3">ยี่ห้อ & รุ่นสินค้า / หมายเลข SN</th>
                <th className="p-3">🎁 รายการของแถม</th>
                <th className="p-3 text-right">มูลค่างาน & ค่า DF</th>
                <th className="p-3 text-right">เงินประกันซอง & วันคืน</th>
                <th className="p-3 text-center">หมดประกัน & รอบ PM</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการสินค้าที่ขายแล้วตรงตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const isWarrantyActive = new Date(asset.warrantyExpiryDate) >= new Date();

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Asset Number & Delivery Date */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-emerald-300">{asset.assetNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">สัญญา: {asset.contractNumber || 'N/A'}</div>
                        <div className="text-[9.5px] text-amber-300 font-mono mt-1">🚚 ส่งมอบ: {asset.deliveryDate}</div>
                      </td>

                      {/* Hospital & Sales */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">🏥 {asset.hospitalName}</div>
                        {asset.department && (
                          <div className="text-[10.5px] text-slate-300">📍 {asset.department}</div>
                        )}
                        {asset.contactPerson && (
                          <div className="text-[10px] text-slate-400">👨‍⚕️ {asset.contactPerson}</div>
                        )}
                        <div className="text-[10.5px] text-emerald-300 font-medium mt-0.5">💼 เซลส์: {asset.salesPerson}</div>
                      </td>

                      {/* Brand & Model & SN */}
                      <td className="p-3">
                        <div className="font-bold text-white">{asset.productName}</div>
                        <div className="text-[10px] text-indigo-300">แบรนด์: {asset.brand || 'AERON MEDICAL'}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-amber-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          SN: {asset.serialNumber || 'ไม่ระบุ'}
                        </div>
                      </td>

                      {/* Freebies */}
                      <td className="p-3 max-w-xs">
                        {asset.freebies ? (
                          <div className="text-[11px] text-slate-300 leading-snug bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                            🎁 <span className="text-slate-200">{asset.freebies}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[10.5px]">ไม่มีของแถม</span>
                        )}
                      </td>

                      {/* Project Value & DF */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-emerald-400 text-sm">{formatCurrency(asset.projectValue)}</div>
                        <div className="text-[10px] text-purple-300 font-medium">DF: {asset.dfAmount || 'ไม่ระบุ'}</div>
                      </td>

                      {/* Bid Guarantee & Refund Date */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400">{formatCurrency(asset.bidGuaranteeAmount)}</div>
                        <div className="text-[10px] text-slate-400">
                          📅 คืนเงิน: <span className="text-amber-300 font-semibold">{asset.bidGuaranteeRefundDate || 'ไม่ระบุ'}</span>
                        </div>
                      </td>

                      {/* Warranty & PM Status */}
                      <td className="p-3 text-center space-y-1">
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isWarrantyActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {isWarrantyActive ? `🛡️ ประกันถึง ${asset.warrantyExpiryDate}` : `❌ หมดประกัน (${asset.warrantyExpiryDate})`}
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            ⚙️ PM ถัดไป: {asset.nextPmDate || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบรับมอบ"
                        >
                          👁️ ดู
                        </button>
                        {asset.projectId && (
                          <button
                            onClick={() => {
                              const proj = projects.find(p => p.id === asset.projectId || p.id === Number(asset.projectId));
                              if (proj && onOpenProjectDetail) onOpenProjectDetail(proj);
                            }}
                            className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs rounded-lg border border-purple-700/50"
                            title="ดูโครงการของเซลส์ที่เชื่อมโยง"
                          >
                            🔗 โครงการ
                          </button>
                        )}
                        <button
                          onClick={() => onEditAsset(asset)}
                          className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Certificate / Delivery Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                  DELIVERY & WARRANTY CERTIFICATE
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewAsset.assetNumber}</h3>
                <p className="text-xs text-slate-400">เลขที่สัญญา: {previewAsset.contractNumber}</p>
              </div>
              <button onClick={() => setPreviewAsset(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">โรงพยาบาล / ลูกค้า:</div>
                <div className="font-bold text-emerald-300 text-sm mt-0.5">{previewAsset.hospitalName}</div>
                <div className="text-slate-400">แผนก: {previewAsset.department}</div>
                <div className="text-slate-400">ผู้ติดต่อ: {previewAsset.contactPerson}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการส่งมอบ:</div>
                <div className="text-amber-300 font-semibold mt-0.5">📅 วันส่งมอบ: {previewAsset.deliveryDate}</div>
                <div className="text-slate-300">💼 เซลส์: {previewAsset.salesPerson}</div>
                <div className="text-slate-300 font-mono font-bold">💰 มูลค่างาน: {formatCurrency(previewAsset.projectValue)}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📦 รายละเอียดสินค้า & ของแถมที่ได้รับ</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>รุ่นสินค้า: <span className="font-bold text-white">{previewAsset.productName}</span></div>
                <div>แบรนด์: <span className="text-indigo-300">{previewAsset.brand}</span></div>
                <div>Serial Number: <span className="font-mono text-amber-300 font-bold">{previewAsset.serialNumber}</span></div>
                <div>ค่า DF: <span className="text-purple-300 font-semibold">{previewAsset.dfAmount}</span></div>
              </div>
              <div className="pt-2 border-t border-slate-900 text-slate-300">
                <span className="font-bold text-emerald-300">🎁 ของแถม / รายการอุปกรณ์ประกอบ:</span>
                <p className="text-slate-200 mt-0.5 italic">{previewAsset.freebies || 'ไม่มีของแถม'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div>
                <div className="text-amber-400 font-bold">🛡️ เงินค้ำประกันซอง / สัญญา:</div>
                <div className="text-lg font-mono font-bold text-amber-300">{formatCurrency(previewAsset.bidGuaranteeAmount)}</div>
                <div className="text-slate-400">📅 กำหนดรับเงินคืน: <span className="text-white font-semibold">{previewAsset.bidGuaranteeRefundDate}</span></div>
              </div>
              <div>
                <div className="text-purple-300 font-bold">⚙️ การรับประกัน & รอบ PM:</div>
                <div className="text-slate-200">วันหมดประกัน: <span className="font-semibold text-emerald-300">{previewAsset.warrantyExpiryDate}</span></div>
                <div className="text-slate-200">วันทำ PM ถัดไป: <span className="font-semibold text-purple-300">{previewAsset.nextPmDate}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์เอกสารรับมอบ
              </button>
              <button onClick={() => setPreviewAsset(null)} className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod05_calendar/DemoBookingModal.js ---
// MODULE: mod05_calendar/DemoBookingModal.js

function DemoBookingModal({ prefill, projects = [], products = [], members = [], existingBookings = [], onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: prefill?.id || undefined,
    projectId: prefill?.projectId || '',
    hospitalName: prefill?.hospitalName || '',
    productId: prefill?.productId || (products[0] ? products[0].id : ''),
    demoSerial: prefill?.demoSerial || '',
    salesPerson: prefill?.salesPerson || (members[0] ? members[0].name : ''),
    startDate: prefill?.startDate || new Date().toISOString().split('T')[0],
    endDate: prefill?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: prefill?.status || 'อนุมัติคิว',
    expenseAmount: prefill?.expenseAmount || prefill?.demoCost || '',
    outcomeStatus: prefill?.outcomeStatus || 'กำลังทดสอบ / รอผล',
    note: prefill?.note || ''
  });

  const [conflictWarning, setConflictWarning] = useState('');

  const selectedProduct = products.find(p => p.id === formData.productId);

  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !formData.productId) {
      setConflictWarning('');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    const conflicts = existingBookings.filter(b => {
      if (b.id === formData.id) return false;
      if (b.productId !== formData.productId) return false;

      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);

      return (start <= bEnd && end >= bStart);
    });

    if (conflicts.length > 0) {
      const c = conflicts[0];
      setConflictWarning(`⚠️ คำเตือน: เครื่องรุ่นนี้ถูกจองคิวแล้วโดย ${c.salesPerson} ที่ ${c.hospitalName} ช่วงวันที่ ${c.startDate} ถึง ${c.endDate}`);
    } else {
      setConflictWarning('');
    }
  }, [formData.startDate, formData.endDate, formData.productId, existingBookings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.productId) {
      alert('กรุณากรอกชื่อโรงพยาบาลและเลือกรุ่นสินค้าสาธิต');
      return;
    }

    const prod = products.find(p => p.id === formData.productId);
    onSave({
      ...formData,
      productName: prod ? prod.name : 'เครื่องมือแพทย์ AERON',
      productCategory: prod ? prod.category : 'อุปกรณ์แพทย์'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-modal font-sans text-slate-100">
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧪</span>
            <h3 className="font-extrabold text-white text-base">ระบบจองคิวเครื่องสาธิต (Demo Booking)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        {conflictWarning && (
          <div className="bg-amber-950/70 border border-amber-500/50 p-3 rounded-2xl text-amber-200 text-xs flex items-start gap-2 shadow-md">
            <span className="text-base leading-none">⚠️</span>
            <div className="leading-snug">{conflictWarning}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่อโรงพยาบาล / โครงการ <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="ระบุชื่อโรงพยาบาล..."
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เครื่องสาธิตส่วนกลาง (Product Model) <span className="text-rose-400">*</span></label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-bold"
            >
              {(products || []).map(p => (
                <option key={p.id} value={p.id}>
                  📦 {p.name} (มี {p.demoUnitsAvailable || 1} เครื่อง)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="text-white text-sm">📅</span>
                <span>วันเริ่มนัดเดโม่</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-purple-500 shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span className="text-white text-sm">📅</span>
                <span>ถึงวันที่ (สิ้นสุด)</span>
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono font-bold outline-none focus:border-purple-500 shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้จอง / เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
              >
                {(members || []).map(m => (
                  <option key={m.id} value={m.name}>👤 {m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลขอุปกรณ์ (SN)</label>
              <select
                value={formData.demoSerial}
                onChange={(e) => setFormData({ ...formData, demoSerial: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-mono"
              >
                <option value="">-- เลือกหมายเลข SN เครื่อง --</option>
                {selectedProduct && selectedProduct.serials ? (
                  selectedProduct.serials.map(sn => (
                    <option key={sn} value={sn}>🔹 {sn}</option>
                  ))
                ) : (
                  <option value="SN-AERON-DEMO-01">🔹 SN-AERON-DEMO-01</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">💸 ค่าใช้จ่ายเดโม่ (บาท THB)</label>
              <input
                type="number"
                placeholder="เช่น 1500 (ค่าน้ำมัน/ขนส่ง)"
                value={formData.expenseAmount}
                onChange={(e) => setFormData({ ...formData, expenseAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">🎯 สถานะผลลัพธ์การเดโม่</label>
              <select
                value={formData.outcomeStatus}
                onChange={(e) => setFormData({ ...formData, outcomeStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500 font-semibold"
              >
                <option value="กำลังทดสอบ / รอผล">⏳ กำลังทดสอบ / รอผล</option>
                <option value="ชนะประมูล / ปิดการขายสำเร็จ">🏆 ชนะประมูล / ปิดการขายสำเร็จ</option>
                <option value="แพ้ประมูล / ปิดไม่สำเร็จ">❌ แพ้ประมูล / ปิดไม่สำเร็จ</option>
                <option value="ขยายเวลาทดสอบ">🔄 ขยายเวลาทดสอบ</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุการประสานงาน / ติดตั้ง</label>
            <textarea
              rows="2"
              placeholder="ระบุสถานที่ แผนก หรือช่างผู้เข้าติดตั้งเครื่อง..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30"
            >
              บันทึกการจองคิว
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod05_calendar/DemoCalendarView.js ---
// MODULE: mod05_calendar/DemoCalendarView.js

function DemoCalendarView({ demoBookings = [], products = [], projects = [], members = [], onOpenBookDemo, onDeleteBooking }) {
  const [filterProduct, setFilterProduct] = useState('all');
  const [calendarMode, setCalendarMode] = useState('month'); // 'month' or 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // Default August 2026 for mock data
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const filteredBookings = useMemo(() => {
    return demoBookings.filter(b => {
      if (filterProduct !== 'all' && b.productId !== filterProduct) return false;
      return true;
    });
  }, [demoBookings, filterProduct]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title & Controls Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
            📅
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ปฏิทินจองคิวเครื่อง Demo (Demo Booking Schedule)</span>
            </h2>
            <p className="text-xs text-slate-400">
              ฐานข้อมูลคิวสาธิตเครื่องร่วมกัน ป้องกันการจองเครื่องชนกันระหว่างทีมขาย
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 📊 Demo Analytics Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-xs py-2.5 px-3.5 rounded-xl border border-amber-500/40 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            title="ดูรายงานประวัติการเดินทางของเครื่อง ค่าใช้จ่าย และอัตรา Win Rate"
          >
            <span>📊 รายงานประวัติ & สถิติ Demo</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarMode === 'month' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗓️ Month Grid
            </button>
            <button
              onClick={() => setCalendarMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 รายการ
            </button>
          </div>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 outline-none"
          >
            <option value="all">กรองทุกรุ่น</option>
            {(products || []).map(p => (
              <option key={p.id} value={p.id}>📦 {p.name}</option>
            ))}
          </select>

          <button
            onClick={onOpenBookDemo}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>+ เพิ่มการจองคิว Demo</span>
          </button>
        </div>
      </div>

      {/* Month View vs List View */}
      {calendarMode === 'month' ? (
        <MonthCalendarGrid
          currentMonth={currentMonth}
          bookings={filteredBookings}
          products={products}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onTodayMonth={handleTodayMonth}
          onDeleteBooking={onDeleteBooking}
        />
      ) : (
        /* Bookings List Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.length === 0 ? (
            <div className="col-span-full text-center py-12 glass-panel rounded-2xl text-slate-500 text-sm">
              ไม่มีรายการจองคิวเครื่องสาธิตในระบบ
            </div>
          ) : (
            filteredBookings.map(b => (
              <div key={b.id} className="glass-card p-4 rounded-2xl space-y-3 relative border border-slate-800/80 hover:border-purple-500/40 transition-colors">
                
                <div className="flex items-start justify-between">
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    🧪 {b.status || 'อนุมัติคิว'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                    SN: {b.demoSerial || 'AERON-DEMO'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{b.hospitalName}</h4>
                  <p className="text-xs text-indigo-300 font-medium mt-0.5">📦 {b.productName}</p>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-2.5 space-y-1 text-xs border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>📅 ช่วงวันที่สาธิต:</span>
                    <span className="font-mono text-amber-300 font-semibold">{b.startDate} ถึง {b.endDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>👤 ผู้จอง / เซลส์:</span>
                    <span className="text-emerald-300 font-medium">{b.salesPerson}</span>
                  </div>
                </div>

                {b.note && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    "{b.note}"
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onDeleteBooking(b.id)}
                    className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded-lg bg-rose-950/30 border border-rose-800/40"
                  >
                    🗑️ ยกเลิกการจอง
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 📊 Demo Analytics & History Report Modal */}
      <DemoReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        demoBookings={demoBookings}
        products={products}
        projects={projects}
        members={members}
      />

    </div>
  );
}


// --- Module File: js/modules/mod05_calendar/DemoReportModal.js ---
// MODULE: mod05_calendar/DemoReportModal.js

function DemoReportModal({ isOpen, onClose, demoBookings = [], products = [], projects = [], members = [] }) {
  if (!isOpen) return null;

  const [filterProduct, setFilterProduct] = useState('all');
  const [filterSales, setFilterSales] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [activeTab, setActiveTab] = useState('journey'); // 'journey' | 'machine_stats'

  // Calculate days difference
  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  // Enriched bookings data
  const enrichedBookings = useMemo(() => {
    return (demoBookings || []).map(b => {
      const prod = products.find(p => p.id === b.productId);
      const proj = projects.find(p => p.id === b.projectId || (p.hospital && p.hospital.includes(b.hospitalName)));
      const days = calculateDays(b.startDate, b.endDate);
      const expense = Number(b.expenseAmount) || Number(b.demoCost) || 0;
      
      // Auto outcome if linked to project status
      let outcome = b.outcomeStatus || 'กำลังทดสอบ / รอผล';
      if (!b.outcomeStatus && proj) {
        if (['won', 'closed_won', 'delivered'].includes(proj.status)) outcome = 'ชนะประมูล / ปิดการขายสำเร็จ';
        else if (['lost', 'closed_lost', 'cancelled'].includes(proj.status)) outcome = 'แพ้ประมูล / ปิดไม่สำเร็จ';
      }

      return {
        ...b,
        productName: b.productName || (prod ? prod.name : 'เครื่องมือแพทย์'),
        productCategory: b.productCategory || (prod ? prod.category : 'อุปกรณ์แพทย์'),
        demoSerial: b.demoSerial || (prod && prod.demoSerialNumbers ? prod.demoSerialNumbers[0] : 'DEMO-SN-01'),
        days,
        expense,
        outcome,
        projectValue: proj ? Number(proj.budget || proj.value || 0) : 0,
        linkedProject: proj
      };
    });
  }, [demoBookings, products, projects]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return enrichedBookings.filter(b => {
      if (filterProduct !== 'all' && b.productId !== filterProduct) return false;
      if (filterSales !== 'all' && b.salesPerson !== filterSales) return false;
      if (filterOutcome !== 'all' && b.outcome !== filterOutcome) return false;
      if (dateStart && b.startDate < dateStart) return false;
      if (dateEnd && b.endDate > dateEnd) return false;
      return true;
    });
  }, [enrichedBookings, filterProduct, filterSales, filterOutcome, dateStart, dateEnd]);

  // Overall KPI Analytics
  const kpis = useMemo(() => {
    const totalDemos = filteredData.length;
    const totalDays = filteredData.reduce((sum, b) => sum + b.days, 0);
    const avgDays = totalDemos > 0 ? (totalDays / totalDemos).toFixed(1) : 0;
    const totalExpenses = filteredData.reduce((sum, b) => sum + b.expense, 0);
    
    const wonDemos = filteredData.filter(b => b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ'))).length;
    const winRate = totalDemos > 0 ? ((wonDemos / totalDemos) * 100).toFixed(1) : 0;
    
    const wonValue = filteredData
      .filter(b => b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ')))
      .reduce((sum, b) => sum + b.projectValue, 0);

    return { totalDemos, totalDays, avgDays, totalExpenses, wonDemos, winRate, wonValue };
  }, [filteredData]);

  // Machine Stats Grouping
  const machineStats = useMemo(() => {
    const map = {};
    filteredData.forEach(b => {
      const key = (b.productName || '') + '__' + (b.demoSerial || '');
      if (!map[key]) {
        map[key] = {
          productName: b.productName,
          serial: b.demoSerial,
          count: 0,
          totalDays: 0,
          totalExpense: 0,
          wonCount: 0,
          lastHospital: b.hospitalName,
          lastDate: b.endDate
        };
      }
      map[key].count += 1;
      map[key].totalDays += b.days;
      map[key].totalExpense += b.expense;
      if (b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ'))) {
        map[key].wonCount += 1;
      }
      if (b.endDate > map[key].lastDate) {
        map[key].lastDate = b.endDate;
        map[key].lastHospital = b.hospitalName;
      }
    });
    return Object.values(map);
  }, [filteredData]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ลำดับ', 'โรงพยาบาล/สถานที่เดโม่', 'รุ่นเครื่อง', 'Serial Number (S/N)', 
      'ผู้รับผิดชอบเดโม่', 'วันเริ่มเดโม่', 'วันสิ้นสุด', 'จำนวนวันที่วางเครื่อง (วัน)', 
      'ค่าใช้จ่ายเดโม่ (บาท)', 'ผลลัพธ์การเดโม่', 'หมายเหตุ'
    ];

    const rows = filteredData.map((b, idx) => [
      idx + 1,
      '"' + (b.hospitalName || '').replace(/"/g, '""') + '"',
      '"' + (b.productName || '').replace(/"/g, '""') + '"',
      '"' + (b.demoSerial || '').replace(/"/g, '""') + '"',
      '"' + (b.salesPerson || '').replace(/"/g, '""') + '"',
      b.startDate || '',
      b.endDate || '',
      b.days,
      b.expense,
      '"' + (b.outcome || '').replace(/"/g, '""') + '"',
      '"' + (b.note || '').replace(/"/g, '""') + '"'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AERON_Demo_Analytics_Report_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[850] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] flex flex-col text-slate-100">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">รายงานประวัติ & สถิติการ Demo (Demo Analytics Report)</h3>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  AERON MEDICAL
                </span>
              </div>
              <p className="text-xs text-slate-400">สรุปการเดินทางของแต่ละเครื่อง, ระยะเวลาวางเครื่อง, ผู้ดูแล, ค่าใช้จ่าย และอัตรา Win Rate</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>📥 ส่งออก Excel (CSV)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
            >
              ✕ ปิด
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* Top 5 KPI Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">🧪 จำนวนการเดโม่ทั้งหมด</span>
              <div className="text-xl font-extrabold text-purple-300 font-mono">{kpis.totalDemos} <span className="text-xs font-sans text-slate-400 font-normal">ครั้ง</span></div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">⏳ วันเฉลี่ยที่วางเครื่อง</span>
              <div className="text-xl font-extrabold text-cyan-300 font-mono">{kpis.avgDays} <span className="text-xs font-sans text-slate-400 font-normal">วัน/ที่</span></div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">💸 ค่าใช้จ่ายเดโม่รวม</span>
              <div className="text-xl font-extrabold text-amber-300 font-mono">{formatCurrency(kpis.totalExpenses)}</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">🎯 อัตราปิดการขาย (Win Rate)</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">{kpis.winRate}% <span className="text-xs font-sans text-emerald-500 font-normal">({kpis.wonDemos}/{kpis.totalDemos})</span></div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium">💰 มูลค่างานที่ปิดได้</span>
              <div className="text-xl font-extrabold text-emerald-300 font-mono">{formatCurrency(kpis.wonValue)}</div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <span>🔍 ตัวกรอง:</span>
            </div>

            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none"
            >
              <option value="all">กรองทุกรุ่นสินค้า</option>
              {(products || []).map(p => (
                <option key={p.id} value={p.id}>📦 {p.name}</option>
              ))}
            </select>

            <select
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none"
            >
              <option value="all">กรองทุกพนักงานขาย</option>
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>👤 {m.name}</option>
              ))}
            </select>

            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 outline-none"
            >
              <option value="all">กรองทุกสถานะผลลัพธ์</option>
              <option value="กำลังทดสอบ / รอผล">⏳ กำลังทดสอบ / รอผล</option>
              <option value="ชนะประมูล / ปิดการขายสำเร็จ">🏆 ชนะประมูล / ปิดการขายสำเร็จ</option>
              <option value="แพ้ประมูล / ปิดไม่สำเร็จ">❌ แพ้ประมูล / ปิดไม่สำเร็จ</option>
            </select>

            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-1.5 px-2 text-slate-200 outline-none font-mono text-[11px]"
                title="ตั้งแต่วันที่"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl p-1.5 px-2 text-slate-200 outline-none font-mono text-[11px]"
                title="ถึงวันที่"
              />
            </div>

            {(filterProduct !== 'all' || filterSales !== 'all' || filterOutcome !== 'all' || dateStart || dateEnd) && (
              <button
                onClick={() => { setFilterProduct('all'); setFilterSales('all'); setFilterOutcome('all'); setDateStart(''); setDateEnd(''); }}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline font-semibold ml-auto"
              >
                ✕ ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* View Mode Tabs */}
          <div className="flex border-b border-slate-800 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('journey')}
              className={'pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ' + (activeTab === 'journey' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200')}
            >
              <span>🏥 1. รายละเอียดประวัติการเดินทางของเครื่อง (Journey Log)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">{filteredData.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('machine_stats')}
              className={'pb-2.5 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ' + (activeTab === 'machine_stats' ? 'border-purple-500 text-purple-300' : 'border-transparent text-slate-400 hover:text-slate-200')}
            >
              <span>📦 2. สรุปสถิติ & ประสิทธิภาพรายเครื่อง (Machine Performance)</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px]">{machineStats.length}</span>
            </button>
          </div>

          {/* Tab 1: Detailed Journey Table */}
          {activeTab === 'journey' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
              <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10.5px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 px-3 text-center w-12 border-r border-slate-800">ลำดับ</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 min-w-[160px]">โรงพยาบาล / หน่วยงาน</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 min-w-[160px]">รุ่นเครื่อง & หมายเลข S/N</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 w-32">ผู้รับผิดชอบ</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 text-center w-28">ช่วงวันที่เดโม่</th>
                    <th className="p-2.5 px-2 text-center w-20 border-r border-slate-800">วางไว้ (วัน)</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 text-right w-28">ค่าใช้จ่ายเดโม่</th>
                    <th className="p-2.5 px-3 text-center w-36">ผลลัพธ์ / สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/60 font-sans">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 italic">
                        ไม่พบข้อมูลประวัติการ Demo ตามตัวกรองที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80">
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>🏥</span> <span>{b.hospitalName}</span>
                          </div>
                          {b.note && <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">📝 {b.note}</div>}
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80">
                          <div className="font-semibold text-purple-200">{b.productName}</div>
                          <div className="font-mono text-[10.5px] text-amber-300 font-bold mt-0.5">🔖 S/N: {b.demoSerial}</div>
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80 text-slate-300 font-medium">
                          👤 {b.salesPerson}
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80 font-mono text-[11px] text-slate-300 text-center">
                          <div>{b.startDate}</div>
                          <div className="text-[10px] text-slate-500">ถึง {b.endDate}</div>
                        </td>
                        <td className="p-2.5 px-2 border-r border-slate-800/80 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold text-xs">
                            {b.days} วัน
                          </span>
                        </td>
                        <td className="p-2.5 px-3 border-r border-slate-800/80 text-right font-mono font-bold text-amber-300">
                          {b.expense > 0 ? formatCurrency(b.expense) : <span className="text-slate-600 font-normal">-</span>}
                        </td>
                        <td className="p-2.5 px-3 text-center">
                          {b.outcome && (b.outcome.includes('ชนะ') || b.outcome.includes('สำเร็จ')) ? (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-bold inline-flex items-center gap-1">
                              <span>🏆</span> <span>ชนะประมูล/ปิดยอด</span>
                            </span>
                          ) : b.outcome && b.outcome.includes('แพ้') ? (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10.5px] font-bold inline-flex items-center gap-1">
                              <span>❌</span> <span>ไม่ผ่าน/แพ้ประมูล</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10.5px] font-semibold inline-flex items-center gap-1">
                              <span>⏳</span> <span>กำลังทดสอบ/รอผล</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Machine Utilization & Performance */}
          {activeTab === 'machine_stats' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-md">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10.5px] border-b border-slate-800">
                  <tr>
                    <th className="p-2.5 px-3 text-center w-12 border-r border-slate-800">ลำดับ</th>
                    <th className="p-2.5 px-3 border-r border-slate-800">รุ่นเครื่องสาธิต</th>
                    <th className="p-2.5 px-3 border-r border-slate-800 w-36">Serial Number</th>
                    <th className="p-2.5 px-2 text-center w-24 border-r border-slate-800">จำนวนครั้งเดโม่</th>
                    <th className="p-2.5 px-2 text-center w-24 border-r border-slate-800">รวมวันที่ใช้งาน</th>
                    <th className="p-2.5 px-3 text-right w-32 border-r border-slate-800">ค่าใช้จ่ายสะสม</th>
                    <th className="p-2.5 px-3 text-center w-28 border-r border-slate-800">Win Rate</th>
                    <th className="p-2.5 px-3 min-w-[160px]">สถานที่ล่าสุดที่ไป</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 bg-slate-900/60 font-sans">
                  {machineStats.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 italic">
                        ไม่มีข้อมูลเครื่องสาธิต
                      </td>
                    </tr>
                  ) : (
                    machineStats.map((m, idx) => {
                      const winPct = m.count > 0 ? ((m.wonCount / m.count) * 100).toFixed(0) : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2.5 text-center font-mono font-bold text-slate-400 border-r border-slate-800/80">{idx + 1}</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 font-bold text-white">{m.productName}</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 font-mono font-bold text-amber-300">{m.serial}</td>
                          <td className="p-2.5 px-2 border-r border-slate-800/80 text-center font-mono font-bold text-purple-300">{m.count} ครั้ง</td>
                          <td className="p-2.5 px-2 border-r border-slate-800/80 text-center font-mono font-bold text-cyan-300">{m.totalDays} วัน</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 text-right font-mono font-bold text-amber-300">{formatCurrency(m.totalExpense)}</td>
                          <td className="p-2.5 px-3 border-r border-slate-800/80 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-xs">
                              {winPct}% ({m.wonCount}/{m.count})
                            </span>
                          </td>
                          <td className="p-2.5 px-3 text-slate-300">
                            <div className="font-semibold">{m.lastHospital}</div>
                            <div className="text-[10px] text-slate-500">สิ้นสุด: {m.lastDate}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod05_calendar/MonthCalendarGrid.js ---
// MODULE: mod05_calendar/MonthCalendarGrid.js

function MonthCalendarGrid({ currentMonth, bookings = [], products = [], onPrevMonth, onNextMonth, onTodayMonth, onDeleteBooking }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getBookingsForDay = (dayNum) => {
    if (!dayNum) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return bookings.filter(b => {
      if (!b.startDate || !b.endDate) return false;
      return dateStr >= b.startDate && dateStr <= b.endDate;
    });
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗓️ {monthNames[month]} {year + 543}</span>
            <span className="text-xs font-normal text-slate-400 font-mono">({year})</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700"
          >
            ◀ เดือนก่อน
          </button>
          <button
            onClick={onTodayMonth}
            className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs rounded-xl border border-purple-700 font-semibold"
          >
            เดือนปัจจุบัน
          </button>
          <button
            onClick={onNextMonth}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700"
          >
            เดือนถัดไป ▶
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayNames.map((d, i) => (
          <div key={d} className={`text-center py-2 text-xs font-bold ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-amber-400' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}

        {calendarDays.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="bg-slate-950/40 rounded-xl min-h-[90px] p-1 border border-slate-900/40"></div>;
          }

          const dayBookings = getBookingsForDay(dayNum);
          const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;

          return (
            <div
              key={`day-${dayNum}`}
              className={`bg-slate-900/80 rounded-xl min-h-[100px] p-1.5 border transition-colors space-y-1 relative flex flex-col justify-between ${
                isToday ? 'border-purple-500 bg-purple-950/30' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  isToday ? 'bg-purple-500 text-white' : 'text-slate-300'
                }`}>
                  {dayNum}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">
                    {dayBookings.length} คิว
                  </span>
                )}
              </div>

              <div className="space-y-1 max-h-[80px] overflow-y-auto pr-0.5">
                {dayBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-1 rounded bg-purple-900/60 border border-purple-700/60 text-[9.5px] leading-tight space-y-0.5 group relative"
                    title={`${b.hospitalName} - ${b.productName} (โดย ${b.salesPerson})`}
                  >
                    <div className="font-bold text-white line-clamp-1">{b.hospitalName}</div>
                    <div className="text-purple-200 line-clamp-1">{b.productName}</div>
                    <div className="text-emerald-300 text-[8.5px]">👤 {b.salesPerson}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod06_fda/AnalyticalReportsView.js ---
// MODULE: mod06_fda/AnalyticalReportsView.js

function AnalyticalReportsView({ projects = [], members = [], products = [], costCalculations = [], purchaseOrders = [], shipments = [], messengerTrips = [], repairTickets = [], soldProducts = [], fdaRegistrations = [], leaveRequests = [], attendanceLogs = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeReportModal, setActiveReportModal] = useState(null);

  // Compute master KPI summaries across all modules
  const totalProjectValue = useMemo(() => projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0), [projects]);
  const wonProjectsValue = useMemo(() => projects.filter(p => p.stage === 'ชนะประมูล (Won)').reduce((sum, p) => sum + (Number(p.budget) || 0), 0), [projects]);
  const totalMessengerFee = useMemo(() => messengerTrips.reduce((sum, t) => sum + (Number(t.feeAmount) || 0), 0), [messengerTrips]);
  const totalMessengerKm = useMemo(() => messengerTrips.reduce((sum, t) => sum + (Number(t.distanceKm) || 0), 0), [messengerTrips]);
  const totalPOAmount = useMemo(() => purchaseOrders.reduce((sum, po) => sum + (Number(po.totalPrice) || 0), 0), [purchaseOrders]);
  const pendingPOCount = useMemo(() => purchaseOrders.filter(po => po.status?.includes('รอสั่ง') || po.status?.includes('รอ')).length, [purchaseOrders]);
  const activeFDACount = useMemo(() => fdaRegistrations.filter(f => f.status?.includes('ยื่น') || f.status?.includes('พิจารณา')).length, [fdaRegistrations]);
  const activeRepairCount = useMemo(() => repairTickets.filter(r => !r.status?.includes('เสร็จ')).length, [repairTickets]);

  const reportCategories = [
    { id: 'all', label: '🌐 รายงานทุกหมวดหมู่' },
    { id: 'sales', label: '📊 รายงานยอดขาย & โครงการ' },
    { id: 'clients', label: '🏥 รายงานลูกค้าโรงพยาบาล' },
    { id: 'logistic', label: '🚚 รายงานสินค้า & ขนส่ง & ซ่อม' },
    { id: 'messenger', label: '🛵 รายงานรอบวิ่งแมสเซ็นเจอร์' },
    { id: 'finance', label: '💰 รายงานการเงิน & จัดซื้อ PO' },
    { id: 'fda', label: '🛡️ รายงานทะเบียน อย.' },
    { id: 'hr', label: '👥 รายงานสถิติ HR & วันลา' }
  ];

  const reportCards = [
    {
      id: 'rpt-sales-summary',
      category: 'sales',
      title: '📊 รายงานสรุปผลงานยอดขาย & ท่อส่งโครงการ (Sales Pipeline Report)',
      icon: '📈',
      desc: 'สรุปมูลค่างานชนะประมูล, โครงการที่กำลังเสนอราคา, อัตรา Win Rate และการวิเคราะห์ผลงานรายบุคคล',
      stat1Label: 'มูลค่าชนะประมูลรวม',
      stat1Val: `${((Number(wonProjectsValue) || 0) / 1000000).toFixed(2)} ล้านบาท`,
      stat2Label: 'จำนวนโครงการทั้งหมด',
      stat2Val: `${(projects || []).length} โครงการ`,
      data: projects
    },
    {
      id: 'rpt-hospital-clients',
      category: 'clients',
      title: '🏥 รายงานจัดอันดับสถาบันทางการแพทย์ & ลูกค้า รพ. (Hospital Client Report)',
      icon: '🏥',
      desc: 'วิเคราะห์ยอดการสั่งซื้อแยกตาม รพ., เปรียบเทียบสัดส่วน รพ. รัฐบาล vs เอกชน และรายชื่อแพทย์ผู้สั่งซื้อ',
      stat1Label: 'รพ. พันธมิตรทั้งหมด',
      stat1Val: `${new Set((projects || []).map(p => p.hospitalName)).size} โรงพยาบาล`,
      stat2Label: 'งบประมาณรวมสะสม',
      stat2Val: `${((Number(totalProjectValue) || 0) / 1000000).toFixed(2)} ล้านบาท`,
      data: projects
    },
    {
      id: 'rpt-messenger-trips',
      category: 'messenger',
      title: '🛵 รายงานสรุปค่าเที่ยว & รอบวิ่งงานแมสเซ็นเจอร์ (Messenger Trip & Allowance Report)',
      icon: '🛵',
      desc: 'สรุปจำนวนรอบวิ่งงาน, ระยะทางสะสม (กม.), รายละเอียดการขนส่งเอกสาร/เครื่อง และสรุปค่าเที่ยวจ่ายประจำเดือน',
      stat1Label: 'รวมรอบวิ่งทั้งหมด',
      stat1Val: `${messengerTrips.length} เที่ยว`,
      stat2Label: 'รวมจ่ายค่าเที่ยว',
      stat2Val: `${totalMessengerFee.toLocaleString()} บาท`,
      data: messengerTrips
    },
    {
      id: 'rpt-finance-po',
      category: 'finance',
      title: '💰 รายงานวิเคราะห์กำไรขั้นต้น & ใบสั่งซื้อ Vendor (Finance & PO Report)',
      icon: '🧮',
      desc: 'วิเคราะห์อัตรากำไรขั้นต้น (% Margin), สรุปต้นทุนสินค้า CIF, และติดตามสถานะใบสั่งซื้อ Vendor PO',
      stat1Label: 'รวมมูลค่าสั่งซื้อ PO',
      stat1Val: `${totalPOAmount.toLocaleString()} บาท`,
      stat2Label: 'PO รอสั่งสินค้า',
      stat2Val: `${pendingPOCount} รายการ`,
      data: purchaseOrders
    },
    {
      id: 'rpt-logistic-repair',
      category: 'logistic',
      title: '🚚 รายงานสถานะสินค้าคลัง Demo & ทะเบียนส่งซ่อม (Logistic & Repairs Report)',
      icon: '📦',
      desc: 'ติดตามสถานะเครื่อง Demo ในคลัง, ล็อตสินค้านำเข้าจากต่างประเทศ, และสถิติสินค้าส่งซ่อม Repair Service',
      stat1Label: 'สินค้า Demo ในระบบ',
      stat1Val: `${products.length} รายการ`,
      stat2Label: 'เครื่องอยู่ระหว่างส่งซ่อม',
      stat2Val: `${activeRepairCount} เครื่อง`,
      data: repairTickets
    },
    {
      id: 'rpt-fda-compliance',
      category: 'fda',
      title: '🛡️ รายงานติดตามการจดทะเบียน อย. (Thai FDA Compliance Status Report)',
      icon: '🛡️',
      desc: 'สรุปใบอนุญาตเครื่องมือแพทย์ อย. ที่อนุมัติแล้ว, คำขอที่อยู่ระหว่างดำเนินการ, และการเตือนวันหมดอายุ',
      stat1Label: 'ทะเบียน อย. ในระบบ',
      stat1Val: `${fdaRegistrations.length} คำขอ`,
      stat2Label: 'คำขอรออนุมัติ',
      stat2Val: `${activeFDACount} คำขอ`,
      data: fdaRegistrations
    },
    {
      id: 'rpt-hr-attendance',
      category: 'hr',
      title: '👥 รายงานสรุปสถิติวันลา & ขาด ลา มาสาย (HR Leave & Attendance Report)',
      icon: '📅',
      desc: 'สรุปวันลาป่วย ลากิจ ลาพักร้อนของทีมงานทุกคน สถิติการมาสาย ขาดงาน และยอดเงินหักค่าปรับประจำเดือน',
      stat1Label: 'ใบขอลาทั้งหมด',
      stat1Val: `${leaveRequests.length} รายการ`,
      stat2Label: 'บันทึกการสาย/ขาด',
      stat2Val: `${attendanceLogs.length} รายการ`,
      data: leaveRequests
    }
  ];

  const filteredReportCards = useMemo(() => {
    if (selectedCategory === 'all') return reportCards;
    return reportCards.filter(c => c.category === selectedCategory);
  }, [selectedCategory, reportCards]);

  const handleExportMasterCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "=== AERON MEDICAL EXECUTIVE SUMMARY REPORT ===\n";
    csvContent += `Generated Date,${new Date().toLocaleString('th-TH')}\n`;
    csvContent += `Total Projects,${projects.length}\n`;
    csvContent += `Total Project Value (THB),${totalProjectValue}\n`;
    csvContent += `Won Projects Value (THB),${wonProjectsValue}\n`;
    csvContent += `Total Messenger Trips,${messengerTrips.length}\n`;
    csvContent += `Total Messenger Distance (km),${totalMessengerKm}\n`;
    csvContent += `Total Messenger Allowance (THB),${totalMessengerFee}\n`;
    csvContent += `Total Vendor PO Amount (THB),${totalPOAmount}\n\n`;

    csvContent += "--- SALES PROJECTS BREAKDOWN ---\n";
    csvContent += "ID,Hospital Name,Project Name,Budget (THB),Stage,Assignee,Client Type\n";
    projects.forEach(p => {
      csvContent += `"${p.id}","${p.hospitalName}","${p.projectName}",${p.budget},"${p.stage}","${p.assignee}","${p.clientType}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AERON_Executive_Summary_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
            📊
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ศูนย์รวมรายงานสรุปเชิงวิเคราะห์ & ออกเอกสาร (Executive & Operational Reports)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                {reportCards.length} ฉบับ
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ดึงข้อมูลวิเคราะห์จากทุกระบบ (ยอดขาย, สินค้า, ขนส่ง, ค่าเที่ยวแมสเซ็นเจอร์, กำไรการเงิน, อย. และ HR) มาออกเป็นรายงานสรุปทางการ
            </p>
          </div>
        </div>

        <button
          onClick={handleExportMasterCSV}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform hover:scale-105"
        >
          <span>📥 Export Master CSV (รวมข้อมูลทุกหมวด)</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 text-xs">
        {reportCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Overview Analytics Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">มูลค่าชนะประมูลรวม (Won)</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
              {((Number(wonProjectsValue) || 0) / 1000000).toFixed(2)} <span className="text-xs text-slate-400 font-normal">ลบ.</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl">💰</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">รอบวิ่งแมสเซ็นเจอร์รวม</div>
            <div className="text-xl font-extrabold text-teal-300 mt-1 font-mono">
              {(messengerTrips || []).length} <span className="text-xs text-slate-400 font-normal">เที่ยว ({totalMessengerFee.toLocaleString()}บ.)</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-xl">🛵</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">สั่งซื้อ Vendor PO รวม</div>
            <div className="text-xl font-extrabold text-blue-300 mt-1 font-mono">
              {((Number(totalPOAmount) || 0) / 1000000).toFixed(2)} <span className="text-xs text-slate-400 font-normal">ลบ.</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-xl">🛒</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">ทะเบียน อย. รออนุมัติ</div>
            <div className="text-xl font-extrabold text-amber-300 mt-1 font-mono">
              {activeFDACount} <span className="text-xs text-slate-400 font-normal">คำขอ</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl">🛡️</div>
        </div>
      </div>

      {/* Reports Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReportCards.map(rpt => (
          <div key={rpt.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{rpt.icon}</span>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {rpt.category}
                </span>
              </div>
              <h3 className="font-extrabold text-white text-base leading-snug">
                {rpt.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {rpt.desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">{rpt.stat1Label}</span>
                <div className="font-mono font-bold text-teal-300 mt-0.5">{rpt.stat1Val}</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">{rpt.stat2Label}</span>
                <div className="font-mono font-bold text-purple-300 mt-0.5">{rpt.stat2Val}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setActiveReportModal(rpt)}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-transform hover:scale-105"
              >
                <span>👁️ เรียกดูรายงาน & พิมพ์เอกสาร</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview Modal */}
      {activeReportModal && (
        <ReportPreviewModal
          report={activeReportModal}
          projects={projects}
          messengerTrips={messengerTrips}
          purchaseOrders={purchaseOrders}
          repairTickets={repairTickets}
          fdaRegistrations={fdaRegistrations}
          leaveRequests={leaveRequests}
          onClose={() => setActiveReportModal(null)}
        />
      )}
    </div>
  );
}


// --- Module File: js/modules/mod06_fda/FDAModal.js ---
// MODULE: mod06_fda/FDAModal.js

function FDAModal({ fda, products = [], members = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (fda) return { ...fda };
    const firstProd = products[0] || {};
    const delivYr = new Date().getFullYear();

    return {
      registrationNumber: `FDA-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      fdaLicenseNo: '',
      productName: firstProd.name || '',
      brand: firstProd.brand || 'AERON MEDICAL',
      vendorName: firstProd.manufacturer || 'Mindray Medical Singapore',
      deviceClass: 'Class 1',
      targetDays: 30,
      agencyName: 'Pharmatech FDA Consulting Co., Ltd.',
      raSpecialist: members[0] ? members[0].name : 'ภก. วิศรุต ธรรมรักษ์',
      costTHB: 50000,
      submissionType: 'ยื่นขอใหม่',
      paymentDate: new Date().toISOString().split('T')[0],
      approvalDate: '',
      expiryDate: '',
      status: window.FDA_STATUSES[0],
      notes: ''
    };
  });

  const handleClassSelect = (classCode) => {
    const clsObj = window.FDA_CLASSES.find(c => c.code === classCode);
    if (clsObj) {
      setFormData(prev => ({
        ...prev,
        deviceClass: clsObj.code,
        targetDays: clsObj.targetDays
      }));
    }
  };

  const handleProductSelect = (pName) => {
    const p = products.find(x => x.name === pName);
    if (p) {
      setFormData(prev => ({
        ...prev,
        productName: p.name,
        brand: p.brand || prev.brand,
        vendorName: p.manufacturer || prev.vendorName
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.vendorName.trim()) {
      alert('กรุณากรอกชื่อสินค้าและบริษัทผู้ผลิต');
      return;
    }
    onSave({
      ...formData,
      costTHB: Number(formData.costTHB) || 0,
      targetDays: Number(formData.targetDays) || 30
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🛡️ {fda ? 'แก้ไขข้อมูลการยื่นขอ อย.' : 'บันทึกการยื่นขอ อย. ใหม่ (Thai FDA Registration)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รหัสอ้างอิงคำขอ / FDA ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ใบรับจดแจ้ง / ใบอนุญาต อย.</label>
              <input
                type="text"
                placeholder="เช่น 65-1-2-2-0008891 (ถ้ามี)"
                value={formData.fdaLicenseNo}
                onChange={(e) => setFormData({ ...formData, fdaLicenseNo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลือกสินค้าในแคตตาล็อก <span className="text-rose-400">*</span></label>
              <select
                value={formData.productName}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              >
                {(products || []).map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ยี่ห้อ (Brand)</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทผู้ผลิต / Vendor ต่างประเทศ <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">Class เครื่องมือแพทย์ (เกณฑ์เวลา อย.) <span className="text-rose-400">*</span></label>
              <select
                value={formData.deviceClass}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold outline-none"
              >
                {window.FDA_CLASSES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">จำนวนวันทำการเกณฑ์ SLA อย.</label>
              <input
                type="number"
                value={formData.targetDays}
                onChange={(e) => setFormData({ ...formData, targetDays: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทที่ทำหน้าที่รับจด</label>
              <input
                type="text"
                placeholder="เช่น Pharmatech FDA Consulting"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้รับผิดชอบ RA / เภสัชกร</label>
              <input
                type="text"
                placeholder="เช่น ภก. วิศรุต"
                value={formData.raSpecialist}
                onChange={(e) => setFormData({ ...formData, raSpecialist: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ราคาค่าจด อย. (บาท)</label>
              <input
                type="number"
                value={formData.costTHB}
                onChange={(e) => setFormData({ ...formData, costTHB: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">วันที่เริ่มจ่ายเงิน / ยื่นคำขอ <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-emerald-400 font-semibold">วันที่เสร็จ / อนุมัติใบอนุญาต</label>
              <input
                type="date"
                value={formData.approvalDate}
                onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-orange-400 font-semibold">วันที่ใบ อย. หมดอายุ</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">สถานะคำขอปัจจุบัน <span className="text-rose-400">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
              >
                {window.FDA_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทการยื่น</label>
              <select
                value={formData.submissionType}
                onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                <option value="ยื่นขอใหม่">ยื่นขอใหม่ (New Filing)</option>
                <option value="ยื่นขอต่ออายุ">ยื่นขอต่ออายุ (Renewal)</option>
                <option value="ขอแก้ไขรายการ">ขอแก้ไขรายการ (Amendment)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / ประวัติการแก้ไขตามสั่ง อย.</label>
            <input
              type="text"
              placeholder="ระบุข้อความหรือประวัติการติดต่อกับเจ้าหน้าที่ อย...."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/30">
              บันทึกรายการจด อย.
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod06_fda/FDARegistrationView.js ---
// MODULE: mod06_fda/FDARegistrationView.js

function FDARegistrationView({ fdaRegistrations = [], products = [], members = [], onOpenNewFDA, onEditFDA, onDeleteFDA }) {
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFDA, setPreviewFDA] = useState(null);

  // Filtered FDA Registrations
  const filteredFDAs = useMemo(() => {
    return fdaRegistrations.filter(f => {
      if (filterClass !== 'all' && f.deviceClass !== filterClass) return false;
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mReg = (f.registrationNumber || '').toLowerCase().includes(q);
        const mLic = (f.fdaLicenseNo || '').toLowerCase().includes(q);
        const mProd = (f.productName || '').toLowerCase().includes(q);
        const mVendor = (f.vendorName || '').toLowerCase().includes(q);
        const mAgency = (f.agencyName || '').toLowerCase().includes(q);
        const mRA = (f.raSpecialist || '').toLowerCase().includes(q);
        return mReg || mLic || mProd || mVendor || mAgency || mRA;
      }
      return true;
    });
  }, [fdaRegistrations, filterClass, filterStatus, searchQuery]);

  // Metrics KPI
  const totalRegistrations = filteredFDAs.length;
  const approvedCount = filteredFDAs.filter(f => f.status === 'อนุมัติใบอนุญาตแล้ว').length;
  
  // Overdue count (Red Alert)
  const overdueCount = filteredFDAs.filter(f => {
    if (f.status === 'อนุมัติใบอนุญาตแล้ว') return false;
    const elapsed = calculateWorkingDays(f.paymentDate, f.approvalDate);
    const target = f.targetDays || 30;
    return elapsed > target;
  }).length;

  // Expiring count (Orange Alert <= 6 months)
  const expiringCount = filteredFDAs.filter(f => {
    if (!f.expiryDate) return false;
    const exp = new Date(f.expiryDate);
    const today = new Date();
    const diffMonths = (exp.getFullYear() - today.getFullYear()) * 12 + (exp.getMonth() - today.getMonth());
    return diffMonths >= 0 && diffMonths <= 6;
  }).length;

  const totalCost = filteredFDAs.reduce((sum, f) => sum + (Number(f.costTHB) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
            🛡️
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>การจดทะเบียน อย. เครื่องมือแพทย์ (Thai FDA Medical Device Registration)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                REGULATORY COMPLIANCE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามระยะเวลา SLA ใบอนุญาต อย. ตาม Class เครื่องมือแพทย์ เตือนความเสี่ยงเกินกำหนด และวันหมดอายุต่อสัญญา
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewFDA(null)}
          className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ บันทึกการยื่นขอ อย. ใหม่</span>
        </button>
      </div>

      {/* SLA Benchmarks Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟢 Class 1 (ความเสี่ยงต่ำ)</span>
            <span className="text-emerald-400 font-mono">30 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับจดแจ้ง (Low Risk Medical Device)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟡 Class 2 (เสี่ยงปานกลางต่ำ)</span>
            <span className="text-amber-400 font-mono">120 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับแจ้งรายการละเอียด (90 - 150 วัน)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟠 Class 3 (เสี่ยงปานกลางสูง)</span>
            <span className="text-orange-400 font-mono">180 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับแจ้งรายการละเอียด (150 - 200 วัน)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🔴 Class 4 (ความเสี่ยงสูง)</span>
            <span className="text-rose-400 font-mono">300 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบอนุญาต (High Risk / Invasive Device)</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📋 ยื่นขอ อย. ทั้งหมด</span>
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">📄</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-tight font-mono">
            {totalRegistrations} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            อนุมัติแล้ว {approvedCount} รายการ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🚨 ยื่นเกินเวลา อย. (Overdue)</span>
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">🚨</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight font-mono">
            {overdueCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-rose-300 font-medium">
            เกินจำนวนวันทำการที่ อย. กำหนด
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🟧 ใบอย. ใกล้หมดอายุ (6 เดือน)</span>
            <span className="p-1 rounded-lg bg-orange-500/20 text-orange-300">🔔</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-400 tracking-tight font-mono">
            {expiringCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-orange-300 font-medium">
            ต้องเริ่มดำเนินการยื่นต่ออายุ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💵 รวมค่าใช้จ่ายจด อย.</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalCost)}
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าธรรมเนียม + ค่าบริการเอเยนต์
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางติดตามสถานะ อย. และการแจ้งเตือน SLA (FDA Registrations)</span>
            </h3>
            <p className="text-xs text-slate-400">ระบบเตือนสีแดง (เกิน SLA), สีเหลือง (สุ่มเสี่ยงเหลือ 30%), สีส้ม (ใกล้หมดอายุ 6 เดือน)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา สินค้า / เลข อย. / บริษัท / เอเยนต์ / RA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุก Class อย.</option>
              {(window.FDA_CLASSES || []).map(c => typeof c === 'object' ? (
                <option key={c.code || c.label} value={c.code || c.label}>{c.label || c.code}</option>
              ) : (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะ</option>
              {(window.FDA_STATUSES || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FDA Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่คำขอ / เลขใบอนุญาต อย.</th>
                <th className="p-3">สินค้าที่จด & บริษัทผู้ผลิต</th>
                <th className="p-3">Class ความเสี่ยง & บริษัทรับจด</th>
                <th className="p-3 text-center">วันเริ่มจ่ายเงิน ➔ อนุมัติ</th>
                <th className="p-3 text-center">วันทำการที่ใช้ / เกณฑ์ SLA</th>
                <th className="p-3 text-center">วันหมดอายุใบ อย.</th>
                <th className="p-3 text-right">ค่าบริการจด (บาท)</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFDAs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการจดทะเบียน อย. ตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredFDAs.map(fda => {
                  const elapsedDays = calculateWorkingDays(fda.paymentDate, fda.approvalDate);
                  const targetDays = fda.targetDays || 30;
                  const isApproved = fda.status === 'อนุมัติใบอนุญาตแล้ว';

                  // SLA Alert Logic
                  const isOverdue = !isApproved && elapsedDays > targetDays;
                  const isWarningSLA = !isApproved && !isOverdue && elapsedDays >= Math.floor(targetDays * 0.7);

                  // License Expiry Logic (< 6 months)
                  let isNearExpiry = false;
                  if (fda.expiryDate) {
                    const exp = new Date(fda.expiryDate);
                    const today = new Date();
                    const diffMonths = (exp.getFullYear() - today.getFullYear()) * 12 + (exp.getMonth() - today.getMonth());
                    if (diffMonths >= 0 && diffMonths <= 6) {
                      isNearExpiry = true;
                    }
                  }

                  // Row background style based on alert
                  let rowStyle = 'hover:bg-slate-800/40';
                  if (isOverdue) rowStyle = 'bg-rose-950/20 hover:bg-rose-950/40 border-l-4 border-l-rose-500';
                  else if (isWarningSLA) rowStyle = 'bg-amber-950/20 hover:bg-amber-950/40 border-l-4 border-l-amber-500';
                  else if (isNearExpiry) rowStyle = 'bg-orange-950/20 hover:bg-orange-950/40 border-l-4 border-l-orange-500';

                  return (
                    <tr key={fda.id} className={`transition-colors ${rowStyle}`}>
                      
                      {/* Registration & License Number */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-amber-300">{fda.registrationNumber}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-emerald-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {fda.fdaLicenseNo || 'รอใบอนุญาต'}
                        </div>
                      </td>

                      {/* Product Name & Vendor */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{fda.productName}</div>
                        <div className="text-[10px] text-indigo-300">แบรนด์: {fda.brand}</div>
                        <div className="text-[10.5px] text-slate-400 font-medium">🏭 {fda.vendorName}</div>
                      </td>

                      {/* Class & Agency */}
                      <td className="p-3">
                        <div className="font-bold text-amber-400">{fda.deviceClass}</div>
                        <div className="text-[10px] text-slate-300">🏢 {fda.agencyName}</div>
                        <div className="text-[10px] text-indigo-300">👤 {fda.raSpecialist}</div>
                      </td>

                      {/* Payment & Approval Date */}
                      <td className="p-3 text-center font-mono text-[10.5px]">
                        <div className="text-slate-400">เริ่ม: <span className="text-white font-semibold">{fda.paymentDate}</span></div>
                        <div className="text-emerald-300 font-bold mt-0.5">เสร็จ: {fda.approvalDate || 'กำลังดำเนินการ'}</div>
                      </td>

                      {/* Elapsed Working Days & SLA Badge */}
                      <td className="p-3 text-center space-y-1 font-mono">
                        <div className="font-bold text-sm text-slate-100">
                          {elapsedDays} <span className="text-[10px] font-normal text-slate-400">วันทำการ</span>
                        </div>

                        <div>
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              🚨 เกิน SLA ({targetDays} วัน)
                            </span>
                          ) : isWarningSLA ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ⚠️ สุ่มเสี่ยง (เหลือ 30%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              เกณฑ์มาตรฐาน {targetDays} วัน
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiration Date & Expiry Alert */}
                      <td className="p-3 text-center font-mono">
                        <div className="font-bold text-slate-200 text-[11px]">{fda.expiryDate || 'ยังไม่มีวันหมดอายุ'}</div>
                        {isNearExpiry && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-bounce">
                              🟧 เตือนยื่นต่ออายุ 6 เดือน
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(fda.costTHB)}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewFDA(fda)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบ อย."
                        >
                          👁️ ดู
                        </button>
                        <button
                          onClick={() => onEditFDA(fda)}
                          className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 text-xs rounded-lg border border-amber-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteFDA(fda.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FDA Certificate Preview Modal */}
      {previewFDA && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  THAI FDA COMPLIANCE CERTIFICATE
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewFDA.registrationNumber}</h3>
                <p className="text-xs text-emerald-300 font-mono font-bold">เลขที่ใบอนุญาต อย.: {previewFDA.fdaLicenseNo || 'อยู่ระหว่างพิจารณา'}</p>
              </div>
              <button onClick={() => setPreviewFDA(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">รายละเอียดสินค้า & ผู้ผลิต:</div>
                <div className="font-bold text-white text-sm mt-0.5">{previewFDA.productName}</div>
                <div className="text-indigo-300">แบรนด์: {previewFDA.brand}</div>
                <div className="text-slate-400">ผู้ผลิต: {previewFDA.vendorName}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการรับจด อย.:</div>
                <div className="text-amber-400 font-bold mt-0.5">Class ความเสี่ยง: {previewFDA.deviceClass}</div>
                <div className="text-slate-300">บริษัทรับจด: {previewFDA.agencyName}</div>
                <div className="text-purple-300 font-semibold">ผู้ดูแล RA: {previewFDA.raSpecialist}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-bold">วันเริ่มจ่ายเงิน/ยื่น:</span>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{previewFDA.paymentDate}</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">วันอนุมัติเสร็จ:</span>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{previewFDA.approvalDate || 'กำลังรอดำเนินการ'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">วันหมดอายุใบ อย.:</span>
                <div className="text-orange-400 font-bold text-sm mt-0.5">{previewFDA.expiryDate || 'N/A'}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📍 สถานะขั้นตอนคำขอ</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {previewFDA.status}
                </span>
                <span className="text-slate-400">ค่าธรรมเนียมรวม: <span className="text-emerald-400 font-bold font-mono">{formatCurrency(previewFDA.costTHB)}</span></span>
              </div>
              {previewFDA.notes && (
                <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                  "{previewFDA.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์รายละเอียด อย.
              </button>
              <button onClick={() => setPreviewFDA(null)} className="px-5 py-2 bg-amber-600 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod06_fda/ReportPreviewModal.js ---
// MODULE: mod06_fda/ReportPreviewModal.js

function ReportPreviewModal({ report = null, projects = [], messengerTrips = [], purchaseOrders = [], repairTickets = [], fdaRegistrations = [], leaveRequests = [], onClose }) {

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 space-y-6 shadow-2xl animate-modal text-xs my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Action Controls Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">{report.icon}</span>
            <h3 className="font-extrabold text-white text-base">{report.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
            >
              <span>🖨️ พิมพ์เอกสาร (Print / PDF)</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-base px-2">✕</button>
          </div>
        </div>

        {/* Printable Formal Document Sheet */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-inner space-y-6 print:p-0 print:shadow-none print:bg-transparent">
          
          {/* Formal Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <img src="./assets/logo.jpg" alt="AERON Logo" className="h-12 w-12 object-contain" />
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-wider">บริษัท แอโรน เมดิคอล จำกัด (AERON MEDICAL CO., LTD.)</h1>
                <p className="text-[11px] text-slate-600">ผู้นำเข้าและจัดจำหน่ายเครื่องมือแพทย์ อุปกรณ์การแพทย์สาธิต และบริการทางการแพทย์</p>
                <p className="text-[10px] text-slate-500">เลขประจำตัวผู้เสียภาษี: 0105565098765 | สำนักงานใหญ่: กรุงเทพมหานคร</p>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <div className="font-bold text-indigo-900">เอกสารรายงานสรุปผู้บริหาร</div>
              <div className="text-slate-600 font-mono">วันที่ออกเอกสาร: {new Date().toLocaleDateString('th-TH')}</div>
              <div className="text-slate-500 font-mono">รหัสรายงาน: {report.id.toUpperCase()}</div>
            </div>
          </div>

          {/* Report Title Banner */}
          <div className="text-center space-y-1 bg-slate-100 p-3 rounded-lg border border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900">{report.title}</h2>
            <p className="text-xs text-slate-600">{report.desc}</p>
          </div>

          {/* Key Summary Boxes */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px] font-bold">{report.stat1Label}</div>
              <div className="text-lg font-black text-indigo-900 font-mono mt-0.5">{report.stat1Val}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[11px] font-bold">{report.stat2Label}</div>
              <div className="text-lg font-black text-emerald-900 font-mono mt-0.5">{report.stat2Val}</div>
            </div>
          </div>

          {/* Report Detailed Data Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">ตารางแสดงรายละเอียดข้อมูลทางการ (Data Detail Table):</h4>
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-[11px] text-slate-800">
                <thead className="bg-slate-200 text-slate-900 uppercase font-bold border-b border-slate-300">
                  {report.category === 'messenger' ? (
                    <tr>
                      <th className="p-2">วันที่</th>
                      <th className="p-2">แมสเซ็นเจอร์</th>
                      <th className="p-2">ต้นทาง ➔ ปลายทาง</th>
                      <th className="p-2 text-center">ระยะทาง (กม.)</th>
                      <th className="p-2">ประเภทวัน</th>
                      <th className="p-2 text-right">ค่าเที่ยว (บาท)</th>
                    </tr>
                  ) : report.category === 'sales' || report.category === 'clients' ? (
                    <tr>
                      <th className="p-2">โรงพยาบาล</th>
                      <th className="p-2">ชื่อโครงการ</th>
                      <th className="p-2">ประเภทลูกค้า</th>
                      <th className="p-2">ผู้ดูแล (Sales)</th>
                      <th className="p-2">สถานะ Stage</th>
                      <th className="p-2 text-right">งบประมาณ (บาท)</th>
                    </tr>
                  ) : report.category === 'finance' ? (
                    <tr>
                      <th className="p-2">เลขที่ PO</th>
                      <th className="p-2">ผู้ขาย (Vendor)</th>
                      <th className="p-2">รายการสินค้า</th>
                      <th className="p-2">วันกำหนดส่ง</th>
                      <th className="p-2">สถานะ</th>
                      <th className="p-2 text-right">รวมเงิน (บาท)</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="p-2">ลำดับ</th>
                      <th className="p-2">รายการ / ชื่ออ้างอิง</th>
                      <th className="p-2">รายละเอียด</th>
                      <th className="p-2">สถานะ</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.category === 'messenger' ? (
                    messengerTrips.slice(0, 15).map((t, idx) => (
                      <tr key={t.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono">{t.date}</td>
                        <td className="p-2 font-bold">{t.messengerName}</td>
                        <td className="p-2">{t.origin} ➔ {t.destination}</td>
                        <td className="p-2 text-center font-mono">{t.distanceKm} กม.</td>
                        <td className="p-2">{t.isHoliday ? '🚩 วันหยุด' : 'วันปกติ'}</td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-900">{t.feeAmount} บาท</td>
                      </tr>
                    ))
                  ) : report.category === 'finance' ? (
                    purchaseOrders.slice(0, 15).map((po, idx) => (
                      <tr key={po.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-bold">{po.poNumber}</td>
                        <td className="p-2">{po.supplierName}</td>
                        <td className="p-2">{po.productName}</td>
                        <td className="p-2 font-mono">{po.expectedDeliveryDate}</td>
                        <td className="p-2">{po.status}</td>
                        <td className="p-2 text-right font-mono font-bold">{Number(po.totalPrice).toLocaleString()} บาท</td>
                      </tr>
                    ))
                  ) : (
                    projects.slice(0, 15).map((p, idx) => (
                      <tr key={p.id || idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold">{p.hospitalName}</td>
                        <td className="p-2">{p.projectName}</td>
                        <td className="p-2">{p.clientType}</td>
                        <td className="p-2">{p.assignee}</td>
                        <td className="p-2">{p.stage}</td>
                        <td className="p-2 text-right font-mono font-bold">{Number(p.budget).toLocaleString()} บาท</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formal Approval Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-[11px] text-slate-700">
            <div className="space-y-8">
              <div className="border-b border-dashed border-slate-400 pb-1 font-mono">ลงชื่อ..........................................................</div>
              <div>
                <div className="font-bold text-slate-900">( ผู้จัดทำรายงาน / Reporter )</div>
                <div className="text-slate-500">ตำแหน่ง: ผู้ช่วยบริหารงานโครงการ</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-dashed border-slate-400 pb-1 font-mono">ลงชื่อ..........................................................</div>
              <div>
                <div className="font-bold text-slate-900">( หัวหน้าฝ่ายปฏิบัติการ / Manager )</div>
                <div className="text-slate-500">ตำแหน่ง: ผู้จัดการฝ่ายปฏิบัติการ</div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-dashed border-slate-400 pb-1 font-mono">ลงชื่อ..........................................................</div>
              <div>
                <div className="font-bold text-slate-900">( คุณตู้ / Owner & Managing Director )</div>
                <div className="text-slate-500">กรรมการผู้จัดการ บริษัท แอโรน เมดิคอล จำกัด</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod07_finance/CostCalculationView.js ---
// MODULE: mod07_finance/CostCalculationView.js

function CostCalculationView({ costCalculations = [], projects = [], members = [], onOpenNewCalc, onEditCalc, onDeleteCalc, onOpenReport }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('excel'); // 'excel' | 'list'

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Number & Currency Formatters
  const fmtExcelNum = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const fmtPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00%';
    return `${Number(val).toFixed(2)}%`;
  };

  // Combine projects from Sales Kanban with calculation records
  const calculatedItems = useMemo(() => {
    return (projects || []).map(proj => {
      const existingCalc = (costCalculations || []).find(c => c.projectId === proj.id || (c.projectName && c.projectName.includes(proj.hospitalName)));
      if (existingCalc) {
        const computed = computeCostSheet(existingCalc);
        return {
          proj,
          calc: existingCalc,
          computed,
          hasCalc: true
        };
      } else {
        // Fallback default calculation object
        let parsedDf = 0;
        let dfMissing = true;
        if (proj.dfAmount) {
          dfMissing = false;
          const numStr = String(proj.dfAmount).replace(/[^0-9.]/g, '');
          parsedDf = Number(numStr) || 0;
        }

        const defaultCalc = {
          id: `temp-${proj.id}`,
          projectId: proj.id,
          projectName: `${proj.hospitalName || ''} - ${proj.title || ''}`,
          sellingPriceInVat: proj.budget || 0,
          costInVat: Math.round((proj.budget || 0) * 0.7),
          dfType: 'amount',
          dfValue: parsedDf,
          dfMissing: dfMissing,
          salesCommPercent: 2.0,
          interestPercent: 7.0,
          taxPercent: 20.0,
          retentionPercent: 5.0,
          date: new Date().toISOString().split('T')[0]
        };

        const computed = computeCostSheet(defaultCalc);
        return {
          proj,
          calc: defaultCalc,
          computed,
          hasCalc: false
        };
      }
    });
  }, [projects, costCalculations]);

  // Date Filtered Items
  const filteredItems = useMemo(() => {
    return calculatedItems.filter(item => {
      const itemDate = item.calc.date || item.proj.procurementDate || item.proj.createdDate || '';
      if (itemDate) {
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
      }

      if (filterStatus === 'has_calc' && !item.hasCalc) return false;
      if (filterStatus === 'no_calc' && item.hasCalc) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.proj.title || '').toLowerCase().includes(q);
        const matchHosp = (item.proj.hospitalName || '').toLowerCase().includes(q);
        const matchAssignee = (item.proj.assignee || '').toLowerCase().includes(q);
        return matchTitle || matchHosp || matchAssignee;
      }
      return true;
    });
  }, [calculatedItems, startDate, endDate, filterStatus, searchQuery]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let totalBudget = 0;
    let totalCost = 0;
    let totalNetProfit = 0;

    filteredItems.forEach(item => {
      totalBudget += Number(item.computed.saleInVat) || 0;
      totalCost += Number(item.computed.costInVat) || 0;
      totalNetProfit += Number(item.computed.netProfitAmount) || 0;
    });

    const avgMargin = totalBudget > 0 ? (totalNetProfit / totalBudget) * 100 : 0;
    return { totalBudget, totalCost, totalNetProfit, avgMargin };
  }, [filteredItems]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Banner & Date Range Controls + View Mode Switcher */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-slate-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400 flex-shrink-0">
            🧮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                COST & MARGIN ANALYTICS
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-400">
                ({filteredItems.length} โครงการ)
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white mt-0.5">ระบบคำนวณต้นทุน กำไรสุทธิ และจุดคุ้มทุน (Cost Sheet Engine)</h2>
          </div>
        </div>

        {/* Date Range Picker & View Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-start xl:justify-end">
          
          {/* 🎛️ View Switcher (ข้างการเลือกช่วงวันที่) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-amber-500/40 text-xs shadow-md">
            <button
              type="button"
              onClick={() => setViewMode('excel')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'excel'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="มุมมองใบคํานวณ Excel Sheet แยกรายโครงการ"
            >
              <span>📊</span>
              <span>แบบ Excel Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 font-black scale-[1.02]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="มุมมองตารางสรุปภาพรวม (List Table)"
            >
              <span>📋</span>
              <span>แบบตารางสรุป</span>
            </button>
          </div>

          {/* High-Contrast Date Range Picker */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 px-2.5 rounded-2xl border border-amber-500/40 text-xs shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span className="hidden sm:inline">ช่วงวันที่:</span>
            </span>
            
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-1.5 px-2 outline-none text-xs"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-1.5 px-2 outline-none text-xs"
            />

            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }} 
                className="text-slate-400 hover:text-white px-1.5 text-xs font-bold"
                title="ล้างช่วงวันที่"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => onOpenReport && onOpenReport('cost_margin_sheet')}
            className="px-3.5 py-2 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            title="ออกรายงานโครงสร้างต้นทุนและส่งออก Excel"
          >
            <span>📑</span>
            <span>รายงาน Cost Sheet</span>
          </button>

          <button
            onClick={() => onOpenNewCalc(null)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>+ สร้าง Cost Sheet</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💰 มูลค่างานรวม (Sales Budget)</div>
          <div className="text-base sm:text-xl font-black font-mono text-white truncate">
            {formatCurrency(summaryMetrics.totalBudget)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📦 ต้นทุนสินค้ารวม (Cost in VAT)</div>
          <div className="text-base sm:text-xl font-black font-mono text-rose-400 truncate">
            {formatCurrency(summaryMetrics.totalCost)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💵 กำไรสุทธิตามคำนวณ (Net Profit)</div>
          <div className="text-base sm:text-xl font-black font-mono text-emerald-400 truncate">
            {formatCurrency(summaryMetrics.totalNetProfit)}
          </div>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📊 อัตรากำไรเฉลี่ย (Avg Margin %)</div>
          <div className="text-base sm:text-xl font-black font-mono text-indigo-300">
            {(Number(summaryMetrics?.avgMargin) || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📊 VIEW 1: EXCEL BREAKDOWN SHEET GRID VIEW (มุมมองใหม่ตามรูป) */}
      {/* ========================================================= */}
      {viewMode === 'excel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>📑</span>
              <span>ใบคํานวณต้นทุนโครงสร้าง Excel (Cost Margin Sheets)</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              แสดง {filteredItems.length} ใบคํานวณ
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-slate-800 p-12 text-center text-slate-400 italic">
              ไม่พบใบคํานวณต้นทุนในช่วงเวลาที่เลือก
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredItems.map(item => {
                const c = item.computed;
                const dateStr = item.calc.date || item.proj.procurementDate || item.proj.createdDate || '-';
                const productCode = item.proj.productId || 'BJ3500';
                const hospital = item.proj.hospitalName || 'ไม่ระบุ รพ.';
                const qtyStr = item.proj.quantity ? `${item.proj.quantity} เครื่อง` : '1 เครื่อง';
                const headerTitle = `${productCode} ${hospital} ${qtyStr}`;

                return (
                  <div 
                    key={item.calc.id} 
                    className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden flex flex-col hover:border-amber-500/60 transition-all group font-sans"
                  >
                    {/* Excel Table Structure */}
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-xs text-slate-200 border-collapse">
                        
                        {/* Header Row: วันที่ | [รหัสรุ่น] [รพ.] [จำนวน] */}
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-700 text-white font-bold">
                            <th className="p-2.5 px-3 text-left w-36 border-r border-slate-700 text-slate-300 font-medium">
                              วันที่
                            </th>
                            <th colSpan="2" className="p-2.5 px-3 text-left text-amber-300 font-bold tracking-wide">
                              <div className="truncate" title={headerTitle}>
                                {headerTitle}
                              </div>
                            </th>
                          </tr>
                          
                          {/* Sub-Header: Blank | % | ราคา */}
                          <tr className="bg-slate-950/80 border-b border-slate-700 text-[11px] text-slate-400 font-mono">
                            <th className="p-1.5 px-3 border-r border-slate-700 text-slate-500 font-normal">
                              {dateStr}
                            </th>
                            <th className="p-1.5 px-2.5 text-center w-20 border-r border-slate-700 font-bold text-slate-300">
                              %
                            </th>
                            <th className="p-1.5 px-3 text-right font-bold text-slate-300">
                              ราคา
                            </th>
                          </tr>
                        </thead>

                        {/* Excel Data Rows */}
                        <tbody className="divide-y divide-slate-800 text-[12px] font-mono">
                          
                          {/* 1. ราคาขาย In vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ราคาขาย In vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-slate-500">-</td>
                            <td className="p-2 px-3 text-right font-bold text-emerald-300 bg-emerald-950/30">
                              {fmtExcelNum(c.saleInVat)}
                            </td>
                          </tr>

                          {/* 2. ราคาขาย Ex vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ราคาขาย Ex vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-slate-500">-</td>
                            <td className="p-2 px-3 text-right font-semibold text-slate-200">
                              {fmtExcelNum(c.saleExVat)}
                            </td>
                          </tr>

                          {/* 3. ทุน In vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ทุน In vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-slate-500">-</td>
                            <td className="p-2 px-3 text-right font-bold text-rose-300 bg-emerald-950/30">
                              {fmtExcelNum(c.costInVat)}
                            </td>
                          </tr>

                          {/* 4. ทุน Ex vat */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ทุน Ex vat
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-rose-300 font-bold">
                              {fmtPercent(c.costExVatPercent)}
                            </td>
                            <td className="p-2 px-3 text-right text-rose-300/90 font-medium">
                              {fmtExcelNum(c.costExVat)}
                            </td>
                          </tr>

                          {/* 5. df */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              df
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-indigo-300 bg-emerald-950/30">
                              {c.dfPercent > 0 ? fmtPercent(c.dfPercent) : '0%'}
                            </td>
                            <td className="p-2 px-3 text-right text-indigo-300 bg-emerald-950/30">
                              {fmtExcelNum(c.dfAmount)}
                            </td>
                          </tr>

                          {/* 6. Sales */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              Sales
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.salesCommPercent ? `${c.salesCommPercent}%` : '4%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.salesCommAmount)}
                            </td>
                          </tr>

                          {/* 7. ดอก */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ดอก
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.interestPercent ? `${c.interestPercent}%` : '7%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.interestAmount)}
                            </td>
                          </tr>

                          {/* 8. ภาษี */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              ภาษี
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.taxPercent ? `${c.taxPercent}%` : '20%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.taxAmount)}
                            </td>
                          </tr>

                          {/* 9. Retention */}
                          <tr className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-2 px-3 text-left font-sans text-slate-300 font-medium border-r border-slate-800">
                              Retention
                            </td>
                            <td className="p-2 px-2.5 text-center border-r border-slate-800 text-amber-300 bg-emerald-950/30">
                              {c.retentionPercent ? `${c.retentionPercent}%` : '5%'}
                            </td>
                            <td className="p-2 px-3 text-right text-amber-300 bg-emerald-950/30">
                              {fmtExcelNum(c.retentionAmount)}
                            </td>
                          </tr>

                          {/* 10. กำไรก่อนภาษี (Highlight Total Row) */}
                          <tr className="bg-slate-950 border-t-2 border-slate-700 font-black">
                            <td className="p-2.5 px-3 text-left font-sans text-white border-r border-slate-700">
                              กำไรก่อนภาษี
                            </td>
                            <td className="p-2.5 px-2.5 text-center border-r border-slate-700 text-emerald-400 text-sm">
                              {fmtPercent(c.netProfitPercent)}
                            </td>
                            <td className="p-2.5 px-3 text-right text-emerald-400 text-sm">
                              {fmtExcelNum(c.netProfitAmount)}
                            </td>
                          </tr>

                        </tbody>
                      </table>
                    </div>

                    {/* Card Footer: Status & Edit Button */}
                    <div className="p-2.5 px-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.statusColor || 'bg-slate-800 text-slate-300'}`}>
                        {c.statusText || 'อนุมัติ'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onEditCalc(item.calc)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white rounded-lg text-xs font-bold border border-amber-500/40 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>✏️ คำนวณ</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📋 VIEW 2: LIST TABLE VIEW (มุมมองแบบตารางสรุปเดิม) */}
      {/* ========================================================= */}
      {viewMode === 'list' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm">📋 รายการ Cost Sheet ประเมินต้นทุนแบบตาราง</h3>
            <span className="text-xs text-amber-300 font-mono font-bold">{filteredItems.length} รายการ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">โรงพยาบาล / โครงการ</th>
                  <th className="p-3 text-right">งบประมาณขาย</th>
                  <th className="p-3 text-right">ต้นทุนสินค้า (Cost)</th>
                  <th className="p-3 text-right">DF แพทย์</th>
                  <th className="p-3 text-right">กำไรสุทธิ (Net Profit)</th>
                  <th className="p-3 text-right">Net Margin %</th>
                  <th className="p-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                      ไม่พบใบคํานวณต้นทุนในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.calc.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{item.proj.hospitalName}</div>
                        <div className="text-slate-400 text-[11px]">{item.proj.title}</div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white">
                        {formatCurrency(item.computed.saleInVat)}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-400">
                        {formatCurrency(item.computed.costInVat)}
                      </td>
                      <td className="p-3 text-right font-mono text-indigo-300">
                        {formatCurrency(item.computed.dfAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-emerald-400 text-sm">
                        {formatCurrency(item.computed.netProfitAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-indigo-300">
                        {(Number(item.computed?.netProfitPercent) || 0).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onEditCalc(item.calc)}
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30"
                        >
                          ✏️ คำนวณ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod07_finance/CostSheetModal.js ---
// MODULE: mod07_finance/CostSheetModal.js

function CostSheetModal({ calc, projects = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (calc) return { ...calc };
    const firstProj = projects[0] || {};
    let parsedDf = 0;
    let dfMissing = true;
    if (firstProj.dfAmount) {
      dfMissing = false;
      const numStr = String(firstProj.dfAmount).replace(/[^0-9.]/g, '');
      parsedDf = Number(numStr) || 0;
    }
    return {
      projectId: firstProj.id || '',
      projectName: firstProj.hospitalName ? `${firstProj.hospitalName} - ${firstProj.title}` : '',
      date: new Date().toISOString().split('T')[0],
      sellingPriceInVat: firstProj.budget || 4500000,
      costInVat: 3240000,
      dfType: 'amount',
      dfValue: parsedDf,
      dfMissing: dfMissing,
      salesCommPercent: 2.0,
      interestPercent: 7.0,
      taxPercent: 20.0,
      retentionPercent: 5.0,
      note: ''
    };
  });

  const handleProjectSelect = (projId) => {
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      let parsedDf = 0;
      let dfMissing = true;
      if (proj.dfAmount) {
        dfMissing = false;
        const numStr = String(proj.dfAmount).replace(/[^0-9.]/g, '');
        parsedDf = Number(numStr) || 0;
      }
      setFormData(prev => ({
        ...prev,
        projectId: projId,
        projectName: `${proj.hospitalName} - ${proj.title}`,
        sellingPriceInVat: proj.budget || prev.sellingPriceInVat,
        dfValue: parsedDf,
        dfMissing: dfMissing
      }));
    }
  };

  const computed = computeCostSheet(formData);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sellingPriceInVat || !formData.costInVat) {
      alert('กรุณากรอกราคาขายและราคาต้นทุน');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-lg">
              🧮
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">คำนวณราคาต้นทุนและราคาขายต่ำสุด</h3>
              <p className="text-xs text-slate-400">ใบวิเคราะห์ผลกำไรทางการเงินและเกณฑ์อนุมัติ (Financial Viability Sheet)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Project Selector & Date Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-300">เลือกโครงการจาก Sales Kanban <span className="text-rose-400">*</span></label>
              <select
                value={formData.projectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-semibold outline-none focus:border-emerald-500"
              >
                {(projects || []).map(p => (
                  <option key={p.id} value={p.id}>
                    🏥 {p.hospitalName} - {p.title} (โดย {p.assignee})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">วันที่คำนวณ</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          {/* Excel Calculation Table Replica */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3 w-1/3 border-r border-slate-800">รายการ</th>
                  <th className="p-3 w-1/4 text-center border-r border-slate-800">%</th>
                  <th className="p-3 text-right">ราคา (บาท THB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                
                {/* 1. ราคาขาย In VAT */}
                <tr className="bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors">
                  <td className="p-3 font-bold text-slate-100 font-sans border-r border-slate-800">
                    ราคาขาย In vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      required
                      value={formData.sellingPriceInVat}
                      onChange={(e) => setFormData({ ...formData, sellingPriceInVat: Number(e.target.value) })}
                      className="w-full max-w-[200px] bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 2. ราคาขาย Ex VAT */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ราคาขาย Ex vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.saleExVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 3. ทุน In VAT */}
                <tr className="bg-amber-950/20 hover:bg-amber-950/40 transition-colors">
                  <td className="p-3 font-bold text-slate-100 font-sans border-r border-slate-800">
                    ทุน In vat <span className="text-rose-400">*</span>
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 text-slate-500">-</td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      required
                      placeholder="ใส่ราคาต้นทุนรวม VAT"
                      value={formData.costInVat}
                      onChange={(e) => setFormData({ ...formData, costInVat: Number(e.target.value) })}
                      className="w-full max-w-[200px] bg-slate-900 border border-amber-500/50 text-amber-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 4. ทุน Ex VAT */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ทุน Ex vat
                  </td>
                  <td className="p-3 text-center border-r border-slate-800 font-bold text-amber-400">
                    {(Number(computed?.costExVatPercent) || 0).toFixed(2)}%
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.costExVat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 5. DF */}
                <tr className="bg-purple-950/20 hover:bg-purple-950/40 transition-colors">
                  <td className="p-3 font-bold text-purple-200 font-sans border-r border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>df (Doctor Fee)</span>
                      {formData.dfMissing && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-normal">
                          ⚠️ เซลส์ไม่ได้ใส่มา (Admin เติมเอง)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.dfType === 'percent' ? formData.dfValue : (Number(computed?.dfPercent) || 0).toFixed(2)}
                        onChange={(e) => setFormData({ ...formData, dfType: 'percent', dfValue: Number(e.target.value), dfMissing: false })}
                        className="w-16 bg-slate-900 border border-purple-500/50 text-purple-300 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <input
                      type="number"
                      value={formData.dfType === 'amount' ? formData.dfValue : Math.round(computed.dfAmount)}
                      onChange={(e) => setFormData({ ...formData, dfType: 'amount', dfValue: Number(e.target.value), dfMissing: false })}
                      className="w-full max-w-[200px] bg-slate-900 border border-purple-500/50 text-purple-300 font-bold p-1.5 rounded-lg text-right outline-none font-mono"
                    />
                  </td>
                </tr>

                {/* 6. Sales Commission */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    Sales (คอมเซลส์ 2% ราคาขาย Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.salesCommPercent}
                        onChange={(e) => setFormData({ ...formData, salesCommPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.salesCommAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 7. ดอก (Interest) */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ดอก (ดอกเบี้ยเงินทุน 7% ของทุน In VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.interestPercent}
                        onChange={(e) => setFormData({ ...formData, interestPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 8. ภาษี (Corporate Tax) */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    ภาษี (20% ของกำไรขั้นต้น Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxPercent}
                        onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 9. Retention */}
                <tr className="bg-slate-900/40">
                  <td className="p-3 text-slate-300 font-sans border-r border-slate-800">
                    Retention (ประกันผลงาน 5% ราคาขาย Ex VAT)
                  </td>
                  <td className="p-3 text-center border-r border-slate-800">
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.retentionPercent}
                        onChange={(e) => setFormData({ ...formData, retentionPercent: Number(e.target.value) })}
                        className="w-16 bg-slate-900 border border-slate-700 text-slate-100 p-1 rounded text-center outline-none font-mono"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-200">
                    {computed.retentionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

                {/* 10. กำไรก่อนภาษี / Net Profit Summary Row */}
                <tr className="bg-slate-950 border-t-2 border-slate-700 text-sm font-black">
                  <td className="p-3.5 text-white font-sans border-r border-slate-800">
                    กำไรสุทธิก่อนภาษี (Net Profit)
                  </td>
                  <td className={`p-3.5 text-center border-r border-slate-800 text-base font-extrabold ${
                    computed.netProfitPercent > 15 ? 'text-emerald-400' : computed.netProfitPercent >= 10 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {(Number(computed?.netProfitPercent) || 0).toFixed(2)}%
                  </td>
                  <td className={`p-3.5 text-right text-base font-extrabold ${
                    computed.netProfitAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {computed.netProfitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Profitability Status & Approval Rule Indicator */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${computed.statusColor}`}>
            <div className="space-y-0.5">
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>ผลการประเมินทางการเงิน:</span>
                <span className={`px-3 py-1 rounded-xl text-white text-xs font-bold ${computed.statusBadgeBg}`}>
                  {computed.statusText}
                </span>
              </div>
              <p className="text-xs opacity-90 font-sans">
                {computed.statusKey === 'approved' && 'อัตรากำไรสุทธิสูงกว่า 15% อยู่ในเกณฑ์อนุมัติให้ดำเนินการต่อได้ทันที'}
                {computed.statusKey === 'warning' && 'อัตรากำไรสุทธิระหว่าง 10% - 15% อยู่ในเกณฑ์ให้ทบทวนและตรวจสอบเงื่อนไขเพิ่มเติม'}
                {computed.statusKey === 'danger' && 'อัตรากำไรสุทธิต่ำกว่า 10% อยู่ในเกณฑ์ไม่อนุมัติโดยอัตโนมัติ ต้องเข้าหารือและขออนุมัติพิเศษจากคุณตู้'}
              </p>
            </div>

            <div className="text-right font-mono text-xs flex-shrink-0 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div>&gt;15%: อนุมัติ (เขียว)</div>
              <div>10-15%: รีวิว (เหลือง)</div>
              <div>&lt;10%: คุณตู้ (แดง)</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700"
            >
              🖨️ พิมพ์ใบคำนวณต้นทุน
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">ยกเลิก</button>
              <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30">
                💾 บันทึกสเปรดชีตต้นทุน
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod07_finance/PurchaseOrderModal.js ---
// MODULE: mod07_finance/PurchaseOrderModal.js

function PurchaseOrderModal({ po, projects = [], products = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (po) return { ...po };
    const wonProjects = projects.filter(p => p.status === 'stage_won' || p.status === 'stage_ordering' || p.status === 'stage_delivery');
    const firstProj = wonProjects[0] || projects[0] || {};
    return {
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      year: new Date().getFullYear(),
      projectId: firstProj.id || '',
      hospitalName: firstProj.hospitalName || '',
      vendorId: window.VENDOR_LIST[0].id,
      vendorName: window.VENDOR_LIST[0].name,
      vendorCountry: window.VENDOR_LIST[0].country,
      currency: window.VENDOR_LIST[0].currency || 'THB',
      productId: firstProj.productId || (products[0] ? products[0].id : ''),
      productName: firstProj.productName || (products[0] ? products[0].name : ''),
      quantity: firstProj.quantity || 1,
      unitPrice: 100000,
      totalAmountFX: 100000,
      exchangeRate: 1,
      totalAmountTHB: firstProj.budget || 100000,
      poDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      status: 'ร่าง PO',
      note: ''
    };
  });

  const handleProjectSelect = (projId) => {
    const selected = projects.find(p => p.id === projId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        projectId: projId,
        hospitalName: selected.hospitalName,
        productId: selected.productId || prev.productId,
        productName: selected.productName || prev.productName,
        quantity: selected.quantity || prev.quantity,
        totalAmountTHB: selected.budget || prev.totalAmountTHB
      }));
    } else {
      setFormData(prev => ({ ...prev, projectId: projId }));
    }
  };

  const handleVendorSelect = (vendorId) => {
    const v = window.VENDOR_LIST.find(x => x.id === vendorId);
    if (v) {
      let defaultRate = 1;
      if (v.currency === 'USD') defaultRate = 36.5;
      if (v.currency === 'EUR') defaultRate = 39.5;
      if (v.currency === 'JPY') defaultRate = 0.24;

      setFormData(prev => ({
        ...prev,
        vendorId,
        vendorName: v.name,
        vendorCountry: v.country,
        currency: v.currency,
        exchangeRate: defaultRate,
        totalAmountTHB: prev.quantity * prev.unitPrice * defaultRate
      }));
    }
  };

  const updateCalc = (field, val) => {
    const newForm = { ...formData, [field]: val };
    const qty = Number(newForm.quantity) || 1;
    const price = Number(newForm.unitPrice) || 0;
    const rate = Number(newForm.exchangeRate) || 1;
    newForm.totalAmountFX = qty * price;
    newForm.totalAmountTHB = qty * price * rate;
    setFormData(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.poNumber.trim()) {
      alert('กรุณากรอกเลขที่ PO');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🛒 {po ? 'แก้ไขใบสั่งซื้อ' : 'ออกใบสั่งซื้อ (Issue Purchase Order)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ PO <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ปีงบประมาณ / สั่งซื้อ</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
              >
                <option value="2026">2026 (พ.ศ. 2569)</option>
                <option value="2025">2025 (พ.ศ. 2568)</option>
                <option value="2024">2024 (พ.ศ. 2567)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เลือกโครงการที่ชนะงาน (เพื่อเชื่อมข้อมูล)</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              <option value="">-- ไม่ระบุ / สั่งซื้ออิสระ --</option>
              {(projects || []).map(p => (
                <option key={p.id} value={p.id}>
                  🏥 {p.hospitalName} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / ลูกค้า</label>
              <input
                type="text"
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Vendor / ผู้จัดจำหน่าย <span className="text-rose-400">*</span></label>
              <select
                value={formData.vendorId}
                onChange={(e) => handleVendorSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-semibold text-amber-300 outline-none"
              >
                {window.VENDOR_LIST.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.country})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้าที่สั่งซื้อ</label>
              <input
                type="text"
                required
                placeholder="เช่น AERON Cardio 12L-AI"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">จำนวนสั่งซื้อ</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateCalc('quantity', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-center outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ราคาต่อหน่วย (Foreign FX)</label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => updateCalc('unitPrice', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">สกุลเงิน / อัตราแลกเปลี่ยน</label>
              <div className="flex gap-1">
                <select
                  value={formData.currency}
                  onChange={(e) => updateCalc('currency', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold outline-none"
                >
                  <option value="THB">THB (฿)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Rate"
                  value={formData.exchangeRate}
                  onChange={(e) => updateCalc('exchangeRate', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">มูลค่ารวม (บาท THB)</label>
              <input
                type="number"
                value={formData.totalAmountTHB}
                onChange={(e) => setFormData({ ...formData, totalAmountTHB: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ออก PO</label>
              <input
                type="date"
                value={formData.poDate}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">กำหนดรับของ (Expected)</label>
              <input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">สถานะ PO</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold text-indigo-300"
              >
                {window.PO_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / เงื่อนไขจัดส่ง</label>
            <textarea
              rows="2"
              placeholder="ระบุข้อความหรือหมายเหตุถึง Vendor..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">บันทึกใบสั่งซื้อ PO</button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod07_finance/PurchaseOrderView.js ---
// MODULE: mod07_finance/PurchaseOrderView.js

function PurchaseOrderView({ purchaseOrders = [], projects = [], products = [], onOpenNewPO, onEditPO, onDeletePO }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterVendor, setFilterVendor] = useState('all');
  const [searchPO, setSearchPO] = useState('');
  const [previewPO, setPreviewPO] = useState(null);

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // 1. Calculate Won Projects that don't have a PO issued yet
  const pendingWonProjects = useMemo(() => {
    const wonStages = ['stage_won', 'stage_ordering', 'stage_delivery'];
    return (projects || []).filter(p => {
      if (!wonStages.includes(p.status)) return false;
      const hasPO = (purchaseOrders || []).some(po => po.projectId === p.id);
      return !hasPO;
    });
  }, [projects, purchaseOrders]);

  // 2. Filtered Pending Won Projects for Table
  const filteredPendingProjects = useMemo(() => {
    return pendingWonProjects.filter(p => {
      const yr = p.procurementDate ? new Date(p.procurementDate).getFullYear() : (p.createdDate ? new Date(p.createdDate).getFullYear() : 2026);
      if (selectedYear !== 'all' && Number(yr) !== Number(selectedYear)) return false;
      
      const pDate = p.procurementDate || p.createdDate || '';
      if (pDate) {
        if (startDate && pDate < startDate) return false;
        if (endDate && pDate > endDate) return false;
      }

      if (searchPO.trim()) {
        const term = searchPO.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(term);
        const matchHosp = (p.hospitalName || '').toLowerCase().includes(term);
        const matchAssignee = (p.assignee || '').toLowerCase().includes(term);
        const matchProd = (p.productName || '').toLowerCase().includes(term);
        return matchTitle || matchHosp || matchAssignee || matchProd;
      }
      return true;
    });
  }, [pendingWonProjects, selectedYear, startDate, endDate, searchPO]);

  // 3. Available Years
  const availableYears = useMemo(() => {
    const years = new Set((purchaseOrders || []).map(p => p.year || new Date(p.poDate).getFullYear()));
    years.add(2026);
    years.add(2025);
    return Array.from(years).sort((a, b) => b - a);
  }, [purchaseOrders]);

  // 4. Filtered POs by Year, Vendor, Date Range and Search
  const filteredPOs = useMemo(() => {
    return (purchaseOrders || []).filter(po => {
      const poYear = po.year || new Date(po.poDate).getFullYear();
      if (selectedYear !== 'all' && Number(poYear) !== Number(selectedYear)) return false;
      if (filterVendor !== 'all' && po.vendorId !== filterVendor && po.vendorName !== filterVendor) return false;

      if (po.poDate) {
        if (startDate && po.poDate < startDate) return false;
        if (endDate && po.poDate > endDate) return false;
      }

      if (searchPO.trim()) {
        const term = searchPO.toLowerCase();
        const matchNo = po.poNumber.toLowerCase().includes(term);
        const matchVendor = po.vendorName.toLowerCase().includes(term);
        const matchHosp = (po.hospitalName || '').toLowerCase().includes(term);
        const matchProd = (po.productName || '').toLowerCase().includes(term);
        return matchNo || matchVendor || matchHosp || matchProd;
      }
      return true;
    });
  }, [purchaseOrders, selectedYear, filterVendor, startDate, endDate, searchPO]);

  // 5. Summary Metrics
  const totalSpentTHB = useMemo(() => {
    return filteredPOs.reduce((sum, po) => sum + (Number(po.totalAmountTHB) || 0), 0);
  }, [filteredPOs]);

  const uniqueVendorsCount = useMemo(() => {
    return new Set(filteredPOs.map(po => po.vendorName)).size;
  }, [filteredPOs]);

  const receivedCount = useMemo(() => {
    return filteredPOs.filter(po => po.status === 'รับสินค้าแล้ว' || po.status === 'สินค้าถึงไทย').length;
  }, [filteredPOs]);

  // 6. Vendor Spend Breakdown
  const vendorBreakdown = useMemo(() => {
    const map = {};
    filteredPOs.forEach(po => {
      const vName = po.vendorName || 'ไม่ระบุ Vendor';
      if (!map[vName]) {
        map[vName] = {
          name: vName,
          country: po.vendorCountry || '',
          totalTHB: 0,
          ordersCount: 0,
          products: {},
          statuses: {}
        };
      }
      map[vName].totalTHB += Number(po.totalAmountTHB) || 0;
      map[vName].ordersCount += 1;
      
      const pName = po.productName || 'สินค้าอื่นๆ';
      if (!map[vName].products[pName]) map[vName].products[pName] = { name: pName, qty: 0, amountTHB: 0 };
      map[vName].products[pName].qty += Number(po.quantity) || 1;
      map[vName].products[pName].amountTHB += Number(po.totalAmountTHB) || 0;

      const st = po.status || 'ร่าง PO';
      map[vName].statuses[st] = (map[vName].statuses[st] || 0) + 1;
    });

    return Object.values(map).sort((a, b) => b.totalTHB - a.totalTHB);
  }, [filteredPOs]);

  const statusColors = {
    'ร่าง PO': 'bg-slate-700/50 text-slate-300 border-slate-600',
    'รออนุมัติ': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'อนุมัติแล้ว': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'ส่ง PO ให้ Vendor': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Vendor ยืนยันรับ PO': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'รอผลิต / รอของ': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'สินค้าถึงไทย': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'รับสินค้าแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400">
            🛒
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>การสั่งสินค้า Vendor (Admin Purchase Orders)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                หลังชนะงานประมูล
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ระบบออกใบสั่งซื้อ (PO) สรุปยอดซื้อสินค้าแยกตาม Vendor ผู้ผลิต และติดตามสถานะการส่งมอบสินค้า
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewPO(null)}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ ออกใบสั่งซื้อ PO ใหม่</span>
        </button>
      </div>

      {/* Pending PO Notification Alert Section */}
      {pendingWonProjects.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/70 p-5 rounded-2xl border-2 border-amber-500/60 shadow-xl shadow-amber-500/10 space-y-3 relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl animate-bounce text-amber-400">
                🔔
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <span>แจ้งเตือนสั่งของ: มี {pendingWonProjects.length} โครงการชนะงานที่ยังไม่ออกใบสั่งซื้อ (Pending PO)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-bold animate-pulse">
                    ด่วน
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  เซลส์ในทีมชนะงานและเซ็นสัญญาเรียบร้อยแล้ว กรุณาออกใบสั่งซื้อ (PO) ส่งให้ Vendor เพื่อเริ่มผลิตและจัดส่งสินค้า
                </p>
              </div>
            </div>
          </div>

          {/* Pending Won Projects List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingWonProjects.map(proj => (
              <div key={proj.id} className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/40 space-y-2 relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🎉 ชนะงานแล้ว
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{proj.hospitalName}</h4>
                    <p className="text-xs text-indigo-300 line-clamp-1">{proj.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-amber-400">{formatCurrency(proj.budget)}</div>
                    <div className="text-[10.5px] text-emerald-300 font-medium mt-0.5">👤 {proj.assignee}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-400">
                    📦 สินค้า: <span className="text-slate-200 font-semibold">{proj.productName || 'ไม่ระบุ'}</span> ({proj.quantity || 1} ชุด)
                  </span>
                  <button
                    onClick={() => onOpenNewPO(proj)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 flex items-center gap-1 transition-all"
                  >
                    <span>🛒 ออก PO งานนี้</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Year & Date Range Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* High-Contrast Vibrant Yellow Date Range Inputs */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 rounded-xl p-1.5 text-xs shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span>ช่วงวันที่ออก PO:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold outline-none text-xs rounded-lg p-1"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold outline-none text-xs rounded-lg p-1"
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white text-xs px-1">✕</button>
            )}
          </div>

          {availableYears.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr.toString())}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedYear === yr.toString()
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>📅 ปี {yr + 543}</span>
              <span className="text-[10px] opacity-75 font-mono">({yr})</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedYear === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            🌐 สรุปทุกปี
          </button>
        </div>

        <div className="text-xs text-slate-400">
          แสดงข้อมูล {filteredPOs.length + filteredPendingProjects.length} รายการ (ใบสั่งซื้อ + งานรอ PO)
        </div>
      </div>

      {/* Executive KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💳 ยอดสั่งซื้อรวมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalSpentTHB)}
          </div>
          <div className="text-[11px] text-slate-400">
            {selectedYear === 'all' ? 'รวมยอดสั่งซื้อจากทุกปี' : `ยอดรวมเฉพาะปี ${Number(selectedYear) + 543}`}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📄 จำนวนใบสั่งซื้อ (PO)</span>
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-300 tracking-tight font-mono">
            {filteredPOs.length} <span className="text-xs font-normal text-slate-400">ฉบับ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ออก PO จาก Vendor ในช่วงเวลานี้
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🏢 จำนวน Vendor ผู้ผลิต</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">🏭</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {uniqueVendorsCount} <span className="text-xs font-normal text-slate-400">บริษัท</span>
          </div>
          <div className="text-[11px] text-slate-400">
            คู่ค้าที่เปิด PO สั่งสินค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🚛 ส่งมอบ / รับของแล้ว</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">📦</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {receivedCount} / {filteredPOs.length} <span className="text-xs font-normal text-slate-400">PO</span>
          </div>
          <div className="text-[11px] text-slate-400">
            คิดเป็น {filteredPOs.length > 0 ? Math.round((receivedCount / filteredPOs.length) * 100) : 0}% ของรายการทั้งหมด
          </div>
        </div>

      </div>

      {/* Vendor Spend Breakdown Dashboard Cards */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📊 สรุปยอดสั่งซื้อแยกตาม Vendor ผู้ผลิต (Vendor Purchasing Summary)</span>
            </h3>
            <p className="text-xs text-slate-400">
              สรุปจำนวนเงินที่สั่งซื้อ ชนิดสินค้าที่ซื้อ และสัดส่วนยอดสั่งซื้อของแต่ละ Vendor
            </p>
          </div>
        </div>

        {vendorBreakdown.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            ไม่มีรายการสั่งซื้อในช่วงเวลาที่เลือก
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorBreakdown.map((vb, idx) => {
              const pct = totalSpentTHB > 0 ? (((vb.totalTHB / totalSpentTHB) * 100) || 0).toFixed(1) : '0';
              const productItems = Object.values(vb.products);

              return (
                <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3 relative hover:border-amber-500/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>🏭 {vb.name}</span>
                      </h4>
                      {vb.country && (
                        <span className="text-[10px] text-slate-400">ประเทศ: {vb.country}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                      {vb.ordersCount} PO
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">ยอดรวมสั่งซื้อ:</span>
                    <span className="text-sm font-bold font-mono text-amber-400">{formatCurrency(vb.totalTHB)}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>สัดส่วนยอดซื้อ:</span>
                      <span className="text-amber-300 font-mono">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <div className="text-[10.5px] font-semibold text-indigo-300">📦 รายการสินค้าที่สั่งซื้อ:</div>
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {productItems.map((pi, pIdx) => (
                        <div key={pIdx} className="flex justify-between items-center text-[10.5px] bg-slate-950/60 p-1.5 rounded border border-slate-900">
                          <span className="text-slate-200 line-clamp-1 font-medium">{pi.name} ({pi.qty} ชิ้น)</span>
                          <span className="text-slate-400 font-mono shrink-0 ml-2">{formatCurrency(pi.amountTHB)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PO List Table & Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 รายการใบสั่งซื้อจาก Vendor (Purchase Orders List)</span>
            </h3>
            <p className="text-xs text-slate-400">รายการใบสั่งซื้อทั้งหมด สามารถแก้ไขและติดตามสถานะจัดส่งได้</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหาเลข PO / รพ. / สินค้า..."
              value={searchPO}
              onChange={(e) => setSearchPO(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุก Vendor</option>
              {window.VENDOR_LIST.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ PO / วันที่</th>
                <th className="p-3">Vendor / ผู้จัดจำหน่าย</th>
                <th className="p-3">โครงการ / โรงพยาบาล</th>
                <th className="p-3">สินค้าที่สั่ง</th>
                <th className="p-3 text-right">จำนวนเงิน (FX & THB)</th>
                <th className="p-3 text-center">สถานะ PO</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Render Pending Won Projects Waiting for PO */}
              {filteredPendingProjects.map(proj => (
                <tr key={`pending-${proj.id}`} className="bg-amber-950/40 hover:bg-amber-900/50 transition-colors border-l-4 border-l-amber-500">
                  <td className="p-3">
                    <div className="font-mono font-bold text-amber-300 flex items-center gap-1">
                      <span>🔔</span> <span>(รอออก PO)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ชนะงานเมื่อ: {proj.procurementDate || 'ล่าสุด'}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-amber-200/90 italic">ยังไม่ได้ออก PO ให้ Vendor</div>
                    <div className="text-[10px] text-slate-400">รอดำเนินการออกใบสั่งซื้อ</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white text-sm">{proj.hospitalName}</div>
                    <div className="text-[11px] text-emerald-300 font-medium">👤 เซลส์: {proj.assignee}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-200">{proj.productName || 'ไม่ระบุ'}</div>
                    <div className="text-[10px] text-slate-400">จำนวน: <span className="font-mono font-bold text-amber-300">{proj.quantity || 1}</span> ชุด</div>
                  </td>
                  <td className="p-3 text-right font-mono">
                    <div className="font-bold text-amber-400 text-sm">{formatCurrency(proj.budget)}</div>
                    <div className="text-[10px] text-slate-400">(งบชนะประมูล)</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/30 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse">
                      ⏳ รอออกใบสั่งซื้อ
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onOpenNewPO(proj)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/30 flex items-center gap-1 mx-auto transition-all hover:scale-105"
                    >
                      <span>🛒 ออก PO ทันที</span>
                    </button>
                  </td>
                </tr>
              ))}

              {/* Render Issued POs */}
              {filteredPOs.length === 0 && filteredPendingProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการใบสั่งซื้อ PO ตรงตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const badgeStyle = statusColors[po.status] || 'bg-slate-800 text-slate-300';
                  return (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-bold text-amber-300">{po.poNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">📅 {po.poDate || 'ไม่ระบุ'}</div>
                        {po.expectedDelivery && (
                          <div className="text-[9.5px] text-indigo-300 font-mono">🚛 ครบกำหนด: {po.expectedDelivery}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{po.vendorName}</div>
                        {po.vendorCountry && (
                          <div className="text-[10px] text-slate-400">🌍 {po.vendorCountry}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-emerald-300">{po.hospitalName || 'ไม่ระบุ รพ.'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{po.productName}</div>
                        <div className="text-[10px] text-slate-400">จำนวน: <span className="font-mono font-bold text-amber-300">{po.quantity}</span> ชุด</div>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400 text-sm">{formatCurrency(po.totalAmountTHB)}</div>
                        {po.currency && po.currency !== 'THB' && po.totalAmountFX && (
                          <div className="text-[10px] text-slate-400">
                            ({po.totalAmountFX.toLocaleString()} {po.currency} @ {po.exchangeRate})
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border ${badgeStyle}`}>
                          {po.status || 'ร่าง PO'}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewPO(po)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบสั่งซื้อ"
                        >
                          👁️ ดู PO
                        </button>
                        <button
                          onClick={() => onEditPO(po)}
                          className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeletePO(po.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO View Modal Preview */}
      {previewPO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal font-sans text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  PURCHASE ORDER (PO)
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewPO.poNumber}</h3>
                <p className="text-xs text-slate-400">วันที่ออก PO: {previewPO.poDate}</p>
              </div>
              <button onClick={() => setPreviewPO(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">VENDOR / ผู้จัดจำหน่าย:</div>
                <div className="font-bold text-amber-300 text-sm mt-0.5">{previewPO.vendorName}</div>
                <div className="text-slate-400">ประเทศ: {previewPO.vendorCountry || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">โครงการ / โรงพยาบาล:</div>
                <div className="font-bold text-emerald-300 text-sm mt-0.5">{previewPO.hospitalName || 'ไม่ระบุ'}</div>
                <div className="text-slate-400">สถานะสั่งซื้อ: <span className="text-indigo-300 font-bold">{previewPO.status}</span></div>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">รายการสินค้า (Product Description)</th>
                    <th className="p-3 text-center">จำนวน</th>
                    <th className="p-3 text-right">ราคา/หน่วย</th>
                    <th className="p-3 text-right">มูลค่ารวม (THB)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/60">
                    <td className="p-3 font-semibold text-white">
                      {previewPO.productName}
                      <div className="text-[10px] text-slate-400 font-normal">{previewPO.productCategory}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-300">{previewPO.quantity}</td>
                    <td className="p-3 text-right font-mono">
                      {previewPO.unitPrice ? previewPO.unitPrice.toLocaleString() + ' ' + (previewPO.currency || 'THB') : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(previewPO.totalAmountTHB)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {previewPO.note && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-amber-400">📝 หมายเหตุ / เงื่อนไข:</span> {previewPO.note}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700"
              >
                🖨️ พิมพ์เอกสาร
              </button>
              <button
                onClick={() => setPreviewPO(null)}
                className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod08_hr/AttendanceModal.js ---
// MODULE: mod08_hr/AttendanceModal.js

function AttendanceModal({ members = [], onSave, onClose }) {
  const [employeeName, setEmployeeName] = useState(() => members.length > 0 ? members[0].name : 'สมชาย สายลุย');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('⏰ มาสาย');
  const [lateMinutes, setLateMinutes] = useState(15);
  const [fineAmount, setFineAmount] = useState(150);
  const [note, setNote] = useState('');

  // Auto calculate fine amount when type or minutes change
  useEffect(() => {
    if (type === '⏰ มาสาย') {
      const mins = Number(lateMinutes) || 0;
      setFineAmount(mins * 10); // 10 THB per minute late
    } else if (type === '🚫 ขาดงาน') {
      setLateMinutes(0);
      setFineAmount(500); // 500 THB fine for absence
    } else if (type === '⚠️ ออกก่อนเวลา') {
      const mins = Number(lateMinutes) || 0;
      setFineAmount(mins * 10);
    }
  }, [type, lateMinutes]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const attData = {
      id: `att-${Date.now()}`,
      date,
      employeeName,
      type,
      lateMinutes: Number(lateMinutes) || 0,
      fineAmount: Number(fineAmount) || 0,
      note: note || (type === '⏰ มาสาย' ? `มาสาย ${lateMinutes} นาที` : 'ขาดงานโดยไม่แจ้งล่วงหน้า'),
      createdAt: new Date().toISOString()
    };

    onSave(attData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shadow-inner">
              ⏰
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">แบบฟอร์มบันทึก ขาด - มาสาย (Attendance Log)</h3>
              <p className="text-xs text-slate-400">บันทึกการมาสาย ขาดงาน พร้อมคำนวณหักเงินค่าปรับ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ทำรายการ <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none font-mono focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อพนักงาน <span className="text-rose-400">*</span></label>
              <select
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 outline-none focus:border-indigo-500 font-bold"
              >
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ประเภทรายการ <span className="text-rose-400">*</span></label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-rose-400 outline-none focus:border-rose-500 font-extrabold"
            >
              <option value="⏰ มาสาย">⏰ มาสาย (Tardiness) - หัก 10 บาท/นาที</option>
              <option value="🚫 ขาดงาน">🚫 ขาดงาน (Absence) - หักค่าปรับ 500 บาท/ครั้ง</option>
              <option value="⚠️ ออกก่อนเวลา">⚠️ ออกก่อนเวลา (Early Leave)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {type !== '🚫 ขาดงาน' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">จำนวนนาทีที่สาย</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={lateMinutes}
                  onChange={(e) => setLateMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-bold font-mono outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className={type === '🚫 ขาดงาน' ? 'col-span-2 space-y-1' : 'space-y-1'}>
              <label className="font-semibold text-slate-300">ยอดหักเงินค่าปรับ (บาท)</label>
              <input
                type="number"
                min="0"
                required
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-rose-400 font-extrabold font-mono outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / สาเหตุที่สายหรือขาดงาน</label>
            <input
              type="text"
              placeholder="ระบุ เช่น จราจรติดขัดหนัก, ป่วยกะทันหันไม่ได้แจ้ง..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500"
            />
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
              className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <span>⏰ บันทึก ขาด / มาสาย</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod08_hr/LeaveAttendanceView.js ---
// MODULE: mod08_hr/LeaveAttendanceView.js

function LeaveAttendanceView({ leaveRequests = [], attendanceLogs = [], members = [], currentUser, onOpenLeaveModal, onOpenAttendanceModal, onApproveLeave, onDeleteLeave, onDeleteAttendance }) {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'requests' | 'attendance'

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Filtered Requests & Attendance Logs
  const filteredLeaveRequests = useMemo(() => {
    return (leaveRequests || []).filter(l => {
      const lDate = l.startDate || l.createdDate || '';
      if (lDate) {
        if (startDate && lDate < startDate) return false;
        if (endDate && lDate > endDate) return false;
      }
      return true;
    });
  }, [leaveRequests, startDate, endDate]);

  const filteredAttendanceLogs = useMemo(() => {
    return (attendanceLogs || []).filter(a => {
      const aDate = a.date || '';
      if (aDate) {
        if (startDate && aDate < startDate) return false;
        if (endDate && aDate > endDate) return false;
      }
      return true;
    });
  }, [attendanceLogs, startDate, endDate]);

  // Summary by staff member
  const staffSummary = useMemo(() => {
    return members.map(m => {
      const mLeaves = filteredLeaveRequests.filter(l => l.employeeName === m.name && l.status === '✅ อนุมัติแล้ว');
      const sickDays = mLeaves.filter(l => l.leaveType.includes('ป่วย')).reduce((sum, l) => sum + (l.totalDays || 1), 0);
      const personalDays = mLeaves.filter(l => l.leaveType.includes('กิจ')).reduce((sum, l) => sum + (l.totalDays || 1), 0);
      const vacationDays = mLeaves.filter(l => l.leaveType.includes('พักร้อน')).reduce((sum, l) => sum + (l.totalDays || 1), 0);

      const mAtt = filteredAttendanceLogs.filter(a => a.employeeName === m.name);
      const lateMins = mAtt.filter(a => a.type.includes('สาย')).reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
      const absentTimes = mAtt.filter(a => a.type.includes('ขาด')).length;
      const totalFine = mAtt.reduce((sum, a) => sum + (a.fineAmount || 0), 0);

      return {
        ...m,
        sickDays,
        personalDays,
        vacationDays,
        lateMins,
        absentTimes,
        totalFine
      };
    });
  }, [members, filteredLeaveRequests, filteredAttendanceLogs]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Date Range Controls */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400">
            📅
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ระบบตารางวันลา & ขาด ลา มาสาย (Leave & Attendance Schedule)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                บุคลากร {members.length} ท่าน
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ลงวันลาป่วย/ลากิจ/ลาพักร้อน ตรวจสอบคิวลาป้องกันงานชนกัน และลงบันทึก ขาด-มาสาย พร้อมสรุปค่าปรับ
            </p>
          </div>
        </div>

        {/* High-Contrast Vibrant Yellow Date Range Picker Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>เลือกช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}

          <button
            type="button"
            onClick={onOpenLeaveModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 ml-2"
          >
            <span>+ ลงวันลาใหม่</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenAttendanceModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5"
          >
            <span>+ บันทึก ขาด/สาย</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 text-xs">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
            activeTab === 'schedule' ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 สรุปวันลา & มาสายบุคลากร
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
            activeTab === 'requests' ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📑 รายการขออนุมัติลา ({filteredLeaveRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
            activeTab === 'attendance' ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ⏰ บันทึก ขาด/มาสาย ({filteredAttendanceLogs.length})
        </button>
      </div>

      {/* Tab 1: Staff Summary Table */}
      {activeTab === 'schedule' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">📊 สรุปวันลาและสถิติมาสายรายบุคคล (Staff Attendance Summary)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3 text-center">ลาป่วย (วัน)</th>
                  <th className="p-3 text-center">ลากิจ (วัน)</th>
                  <th className="p-3 text-center">ลาพักร้อน (วัน)</th>
                  <th className="p-3 text-center">มาสาย (นาที)</th>
                  <th className="p-3 text-center">ขาดงาน (ครั้ง)</th>
                  <th className="p-3 text-right">ค่าปรับสะสม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffSummary.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-rose-300">
                        {s.avatar || s.name.substring(0, 1)}
                      </div>
                      <div>
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{s.role}</div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400">{s.sickDays}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-300">{s.personalDays}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-400">{s.vacationDays}</td>
                    <td className="p-3 text-center font-mono font-bold text-orange-400">{s.lateMins}</td>
                    <td className="p-3 text-center font-mono font-bold text-rose-400">{s.absentTimes}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400">
                      {s.totalFine ? formatCurrency(s.totalFine) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Leave Requests Table */}
      {activeTab === 'requests' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">📑 รายการขออนุมัติลาทั้งหมด (Leave Applications)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3">ประเภทการลา</th>
                  <th className="p-3">วันที่เริ่ม - สิ้นสุด</th>
                  <th className="p-3 text-center">จำนวนวัน</th>
                  <th className="p-3">เหตุผลการลา</th>
                  <th className="p-3 text-center">สถานะ</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                      ไม่พบประวัติขอลาในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredLeaveRequests.map(l => (
                    <tr key={l.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{l.employeeName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium">
                          {l.leaveType}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{l.startDate} ถึง {l.endDate}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-300">{l.totalDays || 1} วัน</td>
                      <td className="p-3 text-slate-400 max-w-[180px] truncate">{l.reason || '-'}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] ${
                          l.status === '✅ อนุมัติแล้ว' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {l.status !== '✅ อนุมัติแล้ว' && (
                          <button
                            onClick={() => onApproveLeave(l.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10.5px] font-bold"
                          >
                            ✓ อนุมัติ
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteLeave(l.id)}
                          className="px-2 py-1 bg-slate-800 text-rose-400 rounded text-[11px]"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance Logs Table */}
      {activeTab === 'attendance' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">⏰ บันทึก ขาด ลา มาสาย (Attendance Violations)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">วันที่</th>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3 text-center">ประเภทรายการ</th>
                  <th className="p-3 text-center">สายกี่นาที</th>
                  <th className="p-3 text-right">ค่าปรับ (บาท)</th>
                  <th className="p-3">หมายเหตุ</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAttendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                      ไม่พบบันทึกการขาด/สายในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredAttendanceLogs.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400">{a.date}</td>
                      <td className="p-3 font-bold text-white">{a.employeeName}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                          {a.type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-orange-400">{a.lateMinutes || 0} นาที</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        {a.fineAmount ? formatCurrency(a.fineAmount) : '-'}
                      </td>
                      <td className="p-3 text-slate-400">{a.note || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteAttendance(a.id)}
                          className="px-2 py-1 bg-slate-800 text-rose-400 rounded text-[11px]"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod08_hr/LeaveModal.js ---
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


// --- Module File: js/modules/mod08_hr/MemberManagementModal.js ---
// MODULE: mod08_hr/MemberManagementModal.js

function MemberManagementModal({ members = [], setMembers, onClose }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Sales Specialist');
  const [avatar, setAvatar] = useState('👨‍⚕️');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newMember = {
      id: 'm-' + Date.now(),
      name,
      role,
      avatar
    };
    setMembers([...members, newMember]);
    setName('');
  };

  const handleDelete = (id) => {
    if (window.confirm('ลบสมาชิกท่านนี้ใช่หรือไม่?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-[800] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-modal">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base">👥 จัดการรายชื่อสมาชิกในทีม</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(members || []).map(m => (
            <div key={m.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{m.avatar}</span>
                <div>
                  <div className="font-semibold text-white">{m.name}</div>
                  <div className="text-[10px] text-slate-400">{m.role}</div>
                </div>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-rose-400 p-1.5 rounded-lg">🗑️</button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddMember} className="space-y-2 pt-2 border-t border-slate-800 text-xs">
          <h4 className="font-semibold text-slate-300">➕ เพิ่มสมาชิกคนใหม่</h4>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              required
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
            >
              <option value="Sales Specialist">Sales</option>
              <option value="Medical Representative">Med Rep</option>
              <option value="Product Specialist">Product Spec</option>
              <option value="Key Account Manager">KAM</option>
            </select>
            <select
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none text-center"
            >
              <option value="👨‍⚕️">👨‍⚕️</option>
              <option value="👩‍⚕️">👩‍⚕️</option>
              <option value="👨‍💼">👨‍💼</option>
              <option value="👩‍💼">👩‍💼</option>
              <option value="🧑‍💻">🧑‍💻</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium mt-2">
            + บันทึกเพิ่มสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/AccountingModule.js ---
// MODULE: mod09_accounting/AccountingModule.js

function AccountingModule({ transactions = [], initialFrozenMonths = [], initialRecurringTemplates = [], currentUser, onSaveTxn, onDeleteTxn, accountingSubTab = 'daily_entries', onSubTabChange }) {
  const [localSubTab, setLocalSubTab] = useState(accountingSubTab || 'daily_entries');
  const subTab = accountingSubTab || localSubTab;
  const setSubTab = (newTab) => {
    setLocalSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPendingTransferModalOpen, setIsPendingTransferModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

  const [frozenMonths, setFrozenMonths] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_accounting_frozen_months');
      return saved ? JSON.parse(saved) : (initialFrozenMonths || ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]);
    } catch(e) { return initialFrozenMonths || []; }
  });

  const [recurringTemplates, setRecurringTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_accounting_recurring');
      return saved ? JSON.parse(saved) : (initialRecurringTemplates || []);
    } catch(e) { return initialRecurringTemplates || []; }
  });

  // Count pending draft transfers that need action
  const pendingCount = useMemo(() => {
    return transactions.filter(t => t.is_pending_draft || t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]') && !t.notes.includes('[แอดมินแนบสลิปเรียบร้อย]'))).length;
  }, [transactions]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('aeron_accounting_frozen_months', JSON.stringify(frozenMonths));
  }, [frozenMonths]);

  useEffect(() => {
    localStorage.setItem('aeron_accounting_recurring', JSON.stringify(recurringTemplates));
  }, [recurringTemplates]);

  // Freeze month toggle handler
  const handleToggleFreeze = (monthStr) => {
    setFrozenMonths(prev => {
      if (prev.includes(monthStr)) {
        return prev.filter(m => m !== monthStr);
      } else {
        return [...prev, monthStr].sort();
      }
    });
  };

  // Save New Pending Transfer Draft
  const handleSavePendingTransfer = (pendingTxn) => {
    onSaveTxn(pendingTxn);
    setIsPendingTransferModalOpen(false);
    setSubTab('pending_transfers');
  };

  // Status Lifecycle Handlers
  const handleOwnerTransfer = (updatedTxn) => {
    onSaveTxn(updatedTxn);
    alert('💸 เจ้าของโอนเงินเสร็จเรียบร้อย! ส่งเรื่องให้แอดมินตรวจเช็กและแนบสลิป');
  };

  const handleConfirmTransfer = (confirmedTxn) => {
    onSaveTxn(confirmedTxn);
    alert('✅ ยืนยันและแนบสลิปโดยแอดมินเรียบร้อย! รายการย้ายเข้าตารางรายจ่ายประจำวันหลักแล้ว');
  };

  const handleRejectTransfer = (rejectedTxn) => {
    onSaveTxn(rejectedTxn);
    alert('❌ บันทึกการปฏิเสธการโอนเงินเรียบร้อยแล้ว');
  };

  const handleRescheduleTransfer = (rescheduledTxn) => {
    onSaveTxn(rescheduledTxn);
    alert(`📅 เลื่อนวันโอนเป็นวันที่ ${rescheduledTxn.date} เรียบร้อยแล้ว`);
  };

  // Generate monthly drafts from recurring templates
  const handleGenerateMonthlyDrafts = () => {
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    if (frozenMonths.includes(currentMonthKey)) {
      alert(`⛔ ไม่สามารถสร้าง Draft ได้: เดือน ${currentMonthKey} ถูกปิดงบแล้ว (Frozen Month)`);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let createdCount = 0;

    recurringTemplates.forEach(t => {
      if (!t.is_active) return;
      const draftTxn = {
        id: `TXN-REC-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        date: todayStr,
        title: `[Draft จ่ายประจำ] ${t.title}`,
        expense_type: t.expense_type,
        account_type: t.account_type,
        amount: t.amount,
        withholding_tax: t.withholding_tax || 0,
        social_security: 0,
        loan_for_employee: 0,
        net_transfer: t.amount - (t.withholding_tax || 0),
        payee: t.payee || '',
        transaction_type: 'รายจ่าย',
        status: '⏳ รอโอน',
        off_book_expense: false,
        hospital_name: '',
        notes: 'รายการจ่ายประจำค้างโอนประจำเดือน [รอแนบสลิป/ยืนยัน]',
        vat_eligible: false,
        tax_deductible: true,
        pnd_submitted: false,
        attachment_url: '',
        is_pending_draft: true,
        created_by: currentUser?.name || 'SYSTEM',
        updated_at: new Date().toISOString()
      };

      onSaveTxn(draftTxn);
      createdCount++;
    });

    alert(`⚡ สร้างรายการร่างค้างโอนประจำเดือนเรียบร้อยแล้ว ${createdCount} รายการ!`);
    setIsRecurringModalOpen(false);
    setSubTab('pending_transfers');
  };

  const handleSaveRecurringTemplate = (tData) => {
    setRecurringTemplates(prev => [tData, ...prev]);
  };

  const handleDeleteRecurringTemplate = (tId) => {
    setRecurringTemplates(prev => prev.filter(t => t.id !== tId));
  };

  const handleOpenNewModal = () => {
    setEditingTxn(null);
    setIsModalOpen(true);
  };

  const handleEditTxn = (txn) => {
    const monthKey = (txn.date || '').substring(0, 7);
    if (frozenMonths.includes(monthKey)) {
      alert(`⛔ เดือน ${monthKey} ถูกปิดงบแล้ว ไม่สามารถแก้ไขได้`);
      return;
    }
    setEditingTxn(txn);
    setIsModalOpen(true);
  };

  const handleDeleteTxn = (txnId, txnDate) => {
    if (txnDate) {
      const monthKey = (txnDate || '').substring(0, 7);
      if (frozenMonths.includes(monthKey)) {
        alert(`⛔ เดือน ${monthKey} ถูกปิดงบแล้ว ไม่สามารถลบได้`);
        return;
      }
    }
    onDeleteTxn(txnId);
  };

  const handleSaveModal = (txnData) => {
    onSaveTxn(txnData);
    setIsModalOpen(false);
    setEditingTxn(null);
  };

  const handleImportTxns = (importedArray) => {
    importedArray.forEach(t => onSaveTxn(t));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar & Action Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/30 flex items-center justify-center text-2xl shadow-inner">
            🧾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MOD-09 ACCOUNTING & FINANCIAL MANAGEMENT
              </span>
              <span className="text-xs text-slate-400 font-medium">ผู้เข้าใช้: <strong>{currentUser?.name || 'ผู้ใช้งาน'}</strong> ({currentUser?.role})</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">ระบบลงบันทึกรายรับ-รายจ่าย & รายงานวิเคราะห์การเงินองค์กร</h2>
          </div>
        </div>

        {/* Action Buttons & Sub Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Dedicated Pending Transfer Creation Button */}
          <button
            onClick={() => setIsPendingTransferModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <span>📌 ตั้งค้างโอนประจำเดือน</span>
          </button>

          <button
            onClick={() => setIsRecurringModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>🔄 จ่ายประจำ (Recurring)</span>
          </button>

          <button
            onClick={() => setIsFreezeModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>🔒 ปิดงบ (Freeze Month)</span>
          </button>

          {/* Sub Tabs Navigation */}
          <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setSubTab('daily_entries')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'daily_entries' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 บันทึกรายวัน Grid
            </button>

            <button
              onClick={() => setSubTab('pending_transfers')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'pending_transfers' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-300 hover:text-white'
              }`}
            >
              <span>⏳ ค้างโอนประจำเดือน</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.2 bg-rose-500 text-white font-mono text-[10.5px] rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSubTab('financial_statements')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'financial_statements' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 งบการเงิน P&L
            </button>

            <button
              onClick={() => setSubTab('hospital_payee_analytics')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'hospital_payee_analytics' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏥 Drill-Down ราย รพ.
            </button>

            <button
              onClick={() => setSubTab('bank_reconciliation')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'bank_reconciliation' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏦 Bank Reconciliation
            </button>
          </div>
        </div>
      </div>

      {/* SUB TAB 1: Daily Transactions */}
      {subTab === 'daily_entries' && (
        <DailyTransactionView
          transactions={transactions}
          frozenMonths={frozenMonths}
          currentUser={currentUser}
          onOpenNewModal={handleOpenNewModal}
          onEditTxn={handleEditTxn}
          onDeleteTxn={handleDeleteTxn}
          onImportTxns={handleImportTxns}
        />
      )}

      {/* SUB TAB 2: Pending Transfers View */}
      {subTab === 'pending_transfers' && (
        <PendingTransfersView
          transactions={transactions}
          currentUser={currentUser}
          onSaveTxn={onSaveTxn}
          onDeleteTxn={onDeleteTxn}
          onOwnerTransfer={handleOwnerTransfer}
          onConfirmTransfer={handleConfirmTransfer}
          onRejectTransfer={handleRejectTransfer}
          onRescheduleTransfer={handleRescheduleTransfer}
        />
      )}

      {/* SUB TAB 3: Financial Statements */}
      {subTab === 'financial_statements' && (
        <FinancialStatementsView
          transactions={transactions}
          currentUser={currentUser}
        />
      )}

      {/* SUB TAB 4: Hospital & Payee Drill-Down Analytics */}
      {subTab === 'hospital_payee_analytics' && (
        <HospitalPayeeAnalyticsView
          transactions={transactions}
        />
      )}

      {/* SUB TAB 5: Bank Reconciliation */}
      {subTab === 'bank_reconciliation' && (
        <BankReconciliationView
          transactions={transactions}
        />
      )}

      {/* Dedicated Pending Transfer Modal */}
      {isPendingTransferModalOpen && (
        <CreatePendingTransferModal
          onSave={handleSavePendingTransfer}
          onClose={() => setIsPendingTransferModalOpen(false)}
        />
      )}

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          editingTxn={editingTxn}
          frozenMonths={frozenMonths}
          onSave={handleSaveModal}
          onClose={() => { setIsModalOpen(false); setEditingTxn(null); }}
        />
      )}

      {/* Recurring Payments Modal */}
      {isRecurringModalOpen && (
        <RecurringPaymentsModal
          templates={recurringTemplates}
          onSaveTemplate={handleSaveRecurringTemplate}
          onDeleteTemplate={handleDeleteRecurringTemplate}
          onGenerateDrafts={handleGenerateMonthlyDrafts}
          onClose={() => setIsRecurringModalOpen(false)}
        />
      )}

      {/* Freeze Month Control Modal */}
      {isFreezeModalOpen && (
        <FreezeMonthModal
          frozenMonths={frozenMonths}
          onToggleFreeze={handleToggleFreeze}
          onClose={() => setIsFreezeModalOpen(false)}
        />
      )}

    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/BankReconciliationView.js ---
// MODULE: mod09_accounting/BankReconciliationView.js

function BankReconciliationView({ transactions = [] }) {
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || t.status === '⏳ รอโอนเงิน') {
        return false;
      }
      if (t.date) {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
      }
      return true;
    });
  }, [transactions, startDate, endDate]);

  // Reconciliation balances
  const bankReconData = useMemo(() => {
    const accounts = window.getCompanyAccounts ? window.getCompanyAccounts() : ['Aeron Kbank ออมทรัพย์', 'Aeron Kbank กระแสรายวัน', 'Aeron Kbank ฝากประจำ', 'Aeron SCB ออมทรัพย์', 'Aeron SCB กระแสรายวัน'];
    const map = {};

    accounts.forEach(acc => {
      map[acc] = {
        accountName: acc,
        totalIncome: 0,
        totalExpense: 0,
        endingBalance: 0,
        txnCount: 0,
        txns: []
      };
    });

    filteredTransactions.forEach(t => {
      const acc = t.account_type || 'Aeron Kbank ออมทรัพย์';
      if (!map[acc]) {
        map[acc] = { accountName: acc, totalIncome: 0, totalExpense: 0, endingBalance: 0, txnCount: 0, txns: [] };
      }
      const netVal = Number(t.net_transfer) || 0;
      map[acc].txnCount++;
      map[acc].txns.push(t);

      if (t.transaction_type === 'รายรับ') {
        map[acc].totalIncome += netVal;
        map[acc].endingBalance += netVal;
      } else {
        map[acc].totalExpense += netVal;
        map[acc].endingBalance -= netVal;
      }
    });

    return Object.values(map);
  }, [filteredTransactions]);

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-3xl shadow-inner text-amber-400">
            🏦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AUTOMATED BANK RECONCILIATION
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">ระบบพิสูจน์ยอดและสรุปดุลบัญชีธนาคารองค์กร (Reconciliation Engine)</h2>
          </div>
        </div>

        {/* High-Contrast Vibrant Yellow Date Range Picker Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>ช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}
        </div>
      </div>

      {/* Reconciliation Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bankReconData.map(acc => (
          <div key={acc.accountName} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>🏦 {acc.accountName}</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono font-bold">
                {acc.txnCount} รายการ
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10.5px] text-slate-400 font-medium">💰 เงินรับเข้า</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  +{acc.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10.5px] text-slate-400 font-medium">💸 เงินจ่ายออก</div>
                <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                  -{acc.totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10.5px] text-slate-400 font-medium">💵 ดุลสุทธิ</div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${acc.endingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {acc.endingBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/CreatePendingTransferModal.js ---
// MODULE: mod09_accounting/CreatePendingTransferModal.js

function CreatePendingTransferModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: `TXN-DRAFT-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`,
    date: new Date().toISOString().split('T')[0],
    title: '',
    expense_type: 'ค่าเช่า Rent',
    account_type: 'บริษัท KBANK',
    amount: 0,
    withholding_tax: 0,
    social_security: 0,
    loan_for_employee: 0,
    net_transfer: 0,
    payee: '',
    transaction_type: 'รายจ่าย',
    status: '⏳ รอโอน',
    rejection_reason: '',
    off_book_expense: false,
    hospital_name: '',
    notes: '[ตั้งค้างโอนประจำเดือน] รอผู้บริหารโอนเงินและแนบสลิป',
    vat_eligible: false,
    tax_deductible: true,
    pnd_submitted: false,
    attachment_url: '',
    is_pending_draft: true,
    created_by: 'ADMIN',
    updated_at: new Date().toISOString()
  });

  // Auto-calculate net_transfer
  useEffect(() => {
    const amt = Number(formData.amount) || 0;
    const wht = Number(formData.withholding_tax) || 0;
    const soc = Number(formData.social_security) || 0;
    const loan = Number(formData.loan_for_employee) || 0;
    
    const computedNet = formData.transaction_type === 'รายรับ'
      ? Math.max(0, amt - wht)
      : Math.max(0, amt - wht - soc - loan);

    setFormData(prev => ({ ...prev, net_transfer: computedNet }));
  }, [formData.amount, formData.withholding_tax, formData.social_security, formData.loan_for_employee, formData.transaction_type]);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleApplyTaxRate = (ratePercent) => {
    const amt = Number(formData.amount) || 0;
    const calculatedTax = (amt * ratePercent) / 100;
    setFormData(prev => ({ ...prev, withholding_tax: Math.round(calculatedTax * 100) / 100 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('กรุณาระบุชื่อรายการค้างโอน');
      return;
    }
    if (!formData.payee.trim()) {
      alert('กรุณาระบุผู้รับเงิน');
      return;
    }

    onSave({ ...formData, updated_at: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 w-full max-w-2xl rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              📌
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>📌 ตั้งรายการค้างโอนประจำเดือน (New Pending Transfer Draft)</span>
              </h3>
              <p className="text-xs text-slate-400">รายละเอียดฟิลด์และการคำนวณเหมือนบันทึกประจำวันทุกประการ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            สถานะเริ่มต้นเป็น <strong>"⏳ รอโอน"</strong> โดยจะไปสแตนด์บายในแท็บ <strong>"⏳ ค้างโอนประจำเดือน"</strong> และยังไม่นำไปแสดงในตารางรายวันหลัก จนกว่าแอดมินจะกด <strong>"✅ ยืนยันและแนบสลิป"</strong>
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทธุรกรรม <span className="text-rose-400">*</span></label>
              <select
                value={formData.transaction_type}
                onChange={(e) => handleChange('transaction_type', e.target.value)}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-extrabold outline-none focus:border-amber-500 ${
                  formData.transaction_type === 'รายรับ' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <option value="รายจ่าย">💸 รายจ่าย (Expense)</option>
                <option value="รายรับ">💰 รายรับ (Income / Revenue)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่นัดโอนเงินประจำเดือน <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่อรายการค้างโอน / คำอธิบาย <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น ค่าเช่าออฟฟิศประจำเดือน 8/69, ค่าทำบัญชี, ค่าเคสสครับ..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทค่าใช้จ่ายทั้งหมด <span className="text-rose-400">*</span></label>
              <select
                value={formData.expense_type}
                onChange={(e) => handleChange('expense_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 font-bold outline-none focus:border-amber-500"
              >
                <optgroup label="🏢 ค่าใช้จ่ายสำนักงานใหญ่ (Expenses H/O)">
                  <option value="ค่าเช่า Rent">ค่าเช่า Rent</option>
                  <option value="ค่าใช้จ่ายออฟฟิศ Office Supplies">ค่าใช้จ่ายออฟฟิศ Office Supplies</option>
                  <option value="ค่าส่งของ และค่าเดินทางของ H/O Transportation & Postal">ค่าส่งของ และค่าเดินทางของ H/O</option>
                  <option value="ค่าใช้จ่ายอื่นๆ ออฟฟิศ Office Other Expense">ค่าใช้จ่ายอื่นๆ ออฟฟิศ</option>
                  <option value="เงินเดือน พนักงาน H/O Salaries, Benefits & Wages">เงินเดือน พนักงาน H/O</option>
                  <option value="ค่าเอกสาร และ อื่นๆ Document&ETC">ค่าเอกสาร และ อื่นๆ</option>
                  <option value="ค่าเทรนนิ่งพนักงาน Training">ค่าเทรนนิ่งพนักงาน Training</option>
                  <option value="ค่าทำบัญชี Accounting Fee">ค่าทำบัญชี Accounting Fee</option>
                </optgroup>

                <optgroup label="💼 ค่าใช้จ่ายฝ่ายขาย (Sales Expenses)">
                  <option value="เงินเดือนเซลล์ Salaries, Benefits & Wages">เงินเดือนเซลล์</option>
                  <option value="ค่าใช้จ่ายเซลล์ Staff Expense">ค่าใช้จ่ายเซลล์ Staff Expense</option>
                  <option value="ค่าคอมเซลล์ Commission">ค่าคอมเซลล์ Commission</option>
                  <option value="เลี้ยงทีมเซลล์ Staff Entertainment">เลี้ยงทีมเซลล์</option>
                  <option value="ค่ารับรองลูกค้า Customers Entertainment">ค่ารับรองลูกค้า</option>
                  <option value="ค่าใช้จ่ายอื่นๆ เซลล์ Sales Other Expense">ค่าใช้จ่ายอื่นๆ เซลล์</option>
                  <option value="ค่าเข้าเคส สครับ Scrub Expense">ค่าเข้าเคส สครับ Scrub Expense</option>
                </optgroup>

                <optgroup label="📦 ต้นทุนขาย (COGS)">
                  <option value="ค่าซื้อสินค้า Material Expense">ค่าซื้อสินค้า Material Expense</option>
                  <option value="ค่าขนส่งสินค้า Transportation Expense">ค่าขนส่งสินค้า Transportation Expense</option>
                  <option value="ค่าจดเอกสารต่างๆ Document Registration">ค่าจดเอกสารต่างๆ Document Registration</option>
                  <option value="ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง">ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง</option>
                  <option value="ภาษีนำเข้า Import Tax">ภาษีนำเข้า Import Tax</option>
                </optgroup>

                <optgroup label="💵 ดอกเบี้ย & ภาษี">
                  <option value="ดอกเบี้ย Interest Expense">ดอกเบี้ย Interest Expense</option>
                  <option value="ภาษี Vat 7% Vat 7%">ภาษี Vat 7%</option>
                  <option value="ภาษีรายได้บริษัท Income Taxes">ภาษีรายได้บริษัท</option>
                </optgroup>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ช่องทาง/บัญชีชำระเงิน <span className="text-rose-400">*</span></label>
              <select
                value={formData.account_type}
                onChange={(e) => handleChange('account_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-medium outline-none"
              >
                {(window.getCompanyAccounts ? window.getCompanyAccounts() : ['Aeron Kbank ออมทรัพย์', 'Aeron Kbank กระแสรายวัน', 'Aeron Kbank ฝากประจำ', 'Aeron SCB ออมทรัพย์', 'Aeron SCB กระแสรายวัน']).map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amounts & Deductions Grid */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🧮 คำนวณยอดเงินและภาษีหัก ณ ที่จ่าย</span>
                <span className="text-[10px] text-slate-400 font-normal">(Auto Tax W/H Preset)</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
                <input
                  type="checkbox"
                  checked={formData.off_book_expense}
                  onChange={(e) => handleChange('off_book_expense', e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>รายการนอกระบบ (Off-book)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">จำนวนเงินรวม (บาท) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ภาษีหัก ณ ที่จ่าย</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyTaxRate(3)}
                      className="px-1.5 py-0.2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded text-[9.5px] font-bold border border-indigo-500/40"
                    >
                      3%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTaxRate(5)}
                      className="px-1.5 py-0.2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-[9.5px] font-bold border border-purple-500/40"
                    >
                      5%
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.withholding_tax}
                  onChange={(e) => handleChange('withholding_tax', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-rose-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">ประกันสังคม (ถ้ามี)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.social_security}
                  onChange={(e) => handleChange('social_security', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-indigo-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">หักยืม/เงินกู้พนักงาน</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.loan_for_employee}
                  onChange={(e) => handleChange('loan_for_employee', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-amber-300 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">💵 ยอดโอนสุทธิ (Net Transfer):</span>
              <span className="text-base font-black font-mono text-amber-400">
                {formData.net_transfer.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </span>
            </div>
          </div>

          {/* Tax Flags & Attachment URL */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300">🏷️ สถานะทางภาษี & สลิปเอกสาร</div>
            <div className="flex flex-wrap gap-4 text-[11.5px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.vat_eligible}
                  onChange={(e) => handleChange('vat_eligible', e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>มีใบกำกับภาษี (VAT 7%)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.tax_deductible}
                  onChange={(e) => handleChange('tax_deductible', e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>ลงเป็นค่าใช้จ่ายบริษัทได้</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.pnd_submitted}
                  onChange={(e) => handleChange('pnd_submitted', e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span>ยื่น ภ.ง.ด.3/53 แล้ว</span>
              </label>
            </div>

            <div className="pt-2">
              <label className="text-[11px] text-slate-400">URL แนบสลิป / ใบเสร็จเอกสาร (ถ้ามีล่วงหน้า):</label>
              <input
                type="text"
                placeholder="เช่น https://images.unsplash.com/... หรือ /uploads/slips/slip_01.jpg"
                value={formData.attachment_url}
                onChange={(e) => handleChange('attachment_url', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none font-mono text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้รับเงิน / ผู้จ่ายเงิน (Payee) <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น อาคารออฟฟิศ, สำนักงานบัญชี, แพทย์ DF..."
                value={formData.payee}
                onChange={(e) => handleChange('payee', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / โครงการที่เกี่ยวข้อง</label>
              <input
                type="text"
                placeholder="เช่น คณะแพทย์ศาสตร์ มหิดล, รพ.ศิริราช..."
                value={formData.hospital_name}
                onChange={(e) => handleChange('hospital_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / คำสั่งโอนเพิ่มเติม</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono outline-none"
            />
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
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <span>📌 บันทึกตั้งค้างโอนประจำเดือน</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/DailyTransactionView.js ---
// MODULE: mod09_accounting/DailyTransactionView.js

function DailyTransactionView({ transactions = [], frozenMonths = [], currentUser, onOpenNewModal, onEditTxn, onDeleteTxn, onImportTxns }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, รายรับ, รายจ่าย
  const [filterExpenseType, setFilterExpenseType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterHospital, setFilterHospital] = useState('all');
  const [isPettyCashModalOpen, setIsPettyCashModalOpen] = useState(false);
  
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  const [activeSlipUrl, setActiveSlipUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Filter out Pending Drafts from active daily log grid until confirmed by Admin
  const activeTxns = useMemo(() => {
    return transactions.filter(t => {
      if (t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || t.status === '⏳ รอโอนเงิน') {
        return false;
      }
      if (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]') && !t.notes.includes('[แอดมินแนบสลิปเรียบร้อย]')) {
        return false;
      }
      return true;
    });
  }, [transactions]);

  // Unique Hospitals list for filter
  const hospitalList = useMemo(() => {
    const set = new Set();
    activeTxns.forEach(t => {
      if (t.hospital_name && t.hospital_name.trim()) set.add(t.hospital_name.trim());
    });
    return Array.from(set).sort();
  }, [activeTxns]);

  const filteredTxns = useMemo(() => {
    return activeTxns.filter(t => {
      if (filterType !== 'all' && t.transaction_type !== filterType) return false;
      if (filterExpenseType !== 'all' && t.expense_type !== filterExpenseType) return false;
      if (filterAccount !== 'all' && t.account_type !== filterAccount) return false;
      if (filterHospital !== 'all' && t.hospital_name !== filterHospital) return false;

      // Date Range Picker Filter
      if (t.date) {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchPayee = (t.payee || '').toLowerCase().includes(q);
        const matchHospital = (t.hospital_name || '').toLowerCase().includes(q);
        const matchNotes = (t.notes || '').toLowerCase().includes(q);
        return matchTitle || matchPayee || matchHospital || matchNotes;
      }
      return true;
    });
  }, [activeTxns, filterType, filterExpenseType, filterAccount, filterHospital, startDate, endDate, searchTerm]);

  // Totals calculations
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let tax = 0;
    let net = 0;
    let offBookCount = 0;

    filteredTxns.forEach(t => {
      const amt = Number(t.amount) || 0;
      const wht = Number(t.withholding_tax) || 0;
      const netVal = Number(t.net_transfer) || 0;

      if (t.transaction_type === 'รายรับ') {
        income += amt;
      } else {
        expense += amt;
      }
      tax += wht;
      net += (t.transaction_type === 'รายรับ' ? netVal : -netVal);

      if (t.off_book_expense) offBookCount++;
    });

    return { income, expense, tax, net, offBookCount };
  }, [filteredTxns]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      "ID", "วันที่", "รายการคำอธิบาย", "หมวดหมู่", "ช่องทางชำระเงิน",
      "จำนวนเงินรวม(บาท)", "ภาษีหัก ณ ที่จ่าย", "ประกันสังคม", "หักกู้ยืมพนักงาน",
      "ยอดโอนรวม(บาท)", "หมายเหตุ", "ผู้รับ/จ่ายเงิน", "รายรับ/รายจ่าย",
      "ค่าใช้จ่ายนอกบิล", "โรงพยาบาล/โครงการ", "แนบสลิป/เอกสาร"
    ];

    const rows = filteredTxns.map(t => [
      `"${t.id || ''}"`,
      `"${t.date || ''}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.expense_type || '').replace(/"/g, '""')}"`,
      `"${(t.account_type || '').replace(/"/g, '""')}"`,
      t.amount || 0,
      t.withholding_tax || 0,
      t.social_security || 0,
      t.loan_for_employee || 0,
      t.net_transfer || 0,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.payee || '').replace(/"/g, '""')}"`,
      `"${t.transaction_type || ''}"`,
      t.off_book_expense ? "ใช่" : "ไม่ใช่",
      `"${(t.hospital_name || '').replace(/"/g, '""')}"`,
      `"${t.attachment_url || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AERON_Daily_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import File CSV Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length <= 1) {
          alert('ไฟล์ไม่มีข้อมูลธุรกรรม');
          return;
        }

        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 5) {
            imported.push({
              id: cols[0] || `TXN-${Date.now()}-${i}`,
              date: cols[1] || new Date().toISOString().split('T')[0],
              title: cols[2] || 'รายการนำเข้า',
              expense_type: cols[3] || 'ค่าใช้จ่ายทั่วไป',
              account_type: cols[4] || 'บริษัท KBANK',
              amount: Number(cols[5]) || 0,
              withholding_tax: Number(cols[6]) || 0,
              social_security: Number(cols[7]) || 0,
              loan_for_employee: Number(cols[8]) || 0,
              net_transfer: Number(cols[9]) || Number(cols[5]) || 0,
              notes: cols[10] || 'นำเข้าจาก CSV',
              payee: cols[11] || '',
              transaction_type: cols[12] || 'รายจ่าย',
              off_book_expense: cols[13] === 'ใช่',
              hospital_name: cols[14] || '',
              attachment_url: cols[15] || ''
            });
          }
        }

        if (imported.length > 0 && onImportTxns) {
          onImportTxns(imported);
          alert(`นำเข้าข้อมูลสำเร็จ ${imported.length} รายการ`);
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      
      {/* Hidden File Input for Excel/CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Slip Attachment Preview Modal */}
      {activeSlipUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-5 space-y-3 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">🧾 รูปภาพสลิปโอนเงิน / เอกสารแนบ</h4>
              <button onClick={() => setActiveSlipUrl(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center p-2 bg-slate-950 rounded-2xl">
              <img src={activeSlipUrl} alt="Slip Attachment" className="max-w-full rounded-xl object-contain shadow-lg" />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setActiveSlipUrl(null)} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💰 รายรับรวม (Income)</div>
          <div className="text-xl font-black font-mono text-emerald-400">
            {totals.income.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💸 รายจ่ายรวม (Expense)</div>
          <div className="text-xl font-black font-mono text-rose-400">
            {totals.expense.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">🧾 ภาษีหัก ณ ที่จ่ายรวม</div>
          <div className="text-xl font-black font-mono text-indigo-300">
            {totals.tax.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💵 กระแสโอนสุทธิ (Net Flow)</div>
          <div className={`text-xl font-black font-mono ${totals.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totals.net.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Date Range Picker */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        
        {/* Date Range Picker & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          
          {/* High-Contrast Vibrant Yellow Date Range Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 rounded-xl p-1.5 shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span>ช่วงวันที่:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-lg p-1 outline-none text-xs"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-lg p-1 outline-none text-xs"
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white text-xs px-1">✕</button>
            )}
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="🔍 ค้นหารายการ, ผู้รับเงิน, โรงพยาบาล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-3 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none font-bold"
          >
            <option value="all">🌐 ประเภททั้งหมด</option>
            <option value="รายรับ">💰 เฉพาะรายรับ</option>
            <option value="รายจ่าย">💸 เฉพาะรายจ่าย</option>
          </select>

          <select
            value={filterExpenseType}
            onChange={(e) => setFilterExpenseType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none max-w-[200px]"
          >
            <option value="all">📦 หมวดหมู่ทั้งหมด</option>
            <optgroup label="📦 ต้นทุนขาย (COGS)">
              <option value="ค่าซื้อสินค้า Material Expense">ค่าซื้อสินค้า Material Expense</option>
              <option value="ค่าขนส่งสินค้า Transportation Expense">ค่าขนส่งสินค้า Transportation Expense</option>
              <option value="ค่าจดเอกสารต่างๆ Document Registration">ค่าจดเอกสารต่างๆ Document Registration</option>
              <option value="ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง">ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง</option>
              <option value="ภาษีนำเข้า Import Tax">ภาษีนำเข้า Import Tax</option>
            </optgroup>
            <optgroup label="🏢 ค่าใช้จ่ายสำนักงานใหญ่ (Expenses H/O)">
              <option value="ค่าเช่า Rent">ค่าเช่า Rent</option>
              <option value="ค่าใช้จ่ายออฟฟิศ Office Supplies">ค่าใช้จ่ายออฟฟิศ Office Supplies</option>
              <option value="ค่าส่งของ และค่าเดินทางของ H/O Transportation & Postal">ค่าส่งของ และค่าเดินทางของ H/O</option>
              <option value="ค่าใช้จ่ายอื่นๆ ออฟฟิศ Office Other Expense">ค่าใช้จ่ายอื่นๆ ออฟฟิศ</option>
              <option value="เงินเดือน พนักงาน H/O Salaries, Benefits & Wages">เงินเดือน พนักงาน H/O</option>
              <option value="ค่าเอกสาร และ อื่นๆ Document&ETC">ค่าเอกสาร และ อื่นๆ</option>
              <option value="ค่าเทรนนิ่งพนักงาน Training">ค่าเทรนนิ่งพนักงาน Training</option>
              <option value="ค่าทำบัญชี Accounting Fee">ค่าทำบัญชี Accounting Fee</option>
            </optgroup>
            <optgroup label="💼 ค่าใช้จ่ายฝ่ายขาย (Sales Expenses)">
              <option value="เงินเดือนเซลล์ Salaries, Benefits & Wages">เงินเดือนเซลล์</option>
              <option value="ค่าใช้จ่ายเซลล์ Staff Expense">ค่าใช้จ่ายเซลล์ Staff Expense</option>
              <option value="ค่าคอมเซลล์ Commission">ค่าคอมเซลล์ Commission</option>
              <option value="เลี้ยงทีมเซลล์ Staff Entertainment">เลี้ยงทีมเซลล์</option>
              <option value="ค่ารับรองลูกค้า Customers Entertainment">ค่ารับรองลูกค้า</option>
              <option value="ค่าใช้จ่ายอื่นๆ เซลล์ Sales Other Expense">ค่าใช้จ่ายอื่นๆ เซลล์</option>
              <option value="ค่าเข้าเคส สครับ Scrub Expense">ค่าเข้าเคส สครับ Scrub Expense</option>
            </optgroup>
            <optgroup label="💵 ดอกเบี้ย & ภาษี">
              <option value="ดอกเบี้ย Interest Expense">ดอกเบี้ย Interest Expense</option>
              <option value="ภาษี Vat 7% Vat 7%">ภาษี Vat 7%</option>
              <option value="ภาษีรายได้บริษัท Income Taxes">ภาษีรายได้บริษัท</option>
            </optgroup>
          </select>

          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none"
          >
            <option value="all">🏦 บัญชีทั้งหมด</option>
            {(window.getCompanyAccounts ? window.getCompanyAccounts() : ['Aeron Kbank ออมทรัพย์', 'Aeron Kbank กระแสรายวัน', 'Aeron Kbank ฝากประจำ', 'Aeron SCB ออมทรัพย์', 'Aeron SCB กระแสรายวัน']).map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>

          {hospitalList.length > 0 && (
            <select
              value={filterHospital}
              onChange={(e) => setFilterHospital(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 outline-none font-semibold"
            >
              <option value="all">🏥 โรงพยาบาลทั้งหมด</option>
              {hospitalList.map(h => (
                <option key={h} value={h}>🏥 {h}</option>
              ))}
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentUser && ['OWNER', 'HEAD_ADMIN', 'ADMIN'].includes(String(currentUser.role).toUpperCase()) && (
            <button
              onClick={() => setIsPettyCashModalOpen(true)}
              className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold rounded-xl border border-amber-500/40 transition-colors flex items-center gap-1.5 shadow-md"
              title="ตั้งค่าบัญชีเงินสดสำรองจ่ายรายบุคคล"
            >
              <span>💵 ตั้งค่า Petty Cash</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <span>📥 Import CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <span>📊 Export Excel</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
          >
            <span>+ ลงบันทึกรายการใหม่</span>
          </button>
        </div>

      </div>

      {/* Transactions Table Spreadsheet Grid matching Excel Screenshots */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <span>📋 ตารางบันทึกรายรับ-รายจ่ายรายวัน (Spreadsheet Grid View)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredTxns.length} รายการ
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">วันที่</th>
                <th className="p-3">รายการ</th>
                <th className="p-3">ประเภทค่าใช้จ่าย</th>
                <th className="p-3">บัญชีผู้โอน</th>
                <th className="p-3 text-right">ยอดเงิน</th>
                <th className="p-3 text-right">W/H</th>
                <th className="p-3 text-right">ประกันสังคม</th>
                <th className="p-3 text-right">ยอดโอนรวม</th>
                <th className="p-3">หมายเหตุ</th>
                <th className="p-3">ผู้รับเงิน</th>
                <th className="p-3 text-center">ประเภท</th>
                <th className="p-3">โรงพยาบาล</th>
                <th className="p-3 text-center">สลิป/เอกสาร</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="14" className="p-8 text-center text-slate-500 italic">
                    ไม่พบรายการรายรับ-รายจ่ายที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredTxns.map(t => {
                  const monthKey = (t.date || '').substring(0, 7);
                  const isFrozen = frozenMonths.includes(monthKey);

                  return (
                    <tr key={t.id} className={`hover:bg-slate-900/50 transition-colors ${isFrozen ? 'opacity-85 bg-slate-950/40' : ''}`}>
                      <td className="p-3 font-mono text-slate-400">
                        {t.date}
                        {isFrozen && (
                          <span className="block text-[9px] text-rose-400 font-bold">🔒 ปิดงบแล้ว</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white leading-snug">{t.title}</div>
                        {t.vat_eligible && <span className="inline-block text-[9.5px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 mt-0.5">VAT 7%</span>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium text-[11px]">
                          {t.expense_type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{t.account_type}</td>
                      <td className={`p-3 text-right font-mono font-bold ${t.transaction_type === 'รายรับ' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.transaction_type === 'รายรับ' ? '+' : '-'}{(t.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-indigo-300">
                        {t.withholding_tax > 0 ? (t.withholding_tax).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono text-indigo-300">
                        {t.social_security > 0 ? (t.social_security).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                        {(t.net_transfer || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px] max-w-[150px] truncate">{t.notes || '-'}</td>
                      <td className="p-3 font-semibold text-slate-200">{t.payee || '-'}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] ${t.transaction_type === 'รายรับ' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{t.hospital_name || '-'}</td>
                      <td className="p-3 text-center">
                        {t.attachment_url ? (
                          <button
                            onClick={() => setActiveSlipUrl(t.attachment_url)}
                            className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-[10.5px] font-bold border border-indigo-500/40"
                          >
                            🖼️ ดูสลิป
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10.5px]">ไม่มี</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {!isFrozen ? (
                          <>
                            <button
                              onClick={() => onEditTxn(t)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              onClick={() => onDeleteTxn(t.id, t.date)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 rounded-lg text-[11px]"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-[10px] italic">🔒 ปิดงบ</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Petty Cash Account Management Modal */}
      <PettyCashModal
        isOpen={isPettyCashModalOpen}
        onClose={() => setIsPettyCashModalOpen(false)}
        onSave={() => setFilterAccount('all')}
      />

    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/FinancialStatementsView.js ---
// MODULE: mod09_accounting/FinancialStatementsView.js

function FinancialStatementsView({ transactions = [], currentUser }) {
  const [statementTab, setStatementTab] = useState('monthly_matrix'); // 'monthly_matrix' | 'p_l' | 'cash_flow' | 'balance_sheet'
  const [selectedYear, setSelectedYear] = useState('2026');
  
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');
  const [periodPreset, setPeriodPreset] = useState('all'); // 'all' | 'monthly' | 'yearly' | 'custom'

  // Quick Preset Handlers
  const handleApplyMonthlyPreset = (monthOffset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1 + monthOffset;
    const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    setPeriodPreset('monthly');
  };

  const handleApplyYearlyPreset = (year = new Date().getFullYear()) => {
    setStartDate(`${year}-01-01`);
    setEndDate(`${year}-12-31`);
    setSelectedYear(String(year));
    setPeriodPreset('yearly');
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setPeriodPreset('all');
  };

  // Filtered Transactions by Date Range
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      // Exclude pending unconfirmed drafts from financial statements
      if (t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || t.status === '⏳ รอโอนเงิน') {
        return false;
      }
      if (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]') && !t.notes.includes('[แอดมินแนบสลิปเรียบร้อย]')) {
        return false;
      }

      if (!t.date) return true;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      return true;
    });
  }, [transactions, startDate, endDate]);

  // ----------------------------------------------------
  // MONTHLY 12-MONTH MATRIX COMPUTATION (Jan - Dec + Full Year)
  // ----------------------------------------------------
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const monthlyMatrix = useMemo(() => {
    const targetYr = Number(selectedYear) || 2026;

    // Initialize 12 months data structure
    const monthsData = monthNames.map((name, idx) => ({
      name,
      monthIdx: idx,
      // Revenue
      returnsDiscounts: 0,
      totalNetRevenue: 0,
      // COGS
      materialExp: 0,
      transportExp: 0,
      docRegExp: 0,
      etcInsuranceExp: 0,
      importTaxExp: 0,
      cogsTotal: 0,
      grossProfit: 0,
      // H/O Expenses
      rentExp: 0,
      officeSuppliesExp: 0,
      postalExp: 0,
      officeOtherExp: 0,
      hoSalariesExp: 0,
      docEtcExp: 0,
      trainingExp: 0,
      accountingFeeExp: 0,
      hoTotal: 0,
      // Sales Expenses
      salesSalariesExp: 0,
      staffCommExp: 0,
      incentiveCommExp: 0,
      staffEntExp: 0,
      custEntExp: 0,
      salesOtherExp: 0,
      scrubExp: 0,
      salesTotal: 0,
      // Totals & Taxes
      totalExpenses: 0,
      ebit: 0,
      interestExp: 0,
      ebt: 0,
      vat7: 0,
      incomeTax: 0,
      netEarnings: 0,
      cashFlow: 0,
      // Balance Sheet
      accountsReceivable: 0,
      cashBalance: 0,
      stockVal: 0,
      totalAssets: 0,
      accountsPayable: 0,
      smeBank1: 0,
      smeBank2: 0,
      relativeLoan: 0,
      equityCapital: 0,
      totalLiabilities: 0,
      totalEquityLiabilities: 0
    }));

    // Populate data from filteredTransactions
    filteredTransactions.forEach(t => {
      if (!t.date) return;
      const d = new Date(t.date);
      const tYr = d.getFullYear();
      if (selectedYear !== 'all' && tYr !== targetYr) return;

      const mIdx = d.getMonth();
      if (mIdx < 0 || mIdx > 11) return;

      const m = monthsData[mIdx];
      const amt = Number(t.amount) || 0;
      const cat = t.category || t.expense_type || '';
      const notes = t.notes || '';
      const isIncome = t.type === 'income' || t.transaction_type === 'รายรับ';
      const isExpense = t.type === 'expense' || t.transaction_type === 'รายจ่าย';

      if (isIncome) {
        if (cat.includes('ส่วนลด') || cat.includes('คืนสินค้า')) {
          m.returnsDiscounts += amt;
        } else {
          m.totalNetRevenue += amt;
        }
      } else if (isExpense) {
        // COGS
        if (cat.includes('ซื้อสินค้า') || cat.includes('ต้นทุน') || notes.includes('Material')) m.materialExp += amt;
        else if (cat.includes('ขนส่ง') || notes.includes('Transport')) m.transportExp += amt;
        else if (cat.includes('เอกสาร') || notes.includes('Doc')) m.docRegExp += amt;
        else if (cat.includes('ภาษีนำเข้า') || notes.includes('Import Tax')) m.importTaxExp += amt;
        else if (cat.includes('ประกัน') || cat.includes('โต๊ะ') || cat.includes('โต้ะ')) m.etcInsuranceExp += amt;
        
        // H/O Expenses
        else if (cat.includes('ค่าเช่า') || notes.includes('Rent')) m.rentExp += amt;
        else if (cat.includes('ออฟฟิศ') || cat.includes('วัสดุสำนักงาน')) m.officeSuppliesExp += amt;
        else if (cat.includes('ส่งของ') || cat.includes('ไปรษณีย์')) m.postalExp += amt;
        else if (cat.includes('เงินเดือน H/O') || cat.includes('เงินเดือน พนักงาน') || notes.includes('H/O Salary')) m.hoSalariesExp += amt;
        else if (cat.includes('ทำบัญชี') || notes.includes('Accounting')) m.accountingFeeExp += amt;
        else if (cat.includes('เทรนนิ่ง') || cat.includes('อบรม')) m.trainingExp += amt;

        // Sales Expenses
        else if (cat.includes('เงินเดือนเซลล์') || cat.includes('เงินเดือนเซลส์') || notes.includes('Sales Salary')) m.salesSalariesExp += amt;
        else if (cat.includes('คอมมิชชั่น') || cat.includes('ค่าคอม') || cat.includes('Commission')) m.incentiveCommExp += amt;
        else if (cat.includes('เลี้ยงทีม') || notes.includes('Staff Ent')) m.staffEntExp += amt;
        else if (cat.includes('รับรองลูกค้า') || notes.includes('Cust Ent')) m.custEntExp += amt;
        else if (cat.includes('สครับ') || notes.includes('Scrub')) m.scrubExp += amt;
        else if (cat.includes('ค่าใช้จ่ายเซลล์')) m.salesOtherExp += amt;
        else if (cat.includes('ดอกเบี้ย')) m.interestExp += amt;
        else if (cat.includes('ภาษี')) m.incomeTax += amt;
        else m.officeOtherExp += amt;
      }
    });

    // Subtotal and Balance Sheet calculations per month (Strictly based on actual transactions)
    monthsData.forEach((m, idx) => {
      m.cogsTotal = m.materialExp + m.transportExp + m.docRegExp + m.etcInsuranceExp + m.importTaxExp;
      m.grossProfit = m.totalNetRevenue - m.cogsTotal - m.returnsDiscounts;

      m.hoTotal = m.rentExp + m.officeSuppliesExp + m.postalExp + m.officeOtherExp + m.hoSalariesExp + m.docEtcExp + m.trainingExp + m.accountingFeeExp;
      m.salesTotal = m.salesSalariesExp + m.staffCommExp + m.incentiveCommExp + m.staffEntExp + m.custEntExp + m.salesOtherExp + m.scrubExp;

      m.totalExpenses = m.hoTotal + m.salesTotal;
      m.ebit = m.grossProfit - m.totalExpenses;
      m.ebt = m.ebit - m.interestExp;
      m.netEarnings = m.ebt - m.vat7 - m.incomeTax;
      m.cashFlow = m.netEarnings; // Cash Flow Net

      // Balance Sheet (Defaults to 0 unless officially recorded)
      m.accountsReceivable = 0;
      m.cashBalance = 0;
      m.stockVal = 0;
      m.totalAssets = 0;

      m.accountsPayable = 0;
      m.smeBank1 = 0;
      m.smeBank2 = 0;
      m.relativeLoan = 0;
      m.equityCapital = 0;
      m.totalLiabilities = 0;
      m.totalEquityLiabilities = 0;
    });

    // Calculate Full Year Summary
    const fullYear = {
      name: 'Full Year',
      returnsDiscounts: monthsData.reduce((s, m) => s + m.returnsDiscounts, 0),
      totalNetRevenue: monthsData.reduce((s, m) => s + m.totalNetRevenue, 0),
      materialExp: monthsData.reduce((s, m) => s + m.materialExp, 0),
      transportExp: monthsData.reduce((s, m) => s + m.transportExp, 0),
      docRegExp: monthsData.reduce((s, m) => s + m.docRegExp, 0),
      etcInsuranceExp: monthsData.reduce((s, m) => s + m.etcInsuranceExp, 0),
      importTaxExp: monthsData.reduce((s, m) => s + m.importTaxExp, 0),
      cogsTotal: monthsData.reduce((s, m) => s + m.cogsTotal, 0),
      grossProfit: monthsData.reduce((s, m) => s + m.grossProfit, 0),
      rentExp: monthsData.reduce((s, m) => s + m.rentExp, 0),
      officeSuppliesExp: monthsData.reduce((s, m) => s + m.officeSuppliesExp, 0),
      postalExp: monthsData.reduce((s, m) => s + m.postalExp, 0),
      officeOtherExp: monthsData.reduce((s, m) => s + m.officeOtherExp, 0),
      hoSalariesExp: monthsData.reduce((s, m) => s + m.hoSalariesExp, 0),
      docEtcExp: monthsData.reduce((s, m) => s + m.docEtcExp, 0),
      trainingExp: monthsData.reduce((s, m) => s + m.trainingExp, 0),
      accountingFeeExp: monthsData.reduce((s, m) => s + m.accountingFeeExp, 0),
      hoTotal: monthsData.reduce((s, m) => s + m.hoTotal, 0),
      salesSalariesExp: monthsData.reduce((s, m) => s + m.salesSalariesExp, 0),
      staffCommExp: monthsData.reduce((s, m) => s + m.staffCommExp, 0),
      incentiveCommExp: monthsData.reduce((s, m) => s + m.incentiveCommExp, 0),
      staffEntExp: monthsData.reduce((s, m) => s + m.staffEntExp, 0),
      custEntExp: monthsData.reduce((s, m) => s + m.custEntExp, 0),
      salesOtherExp: monthsData.reduce((s, m) => s + m.salesOtherExp, 0),
      scrubExp: monthsData.reduce((s, m) => s + m.scrubExp, 0),
      salesTotal: monthsData.reduce((s, m) => s + m.salesTotal, 0),
      totalExpenses: monthsData.reduce((s, m) => s + m.totalExpenses, 0),
      ebit: monthsData.reduce((s, m) => s + m.ebit, 0),
      interestExp: monthsData.reduce((s, m) => s + m.interestExp, 0),
      ebt: monthsData.reduce((s, m) => s + m.ebt, 0),
      vat7: monthsData.reduce((s, m) => s + m.vat7, 0),
      incomeTax: monthsData.reduce((s, m) => s + m.incomeTax, 0),
      netEarnings: monthsData.reduce((s, m) => s + m.netEarnings, 0),
      cashFlow: monthsData.reduce((s, m) => s + m.cashFlow, 0),
      accountsReceivable: 0,
      cashBalance: 0,
      stockVal: 0,
      totalAssets: 0,
      accountsPayable: 0,
      smeBank1: 0,
      smeBank2: 0,
      relativeLoan: 0,
      equityCapital: 0,
      totalLiabilities: 0,
      totalEquityLiabilities: 0
    };

    return { months: monthsData, fullYear };
  }, [filteredTransactions, selectedYear]);

  // Detailed P&L Category Aggregations for Executive Summary
  const pnlBreakdown = useMemo(() => {
    let totalRevenue = 0;
    let materialExp = 0;
    let transportExp = 0;
    let docRegExp = 0;
    let etcInsuranceExp = 0;
    let importTaxExp = 0;
    let rentExp = 0;
    let officeSuppliesExp = 0;
    let hoSalariesExp = 0;
    let accountingFeeExp = 0;
    let hoOtherExp = 0;
    let salesSalariesExp = 0;
    let salesCommExp = 0;
    let staffEntExp = 0;
    let custEntExp = 0;
    let scrubExp = 0;

    filteredTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const cat = t.category || t.expense_type || '';
      const notes = t.notes || '';
      const isIncome = t.type === 'income' || t.transaction_type === 'รายรับ';
      const isExpense = t.type === 'expense' || t.transaction_type === 'รายจ่าย';

      if (isIncome) {
        totalRevenue += amt;
      } else if (isExpense) {
        if (cat.includes('ซื้อสินค้า') || cat.includes('ต้นทุน') || notes.includes('Material')) materialExp += amt;
        else if (cat.includes('ขนส่ง') || notes.includes('Transport')) transportExp += amt;
        else if (cat.includes('เอกสาร') || notes.includes('Doc')) docRegExp += amt;
        else if (cat.includes('ภาษีนำเข้า') || notes.includes('Import Tax')) importTaxExp += amt;
        else if (cat.includes('ประกัน') || cat.includes('โต๊ะ') || cat.includes('โต้ะ')) etcInsuranceExp += amt;
        else if (cat.includes('เช่า') || notes.includes('Rent')) rentExp += amt;
        else if (cat.includes('ออฟฟิศ') || cat.includes('วัสดุสำนักงาน')) officeSuppliesExp += amt;
        else if (cat.includes('เงินเดือน H/O') || cat.includes('เงินเดือน พนักงาน') || notes.includes('H/O Salary')) hoSalariesExp += amt;
        else if (cat.includes('ทำบัญชี') || notes.includes('Accounting')) accountingFeeExp += amt;
        else if (cat.includes('เงินเดือนเซลล์') || cat.includes('เงินเดือนเซลส์') || notes.includes('Sales Salary')) salesSalariesExp += amt;
        else if (cat.includes('คอมมิชชั่น') || cat.includes('ค่าคอม') || cat.includes('Commission')) salesCommExp += amt;
        else if (cat.includes('เลี้ยงทีม') || notes.includes('Staff Ent')) staffEntExp += amt;
        else if (cat.includes('รับรองลูกค้า') || notes.includes('Cust Ent')) custEntExp += amt;
        else if (cat.includes('สครับ') || notes.includes('Scrub')) scrubExp += amt;
        else hoOtherExp += amt;
      }
    });

    let totalCOGS = materialExp + transportExp + docRegExp + etcInsuranceExp + importTaxExp;
    if (totalCOGS === 0 && totalRevenue > 0) totalCOGS = Math.round(totalRevenue * 0.33);

    const grossProfit = totalRevenue - totalCOGS;

    let totalHOExpenses = rentExp + officeSuppliesExp + hoSalariesExp + accountingFeeExp + hoOtherExp;
    if (totalHOExpenses === 0 && totalRevenue > 0) totalHOExpenses = Math.round(totalRevenue * 0.11);

    let totalSalesExpenses = salesSalariesExp + salesCommExp + staffEntExp + custEntExp + scrubExp;
    if (totalSalesExpenses === 0 && totalRevenue > 0) totalSalesExpenses = Math.round(totalRevenue * 0.16);

    const totalExpenses = totalHOExpenses + totalSalesExpenses;
    const netEarnings = grossProfit - totalExpenses;

    const cogsRatio = totalRevenue > 0 ? (totalCOGS / totalRevenue) * 100 : 0;
    const grossMarginRatio = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const hoRatio = totalRevenue > 0 ? (totalHOExpenses / totalRevenue) * 100 : 0;
    const salesRatio = totalRevenue > 0 ? (totalSalesExpenses / totalRevenue) * 100 : 0;
    const netMarginRatio = totalRevenue > 0 ? (netEarnings / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      materialExp,
      transportExp,
      docRegExp,
      etcInsuranceExp,
      importTaxExp,
      totalCOGS,
      cogsRatio,
      grossProfit,
      grossMarginRatio,
      rentExp,
      officeSuppliesExp,
      hoSalariesExp,
      accountingFeeExp,
      hoOtherExp,
      totalHOExpenses,
      hoRatio,
      salesSalariesExp,
      salesCommExp,
      staffEntExp,
      custEntExp,
      scrubExp,
      totalSalesExpenses,
      salesRatio,
      totalExpenses,
      netEarnings,
      netMarginRatio
    };
  }, [filteredTransactions]);

  // Number Formatter Helper for Spreadsheet Matrix
  const fmtNum = (val) => {
    const n = Number(val) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Banner & Date Range Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner text-indigo-400">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FINANCIAL STATEMENTS ENGINE
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">งบกำไรขาดทุน P&L, Cash Flow & งบดุล (Monthly Financial Spreadsheet)</h2>
          </div>
        </div>

        {/* Date Range Picker & Year Selector Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <div className="flex items-center gap-1.5 mr-1 border-r border-slate-800 pr-2">
            <span className="font-extrabold text-amber-400">ปีที่เลือก:</span>
            {['2026', '2025', '2024', '2023', 'all'].map(yr => (
              <button
                key={yr}
                onClick={() => { setSelectedYear(yr); if (yr !== 'all') handleApplyYearlyPreset(Number(yr)); else handleClearDateRange(); }}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all text-xs ${
                  selectedYear === yr
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {yr === 'all' ? 'ทั้งหมด' : yr}
              </button>
            ))}
          </div>

          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>ช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPeriodPreset('custom'); }}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPeriodPreset('custom'); }}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={handleClearDateRange} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStatementTab('monthly_matrix')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border ${
            statementTab === 'monthly_matrix'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
          }`}
        >
          <span>📊 ตารางงบการเงิน 12 เดือนเต็ม (Monthly Spreadsheet Matrix)</span>
        </button>

        <button
          onClick={() => setStatementTab('p_l')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border ${
            statementTab === 'p_l'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
          }`}
        >
          <span>📑 สรุปงบกำไรขาดทุน P&L</span>
        </button>

        <button
          onClick={() => window.print()}
          className="ml-auto px-4 py-2 rounded-xl font-extrabold text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-2 transition-all print:hidden"
        >
          <span>🖨️</span>
          <span>พิมพ์ / บันทึก PDF รายงานงบ</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: MONTHLY 12-MONTH SPREADSHEET MATRIX (JAN-DEC + FULL YEAR) */}
      {/* ---------------------------------------------------- */}
      {statementTab === 'monthly_matrix' && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
          
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>📊 ตารางสรุปงบกำไรขาดทุน, Cash Flow & งบดุล รายเดือนปี {selectedYear}</span>
              </h3>
              <p className="text-xs text-slate-400">ตารางแสดงเปรียบเทียบ 12 เดือนเต็ม (January - December) และยอดรวมทั้งปี (Full Year)</p>
            </div>
            <div className="text-xs text-amber-300 font-mono font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
              12 Months Matrix Enabled
            </div>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-right text-[11px] font-mono border-collapse select-text">
              
              {/* Header Row */}
              <thead>
                <tr className="bg-[#0b1329] text-white font-sans text-xs border-b-2 border-slate-700">
                  <th className="p-2.5 text-left font-bold min-w-[240px] sticky left-0 bg-[#0b1329] z-10 border-r border-slate-800">
                    รายการบัญชี / เดือน
                  </th>
                  {monthlyMatrix.months.map(m => (
                    <th key={m.name} className="p-2.5 font-bold min-w-[100px] border-r border-slate-800/60 text-center">
                      {m.name}
                    </th>
                  ))}
                  <th className="p-2.5 font-black min-w-[120px] bg-[#111c38] text-amber-300 text-center border-l-2 border-slate-700">
                    Full Year
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/40">
                
                {/* 1. REVENUE SECTION */}
                <tr className="bg-slate-900/60 text-slate-300">
                  <td className="p-2 text-left font-sans font-medium sticky left-0 bg-slate-900/90 border-r border-slate-800">Returns, Refunds, Discounts</td>
                  {monthlyMatrix.months.map(m => (
                    <td key={m.name} className="p-2 border-r border-slate-800/40 text-slate-400">{fmtNum(m.returnsDiscounts)}</td>
                  ))}
                  <td className="p-2 font-bold bg-slate-900 text-slate-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.returnsDiscounts)}</td>
                </tr>

                <tr className="bg-[#102447] text-white font-bold border-y-2 border-blue-600/50">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#102447] border-r border-slate-800 text-blue-200">Total Net Revenue</td>
                  {monthlyMatrix.months.map(m => (
                    <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-blue-200">{fmtNum(m.totalNetRevenue)}</td>
                  ))}
                  <td className="p-2.5 font-black text-amber-300 bg-[#0d1c38] border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalNetRevenue)}</td>
                </tr>

                {/* 2. COGS SECTION (33%) */}
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Material Expense ค่าซื้อสินค้า</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.materialExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.materialExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Transportation Expense ค่าขนส่ง สินค้า</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.transportExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.transportExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Document Registration ค่า จด เอกสาร ต่างๆ</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.docRegExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.docRegExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">ETC, โต๊ะโค้ด & ค่าประกันของ</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.etcInsuranceExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.etcInsuranceExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Import Tax ภาษีนำเข้า</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.importTaxExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.importTaxExp)}</td>
                </tr>
                <tr className="bg-[#1e1b4b] text-indigo-200 font-bold border-y border-indigo-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#1e1b4b] border-r border-slate-800">Cost of Goods Sold 33%</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-rose-300">{fmtNum(m.cogsTotal)}</td>)}
                  <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.cogsTotal)}</td>
                </tr>

                {/* GROSS PROFIT */}
                <tr className="bg-[#064e3b] text-emerald-100 font-extrabold border-y-2 border-emerald-500/50">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#064e3b] border-r border-slate-800">Gross Profit</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-emerald-200">{fmtNum(m.grossProfit)}</td>)}
                  <td className="p-2.5 font-black text-emerald-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.grossProfit)}</td>
                </tr>

                {/* 3. EXPENSES H/O 11% */}
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Rent ค่าเช่า</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.rentExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.rentExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Office Supplies ค่าใช้จ่ายออฟฟิศ</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.officeSuppliesExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.officeSuppliesExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Transportation & Postal ค่าส่งของ และค่าเดินทางของ H/O</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.postalExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.postalExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Office Other Expense ค่าใช้จ่ายอื่นๆ ออฟฟิศ</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.officeOtherExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.officeOtherExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Salaries, Benefits & Wages H/O เงินเดือน พนักงาน H/O</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.hoSalariesExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.hoSalariesExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Accounting Fee ค่าทำบัญชี</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.accountingFeeExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.accountingFeeExp)}</td></tr>
                <tr className="bg-[#1e1b4b] text-indigo-200 font-bold border-y border-indigo-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#1e1b4b] border-r border-slate-800">Expenses H/O 11%</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-indigo-300">{fmtNum(m.hoTotal)}</td>)}
                  <td className="p-2.5 font-black text-indigo-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.hoTotal)}</td>
                </tr>

                {/* 4. SALES EXPENSES (16%) */}
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Salaries, Benefits & Wages Sales เงินเดือนเซลล์</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.salesSalariesExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.salesSalariesExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Incentive Commission ค่าคอมแซลส์</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.incentiveCommExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.incentiveCommExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Staff Entertainment เลี้ยงทีมเซลล์</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.staffEntExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.staffEntExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Customers Entertainment ค่ารับรองลูกค้า</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.custEntExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.custEntExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Scrub Expense ค่าเข้าเคส สครับ</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.scrubExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.scrubExp)}</td></tr>
                <tr className="bg-[#3b0764] text-purple-200 font-bold border-y border-purple-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#3b0764] border-r border-slate-800">Sales Expense 16%</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-purple-300">{fmtNum(m.salesTotal)}</td>)}
                  <td className="p-2.5 font-black text-purple-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.salesTotal)}</td>
                </tr>

                {/* 5. SUMMARY & NET EARNINGS */}
                <tr className="bg-[#4c0519] text-rose-200 font-bold border-y-2 border-rose-600/50">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#4c0519] border-r border-slate-800">Total Expenses</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-rose-300">{fmtNum(m.totalExpenses)}</td>)}
                  <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalExpenses)}</td>
                </tr>

                <tr className="bg-[#022c22] text-emerald-200 font-extrabold border-y border-emerald-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#022c22] border-r border-slate-800">Earnings Before Interest & Taxes</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40">{fmtNum(m.ebit)}</td>)}
                  <td className="p-2.5 font-black border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.ebit)}</td>
                </tr>

                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Interest Expense ดอกเบี้ย</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.interestExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.interestExp)}</td></tr>

                <tr className="bg-[#064e3b] text-emerald-100 font-black border-y-2 border-emerald-400">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#064e3b] border-r border-slate-800">Net Earnings</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-emerald-300">{fmtNum(m.netEarnings)}</td>)}
                  <td className="p-2.5 font-black text-amber-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.netEarnings)}</td>
                </tr>

                <tr className="bg-[#14532d] text-emerald-200 font-bold border-b-2 border-emerald-600">
                  <td className="p-2 text-left font-sans text-xs sticky left-0 bg-[#14532d] border-r border-slate-800">Cash flow</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40 text-emerald-300">{fmtNum(m.cashFlow)}</td>)}
                  <td className="p-2 font-black text-emerald-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.cashFlow)}</td>
                </tr>

                {/* 6. BALANCE SHEET SECTION */}
                <tr className="bg-[#1e3a8a] text-white font-extrabold text-xs uppercase tracking-wider">
                  <td colSpan="14" className="p-3 text-left bg-[#1e3a8a]">🏛️ Balance Sheet (งบดุล & สินทรัพย์ หนี้สิน)</td>
                </tr>

                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">Liability ลูกหนี้</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.accountsReceivable)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.accountsReceivable)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">Cash เงินสด ใบโบก วันสิ้นเดือน</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.cashBalance)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.cashBalance)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">Stock (สินค้าคงคลัง)</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.stockVal)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.stockVal)}</td></tr>
                
                <tr className="bg-[#064e3b] text-emerald-100 font-extrabold border-y-2 border-emerald-500">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#064e3b] border-r border-slate-800">สินทรัพย์ รวม (Total Assets)</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-emerald-300">{fmtNum(m.totalAssets)}</td>)}
                  <td className="p-2.5 font-black text-amber-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalAssets)}</td>
                </tr>

                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เจ้าหนี้ ค่าของคงค้าง</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.accountsPayable)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.accountsPayable)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินกู้ 1.5 Sme Bank</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.smeBank1)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.smeBank1)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินกู้ 2 Sme Bank</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.smeBank2)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.smeBank2)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินกู้ ญาติคุณ 2 ล้าน</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.relativeLoan)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.relativeLoan)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินทุนผู้ถือหุ้น</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.equityCapital)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.equityCapital)}</td></tr>
                
                <tr className="bg-[#4c0519] text-rose-200 font-bold border-t-2 border-rose-600">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#4c0519] border-r border-slate-800">หนี้สินรวม (Total Liabilities)</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-rose-300">{fmtNum(m.totalLiabilities)}</td>)}
                  <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalLiabilities)}</td>
                </tr>

                <tr className="bg-[#78350f] text-amber-100 font-black border-y-2 border-amber-400">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#78350f] border-r border-slate-800">หนี้สินรวม สม หนี้สิน (Total Equity & Liabilities)</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-amber-300">{fmtNum(m.totalEquityLiabilities)}</td>)}
                  <td className="p-2.5 font-black text-amber-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalEquityLiabilities)}</td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      // TAB 2: P&L EXECUTIVE SUMMARY
      {/* ---------------------------------------------------- */}
      {statementTab === 'p_l' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">💰 รายรับรวม (Total Revenue)</div>
              <div className="text-xl font-black font-mono text-emerald-400">
                {pnlBreakdown.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">100% สัดส่วนรายรับ</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">📦 ต้นทุนขาย COGS (33%)</div>
              <div className="text-xl font-black font-mono text-rose-400">
                {(pnlBreakdown?.totalCOGS || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">สัดส่วน: {(Number(pnlBreakdown?.cogsRatio) || 0).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">🏢 กำไรขั้นต้น Gross Profit</div>
              <div className="text-xl font-black font-mono text-indigo-300">
                {(pnlBreakdown?.grossProfit || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">Margin: {(Number(pnlBreakdown?.grossMarginRatio) || 0).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">💵 กำไรสุทธิ Net Profit Margin</div>
              <div className={`text-xl font-black font-mono ${(pnlBreakdown?.netEarnings || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(pnlBreakdown?.netEarnings || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">Net Margin: {(Number(pnlBreakdown?.netMarginRatio) || 0).toFixed(1)}%</div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm">
                📑 งบกำไรขาดทุน P&L สรุปผลการดำเนินงาน (Profit & Loss Statement)
              </h3>
              <span className="text-xs text-amber-300 font-mono font-bold">
                ปีที่เลือก: {selectedYear}
              </span>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30 font-bold">
                <span className="text-emerald-300">💰 1. รายรับจากยอดขายสินค้าเครื่องมือแพทย์ (Total Revenue)</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {(pnlBreakdown?.totalRevenue || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท (100%)
                </span>
              </div>

              <div className="space-y-1 pl-3 border-l-2 border-rose-500/40">
                <div className="flex justify-between font-bold text-slate-300 py-1">
                  <span>📦 2. ต้นทุนขาย COGS (Target 33%)</span>
                  <span className="font-mono text-rose-400">
                    -{(pnlBreakdown?.totalCOGS || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.cogsRatio) || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าซื้อสินค้า (Material Expense)</span>
                  <span className="font-mono">-{(pnlBreakdown?.materialExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าขนส่งสินค้า (Transportation Expense)</span>
                  <span className="font-mono">-{(pnlBreakdown?.transportExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าจดเอกสารต่างๆ / ภาษีนำเข้า</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.docRegExp || 0) + (pnlBreakdown?.importTaxExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-bold">
                <span className="text-white">🏢 กำไรขั้นต้น (Gross Profit)</span>
                <span className="font-mono text-indigo-300 text-sm">
                  {(pnlBreakdown?.grossProfit || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.grossMarginRatio) || 0).toFixed(1)}%)
                </span>
              </div>

              <div className="space-y-1 pl-3 border-l-2 border-indigo-500/40">
                <div className="flex justify-between font-bold text-slate-300 py-1">
                  <span>🏢 3. ค่าใช้จ่ายสำนักงานใหญ่ H/O (Target 11%)</span>
                  <span className="font-mono text-rose-400">
                    -{(pnlBreakdown?.totalHOExpenses || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.hoRatio) || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าเช่า Rent & ออฟฟิศ</span>
                  <span className="font-mono">-{( (pnlBreakdown?.rentExp || 0) + (pnlBreakdown?.officeSuppliesExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- เงินเดือน & สวัสดิการพนักงาน H/O</span>
                  <span className="font-mono">-{(pnlBreakdown?.hoSalariesExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าทำบัญชี & อื่นๆ</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.accountingFeeExp || 0) + (pnlBreakdown?.hoOtherExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
              </div>

              <div className="space-y-1 pl-3 border-l-2 border-amber-500/40">
                <div className="flex justify-between font-bold text-slate-300 py-1">
                  <span>💼 4. ค่าใช้จ่ายฝ่ายขาย Sales Expenses (Target 16%)</span>
                  <span className="font-mono text-rose-400">
                    -{(pnlBreakdown?.totalSalesExpenses || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.salesRatio) || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- เงินเดือนเซลล์ & คอมมิชชั่น</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.salesSalariesExp || 0) + (pnlBreakdown?.salesCommExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- เลี้ยงทีมเซลล์ & ค่ารับรองลูกค้า</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.staffEntExp || 0) + (pnlBreakdown?.custEntExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าเข้าเคสสครับ (Scrub Expense)</span>
                  <span className="font-mono">-{(pnlBreakdown?.scrubExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-950/60 to-slate-900 rounded-xl border border-emerald-500/40 font-black text-sm pt-3">
                <span className="text-emerald-300">🎉 5. กำไรสุทธิก่อนภาษี (Net Earnings / EBITDA)</span>
                <span className="font-mono text-emerald-400">
                  {(pnlBreakdown?.netEarnings || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.netMarginRatio) || 0).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/FreezeMonthModal.js ---
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


// --- Module File: js/modules/mod09_accounting/HospitalPayeeAnalyticsView.js ---
// MODULE: mod09_accounting/HospitalPayeeAnalyticsView.js

function HospitalPayeeAnalyticsView({ transactions = [] }) {
  const [subReport, setSubReport] = useState('profitability'); // profitability, hospital_rev, payee_disb, hospital_exp
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedPayee, setSelectedPayee] = useState('all');

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Range Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || t.status === '⏳ รอโอนเงิน') {
        return false;
      }
      if (t.date) {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
      }
      return true;
    });
  }, [transactions, startDate, endDate]);

  // List of unique hospitals & payees
  const hospitalList = useMemo(() => {
    const set = new Set();
    filteredTransactions.forEach(t => {
      if (t.hospital_name && t.hospital_name.trim()) set.add(t.hospital_name.trim());
    });
    return Array.from(set).sort();
  }, [filteredTransactions]);

  const payeeList = useMemo(() => {
    const set = new Set();
    filteredTransactions.forEach(t => {
      if (t.payee && t.payee.trim()) set.add(t.payee.trim());
    });
    return Array.from(set).sort();
  }, [filteredTransactions]);

  // 1. Profitability Summary by Hospital
  const hospitalProfitability = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(t => {
      const hName = t.hospital_name && t.hospital_name.trim() ? t.hospital_name.trim() : 'ไม่ระบุโรงพยาบาล';
      if (!map[hName]) {
        map[hName] = { revenue: 0, expenses: 0, netProfit: 0, txnCount: 0, lastDate: '' };
      }
      const netVal = Number(t.net_transfer) || 0;
      map[hName].txnCount++;
      if (t.date && (!map[hName].lastDate || t.date > map[hName].lastDate)) {
        map[hName].lastDate = t.date;
      }

      if (t.transaction_type === 'รายรับ') {
        map[hName].revenue += netVal;
        map[hName].netProfit += netVal;
      } else {
        map[hName].expenses += netVal;
        map[hName].netProfit -= netVal;
      }
    });

    return Object.keys(map).map(hName => {
      const data = map[hName];
      const margin = data.revenue > 0 ? (data.netProfit / data.revenue) * 100 : 0;
      return { hospital: hName, ...data, margin };
    }).sort((a, b) => b.netProfit - a.netProfit);
  }, [filteredTransactions]);

  // 2. Payee Disbursements Breakdown
  const payeeBreakdown = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(t => {
      if (t.transaction_type !== 'รายจ่าย') return;
      const pName = t.payee && t.payee.trim() ? t.payee.trim() : 'ไม่ระบุผู้รับเงิน';
      if (!map[pName]) {
        map[pName] = { payee: pName, totalAmount: 0, txnCount: 0, categories: {}, lastDate: '' };
      }
      const netVal = Number(t.net_transfer) || 0;
      map[pName].totalAmount += netVal;
      map[pName].txnCount++;
      if (t.date && (!map[pName].lastDate || t.date > map[pName].lastDate)) {
        map[pName].lastDate = t.date;
      }

      const cat = t.expense_type || 'ทั่วไป';
      map[pName].categories[cat] = (map[pName].categories[cat] || 0) + netVal;
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header & Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400">
            🏥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HOSPITAL & PAYEE DRILL-DOWN ANALYTICS
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">รายงานวิเคราะห์เจาะลึกรายโรงพยาบาล & บุคคลผู้รับเงิน</h2>
          </div>
        </div>

        {/* High-Contrast Vibrant Yellow Date Range Picker Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>ช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}
        </div>
      </div>

      {/* Sub Report Navigation */}
      <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setSubReport('profitability')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            subReport === 'profitability' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏆 สรุปกำไรสุทธิตามโรงพยาบาล (Hospital Profitability)
        </button>
        <button
          onClick={() => setSubReport('payee_disb')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            subReport === 'payee_disb' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          💸 สรุปการจ่ายเงินให้บุคคล/ผู้รับเงิน (Payee Disbursements)
        </button>
      </div>

      {/* Sub Report 1: Hospital Profitability Table */}
      {subReport === 'profitability' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm">
              🏥 สรุปรายรับ รายจ่าย และกำไรสุทธิ แยกรายโรงพยาบาล (Hospital Profitability Matrix)
            </h3>
            <span className="text-xs text-amber-300 font-mono font-bold">
              {hospitalProfitability.length} โรงพยาบาล
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">โรงพยาบาล / โครงการ</th>
                  <th className="p-3 text-right">รายรับรวม (วางบิล รพ.)</th>
                  <th className="p-3 text-right">รายจ่ายรวม (ต้นทุน+DF)</th>
                  <th className="p-3 text-right">กำไรสุทธิ (Net Profit)</th>
                  <th className="p-3 text-right">Net Margin %</th>
                  <th className="p-3 text-center">จำนวนรายการ</th>
                  <th className="p-3">ทำรายการล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {hospitalProfitability.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                      ไม่พบข้อมูลรายรับ-รายจ่ายของโรงพยาบาลในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  hospitalProfitability.map(h => (
                    <tr key={h.hospital} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span>🏥</span> <span>{h.hospital}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {h.revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        {h.expenses.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 text-right font-mono font-extrabold ${h.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {h.netProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 text-right font-mono font-bold ${h.margin >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                        {(Number(h?.margin) || 0).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center font-mono text-slate-400">{h.txnCount}</td>
                      <td className="p-3 font-mono text-slate-400">{h.lastDate || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Report 2: Payee Disbursements Breakdown */}
      {subReport === 'payee_disb' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm">
              💸 รายงานสรุปการจ่ายเงินออกให้บุคคล (Payee Disbursements Audit)
            </h3>
            <span className="text-xs text-purple-300 font-mono font-bold">
              {payeeBreakdown.length} บุคคล/ผู้รับเงิน
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ชื่อผู้รับเงิน / แพทย์ / เคสสครับ / บริษัท</th>
                  <th className="p-3 text-right">ยอดจ่ายเงินออกรวม (บาท)</th>
                  <th className="p-3">หมวดหมู่ค่าใช้จ่ายหลัก</th>
                  <th className="p-3 text-center">จำนวนครั้งที่โอน</th>
                  <th className="p-3">โอนล่าสุดเมื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payeeBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                      ไม่พบประวัติการโอนเงินออกในระบบช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  payeeBreakdown.map(p => (
                    <tr key={p.payee} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span>👤</span> <span>{p.payee}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-rose-400 text-sm">
                        {p.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(p.categories).map(cat => (
                            <span key={cat} className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10.5px]">
                              {cat}: {p.categories[cat].toLocaleString('th-TH')} บ.
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">{p.txnCount}</td>
                      <td className="p-3 font-mono text-slate-400">{p.lastDate || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/PendingTransfersView.js ---
// MODULE: mod09_accounting/PendingTransfersView.js

function PendingTransfersView({ transactions = [], currentUser, onSaveTxn, onDeleteTxn, onConfirmTransfer, onOwnerTransfer, onRejectTransfer, onRescheduleTransfer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [activeSlipModalTxn, setActiveSlipModalTxn] = useState(null);
  const [inputSlipUrl, setInputSlipUrl] = useState('');

  const [activeRejectModalTxn, setActiveRejectModalTxn] = useState(null);
  const [inputRejectReason, setInputRejectReason] = useState('');

  const [activeRescheduleModalTxn, setActiveRescheduleModalTxn] = useState(null);
  const [inputNewDate, setInputNewDate] = useState('');

  // Pending Drafts list
  const pendingDrafts = useMemo(() => {
    return transactions.filter(t => {
      const isDraft = t.is_pending_draft || t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]'));
      if (!isDraft) return false;

      if (selectedStatusFilter !== 'all' && t.status !== selectedStatusFilter) return false;
      if (selectedDateFilter !== 'all' && t.date !== selectedDateFilter) return false;

      // Date Range Picker Filter
      if (t.date) {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchPayee = (t.payee || '').toLowerCase().includes(q);
        const matchHospital = (t.hospital_name || '').toLowerCase().includes(q);
        const matchNotes = (t.notes || '').toLowerCase().includes(q);
        return matchTitle || matchPayee || matchHospital || matchNotes;
      }

      return true;
    });
  }, [transactions, selectedStatusFilter, selectedDateFilter, startDate, endDate, searchTerm]);

  // Unique Scheduled Dates list
  const scheduledDates = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if ((t.is_pending_draft || t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว') && t.date) {
        set.add(t.date);
      }
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Total pending transfer amount
  const totalPendingAmount = useMemo(() => {
    return pendingDrafts.reduce((sum, t) => sum + (Number(t.net_transfer) || Number(t.amount) || 0), 0);
  }, [pendingDrafts]);

  // Handle Dropdown Change - Flexible Workflow without blocking
  const handleStatusDropdownChange = (txn, targetStatus) => {
    if (targetStatus === '⏳ รอโอน') {
      onSaveTxn({ ...txn, status: '⏳ รอโอน', updated_at: new Date().toISOString() });
      return;
    }

    if (targetStatus === '💸 เจ้าของโอนแล้ว') {
      onOwnerTransfer({
        ...txn,
        status: '💸 เจ้าของโอนแล้ว',
        notes: (txn.notes || '').replace('[รอแนบสลิป/ยืนยัน]', '[เจ้าของโอนเงินแล้ว รอแอดมินแนบสลิป]'),
        updated_at: new Date().toISOString()
      });
      return;
    }

    // Step 3: Directly allowed at any time, slip attachment is optional
    if (targetStatus === '✅ ยืนยันและแนบสลิป โดยแอดมิน') {
      setActiveSlipModalTxn(txn);
      setInputSlipUrl(txn.attachment_url || '');
      return;
    }

    if (targetStatus === '❌ ปฏิเสธการโอน') {
      setActiveRejectModalTxn(txn);
      setInputRejectReason('');
      return;
    }

    if (targetStatus === '📅 เลื่อนวันโอนไปรอบต่อไป') {
      setActiveRescheduleModalTxn(txn);
      setInputNewDate(txn.date || new Date().toISOString().split('T')[0]);
      return;
    }
  };

  // Confirm Step 3 - Slip is completely optional
  const handleConfirmAdminSlip = () => {
    if (!activeSlipModalTxn) return;

    const updatedTxn = {
      ...activeSlipModalTxn,
      status: '✅ ยืนยันและแนบสลิป โดยแอดมิน',
      attachment_url: inputSlipUrl || activeSlipModalTxn.attachment_url || '',
      notes: (activeSlipModalTxn.notes || '').replace('[รอแนบสลิป/ยืนยัน]', '[โอนเงินเรียบร้อยแล้ว]'),
      updated_at: new Date().toISOString()
    };

    onConfirmTransfer(updatedTxn);
    setActiveSlipModalTxn(null);
    setInputSlipUrl('');
  };

  const handleOpenRejectModal = (txn) => {
    setActiveRejectModalTxn(txn);
    setInputRejectReason('');
  };

  const handleConfirmReject = () => {
    if (!activeRejectModalTxn) return;
    if (!inputRejectReason.trim()) {
      alert('กรุณาระบุเหตุผลที่ปฏิเสธการโอนเงิน');
      return;
    }

    const updatedTxn = {
      ...activeRejectModalTxn,
      status: '❌ ปฏิเสธการโอน',
      rejection_reason: inputRejectReason,
      notes: `[ปฏิเสธการโอน] เหตุผล: ${inputRejectReason}`,
      updated_at: new Date().toISOString()
    };

    onRejectTransfer(updatedTxn);
    setActiveRejectModalTxn(null);
    setInputRejectReason('');
  };

  const handleOpenRescheduleModal = (txn) => {
    setActiveRescheduleModalTxn(txn);
    setInputNewDate(txn.date || new Date().toISOString().split('T')[0]);
  };

  const handleConfirmReschedule = () => {
    if (!activeRescheduleModalTxn) return;
    if (!inputNewDate) {
      alert('กรุณาระบุวันที่โอนเงินใหม่');
      return;
    }

    const updatedTxn = {
      ...activeRescheduleModalTxn,
      date: inputNewDate,
      status: '📅 เลื่อนวันโอนไปรอบต่อไป',
      notes: `[เลื่อนวันโอนไปรอบต่อไป] เป็นวันที่ ${inputNewDate}`,
      updated_at: new Date().toISOString()
    };

    onRescheduleTransfer(updatedTxn);
    setActiveRescheduleModalTxn(null);
    setInputNewDate('');
  };

  // Status Badge Renderer helper
  const renderStatusBadge = (statusStr, reasonStr) => {
    switch (statusStr) {
      case '💸 เจ้าของโอนแล้ว':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold text-[11px] border border-purple-500/30 flex items-center gap-1 justify-center">
            <span>💸 เจ้าของโอนแล้ว</span>
          </span>
        );
      case '✅ ยืนยันและแนบสลิป โดยแอดมิน':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1 justify-center">
            <span>✅ ยืนยันโอนแล้ว</span>
          </span>
        );
      case '❌ ปฏิเสธการโอน':
        return (
          <span className="px-2 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-extrabold text-[11px] border border-rose-500/30 block max-w-[160px] truncate text-center" title={reasonStr ? `เหตุผล: ${reasonStr}` : ''}>
            ❌ ปฏิเสธการโอน {reasonStr ? `(${reasonStr})` : ''}
          </span>
        );
      case '📅 เลื่อนวันโอนไปรอบต่อไป':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/30 flex items-center gap-1 justify-center">
            <span>📅 เลื่อนวันโอนไปรอบต่อไป</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-[11px] border border-amber-500/30 flex items-center gap-1 justify-center">
            <span>⏳ รอโอน</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner text-amber-400">
            ⏳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PENDING DRAFT TRANSFERS (FLEXIBLE WORKFLOW)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">ตารางตั้งค่าใช้จ่ายค้างโอนประจำเดือน & อนุมัติการโอนเงิน (Dropdown เลือกสถานะอิสระ)</h2>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-right">
          <div className="text-[11px] text-slate-400 font-semibold">ยอดเงินค้างโอนรวมในมุมมองนี้</div>
          <div className="text-xl font-black font-mono text-amber-400">
            {totalPendingAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Date Range Picker */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2 flex-1">
          
          {/* High-Contrast Vibrant Yellow Date Range Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 rounded-xl p-1.5 shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span>ช่วงวันที่นัดโอน:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-lg p-1 outline-none text-xs"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-lg p-1 outline-none text-xs"
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white text-xs px-1">✕</button>
            )}
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="🔍 ค้นหารายการค้างโอน, ผู้รับเงิน, โรงพยาบาล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-3 text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
          >
            <option value="all">🚦 สถานะการโอนทั้งหมด ({pendingDrafts.length} รายการ)</option>
            <option value="⏳ รอโอน">⏳ 1. รอโอน</option>
            <option value="💸 เจ้าของโอนแล้ว">💸 2. เจ้าของโอนแล้ว</option>
            <option value="✅ ยืนยันและแนบสลิป โดยแอดมิน">✅ 3. ยืนยันโอนเรียบร้อย</option>
            <option value="❌ ปฏิเสธการโอน">❌ ปฏิเสธการโอน</option>
            <option value="📅 เลื่อนวันโอนไปรอบต่อไป">📅 เลื่อนวันโอนไปรอบต่อไป</option>
          </select>

          {/* Date Filter Dropdown */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none font-mono"
          >
            <option value="all">📅 ทุกวันที่นัดโอน</option>
            {scheduledDates.map(d => (
              <option key={d} value={d}>📅 {d}</option>
            ))}
          </select>
        </div>

      </div>

      {/* 14-Column Spreadsheet Grid Table matching DailyTransactionView Exactly */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <span>📋 ตารางรายการตั้งค้างโอนประจำเดือน (Spreadsheet Grid View)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-bold">
              {pendingDrafts.length} รายการ
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">วันที่นัดโอน</th>
                <th className="p-3">รายการค้างโอน</th>
                <th className="p-3">ประเภทค่าใช้จ่าย</th>
                <th className="p-3">บัญชีผู้โอน</th>
                <th className="p-3 text-right">ยอดเงิน</th>
                <th className="p-3 text-right">W/H</th>
                <th className="p-3 text-right">ประกันสังคม</th>
                <th className="p-3 text-right">ยอดโอนสุทธิ</th>
                <th className="p-3">หมายเหตุ</th>
                <th className="p-3">ผู้รับเงิน</th>
                <th className="p-3 text-center">ประเภท / สถานะโอน</th>
                <th className="p-3">โรงพยาบาล</th>
                <th className="p-3 text-center">สลิป/เอกสาร</th>
                <th className="p-3 text-right">จัดการสถานะ (Dropdown)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pendingDrafts.length === 0 ? (
                <tr>
                  <td colSpan="14" className="p-8 text-center text-slate-500 italic">
                    ไม่พบรายการตั้งค้างโอนที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                pendingDrafts.map(t => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-mono text-amber-300 font-bold whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white leading-snug">{t.title}</div>
                      {t.vat_eligible && <span className="inline-block text-[9.5px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 mt-0.5">VAT 7%</span>}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium text-[11px]">
                        {t.expense_type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-medium whitespace-nowrap">{t.account_type}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                      -{(t.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-indigo-300 whitespace-nowrap">
                      {t.withholding_tax > 0 ? (t.withholding_tax).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-indigo-300 whitespace-nowrap">
                      {t.social_security > 0 ? (t.social_security).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-amber-400 whitespace-nowrap">
                      {(t.net_transfer || t.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px] max-w-[150px] truncate" title={t.notes || ''}>
                      {t.notes || '-'}
                    </td>
                    <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">{t.payee || '-'}</td>
                    
                    {/* Status Badge Column */}
                    <td className="p-3 text-center">
                      {renderStatusBadge(t.status, t.rejection_reason)}
                    </td>

                    <td className="p-3 text-slate-300">{t.hospital_name || '-'}</td>
                    
                    {/* Slip Attachment Column */}
                    <td className="p-3 text-center">
                      {t.attachment_url ? (
                        <button
                          onClick={() => { setActiveSlipModalTxn(t); setInputSlipUrl(t.attachment_url); }}
                          className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-[10.5px] font-bold border border-indigo-500/40"
                        >
                          🖼️ ดูสลิป
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10.5px]">ไม่มี</span>
                      )}
                    </td>

                    {/* Interactive Status Select Dropdown in Table Row */}
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <select
                        value={t.status || '⏳ รอโอน'}
                        onChange={(e) => handleStatusDropdownChange(t, e.target.value)}
                        className={`bg-slate-950 border rounded-xl p-2 font-bold text-xs outline-none shadow-md ${
                          t.status === '💸 เจ้าของโอนแล้ว'
                            ? 'text-purple-300 border-purple-500/40'
                            : t.status === '✅ ยืนยันและแนบสลิป โดยแอดมิน'
                            ? 'text-emerald-300 border-emerald-500/40'
                            : t.status === '❌ ปฏิเสธการโอน'
                            ? 'text-rose-300 border-rose-500/40'
                            : 'text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <option value="⏳ รอโอน">⏳ 1. รอโอน</option>
                        <option value="💸 เจ้าของโอนแล้ว">💸 2. เจ้าของโอนแล้ว (ผู้บริหารกด)</option>
                        <option value="✅ ยืนยันและแนบสลิป โดยแอดมิน">✅ 3. ยืนยันและแนบสลิป (โดยแอดมิน)</option>
                        <option value="📅 เลื่อนวันโอนไปรอบต่อไป">📅 เลื่อนวันโอนไปรอบต่อไป</option>
                        <option value="❌ ปฏิเสธการโอน">❌ ปฏิเสธการโอน (ระบุเหตุผล)</option>
                      </select>

                      <button
                        onClick={() => onDeleteTxn(t.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-[11px] ml-1"
                        title="ลบรายการ"
                      >
                        🗑️
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Admin Confirm & Optional Slip Modal */}
      {activeSlipModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 max-w-lg w-full rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">📸 3. ยืนยันการโอนเงิน ({activeSlipModalTxn.title})</h4>
              <button onClick={() => setActiveSlipModalTxn(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold">แนบ URL รูปภาพสลิปโอนเงิน / เอกสารแนบ (ไม่จำเป็นต้องระบุ):</label>
              <input
                type="text"
                placeholder="เช่น https://images.unsplash.com/... หรือ ปล่อยว่างไว้ได้"
                value={inputSlipUrl}
                onChange={(e) => setInputSlipUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono outline-none"
              />
              <p className="text-[11px] text-emerald-300">
                เมื่อกดปุ่มยืนยัน สถานะจะเปลี่ยนเป็น <strong>`✅ ยืนยันและแนบสลิป โดยแอดมิน`</strong> และจะย้ายไปแสดงผลในตารางรายจ่ายประจำวันหลัก + คำนวณ P&L ทันที!
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveSlipModalTxn(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleConfirmAdminSlip}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                ✅ ยืนยันและย้ายเข้าตารางรายวัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Reject Reason Modal */}
      {activeRejectModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 max-w-lg w-full rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-rose-300 text-sm">❌ ปฏิเสธการโอนเงิน ({activeRejectModalTxn.title})</h4>
              <button onClick={() => setActiveRejectModalTxn(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold">เหตุผลที่ปฏิเสธการโอนเงิน <span className="text-rose-400">*</span>:</label>
              <textarea
                rows="3"
                required
                placeholder="ระบุเหตุผล เช่น ข้อมูลเอกสารไม่ถูกต้อง, ยอดเงินไม่ตรงกับใบแจ้งหนี้..."
                value={inputRejectReason}
                onChange={(e) => setInputRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-rose-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveRejectModalTxn(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                ❌ ยืนยันปฏิเสธการโอน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reschedule Date Modal */}
      {activeRescheduleModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 max-w-lg w-full rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-indigo-300 text-sm">📅 เลื่อนวันโอนไปรอบต่อไป ({activeRescheduleModalTxn.title})</h4>
              <button onClick={() => setActiveRescheduleModalTxn(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold">เลือกวันที่โอนเงินใหม่ <span className="text-rose-400">*</span>:</label>
              <input
                type="date"
                required
                value={inputNewDate}
                onChange={(e) => setInputNewDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 font-mono font-bold outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveRescheduleModalTxn(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleConfirmReschedule}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                📅 บันทึกเลื่อนวันโอน
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/PettyCashModal.js ---
// MODULE: mod09_accounting/PettyCashModal.js

function PettyCashModal({ isOpen, onClose, onSave }) {
  const [pettyAccounts, setPettyAccounts] = useState([]);
  const [newEmpName, setNewEmpName] = useState('');
  const [newLimit, setNewLimit] = useState(20000);

  // Initial Load from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('aeron_petty_cash_accounts');
        if (saved) {
          setPettyAccounts(JSON.parse(saved));
        } else {
          setPettyAccounts([
            { id: 'pc-1', empName: 'คุณตู้', limit: 20000, name: 'เงินสดสำรองจ่าย - คุณตู้ (Petty Cash)' },
            { id: 'pc-2', empName: 'คุณแบงค์', limit: 15000, name: 'เงินสดสำรองจ่าย - คุณแบงค์ (Petty Cash)' }
          ]);
        }
      } catch (e) {
        setPettyAccounts([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddPettyAccount = (e) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const empClean = newEmpName.trim();
    const newAcc = {
      id: 'pc-' + Date.now(),
      empName: empClean,
      limit: Number(newLimit) || 0,
      name: `เงินสดสำรองจ่าย - ${empClean} (Petty Cash)`
    };

    const updated = [...pettyAccounts, newAcc];
    setPettyAccounts(updated);
    setNewEmpName('');
    setNewLimit(20000);
  };

  const handleDeletePettyAccount = (id) => {
    if (confirm('คุณต้องการลบบัญชีเงินสดสำรองจ่ายนี้หรือไม่?')) {
      const updated = pettyAccounts.filter(a => a.id !== id);
      setPettyAccounts(updated);
    }
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem('aeron_petty_cash_accounts', JSON.stringify(pettyAccounts));
      if (onSave) onSave(pettyAccounts);
      onClose();
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30">
              💵
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">ตั้งค่าบัญชีเงินสดสำรองจ่ายรายบุคคล (Petty Cash)</h3>
              <p className="text-xs text-slate-400">สำหรับ Head Admin เพิ่ม/จัดการวงเงินสำรองจ่ายประจำตัวพนักงาน</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">✕</button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Add New Petty Cash Account Form */}
          <form onSubmit={handleAddPettyAccount} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>➕ เพิ่มบัญชีเงินสดสำรองจ่ายใหม่</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อพนักงานผู้ถือเงินสำรองจ่าย *</label>
                <input
                  type="text"
                  placeholder="เช่น คุณตู้, คุณแบงค์, คุณหมิว"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">วงเงิน/ยอดตั้งสำรอง (บาท)</label>
                <input
                  type="number"
                  placeholder="20000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <span>➕ บันทึกเพิ่มบัญชีเงินสดสำรองจ่าย</span>
            </button>
          </form>

          {/* List of Active Petty Cash Accounts */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-slate-300 flex items-center justify-between">
              <span>📋 รายการบัญชีเงินสดสำรองจ่ายที่มีในระบบ ({pettyAccounts.length} บัญชี)</span>
            </div>

            {pettyAccounts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800">
                ยังไม่มีการตั้งค่าบัญชีเงินสดสำรองจ่าย
              </div>
            ) : (
              <div className="space-y-2">
                {pettyAccounts.map((acc) => (
                  <div key={acc.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center text-sm font-bold border border-amber-500/20">
                        👤
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-xs">{acc.name}</div>
                        <div className="text-[11px] text-slate-400">
                          พนักงาน: <span className="text-amber-300 font-bold">{acc.empName}</span> | วงเงินตั้งสำรอง: <span className="font-mono text-emerald-400 font-bold">{Number(acc.limit || 0).toLocaleString()} บาท</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePettyAccount(acc.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs transition-colors"
                      title="ลบบัญชีนี้"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20"
          >
            💾 บันทึกการเปลี่ยนแปลงทั้งหมด
          </button>
        </div>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/RecurringPaymentsModal.js ---
// MODULE: mod09_accounting/RecurringPaymentsModal.js

function RecurringPaymentsModal({ templates = [], onSaveTemplate, onDeleteTemplate, onGenerateDrafts, onClose }) {
  const [newTitle, setNewTitle] = useState('');
  const [newExpenseType, setNewExpenseType] = useState('ค่าเช่า');
  const [newAccountType, setNewAccountType] = useState('บริษัท KBANK');
  const [newAmount, setNewAmount] = useState(0);
  const [newWht, setNewWht] = useState(0);
  const [newPayee, setNewPayee] = useState('');
  const [newDueDay, setNewDueDay] = useState(28);

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('กรุณาระบุชื่อรายการประจำ');
      return;
    }

    const tData = {
      id: `REC-${Date.now()}`,
      title: newTitle,
      expense_type: newExpenseType,
      account_type: newAccountType,
      amount: Number(newAmount) || 0,
      withholding_tax: Number(newWht) || 0,
      payee: newPayee,
      due_day_of_month: Number(newDueDay) || 28,
      is_active: true
    };

    onSaveTemplate(tData);
    setNewTitle('');
    setNewAmount(0);
    setNewWht(0);
    setNewPayee('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner">
              🔄
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">ระบบตั้งค่าและจ่ายเงินประจำเดือน (Monthly Recurring Payments)</h3>
              <p className="text-xs text-slate-400">กำหนดรายการจ่ายประจำ และสร้างรายการร่าง (Drafts) อัตโนมัติทุกต้นเดือน</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Generate Drafts Action Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 rounded-2xl border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white text-sm">⚡ สร้างรายการร่างประจำเดือนใหม่ (Auto Draft Generator)</div>
            <div className="text-slate-300 text-[11px] mt-0.5">
              สร้างรายการจ่ายประจำประจำเดือนปัจจุบันเข้าสู่ตาราง Daily Log อัตโนมัติ เพื่อรอแอดมินแนบสลิปและยืนยัน
            </div>
          </div>
          <button
            onClick={onGenerateDrafts}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <span>⚡ สั่งสร้าง Draft ประจำเดือน</span>
          </button>
        </div>

        {/* Existing Templates Table */}
        <div className="space-y-2 overflow-y-auto max-h-[35vh]">
          <h4 className="font-bold text-slate-200 text-xs flex items-center justify-between">
            <span>📋 รายการจ่ายประจำทั้งหมด ({templates.length} รายการ)</span>
          </h4>

          <div className="space-y-1.5 text-xs">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic bg-slate-950/40 rounded-xl">
                ยังไม่มีรายการจ่ายประจำในระบบ
              </div>
            ) : (
              templates.map(t => (
                <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-indigo-300 rounded font-mono">{t.expense_type}</span>
                      <span>🏦 {t.account_type}</span>
                      <span>👤 ผู้รับ: {t.payee || '-'}</span>
                      <span className="text-slate-500">📅 ทุกวันที่ {t.due_day_of_month}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <div className="font-extrabold text-rose-400">-{Number(t.amount).toLocaleString()} บ.</div>
                      {t.withholding_tax > 0 && (
                        <div className="text-[10px] text-indigo-300">WHT: {t.withholding_tax} บ.</div>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteTemplate(t.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-[11px]"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add New Template Form */}
        <form onSubmit={handleAddTemplate} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="font-bold text-amber-300 text-xs">➕ เพิ่มรายการจ่ายประจำใหม่</div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">ชื่อรายการประจำ *</label>
              <input
                type="text"
                required
                placeholder="เช่น ค่าเช่าออฟฟิศ, ค่าทำบัญชี..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">หมวดหมู่ค่าใช้จ่าย</label>
              <select
                value={newExpenseType}
                onChange={(e) => setNewExpenseType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
              >
                <option value="ค่าเช่า">ค่าเช่า</option>
                <option value="ค่าทำบัญชี">ค่าทำบัญชี</option>
                <option value="ค่าใช้จ่ายออฟฟิศ">ค่าใช้จ่ายออฟฟิศ</option>
                <option value="เงินเดือนเซลล์">เงินเดือนเซลล์</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">จำนวนเงิน (บาท) *</label>
              <input
                type="number"
                required
                min="0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">ผู้รับเงิน (Payee)</label>
              <input
                type="text"
                placeholder="เช่น อาคารออฟฟิศ..."
                value={newPayee}
                onChange={(e) => setNewPayee(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">กำหนดจ่ายทุกวันที่</label>
              <input
                type="number"
                min="1"
                max="31"
                value={newDueDay}
                onChange={(e) => setNewDueDay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              + เพิ่มรายการจ่ายประจำ
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}


// --- Module File: js/modules/mod09_accounting/TransactionModal.js ---
// MODULE: mod09_accounting/TransactionModal.js

function TransactionModal({ editingTxn, frozenMonths = [], onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (editingTxn) return { ...editingTxn };
    return {
      id: `TXN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`,
      date: new Date().toISOString().split('T')[0],
      title: '',
      expense_type: 'ค่าใช้จ่ายทั่วไป',
      account_type: 'บริษัท KBANK',
      amount: 0,
      withholding_tax: 0,
      social_security: 0,
      loan_for_employee: 0,
      net_transfer: 0,
      payee: '',
      transaction_type: 'รายจ่าย',
      off_book_expense: false,
      hospital_name: '',
      notes: '',
      vat_eligible: false,
      tax_deductible: true,
      pnd_submitted: false,
      attachment_url: '',
      is_recurring_generated: false,
      created_by: 'USR-ADMIN',
      updated_at: new Date().toISOString()
    };
  });

  // Auto-calculate net_transfer when amounts or taxes change
  useEffect(() => {
    const amt = Number(formData.amount) || 0;
    const wht = Number(formData.withholding_tax) || 0;
    const soc = Number(formData.social_security) || 0;
    const loan = Number(formData.loan_for_employee) || 0;
    
    // For income (รายรับ): Net = amount - withholding_tax
    // For expense (รายจ่าย): Net = amount - withholding_tax - social_security - loan_for_employee
    const computedNet = formData.transaction_type === 'รายรับ'
      ? Math.max(0, amt - wht)
      : Math.max(0, amt - wht - soc - loan);

    setFormData(prev => ({ ...prev, net_transfer: computedNet }));
  }, [formData.amount, formData.withholding_tax, formData.social_security, formData.loan_for_employee, formData.transaction_type]);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  // Auto WHT Calculator Preset
  const handleApplyTaxRate = (ratePercent) => {
    const amt = Number(formData.amount) || 0;
    const calculatedTax = (amt * ratePercent) / 100;
    setFormData(prev => ({ ...prev, withholding_tax: Math.round(calculatedTax * 100) / 100 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('กรุณาระบุชื่อรายการ / รายละเอียด');
      return;
    }

    // Freeze Month Guard
    const monthKey = (formData.date || '').substring(0, 7);
    if (frozenMonths.includes(monthKey)) {
      alert(`⛔ ไม่สามารถบันทึกรายการได้: เดือน ${monthKey} ถูกปิดงบแล้ว (Frozen Month)`);
      return;
    }

    onSave({ ...formData, updated_at: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
              formData.transaction_type === 'รายรับ' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-rose-500/20 border border-rose-500/30'
            }`}>
              {formData.transaction_type === 'รายรับ' ? '💰' : '💸'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                {editingTxn ? '✏️ แก้ไขรายการบัญชีรายวัน' : '📝 บันทึกรายการรายรับ-รายจ่ายใหม่'}
              </h3>
              <p className="text-xs text-slate-400">ระบบบันทึกธุรกรรมการเงินและภาษีตามมาตรฐาน AERON MEDICAL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทธุรกรรม <span className="text-rose-400">*</span></label>
              <select
                value={formData.transaction_type}
                onChange={(e) => handleChange('transaction_type', e.target.value)}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-extrabold outline-none focus:border-indigo-500 ${
                  formData.transaction_type === 'รายรับ' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <option value="รายจ่าย">💸 รายจ่าย (Expense)</option>
                <option value="รายรับ">💰 รายรับ (Income / Revenue)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ทำรายการ <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-mono outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่อรายการ / คำอธิบาย <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น เงินเดือนปจด. 6/69 พงศธร, ค่าคอมมิชชั่นเซลล์, ค่าเคสสครับ, ค่า DF..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทค่าใช้จ่ายทั้งหมด (Dropdown) <span className="text-rose-400">*</span></label>
              <select
                value={formData.expense_type}
                onChange={(e) => handleChange('expense_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 font-bold outline-none focus:border-indigo-500"
              >
                <optgroup label="📦 ต้นทุนขาย (COGS 33%)">
                  <option value="ค่าซื้อสินค้า Material Expense">ค่าซื้อสินค้า Material Expense</option>
                  <option value="ค่าขนส่งสินค้า Transportation Expense">ค่าขนส่งสินค้า Transportation Expense</option>
                  <option value="ค่าจดเอกสารต่างๆ Document Registration">ค่าจดเอกสารต่างๆ Document Registration</option>
                  <option value="ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง">ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง</option>
                  <option value="ภาษีนำเข้า Import Tax">ภาษีนำเข้า Import Tax</option>
                </optgroup>

                <optgroup label="🏢 ค่าใช้จ่ายสำนักงานใหญ่ (Expenses H/O 11%)">
                  <option value="ค่าเช่า Rent">ค่าเช่า Rent</option>
                  <option value="ค่าใช้จ่ายออฟฟิศ Office Supplies">ค่าใช้จ่ายออฟฟิศ Office Supplies</option>
                  <option value="ค่าส่งของ และค่าเดินทางของ H/O Transportation & Postal">ค่าส่งของ และค่าเดินทางของ H/O Transportation & Postal</option>
                  <option value="ค่าใช้จ่ายอื่นๆ ออฟฟิศ Office Other Expense">ค่าใช้จ่ายอื่นๆ ออฟฟิศ Office Other Expense</option>
                  <option value="เงินเดือน พนักงาน H/O Salaries, Benefits & Wages">เงินเดือน พนักงาน H/O Salaries, Benefits & Wages</option>
                  <option value="ค่าเอกสาร และ อื่นๆ Document&ETC">ค่าเอกสาร และ อื่นๆ Document&ETC</option>
                  <option value="ค่าเทรนนิ่งพนักงาน Training">ค่าเทรนนิ่งพนักงาน Training</option>
                  <option value="ค่าทำบัญชี Accounting Fee">ค่าทำบัญชี Accounting Fee</option>
                </optgroup>

                <optgroup label="💼 ค่าใช้จ่ายฝ่ายขาย (Sales Expenses 16%)">
                  <option value="เงินเดือนเซลล์ Salaries, Benefits & Wages">เงินเดือนเซลล์ Salaries, Benefits & Wages</option>
                  <option value="ค่าใช้จ่ายเซลล์ Staff Expense">ค่าใช้จ่ายเซลล์ Staff Expense</option>
                  <option value="ค่าคอมเซลล์ Commission">ค่าคอมเซลล์ Commission</option>
                  <option value="เลี้ยงทีมเซลล์ Staff Entertainment">เลี้ยงทีมเซลล์ Staff Entertainment</option>
                  <option value="ค่ารับรองลูกค้า Customers Entertainment">ค่ารับรองลูกค้า Customers Entertainment</option>
                  <option value="ค่าใช้จ่ายอื่นๆ เซลล์ Sales Other Expense">ค่าใช้จ่ายอื่นๆ เซลล์ Sales Other Expense</option>
                  <option value="ค่าเข้าเคส สครับ Scrub Expense">ค่าเข้าเคส สครับ Scrub Expense</option>
                </optgroup>

                <optgroup label="💵 ดอกเบี้ย & ภาษี (Financial & Tax)">
                  <option value="ดอกเบี้ย Interest Expense">ดอกเบี้ย Interest Expense</option>
                  <option value="ภาษี Vat 7% Vat 7%">ภาษี Vat 7% Vat 7%</option>
                  <option value="ภาษีรายได้บริษัท Income Taxes">ภาษีรายได้บริษัท Income Taxes</option>
                </optgroup>

                <optgroup label="💰 รายได้ (Income)">
                  <option value="รายได้จากการขายเครื่องมือแพทย์ & บริการ">รายได้จากการขายเครื่องมือแพทย์ & บริการ</option>
                </optgroup>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ช่องทาง/บัญชีชำระเงิน <span className="text-rose-400">*</span></label>
              <select
                value={formData.account_type}
                onChange={(e) => handleChange('account_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-medium outline-none focus:border-indigo-500"
              >
                {(window.getCompanyAccounts ? window.getCompanyAccounts() : ['Aeron Kbank ออมทรัพย์', 'Aeron Kbank กระแสรายวัน', 'Aeron Kbank ฝากประจำ', 'Aeron SCB ออมทรัพย์', 'Aeron SCB กระแสรายวัน']).map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amounts & Deductions Grid */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🧮 คำนวณยอดเงินและภาษีหัก ณ ที่จ่าย</span>
                <span className="text-[10px] text-slate-400 font-normal">(Auto Tax W/H Preset)</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
                <input
                  type="checkbox"
                  checked={formData.off_book_expense}
                  onChange={(e) => handleChange('off_book_expense', e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>รายการนอกระบบ (Off-book)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">จำนวนเงินรวม (บาท)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono font-bold text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ภาษีหัก ณ ที่จ่าย</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyTaxRate(3)}
                      className="px-1.5 py-0.2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded text-[9.5px] font-bold border border-indigo-500/40"
                    >
                      3%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTaxRate(5)}
                      className="px-1.5 py-0.2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-[9.5px] font-bold border border-purple-500/40"
                    >
                      5%
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.withholding_tax}
                  onChange={(e) => handleChange('withholding_tax', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-rose-300 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">ประกันสังคม (ถ้ามี)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.social_security}
                  onChange={(e) => handleChange('social_security', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-indigo-300 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">หักยืม/เงินกู้พนักงาน</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.loan_for_employee}
                  onChange={(e) => handleChange('loan_for_employee', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-amber-300 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">💵 ยอดโอนสุทธิ (Net Transfer):</span>
              <span className="text-base font-black font-mono text-emerald-400">
                {formData.net_transfer.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </span>
            </div>
          </div>

          {/* Tax Flags & Attachment URL */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300">🏷️ สถานะทางภาษี & สลิปเอกสาร</div>
            <div className="flex flex-wrap gap-4 text-[11.5px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.vat_eligible}
                  onChange={(e) => handleChange('vat_eligible', e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>มีใบกำกับภาษี (VAT 7%)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.tax_deductible}
                  onChange={(e) => handleChange('tax_deductible', e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>ลงเป็นค่าใช้จ่ายบริษัทได้</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.pnd_submitted}
                  onChange={(e) => handleChange('pnd_submitted', e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span>ยื่น ภ.ง.ด.3/53 แล้ว</span>
              </label>
            </div>

            <div className="pt-2">
              <label className="text-[11px] text-slate-400">URL แนบสลิป / ใบเสร็จเอกสาร (Digital Attachment):</label>
              <input
                type="text"
                placeholder="เช่น https://images.unsplash.com/... หรือ /uploads/slips/slip_01.jpg"
                value={formData.attachment_url}
                onChange={(e) => handleChange('attachment_url', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none font-mono text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้รับเงิน / ผู้จ่ายเงิน (Payee) <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น พงศธร, อาจารย์รัตนา..."
                value={formData.payee}
                onChange={(e) => handleChange('payee', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / โครงการที่เกี่ยวข้อง</label>
              <input
                type="text"
                placeholder="เช่น คณะแพทย์ศาสตร์ มหิดล, รพ.รามาธิบดี..."
                value={formData.hospital_name}
                onChange={(e) => handleChange('hospital_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / อ้างอิงเลขที่สลิป</label>
            <input
              type="text"
              placeholder="เช่น KBANK T26-2-39079-5, เลขที่ใบเสร็จ RE-2026-042..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-indigo-500 font-mono"
            />
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
              <span>💾 บันทึกรายการ</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// --- Module File: js/modules/mod10_reports/CentralReportsHubView.js ---
// MODULE: mod10_reports/CentralReportsHubView.js
// Dedicated Central Reports Hub Module View

function CentralReportsHubView({
  appState = {},
  onOpenReport = () => {}
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportingId, setExportingId] = useState(null);

  const categories = [
    { id: 'all', label: 'ทั้งหมด (All Reports)', icon: '📚' },
    { id: 'sales', label: 'งานขาย & โครงการ', icon: '💼' },
    { id: 'finance', label: 'การเงิน & ต้นทุน', icon: '🧮' },
    { id: 'logistics', label: 'นำเข้า & ทรัพย์สิน', icon: '🚢' },
    { id: 'demo', label: 'เครื่องสาธิต Demo', icon: '🧪' },
    { id: 'accounting', label: 'บัญชี & งบการเงิน', icon: '🧾' },
    { id: 'regulatory', label: 'อย. & เอกสาร', icon: '🛡️' },
    { id: 'hr', label: 'บุคลากร HR', icon: '👥' }
  ];

  const allReports = useMemo(() => {
    return Object.values(window.REPORT_REGISTRY || {});
  }, []);

  const filteredReports = useMemo(() => {
    return allReports.filter(r => {
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const matchSearch = !searchTerm.trim() || 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.module.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allReports, selectedCategory, searchTerm]);

  const handleQuickExport = (reportDef) => {
    setExportingId(reportDef.id);
    setTimeout(() => {
      try {
        const data = reportDef.transform(appState);
        ExcelExportEngine.exportToExcel(
          `AERON_${reportDef.id}`,
          reportDef.columns,
          data.rows,
          {
            reportTitle: `${reportDef.title} (${reportDef.module})`
          }
        );
      } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการส่งออก: ' + e.message);
      }
      setExportingId(null);
    }, 150);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <span>📊</span>
              <span>ENTERPRISE REPORTING ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ศูนย์รวมรายงานสารสนเทศเพื่อการบริหาร (Unified Reports Hub)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              ดึงข้อมูล Real-time ครอบคลุมทั้ง 9 โมดูลหลักของ AERON MEDICAL พร้อมแสดงผล KPI เชิงลึก และส่งออกเป็นไฟล์ Excel / CSV ได้ในคลิกเดียว
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] text-slate-500 font-bold block">รายงานพร้อมใช้งาน</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{allReports.length}</span>
              <span className="text-[10px] text-slate-500 ml-1">รายงาน</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const count = cat.id === 'all' ? allReports.length : allReports.filter(r => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหารายงาน..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* 3. Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => {
          const isThisExporting = exportingId === report.id;
          return (
            <div
              key={report.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 space-y-4 shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {report.icon || '📊'}
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {report.module}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-white text-sm group-hover:text-indigo-300 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {report.description}
                  </p>
                </div>

                {/* Column Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {report.columns.slice(0, 3).map((col, cIdx) => (
                    <span key={cIdx} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
                      {col.label}
                    </span>
                  ))}
                  {report.columns.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                      +{report.columns.length - 3} คอลัมน์
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenReport(report.id)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <span>👁️</span>
                  <span>เปิดดูรายงาน</span>
                </button>

                <button
                  onClick={() => handleQuickExport(report)}
                  disabled={isThisExporting}
                  className="w-full py-2.5 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  title="ดาวน์โหลดไฟล์ Excel ทันที"
                >
                  <span>{isThisExporting ? '⏳' : '📥'}</span>
                  <span>{isThisExporting ? 'กำลังสร้าง...' : 'Export Excel'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

window.CentralReportsHubView = CentralReportsHubView;


// --- Module File: js/modules/mod10_reports/ExcelExportEngine.js ---
// MODULE: mod10_reports/ExcelExportEngine.js
// Universal UTF-8 BOM Excel & CSV Exporter Engine

const ExcelExportEngine = {
  /**
   * Export structured data to Excel-compatible CSV with UTF-8 BOM
   * @param {string} fileName - File name without extension
   * @param {Array<{key: string, label: string, format?: string}>} columns - Column definitions
   * @param {Array<Object>} rows - Data rows
   * @param {Object} [options] - Additional metadata and summary rows
   */
  exportToExcel(fileName, columns, rows, options = {}) {
    try {
      if (!rows || rows.length === 0) {
        alert('⚠️ ไม่พบข้อมูลสำหรับส่งออกรายงาน');
        return false;
      }

      const dateStamp = new Date().toISOString().split('T')[0];
      const fullFileName = `${fileName || 'AERON_Report'}_${dateStamp}.csv`;

      // 1. Prepare Header Lines
      let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel Thai font support

      // Optional Title Block
      if (options.reportTitle) {
        csvContent += `"${options.reportTitle.replace(/"/g, '""')}"\n`;
        csvContent += `"บริษัท เอออน เมดิคอล จำกัด (AERON MEDICAL CO., LTD.)"\n`;
        csvContent += `"วันที่ออกรายงาน: ${new Date().toLocaleString('th-TH')}"\n\n`;
      }

      // Column Headers
      const headerLabels = columns.map(col => `"${(col.label || col.key || '').replace(/"/g, '""')}"`);
      csvContent += headerLabels.join(',') + '\n';

      // 2. Data Rows
      rows.forEach(row => {
        const rowCells = columns.map(col => {
          let val = row[col.key];

          if (val === undefined || val === null) {
            val = '';
          } else if (col.format === 'currency') {
            val = typeof val === 'number' ? val.toFixed(2) : String(val).replace(/[^0-9.-]/g, '');
          } else if (col.format === 'percent') {
            val = typeof val === 'number' ? `${val.toFixed(2)}%` : String(val);
          } else if (col.format === 'number') {
            val = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]/g, '')) || 0;
          } else {
            val = String(val).trim();
          }

          // Escape double quotes
          return `"${String(val).replace(/"/g, '""')}"`;
        });

        csvContent += rowCells.join(',') + '\n';
      });

      // 3. Summary Footer Row (if provided)
      if (options.summaryRow) {
        csvContent += '\n';
        const summaryCells = columns.map(col => {
          const sumVal = options.summaryRow[col.key];
          if (sumVal === undefined || sumVal === null) return '""';
          return `"${String(sumVal).replace(/"/g, '""')}"`;
        });
        csvContent += summaryCells.join(',') + '\n';
      }

      // 4. Trigger Instant Browser Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fullFileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('Excel Export Error:', err);
      alert('❌ เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel: ' + err.message);
      return false;
    }
  }
};

window.ExcelExportEngine = ExcelExportEngine;


// --- Module File: js/modules/mod10_reports/ReportRegistry.js ---
// MODULE: mod10_reports/ReportRegistry.js
// Central Registry of all Enterprise Reports across 9 Modules

const REPORT_REGISTRY = {

  // ==========================================
  // 💼 MODULE 03: SALES & KANBAN
  // ==========================================

  'sales_pipeline_funnel': {
    id: 'sales_pipeline_funnel',
    title: '📊 รายงาน Sales Pipeline & Funnel Analysis',
    module: 'Sales & Projects',
    category: 'sales',
    icon: '📊',
    description: 'วิเคราะห์มูลค่างานและอัตราการแปลงสถานะในแต่ละขั้นของ Pipeline การขาย',
    columns: [
      { key: 'hospitalName', label: 'โรงพยาบาล / หน่วยงาน' },
      { key: 'title', label: 'ชื่อโครงการ / สินค้า' },
      { key: 'salesPerson', label: 'เซลส์ผู้ดูแล' },
      { key: 'statusLabel', label: 'สถานะ Stage ปัจจุบัน' },
      { key: 'budget', label: 'งบประมาณ (บาท)', format: 'currency' },
      { key: 'winProbability', label: 'โอกาสชนะ (%)', format: 'percent' },
      { key: 'weightedBudget', label: 'มูลค่าคาดการณ์ (Weighted ฿)', format: 'currency' },
      { key: 'daysInCurrentStage', label: 'อยู่ในขั้นนี้ (วัน)', format: 'number' },
      { key: 'updatedAt', label: 'อัปเดตล่าสุด' }
    ],
    transform: (appState) => {
      const projects = appState.projects || [];
      const stageMap = {
        'stage_prospect': '1. สืบราคา / ร่างงบ',
        'stage_spec': '2. ทำสเปก / ทดสอบ',
        'stage_demo': '3. นำเครื่องเข้าสาธิต',
        'stage_bidding': '4. ประกาศ e-Bidding',
        'stage_won': '5. ชนะงาน / รอสัญญา',
        'stage_ordering': '6. สั่งซื้อสินค้า PO',
        'stage_delivery': '7. ส่งมอบ & เทรนนิ่ง',
        'stage_complete': '8. ปิดงานสมบูรณ์',
        'stage_lost': '❌ แพ้งาน'
      };

      const rows = projects.map(p => {
        const prob = p.status === 'stage_won' || p.status === 'stage_ordering' || p.status === 'stage_delivery' || p.status === 'stage_complete' ? 100 :
                     p.status === 'stage_lost' ? 0 :
                     p.status === 'stage_bidding' ? 70 :
                     p.status === 'stage_demo' ? 50 :
                     p.status === 'stage_spec' ? 30 : 15;
        const b = Number(p.budget) || 0;
        return {
          hospitalName: p.hospitalName || '-',
          title: p.title || '-',
          salesPerson: p.salesPerson || '-',
          statusLabel: stageMap[p.status] || p.status || '-',
          budget: b,
          winProbability: prob,
          weightedBudget: Math.round(b * (prob / 100)),
          daysInCurrentStage: p.daysInCurrentStage || 1,
          updatedAt: p.updatedAt ? p.updatedAt.split('T')[0] : '-'
        };
      });

      const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
      const totalWeighted = rows.reduce((s, r) => s + r.weightedBudget, 0);
      const wonCount = rows.filter(r => r.winProbability === 100).length;

      return {
        rows,
        kpis: [
          { label: 'มูลค่า Pipeline รวม', value: formatCurrency(totalBudget), color: 'emerald' },
          { label: 'มูลค่าคาดการณ์ (Weighted)', value: formatCurrency(totalWeighted), color: 'indigo' },
          { label: 'โครงการทั้งหมด', value: `${rows.length} โครงการ`, color: 'sky' },
          { label: 'ชนะงานแล้ว', value: `${wonCount} โครงการ`, color: 'amber' }
        ]
      };
    }
  },

  'sales_rep_performance': {
    id: 'sales_rep_performance',
    title: '👤 รายงานประสิทธิภาพงานขายรายบุคคล (Sales Leaderboard)',
    module: 'Sales & Projects',
    category: 'sales',
    icon: '🏆',
    description: 'สรุปยอดขายจริง อัตราการปิดการขาย (Win Rate %) และงานที่ดูแลของเซลส์แต่ละท่าน',
    columns: [
      { key: 'rank', label: 'อันดับ' },
      { key: 'salesPerson', label: 'ชื่อพนักงานขาย' },
      { key: 'totalProjects', label: 'จำนวนโครงการรวม', format: 'number' },
      { key: 'wonProjects', label: 'ชนะงาน (ดีล)', format: 'number' },
      { key: 'winRate', label: 'Win Rate (%)', format: 'percent' },
      { key: 'wonRevenue', label: 'ยอดขายที่ปิดได้ (บาท)', format: 'currency' },
      { key: 'pipelineValue', label: 'งานที่อยู่ระหว่างลุ้น (บาท)', format: 'currency' },
      { key: 'missingCostSheet', label: 'งานที่ยังไม่ลง Cost Sheet', format: 'number' }
    ],
    transform: (appState) => {
      const projects = appState.projects || [];
      const costCalcs = appState.costCalculations || [];
      const members = appState.members || [];

      const repMap = {};

      members.forEach(m => {
        repMap[m.name] = {
          name: m.name,
          total: 0,
          won: 0,
          wonRev: 0,
          pipeRev: 0,
          missingCost: 0
        };
      });

      projects.forEach(p => {
        const repName = p.salesPerson || 'ไม่ระบุ';
        if (!repMap[repName]) {
          repMap[repName] = { name: repName, total: 0, won: 0, wonRev: 0, pipeRev: 0, missingCost: 0 };
        }
        repMap[repName].total += 1;
        const b = Number(p.budget) || 0;
        const isWon = ['stage_won', 'stage_ordering', 'stage_delivery', 'stage_complete'].includes(p.status);
        if (isWon) {
          repMap[repName].won += 1;
          repMap[repName].wonRev += b;
        } else if (p.status !== 'stage_lost') {
          repMap[repName].pipeRev += b;
        }

        const hasCost = costCalcs.some(c => c.projectId === p.id || (c.projectName && p.hospitalName && c.projectName.includes(p.hospitalName)));
        if (!hasCost) {
          repMap[repName].missingCost += 1;
        }
      });

      const list = Object.values(repMap).sort((a, b) => b.wonRev - a.wonRev);
      const rows = list.map((r, idx) => ({
        rank: idx + 1,
        salesPerson: r.name,
        totalProjects: r.total,
        wonProjects: r.won,
        winRate: r.total > 0 ? (r.won / r.total) * 100 : 0,
        wonRevenue: r.wonRev,
        pipelineValue: r.pipeRev,
        missingCostSheet: r.missingCost
      }));

      const grandWon = rows.reduce((s, r) => s + r.wonRevenue, 0);
      const grandPipe = rows.reduce((s, r) => s + r.pipelineValue, 0);

      return {
        rows,
        kpis: [
          { label: 'ยอดขายชนะรวมทั้งหมด', value: formatCurrency(grandWon), color: 'emerald' },
          { label: 'มูลค่าที่กำลังติดตาม', value: formatCurrency(grandPipe), color: 'indigo' },
          { label: 'จำนวนพนักงานขาย', value: `${rows.length} ท่าน`, color: 'sky' }
        ]
      };
    }
  },

  'hospital_penetration': {
    id: 'hospital_penetration',
    title: '🏥 รายงานวิเคราะห์การเจาะตลาดโรงพยาบาล (Hospital Penetration)',
    module: 'Clients & Directory',
    category: 'sales',
    icon: '🏥',
    description: 'ยอดขายและจำนวนโครงการสะสมรายโรงพยาบาล สัดส่วนสังกัด และจังหวัด',
    columns: [
      { key: 'hospitalName', label: 'ชื่อโรงพยาบาล' },
      { key: 'projectCount', label: 'จำนวนโครงการ', format: 'number' },
      { key: 'totalBudget', label: 'งบประมาณรวม (บาท)', format: 'currency' },
      { key: 'wonAmount', label: 'ยอดขายที่ปิดสำเร็จ (บาท)', format: 'currency' },
      { key: 'salesReps', label: 'เซลส์ที่ดูแล' },
      { key: 'productsList', label: 'สินค้า/เครื่องมือแพทย์ที่เสนอ' }
    ],
    transform: (appState) => {
      const projects = appState.projects || [];
      const hospMap = {};

      projects.forEach(p => {
        const hName = p.hospitalName || 'ไม่ระบุโรงพยาบาล';
        if (!hospMap[hName]) {
          hospMap[hName] = { name: hName, count: 0, budget: 0, won: 0, reps: new Set(), prods: new Set() };
        }
        hospMap[hName].count += 1;
        const b = Number(p.budget) || 0;
        hospMap[hName].budget += b;
        if (['stage_won', 'stage_ordering', 'stage_delivery', 'stage_complete'].includes(p.status)) {
          hospMap[hName].won += b;
        }
        if (p.salesPerson) hospMap[hName].reps.add(p.salesPerson);
        if (p.title) hospMap[hName].prods.add(p.title);
      });

      const rows = Object.values(hospMap).sort((a, b) => b.budget - a.budget).map(h => ({
        hospitalName: h.name,
        projectCount: h.count,
        totalBudget: h.budget,
        wonAmount: h.won,
        salesReps: Array.from(h.reps).join(', ') || '-',
        productsList: Array.from(h.prods).join(', ') || '-'
      }));

      return {
        rows,
        kpis: [
          { label: 'จำนวนโรงพยาบาลที่มีดีล', value: `${rows.length} แห่ง`, color: 'indigo' },
          { label: 'งบประมาณรวมทุก รพ.', value: formatCurrency(rows.reduce((s, r) => s + r.totalBudget, 0)), color: 'emerald' },
          { label: 'ยอดขายที่ปิดได้รวม', value: formatCurrency(rows.reduce((s, r) => s + r.wonAmount, 0)), color: 'sky' }
        ]
      };
    }
  },

  // ==========================================
  // 🧮 MODULE 07: FINANCE & COST SHEET
  // ==========================================

  'cost_margin_sheet': {
    id: 'cost_margin_sheet',
    title: '📑 รายงานสรุปกำไรสุทธิและโครงสร้างต้นทุน (Project Margin & Profit)',
    module: 'Finance & Cost',
    category: 'finance',
    icon: '🧮',
    description: 'แจกแจงโครงสร้างราคาขาย In/Ex VAT, ต้นทุน, ค่า DF, คอมมิชชั่น, ดอกเบี้ย, ภาษี 20% และกำไรสุทธิต่อโครงการ',
    columns: [
      { key: 'projectName', label: 'โครงการ / โรงพยาบาล' },
      { key: 'sellingPriceInVat', label: 'ราคาขาย In VAT (บาท)', format: 'currency' },
      { key: 'costInVat', label: 'ต้นทุน In VAT (บาท)', format: 'currency' },
      { key: 'dfAmount', label: 'ค่า DF (บาท)', format: 'currency' },
      { key: 'salesCommAmount', label: 'ค่าคอมเซลส์ (บาท)', format: 'currency' },
      { key: 'interestAmount', label: 'ดอกเบี้ยเงินกู้ (บาท)', format: 'currency' },
      { key: 'taxAmount', label: 'ภาษี 20% (บาท)', format: 'currency' },
      { key: 'netProfit', label: 'กำไรสุทธิ (Net Profit ฿)', format: 'currency' },
      { key: 'netProfitPercent', label: 'อัตรากำไรสุทธิ (%)', format: 'percent' },
      { key: 'date', label: 'วันที่จัดทำ' }
    ],
    transform: (appState) => {
      const projects = appState.projects || [];
      const costCalcs = appState.costCalculations || [];

      const rows = projects.map(proj => {
        let calc = costCalcs.find(c => c.projectId === proj.id || (c.projectName && proj.hospitalName && c.projectName.includes(proj.hospitalName)));
        if (!calc) {
          calc = {
            projectName: `${proj.hospitalName || ''} - ${proj.title || ''}`,
            sellingPriceInVat: proj.budget || 0,
            costInVat: Math.round((proj.budget || 0) * 0.7),
            dfType: 'amount',
            dfValue: proj.dfAmount ? Number(String(proj.dfAmount).replace(/[^0-9.]/g, '')) || 0 : 0,
            salesCommPercent: 2.0,
            interestPercent: 7.0,
            taxPercent: 20.0,
            retentionPercent: 5.0,
            date: proj.updatedAt ? proj.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0]
          };
        }

        const computed = computeCostSheet(calc);
        return {
          projectName: calc.projectName || `${proj.hospitalName} - ${proj.title}`,
          sellingPriceInVat: Number(calc.sellingPriceInVat) || 0,
          costInVat: Number(calc.costInVat) || 0,
          dfAmount: computed.dfAmount,
          salesCommAmount: computed.salesCommAmount,
          interestAmount: computed.interestAmount,
          taxAmount: computed.taxAmount,
          netProfit: computed.netProfit,
          netProfitPercent: computed.netProfitPercent,
          date: calc.date || '-'
        };
      });

      const totalRevenue = rows.reduce((s, r) => s + r.sellingPriceInVat, 0);
      const totalCost = rows.reduce((s, r) => s + r.costInVat, 0);
      const totalNetProfit = rows.reduce((s, r) => s + r.netProfit, 0);
      const avgMargin = totalRevenue > 0 ? (totalNetProfit / (totalRevenue / 1.07)) * 100 : 0;

      return {
        rows,
        kpis: [
          { label: 'มูลค่างานขายรวม (In VAT)', value: formatCurrency(totalRevenue), color: 'emerald' },
          { label: 'ต้นทุนสินค้ารวม (In VAT)', value: formatCurrency(totalCost), color: 'rose' },
          { label: 'กำไรสุทธิรวม (Net Profit)', value: formatCurrency(totalNetProfit), color: 'indigo' },
          { label: 'อัตรากำไรสุทธิเฉลี่ย', value: `${avgMargin.toFixed(2)}%`, color: 'amber' }
        ]
      };
    }
  },

  'po_vendor_commitment': {
    id: 'po_vendor_commitment',
    title: '🛒 รายงานสรุปยอดจัดซื้อและภาระผูกพัน Vendor (Purchase Orders)',
    module: 'Finance & Procurement',
    category: 'finance',
    icon: '🛒',
    description: 'สรุปการสั่งซื้อเครื่องมือแพทย์แยกตามผู้ผลิต (Vendor), ยอดชำระแล้ว และยอดรอชำระ',
    columns: [
      { key: 'poNumber', label: 'เลขที่ PO' },
      { key: 'vendorName', label: 'ผู้ผลิต / Vendor' },
      { key: 'productName', label: 'สินค้า / เครื่องมือแพทย์' },
      { key: 'quantity', label: 'จำนวน', format: 'number' },
      { key: 'totalAmount', label: 'ยอดสั่งซื้อ (บาท)', format: 'currency' },
      { key: 'status', label: 'สถานะการสั่ง' },
      { key: 'paymentStatus', label: 'สถานะการจ่ายเงิน' },
      { key: 'deliveryDate', label: 'กำหนดส่งมอบ' }
    ],
    transform: (appState) => {
      const pos = appState.purchaseOrders || [];
      const rows = pos.map(p => ({
        poNumber: p.poNumber || '-',
        vendorName: p.vendorName || '-',
        productName: p.productName || '-',
        quantity: p.quantity || 1,
        totalAmount: Number(p.totalAmount) || 0,
        status: p.status || 'รออนุมัติ',
        paymentStatus: p.paymentStatus || 'รอชำระเงิน',
        deliveryDate: p.deliveryDate || '-'
      }));

      const totalPO = rows.reduce((s, r) => s + r.totalAmount, 0);
      const paidPO = rows.filter(r => r.paymentStatus === 'ชำระแล้ว').reduce((s, r) => s + r.totalAmount, 0);
      const pendingPO = totalPO - paidPO;

      return {
        rows,
        kpis: [
          { label: 'ยอดจัดซื้อรวมทั้งหมด', value: formatCurrency(totalPO), color: 'indigo' },
          { label: 'ชำระเงินแล้ว', value: formatCurrency(paidPO), color: 'emerald' },
          { label: 'ยอดรอชำระ (Pending)', value: formatCurrency(pendingPO), color: 'rose' },
          { label: 'จำนวนใบสั่งซื้อ', value: `${rows.length} ฉบับ`, color: 'sky' }
        ]
      };
    }
  },

  // ==========================================
  // 🚢 MODULE 04: IMPORT LOGISTICS & ASSETS
  // ==========================================

  'shipment_aging_payment': {
    id: 'shipment_aging_payment',
    title: '🚢 รายงานติดตามสถานะนำเข้าและอายุการจ่ายเงิน (Shipment Aging & ETA)',
    module: 'Import Logistics',
    category: 'logistics',
    icon: '🚢',
    description: 'ติดตามวันที่จ่ายเงิน (นับวันผ่านมาแล้วกี่วัน), ค่าระวาง CBM, ภาษีนำเข้า และสถานะด่านศุลกากร',
    columns: [
      { key: 'shipmentNumber', label: 'เลขที่ชิปปิ้ง' },
      { key: 'poNumber', label: 'PO อ้างอิง' },
      { key: 'productName', label: 'สินค้าที่สั่ง' },
      { key: 'vendorName', label: 'บริษัทผู้ผลิต' },
      { key: 'paymentDate', label: 'วันที่จ่ายเงิน' },
      { key: 'daysElapsed', label: 'ผ่านมาแล้ว (วัน)', format: 'number' },
      { key: 'cbm', label: 'ปริมาตร CBM', format: 'number' },
      { key: 'shippingCost', label: 'ค่าขนส่ง (บาท)', format: 'currency' },
      { key: 'dutyTaxes', label: 'ภาษีศุลกากร (บาท)', format: 'currency' },
      { key: 'status', label: 'สถานะนำเข้า' },
      { key: 'eta', label: 'กำหนดถึงไทย (ETA)' }
    ],
    transform: (appState) => {
      const shipments = appState.shipments || [];
      const today = new Date();
      today.setHours(0,0,0,0);

      const rows = shipments.map(s => {
        let diff = '-';
        if (s.paymentDate) {
          const pDate = new Date(s.paymentDate);
          pDate.setHours(0,0,0,0);
          diff = Math.floor((today - pDate) / 86400000);
        }
        return {
          shipmentNumber: s.shipmentNumber || '-',
          poNumber: s.poNumber || '-',
          productName: s.productName || '-',
          vendorName: s.vendorName || '-',
          paymentDate: s.paymentDate || 'ยังไม่ระบุ',
          daysElapsed: diff,
          cbm: Number(s.cbm) || 0,
          shippingCost: Number(s.shippingCost) || 0,
          dutyTaxes: Number(s.dutyTaxes) || 0,
          status: s.status || '-',
          eta: s.eta || '-'
        };
      });

      const totalFreight = rows.reduce((s, r) => s + r.shippingCost, 0);
      const totalDuty = rows.reduce((s, r) => s + r.dutyTaxes, 0);
      const totalCbm = rows.reduce((s, r) => s + r.cbm, 0);

      return {
        rows,
        kpis: [
          { label: 'ค่าขนส่งชิปปิ้งรวม', value: formatCurrency(totalFreight), color: 'emerald' },
          { label: 'ภาษีนำเข้ารวม', value: formatCurrency(totalDuty), color: 'amber' },
          { label: 'ปริมาตรรวม (CBM)', value: `${totalCbm.toFixed(1)} CBM`, color: 'indigo' },
          { label: 'รายการชิปปิ้ง', value: `${rows.length} รายการ`, color: 'sky' }
        ]
      };
    }
  },

  'warranty_expiry_matrix': {
    id: 'warranty_expiry_matrix',
    title: '🛡️ รายงานสัญญาประกันและเครื่องใกล้หมดประกัน (Warranty Expiry & MA Alert)',
    module: 'Service & Asset Registry',
    category: 'logistics',
    icon: '🛡️',
    description: 'ตรวจสอบเครื่องที่ขายไปตาม รพ. ต่างๆ ที่ประกันใกล้หมดล่วงหน้า 30-90 วัน เพื่อให้เซลส์เสนอขายสัญญาบริการ MA',
    columns: [
      { key: 'hospitalName', label: 'โรงพยาบาล' },
      { key: 'productName', label: 'รุ่นเครื่องมือแพทย์' },
      { key: 'serialNumber', label: 'Serial No.' },
      { key: 'deliveryDate', label: 'วันที่ส่งมอบ' },
      { key: 'warrantyExpiry', label: 'วันหมดประกัน' },
      { key: 'daysLeft', label: 'คงเหลือ (วัน)', format: 'number' },
      { key: 'warrantyStatus', label: 'สถานะประกัน' },
      { key: 'salesRep', label: 'เซลส์ผู้ดูแล' }
    ],
    transform: (appState) => {
      const sold = appState.soldProducts || [];
      const today = new Date();
      today.setHours(0,0,0,0);

      const rows = sold.map(item => {
        let daysLeft = 0;
        let status = 'อยู่ในประกัน';
        if (item.warrantyExpiry) {
          const exp = new Date(item.warrantyExpiry);
          exp.setHours(0,0,0,0);
          daysLeft = Math.ceil((exp - today) / 86400000);
          if (daysLeft < 0) status = '🔴 หมดประกันแล้ว';
          else if (daysLeft <= 60) status = '🟡 ใกล้หมดประกัน (<60 วัน)';
          else status = '🟢 อยู่ในประกัน';
        }
        return {
          hospitalName: item.hospitalName || '-',
          productName: item.productName || '-',
          serialNumber: item.serialNumber || '-',
          deliveryDate: item.deliveryDate || '-',
          warrantyExpiry: item.warrantyExpiry || '-',
          daysLeft: daysLeft,
          warrantyStatus: status,
          salesRep: item.salesRep || '-'
        };
      });

      const expiringSoon = rows.filter(r => r.daysLeft >= 0 && r.daysLeft <= 60).length;
      const expired = rows.filter(r => r.daysLeft < 0).length;

      return {
        rows,
        kpis: [
          { label: 'เครื่องที่ขายทั้งหมด', value: `${rows.length} เครื่อง`, color: 'indigo' },
          { label: 'ใกล้หมดประกัน (<60 วัน)', value: `${expiringSoon} เครื่อง`, color: 'amber' },
          { label: 'หมดประกันแล้ว (เสนอ MA)', value: `${expired} เครื่อง`, color: 'rose' }
        ]
      };
    }
  },

  'repair_service_stats': {
    id: 'repair_service_stats',
    title: '🔧 รายงานสถิติงานซ่อมบำรุงและเวลาบริการ (Repair & Turnaround Time)',
    module: 'Service & Maintenance',
    category: 'logistics',
    icon: '🔧',
    description: 'สรุปคิวงานซ่อมของลูกค้า อาการเสีย ช่างผู้รับผิดชอบ และระยะเวลาเฉลี่ย (MTTR)',
    columns: [
      { key: 'ticketNumber', label: 'เลขที่ใบซ่อม' },
      { key: 'hospitalName', label: 'โรงพยาบาล' },
      { key: 'productName', label: 'รุ่นเครื่อง' },
      { key: 'serialNumber', label: 'Serial No.' },
      { key: 'issueDescription', label: 'อาการเสีย' },
      { key: 'technician', label: 'ช่างผู้รับผิดชอบ' },
      { key: 'repairCost', label: 'ค่าซ่อม/อะไหล่ (บาท)', format: 'currency' },
      { key: 'status', label: 'สถานะงานซ่อม' },
      { key: 'receivedDate', label: 'วันที่รับเครื่อง' }
    ],
    transform: (appState) => {
      const tickets = appState.repairTickets || [];
      const rows = tickets.map(t => ({
        ticketNumber: t.ticketNumber || t.id || '-',
        hospitalName: t.hospitalName || '-',
        productName: t.productName || '-',
        serialNumber: t.serialNumber || '-',
        issueDescription: t.issueDescription || '-',
        technician: t.technician || '-',
        repairCost: Number(t.repairCost) || 0,
        status: t.status || 'รอซ่อม',
        receivedDate: t.receivedDate || '-'
      }));

      const totalRepairCost = rows.reduce((s, r) => s + r.repairCost, 0);
      const activeRepairs = rows.filter(r => r.status !== 'ส่งคืนลูกค้าแล้ว').length;

      return {
        rows,
        kpis: [
          { label: 'งานซ่อมทั้งหมด', value: `${rows.length} เคส`, color: 'sky' },
          { label: 'อยู่ระหว่างดำเนินการ', value: `${activeRepairs} เคส`, color: 'amber' },
          { label: 'ค่าใช้จ่ายซ่อมรวม', value: formatCurrency(totalRepairCost), color: 'rose' }
        ]
      };
    }
  },

  // ==========================================
  // 🧪 MODULE 05: DEMO MACHINE ANALYTICS
  // ==========================================

  'demo_journey_log': {
    id: 'demo_journey_log',
    title: '🗺️ รายงานประวัติการเดินทางของเครื่องสาธิต (Machine Journey Log)',
    module: 'Demo Calendar',
    category: 'demo',
    icon: '🧪',
    description: 'ติดตามประวัติเครื่องเดโม่แต่ละตัว: ไป รพ. ใด วางไว้กี่วัน เซลส์ผู้ดูแล ค่าใช้จ่าย และผลลัพธ์',
    columns: [
      { key: 'productName', label: 'รุ่นเครื่องมือแพทย์' },
      { key: 'serialNumber', label: 'Serial No.' },
      { key: 'hospitalName', label: 'โรงพยาบาล' },
      { key: 'salesPerson', label: 'เซลส์ผู้ดูแล' },
      { key: 'startDate', label: 'วันเริ่มเดโม่' },
      { key: 'endDate', label: 'วันสิ้นสุด' },
      { key: 'daysDeployed', label: 'จำนวนวันที่วาง (วัน)', format: 'number' },
      { key: 'expenseAmount', label: 'ค่าใช้จ่ายเดโม่ (บาท)', format: 'currency' },
      { key: 'outcomeStatus', label: 'ผลลัพธ์การเดโม่' }
    ],
    transform: (appState) => {
      const bookings = appState.demoBookings || [];
      const rows = bookings.map(b => {
        let days = 0;
        if (b.startDate && b.endDate) {
          const s = new Date(b.startDate);
          const e = new Date(b.endDate);
          days = Math.max(1, Math.round((e - s) / 86400000) + 1);
        }
        return {
          productName: b.productName || '-',
          serialNumber: b.serialNumber || 'S/N-DEMO',
          hospitalName: b.hospitalName || '-',
          salesPerson: b.salesPerson || '-',
          startDate: b.startDate || '-',
          endDate: b.endDate || '-',
          daysDeployed: days,
          expenseAmount: Number(b.expenseAmount) || 0,
          outcomeStatus: b.outcomeStatus || 'กำลังทดสอบ / รอผล'
        };
      });

      const totalExp = rows.reduce((s, r) => s + r.expenseAmount, 0);
      const wonCount = rows.filter(r => r.outcomeStatus && r.outcomeStatus.includes('ชนะ')).length;
      const winRate = rows.length > 0 ? (wonCount / rows.length) * 100 : 0;

      return {
        rows,
        kpis: [
          { label: 'การนำเครื่องไปเดโม่รวม', value: `${rows.length} ครั้ง`, color: 'sky' },
          { label: 'อัตรา Win Rate หลังเดโม่', value: `${winRate.toFixed(1)}%`, color: 'emerald' },
          { label: 'ค่าใช้จ่ายเดโม่รวม', value: formatCurrency(totalExp), color: 'amber' }
        ]
      };
    }
  },

  // ==========================================
  // 🧾 MODULE 09: ACCOUNTING & FINANCIALS
  // ==========================================

  'pnl_statement': {
    id: 'pnl_statement',
    title: '📈 รายงานงบกำไรขาดทุนมาตรฐานสากล (Statement of Profit & Loss)',
    module: 'Accounting & Finance',
    category: 'accounting',
    icon: '📈',
    description: 'สรุปรายได้จากการขาย หัก ต้นทุนขาย ค่าใช้จ่ายดำเนินงาน ค่าคอมมิชชั่น เงินเดือน และภาษี',
    columns: [
      { key: 'accountCategory', label: 'หมวดหมู่บัญชี' },
      { key: 'accountName', label: 'รายการบัญชี' },
      { key: 'amount', label: 'จำนวนเงิน (บาท)', format: 'currency' },
      { key: 'percentOfRevenue', label: '% เทียบรายได้รวม', format: 'percent' },
      { key: 'type', label: 'ประเภท (รายรับ / รายจ่าย)' }
    ],
    transform: (appState) => {
      const transactions = appState.accountingTransactions || [];
      const costCalcs = appState.costCalculations || [];
      const projects = appState.projects || [];

      // Calculate Total Revenue from won projects or transactions
      let salesRev = projects.filter(p => ['stage_won', 'stage_ordering', 'stage_delivery', 'stage_complete'].includes(p.status))
                             .reduce((s, p) => s + (Number(p.budget) || 0) / 1.07, 0);
      if (salesRev === 0) salesRev = 15000000; // fallback sample if empty

      const cogs = salesRev * 0.70;
      const grossProfit = salesRev - cogs;
      const sgaExpense = salesRev * 0.12;
      const salesCommission = salesRev * 0.02;
      const ebit = grossProfit - sgaExpense - salesCommission;
      const tax20 = Math.max(0, ebit * 0.20);
      const netProfit = ebit - tax20;

      const rows = [
        { accountCategory: '1. รายได้', accountName: 'รายได้จากการขายเครื่องมือแพทย์ (Sales Ex VAT)', amount: salesRev, percentOfRevenue: 100, type: 'รายรับ' },
        { accountCategory: '2. ต้นทุนขาย', accountName: 'ต้นทุนสินค้าและอุปกรณ์นำเข้า (COGS Ex VAT)', amount: cogs, percentOfRevenue: (cogs / salesRev) * 100, type: 'ต้นทุน' },
        { accountCategory: '3. กำไรขั้นต้น', accountName: 'กำไรขั้นต้น (Gross Profit)', amount: grossProfit, percentOfRevenue: (grossProfit / salesRev) * 100, type: 'กำไร' },
        { accountCategory: '4. ค่าใช้จ่ายดำเนินงาน', accountName: 'ค่าใช้จ่ายในการขายและบริหาร (SG&A)', amount: sgaExpense, percentOfRevenue: (sgaExpense / salesRev) * 100, type: 'รายจ่าย' },
        { accountCategory: '4. ค่าใช้จ่ายดำเนินงาน', accountName: 'ค่าคอมมิชชั่นพนักงานขาย (2%)', amount: salesCommission, percentOfRevenue: (salesCommission / salesRev) * 100, type: 'รายจ่าย' },
        { accountCategory: '5. กำไรก่อนภาษี', accountName: 'กำไรจากการดำเนินงาน (EBIT)', amount: ebit, percentOfRevenue: (ebit / salesRev) * 100, type: 'กำไร' },
        { accountCategory: '6. ภาษีเงินได้', accountName: 'ภาษีเงินได้นิติบุคคล (20%)', amount: tax20, percentOfRevenue: (tax20 / salesRev) * 100, type: 'รายจ่าย' },
        { accountCategory: '7. กำไรสุทธิ', accountName: 'กำไรสุทธิส่วนของผู้ถือหุ้น (Net Profit)', amount: netProfit, percentOfRevenue: (netProfit / salesRev) * 100, type: 'กำไรสุทธิ' }
      ];

      return {
        rows,
        kpis: [
          { label: 'รายได้รวม (Ex VAT)', value: formatCurrency(salesRev), color: 'emerald' },
          { label: 'กำไรขั้นต้น (Gross Profit)', value: formatCurrency(grossProfit), color: 'indigo' },
          { label: 'กำไรสุทธิ (Net Profit)', value: formatCurrency(netProfit), color: 'sky' },
          { label: 'Net Margin %', value: `${((netProfit / salesRev) * 100).toFixed(2)}%`, color: 'amber' }
        ]
      };
    }
  },

  'daily_cash_flow': {
    id: 'daily_cash_flow',
    title: '💵 รายงานกระแสเงินสดและสมุดรายวันรับ-จ่าย (Daily Transactions Ledger)',
    module: 'Accounting & Cash Flow',
    category: 'accounting',
    icon: '💵',
    description: 'บันทึกรายการโอนเงินรับเข้าและจ่ายออกรายวัน แยกตามบัญชีธนาคารและเงินสดย่อย',
    columns: [
      { key: 'date', label: 'วันที่ทำรายการ' },
      { key: 'description', label: 'คำอธิบายรายการ' },
      { key: 'category', label: 'หมวดหมู่บัญชี' },
      { key: 'account', label: 'บัญชีธนาคาร / เงินสด' },
      { key: 'income', label: 'รับเข้า (บาท)', format: 'currency' },
      { key: 'expense', label: 'จ่ายออก (บาท)', format: 'currency' },
      { key: 'payee', label: 'คู่ค้า / ผู้รับเงิน' }
    ],
    transform: (appState) => {
      const txs = appState.accountingTransactions || [];
      const rows = txs.map(t => ({
        date: t.date || '-',
        description: t.description || '-',
        category: t.category || '-',
        account: t.account || '-',
        income: t.type === 'income' ? Number(t.amount) || 0 : 0,
        expense: t.type === 'expense' ? Number(t.amount) || 0 : 0,
        payee: t.payee || '-'
      }));

      const totalIn = rows.reduce((s, r) => s + r.income, 0);
      const totalOut = rows.reduce((s, r) => s + r.expense, 0);
      const netCash = totalIn - totalOut;

      return {
        rows,
        kpis: [
          { label: 'เงินสดรับเข้ารวม', value: formatCurrency(totalIn), color: 'emerald' },
          { label: 'เงินสดจ่ายออกรวม', value: formatCurrency(totalOut), color: 'rose' },
          { label: 'กระแสเงินสดสุทธิ', value: formatCurrency(netCash), color: netCash >= 0 ? 'indigo' : 'rose' }
        ]
      };
    }
  },

  // ==========================================
  // 🛡️ MODULE 06: THAI FDA REGULATORY
  // ==========================================

  'fda_license_matrix': {
    id: 'fda_license_matrix',
    title: '🛡️ รายงานการติดตามอายุใบอนุญาต อย. (FDA Expiration Matrix)',
    module: 'Thai FDA Regulatory',
    category: 'regulatory',
    icon: '🛡️',
    description: 'ตรวจสอบทะเบียน อย. ของเครื่องมือแพทย์ทุกรุ่น เพื่อเตือนต่ออายุล่วงหน้า 30-90 วัน',
    columns: [
      { key: 'productName', label: 'ชื่อผลิตภัณฑ์เครื่องมือแพทย์' },
      { key: 'fdaNumber', label: 'เลขที่ใบอนุญาต อย.' },
      { key: 'manufacturer', label: 'ผู้ผลิต / ประเทศ' },
      { key: 'issueDate', label: 'วันที่ได้รับอนุญาต' },
      { key: 'expiryDate', label: 'วันหมดอายุ' },
      { key: 'daysLeft', label: 'คงเหลือ (วัน)', format: 'number' },
      { key: 'status', label: 'สถานะใบอนุญาต' }
    ],
    transform: (appState) => {
      const fdas = appState.fdaRegistrations || [];
      const today = new Date();
      today.setHours(0,0,0,0);

      const rows = fdas.map(f => {
        let days = 0;
        let status = 'ปกติ';
        if (f.expiryDate) {
          const exp = new Date(f.expiryDate);
          exp.setHours(0,0,0,0);
          days = Math.ceil((exp - today) / 86400000);
          if (days < 0) status = '🔴 หมดอายุแล้ว';
          else if (days <= 60) status = '🟡 ใกล้หมดอายุ (<60 วัน)';
          else status = '🟢 ปกติ';
        }
        return {
          productName: f.productName || '-',
          fdaNumber: f.fdaNumber || '-',
          manufacturer: f.manufacturer || '-',
          issueDate: f.issueDate || '-',
          expiryDate: f.expiryDate || '-',
          daysLeft: days,
          status: status
        };
      });

      const expiringCount = rows.filter(r => r.daysLeft >= 0 && r.daysLeft <= 60).length;

      return {
        rows,
        kpis: [
          { label: 'ทะเบียน อย. ทั้งหมด', value: `${rows.length} รายการ`, color: 'indigo' },
          { label: 'ใกล้หมดอายุ (<60 วัน)', value: `${expiringCount} รายการ`, color: 'amber' }
        ]
      };
    }
  },

  // ==========================================
  // 👥 MODULE 08: HUMAN RESOURCES
  // ==========================================

  'annual_leave_balance': {
    id: 'annual_leave_balance',
    title: '🏖️ รายงานสรุปวันลาคงเหลือและสถิติการลา (Annual Leave Balance)',
    module: 'Human Resources',
    category: 'hr',
    icon: '🏖️',
    description: 'สรุปโควตาวันลาพักร้อน ลาป่วย ลากิจ รายพนักงาน พร้อมประวัติการขออนุมัติ',
    columns: [
      { key: 'employeeName', label: 'ชื่อพนักงาน' },
      { key: 'role', label: 'ตำแหน่ง / สิทธิ์' },
      { key: 'annualQuota', label: 'โควตาพักร้อน (วัน)', format: 'number' },
      { key: 'vacationUsed', label: 'พักร้อนใช้ไป (วัน)', format: 'number' },
      { key: 'vacationRemaining', label: 'พักร้อนคงเหลือ (วัน)', format: 'number' },
      { key: 'sickUsed', label: 'ลาป่วยใช้ไป (วัน)', format: 'number' },
      { key: 'personalUsed', label: 'ลากิจใช้ไป (วัน)', format: 'number' }
    ],
    transform: (appState) => {
      const members = appState.members || [];
      const leaves = appState.leaveRequests || [];

      const rows = members.map(m => {
        const myLeaves = leaves.filter(l => l.employeeName === m.name && l.status === 'อนุมัติแล้ว');
        const vacUsed = myLeaves.filter(l => l.leaveType === 'พักร้อน').reduce((s, l) => s + (Number(l.days) || 1), 0);
        const sickUsed = myLeaves.filter(l => l.leaveType === 'ลาป่วย').reduce((s, l) => s + (Number(l.days) || 1), 0);
        const persUsed = myLeaves.filter(l => l.leaveType === 'ลากิจ').reduce((s, l) => s + (Number(l.days) || 1), 0);
        const quota = 10;

        return {
          employeeName: m.name || '-',
          role: m.role || 'Sales',
          annualQuota: quota,
          vacationUsed: vacUsed,
          vacationRemaining: Math.max(0, quota - vacUsed),
          sickUsed: sickUsed,
          personalUsed: persUsed
        };
      });

      return {
        rows,
        kpis: [
          { label: 'จำนวนพนักงาน', value: `${rows.length} ท่าน`, color: 'indigo' },
          { label: 'โควตาพักร้อนเฉลี่ยคงเหลือ', value: `${(rows.reduce((s, r) => s + r.vacationRemaining, 0) / (rows.length || 1)).toFixed(1)} วัน`, color: 'emerald' }
        ]
      };
    }
  }

};

window.REPORT_REGISTRY = REPORT_REGISTRY;


// --- Module File: js/modules/mod10_reports/UniversalReportModal.js ---
// MODULE: mod10_reports/UniversalReportModal.js
// Pluggable Universal Report Viewer Modal with Real-time Filters & Excel Export

function UniversalReportModal({
  isOpen,
  onClose,
  reportId,
  appState = {}
}) {
  if (!isOpen || !reportId) return null;

  const reportDef = (window.REPORT_REGISTRY && window.REPORT_REGISTRY[reportId]) || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Compute report data on demand
  const reportData = useMemo(() => {
    if (!reportDef || !reportDef.transform) return { rows: [], kpis: [] };
    try {
      return reportDef.transform(appState);
    } catch (err) {
      console.error('Report computation error:', err);
      return { rows: [], kpis: [] };
    }
  }, [reportDef, appState]);

  // Real-time Search Filter
  const filteredRows = useMemo(() => {
    const rows = reportData.rows || [];
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter(row => {
      return Object.values(row).some(val => {
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [reportData.rows, searchQuery]);

  const handleExportExcel = () => {
    if (!reportDef) return;
    setIsExporting(true);
    setTimeout(() => {
      ExcelExportEngine.exportToExcel(
        `AERON_${reportDef.id}`,
        reportDef.columns,
        filteredRows,
        {
          reportTitle: `${reportDef.title} (${reportDef.module})`
        }
      );
      setIsExporting(false);
    }, 150);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!reportDef) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl text-center space-y-3 max-w-md">
          <div className="text-3xl">⚠️</div>
          <div className="text-white font-bold">ไม่พบรายงานรหัส "{reportId}"</div>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-6xl rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl animate-modal max-h-[94vh] flex flex-col text-slate-100">

        {/* 1. Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {reportDef.icon || '📊'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">{reportDef.title}</h3>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  {reportDef.module}
                </span>
              </div>
              <p className="text-xs text-slate-400">{reportDef.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportExcel}
              disabled={isExporting || filteredRows.length === 0}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
              title="ส่งออกรายงานเป็นไฟล์ Excel / CSV พร้อมเปิดใช้งาน"
            >
              <span>{isExporting ? '⏳' : '📥'}</span>
              <span>{isExporting ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลด Excel'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
              title="พิมพ์รายงาน"
            >
              <span>🖨️ พิมพ์</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. KPI Summary Cards */}
        {reportData.kpis && reportData.kpis.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {reportData.kpis.map((kpi, idx) => {
              const bgCol = kpi.color === 'emerald' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
                            kpi.color === 'rose' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
                            kpi.color === 'amber' ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' :
                            kpi.color === 'indigo' ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300' :
                            'bg-slate-800/50 border-slate-700 text-slate-200';
              return (
                <div key={idx} className={`p-3 rounded-2xl border ${bgCol} flex flex-col justify-between`}>
                  <span className="text-[11px] text-slate-400 font-medium">{kpi.label}</span>
                  <span className="text-sm sm:text-base font-extrabold mt-0.5 tracking-tight font-mono">{kpi.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อมูลในรายงาน (เช่น ชื่อ รพ., รุ่นเครื่อง, เซลส์, S/N)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center justify-end gap-2 px-1">
            <span>แสดง <strong>{filteredRows.length}</strong> จาก <strong>{reportData.rows.length}</strong> รายการ</span>
          </div>
        </div>

        {/* 4. Interactive Data Table */}
        <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/50 scrollbar-thin">
          {filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-2">
              <span className="text-3xl">📭</span>
              <span className="text-sm font-bold">ไม่พบข้อมูลตรงกับเงื่อนไขที่ค้นหา</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  {reportDef.columns.map((col, cIdx) => (
                    <th key={cIdx} className={`p-3 whitespace-nowrap ${col.format === 'currency' || col.format === 'number' || col.format === 'percent' ? 'text-right' : ''}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11.5px]">
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-center text-slate-500 text-[10.5px] font-sans">{rIdx + 1}</td>
                    {reportDef.columns.map((col, cIdx) => {
                      const val = row[col.key];
                      let displayVal = val;
                      let extraClass = 'text-slate-200';

                      if (val === undefined || val === null || val === '') {
                        displayVal = '-';
                        extraClass = 'text-slate-600';
                      } else if (col.format === 'currency') {
                        displayVal = formatCurrency(val);
                        extraClass = 'text-right font-bold text-emerald-400';
                      } else if (col.format === 'percent') {
                        displayVal = typeof val === 'number' ? `${val.toFixed(2)}%` : String(val);
                        extraClass = 'text-right font-bold text-amber-300';
                      } else if (col.format === 'number') {
                        displayVal = typeof val === 'number' ? val.toLocaleString('th-TH') : String(val);
                        extraClass = 'text-right font-bold text-slate-200';
                      } else if (typeof val === 'string' && (val.includes('หมดประกัน') || val.includes('หมดอายุ') || val.includes('แพ้งาน'))) {
                        extraClass = 'text-rose-400 font-bold font-sans';
                      } else if (typeof val === 'string' && (val.includes('ใกล้หมด') || val.includes('รอผล'))) {
                        extraClass = 'text-amber-300 font-bold font-sans';
                      } else if (typeof val === 'string' && (val.includes('ในประกัน') || val.includes('ชนะ') || val.includes('ปกติ'))) {
                        extraClass = 'text-emerald-300 font-bold font-sans';
                      } else {
                        extraClass = 'font-sans text-slate-200';
                      }

                      return (
                        <td key={cIdx} className={`p-3 whitespace-nowrap ${extraClass}`}>
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 5. Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500 shrink-0">
          <span>* รายงานคำนวณแบบ Real-time จากฐานข้อมูลปัจจุบันของระบบ AERON MEDICAL</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
}

window.UniversalReportModal = UniversalReportModal;


// --- Module File: js/modules/App.js ---
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


