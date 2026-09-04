// MODULE: mod09_accounting/DailyTransactionView.js

function DailyTransactionView({ transactions = [], frozenMonths = [], currentUser, onOpenNewModal, onEditTxn, onDeleteTxn, onImportTxns }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, รายรับ, รายจ่าย
  const [filterExpenseType, setFilterExpenseType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterHospital, setFilterHospital] = useState('all');
  const [isPettyCashModalOpen, setIsPettyCashModalOpen] = useState(false);
  
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  const [activeSlipUrl, setActiveSlipUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Filter out Pending Drafts from active daily log grid until confirmed by Admin
  const activeTxns = useMemo(() => {
    return transactions.filter(t => {
      if (t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || t.status === '⏳ รอโอนเงิน') {
        return false;
      }
      if (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]') && !t.notes.includes('[แอดมินแนบสลิปเรียบร้อย]')) {
        return false;
      }
      return true;
    });
  }, [transactions]);

  // Unique Hospitals list for filter
  const hospitalList = useMemo(() => {
    const set = new Set();
    activeTxns.forEach(t => {
      if (t.hospital_name && t.hospital_name.trim()) set.add(t.hospital_name.trim());
    });
    return Array.from(set).sort();
  }, [activeTxns]);

  const filteredTxns = useMemo(() => {
    return activeTxns.filter(t => {
      if (filterType !== 'all' && t.transaction_type !== filterType) return false;
      if (filterExpenseType !== 'all' && t.expense_type !== filterExpenseType) return false;
      if (filterAccount !== 'all' && t.account_type !== filterAccount) return false;
      if (filterHospital !== 'all' && t.hospital_name !== filterHospital) return false;

      // Date Range Picker Filter
      if (t.date) {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchPayee = (t.payee || '').toLowerCase().includes(q);
        const matchHospital = (t.hospital_name || '').toLowerCase().includes(q);
        const matchNotes = (t.notes || '').toLowerCase().includes(q);
        return matchTitle || matchPayee || matchHospital || matchNotes;
      }
      return true;
    });
  }, [activeTxns, filterType, filterExpenseType, filterAccount, filterHospital, startDate, endDate, searchTerm]);

  // Totals calculations
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    let tax = 0;
    let net = 0;
    let offBookCount = 0;

    filteredTxns.forEach(t => {
      const amt = Number(t.amount) || 0;
      const wht = Number(t.withholding_tax) || 0;
      const netVal = Number(t.net_transfer) || 0;

      if (t.transaction_type === 'รายรับ') {
        income += amt;
      } else {
        expense += amt;
      }
      tax += wht;
      net += (t.transaction_type === 'รายรับ' ? netVal : -netVal);

      if (t.off_book_expense) offBookCount++;
    });

    return { income, expense, tax, net, offBookCount };
  }, [filteredTxns]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      "ID", "วันที่", "รายการคำอธิบาย", "หมวดหมู่", "ช่องทางชำระเงิน",
      "จำนวนเงินรวม(บาท)", "ภาษีหัก ณ ที่จ่าย", "ประกันสังคม", "หักกู้ยืมพนักงาน",
      "ยอดโอนรวม(บาท)", "หมายเหตุ", "ผู้รับ/จ่ายเงิน", "รายรับ/รายจ่าย",
      "ค่าใช้จ่ายนอกบิล", "โรงพยาบาล/โครงการ", "แนบสลิป/เอกสาร"
    ];

    const rows = filteredTxns.map(t => [
      `"${t.id || ''}"`,
      `"${t.date || ''}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.expense_type || '').replace(/"/g, '""')}"`,
      `"${(t.account_type || '').replace(/"/g, '""')}"`,
      t.amount || 0,
      t.withholding_tax || 0,
      t.social_security || 0,
      t.loan_for_employee || 0,
      t.net_transfer || 0,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      `"${(t.payee || '').replace(/"/g, '""')}"`,
      `"${t.transaction_type || ''}"`,
      t.off_book_expense ? "ใช่" : "ไม่ใช่",
      `"${(t.hospital_name || '').replace(/"/g, '""')}"`,
      `"${t.attachment_url || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AERON_Daily_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import File CSV Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length <= 1) {
          alert('ไฟล์ไม่มีข้อมูลธุรกรรม');
          return;
        }

        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 5) {
            imported.push({
              id: cols[0] || `TXN-${Date.now()}-${i}`,
              date: cols[1] || new Date().toISOString().split('T')[0],
              title: cols[2] || 'รายการนำเข้า',
              expense_type: cols[3] || 'ค่าใช้จ่ายทั่วไป',
              account_type: cols[4] || 'บริษัท KBANK',
              amount: Number(cols[5]) || 0,
              withholding_tax: Number(cols[6]) || 0,
              social_security: Number(cols[7]) || 0,
              loan_for_employee: Number(cols[8]) || 0,
              net_transfer: Number(cols[9]) || Number(cols[5]) || 0,
              notes: cols[10] || 'นำเข้าจาก CSV',
              payee: cols[11] || '',
              transaction_type: cols[12] || 'รายจ่าย',
              off_book_expense: cols[13] === 'ใช่',
              hospital_name: cols[14] || '',
              attachment_url: cols[15] || ''
            });
          }
        }

        if (imported.length > 0 && onImportTxns) {
          onImportTxns(imported);
          alert(`นำเข้าข้อมูลสำเร็จ ${imported.length} รายการ`);
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      
      {/* Hidden File Input for Excel/CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Slip Attachment Preview Modal */}
      {activeSlipUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-xl w-full rounded-3xl p-5 space-y-3 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">🧾 รูปภาพสลิปโอนเงิน / เอกสารแนบ</h4>
              <button onClick={() => setActiveSlipUrl(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center p-2 bg-slate-950 rounded-2xl">
              <img src={activeSlipUrl} alt="Slip Attachment" className="max-w-full rounded-xl object-contain shadow-lg" />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setActiveSlipUrl(null)} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💰 รายรับรวม (Income)</div>
          <div className="text-xl font-black font-mono text-emerald-400">
            {totals.income.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💸 รายจ่ายรวม (Expense)</div>
          <div className="text-xl font-black font-mono text-rose-400">
            {totals.expense.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">🧾 ภาษีหัก ณ ที่จ่ายรวม</div>
          <div className="text-xl font-black font-mono text-indigo-300">
            {totals.tax.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">💵 กระแสโอนสุทธิ (Net Flow)</div>
          <div className={`text-xl font-black font-mono ${totals.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totals.net.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Date Range Picker */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        
        {/* Date Range Picker & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          
          {/* High-Contrast Vibrant Yellow Date Range Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 rounded-xl p-1.5 shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span>ช่วงวันที่:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-lg p-1 outline-none text-xs"
            />
            <span className="text-slate-500">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-lg p-1 outline-none text-xs"
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white text-xs px-1">✕</button>
            )}
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="🔍 ค้นหารายการ, ผู้รับเงิน, โรงพยาบาล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-3 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none font-bold"
          >
            <option value="all">🌐 ประเภททั้งหมด</option>
            <option value="รายรับ">💰 เฉพาะรายรับ</option>
            <option value="รายจ่าย">💸 เฉพาะรายจ่าย</option>
          </select>

          <select
            value={filterExpenseType}
            onChange={(e) => setFilterExpenseType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none max-w-[200px]"
          >
            <option value="all">📦 หมวดหมู่ทั้งหมด</option>
            <optgroup label="📦 ต้นทุนขาย (COGS)">
              <option value="ค่าซื้อสินค้า Material Expense">ค่าซื้อสินค้า Material Expense</option>
              <option value="ค่าขนส่งสินค้า Transportation Expense">ค่าขนส่งสินค้า Transportation Expense</option>
              <option value="ค่าจดเอกสารต่างๆ Document Registration">ค่าจดเอกสารต่างๆ Document Registration</option>
              <option value="ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง">ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง</option>
              <option value="ภาษีนำเข้า Import Tax">ภาษีนำเข้า Import Tax</option>
            </optgroup>
            <optgroup label="🏢 ค่าใช้จ่ายสำนักงานใหญ่ (Expenses H/O)">
              <option value="ค่าเช่า Rent">ค่าเช่า Rent</option>
              <option value="ค่าใช้จ่ายออฟฟิศ Office Supplies">ค่าใช้จ่ายออฟฟิศ Office Supplies</option>
              <option value="ค่าส่งของ และค่าเดินทางของ H/O Transportation & Postal">ค่าส่งของ และค่าเดินทางของ H/O</option>
              <option value="ค่าใช้จ่ายอื่นๆ ออฟฟิศ Office Other Expense">ค่าใช้จ่ายอื่นๆ ออฟฟิศ</option>
              <option value="เงินเดือน พนักงาน H/O Salaries, Benefits & Wages">เงินเดือน พนักงาน H/O</option>
              <option value="ค่าเอกสาร และ อื่นๆ Document&ETC">ค่าเอกสาร และ อื่นๆ</option>
              <option value="ค่าเทรนนิ่งพนักงาน Training">ค่าเทรนนิ่งพนักงาน Training</option>
              <option value="ค่าทำบัญชี Accounting Fee">ค่าทำบัญชี Accounting Fee</option>
            </optgroup>
            <optgroup label="💼 ค่าใช้จ่ายฝ่ายขาย (Sales Expenses)">
              <option value="เงินเดือนเซลล์ Salaries, Benefits & Wages">เงินเดือนเซลล์</option>
              <option value="ค่าใช้จ่ายเซลล์ Staff Expense">ค่าใช้จ่ายเซลล์ Staff Expense</option>
              <option value="ค่าคอมเซลล์ Commission">ค่าคอมเซลล์ Commission</option>
              <option value="เลี้ยงทีมเซลล์ Staff Entertainment">เลี้ยงทีมเซลล์</option>
              <option value="ค่ารับรองลูกค้า Customers Entertainment">ค่ารับรองลูกค้า</option>
              <option value="ค่าใช้จ่ายอื่นๆ เซลล์ Sales Other Expense">ค่าใช้จ่ายอื่นๆ เซลล์</option>
              <option value="ค่าเข้าเคส สครับ Scrub Expense">ค่าเข้าเคส สครับ Scrub Expense</option>
            </optgroup>
            <optgroup label="💵 ดอกเบี้ย & ภาษี">
              <option value="ดอกเบี้ย Interest Expense">ดอกเบี้ย Interest Expense</option>
              <option value="ภาษี Vat 7% Vat 7%">ภาษี Vat 7%</option>
              <option value="ภาษีรายได้บริษัท Income Taxes">ภาษีรายได้บริษัท</option>
            </optgroup>
          </select>

          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none"
          >
            <option value="all">🏦 บัญชีทั้งหมด</option>
            {(window.getCompanyAccounts ? window.getCompanyAccounts() : ['Aeron Kbank ออมทรัพย์', 'Aeron Kbank กระแสรายวัน', 'Aeron Kbank ฝากประจำ', 'Aeron SCB ออมทรัพย์', 'Aeron SCB กระแสรายวัน']).map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>

          {hospitalList.length > 0 && (
            <select
              value={filterHospital}
              onChange={(e) => setFilterHospital(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 outline-none font-semibold"
            >
              <option value="all">🏥 โรงพยาบาลทั้งหมด</option>
              {hospitalList.map(h => (
                <option key={h} value={h}>🏥 {h}</option>
              ))}
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentUser && ['OWNER', 'HEAD_ADMIN', 'ADMIN'].includes(String(currentUser.role).toUpperCase()) && (
            <button
              onClick={() => setIsPettyCashModalOpen(true)}
              className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold rounded-xl border border-amber-500/40 transition-colors flex items-center gap-1.5 shadow-md"
              title="ตั้งค่าบัญชีเงินสดสำรองจ่ายรายบุคคล"
            >
              <span>💵 ตั้งค่า Petty Cash</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <span>📥 Import CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <span>📊 Export Excel</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
          >
            <span>+ ลงบันทึกรายการใหม่</span>
          </button>
        </div>

      </div>

      {/* Transactions Table Spreadsheet Grid matching Excel Screenshots */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <span>📋 ตารางบันทึกรายรับ-รายจ่ายรายวัน (Spreadsheet Grid View)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {filteredTxns.length} รายการ
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">วันที่</th>
                <th className="p-3">รายการ</th>
                <th className="p-3">ประเภทค่าใช้จ่าย</th>
                <th className="p-3">บัญชีผู้โอน</th>
                <th className="p-3 text-right">ยอดเงิน</th>
                <th className="p-3 text-right">W/H</th>
                <th className="p-3 text-right">ประกันสังคม</th>
                <th className="p-3 text-right">ยอดโอนรวม</th>
                <th className="p-3">หมายเหตุ</th>
                <th className="p-3">ผู้รับเงิน</th>
                <th className="p-3 text-center">ประเภท</th>
                <th className="p-3">โรงพยาบาล</th>
                <th className="p-3 text-center">สลิป/เอกสาร</th>
                <th className="p-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="14" className="p-8 text-center text-slate-500 italic">
                    ไม่พบรายการรายรับ-รายจ่ายที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredTxns.map(t => {
                  const monthKey = (t.date || '').substring(0, 7);
                  const isFrozen = frozenMonths.includes(monthKey);

                  return (
                    <tr key={t.id} className={`hover:bg-slate-900/50 transition-colors ${isFrozen ? 'opacity-85 bg-slate-950/40' : ''}`}>
                      <td className="p-3 font-mono text-slate-400">
                        {window.formatAeronDate(t.date)}
                        {isFrozen && (
                          <span className="block text-[9px] text-rose-400 font-bold">🔒 ปิดงบแล้ว</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white leading-snug">{t.title}</div>
                        {t.vat_eligible && <span className="inline-block text-[9.5px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 mt-0.5">VAT 7%</span>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium text-[11px]">
                          {t.expense_type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{t.account_type}</td>
                      <td className={`p-3 text-right font-mono font-bold ${t.transaction_type === 'รายรับ' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.transaction_type === 'รายรับ' ? '+' : '-'}{(t.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono text-indigo-300">
                        {t.withholding_tax > 0 ? (t.withholding_tax).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono text-indigo-300">
                        {t.social_security > 0 ? (t.social_security).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                        {(t.net_transfer || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px] max-w-[150px] truncate">{t.notes || '-'}</td>
                      <td className="p-3 font-semibold text-slate-200">{t.payee || '-'}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] ${t.transaction_type === 'รายรับ' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{t.hospital_name || '-'}</td>
                      <td className="p-3 text-center">
                        {t.attachment_url ? (
                          <button
                            onClick={() => setActiveSlipUrl(t.attachment_url)}
                            className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-[10.5px] font-bold border border-indigo-500/40"
                          >
                            🖼️ ดูสลิป
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10.5px]">ไม่มี</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {!isFrozen ? (
                          <>
                            <button
                              onClick={() => onEditTxn(t)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold"
                            >
                              ✏️ แก้ไข
                            </button>
                            <button
                              onClick={() => onDeleteTxn(t.id, t.date)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 rounded-lg text-[11px]"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-[10px] italic">🔒 ปิดงบ</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Petty Cash Account Management Modal */}
      <PettyCashModal
        isOpen={isPettyCashModalOpen}
        onClose={() => setIsPettyCashModalOpen(false)}
        onSave={() => setFilterAccount('all')}
      />

    </div>
  );
}
