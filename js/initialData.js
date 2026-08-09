// Initial Data & Constants for Hospital & Government Sales Tracking System
// Company: AERON MEDICAL Co., Ltd.

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
  'ระบบเฝ้าระวังผู้ป่วยวิกฤต (Central Monitor)'
];

window.CENTRAL_PRODUCT_CATALOG = [
  {
    id: 'prod-101',
    category: 'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
    name: 'AERON Cardio 12L-AI',
    brand: 'AERON MEDICAL',
    price: 900000,
    demoUnitsAvailable: 2,
    demoSerialNumbers: ['AERON-DEMO-ECG-01', 'AERON-DEMO-ECG-02'],
    demoUnits: [
      {
        sn: 'AERON-DEMO-ECG-01',
        status: 'พร้อมใช้งาน',
        location: 'สำนักงาน AERON MEDICAL (กรุงเทพฯ)',
        accessories: 'สาย Lead 10 เส้น, กระดาษบันทึก 5 ม้วน, คู่มือภาษาไทย, กระเป๋าขนส่ง'
      },
      {
        sn: 'AERON-DEMO-ECG-02',
        status: 'พร้อมใช้งาน',
        location: 'โรงพยาบาลศิริราช (ยืมสาธิต)',
        accessories: 'สาย Lead 10 เส้น, กระดาษบันทึก 3 ม้วน, คู่มือภาษาไทย'
      }
    ],
    description: 'เครื่องตรวจคลื่นหัวใจ 12 ลีด พร้อมระบบ AI วิเคราะห์ความผิดปกติของหัวใจอัตโนมัติ',
    masterChecklistItems: [
      { id: 'mcli-101-1', name: 'ตัวเครื่องหลัก AERON Cardio 12L-AI', qty: 1, unit: 'เครื่อง', serialNo: 'SN-ECG-1001', condition: 'สมบูรณ์', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60', note: 'ตัวเครื่องหลัก ตรวจ QC พร้อมใช้' },
      { id: 'mcli-101-2', name: 'สายไฟหลัก Power Cord & AC Adapter', qty: 1, unit: 'ชุด', serialNo: 'PWR-2026-01', condition: 'สมบูรณ์', image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&auto=format&fit=crop&q=60', note: '' },
      { id: 'mcli-101-3', name: 'สายสัญญาณ Patient Cable 10-Lead Wire', qty: 1, unit: 'ชุด', serialNo: 'PAT-CAB-12', condition: 'สมบูรณ์', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=60', note: '' },
      { id: 'mcli-101-4', name: 'ลีดดูดสูญญากาศ Chest Electrodes Bulb Set', qty: 6, unit: 'ลูก', serialNo: '-', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'mcli-101-5', name: 'คลิปหนีบแขนขา Limb Clamps Set', qty: 4, unit: 'ชิ้น', serialNo: '-', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'mcli-101-6', name: 'กระดาษบันทึก Thermal Paper Roll', qty: 3, unit: 'ม้วน', serialNo: '-', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'mcli-101-7', name: 'กระเป๋าอลูมิเนียมใส่อุปกรณ์ Hard Case', qty: 1, unit: 'ใบ', serialNo: 'CASE-01', condition: 'สมบูรณ์', image: '', note: '' }
    ]
  },
  {
    id: 'prod-102',
    category: 'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
    name: 'AERON EchoVision 3D Pro',
    brand: 'AERON MEDICAL',
    price: 4100000,
    demoUnitsAvailable: 1,
    demoSerialNumbers: ['AERON-DEMO-US-01'],
    demoUnits: [
      {
        sn: 'AERON-DEMO-US-01',
        status: 'พร้อมใช้งาน',
        location: 'โรงพยาบาลรามาธิบดี (ยืมสาธิต)',
        accessories: 'โพรบ Cardiac C5-2, โพรบ Vascular L12-3, เจล Ultrasound 5 หลอด, รถเข็น, สายเชื่อม DICOM'
      }
    ],
    description: 'เครื่องอัลตราซาวด์หลอดเลือดและความถี่สูงสำหรับศูนย์หัวใจและหลอดเลือด',
    masterChecklistItems: [
      { id: 'mcli-102-1', name: 'เครื่องอัลตราซาวด์ AERON EchoVision Main Console', qty: 1, unit: 'เครื่อง', serialNo: 'SN-US-3001', condition: 'สมบูรณ์', image: '', note: 'ตัวเครื่องหลัก' },
      { id: 'mcli-102-2', name: 'หัวตรวจ Convex Probe (C5-2)', qty: 1, unit: 'หัว', serialNo: 'SN-PRB-CX01', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'mcli-102-3', name: 'หัวตรวจ Linear Probe (L12-4)', qty: 1, unit: 'หัว', serialNo: 'SN-PRB-LN02', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'mcli-102-4', name: 'สายไฟหลัก Power Cable', qty: 1, unit: 'เส้น', serialNo: '-', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'mcli-102-5', name: 'เจลอัลตราซาวด์ Ultrasound Gel 5kg', qty: 1, unit: 'แกลลอน', serialNo: '-', condition: 'สมบูรณ์', image: '', note: '' }
    ]
  },
  {
    id: 'prod-103',
    category: 'เตียงผ่าตัด & โคมไฟผ่าตัด (Surgical System)',
    name: 'AERON Operative Table X3',
    brand: 'AERON MEDICAL',
    price: 4000000,
    demoUnitsAvailable: 1,
    demoSerialNumbers: ['AERON-DEMO-OT-01'],
    demoUnits: [
      {
        sn: 'AERON-DEMO-OT-01',
        status: 'ส่งซ่อม',
        location: 'ศูนย์บริการ AERON (นนทบุรี)',
        accessories: 'รีโมทไฟฟ้า, แผ่นรองรัดผู้ป่วย, โคมไฟ LED ผ่าตัด, ขาตั้งโคมไฟ'
      }
    ],
    description: 'ชุดเตียงผ่าตัดไฟฟ้าอัจฉริยะ ปรับระดับและสปีดอัตโนมัติ พร้อมโคมไฟผ่าตัด LED'
  },
  {
    id: 'prod-104',
    category: 'เครื่องช่วยหายใจ (Ventilator)',
    name: 'AERON RespiVent V800',
    brand: 'AERON MEDICAL',
    price: 1500000,
    demoUnitsAvailable: 3,
    demoSerialNumbers: ['AERON-DEMO-VENT-01', 'AERON-DEMO-VENT-02', 'AERON-DEMO-VENT-03'],
    demoUnits: [
      {
        sn: 'AERON-DEMO-VENT-01',
        status: 'พร้อมใช้งาน',
        location: 'สำนักงาน AERON MEDICAL (กรุงเทพฯ)',
        accessories: 'Circuit ผู้ใหญ่ 3 ชุด, Humidifier, Flow Sensor, ขาตั้งโลหะ, กระเป๋ายกเคลื่อนย้าย'
      },
      {
        sn: 'AERON-DEMO-VENT-02',
        status: 'พร้อมใช้งาน',
        location: 'สำนักงาน AERON MEDICAL (กรุงเทพฯ)',
        accessories: 'Circuit ผู้ใหญ่ 2 ชุด, Humidifier, Flow Sensor'
      },
      {
        sn: 'AERON-DEMO-VENT-03',
        status: 'เสีย',
        location: 'สำนักงาน AERON MEDICAL (กรุงเทพฯ)',
        accessories: 'Circuit ผู้ใหญ่ 1 ชุด (รอตรวจสอบ)'
      }
    ],
    description: 'เครื่องช่วยหายใจชนิดควบคุมความดันและปริมาตรสำหรับห้อง ICU ผู้ป่วยวิกฤต'
  },
  {
    id: 'prod-105',
    category: 'ระบบเฝ้าระวังผู้ป่วยวิกฤต (Central Monitor)',
    name: 'AERON CentralStation 32B',
    brand: 'AERON MEDICAL',
    price: 15500000,
    demoUnitsAvailable: 1,
    demoSerialNumbers: ['AERON-DEMO-CM-01'],
    demoUnits: [
      {
        sn: 'AERON-DEMO-CM-01',
        status: 'พร้อมใช้งาน',
        location: 'สำนักงาน AERON MEDICAL (กรุงเทพฯ)',
        accessories: 'Monitor bedside 4 จอ (Demo), Switch Hub, สาย LAN 10 ม., ซอฟต์แวร์ Demo License, Dongle'
      }
    ],
    description: 'ระบบศูนย์รวมเฝ้าระวังผู้ป่วยวิกฤต 32 เตียง เชื่อมต่อสมาร์ทโฟนพยาบาล'
  }
];


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

window.INITIAL_MEMBERS = [
  { id: 'm1', name: 'สมชาย สายลุย', role: 'Sales Specialist', avatar: '👨‍⚕️' },
  { id: 'm2', name: 'สมหญิง ใจดี', role: 'Medical Representative', avatar: '👩‍⚕️' },
  { id: 'm3', name: 'อนันต์ ผู้โชคดี', role: 'Key Account Manager', avatar: '👨‍💼' },
  { id: 'm4', name: 'สุชาติ มุ่งมั่น', role: 'Product Specialist', avatar: '🧑‍💻' }
];

window.INITIAL_PROJECTS = [
  {
    id: 'proj-101',
    hospitalName: 'โรงพยาบาลศิริราช',
    clientType: 'รัฐบาล',
    title: 'จัดซื้อเครื่องตรวจคลื่นหัวใจไฟฟ้า 12 ลีด ชนิดพร้อมวิเคราะห์ผล 5 เครื่อง',
    details: 'โครงการจัดซื้อทดแทนเครื่องเดิมที่หมดอายุการใช้งาน มีข้อกำหนดให้เดโม่ทดสอบสัญญาณในห้อง ER และ CCU',
    assignee: 'สมชาย สายลุย',
    productId: 'prod-101',
    productName: 'AERON Cardio 12L-AI',
    productCategory: 'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
    productBrand: 'AERON MEDICAL',
    quantity: 5,
    budget: 4500000,
    budgetType: 'งบลงทุน',
    budgetTrend: 'ขาขึ้น',
    procurementDate: '2026-09-15',
    demoStatus: 'นัดหมายแล้ว',
    demoStartDate: '2026-08-05',
    demoEndDate: '2026-08-12',
    decisionMakers: 'ศ.ดร.นพ.สมศักดิ์ (หัวหน้าภาควิชา), นพ.วิชัย (ประธานกรรมการจัดซื้อ)',
    dfAmount: '150,000 บาท',
    competitors: 'บริษัท เมดิคอลไบโอ จำกัด (แบรนด์ A), บริษัท สยามเฮลท์ แคร์ จำกัด (แบรนด์ B)',
    winProbability: 80,
    status: 'stage_demo',
    createdDate: '2026-06-10',
    weeklyLogs: [
      { date: '2026-07-05', author: 'สมชาย สายลุย', note: 'เข้าพบคณะกรรมการจัดซื้อ ยื่นเอกสารคุณลักษณะตัวเครื่องเรียบร้อย อาจารย์สมศักดิ์สนใจฟังก์ชัน AI วิเคราะห์กราฟ' },
      { date: '2026-07-18', author: 'สมชาย สายลุย', note: 'ตกลงวันนัดเดโม่เครื่องเป็นวันที่ 5 - 12 ส.ค. 2026 เตรียมเครื่องสาธิต 2 ชุดพร้อมทีมช่าง' }
    ]
  },
  {
    id: 'proj-102',
    hospitalName: 'โรงพยาบาลรามาธิบดี',
    clientType: 'รัฐบาล',
    title: 'โครงการระบบอัลตราซาวด์หลอดเลือดขั้นสูงสำหรับศูนย์หัวใจ',
    details: 'สเปกต้องการโพรบความถี่สูงพิเศษ พร้อมระบบถ่ายทอดภาพ 3D แบบเรียลไทม์',
    assignee: 'สมหญิง ใจดี',
    productId: 'prod-102',
    productName: 'AERON EchoVision 3D Pro',
    productCategory: 'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
    productBrand: 'AERON MEDICAL',
    quantity: 2,
    budget: 8200000,
    budgetType: 'งบประมาณแผ่นดิน',
    budgetTrend: 'ขาขึ้น',
    procurementDate: '2026-10-30',
    demoStatus: 'ยังไม่ได้เข้าเดโม่',
    demoStartDate: '2026-08-20',
    demoEndDate: '2026-08-25',
    decisionMakers: 'พญ.รัตนา (แพทย์เจ้าของไข้หลัก), รศ.นพ.ประเสริฐ',
    dfAmount: '250,000 บาท',
    competitors: 'แบรนด์ Philips (บริษัท อินเตอร์การแพทย์), แบรนด์ GE',
    winProbability: 60,
    status: 'stage_tor',
    createdDate: '2026-07-01',
    weeklyLogs: [
      { date: '2026-07-12', author: 'สมหญิง ใจดี', note: 'เข้าส่งร่าง TOR ดั้งเดิมเปรียบเทียบสเปก อาจารย์รัตนาขอเพิ่มฟังก์ชัน Elastography' }
    ]
  },
  {
    id: 'proj-103',
    hospitalName: 'โรงพยาบาลบำรุงราษฎร์',
    clientType: 'เอกชน',
    title: 'จัดซื้อชุดเตียงผ่าตัดไฟฟ้าอัจฉริยะพร้อมโคมไฟผ่าตัด LED 3 ห้อง',
    details: 'โรงพยาบาลเอกชนงบเร่งด่วน อยู่ระหว่างสั่งซื้อเครื่องกับโรงงานต่างประเทศ',
    assignee: 'อนันต์ ผู้โชคดี',
    productId: 'prod-103',
    productName: 'AERON Operative Table X3',
    productCategory: 'เตียงผ่าตัด & โคมไฟผ่าตัด (Surgical System)',
    productBrand: 'AERON MEDICAL',
    quantity: 3,
    budget: 12000000,
    budgetType: 'งบเงินบำรุง',
    budgetTrend: 'ขาลง',
    procurementDate: '2026-08-10',
    demoStatus: 'เดโม่เสร็จสิ้น',
    demoStartDate: '2026-07-01',
    demoEndDate: '2026-07-07',
    decisionMakers: 'นพ.ชัยวัฒน์ (ผู้อำนวยการฝ่ายการแพทย์), คุณปิยะนันท์ (ฝ่ายจัดซื้อ)',
    dfAmount: '300,000 บาท',
    competitors: 'แบรนด์ Maquet (บริษัท เครื่องมือแพทย์ไทย)',
    winProbability: 98,
    status: 'stage_ordering',
    createdDate: '2026-05-15',
    weeklyLogs: [
      { date: '2026-07-08', author: 'อนันต์ ผู้โชคดี', note: 'เดโม่ผ่านทดสอบดีเยี่ยม ทีมศัลยแพทย์พอใจระบบจดจำสปีดการปรับเตียง' },
      { date: '2026-07-20', author: 'อนันต์ ผู้โชคดี', note: 'เซ็นสัญญาเรียบร้อย เปิด L/C สั่งซื้อสินค้ากับโรงงานประเทศเยอรมนี คาดว่าสินค้าจะเดินทางถึงไทยกลางเดือนหน้า' }
    ]
  },
  {
    id: 'proj-104',
    hospitalName: 'โรงพยาบาลตำรวจ',
    clientType: 'รัฐบาล',
    title: 'เครื่องช่วยหายใจชนิดควบคุมด้วยปริมาตรและความดันสำหรับ ICU',
    details: 'จัดซื้อด้วยวิธี e-Bidding งบประมาณปี 2569 มีการยื่นซองแข่งขัน 4 ราย',
    assignee: 'สุชาติ มุ่งมั่น',
    productId: 'prod-104',
    productName: 'AERON RespiVent V800',
    productCategory: 'เครื่องช่วยหายใจ (Ventilator)',
    productBrand: 'AERON MEDICAL',
    quantity: 4,
    budget: 6000000,
    budgetType: 'งบลงทุน',
    budgetTrend: 'ขาขึ้น',
    procurementDate: '2026-07-28',
    demoStatus: 'เดโม่เสร็จสิ้น',
    demoStartDate: '2026-06-15',
    demoEndDate: '2026-06-20',
    decisionMakers: 'พ.ต.อ.นพ.ธนวัฒน์, พ.ต.ท.หญิง พญ.ดวงใจ',
    dfAmount: '180,000 บาท',
    competitors: 'บริษัท สยามเมด จำกัด, บริษัท โกลบอลไดแอกนอสติกส์',
    winProbability: 100,
    status: 'stage_won',
    createdDate: '2026-05-01',
    weeklyLogs: [
      { date: '2026-07-15', author: 'สุชาติ มุ่งมั่น', note: 'ยื่นเอกสารการเสนอราคาผ่านระบบ e-GP เรียบร้อย รอเปิดซองราคาและประกาศผลชั่วคราว' }
    ]
  },
  {
    id: 'proj-105',
    hospitalName: 'โรงพยาบาลจุฬาลงกรณ์',
    clientType: 'รัฐบาล',
    title: 'โครงการพัฒนาระบบเฝ้าระวังผู้ป่วยวิกฤตแบบศูนย์รวม (Central Monitor System 32 Beds)',
    details: 'ได้รับสนับสนุนจากงบบริจาคจากมูลนิธิเพื่อศูนย์วิกฤต สินค้าถึงไทยแล้ว อยู่ระหว่างติดตั้ง',
    assignee: 'สมชาย สายลุย',
    productId: 'prod-105',
    productName: 'AERON CentralStation 32B',
    productCategory: 'ระบบเฝ้าระวังผู้ป่วยวิกฤต (Central Monitor)',
    productBrand: 'AERON MEDICAL',
    quantity: 1,
    budget: 15500000,
    budgetType: 'งบบริจาค',
    budgetTrend: 'ขาขึ้น',
    procurementDate: '2026-06-01',
    demoStatus: 'เดโม่เสร็จสิ้น',
    demoStartDate: '2026-04-10',
    demoEndDate: '2026-04-20',
    decisionMakers: 'รศ.นพ.อนุสรณ์, พว.ศิริพร (หัวหน้าพยาบาล ICU)',
    dfAmount: '500,000 บาท',
    competitors: 'แบรนด์ Mindray, แบรนด์ Nihon Kohden',
    winProbability: 100,
    status: 'stage_delivery',
    createdDate: '2026-03-01',
    weeklyLogs: [
      { date: '2026-06-10', author: 'สมชาย สายลุย', note: 'ลงนามสัญญาเรียบร้อย สั่งผลิตเครื่องจากสิงคโปร์' },
      { date: '2026-07-21', author: 'สมชาย สายลุย', note: 'นำส่งอุปกรณ์และทีมวิศวกรเข้าติดตั้งระบบ Central Monitor ชั้น 8 ตึกภูมิสิริ นัดเทรนนิ่งการใช้งานพยาบาล 25 ก.ค.' }
    ]
  }
];

window.INITIAL_DEMO_BOOKINGS = [
  {
    id: 'demo-b-1',
    projectId: 'proj-101',
    hospitalName: 'โรงพยาบาลศิริราช',
    department: 'แผนกอายุรกรรม / ER ชั้น 3',
    productId: 'prod-101',
    productName: 'AERON Cardio 12L-AI',
    productCategory: 'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
    demoSerial: 'AERON-DEMO-ECG-01',
    salesPerson: 'สมชาย สายลุย',
    driverName: 'นายวิชัย จัดส่ง',
    startDate: '2026-08-05',
    endDate: '2026-08-12',
    status: 'อนุมัติคิว',
    note: 'สาธิตเครื่อง ณ ห้อง ER และ CCU ชั้น 3',

    checklistItems: [
      { id: 'cli-1', name: 'ตัวเครื่องหลัก AERON Cardio 12L-AI', qty: 1, unit: 'เครื่อง', serialNo: 'SN-ECG-1001', condition: 'สมบูรณ์', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60', note: 'ตรวจเช็ค QC พร้อมใช้งาน' },
      { id: 'cli-2', name: 'สายไฟหลัก Power Cord & AC Adapter', qty: 1, unit: 'ชุด', serialNo: 'PWR-2026-01', condition: 'สมบูรณ์', image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&auto=format&fit=crop&q=60', note: 'สายสภาพดีไม่มีรอยไหม้' },
      { id: 'cli-3', name: 'สายสัญญาณ Patient Cable 10-Lead Wire', qty: 1, unit: 'ชุด', serialNo: 'PAT-CAB-12', condition: 'สมบูรณ์', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=60', note: 'หัวต่อพินครบถ้วน' },
      { id: 'cli-4', name: 'ลีดดูดสูญญากาศ Chest Electrodes Bulb Set', qty: 6, unit: 'ลูก', serialNo: '-', condition: 'สมบูรณ์', image: '', note: 'ยางดูดนิ่มไม่มีรอยแตก' },
      { id: 'cli-5', name: 'คลิปหนีบแขนขา Limb Clamps Set', qty: 4, unit: 'ชิ้น', serialNo: '-', condition: 'สมบูรณ์', image: '', note: 'สปริงแน่นดี' },
      { id: 'cli-6', name: 'กระดาษบันทึกคลื่นหัวใจ Thermal Paper Roll', qty: 3, unit: 'ม้วน', serialNo: '-', condition: 'สมบูรณ์', image: '', note: 'แถมม้วนสำรอง 2 ม้วน' },
      { id: 'cli-7', name: 'กระเป๋าอลูมิเนียมใส่อุปกรณ์ Hard Case', qty: 1, unit: 'ใบ', serialNo: 'CASE-01', condition: 'มีรอยเล็กน้อย', image: '', note: 'มีรอยขีดข่วนภายนอกเล็กน้อย' }
    ],

    checkpoints: {
      cp1_warehouse_out: {
        completed: true,
        completedAt: '2026-08-05 08:30',
        inspectorName: 'นายวิชาญ (เจ้าหน้าที่คลังสินค้า)',
        driverName: 'นายวิชัย จัดส่ง',
        notes: 'ตรวจเช็คอุปกรณ์ครบถ้วนตามรายการ 7 รายการ พร้อมส่งมอบ',
        photos: [
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60'
        ]
      },
      cp2_hospital_handover: {
        completed: true,
        completedAt: '2026-08-05 10:15',
        receiverName: 'พว. สมศรี ใจเย็น',
        receiverPosition: 'หัวหน้าพยาบาลประจำห้อง ER',
        handoverPerson: 'สมชาย สายลุย (Sales Specialist)',
        notes: 'สาธิตการใช้งานและทดลองตรวจคลื่นหัวใจตัวอย่าง เรียบร้อยครบถ้วน',
        photos: [
          'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=60'
        ],
        signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 50 Q 50 10 90 50 T 170 50" fill="none" stroke="%233b82f6" stroke-width="3"/></svg>'
      },
      cp3_hospital_pickup: {
        completed: false,
        completedAt: '',
        returnerName: 'พว. สมศรี ใจเย็น',
        notes: '',
        photos: [],
        signature: ''
      },
      cp4_warehouse_in: {
        completed: false,
        completedAt: '',
        warehouseKeeper: 'นายวิชาญ (เจ้าหน้าที่คลังสินค้า)',
        notes: '',
        photos: [],
        signature: ''
      }
    }
  },
  {
    id: 'demo-b-2',
    projectId: 'proj-102',
    hospitalName: 'โรงพยาบาลรามาธิบดี',
    department: 'แผนกอัลตราซาวด์ / รังสีวิทยา',
    productId: 'prod-102',
    productName: 'AERON EchoVision 3D Pro',
    productCategory: 'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
    demoSerial: 'AERON-DEMO-US-01',
    salesPerson: 'สมหญิง ใจดี',
    driverName: 'นายประสิทธิ์ ขนส่ง',
    startDate: '2026-08-20',
    endDate: '2026-08-25',
    status: 'รออนุมัติพิเศษ',
    note: 'ขอเครื่องตัวโพรบความถี่สูงพิเศษ',

    checklistItems: [
      { id: 'cli-201', name: 'เครื่องอัลตราซาวด์ AERON EchoVision 3D Main Console', qty: 1, unit: 'เครื่อง', serialNo: 'SN-US-3001', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'cli-202', name: 'หัวตรวจ Convex Probe (C5-2)', qty: 1, unit: 'หัว', serialNo: 'SN-PRB-CX01', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'cli-203', name: 'หัวตรวจ Linear Probe (L12-4)', qty: 1, unit: 'หัว', serialNo: 'SN-PRB-LN02', condition: 'สมบูรณ์', image: '', note: '' },
      { id: 'cli-204', name: 'เจลอัลตราซาวด์ Ultrasound Gel 5kg', qty: 1, unit: 'แกลลอน', serialNo: '-', condition: 'สมบูรณ์', image: '', note: '' }
    ],

    checkpoints: {
      cp1_warehouse_out: { completed: false, completedAt: '', inspectorName: '', driverName: '', notes: '', photos: [] },
      cp2_hospital_handover: { completed: false, completedAt: '', receiverName: '', receiverPosition: '', handoverPerson: '', notes: '', photos: [], signature: '' },
      cp3_hospital_pickup: { completed: false, completedAt: '', returnerName: '', notes: '', photos: [], signature: '' },
      cp4_warehouse_in: { completed: false, completedAt: '', warehouseKeeper: '', notes: '', photos: [], signature: '' }
    }
  }
];

// --------------------------------------------------
// Vendor List (ผู้ผลิต/จำหน่ายสินค้า)
// --------------------------------------------------
window.VENDOR_LIST = [
  { id: 'vendor-01', name: 'AERON MEDICAL Co., Ltd.', country: 'ไทย', currency: 'THB', contactPerson: 'ฝ่ายจัดซื้อ', email: 'procurement@aeronmedical.co.th' },
  { id: 'vendor-02', name: 'Drager Medical GmbH', country: 'เยอรมนี', currency: 'EUR', contactPerson: 'Mr. Klaus Mueller', email: 'asia-sales@draeger.com' },
  { id: 'vendor-03', name: 'Philips Healthcare BV', country: 'เนเธอร์แลนด์', currency: 'EUR', contactPerson: 'Ms. Sarah de Vries', email: 'asia.health@philips.com' },
  { id: 'vendor-04', name: 'GE HealthCare Technologies', country: 'สหรัฐอเมริกา', currency: 'USD', contactPerson: 'Mr. James Wang', email: 'apac@gehealthcare.com' },
  { id: 'vendor-05', name: 'Mindray Medical International', country: 'จีน', currency: 'USD', contactPerson: 'Ms. Li Hua', email: 'international@mindray.com' },
  { id: 'vendor-06', name: 'Nihon Kohden Corporation', country: 'ญี่ปุ่น', currency: 'JPY', contactPerson: 'Mr. Tanaka Hiroshi', email: 'global@nihonkohden.com' }
];

window.PO_STATUSES = [
  'ร่าง PO',
  'รออนุมัติ',
  'อนุมัติแล้ว',
  'ส่ง PO ให้ Vendor',
  'Vendor ยืนยันรับ PO',
  'รอผลิต / รอของ',
  'สินค้าถึงไทย',
  'รับสินค้าแล้ว'
];

// --------------------------------------------------
// Initial Purchase Orders (ใบสั่งซื้อตัวอย่าง)
// --------------------------------------------------
window.INITIAL_PURCHASE_ORDERS = [
  {
    id: 'po-2026-001',
    poNumber: 'PO-2026-001',
    year: 2026,
    projectId: 'proj-103',
    hospitalName: 'โรงพยาบาลบำรุงราษฎร์',
    vendorId: 'vendor-02',
    vendorName: 'Drager Medical GmbH',
    vendorCountry: 'เยอรมนี',
    currency: 'EUR',
    productId: 'prod-103',
    productName: 'AERON Operative Table X3',
    productCategory: 'เตียงผ่าตัด & โคมไฟผ่าตัด (Surgical System)',
    quantity: 3,
    unitPrice: 110000,
    totalAmountFX: 330000,
    exchangeRate: 37.5,
    totalAmountTHB: 12375000,
    poDate: '2026-07-22',
    expectedDelivery: '2026-09-30',
    status: 'Vendor ยืนยันรับ PO',
    note: 'สั่งซื้อหลังเซ็นสัญญากับ รพ.บำรุงราษฎร์ เครื่องผลิตที่เยอรมนี เดินทางทางเรือผ่านสิงคโปร์'
  },
  {
    id: 'po-2026-002',
    poNumber: 'PO-2026-002',
    year: 2026,
    projectId: 'proj-105',
    hospitalName: 'โรงพยาบาลจุฬาลงกรณ์',
    vendorId: 'vendor-05',
    vendorName: 'Mindray Medical International',
    vendorCountry: 'จีน',
    currency: 'USD',
    productId: 'prod-105',
    productName: 'AERON CentralStation 32B',
    productCategory: 'ระบบเฝ้าระวังผู้ป่วยวิกฤต (Central Monitor)',
    quantity: 1,
    unitPrice: 430000,
    totalAmountFX: 430000,
    exchangeRate: 36.2,
    totalAmountTHB: 15566000,
    poDate: '2026-06-15',
    expectedDelivery: '2026-07-20',
    status: 'รับสินค้าแล้ว',
    note: 'สั่งผลิตระบบ Central Monitor พร้อม Bedside Monitor จากสิงคโปร์ Office ของ Mindray ส่งถึงไทยแล้ว'
  },
  {
    id: 'po-2025-001',
    poNumber: 'PO-2025-001',
    year: 2025,
    projectId: '',
    hospitalName: 'โรงพยาบาลสงขลานครินทร์',
    vendorId: 'vendor-06',
    vendorName: 'Nihon Kohden Corporation',
    vendorCountry: 'ญี่ปุ่น',
    currency: 'JPY',
    productId: 'prod-101',
    productName: 'ECG Monitor 3-lead Bedside',
    productCategory: 'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
    quantity: 10,
    unitPrice: 450000,
    totalAmountFX: 4500000,
    exchangeRate: 0.24,
    totalAmountTHB: 1080000,
    poDate: '2025-11-10',
    expectedDelivery: '2026-01-15',
    status: 'รับสินค้าแล้ว',
    note: 'งานปีงบประมาณ 2568 สั่งซื้อจาก Nihon Kohden Japan ผ่านตัวแทน'
  }
];

// --------------------------------------------------
// Repair & Service Constants and Initial Tickets
// --------------------------------------------------
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

window.INITIAL_REPAIR_TICKETS = [
  {
    id: 'rep-101',
    ticketNumber: 'REP-2026-001',
    productCategory: 'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
    productName: 'AERON EchoVision 3D Pro',
    sn: 'AERON-DEMO-US-02',
    repairedItems: 'หัวโพรบความถี่สูง (Linear Probe) + สายสัญญาณตัวหลัก',
    issueDescription: 'หัวโพรบตรวจไม่พบสัญญาณภาพ และพอร์ตเชื่อมต่อมีคราบออกไซด์',
    lastHospital: 'โรงพยาบาลศิริราช (แผนกสูตินรีเวช)',
    lastUser: 'พญ.สมศรี / พยาบาล CCU',
    salesPerson: 'สมหญิง ใจดี',
    repairVendor: 'AERON Service Center (กรุงเทพฯ)',
    sentDate: '2026-07-10',
    returnedDate: '2026-07-28',
    repairCost: 45000,
    shippingCost: 2500,
    category: 'สินค้า Demo',
    status: 'ส่งซ่อมอยู่',
    location: 'ศูนย์ซ่อม AERON Service Center (กรุงเทพฯ)'
  },
  {
    id: 'rep-102',
    ticketNumber: 'REP-2026-002',
    productCategory: 'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
    productName: 'AERON Cardio 12L-AI',
    sn: 'AERON-DEMO-ECG-03',
    repairedItems: 'ชุดแผงวงจรหลัก Power Board + สาย Lead 10 เส้น',
    issueDescription: 'เครื่องชาร์จไฟไม่เข้า และหน้าจอแสดงผลวูบเป็นระยะ',
    lastHospital: 'โรงพยาบาลตำรวจ',
    lastUser: 'พ.ต.อ.นพ.ธนวัฒน์ / พยาบาล ER',
    salesPerson: 'สุชาติ มุ่งมั่น',
    repairVendor: 'Nihon Kohden Japan (ส่งเคลมต่างประเทศ)',
    sentDate: '2026-06-20',
    returnedDate: '2026-07-15',
    repairCost: 0,
    shippingCost: 8500,
    category: 'สินค้าอยู่ในประกันของ บริษัท',
    status: 'ซ่อมเสร็จแล้ว',
    location: 'คลังสินค้าส่วนกลาง AERON (พร้อมส่งคืน)'
  }
];

// --------------------------------------------------
// Delivered / Sold Products Mock Data
// --------------------------------------------------
window.INITIAL_SOLD_PRODUCTS = [
  {
    id: 'sold-101',
    assetNumber: 'AST-2026-001',
    contractNumber: 'PO-HOSP-2026/045',
    projectId: 'proj-104',
    hospitalName: 'โรงพยาบาลภูมิพลอดุลยเดช',
    department: 'แผนกห้องผ่าตัดใหญ่ (OR-3)',
    productName: 'AERON EchoVision 3D Pro',
    brand: 'AERON MEDICAL',
    productCategory: 'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
    serialNumber: 'SN-AERON-US3D-202604',
    freebies: 'กระดาษพิมพ์ภาพอัลตราซาวด์ 15 ม้วน, Gel ถุง 5 ลิตร 2 ถุง, แท่นวางโพรบสำรอง, ปลั๊กกันไฟกระชาก',
    salesPerson: 'ณรงค์วิทย์ ศิริกุล',
    contactPerson: 'นพ.อนุรักษ์ (หัวหน้าห้องผ่าตัด)',
    deliveryDate: '2026-06-15',
    projectValue: 4200000,
    dfAmount: '120,000 บาท',
    bidGuaranteeAmount: 210000, // 5% of 4.2M
    bidGuaranteeRefundDate: '2026-12-15', // 6 months after delivery
    warrantyYears: 2,
    warrantyExpiryDate: '2028-06-15',
    nextPmDate: '2026-12-15', // Every 6 months
    pmFrequency: 'ทุก 6 เดือน (ปีละ 2 ครั้ง)',
    pmStatus: '⏳ ถึงกำหนดทำ PM',
    status: 'รับมอบเรียบร้อย'
  },
  {
    id: 'sold-102',
    assetNumber: 'AST-2025-089',
    contractNumber: 'PO-HOSP-2025/112',
    projectId: 'proj-101',
    hospitalName: 'โรงพยาบาลศิริราช',
    department: 'แผนกศูนย์หัวใจและหลอดเลือด (CCU)',
    productName: 'AERON Cardio 12L-AI',
    brand: 'AERON MEDICAL',
    productCategory: 'เครื่องตรวจคลื่นหัวใจ (ECG/EKG)',
    serialNumber: 'SN-AERON-ECG-202588',
    freebies: 'แผ่นบันทึก ECG 20 ม้วน, สาย Lead 10 เส้นสำรอง 2 ชุด, รถเข็นสแตนเลสปรับระดับได้',
    salesPerson: 'สมหญิง ใจดี',
    contactPerson: 'ศ.ดร.นพ.สมศักดิ์ / พยาบาล CCU',
    deliveryDate: '2025-11-20',
    projectValue: 4500000,
    dfAmount: '150,000 บาท',
    bidGuaranteeAmount: 225000, // 5% of 4.5M
    bidGuaranteeRefundDate: '2026-05-20',
    warrantyYears: 1,
    warrantyExpiryDate: '2026-11-20',
    nextPmDate: '2026-11-20',
    pmFrequency: 'ทุก 6 เดือน (ปีละ 2 ครั้ง)',
    pmStatus: '✅ ทำ PM แล้ว',
    status: 'รับมอบเรียบร้อย'
  }
];

// --------------------------------------------------
// Import Logistics & Shipment Tracking Constants & Initial Mock Data
// --------------------------------------------------
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
  '✈️ ทางอากาศ (Air Freight)',
  '🚢 ทางเรือ (Sea Freight)',
  '🚛 ทางบก (Land Transport)'
];

window.INITIAL_SHIPMENTS = [
  {
    id: 'shp-101',
    shipmentNumber: 'SHP-2026-001',
    poNumber: 'PO-2026-104',
    poId: 'po-2026-104',
    productName: 'AERON EchoVision 3D Pro',
    productCategory: 'ระบบเครื่องอัลตราซาวด์ (Ultrasound)',
    quantity: 1,
    vendorName: 'Mindray Medical Singapore',
    vendorCountry: 'สิงคโปร์',
    hospitalDestination: 'โรงพยาบาลภูมิพลอดุลยเดช (OR-3)',
    shippingCompany: 'DHL Global Forwarding',
    trackingNumber: 'AWB-8839201948',
    cbm: 2.8,
    grossWeight: 185.0,
    transportType: '✈️ ทางอากาศ (Air Freight)',
    shippingCost: 45000,
    dutyTaxes: 18500,
    customsBroker: 'V-Cargo Logistics (Thailand)',
    etd: '2026-07-15',
    eta: '2026-07-25',
    status: 'ระหว่างขนส่ง',
    notes: 'เที่ยวบิน TG-921 บรรจุในพาเลทไม้มาตรฐานส่งออกพร้อมเอกสารใบรับรอง COO'
  },
  {
    id: 'shp-102',
    shipmentNumber: 'SHP-2026-002',
    poNumber: 'PO-2026-105',
    poId: 'po-2026-105',
    productName: 'AERON CentralStation 32B',
    productCategory: 'ระบบเฝ้าระวังผู้ป่วยวิกฤต (Central Monitor)',
    quantity: 1,
    vendorName: 'Mindray Medical Singapore',
    vendorCountry: 'สิงคโปร์',
    hospitalDestination: 'โรงพยาบาลตำรวจ (ICU)',
    shippingCompany: 'Kuehne + Nagel Logistics',
    trackingNumber: 'BL-KN-9920145',
    cbm: 4.5,
    grossWeight: 340.0,
    transportType: '🚢 ทางเรือ (Sea Freight)',
    shippingCost: 28000,
    dutyTaxes: 12000,
    customsBroker: 'Siam Shipping Customs Clearance',
    etd: '2026-07-01',
    eta: '2026-07-20',
    status: 'ถึงประเทศไทย รอออกของ',
    notes: 'ตู้คอนเทนเนอร์ลงที่ท่าเรือแหลมฉบัง กำลังผ่านพิธีการศุลกากรกระทรวงสาธารณสุข'
  }
];

// --------------------------------------------------
// Thai FDA Registration Constants & Initial Mock Data
// --------------------------------------------------
window.FDA_CLASSES = [
  {
    code: 'Class 1',
    label: 'Class 1 (ความเสี่ยงต่ำ / ใบรับจดแจ้ง)',
    targetDays: 30,
    description: 'ใช้เวลาประมาณ 30 วันทำการ'
  },
  {
    code: 'Class 2',
    label: 'Class 2 (ความเสี่ยงปานกลางระดับต่ำ / ใบรับแจ้งรายการละเอียด)',
    targetDays: 120,
    description: 'ใช้เวลาประมาณ 90 – 150 วันทำการ (เกณฑ์มาตรฐาน 120 วัน)'
  },
  {
    code: 'Class 3',
    label: 'Class 3 (ความเสี่ยงปานกลางระดับสูง / ใบรับแจ้งรายการละเอียด)',
    targetDays: 180,
    description: 'ใช้เวลาประมาณ 150 – 200 วันทำการ (เกณฑ์มาตรฐาน 180 วัน)'
  },
  {
    code: 'Class 4',
    label: 'Class 4 (ความเสี่ยงสูง / ใบอนุญาต)',
    targetDays: 300,
    description: 'ใช้เวลาประมาณ 250 – 350 วันทำการ (เกณฑ์มาตรฐาน 300 วัน)'
  }
];

window.FDA_STATUSES = [
  'รอเตรียมเอกสาร & แปล',
  'ยื่นคำขอแล้ว รอประเมิน',
  'อยู่ระหว่างแก้ไขตามสั่ง อย.',
  'อนุมัติใบอนุญาตแล้ว',
  'ยื่นขอต่ออายุ'
];

window.INITIAL_FDA_REGISTRATIONS = [
  {
    id: 'fda-101',
    registrationNumber: 'FDA-2026-001',
    fdaLicenseNo: '65-1-2-2-0008891',
    productName: 'AERON EchoVision 3D Pro',
    brand: 'AERON MEDICAL',
    vendorName: 'Mindray Medical Singapore',
    deviceClass: 'Class 3',
    targetDays: 180,
    agencyName: 'Pharmatech FDA Consulting Co., Ltd.',
    raSpecialist: 'ภก. วิศรุต ธรรมรักษ์ (In-House RA Specialist)',
    costTHB: 125000,
    submissionType: 'ยื่นขอใหม่',
    paymentDate: '2026-01-15',
    approvalDate: '2026-06-30',
    expiryDate: '2026-11-15', // Near expiry (< 6 months, trigger orange alert)
    status: 'อนุมัติใบอนุญาตแล้ว',
    notes: 'อนุมัติผ่านระบบ E-Submission กระทรวงสาธารณสุขเรียบร้อย เตรียมยื่นต่ออายุ 6 เดือนล่วงหน้า'
  },
  {
    id: 'fda-102',
    registrationNumber: 'FDA-2026-002',
    fdaLicenseNo: 'รออนุมัติเลขใบรับจดแจ้ง',
    productName: 'AERON Portable ECG Sensor 12L',
    brand: 'AERON MEDICAL',
    vendorName: 'Shenzhen Bio-Tech Corporation',
    deviceClass: 'Class 1',
    targetDays: 30,
    agencyName: 'BioMed Compliance Services',
    raSpecialist: 'คุณนพดล สุขประเสริฐ',
    costTHB: 35000,
    submissionType: 'ยื่นขอใหม่',
    paymentDate: '2026-05-10', // Submitted May 10, now July 22 -> >30 working days -> OVERDUE RED ALERT!
    approvalDate: '',
    expiryDate: '',
    status: 'ยื่นคำขอแล้ว รอประเมิน',
    notes: 'ยื่นจดแจ้งผ่านระบบ E-Submission กำลังติดตามผลการตรวจสอบเอกสารจากเจ้าหน้าที่ อย.'
  },
  {
    id: 'fda-103',
    registrationNumber: 'FDA-2026-003',
    fdaLicenseNo: 'รออนุมัติใบอนุญาต Class 4',
    productName: 'AERON Ventilator ICU Master Pro',
    brand: 'AERON MEDICAL',
    vendorName: 'Germany MedTech GmbH',
    deviceClass: 'Class 4',
    targetDays: 300,
    agencyName: 'Global MedDevice Registration Ltd.',
    raSpecialist: 'ภก. วิศรุต ธรรมรักษ์',
    costTHB: 280000,
    submissionType: 'ยื่นขอใหม่',
    paymentDate: '2025-11-01', // Elapsed ~170 working days -> >= 70% SLA threshold -> WARNING YELLOW ALERT!
    approvalDate: '',
    expiryDate: '',
    status: 'อยู่ระหว่างแก้ไขตามสั่ง อย.',
    notes: 'เจ้าหน้าที่ อย. ขอเอกสารผลการทดสอบ Electrical Safety IEC 60601 เพิ่มเติม'
  }
];

window.INITIAL_COST_CALCULATIONS = [
  {
    id: 'calc-101',
    projectId: 'proj-101',
    date: '2026-07-24',
    projectName: 'Mini C arm ราชบุรี (ศิริราช)',
    sellingPriceInVat: 4500000,
    costInVat: 3240000,
    dfType: 'percent',
    dfValue: 7, // 7%
    dfMissing: false,
    salesCommPercent: 0.25, // From user sample table (0.25%)
    interestPercent: 7.0, // 7% of Cost In VAT
    taxPercent: 20.0, // 20% of Margin Ex VAT
    retentionPercent: 5.0, // 5% of Sale Ex VAT
    note: 'เคสตัวอย่างคำนวณต้นทุน Mini C arm'
  },
  {
    id: 'calc-102',
    projectId: 'proj-103',
    date: '2026-07-20',
    projectName: 'เตียงผ่าตัด รพ.บำรุงราษฎร์',
    sellingPriceInVat: 12000000,
    costInVat: 7800000,
    dfType: 'amount',
    dfValue: 300000,
    dfMissing: false,
    salesCommPercent: 2.0,
    interestPercent: 7.0,
    taxPercent: 20.0,
    retentionPercent: 5.0,
    note: 'โครงการชนะงาน กำไรสุทธิสูงกว่า 18%'
  }
];

window.INITIAL_ACCOUNTS = [
  {
    id: 'acc-1',
    username: 'owner',
    password: '1234',
    fullName: 'คุณตู้ (เจ้าของบริษัท / Owner)',
    role: 'owner',
    roleLabel: '👑 เจ้าของบริษัท (Owner)',
    salesMemberId: null,
    avatar: '👑'
  },
  {
    id: 'acc-2',
    username: 'admin_lead',
    password: '1234',
    fullName: 'คุณวิศรุต (หัวหน้า Admin)',
    role: 'admin_lead',
    roleLabel: '🛡️ หัวหน้า Admin (Admin Lead)',
    salesMemberId: null,
    avatar: '🛡️'
  },
  {
    id: 'acc-3',
    username: 'admin',
    password: '1234',
    fullName: 'คุณเมย์ (Admin)',
    role: 'admin',
    roleLabel: '📋 Admin (ดูข้อมูลทั่วไป)',
    salesMemberId: null,
    avatar: '📋'
  },
  {
    id: 'acc-4',
    username: 'sales_lead',
    password: '1234',
    fullName: 'สมชาย สายลุย (หัวหน้า Sales)',
    role: 'sales_lead',
    roleLabel: '⭐ หัวหน้า Sales (Sales Lead)',
    salesMemberId: 'm1',
    avatar: '👨‍💼'
  },
  {
    id: 'acc-5',
    username: 'sales2',
    password: '1234',
    fullName: 'สมหญิง จริงใจ',
    role: 'sales',
    roleLabel: '💼 Sales Specialist',
    salesMemberId: 'm2',
    avatar: '👩‍💼'
  },
  {
    id: 'acc-6',
    username: 'sales3',
    password: '1234',
    fullName: 'วิชัย ใจดี',
    role: 'sales',
    roleLabel: '💼 Key Account Manager',
    salesMemberId: 'm3',
    avatar: '👨‍💼'
  },
  {
    id: 'acc-7',
    username: 'sales4',
    password: '1234',
    fullName: 'เกศรา พรประเสริฐ',
    role: 'sales',
    roleLabel: '💼 Product Specialist',
    salesMemberId: 'm4',
    avatar: '👩‍💼'
  }
];

window.INITIAL_ACTIVITY_LOGS = [
  {
    id: 'log-101',
    timestamp: '2026-07-24 13:30:00',
    username: 'owner',
    fullName: 'คุณตู้ (เจ้าของบริษัท / Owner)',
    role: 'owner',
    action: '🔐 เข้าสู่ระบบ',
    target: 'ระบบ AERON MEDICAL Tracker',
    details: 'เข้าสู่ระบบสำเร็จจากที่ตั้งสำนักงานใหญ่'
  },
  {
    id: 'log-102',
    timestamp: '2026-07-24 12:15:20',
    username: 'sales_lead',
    fullName: 'สมชาย สายลุย (หัวหน้า Sales)',
    role: 'sales_lead',
    action: '🎙️ อัดเสียงอัปเดตงาน',
    target: 'โครงการ Mini C arm ราชบุรี (ศิริราช)',
    details: 'บันทึกอัปเดตเสียงสำเร็จพร้อมสรุปรายงานด้วย AI'
  },
  {
    id: 'log-103',
    timestamp: '2026-07-24 10:45:10',
    username: 'admin_lead',
    fullName: 'คุณวิศรุต (หัวหน้า Admin)',
    role: 'admin_lead',
    action: '✏️ แก้ไขสถานะใบสั่งซื้อ PO',
    target: 'PO-2026-001 (Germany MedTech)',
    details: 'อัปเดตสถานะเป็น "จัดส่งเรียบร้อย"'
  }
];

window.INITIAL_LEAVE_REQUESTS = [
  {
    id: 'leave-101',
    employeeName: 'สมหญิง จริงใจ',
    leaveType: '🤒 ลาป่วย',
    startDate: '2026-07-28',
    endDate: '2026-07-29',
    totalDays: 2,
    reason: 'เป็นไข้หวัดใหญ่ มีใบรับรองแพทย์จาก รพ.กรุงเทพ',
    attachment: '',
    status: '✅ อนุมัติแล้ว',
    approvedBy: 'คุณตู้ (เจ้าของบริษัท / Owner)',
    createdAt: '2026-07-27 09:15'
  },
  {
    id: 'leave-102',
    employeeName: 'วิชัย ใจดี',
    leaveType: '🌴 ลากิจ',
    startDate: '2026-08-05',
    endDate: '2026-08-05',
    totalDays: 1,
    reason: 'ติดต่อทำธุรกรรมโอนที่ดิน ณ กรมที่ดิน',
    attachment: '',
    status: '⏳ รออนุมัติ',
    approvedBy: '',
    createdAt: '2026-07-29 14:20'
  },
  {
    id: 'leave-103',
    employeeName: 'สมชาย สายลุย (หัวหน้า Sales)',
    leaveType: '🏖️ ลาพักร้อน',
    startDate: '2026-08-12',
    endDate: '2026-08-14',
    totalDays: 3,
    reason: 'ลาพักผ่อนประจำปีกับครอบครัว ต่างจังหวัด',
    attachment: '',
    status: '✅ อนุมัติแล้ว',
    approvedBy: 'คุณตู้ (เจ้าของบริษัท / Owner)',
    createdAt: '2026-07-20 11:00'
  }
];

window.INITIAL_ATTENDANCE_LOGS = [
  {
    id: 'att-101',
    employeeName: 'เกศรา พรประเสริฐ',
    date: '2026-07-28',
    type: '⏰ มาสาย',
    lateMinutes: 35,
    fineAmount: 175,
    note: 'รถติดหนักเนื่องจากฝนตกและอุบัติเหตุบนถนนวิภาวดี'
  },
  {
    id: 'att-102',
    employeeName: 'วิชัย ใจดี',
    date: '2026-07-25',
    type: '🚫 ขาดงาน',
    lateMinutes: 0,
    fineAmount: 1000,
    note: 'ไม่ได้แจ้งลาล่วงหน้า ไม่สามารถติดต่อได้ในวันปฏิบัติการ'
  }
];

window.INITIAL_MESSENGER_TRIPS = [
  {
    id: 'msg-101',
    date: '2026-07-29',
    messengerName: 'สมพงษ์ วิ่งไว (Messenger)',
    origin: 'คลังสินค้า AERON สำนักงานใหญ่ (วิภาวดี)',
    destination: 'รพ.ศิริราช (ตึกสยามินทร์)',
    items: 'ส่งเอกสารประมูลงาน Mini C-arm และซองเสนอราคา',
    distanceKm: 18.5,
    isHoliday: false,
    feeAmount: 40,
    note: 'ส่งถึงมือหน้าห้องพัสดุเรียบร้อย'
  },
  {
    id: 'msg-102',
    date: '2026-07-28',
    messengerName: 'สมพงษ์ วิ่งไว (Messenger)',
    origin: 'คลังสินค้า AERON สำนักงานใหญ่',
    destination: 'ศูนย์บริการทางการแพทย์ รพ.ชลบุรี',
    items: 'จัดส่งเครื่อง Demo Ultrasound และอุปกรณ์เสริม',
    distanceKm: 85,
    isHoliday: false,
    feeAmount: 80,
    note: 'เครื่องส่งถึง รพ. เรียบร้อย'
  },
  {
    id: 'msg-103',
    date: '2026-07-26',
    messengerName: 'อนุชา ขับด่วน (Messenger)',
    origin: 'คลังสินค้า AERON สำนักงานใหญ่',
    destination: 'รพ.มหาราชนครราชสีมา',
    items: 'ส่งด่วนอะไหล่เครื่อง ECG เปลี่ยนฉุกเฉินวันอาทิตย์',
    distanceKm: 255,
    isHoliday: true,
    feeAmount: 100,
    note: 'วิ่งงานวันหยุดเสาร์-อาทิตย์'
  },
  {
    id: 'msg-104',
    date: '2026-07-24',
    messengerName: 'อนุชา ขับด่วน (Messenger)',
    origin: 'คลังสินค้า AERON สำนักงานใหญ่',
    destination: 'รพ.ศูนย์ขอนแก่น',
    items: 'ขนส่งอุปกรณ์ตรวจวัดสัญญาณชีพ 5 เครื่อง',
    distanceKm: 445,
    isHoliday: false,
    feeAmount: 200,
    note: 'วิ่งข้ามจังหวัดไกลเกิน 150 กม.'
  }
];






window.INITIAL_ACCOUNTING_TRANSACTIONS = [
  {
    "id": "TXN-202608-001",
    "date": "2026-06-28",
    "title": "เงินเดือนปจด. 6/69 พงศธร",
    "expense_type": "เงินเดือนเซลล์",
    "account_type": "Aeron Kbank ออมทรัพย์",
    "amount": 22800.00,
    "withholding_tax": 684.00,
    "social_security": 0.00,
    "loan_for_employee": 0.00,
    "net_transfer": 22116.00,
    "payee": "พงศธร",
    "transaction_type": "รายจ่าย",
    "off_book_expense": false,
    "hospital_name": "คณะแพทย์ศาสตร์ มหิดล",
    "notes": "KBANK T26-2-39079-5"
  },
  {
    "id": "TXN-202608-002",
    "date": "2026-07-05",
    "title": "รับชำระค่างวดที่ 1 โครงการ ultrasound ศิริราช",
    "expense_type": "รายได้จากการขายเครื่องมือแพทย์",
    "account_type": "Aeron Kbank ออมทรัพย์",
    "amount": 1500000.00,
    "withholding_tax": 15000.00,
    "social_security": 0.00,
    "loan_for_employee": 0.00,
    "net_transfer": 1485000.00,
    "payee": "โรงพยาบาลศิริราช",
    "transaction_type": "รายรับ",
    "off_book_expense": false,
    "hospital_name": "โรงพยาบาลศิริราช",
    "notes": "ใบเสร็จรับเงินเลขที่ RE-2026-042"
  },
  {
    "id": "TXN-202608-003",
    "date": "2026-07-10",
    "title": "ค่าคอมมิชชั่นเซลล์ สมชาย โครงการจุฬา",
    "expense_type": "คอมมิชชั่นเซลล์",
    "account_type": "Aeron SCB ออมทรัพย์",
    "amount": 45000.00,
    "withholding_tax": 1350.00,
    "social_security": 0.00,
    "loan_for_employee": 0.00,
    "net_transfer": 43650.00,
    "payee": "สมชาย สายลุย",
    "transaction_type": "รายจ่าย",
    "off_book_expense": false,
    "hospital_name": "โรงพยาบาลจุฬาลงกรณ์",
    "notes": "หักภาษี ณ ที่จ่าย 3%"
  },
  {
    "id": "TXN-202608-004",
    "date": "2026-07-15",
    "title": "ค่าธรรมเนียมแพทย์ DF อ.รัตนา",
    "expense_type": "ค่าธรรมเนียมแพทย์ (DF)",
    "account_type": "เงินสดสำรองจ่าย - คุณตู้ (Petty Cash)",
    "amount": 12000.00,
    "withholding_tax": 0.00,
    "social_security": 0.00,
    "loan_for_employee": 0.00,
    "net_transfer": 12000.00,
    "payee": "อาจารย์รัตนา",
    "transaction_type": "รายจ่าย",
    "off_book_expense": true,
    "hospital_name": "โรงพยาบาลรามาธิบดี",
    "notes": "เบิกเงินสดสำรองจ่าย Off-book"
  },
  {
    "id": "TXN-202608-005",
    "date": "2026-07-20",
    "title": "ชำระค่าสินค้า Vendor สั่งนำเข้าตู้แช่จากเยอรมนี",
    "expense_type": "ต้นทุนสินค้า Vendor",
    "account_type": "Aeron Kbank กระแสรายวัน",
    "amount": 850000.00,
    "withholding_tax": 0.00,
    "social_security": 0.00,
    "loan_for_employee": 0.00,
    "net_transfer": 850000.00,
    "payee": "Medical Supply Overseas Ltd.",
    "transaction_type": "รายจ่าย",
    "off_book_expense": false,
    "hospital_name": "โรงพยาบาลตำรวจ",
    "notes": "โอนเงินชำระค่า PO-2026-012"
  }
];

window.INITIAL_ACCOUNTING_FROZEN_MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];

window.INITIAL_ACCOUNTING_RECURRING = [
  {
    "id": "REC-001",
    "title": "ค่าเช่าออฟฟิศประจำเดือน",
    "expense_type": "ค่าเช่า",
    "account_type": "Aeron Kbank ออมทรัพย์",
    "amount": 9145.00,
    "withholding_tax": 457.25,
    "payee": "อาคารออฟฟิศวิภาวดี",
    "due_day_of_month": 28,
    "is_active": true
  },
  {
    "id": "REC-002",
    "title": "ค่าบริการทำบัญชีและยื่นภาษีประจำเดือน",
    "expense_type": "ค่าทำบัญชี",
    "account_type": "Aeron SCB ออมทรัพย์",
    "amount": 2500.00,
    "withholding_tax": 75.00,
    "payee": "สำนักงานบัญชี เอสซีพี",
    "due_day_of_month": 25,
    "is_active": true
  }
];

window.ACCOUNTING_EXPENSE_TYPES = [
  "ค่าซื้อสินค้า Material Expense",
  "ค่าขนส่งสินค้า Transportation Expense",
  "ค่าจดเอกสารต่างๆ Document Registration",
  "ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง",
  "ภาษีนำเข้า Import Tax",
  "ค่าเช่า Rent",
  "ค่าใช้จ่ายออฟฟิศ Office Supplies",
  "ค่าส่งของ และค่าเดินทางของ H/O Transportation & Postal",
  "ค่าใช้จ่ายอื่นๆ ออฟฟิศ Office Other Expense",
  "เงินเดือน พนักงาน H/O Salaries, Benefits & Wages",
  "ค่าเอกสาร และ อื่นๆ Document&ETC",
  "ค่าเทรนนิ่งพนักงาน Training",
  "ค่าทำบัญชี Accounting Fee",
  "เงินเดือนเซลล์ Salaries, Benefits & Wages",
  "ค่าใช้จ่ายเซลล์ Staff Expense",
  "ค่าคอมเซลล์ Commission",
  "เลี้ยงทีมเซลล์ Staff Entertainment",
  "ค่ารับรองลูกค้า Customers Entertainment",
  "ค่าใช้จ่ายอื่นๆ เซลล์ Sales Other Expense",
  "ค่าเข้าเคส สครับ Scrub Expense",
  "ดอกเบี้ย Interest Expense",
  "ภาษี Vat 7% Vat 7%",
  "ภาษีรายได้บริษัท Income Taxes",
  "รายได้จากการขายเครื่องมือแพทย์ & บริการ"
];
