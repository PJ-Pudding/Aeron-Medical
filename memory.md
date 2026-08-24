# 🧠 AERON MEDICAL Project Memory & Architecture Blueprint (memory.md)

> **โปรเจกต์**: AERON MEDICAL Project Tracker & Enterprise Management System  
> **สถาปัตยกรรม**: Micro-Modular Architecture (React 18 + Babel + TailwindCSS + Supabase Sync)  
> **อัปเดตล่าสุด**: 24 สิงหาคม 2026 (v2.8.1 - Google Sheet 4-Year Expenses Import)  
> **ที่อยู่โปรเจกต์**: `D:\Team Projects Aeron`  
> **GitHub Repository**: `https://github.com/RJ-Pudding/Aeron-Medical`

---

## 🛡️ 1. กฎเหล็กประจำโปรเจกต์ (PROJECT IRONCLAD RULES)

### 🛑 กฎที่ 1: การถามและสรุปยืนยันก่อนลงมือทำ (Mandatory Re-confirmation Summary)
- **ห้ามแก้โค้ดโดยพลการเด็ดขาด**: ทุกครั้งก่อนเริ่มปรับปรุง แก้ไข หรือสร้างฟีเจอร์ใหม่ ต้องสรุปรายการความต้องการและขั้นตอนที่จะทำเป็นข้อๆ (Bullet Points) เป็นภาษาไทยอย่างชัดเจน
- **รอคำยืนยันจากผู้ใช้เสมอ**: รอให้ผู้ใช้พิมพ์ตอบตกลง ("ถูกแล้ว", "ทำเลย", "ตกลง", "จัดไป") จึงจะเริ่มเขียนหรือแก้ไขโค้ด

### 🚨 กฎที่ 2: การทดสอบเสถียรภาพ 100% (Build & Verification Protocol)
- ทุกครั้งหลังแก้ไขโค้ดเสร็จ ต้องสั่งรัน `node build.js` และ `node test_syntax.js` ต้องผ่าน 100% ไร้ข้อผิดพลาด
- อัปเดต Cache Buster Version ใน `index.html` (เช่น `?v=2.6.8`) ทุกครั้งที่มีการคอมไพล์ใหม่

### 📦 กฎที่ 3: การสำรองข้อมูลทั้งก่อนและหลังทำ (Pre & Post Backup Guarantee)
- **Pre-Edit Checkpoint**: สั่งรัน `node backup.js` ก่อนเริ่มลงมือแก้ไขโค้ด
- **Post-Edit Checkpoint**: สั่งรัน `node backup.js` ทันทีหลังแก้ไขโค้ดและคอมไพล์สำเร็จ
- รองรับการย้อนกลับด้วย `Revert_To_Last_Checkpoint.bat` หรือ `node revert.js` ได้ 100%

### 🛡️ กฎที่ 4: การแก้ไขแบบไร้ผลกระทบข้างเคียง (Zero Side-Effects)
- การปรับปรุงหรือแก้ไขฟังก์ชันใดๆ ต้องกระทำโดย **ไม่กระทบหรือทำให้ส่วนอื่นๆ เสียหาย**

---

## 🏛️ 2. โครงสร้างโมดูลของระบบ (System Directory Structure)

