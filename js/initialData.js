var syncToDB = function(t, d) { if (window.AeronCloudDB) return window.AeronCloudDB.save(t, d); };
var loadFromDB = function(t, f) { if (window.AeronCloudDB) return window.AeronCloudDB.load(t, f); return Promise.resolve(f); };
window.syncToDB = syncToDB;
window.loadFromDB = loadFromDB;
// ====================================================
// Global Currency & Number Formatters (Indestructible Failsafe)
// ====================================================
var formatCurrency = function(amount) {
  if (!amount || isNaN(amount)) return '0 บาท';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
};
var formatShortCurrency = function(amount) {
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

// Initial Data & Constants for Hospital & Government Sales Tracking System
// Company: AERON MEDICAL Co., Ltd.
// Production Data with 100% Standardized Expense Categories Matching Filters

window.BUDGET_TYPES = [
  'งบลงทุน',
  'งบเงินบำรุง',
  'งบบริจาค',
  'งบประมาณแผ่นดิน',
  'งบกลาง / งบพิเศษ'
];

window.PRODUCT_CATEGORIES = [
  'Traction Frame ตัวต่อเสริม เตียงในการผ่ากระดูก ( Fracture Table)',
  'เครื่องช่วยหายใจ (Ventilator)',
  'เครื่องมือแพทย์อื่นๆ',
  'Power drill (ปืน,สว่าน เจาะกระดูก)'
];

// Product Catalog - Seeded with Active Products
window.CENTRAL_PRODUCT_CATALOG = [];

// Sales Pipeline Stages
window.STAGES = [
  {
    id: 'stage_tor',
    title: '1. กำหนดคุณลักษณะ / ร่าง TOR',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    headerBg: 'from-blue-900/40 to-slate-900',
    accentColor: '#3b82f6'
  },
  {
    id: 'stage_demo',
    title: '2. สาธิต / ทดลองเครื่อง',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    headerBg: 'from-purple-900/40 to-slate-900',
    accentColor: '#a855f7'
  },
  {
    id: 'stage_bidding',
    title: '3. ยื่นซอง / ประกวดราคา',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    headerBg: 'from-amber-900/40 to-slate-900',
    accentColor: '#f59e0b'
  },
  {
    id: 'stage_contract',
    title: '4. รออนุมัติ / เซ็นสัญญา',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    headerBg: 'from-indigo-900/40 to-slate-900',
    accentColor: '#6366f1'
  },
  {
    id: 'stage_won',
    title: '5. ชนะงาน / ได้สัญญา 🎉',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    headerBg: 'from-emerald-900/40 to-slate-900',
    accentColor: '#10b981'
  },
  {
    id: 'stage_ordering',
    title: '6. สั่งซื้อ / สั่งผลิตเครื่อง 📦',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    headerBg: 'from-teal-900/40 to-slate-900',
    accentColor: '#14b8a6'
  },
  {
    id: 'stage_delivery',
    title: '7. ส่งมอบ & ติดตั้ง 🚛',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    headerBg: 'from-cyan-900/40 to-slate-900',
    accentColor: '#06b6d4'
  },
  {
    id: 'stage_complete',
    title: '8. ตรวจรับ & เบิกจ่ายเงินเสร็จสิ้น 🏆',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    headerBg: 'from-emerald-900/40 to-slate-900',
    accentColor: '#10b981'
  },
  {
    id: 'stage_lost',
    title: '9. ไม่ผ่าน / แพ้งาน ❌',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    headerBg: 'from-rose-900/40 to-slate-900',
    accentColor: '#f43f5e'
  }
];

// User Accounts & Team Members (Preserved)
window.INITIAL_MEMBERS = [
  {
    "id": "m1",
    "name": "คุณตู้ (CEO / Owner)",
    "role": "OWNER",
    "avatar": "👑"
  },
  {
    "id": "m2",
    "name": "คุณจี๊ด (Head Admin)",
    "role": "HEAD_ADMIN",
    "avatar": "👩‍💼"
  },
  {
    "id": "m3",
    "name": "คุณมุก (Admin Officer)",
    "role": "ADMIN",
    "avatar": "🏢"
  },
  {
    "id": "m3",
    "name": "คุณแจง (Sales-Esarn1)",
    "role": "SALES_HEAD",
    "avatar": "👨‍⚕️"
  },
  {
    "id": "m1",
    "name": "คุณอุ๋มอิ๋ม (Sales Bkk2)",
    "role": "SALES",
    "avatar": "👨‍⚕️"
  },
  {
    "id": "m4",
    "name": "คุณบอย (Messenger Dispatch)",
    "role": "MESSENGER",
    "avatar": "🛵"
  },
  {
    "id": "m_1788324203625",
    "name": "คุณโหน่ง-Bkk1",
    "role": "SALES_HEAD",
    "avatar": "👨‍⚕️"
  },
  {
    "id": "m_1788324463770",
    "name": "คุณมิ้ว (Sales-Esarn2)",
    "role": "SALES",
    "avatar": "👨‍⚕️"
  },
  {
    "id": "m_1788324525548",
    "name": "คุณปอ (Sales-west1)",
    "role": "SALES",
    "avatar": "👨‍⚕️"
  },
  {
    "id": "m_1788324571089",
    "name": "คุณเปิ้ล (Sales-Bkk3)",
    "role": "SALES",
    "avatar": "👨‍⚕️"
  }
];

window.INITIAL_PROJECTS = [];
window.INITIAL_DEMO_BOOKINGS = [];
window.INITIAL_PURCHASE_ORDERS = [];
window.INITIAL_SHIPMENTS = [];
window.INITIAL_REPAIR_TICKETS = [];
window.INITIAL_SOLD_PRODUCTS = [];
window.INITIAL_FDA_REGISTRATIONS = [];
window.INITIAL_COST_CALCULATIONS = [];
window.INITIAL_LEAVE_REQUESTS = [];
window.INITIAL_ATTENDANCE_LOGS = [];
window.INITIAL_ACCOUNTING_TRANSACTIONS = [];
window.INITIAL_DAILY_TRANSACTIONS = [];
window.INITIAL_MESSENGER_TRIPS = [];
window.INITIAL_ACTIVITY_LOGS = [];
