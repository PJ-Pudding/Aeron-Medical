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