```
D:\Team Projects Aeron\
├── index.html                           # Single-Page Entry Point (Cache Buster v2.6.8)
├── build.js                             # Babel JSX Bundler & Compiler
├── backup.js                            # Automatic Checkpoint Creator (backups/)
├── revert.js                            # Snapshot Recovery Engine
├── test_syntax.js                       # Comprehensive Syntax & Size Verifier
├── db\                                  # JSON Database Layer (Offline-First Storage)
│   ├── projects.json
│   ├── members.json
│   ├── products.json
│   ├── demo_bookings.json
│   ├── purchase_orders.json
│   ├── shipments.json
│   ├── repair_tickets.json
│   ├── sold_products.json
│   ├── fda_registrations.json
│   └── cost_calculations.json
├── js\
│   ├── initialData.js                   # Master Seed Database Definitions
│   ├── app.js                          # Assembled JSX Bundle
│   ├── app.compiled.js                 # Compiled Pure ES5/ES6 Production Script
│   └── modules\
│       ├── App.js                      # Root Controller, Routing, State & Sync
│       ├── mod00_core\                 # Core Layout, Header, Auth & Notifications
│       │   ├── Header.js               # Top Nav, Mobile Sheet, Notification Bell
│       │   ├── NotificationModal.js    # Smart Action Center (Pending Tasks & Cost Sheets)
│       │   ├── SidebarIconRail.js      # Slim Icon Navigation Rail
│       │   ├── SidebarNavDrawer.js     # Full Slide-out Drawer
│       │   ├── LoginModal.js           # Authentication & Role Switcher
│       │   └── UserAccountManagementModal.js # User & Role Administrator
│       ├── mod01_dashboard\            # Executive Overview & Pipeline Analytics
│       │   └── ManagerDashboard.js
│       ├── mod02_clients\              # Hospitals & Client Directory
│       │   ├── ClientsDirectoryView.js
│       │   └── HospitalDetailModal.js
│       ├── mod03_projects\             # Sales Kanban Pipeline & Project Tracking
│       │   ├── MemberKanban.js         # Individual Sales Rep Kanban Board
│       │   ├── KanbanModal.js          # Project Overview Modal
│       │   ├── ProjectCard.js          # Kanban Card Component
│       │   ├── ProjectModal.js         # Add/Edit Project Form
│       │   ├── ProjectHistoryModal.js  # Audit Trail & Timeline History
│       │   └── WeeklyLogModal.js       # Sales Weekly Meeting Logs
│       ├── mod04_logistics\            # Supply Chain, Inventory & Assets
│       │   ├── ProductCatalogView.js   # Central Demo Catalog & Specs Table
│       │   ├── ProductModal.js         # Product Form + Dynamic Excel Components Table
│       │   ├── ShipmentTrackingView.js # Import Tracking (Payment Date + Days Elapsed)
│       │   ├── ShipmentModal.js        # Import Shipment Record Modal
│       │   ├── RepairServiceView.js    # Maintenance & Service Tickets
│       │   ├── RepairTicketModal.js    # Service Ticket Form
│       │   ├── SoldProductsView.js     # Delivered Assets & Warranty Registry
│       │   ├── SoldProductModal.js     # Delivered Asset Form
│       │   └── MessengerDispatchView.js# Messenger & Local Delivery Dispatch
│       ├── mod05_calendar\             # Demo Machine Booking & Journey Analytics
│       │   ├── DemoCalendarView.js     # Calendar Grid & List View
│       │   ├── DemoBookingModal.js     # Demo Reservation Form (Expenses & Outcome)
│       │   ├── DemoReportModal.js      # Demo Analytics & Machine Journey Report
│       │   └── MonthCalendarGrid.js    # Month View Grid Component
│       ├── mod06_fda\                  # Thai FDA Regulatory & Registration
│       │   ├── FDARegistrationView.js  # FDA License Tracker
│       │   ├── FDAModal.js             # FDA Application Form
│       │   ├── AnalyticalReportsView.js# Regulatory Reports View
│       │   └── ReportPreviewModal.js   # Document Preview Modal
│       ├── mod07_finance\              # Cost Sheet Engine & Procurement
│       │   ├── CostCalculationView.js  # Financial Simulator & Margin Sheets
│       │   ├── CostSheetModal.js       # Excel-like Cost & Net Profit Calculator
│       │   ├── PurchaseOrderView.js    # Vendor PO Management
│       │   └── PurchaseOrderModal.js   # Purchase Order Form
│       ├── mod08_hr\                   # Human Resources, Attendance & Team
│       │   ├── LeaveAttendanceView.js  # Leave & Clock-in Registry
│       │   ├── LeaveModal.js           # Leave Request Form
│       │   ├── AttendanceModal.js      # On-site Clock-in Form
│       │   └── MemberManagementModal.js# Sales Rep Directory
│       ├── mod09_accounting\          # Accounting, P&L & Cash Flow
│       │   ├── AccountingModule.js     # Main Accounting View
│       │   ├── DailyTransactionView.js # Daily Income & Expenses Entry
│       │   ├── FinancialStatementsView.js # Profit & Loss (P&L) Statements
│       │   ├── BankReconciliationView.js # Bank Statement Reconciliation
│       │   ├── HospitalPayeeAnalyticsView.js # Payee & Expense Breakdown
│       │   ├── PendingTransfersView.js # Transfer Approvals
│       │   └── TransactionModal.js     # Transaction Entry Form
│       └── mod10_reports\             # [NEW] Enterprise Reporting Engine
│           ├── ExcelExportEngine.js    # Universal UTF-8 BOM CSV/Excel Exporter
│           ├── ReportRegistry.js       # Central Registry of all Enterprise Reports
│           ├── UniversalReportModal.js # Dynamic Interactive Report Viewer Modal
│           └── CentralReportsHubView.js# All Reports Dashboard & Quick Export Hub
```

---

## ✨ 3. ประวัติฟังก์ชันและการพัฒนาสำคัญ (Feature Changelog)

