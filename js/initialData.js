// Initial Data & Constants for Hospital & Government Sales Tracking System
// Company: AERON MEDICAL Co., Ltd.
// Clean Production Reset - Ready for Day 1 Operations

window.BUDGET_TYPES = [
  'งบลงทุน',
  'งบเงินบำรุง',
  'งบบริจาค',
  'งบประมาณแผ่นดิน',
  'งบกลาง / งบพิเศษ'
];

window.PRODUCT_CATEGORIES = [
  'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
  'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
  'เตียงผ่าตัด & โคมไฟผ่าตัด (Surgical System)',
  'เครื่องช่วยหายใจ (Ventilator)',
  'ระบบเฝ้าระวังผู้ป่วยวิกฤต (Central Monitor)',
  'เครื่องมือแพทย์อื่นๆ'
];

// Product Catalog - Clean State (Empty for fresh entries)
window.CENTRAL_PRODUCT_CATALOG = [];

// Sales Pipeline Stages
window.STAGES = [
  {
    id: 'stage_tor',
    title: '1. เสนอโครงการ / ร่าง TOR',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    headerBg: 'from-blue-900/40 to-slate-900',
    accentColor: '#3b82f6'
  },
  {
    id: 'stage_demo',
    title: '2. นัดสาธิต / เดโม่เครื่อง',
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
    id: 'stage_lost',
    title: '8. ไม่ผ่าน / แพ้งาน ❌',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    headerBg: 'from-rose-900/40 to-slate-900',
    accentColor: '#f43f5e'
  }
];

// User Accounts & Team Members (Preserved for system access)
window.INITIAL_MEMBERS = [
  { id: 'm1', name: 'สมชาย สายลุย', role: 'Sales Specialist', avatar: '👨‍⚕️' },
  { id: 'm2', name: 'สมหญิง ใจดี', role: 'Medical Representative', avatar: '👩‍⚕️' },
  { id: 'm3', name: 'อนันต์ ผู้โชคดี', role: 'Key Account Manager', avatar: '👨‍💼' },
  { id: 'm4', name: 'สุชาติ มุ่งมั่น', role: 'Product Specialist', avatar: '🧑‍💻' }
];

// Clean Transactional & Operational Datasets
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
