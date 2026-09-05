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
// 🌐 AERON CENTRALIZED BACKEND GATEWAY SYNC ENGINE
// With Mutation Grace Period (Zero-Flicker) & Smart Deep Comparison
// ====================================================

function getAeronGatewayUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'https://aeron-medical.onrender.com';
    }
  }
  return '';
}

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
  users: 'aeron_user_accounts',
  forecast_hospital_collections: 'aeron_forecast_hospital_collections',
  forecast_projected_expenses: 'aeron_forecast_projected_expenses',
  petty_cash_accounts: 'aeron_petty_cash_accounts',
  accounting_frozen_months: 'aeron_accounting_frozen_months',
  accounting_recurring: 'aeron_accounting_recurring',
  messenger_trips: 'aeron_messenger_trips',
  dictionary: 'aeron_autocomplete_dictionary'
};

// 🛡️ Mutation Grace Period & In-Flight Lock Engine (Prevents In-Flight Server Responses from Overwriting Active User Edits)
window._aeronLastMutationTime = {};
window._aeronInFlight = {};
window._aeronMutationGraceMs = 45000; // 45-second protected grace window (covers Render cold-start latency)

window.markAeronMutation = function(tableName) {
  if (!tableName) return;
  window._aeronLastMutationTime[tableName] = Date.now();
};

window.isAeronMutating = function(tableName) {
  if (!tableName) return false;
  if (window._aeronInFlight[tableName]) return true;
  const lastTime = window._aeronLastMutationTime[tableName] || 0;
  return (Date.now() - lastTime) < (window._aeronMutationGraceMs || 45000);
};

// 🛡️ Universal Thai Text Sanitizer (Auto-reverses any Windows-1252 Mojibake)
const _cp1252Map = {
  0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91,
  0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98,
  0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
};

function decodeMojibakeString(str) {
  if (!str || typeof str !== 'string') return str;
  if (!str.includes('à')) return str;
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code in _cp1252Map) bytes.push(_cp1252Map[code]);
    else if (code <= 0xFF) bytes.push(code);
    else return str;
  }
  try {
    const uint8 = new Uint8Array(bytes);
    const decoded = new TextDecoder('utf-8').decode(uint8);
    if (/[\u0E00-\u0E7F]/.test(decoded)) return decoded;
  } catch(e) {}
  return str;
}

function sanitizeThaiData(val) {
  if (typeof val === 'string') return decodeMojibakeString(val);
  if (Array.isArray(val)) return val.map(sanitizeThaiData);
  if (val && typeof val === 'object') {
    const out = {};
    for (const k of Object.keys(val)) out[k] = sanitizeThaiData(val[k]);
    return out;
  }
  return val;
}

window.sanitizeThaiData = sanitizeThaiData;

// 🛡️ Local-First Smart Dataset Merge (CRDT-Inspired: Local Always Protected, Zero Data Loss)
function mergeAeronDatasets(localList, remoteList, idKey = 'id') {
  if (!Array.isArray(localList) || localList.length === 0) return Array.isArray(remoteList) ? remoteList : [];
  if (!Array.isArray(remoteList) || remoteList.length === 0) return localList;

  const remoteMap = new Map();
  remoteList.forEach(item => {
    if (item && item[idKey]) remoteMap.set(String(item[idKey]), item);
  });

  const merged = [];
  const visitedIds = new Set();

  // 1. Keep all local items (so newly created or modified local items are NEVER wiped by remote)
  localList.forEach(localItem => {
    if (!localItem || !localItem[idKey]) {
      merged.push(localItem);
      return;
    }
    const idStr = String(localItem[idKey]);
    visitedIds.add(idStr);
    const remoteItem = remoteMap.get(idStr);

    if (!remoteItem) {
      // Local item not yet on remote: KEEP IT!
      merged.push(localItem);
    } else {
      // Both exist: check updated timestamp or preserve local if newer
      const localTime = new Date(localItem.updated_at || localItem.updatedDate || localItem.createdDate || 0).getTime();
      const remoteTime = new Date(remoteItem.updated_at || remoteItem.updatedDate || remoteItem.createdDate || 0).getTime();
      if (localTime >= remoteTime) {
        merged.push(localItem);
      } else {
        merged.push(remoteItem);
      }
    }
  });

  // 2. Add remote items that are not in local
  remoteList.forEach(remoteItem => {
    if (remoteItem && remoteItem[idKey]) {
      const idStr = String(remoteItem[idKey]);
      if (!visitedIds.has(idStr)) {
        merged.push(remoteItem);
        visitedIds.add(idStr);
      }
    }
  });

  return merged;
}
window.mergeAeronDatasets = mergeAeronDatasets;

