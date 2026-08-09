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
