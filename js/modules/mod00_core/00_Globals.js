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

// 🧹 One-Time Cache Purge Migration (Purges legacy mock/demo data while strictly preserving GSheet accounting txns & users)
(function purgeLegacyMockData() {
  const PURGE_KEY = 'aeron_purge_v7';
  try {
    if (localStorage.getItem(PURGE_KEY) !== 'true') {
      const keysToPurge = [
        'gov_hospital_projects',
        'aeron_demo_bookings',
        'aeron_purchase_orders',
        'aeron_shipments',
        'aeron_sold_products',
        'aeron_repair_tickets',
        'aeron_fda_registrations',
        'aeron_products',
        'aeron_product_categories',
        'aeron_leave_requests',
        'aeron_attendance_logs',
        'aeron_messenger_trips',
        'aeron_cost_calculations',
        'aeron_accounting_audit',
        'aeron_accounting_frozen_months',
        'aeron_accounting_recurring',
        'aeron_petty_cash_accounts',
        'aeron_forecast_hospital_collections',
        'aeron_forecast_projected_expenses',
        'aeron_autocomplete_dictionary',
        'aeron_activity_logs'
      ];
      keysToPurge.forEach(k => {
        localStorage.removeItem(k);
        localStorage.removeItem('aeron_ts_' + k);
      });
      Object.keys(_TABLE_LS_MAP || {}).forEach(t => {
        if (t !== 'accounting' && t !== 'daily_transactions' && t !== 'users' && t !== 'members') {
          localStorage.removeItem('aeron_ts_' + t);
        }
      });
      localStorage.setItem(PURGE_KEY, 'true');
    }
  } catch(e) {}
})();

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
  let s = str;
  if (s.includes('à')) {
    const bytes = [];
    let canDecode = true;
    for (let i = 0; i < s.length; i++) {
      const code = str.charCodeAt(i);
      if (code in _cp1252Map) bytes.push(_cp1252Map[code]);
      else if (code <= 0xFF) bytes.push(code);
      else {
        canDecode = false;
        break;
      }
    }
    if (canDecode) {
      try {
        const uint8 = new Uint8Array(bytes);
        const decoded = new TextDecoder('utf-8').decode(uint8);
        if (/[\u0E00-\u0E7F]/.test(decoded)) s = decoded;
      } catch(e) {}
    }
  }
  if (s.includes('\uFFFD')) {
    s = s.replace(/\uFFFD+/g, '');
  }
  return s;
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

// 🛡️ Server-Authoritative Sync (SSoT Pattern — เหมือน Google Sheets / Notion)
// Server เป็น Source of Truth เสมอ — Client ใช้ค่าจาก Server ตรงๆ
// ไม่มี merge ซ้ำซ้อนอีกต่อไป
window.mergeAeronDatasets = null; // Deprecated: removed to prevent ghost data resurrection

// 🛡️ Client-Side Anti-Resurrection Quarantine Filter
const LEGACY_MOCK_IDS = new Set([
  'prod-101', 'prod-102', 'prod-103', 'prod-104', 'prod-105', 'prod-1788420592050',
  'prod-1788498375729',
  'proj-101', 'proj-102', 'proj-103', 'proj-104', 'proj-105', 'proj-106', 'proj-107', 'proj-108', 'proj-109', 'proj-110',
  'bk-101', 'bk-102', 'bk-103', 'bk-104', 'bk-105',
  'po-101', 'po-102', 'po-103',
  'shp-101', 'shp-102',
  'sold-101', 'sold-102',
  'rep-101', 'rep-102',
  'fda-101', 'fda-102', 'fda-103',
  'pc-1', 'pc-2',
  'MSG-2026-101', 'MSG-2026-102', 'MSG-2026-103', 'msg-101', 'msg-102', 'msg-103',
  'leave-101', 'leave-102', 'leave-103',
  'att-101', 'att-102', 'att-103',
  'calc-101', 'calc-102', 'calc-103'
]);

const LEGACY_MOCK_NAMES = new Set([
  'AERON Cardio 12L-AI',
  'AERON EchoVision 3D Pro',
  'AERON Operative Table X3',
  'AERON RespiVent V800',
  'AERON CentralStation 32B',
  '222222222',
  'Test'
]);

const LEGACY_MOCK_CATEGORIES = new Set([
  'Traction Frame ตัวต่อเสริม เตียงในการผ่ากระดูก ( Fracture Table)',
  'เครื่องช่วยหายใจ (Ventilator)',
  'เครื่องมือแพทย์อื่นๆ',
  'Power drill (ปืน,สว่าน เจาะกระดูก)'
]);