window.AeronCloudDB = {
  async save(tableName, data) {
    if (!tableName) return;
    const base = getAeronGatewayUrl();

    // Mark mutation lock & in-flight status immediately
    window._aeronInFlight[tableName] = true;
    window.markAeronMutation(tableName);

    // 1. Mirror to local browser storage immediately (compact JSON)
    try {
      const lsKey = _TABLE_LS_MAP[tableName];
      if (lsKey) localStorage.setItem(lsKey, JSON.stringify(data));
      localStorage.setItem('aeron_ts_' + tableName, Date.now().toString());
    } catch(e) {
      console.warn('[AeronCloudDB LocalStorage Warning]:', e.message);
    }

    // 2. Send to Central Backend Gateway (compact JSON to minimize bandwidth and fit under 5MB)
    try {
      await fetch(base + '/api/save-db?table=' + tableName, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('[AeronCloudDB Save Warning]:', err.message);
    } finally {
      window._aeronInFlight[tableName] = false;
    }
  },

  async load(tableName, fallbackVal) {
    if (!tableName) return fallbackVal;

    // 🛡️ Grace Window & In-Flight Check: If user recently modified or is saving this table, protect local state
    if (window.isAeronMutating && window.isAeronMutating(tableName)) {
      try {
        const lsKey = _TABLE_LS_MAP[tableName];
        if (lsKey) {
          const cached = localStorage.getItem(lsKey);
          if (cached !== null) return JSON.parse(cached);
        }
      } catch(e) {}
      return fallbackVal;
    }

    const base = getAeronGatewayUrl();

    try {
      const res = await fetch(base + '/api/load-db?table=' + tableName);
      if (res.ok) {
        const data = await res.json();
        if (data !== undefined && data !== null) {
          const cleanData = sanitizeThaiData(data);
          const lsKey = _TABLE_LS_MAP[tableName];
          if (lsKey) {
            try {
              const cached = localStorage.getItem(lsKey);
              const parsedCached = cached ? JSON.parse(cached) : null;
              if (Array.isArray(cleanData) && Array.isArray(parsedCached)) {
                // Smart Merge: NEVER destroy local items!
                const finalData = mergeAeronDatasets(parsedCached, cleanData);
                if (finalData.length > cleanData.length) {
                  // Local had pending/unpushed records, heal cloud
                  window.AeronCloudDB.save(tableName, finalData);
                }
                localStorage.setItem(lsKey, JSON.stringify(finalData));
                localStorage.setItem('aeron_ts_' + tableName, Date.now().toString());
                return finalData;
              }
              localStorage.setItem(lsKey, JSON.stringify(cleanData));
              localStorage.setItem('aeron_ts_' + tableName, Date.now().toString());
            } catch(e) {}
          }
          return cleanData;
        }
      }
    } catch (err) {
      console.warn('[AeronCloudDB Load Warning]:', err.message);
    }

    try {
      const lsKey = _TABLE_LS_MAP[tableName];
      if (lsKey) {
        const cached = localStorage.getItem(lsKey);
        if (cached !== null) return sanitizeThaiData(JSON.parse(cached));
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
    "id": "usr_owner",
    "name": "คุณตู้ (CEO / Owner)",
    "role": "OWNER",
    "avatar": "👑",
    "memberId": "m1",
    "password": "123456",
    "username": "owner",
    "allowedTabs": [
      "dashboard",
      "clients",
      "project",
      "logistic",
      "calendar",
      "report",
      "finance",
      "hr",
      "accounting",
      "messenger"
    ],
    "canApproveHR": true,
    "canViewAuditLogs": true,
    "canViewAllFinancials": true
  },
  {
    "id": "usr_head_admin",
    "name": "คุณจี๊ด (Head Admin)",
    "role": "HEAD_ADMIN",
    "avatar": "👩‍💼",
    "memberId": "m2",
    "password": "123456",
    "username": "head_admin",
    "allowedTabs": [
      "dashboard",
      "clients",
      "project",
      "logistic",
      "calendar",
      "report",
      "finance",
      "hr",
      "accounting"
    ],
    "canApproveHR": true,
    "canViewAuditLogs": true,
    "canViewAllFinancials": true
  },
  {
    "id": "usr_admin",
    "name": "คุณมุก (Admin Officer)",
    "role": "ADMIN",
    "avatar": "🏢",
    "memberId": "m3",
    "password": "123456",
    "username": "admin",
    "allowedTabs": [
      "clients",
      "project",
      "logistic",
      "calendar",
      "report",
      "finance",
      "hr",
      "accounting"
    ],
    "canApproveHR": false,
    "canViewAuditLogs": false,
    "canViewAllFinancials": false
  },
  {
    "id": "usr_sales_head",
    "name": "คุณแจง (Sales-Esarn1)",
    "role": "SALES_HEAD",
    "avatar": "👨‍⚕️",
    "memberId": "m3",
    "password": "123456",
    "username": "sales-esarn1",
    "allowedTabs": [
      "dashboard",
      "clients",
      "project",
      "logistic",
      "calendar",
      "report",
      "hr"
    ],
    "canApproveHR": true,
    "subordinates": [
      "m1",
      "m2",
      "m3",
      "m4"
    ],
    "canViewAuditLogs": false,
    "canViewAllFinancials": false
  },
  {
    "id": "usr_sales_somchai",
    "name": "คุณอุ๋มอิ๋ม (Sales Bkk2)",
    "role": "SALES",
    "avatar": "👨‍⚕️",
    "memberId": "m1",
    "password": "123456",
    "username": "sales-bkk2",
    "allowedTabs": [
      "clients",
      "project",
      "logistic",
      "calendar",
      "report",
      "hr"
    ],
    "canApproveHR": false,
    "canViewAuditLogs": false,
    "canViewAllFinancials": false,
    "subordinates": [
      "m1",
      "m2",
      "m3",
      "m4"
    ]
  },
  {
    "id": "usr_messenger",
    "name": "คุณบอย (Messenger Dispatch)",
    "role": "MESSENGER",
    "avatar": "🛵",
    "memberId": "m4",
    "password": "123456",
    "username": "messenger",
    "allowedTabs": [
      "messenger"
    ],
    "canApproveHR": false,
    "canViewAuditLogs": false,
    "canViewAllFinancials": false,
    "subordinates": [
      "m1",
      "m2",
      "m3",
      "m4"
    ]
  },
  {
    "id": "usr_1788324203625",
    "name": "คุณโหน่ง-Bkk1",
    "role": "SALES_HEAD",
    "avatar": "👨‍⚕️",
    "memberId": "m_1788324203625",
    "password": "123456",
    "username": "sales-bkk1",
    "allowedTabs": [
      "dashboard",
      "clients",
      "project",
      "logistic",
      "calendar",
      "report",
      "hr"
    ],
    "canApproveHR": true,
    "subordinates": [
      "m1"
    ],
    "canViewAuditLogs": false,
    "canViewAllFinancials": false
  },
  {
    "id": "usr_1788324463770",
    "username": "sales-esarn2",
    "password": "123456",
    "name": "คุณมิ้ว (Sales-Esarn2)",
    "role": "SALES",
    "avatar": "👨‍⚕️",
    "allowedTabs": [
      "clients",
      "project",
      "logistic",
      "calendar",
      "report",
      "hr"
    ],
    "subordinates": [
      "m1",
      "m2",
      "m3",
      "m4"
    ],
    "canApproveHR": false,
    "canViewAuditLogs": false,
    "canViewAllFinancials": false,
    "memberId": "m_1788324463770"
  },
  {
    "id": "usr_1788324525548",
    "username": "sales-west1",
    "password": "123456",
    "name": "คุณปอ (Sales-west1)",
    "role": "SALES",
    "avatar": "👨‍⚕️",
    "allowedTabs": [
      "clients",
      "project",
      "logistic",
      "calendar",
      "hr"
    ],
    "subordinates": [
      "m1",
      "m2",
      "m3",
      "m4"
    ],
    "canApproveHR": false,
    "canViewAuditLogs": false,
    "canViewAllFinancials": false,
    "memberId": "m_1788324525548"
  },
  {
    "id": "usr_1788324571089",
    "username": "sales-bkk3",
    "password": "123456",
    "name": "คุณเปิ้ล (Sales-Bkk3)",
    "role": "SALES",
    "avatar": "👨‍⚕️",
    "allowedTabs": [
      "clients",
      "project",
      "logistic",
      "calendar",
      "hr"
    ],
    "subordinates": [
      "m1",
      "m2",
      "m3",
      "m4"
    ],
    "canApproveHR": false,
    "canViewAuditLogs": false,
    "canViewAllFinancials": false,
    "memberId": "m_1788324571089"
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

  const uName = (user.name || '').trim();
  const uFirstName = uName ? uName.split(' ')[0] : '';
  const uUsername = (user.username || '').trim().toLowerCase();

  const isSelfProject = (p) => {
    if (!p) return false;
    if (p.memberId && user.memberId && p.memberId === user.memberId) return true;
    if (p.assignee && uName && (p.assignee === uName || (uFirstName && p.assignee.includes(uFirstName)))) return true;
    if (p.created_by && (p.created_by === uName || (uUsername && p.created_by.toLowerCase() === uUsername) || p.created_by === user.id)) return true;
    return false;
  };

  if (roleConfig.dataScope === 'own') {
    return projects.filter(isSelfProject);
  }

  if (roleConfig.dataScope === 'subordinates') {
    if (!Array.isArray(user.subordinates) || user.subordinates.length === 0) {
      return projects.filter(isSelfProject);
    }
    let subMembers = [];
    try {
      const allMembers = window.INITIAL_MEMBERS || [];
      subMembers = allMembers.filter(m => user.subordinates.includes(m.id)).map(m => m.name);
    } catch (e) {}

    return projects.filter(p => {
      if (isSelfProject(p)) return true;
      if (p.memberId && user.subordinates.includes(p.memberId)) return true;
      if (p.assignee && (user.subordinates.includes(p.assignee) || subMembers.includes(p.assignee))) return true;
      return false;
    });
  }

  return projects;
}

function getUserAccounts() {
  try {
    const saved = localStorage.getItem('aeron_user_accounts');
    if (saved) {
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

    // ⚡ 100% Unified Auto-Bridge: Sync members list to match user accounts 1:1
    const syncedMembers = accounts.map((u, idx) => ({
      id: u.memberId || u.id || `m${idx+1}`,
      name: u.name,
      role: u.role,
      avatar: u.avatar || '👨‍⚕️'
    }));

    localStorage.setItem('gov_hospital_members', JSON.stringify(syncedMembers));

    if (typeof syncToDB === 'function') {
      syncToDB('users', accounts);
      syncToDB('members', syncedMembers);
    }

    if (typeof window !== 'undefined') {
      window.INITIAL_MEMBERS = syncedMembers;
      window.dispatchEvent(new CustomEvent('aeron_members_updated', { detail: syncedMembers }));
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


// ====================================================
// 📅 Universal Date Formatter: Standardized to '04-Sep-2026' (DD-MMM-YYYY)
// ====================================================
const _AERON_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatAeronDate(dateVal) {
  if (!dateVal) return '-';
  const str = String(dateVal).trim();
  if (!str || str === 'null' || str === 'undefined' || str === '-') return '-';

  // If already in DD-MMM-YYYY format (e.g. 04-Sep-2026 or 4-Sep-2026)
  const existingMatch = str.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (existingMatch) {
    const day = String(parseInt(existingMatch[1], 10)).padStart(2, '0');
    const month = existingMatch[2].charAt(0).toUpperCase() + existingMatch[2].slice(1).toLowerCase();
    return `${day}-${month}-${existingMatch[3]}`;
  }

  // Match YYYY-MM-DD or YYYY/MM/DD (with optional timestamp)
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = String(parseInt(ymdMatch[3], 10)).padStart(2, '0');
    if (month >= 0 && month < 12) {
      return `${day}-${_AERON_MONTHS_SHORT[month]}-${year}`;
    }
  }

  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = String(parseInt(dmyMatch[1], 10)).padStart(2, '0');
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = dmyMatch[3];
    if (month >= 0 && month < 12) {
      return `${day}-${_AERON_MONTHS_SHORT[month]}-${year}`;
    }
  }

  // Parse Date object or ISO timestamp
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = _AERON_MONTHS_SHORT[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch(e) {}

  return str;
}

window.formatAeronDate = formatAeronDate;
window.formatDate = formatAeronDate;

// ====================================================
// 🧠 Dynamic Name Autocomplete Dictionary & Similarity Warning Engine
// ====================================================

function normalizeThaiPrefixes(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim()
    .replace(/^(โรงพยาบาล|รพ\.|รพ\s*)/gi, '')
    .replace(/^(นายแพทย์|แพทย์หญิง|นพ\.|พญ\.|ศ\.ดร\.นพ\.|ศ\.นพ\.|ดร\.|อาจารย์|อ\.)/gi, '')
    .replace(/^(บริษัท\s*จำกัด|บริษัท|บจก\.|หจก\.|ห้างหุ้นส่วนจำกัด)/gi, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function stringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const raw1 = s1.trim().toLowerCase();
  const raw2 = s2.trim().toLowerCase();
  if (raw1 === raw2) return 1.0;

  const norm1 = normalizeThaiPrefixes(s1);
  const norm2 = normalizeThaiPrefixes(s2);

  if (norm1 && norm2 && norm1 === norm2) return 0.98;

  // Substring containment check on normalized or raw
  const aStr = norm1 || raw1;
  const bStr = norm2 || raw2;
  if (aStr.length >= 2 && bStr.length >= 2) {
    if (aStr.includes(bStr) || bStr.includes(aStr)) {
      const minLen = Math.min(aStr.length, bStr.length);
      const maxLen = Math.max(aStr.length, bStr.length);
      if (minLen >= 2 && (minLen / maxLen) >= 0.4) return 0.88;
      return 0.78;
    }
  }

  // Levenshtein distance on normalized
  const a = aStr;
  const b = bStr;
  const track = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= b.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  const distance = track[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return 1 - (distance / maxLen);
}

function getAeronDictionary(category) {
  try {
    const raw = localStorage.getItem('aeron_autocomplete_dictionary');
    const dict = raw ? JSON.parse(raw) : {};
    if (category) {
      return Array.isArray(dict[category]) ? dict[category] : [];
    }
    return dict;
  } catch(e) {
    return category ? [] : {};
  }
}

function saveAeronDictionaryItem(category, value) {
  if (!category || !value || typeof value !== 'string') return;
  const valClean = value.trim();
  if (valClean.length < 2) return;

  try {
    const raw = localStorage.getItem('aeron_autocomplete_dictionary');
    const dict = raw ? JSON.parse(raw) : {};
    if (!Array.isArray(dict[category])) dict[category] = [];

    const exists = dict[category].some(item => item.trim().toLowerCase() === valClean.toLowerCase());
    if (!exists) {
      dict[category].push(valClean);
      dict[category].sort((a, b) => a.localeCompare(b, 'th'));
      localStorage.setItem('aeron_autocomplete_dictionary', JSON.stringify(dict));

      if (window.AeronCloudDB && typeof window.AeronCloudDB.save === 'function') {
        window.AeronCloudDB.save('dictionary', dict);
      }

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('aeron_dictionary_updated', { detail: { category, dict } }));
      }
    }
  } catch(e) {
    console.warn('Error saving to dictionary:', e);
  }
}

function findSimilarDictionaryName(input, category) {
  if (!input || typeof input !== 'string') return null;
  const inClean = input.trim();
  if (inClean.length < 2) return null;

  const list = getAeronDictionary(category);
  // If user already typed an exact match of an existing item, no warning needed
  const isExactExisting = list.some(item => item.trim().toLowerCase() === inClean.toLowerCase());
  if (isExactExisting) return null;

  let bestMatch = null;
  let highestSim = 0;

  for (const item of list) {
    const sim = stringSimilarity(inClean, item);
    if (sim >= 0.70 && sim > highestSim) {
      highestSim = sim;
      bestMatch = { item, similarity: sim };
    }
  }
  return bestMatch;
}

window.normalizeThaiPrefixes = normalizeThaiPrefixes;
window.stringSimilarity = stringSimilarity;
window.getAeronDictionary = getAeronDictionary;
window.saveAeronDictionaryItem = saveAeronDictionaryItem;
window.findSimilarDictionaryName = findSimilarDictionaryName;
