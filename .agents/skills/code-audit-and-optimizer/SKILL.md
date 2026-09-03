---
name: code-audit-and-optimizer
description: สกิลสำหรับสแกน ตรวจสอบคุณภาพระบบ ค้นหา Frankenstein Codebase, Regression Risk, Performance Degradation และประเมินตัดสินใจระหว่างการแก้ไข (Refactor) vs สร้างใหม่ (Rebuild) พร้อมออก Audit Report
---

# Code Audit, Optimization & Rebuild Decision Skill

## 🎯 วัตถุประสงค์
สกิลนี้ใช้สำหรับการสแกนวิเคราะห์คุณภาพของซอฟต์แวร์ ค้นหาหนี้ทางเทคนิค (Technical Debt), สถาปัตยกรรมที่ปะติดปะต่ออย่างไร้ทิศทาง (Frankenstein Architecture), และประเมินเปรียบเทียบเชิงวิศวกรรมว่าควร **แก้ไขโค้ดเดิม (Refactor)** หรือ **เขียนใหม่ทั้งหมด (Rebuild)** พร้อมออกรายงาน **Audit Report** ที่มีหลักฐานเชิงประจักษ์ชัดเจน

---

## 🔍 จุดตรวจสอบหลัก 4 ข้อ (The 4 Audit Criteria)

### 1. Frankenstein Codebase & Spaghetti Architecture
* **Routing / Navigation Redundancy**: ตรวจหาเส้นทาง การเปิด Modal หรือการสลับหน้าจอที่มีการประกาศซ้ำซ้อน ข้ามโมดูล หรือขาด Single Source of Truth
* **Scattered State Management**: ตรวจหา State ที่กระจัดกระจาย ไร้ศูนย์กลางควบคุม เช่น การเก็บ State ชนิดเดียวกันซ้ำๆ ในหลายคอมโพเนนต์จนเกิด Data Desynchronization
* **Monolithic & God Components**: ค้นหาไฟล์หรือคอมโพเนนต์ที่มีขนาดใหญ่เกินเกณฑ์ (> 800-1,000 บรรทัด) หรือมีหน้าที่รับผิดชอบมากเกินไป (Violation of Single Responsibility Principle)

### 2. Regression Risk & Broken Interface Contracts
* **Cross-File Interface Mismatch**: ตรวจสอบจุดเรียกใช้ฟังก์ชันข้ามไฟล์ หรือการส่ง Props ที่พารามิเตอร์ไม่ตรงกัน ไม่ครบถ้วน หรือเปลี่ยนชื่อ
* **Undefined Property Access**: ค้นหาจุดเสี่ยงเกิด `TypeError: Cannot read property of undefined` หรือขาด Optional Chaining (`?.`) และ Nullish Coalescing (`??`)
* **Implicit Global Variables**: ค้นหาการอ้างอิง `window.*` หรือ Global Variables ที่ไม่ได้ผ่านการประกาศหรือตรวจสอบความปลอดภัย

### 3. Performance Degradation & State Redundancy
* **Excessive Re-renders & Wasteful Calculations**: ตรวจหาการคำนวณหนักๆ ภายใน Render Body ที่ไม่ได้ห่อหุ้มด้วย `useMemo` หรือ Callback ที่ไม่ได้ใช้ `useCallback`
* **Redundant Data Fetching / Storage Overhead**: ตรวจสอบการอ่าน/เขียน LocalStorage หรือ Database ซ้ำซ้อนโดยไม่จำเป็น
* **Memory Leaks**: ค้นหา Event Listeners, Intervals, หรือ Chart Instances ที่ไม่มี Cleanup Function ใน `useEffect`

### 4. Refactoring Cost & Maintenance Bottlenecks
* **Cyclomatic & Cognitive Complexity**: ประเมินความซับซ้อนของเงื่อนไข (Nested If-Else, Deep Ternary Operators)
* **Tight Coupling vs High Cohesion**: ประเมินระดับการผูกติดกันของแต่ละโมดูล (หากแก้ไขจุดหนึ่งแล้วมีโอกาสกระทบโมดูลอื่นสูงเพียงใด)
* **Estimation of Refactor vs Rebuild Effort**: เปรียบเทียบชั่วโมงการทำงานและความเสี่ยงระหว่างการค่อยๆ ไล่ซ่อม vs การสร้างใหม่แบบ Clean Architecture