function filterQuarantineData(tableName, data) {
  if (!data) return data;
  if (tableName === 'product_categories' && Array.isArray(data)) {
    return data.filter(cat => !LEGACY_MOCK_CATEGORIES.has(cat));
  }
  if (Array.isArray(data)) {
    return data.filter(item => {
      if (!item) return false;
      if (item.id && LEGACY_MOCK_IDS.has(String(item.id))) return false;
      if (item.name && LEGACY_MOCK_NAMES.has(String(item.name).trim())) return false;
      if (item.title && LEGACY_MOCK_NAMES.has(String(item.title).trim())) return false;
      return true;
    });
  }
  return data;
}
window.filterQuarantineData = filterQuarantineData;

// 🧹 Auto-Purge Mock Data from Browser LocalStorage immediately on script execution
(function autoCleanseBrowserStorage() {
  try {
    const keysToCheck = [
      { key: 'aeron_products', table: 'products' },
      { key: 'aeron_product_categories', table: 'product_categories' },
      { key: 'gov_hospital_projects', table: 'projects' },
      { key: 'aeron_demo_bookings', table: 'demo_bookings' },
      { key: 'aeron_purchase_orders', table: 'purchase_orders' },
      { key: 'aeron_shipments', table: 'shipments' },
      { key: 'aeron_sold_products', table: 'sold_products' },
      { key: 'aeron_repair_tickets', table: 'repair_tickets' },
      { key: 'aeron_fda_registrations', table: 'fda_registrations' },
      { key: 'aeron_cost_calculations', table: 'cost_calculations' },
      { key: 'aeron_leave_requests', table: 'leave_requests' },
      { key: 'aeron_attendance_logs', table: 'attendance_logs' },
      { key: 'aeron_messenger_trips', table: 'messenger_trips' },
      { key: 'aeron_petty_cash_accounts', table: 'petty_cash_accounts' },
      { key: 'aeron_forecast_hospital_collections', table: 'forecast_hospital_collections' },
      { key: 'aeron_forecast_projected_expenses', table: 'forecast_projected_expenses' },
      { key: 'aeron_accounting_frozen_months', table: 'accounting_frozen_months' },
      { key: 'aeron_accounting_recurring', table: 'accounting_recurring' }
    ];
    for (const item of keysToCheck) {
      const raw = localStorage.getItem(item.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const cleaned = filterQuarantineData(item.table, parsed);
        localStorage.setItem(item.key, JSON.stringify(cleaned));
      }
    }
  } catch(e) {}
})();

window.AeronCloudDB = {
  async save(tableName, data) {
    if (!tableName) return;
    const cleanData = filterQuarantineData(tableName, data);
    const base = getAeronGatewayUrl();

    // Mark mutation lock & in-flight status immediately
    window._aeronInFlight[tableName] = true;
    window.markAeronMutation(tableName);

    // 1. Mirror to local browser storage immediately (compact JSON)
    try {
      const lsKey = _TABLE_LS_MAP[tableName];
      if (lsKey) localStorage.setItem(lsKey, JSON.stringify(cleanData));
      localStorage.setItem('aeron_ts_' + tableName, Date.now().toString());
    } catch(e) {
      console.warn('[AeronCloudDB LocalStorage Warning]:', e.message);
    }

    // 2. Send to Central Backend Gateway (compact JSON to minimize bandwidth and fit under 5MB)
    try {
      await fetch(base + '/api/save-db?table=' + tableName, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(cleanData)
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
          if (cached !== null) return filterQuarantineData(tableName, JSON.parse(cached));
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
          const cleanData = filterQuarantineData(tableName, sanitizeThaiData(data));
          // 🛡️ Server-Authoritative: ใช้ค่าจาก Server ตรงๆ ไม่ merge กับ localStorage
          // อัปเดต localStorage เป็น offline cache เท่านั้น
          try {
            const lsKey = _TABLE_LS_MAP[tableName];
            if (lsKey) {
              localStorage.setItem(lsKey, JSON.stringify(cleanData));
              localStorage.setItem('aeron_ts_' + tableName, Date.now().toString());
            }
          } catch(e) {}
          return cleanData;
        }
      }
    } catch (err) {
      console.warn('[AeronCloudDB Load Warning]:', err.message);
    }

    // Offline fallback: ใช้ localStorage เมื่อ Server ไม่ตอบ
    try {
      const lsKey = _TABLE_LS_MAP[tableName];
      if (lsKey) {
        const cached = localStorage.getItem(lsKey);
        if (cached !== null) return filterQuarantineData(tableName, sanitizeThaiData(JSON.parse(cached)));
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
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) pettyCashList = parsed;
    }
  } catch (e) {
    pettyCashList = [];
  }

  const pettyNames = (pettyCashList || []).map(pc => pc.name || `เงินสดสำรองจ่าย - ${pc.empName || ''}`);
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