### 1. แยกคอลัมน์ตารางแจกแจงอุปกรณ์สินค้า (Product Specs Breakdown Table)
- **ไฟล์**: `ProductModal.js`, `ProductCatalogView.js`
- **ความสามารถ**: ปรับปรุงตาราง Excel แจกแจงชิ้นส่วนให้แยกคอลัมน์อย่างชัดเจน:
  1. `ลำดับ` (รันเลขอัตโนมัติ)
  2. `ชื่อรายการชิ้นส่วน / อุปกรณ์ประกอบ`
  3. `Item No. (รหัสชิ้นส่วน)`
  4. `Serial No. (S/N ชิ้นส่วน)`
  5. `จำนวน`
  6. `หน่วยนับ`
  7. `หมายเหตุ (Remarks)`
  8. `ปุ่มลบแถว`

### 2. ระบบรายงานประวัติและวิเคราะห์เครื่องสาธิต (Demo Analytics & History Report)
- **ไฟล์**: `DemoReportModal.js`, `DemoCalendarView.js`, `DemoBookingModal.js`
- **ความสามารถ**: 
  - ปุ่มกดรายงาน **`📊 รายงานประวัติ & สถิติ Demo`**
  - แสดง 5 KPI Cards: จำนวนเดโม่ทั้งหมด, วันเฉลี่ยที่วางเครื่อง, ค่าใช้จ่ายเดโม่รวม, อัตรา Win Rate %, และมูลค่างานที่ปิดได้
  - **แท็บ 1 (Journey Log)**: ประวัติการเดินทางของเครื่อง (รพ., รุ่นเครื่อง, S/N, เซลส์ผู้ดูแล, วันที่เริ่ม-สิ้นสุด, จำนวนวันที่วางเครื่อง, ค่าใช้จ่าย, ผลลัพธ์)
  - **แท็บ 2 (Machine Performance)**: สรุปสถิติการใช้งานรายเครื่อง (จำนวนครั้ง, วันใช้งานสะสม, Win Rate %, สถานที่ล่าสุด)
  - ส่งออกข้อมูลเป็น **Excel (CSV)** ได้ทันที

### 3. ระบบติดตามการนำเข้า (Import Logistics) & นับวันจ่ายเงินแบบเรียลไทม์
- **ไฟล์**: `Header.js`, `ShipmentModal.js`, `ShipmentTrackingView.js`, `initialData.js`
- **ความสามารถ**:
  - เปลี่ยนชื่อแถบเมนูย่อยเป็น **`🚢 ติดตามการ Import`**
  - เพิ่มช่องกรอก **"💳 วันที่จ่ายเงิน (Payment Date)"** ในหน้าต่างบันทึกชิปปิ้ง
  - แสดงผลในตาราง **นับจำนวนวันจากวันที่จ่ายเงินจนถึงวันนี้แบบเรียลไทม์** (เช่น `💳 2026-07-10` | `⏱️ ผ่านมา 43 วัน`)
  - แสดงข้อมูลในหน้าต่างดูรายละเอียดชิปปิ้ง (Preview Modal)

### 4. ระบบศูนย์แจ้งเตือนอัจฉริยะ (Personalized Smart Action Center) & เตือนลง Cost Sheet
- **ไฟล์**: `NotificationModal.js`, `Header.js`, `App.js`
- **ความสามารถ**:
  - ปุ่มกระดิ่ง **`🔔 แจ้งเตือน`** ที่ Header Bar พร้อมตัวเลข Badge สีแดง
  - **ตรวจจับงาน Kanban อัตโนมัติ**: หากเซลส์ลงงานใน Kanban แล้วยังไม่ได้ทำ **ใบคำนวณต้นทุน (Cost Sheet)** ระบบจะสร้างการแจ้งเตือนระดับด่วน `🔴 ยังไม่ได้จัดทำใบคำนวณต้นทุน`
  - **การแจ้งเตือนจะค้างอยู่ตลอดเวลา (Persistent)** จนกว่าจะลงต้นทุนเสร็จสมบูรณ์
  - **Deep Link Navigation**: กดปุ่ม `"คำนวณต้นทุนงานนี้"` ➔ ระบบจะเปิดหน้าต่าง **Cost Sheet Modal** ของโครงการนั้นให้กรอกข้อมูลทันทีแบบไร้รอยต่อ
  - ตรวจเช็กงานคงค้างจากทุกโมดูล (Demo หมดกำหนด, PO รออนุมัติ/จ่ายเงิน, ชิปปิ้งถึงไทย, อย. ใกล้หมดอายุ)