---

## ⚖️ เกณฑ์การประเมินการตัดสินใจ (Refactor vs Rebuild Decision Matrix)

AI Agent จะต้องนำผลสแกนเชิงตัวเลขและโครงสร้างมาประเมินตามเกณฑ์ Decision Matrix ดังนี้:

```
+-----------------------------------------------------------------------------+
|                          DECISION MATRIX CRITERIA                           |
+------------------------------------+----------------------------------------+
|   เลือก "แก้ไขโค้ดเดิม (Refactor)"   |     เลือก "สร้างใหม่ทั้งหมด (Rebuild)"     |
+------------------------------------+----------------------------------------+
| 1. โครงสร้างหลัก (Architecture)    | 1. โครงสร้างหลัก (Architecture) พัง    |
|    ยังใช้งานได้ดี ปัญหาเกิดเฉพาะจุด    |    ทั้งระบบ ขาดศูนย์กลางควบคุม State   |
| 2. State Management ยังเป็นระเบียบ | 2. จุดเรียกใช้ Interface/Props ขัดแย้ง  |
|    แค่ต้อง Clean Up หรือ Re-render   |    กันเกิน 50% ของไฟล์ทั้งหมด          |
| 3. เวลาในการ Refactor น้อยกว่าเวลา   | 3. การแก้จุดเล็กกระทบส่วนอื่นจนรวน     |
|    ที่ต้องใช้สร้างใหม่ตั้งแต่ต้น       |    ทั้งระบบ (High Regression Risk)    |
| 4. ความเสี่ยง Regression ต่ำ       | 4. เวลาไล่แก้บั๊กเดิม สูงกว่าการออกแบบ  |
|    หรืออยู่ในระดับที่ควบคุมได้       |    และสร้างใหม่แบบ Clean Architecture  |
+------------------------------------+----------------------------------------+
```

---

## 🔄 ขั้นตอนการทำงาน (Audit Workflow)

### Step 1: Automated Scan
สั่งรันสคริปต์สแกนอัตโนมัติเพื่อเก็บข้อมูลเชิงตัวเลขและตรวจหาจุดบกพร่อง:
```powershell
# รันสคริปต์สแกน Codebase (โครงสร้าง, ขนาดไฟล์, State, Event Leaks)
powershell -ExecutionPolicy Bypass -File .agents/skills/code-audit-and-optimizer/scripts/audit_codebase.ps1 -TargetDir "."

# รันสคริปต์วิเคราะห์ Dependency และ Interface Contracts
python .agents/skills/code-audit-and-optimizer/scripts/analyze_dependencies.py --root "."
```

### Step 2: Deep Inspection
นำผลลัพธ์จาก Step 1 มาวิเคราะห์เชิงลึกตาม 4 Audit Criteria:
1. วิเคราะห์ความเสี่ยงด้าน Architecture และ Routing
2. วิเคราะห์จุดเสี่ยงของ Props, State และ Function Signature Mismatches
3. วิเคราะห์จุดเกิดคอขวดด้าน Performance และ Memory Leaks
4. คำนวณ Health Score (0 - 100) ของระบบ

### Step 3: Refactor vs Rebuild Evaluation
นำข้อสรุปจาก Step 2 เข้าตาราง **Decision Matrix**:
* ให้เหตุผลสนับสนุนที่ชัดเจน (Rationale)
* เปรียบเทียบข้อดี-ข้อเสีย (Pros & Cons)
* ประเมินระยะเวลาและความเสี่ยง (Effort & Risk Estimation)
* ระบุข้อสรุปเด็ดขาด (Verdict): **`REFACTOR`** หรือ **`REBUILD`**

### Step 4: Report Generation
สร้างเอกสารรายงาน Audit Report ตามโครงสร้างใน `references/audit_report_template.md` และส่งมอบให้แก่ผู้ใช้งานเพื่อประกอบการตัดสินใจ
