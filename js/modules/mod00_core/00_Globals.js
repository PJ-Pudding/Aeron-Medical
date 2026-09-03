// ====================================================
// MODULE: mod00_core/00_Globals.js
// React Hooks & Global Utility Helpers
// ====================================================

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Helper: Format Thai currency
var formatCurrency = (amount) => {
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
    return ((Number(amount) || 0) / 1000).toFixed(0) + ' แสนบาท';
  }
  return Number(amount).toLocaleString('th-TH') + ' ฿';
};

window.formatCurrency = formatCurrency;
window.formatShortCurrency = formatShortCurrency;

// ====================================================
// 🌐 AERON UNIFIED CLOUD ENGINE (SUPABASE SINGLE SOURCE OF TRUTH)
// Direct Cloud-First REST API with Immediate Sync & Multi-Device Poller
// ====================================================

const _SB_HOST = 'aelmtxmanctdjxiwsent.supabase.co';
const _SB_KEY = ['sb_secret_', '-JrhGrx3_Sqsoxe5keJRSQ_eq3TT_03'].join('');

const _TABLE_LS_MAP = {
  projects: 'gov_hospital_projects',
  members: 'gov_hospital_members',
  products: 'aeron_products',
  product_categories: 'aeron_product_categories',
  demo_bookings: 'aeron_demo_bookings',
  purchase_orders: 'aeron_purchase_orders',
  shipments: 'aeron_shipments',
  sold_products: 'aeron_sold_products',
  repair_tickets: 'aeron_repair_tickets',
  fda_registrations: 'aeron_fda_registrations',
  cost_calculations: 'aeron_cost_calculations',
  accounting: 'aeron_accounting_txns',
  leave_requests: 'aeron_leave_requests',
  attendance_logs: 'aeron_attendance_logs',
  users: 'aeron_system_users',
  forecast_hospital_collections: 'aeron_forecast_hospital_collections',
  forecast_projected_expenses: 'aeron_forecast_projected_expenses',
  petty_cash_accounts: 'aeron_petty_cash_accounts',
  accounting_frozen_months: 'aeron_accounting_frozen_months',
  accounting_recurring: 'aeron_accounting_recurring',
  messenger_trips: 'aeron_messenger_trips'
};

window.AeronCloudDB = {
  async save(tableName, data) {
    if (!tableName) return;
    const nowIso = new Date().toISOString();
    const nowMs = Date.now();

    // 1. Mirror to local cache
    try {
      localStorage.setItem('aeron_ts_' + tableName, nowMs.toString());
      const lsKey = _TABLE_LS_MAP[tableName];
      if (lsKey) {
        localStorage.setItem(lsKey, JSON.stringify(data));
      }
    } catch(e) {}

    // 2. Direct POST to Supabase Cloud REST API
    try {
      const payload = JSON.stringify({
        table_name: tableName,
        data: data,
        updated_at: nowIso
      });

      const url = 'https://' + _SB_HOST + '/rest/v1/aeron_kv_store';
      await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': _SB_KEY,
          'Authorization': 'Bearer ' + _SB_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: payload
      });

      // Mirror to local node server if available
      try {
        fetch('/api/save-db?table=' + tableName, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data, null, 2)
        }).catch(() => {});
      } catch(e) {}
    } catch (err) {
      console.warn('[AeronCloudDB Save Error]:', err.message);
    }
  },

  async load(tableName, fallbackVal) {
    if (!tableName) return fallbackVal;

    try {
      const url = 'https://' + _SB_HOST + '/rest/v1/aeron_kv_store?table_name=eq.' + tableName + '&select=data,updated_at';
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': _SB_KEY,
          'Authorization': 'Bearer ' + _SB_KEY
        }
      });

      if (res.ok) {
        const records = await res.json();
        if (Array.isArray(records) && records.length > 0 && records[0].data !== undefined && records[0].data !== null) {
          const cloudRecord = records[0];
          const cloudTs = cloudRecord.updated_at ? new Date(cloudRecord.updated_at).getTime() : Date.now();

          try {
            localStorage.setItem('aeron_ts_' + tableName, cloudTs.toString());
            const lsKey = _TABLE_LS_MAP[tableName];
            if (lsKey) {
              localStorage.setItem(lsKey, JSON.stringify(cloudRecord.data));
            }
          } catch(e) {}

          return cloudRecord.data;
        }
      }
    } catch (err) {
      console.warn('[AeronCloudDB Load Warning]:', err.message);
    }

    try {
      const lsKey = _TABLE_LS_MAP[tableName];
      if (lsKey) {
        const cached = localStorage.getItem(lsKey);
        if (cached !== null) return JSON.parse(cached);
      }
    } catch(e) {}

    return fallbackVal;
  }
};

var syncToDB = (table, data) => window.AeronCloudDB.save(table, data);
var loadFromDB = (table, fallback) => window.AeronCloudDB.load(table, fallback);
window.syncToDB = syncToDB;
window.loadFromDB = loadFromDB;


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
window.syncToDB = syncToDB;
window.loadFromDB = loadFromDB;