### 5. ระบบแดชบอร์ด 4 มุมมอง (Classic Overview, CEO, CFO, Manager Dashboards & View Switcher)
- **ไฟล์**: `ManagerDashboard.js`, `Header.js`, `App.js`
- **ความสามารถ**:
  - **4 Role Tabs Switcher**: สลับดูแดชบอร์ดได้ 4 มุมมองในหน้าเดียว:
    - 📊 **Classic Overview (ภาพรวมองค์กรดั้งเดิม)**: 5 KPI Cards, กราฟคู่ Chart.js (ภาระงานแยกรายคน + สัดส่วน Stage โดนัท), ตารางคิวสาธิตเครื่อง Demo Schedule
    - 👑 **CEO Strategic View**: ยอดขายจริง YTD vs เป้า ฿60M, Gross/Net Margin %, มูลค่าคาดการณ์ Weighted 90 วัน, ตารางดีลเสี่ยงสูง (High-Value Watchlist > ฿4M)
    - 💰 **CFO Financial View**: เงินสดสภาพคล่อง 5 บัญชี, ทุนสำรองสั่งของ Stage 4+, ภาระหนี้ PO รอชำระ, ปฏิทินวันครบกำหนดจ่ายเงิน (Upcoming Payables), ตรวจสอบกำไรรายโครงการ (Margin Audit)
    - 🎯 **Manager Operations View**: โครงการ Active, คิวเครื่องเดโม่และวันครบกำหนดส่งคืน, ติดตามชิปปิ้งนำเข้าพร้อมเวลานับวัน, แจ้งเตือนเครื่องใกล้หมดประกัน (โอกาสขาย MA)
  - **Header View Switcher Shortcuts**: มีทางลัดในดรอปดาวน์มุมมองบน Header ครบทั้ง 4 แบบ กดเลือกเข้าถึงได้ทันที

### 6. การรีเซ็ตระบบเข้าสู่สภาวะเริ่มต้นวันแรก (Day 1 Production Clean Reset)
- **ไฟล์**: `db/*.json`, `initialData.js`, `App.js`, `index.html` (v2.8.0)
- **ความสามารถ**:
  - ล้างข้อมูลธุรกรรมและการดำเนินงานทั้งหมดเป็น 0 รายการ (Projects, Cost Sheets, PO, Shipments, Demos, Repairs, Sold Products, FDA Registrations, Product Catalog, Bank Reconciliations, Daily Transactions, Leaves, Attendances)
  - คงไว้เฉพาะ **บัญชีพนักงาน & สิทธิ์ผู้ใช้งาน (Team Members & Roles)** เพื่อให้พร้อมล็อกอินเริ่มใช้งานจริงได้ทันที

### 7. การนำเข้าข้อมูลรายรับ-รายจ่ายย้อนหลัง 4 ปีจาก Google Sheet (2023 - 2026 Import)
- **ไฟล์**: `db/daily_transactions.json`, `db/accounting.json`, `initialData.js`, `App.js`, `index.html` (v2.8.1)
- **ความสามารถ**:
  - นำเข้าข้อมูลรายรับ-รายจ่ายจริงจาก Google Sheet แท็บ **"ภาพรวม ยอดค่าใช้จ่าย"** รวมทั้งสิ้น **4,736 รายการ**
    - 💸 รายจ่าย (Expenses): **4,176 รายการ** (มูลค่ารวม **฿88,607,832.35**)
    - 💰 รายรับ (Incomes): **560 รายการ** (มูลค่ารวม **฿84,258,505.29**)
  - ทำการจัดกลุ่มบัญชีธนาคารมาตรฐาน (KBANK Corp, KBANK Personal, SCB Corp, TTB Personal)
  - ตัดคอลัมน์ด้านขวา (ข้อมูลผิดพลาด) ออกอย่างถูกต้อง และเก็บบันทึกเฉพาะคอลัมน์ค่าใช้จ่ายแยกย่อย, แพทย์, รพ., และภาษี W/H ครบถ้วน 100%

---

## 📊 4. แผนผังรายงานสารสนเทศ 8 โมดูลหลัก (Master Reports Blueprint)