// 🧠 Central Auto-Learning Master Dictionary Engine (SSoT)
const DEFAULT_DICTIONARY_SEEDS = {
  brand: ['AERON MEDICAL', 'Bojin', 'Mindray', 'Sonoscape'],
  product: ['BJ 3500', 'Bojin 5600'],
  hospital: [
    'โรงพยาบาลศิริราช',
    'โรงพยาบาลรามาธิบดี',
    'โรงพยาบาลจุฬาลงกรณ์',
    'โรงพยาบาลพระมงกุฎเกล้า',
    'โรงพยาบาลมหาราชนครเชียงใหม่',
    'โรงพยาบาลขอนแก่น',
    'โรงพยาบาลสงขลานครินทร์'
  ],
  department: [
    'แผนกห้องผ่าตัด (OR)',
    'แผนกผู้ป่วยวิกฤต (ICU)',
    'แผนกฉุกเฉินและอุบัติเหตุ (ER)',
    'แผนกผู้ป่วยนอก (OPD)',
    'แผนกรังสีวิทยา (X-Ray)',
    'แผนกพัสดุและจัดซื้อ',
    'แผนกซ่อมบำรุงและเครื่องมือแพทย์'
  ],
  accessory: [
    'ตัวเครื่องหลัก (Main Unit)',
    'สายไฟหลัก Power Cord & AC Adapter',
    'หัวโพรบ Linear Probe',
    'หัวโพรบ Convex Probe',
    'สาย Patient Cable 10-Lead',
    'แท่นชาร์จและแบตเตอรี่สำรอง',
    'คู่มือการใช้งานภาษาไทย'
  ],
  unit: [
    'เครื่อง',
    'ชุด',
    'ชิ้น',
    'เส้น',
    'ลูก',
    'ม้วน',
    'กล่อง',
    'เล่ม',
    'ใบ',
    'อัน'
  ],
  location: [
    'สำนักงาน AERON กรุงเทพฯ',
    'คลังสินค้ากลาง AERON',
    'สำนักงานเชียงใหม่'
  ],
  repair_symptom: [
    'ชาร์จไฟไม่เข้า / แบตเตอรี่ไม่เก็บประจุ',
    'หน้าจอไม่ติด / จอมืด',
    'หัวโพรบภาพไม่ขึ้น / สัญญาณขาดหาย',
    'สายไฟขาด / หัวต่อชำรุด',
    'มอเตอร์ไม่หมุน / กำลังตก',
    'ปุ่มกดไม่ตอบสนอง'
  ],
  payee: [
    'บริษัท เมดิคอลไบโอ จำกัด',
    'DHL Global Forwarding (Thailand)'
  ],
  forwarder: [
    'DHL Express',
    'DHL Global Forwarding',
    'Kuehne+Nagel',
    'FedEx',
    'Kerry Express'
  ]
};

function getAeronDictionary(category) {
  try {
    const raw = localStorage.getItem('aeron_autocomplete_dictionary');
    const dict = raw ? JSON.parse(raw) : {};
    if (category) {
      const savedList = Array.isArray(dict[category]) ? dict[category] : [];
      const seeds = DEFAULT_DICTIONARY_SEEDS[category] || [];
      const mergedSet = new Set(seeds.map(s => String(s).trim().toLowerCase()));
      const result = [...seeds];
      for (const item of savedList) {
        if (item && !mergedSet.has(String(item).trim().toLowerCase())) {
          result.push(String(item).trim());
          mergedSet.add(String(item).trim().toLowerCase());
        }
      }
      result.sort((a, b) => a.localeCompare(b, 'th'));
      return result;
    }
    const merged = { ...DEFAULT_DICTIONARY_SEEDS };
    for (const cat of Object.keys(dict)) {
      if (!Array.isArray(merged[cat])) merged[cat] = [];
      const existingSet = new Set(merged[cat].map(x => String(x).trim().toLowerCase()));
      for (const item of (dict[cat] || [])) {
        if (item && !existingSet.has(String(item).trim().toLowerCase())) {
          merged[cat].push(String(item).trim());
          existingSet.add(String(item).trim().toLowerCase());
        }
      }
      merged[cat].sort((a, b) => a.localeCompare(b, 'th'));
    }
    return merged;
  } catch(e) {
    return category ? (DEFAULT_DICTIONARY_SEEDS[category] || []) : DEFAULT_DICTIONARY_SEEDS;
  }
}

let _dictDebounceTimer = null;
function _triggerDebouncedCloudSave(dict) {
  if (_dictDebounceTimer) clearTimeout(_dictDebounceTimer);
  _dictDebounceTimer = setTimeout(() => {
    if (window.AeronCloudDB && typeof window.AeronCloudDB.save === 'function') {
      window.AeronCloudDB.save('dictionary', dict);
    }
  }, 500);
}

function saveAeronDictionaryItem(category, value) {
  if (!category || !value || typeof value !== 'string') return;
  const valClean = value.trim();
  const minLen = category === 'unit' ? 1 : 2;
  if (valClean.length < minLen) return;

  try {
    const raw = localStorage.getItem('aeron_autocomplete_dictionary');
    const dict = raw ? JSON.parse(raw) : {};
    if (!Array.isArray(dict[category])) {
      dict[category] = DEFAULT_DICTIONARY_SEEDS[category] ? [...DEFAULT_DICTIONARY_SEEDS[category]] : [];
    }

    const exists = dict[category].some(item => item.trim().toLowerCase() === valClean.toLowerCase());
    if (!exists) {
      dict[category].push(valClean);
      dict[category].sort((a, b) => a.localeCompare(b, 'th'));
      localStorage.setItem('aeron_autocomplete_dictionary', JSON.stringify(dict));

      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('aeron_dictionary_updated', { detail: { category, dict } }));
      }

      _triggerDebouncedCloudSave(dict);
    }
  } catch(e) {
    console.warn('Error saving to dictionary:', e);
  }
}

function batchSaveAeronDictionary(categoryItemsMap) {
  if (!categoryItemsMap || typeof categoryItemsMap !== 'object') return;
  try {
    const raw = localStorage.getItem('aeron_autocomplete_dictionary');
    const dict = raw ? JSON.parse(raw) : {};
    let hasChanges = false;

    for (const category of Object.keys(categoryItemsMap)) {
      const items = categoryItemsMap[category];
      if (!items) continue;
      const arr = Array.isArray(items) ? items : [items];
      const minLen = category === 'unit' ? 1 : 2;

      if (!Array.isArray(dict[category])) {
        dict[category] = DEFAULT_DICTIONARY_SEEDS[category] ? [...DEFAULT_DICTIONARY_SEEDS[category]] : [];
      }

      for (const val of arr) {
        if (!val || typeof val !== 'string') continue;
        const valClean = val.trim();
        if (valClean.length < minLen) continue;

        const exists = dict[category].some(item => item.trim().toLowerCase() === valClean.toLowerCase());
        if (!exists) {
          dict[category].push(valClean);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        dict[category].sort((a, b) => a.localeCompare(b, 'th'));
      }
    }

    if (hasChanges) {
      localStorage.setItem('aeron_autocomplete_dictionary', JSON.stringify(dict));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('aeron_dictionary_updated', { detail: { dict } }));
      }
      _triggerDebouncedCloudSave(dict);
    }
  } catch(e) {
    console.warn('Error batch saving to dictionary:', e);
  }
}

// 🌐 Auto-Hydrate Central Dictionary from Cloud on Startup
async function hydrateAeronDictionary() {
  try {
    const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
    if (!fetcher) return;
    const remoteDict = await fetcher('dictionary', null);
    if (remoteDict && typeof remoteDict === 'object' && !Array.isArray(remoteDict)) {
      const rawLocal = localStorage.getItem('aeron_autocomplete_dictionary');
      const localDict = rawLocal ? JSON.parse(rawLocal) : {};
      const merged = { ...DEFAULT_DICTIONARY_SEEDS, ...remoteDict };

      for (const cat of Object.keys(localDict)) {
        if (!Array.isArray(merged[cat])) merged[cat] = [];
        const existingSet = new Set(merged[cat].map(x => String(x).trim().toLowerCase()));
        for (const item of (localDict[cat] || [])) {
          if (item && !existingSet.has(String(item).trim().toLowerCase())) {
            merged[cat].push(String(item).trim());
            existingSet.add(String(item).trim().toLowerCase());
          }
        }
        merged[cat].sort((a, b) => a.localeCompare(b, 'th'));
      }

      localStorage.setItem('aeron_autocomplete_dictionary', JSON.stringify(merged));
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('aeron_dictionary_updated', { detail: { dict: merged } }));
      }
    }
  } catch(e) {
    console.warn('[Dictionary Hydration Warning]:', e.message);
  }
}

// Initialize Hydration immediately & on window focus
if (typeof window !== 'undefined') {
  if (typeof setTimeout === 'function') setTimeout(hydrateAeronDictionary, 150);
  if (typeof window.addEventListener === 'function') window.addEventListener('focus', hydrateAeronDictionary);
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

window.DEFAULT_DICTIONARY_SEEDS = DEFAULT_DICTIONARY_SEEDS;
window.normalizeThaiPrefixes = normalizeThaiPrefixes;
window.stringSimilarity = stringSimilarity;
window.getAeronDictionary = getAeronDictionary;
window.saveAeronDictionaryItem = saveAeronDictionaryItem;
window.batchSaveAeronDictionary = batchSaveAeronDictionary;
window.hydrateAeronDictionary = hydrateAeronDictionary;
window.findSimilarDictionaryName = findSimilarDictionaryName;