| โมดูล | รายงานสำคัญที่แนะนำ | ตัวชี้วัดสำคัญ (Key Metrics) | รูปแบบการแสดงผล |
| :--- | :--- | :--- | :--- |
| **1. งานขาย & โครงการ** | • Sales Pipeline & Funnel<br>• Sales Rep Leaderboard<br>• Hospital Penetration | มูลค่างานในแต่ละ Stage, Win Rate %, ยอดขายรายเซลส์, ส่วนแบ่งตลาด รพ. | Funnel Chart, ตารางอันดับ, Export Excel |
| **2. การเงิน & ต้นทุน** | • Project Margin & Profit Sheet<br>• PO & Vendor Commitment<br>• Break-Even Simulator | ราคาขาย In/Ex VAT, ต้นทุนจริง, ค่า DF, คอมมิชชั่น, ภาษี 20%, กำไรสุทธิ | Excel Calculation Grid, PDF Print, CSV Export |
| **3. นำเข้า & ชิปปิ้ง** | • Shipment Aging & Payment Tracker<br>• Landed Cost & Duty Breakdown<br>• Carrier SLA Lead Time | วันที่จ่ายเงิน, จำนวนวันขนส่ง, ค่าระวาง CBM, ภาษีศุลกากร, ระยะเวลาถึงไทย | Interactive Grid, แบดจ์นับวัน, SLA Table |
| **4. เครื่องสาธิต Demo** | • Machine Journey Log<br>• Demo-to-Win Conversion Rate<br>• Machine Utilization & Idle Days | ประวัติ รพ. ที่ไป, จำนวนวันวางเครื่อง, ค่าใช้จ่ายเดโม่, Win Rate %, วันว่าง | Timeline Journey, Gantt Bar, Export CSV |
| **5. ส่งซ่อม & สินค้าที่ขาย** | • Warranty Expiry & MA Alert<br>• Failure Trend Analysis<br>• Mean Time to Repair (MTTR) | รายชื่อเครื่องใกล้หมดประกัน, อะไหล่ที่เสียบ่อย, เวลาเฉลี่ยในการซ่อมเสร็จ | Color Alert List, Pareto Chart, TAT Gauge |
| **6. บัญชี & กระแสเงินสด** | • Statement of Profit & Loss (P&L)<br>• Bank Reconciliation<br>• Payee / Hospital Analytics | รายรับรวม, ค่าใช้จ่ายดำเนินงาน, Net Margin %, ยอดกระทบยอดแบงก์ | Accordion Financial Statement, Dual Ledger |
| **7. อย. & ทะเบียน** | • FDA Expiration Matrix<br>• New License Application Tracker | วันหมดอายุใบอนุญาต (เตือนล่วงหน้า 60 วัน), ขั้นตอนยื่นเอกสาร สธ. | Expiry Timeline, Step Kanban |
| **8. บริหารบุคลากร HR** | • Annual Leave Balance Report<br>• On-site Clock-in & Attendance | วันลาพักร้อน/ป่วยคงเหลือ, สถิติการออกพบแพทย์ต่างจังหวัด | Balance Matrix, Check-in Log Table |

---

## 🛠️ 5. คู่มือคำสั่งปฏิบัติการและการกู้คืนระบบ (Operations Cheatsheet)

### 1. การคอมไพล์โปรเจกต์ (Build & Bundle):
```powershell
& "C:\Users\phons\AppData\Local\ms-playwright-go\1.57.0\node.exe" "D:\Team Projects Aeron\build.js"
```

### 2. การตรวจสอบความถูกต้องและขนาดไฟล์ (Syntax Verification):
```powershell
& "C:\Users\phons\AppData\Local\ms-playwright-go\1.57.0\node.exe" "D:\Team Projects Aeron\test_syntax.js"
```

### 3. การสร้าง Checkpoint Backup สำรองข้อมูล:
```powershell
& "C:\Users\phons\AppData\Local\ms-playwright-go\1.57.0\node.exe" "D:\Team Projects Aeron\backup.js"
```

### 4. การกู้คืนระบบย้อนกลับ (Revert to Checkpoint):
```powershell
& "C:\Users\phons\AppData\Local\ms-playwright-go\1.57.0\node.exe" "D:\Team Projects Aeron\revert.js"
# หรือดับเบิลคลิกไฟล์ Revert_To_Last_Checkpoint.bat
```

### 5. การอัปเดตระบบขึ้น GitHub (เพื่อให้บน Render ทำงานทันที):
- เปิด 👉 `https://github.com/RJ-Pudding/Aeron-Medical` ➔ กด **Upload files**
- ลากไฟล์ที่แก้ไขจาก `D:\Team Projects Aeron\` ไปวางตามโครงสร้างโฟลเดอร์เดิม แล้วกด **Commit changes**

---
*เอกสารนี้ถูกบันทึกและดูแลรักษาโดย Antigravity AI Agent เพื่อให้การพัฒนาโครงการเป็นไปอย่างต่อเนื่อง แม่นยำ และปลอดภัย 100%*
