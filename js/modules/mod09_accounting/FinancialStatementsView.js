// MODULE: mod09_accounting/FinancialStatementsView.js

function FinancialStatementsView({ transactions = [], currentUser }) {
  const [statementTab, setStatementTab] = useState('monthly_matrix'); // 'monthly_matrix' | 'p_l' | 'cash_flow' | 'balance_sheet'
  const [selectedYear, setSelectedYear] = useState('2026');
  
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');
  const [periodPreset, setPeriodPreset] = useState('all'); // 'all' | 'monthly' | 'yearly' | 'custom'

  // Quick Preset Handlers
  const handleApplyMonthlyPreset = (monthOffset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1 + monthOffset;
    const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    setPeriodPreset('monthly');
  };

  const handleApplyYearlyPreset = (year = new Date().getFullYear()) => {
    setStartDate(`${year}-01-01`);
    setEndDate(`${year}-12-31`);
    setSelectedYear(String(year));
    setPeriodPreset('yearly');
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    setPeriodPreset('all');
  };

  // Filtered Transactions by Date Range
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      // Exclude pending unconfirmed drafts from financial statements
      if (t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || t.status === '⏳ รอโอนเงิน') {
        return false;
      }
      if (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]') && !t.notes.includes('[แอดมินแนบสลิปเรียบร้อย]')) {
        return false;
      }

      if (!t.date) return true;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      return true;
    });
  }, [transactions, startDate, endDate]);

  // ----------------------------------------------------
  // MONTHLY 12-MONTH MATRIX COMPUTATION (Jan - Dec + Full Year)
  // ----------------------------------------------------
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const monthlyMatrix = useMemo(() => {
    const targetYr = Number(selectedYear) || 2026;

    // Initialize 12 months data structure
    const monthsData = monthNames.map((name, idx) => ({
      name,
      monthIdx: idx,
      // Revenue
      returnsDiscounts: 0,
      totalNetRevenue: 0,
      // COGS
      materialExp: 0,
      transportExp: 0,
      docRegExp: 0,
      etcInsuranceExp: 0,
      importTaxExp: 0,
      cogsTotal: 0,
      grossProfit: 0,
      // H/O Expenses
      rentExp: 0,
      officeSuppliesExp: 0,
      postalExp: 0,
      officeOtherExp: 0,
      hoSalariesExp: 0,
      docEtcExp: 0,
      trainingExp: 0,
      accountingFeeExp: 0,
      hoTotal: 0,
      // Sales Expenses
      salesSalariesExp: 0,
      staffCommExp: 0,
      incentiveCommExp: 0,
      staffEntExp: 0,
      custEntExp: 0,
      salesOtherExp: 0,
      scrubExp: 0,
      salesTotal: 0,
      // Totals & Taxes
      totalExpenses: 0,
      ebit: 0,
      interestExp: 0,
      ebt: 0,
      vat7: 0,
      incomeTax: 0,
      netEarnings: 0,
      cashFlow: 0,
      // Balance Sheet
      accountsReceivable: 0,
      cashBalance: 0,
      stockVal: 0,
      totalAssets: 0,
      accountsPayable: 0,
      smeBank1: 0,
      smeBank2: 0,
      relativeLoan: 0,
      equityCapital: 0,
      totalLiabilities: 0,
      totalEquityLiabilities: 0
    }));

    // Populate data from filteredTransactions
    filteredTransactions.forEach(t => {
      if (!t.date) return;
      const d = new Date(t.date);
      const tYr = d.getFullYear();
      if (selectedYear !== 'all' && tYr !== targetYr) return;

      const mIdx = d.getMonth();
      if (mIdx < 0 || mIdx > 11) return;

      const m = monthsData[mIdx];
      const amt = Number(t.amount) || 0;
      const cat = t.category || t.expense_type || '';
      const notes = t.notes || '';
      const isIncome = t.type === 'income' || t.transaction_type === 'รายรับ';
      const isExpense = t.type === 'expense' || t.transaction_type === 'รายจ่าย';

      if (isIncome) {
        if (cat.includes('ส่วนลด') || cat.includes('คืนสินค้า')) {
          m.returnsDiscounts += amt;
        } else {
          m.totalNetRevenue += amt;
        }
      } else if (isExpense) {
        // COGS
        if (cat.includes('ซื้อสินค้า') || cat.includes('ต้นทุน') || notes.includes('Material')) m.materialExp += amt;
        else if (cat.includes('ขนส่ง') || notes.includes('Transport')) m.transportExp += amt;
        else if (cat.includes('เอกสาร') || notes.includes('Doc')) m.docRegExp += amt;
        else if (cat.includes('ภาษีนำเข้า') || notes.includes('Import Tax')) m.importTaxExp += amt;
        else if (cat.includes('ประกัน') || cat.includes('โต๊ะ') || cat.includes('โต้ะ')) m.etcInsuranceExp += amt;
        
        // H/O Expenses
        else if (cat.includes('ค่าเช่า') || notes.includes('Rent')) m.rentExp += amt;
        else if (cat.includes('ออฟฟิศ') || cat.includes('วัสดุสำนักงาน')) m.officeSuppliesExp += amt;
        else if (cat.includes('ส่งของ') || cat.includes('ไปรษณีย์')) m.postalExp += amt;
        else if (cat.includes('เงินเดือน H/O') || cat.includes('เงินเดือน พนักงาน') || notes.includes('H/O Salary')) m.hoSalariesExp += amt;
        else if (cat.includes('ทำบัญชี') || notes.includes('Accounting')) m.accountingFeeExp += amt;
        else if (cat.includes('เทรนนิ่ง') || cat.includes('อบรม')) m.trainingExp += amt;

        // Sales Expenses
        else if (cat.includes('เงินเดือนเซลล์') || cat.includes('เงินเดือนเซลส์') || notes.includes('Sales Salary')) m.salesSalariesExp += amt;
        else if (cat.includes('คอมมิชชั่น') || cat.includes('ค่าคอม') || cat.includes('Commission')) m.incentiveCommExp += amt;
        else if (cat.includes('เลี้ยงทีม') || notes.includes('Staff Ent')) m.staffEntExp += amt;
        else if (cat.includes('รับรองลูกค้า') || notes.includes('Cust Ent')) m.custEntExp += amt;
        else if (cat.includes('สครับ') || notes.includes('Scrub')) m.scrubExp += amt;
        else if (cat.includes('ค่าใช้จ่ายเซลล์')) m.salesOtherExp += amt;
        else if (cat.includes('ดอกเบี้ย')) m.interestExp += amt;
        else if (cat.includes('ภาษี')) m.incomeTax += amt;
        else m.officeOtherExp += amt;
      }
    });

    // Subtotal and Balance Sheet calculations per month (Strictly based on actual transactions)
    monthsData.forEach((m, idx) => {
      m.cogsTotal = m.materialExp + m.transportExp + m.docRegExp + m.etcInsuranceExp + m.importTaxExp;
      m.grossProfit = m.totalNetRevenue - m.cogsTotal - m.returnsDiscounts;

      m.hoTotal = m.rentExp + m.officeSuppliesExp + m.postalExp + m.officeOtherExp + m.hoSalariesExp + m.docEtcExp + m.trainingExp + m.accountingFeeExp;
      m.salesTotal = m.salesSalariesExp + m.staffCommExp + m.incentiveCommExp + m.staffEntExp + m.custEntExp + m.salesOtherExp + m.scrubExp;

      m.totalExpenses = m.hoTotal + m.salesTotal;
      m.ebit = m.grossProfit - m.totalExpenses;
      m.ebt = m.ebit - m.interestExp;
      m.netEarnings = m.ebt - m.vat7 - m.incomeTax;
      m.cashFlow = m.netEarnings; // Cash Flow Net

      // Balance Sheet (Defaults to 0 unless officially recorded)
      m.accountsReceivable = 0;
      m.cashBalance = 0;
      m.stockVal = 0;
      m.totalAssets = 0;

      m.accountsPayable = 0;
      m.smeBank1 = 0;
      m.smeBank2 = 0;
      m.relativeLoan = 0;
      m.equityCapital = 0;
      m.totalLiabilities = 0;
      m.totalEquityLiabilities = 0;
    });

    // Calculate Full Year Summary
    const fullYear = {
      name: 'Full Year',
      returnsDiscounts: monthsData.reduce((s, m) => s + m.returnsDiscounts, 0),
      totalNetRevenue: monthsData.reduce((s, m) => s + m.totalNetRevenue, 0),
      materialExp: monthsData.reduce((s, m) => s + m.materialExp, 0),
      transportExp: monthsData.reduce((s, m) => s + m.transportExp, 0),
      docRegExp: monthsData.reduce((s, m) => s + m.docRegExp, 0),
      etcInsuranceExp: monthsData.reduce((s, m) => s + m.etcInsuranceExp, 0),
      importTaxExp: monthsData.reduce((s, m) => s + m.importTaxExp, 0),
      cogsTotal: monthsData.reduce((s, m) => s + m.cogsTotal, 0),
      grossProfit: monthsData.reduce((s, m) => s + m.grossProfit, 0),
      rentExp: monthsData.reduce((s, m) => s + m.rentExp, 0),
      officeSuppliesExp: monthsData.reduce((s, m) => s + m.officeSuppliesExp, 0),
      postalExp: monthsData.reduce((s, m) => s + m.postalExp, 0),
      officeOtherExp: monthsData.reduce((s, m) => s + m.officeOtherExp, 0),
      hoSalariesExp: monthsData.reduce((s, m) => s + m.hoSalariesExp, 0),
      docEtcExp: monthsData.reduce((s, m) => s + m.docEtcExp, 0),
      trainingExp: monthsData.reduce((s, m) => s + m.trainingExp, 0),
      accountingFeeExp: monthsData.reduce((s, m) => s + m.accountingFeeExp, 0),
      hoTotal: monthsData.reduce((s, m) => s + m.hoTotal, 0),
      salesSalariesExp: monthsData.reduce((s, m) => s + m.salesSalariesExp, 0),
      staffCommExp: monthsData.reduce((s, m) => s + m.staffCommExp, 0),
      incentiveCommExp: monthsData.reduce((s, m) => s + m.incentiveCommExp, 0),
      staffEntExp: monthsData.reduce((s, m) => s + m.staffEntExp, 0),
      custEntExp: monthsData.reduce((s, m) => s + m.custEntExp, 0),
      salesOtherExp: monthsData.reduce((s, m) => s + m.salesOtherExp, 0),
      scrubExp: monthsData.reduce((s, m) => s + m.scrubExp, 0),
      salesTotal: monthsData.reduce((s, m) => s + m.salesTotal, 0),
      totalExpenses: monthsData.reduce((s, m) => s + m.totalExpenses, 0),
      ebit: monthsData.reduce((s, m) => s + m.ebit, 0),
      interestExp: monthsData.reduce((s, m) => s + m.interestExp, 0),
      ebt: monthsData.reduce((s, m) => s + m.ebt, 0),
      vat7: monthsData.reduce((s, m) => s + m.vat7, 0),
      incomeTax: monthsData.reduce((s, m) => s + m.incomeTax, 0),
      netEarnings: monthsData.reduce((s, m) => s + m.netEarnings, 0),
      cashFlow: monthsData.reduce((s, m) => s + m.cashFlow, 0),
      accountsReceivable: 0,
      cashBalance: 0,
      stockVal: 0,
      totalAssets: 0,
      accountsPayable: 0,
      smeBank1: 0,
      smeBank2: 0,
      relativeLoan: 0,
      equityCapital: 0,
      totalLiabilities: 0,
      totalEquityLiabilities: 0
    };

    return { months: monthsData, fullYear };
  }, [filteredTransactions, selectedYear]);

  // Detailed P&L Category Aggregations for Executive Summary
  const pnlBreakdown = useMemo(() => {
    let totalRevenue = 0;
    let materialExp = 0;
    let transportExp = 0;
    let docRegExp = 0;
    let etcInsuranceExp = 0;
    let importTaxExp = 0;
    let rentExp = 0;
    let officeSuppliesExp = 0;
    let hoSalariesExp = 0;
    let accountingFeeExp = 0;
    let hoOtherExp = 0;
    let salesSalariesExp = 0;
    let salesCommExp = 0;
    let staffEntExp = 0;
    let custEntExp = 0;
    let scrubExp = 0;

    filteredTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const cat = t.category || t.expense_type || '';
      const notes = t.notes || '';
      const isIncome = t.type === 'income' || t.transaction_type === 'รายรับ';
      const isExpense = t.type === 'expense' || t.transaction_type === 'รายจ่าย';

      if (isIncome) {
        totalRevenue += amt;
      } else if (isExpense) {
        if (cat.includes('ซื้อสินค้า') || cat.includes('ต้นทุน') || notes.includes('Material')) materialExp += amt;
        else if (cat.includes('ขนส่ง') || notes.includes('Transport')) transportExp += amt;
        else if (cat.includes('เอกสาร') || notes.includes('Doc')) docRegExp += amt;
        else if (cat.includes('ภาษีนำเข้า') || notes.includes('Import Tax')) importTaxExp += amt;
        else if (cat.includes('ประกัน') || cat.includes('โต๊ะ') || cat.includes('โต้ะ')) etcInsuranceExp += amt;
        else if (cat.includes('เช่า') || notes.includes('Rent')) rentExp += amt;
        else if (cat.includes('ออฟฟิศ') || cat.includes('วัสดุสำนักงาน')) officeSuppliesExp += amt;
        else if (cat.includes('เงินเดือน H/O') || cat.includes('เงินเดือน พนักงาน') || notes.includes('H/O Salary')) hoSalariesExp += amt;
        else if (cat.includes('ทำบัญชี') || notes.includes('Accounting')) accountingFeeExp += amt;
        else if (cat.includes('เงินเดือนเซลล์') || cat.includes('เงินเดือนเซลส์') || notes.includes('Sales Salary')) salesSalariesExp += amt;
        else if (cat.includes('คอมมิชชั่น') || cat.includes('ค่าคอม') || cat.includes('Commission')) salesCommExp += amt;
        else if (cat.includes('เลี้ยงทีม') || notes.includes('Staff Ent')) staffEntExp += amt;
        else if (cat.includes('รับรองลูกค้า') || notes.includes('Cust Ent')) custEntExp += amt;
        else if (cat.includes('สครับ') || notes.includes('Scrub')) scrubExp += amt;
        else hoOtherExp += amt;
      }
    });

    let totalCOGS = materialExp + transportExp + docRegExp + etcInsuranceExp + importTaxExp;
    if (totalCOGS === 0 && totalRevenue > 0) totalCOGS = Math.round(totalRevenue * 0.33);

    const grossProfit = totalRevenue - totalCOGS;

    let totalHOExpenses = rentExp + officeSuppliesExp + hoSalariesExp + accountingFeeExp + hoOtherExp;
    if (totalHOExpenses === 0 && totalRevenue > 0) totalHOExpenses = Math.round(totalRevenue * 0.11);

    let totalSalesExpenses = salesSalariesExp + salesCommExp + staffEntExp + custEntExp + scrubExp;
    if (totalSalesExpenses === 0 && totalRevenue > 0) totalSalesExpenses = Math.round(totalRevenue * 0.16);

    const totalExpenses = totalHOExpenses + totalSalesExpenses;
    const netEarnings = grossProfit - totalExpenses;

    const cogsRatio = totalRevenue > 0 ? (totalCOGS / totalRevenue) * 100 : 0;
    const grossMarginRatio = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const hoRatio = totalRevenue > 0 ? (totalHOExpenses / totalRevenue) * 100 : 0;
    const salesRatio = totalRevenue > 0 ? (totalSalesExpenses / totalRevenue) * 100 : 0;
    const netMarginRatio = totalRevenue > 0 ? (netEarnings / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      materialExp,
      transportExp,
      docRegExp,
      etcInsuranceExp,
      importTaxExp,
      totalCOGS,
      cogsRatio,
      grossProfit,
      grossMarginRatio,
      rentExp,
      officeSuppliesExp,
      hoSalariesExp,
      accountingFeeExp,
      hoOtherExp,
      totalHOExpenses,
      hoRatio,
      salesSalariesExp,
      salesCommExp,
      staffEntExp,
      custEntExp,
      scrubExp,
      totalSalesExpenses,
      salesRatio,
      totalExpenses,
      netEarnings,
      netMarginRatio
    };
  }, [filteredTransactions]);

  // Number Formatter Helper for Spreadsheet Matrix
  const fmtNum = (val) => {
    const n = Number(val) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header Banner & Date Range Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner text-indigo-400">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                FINANCIAL STATEMENTS ENGINE
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">งบกำไรขาดทุน P&L, Cash Flow & งบดุล (Monthly Financial Spreadsheet)</h2>
          </div>
        </div>

        {/* Date Range Picker & Year Selector Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2.5 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <div className="flex items-center gap-1.5 mr-1 border-r border-slate-800 pr-2">
            <span className="font-extrabold text-amber-400">ปีที่เลือก:</span>
            {['2026', '2025', '2024', '2023', 'all'].map(yr => (
              <button
                key={yr}
                onClick={() => { setSelectedYear(yr); if (yr !== 'all') handleApplyYearlyPreset(Number(yr)); else handleClearDateRange(); }}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all text-xs ${
                  selectedYear === yr
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {yr === 'all' ? 'ทั้งหมด' : yr}
              </button>
            ))}
          </div>

          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>ช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPeriodPreset('custom'); }}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPeriodPreset('custom'); }}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={handleClearDateRange} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStatementTab('monthly_matrix')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border ${
            statementTab === 'monthly_matrix'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
          }`}
        >
          <span>📊 ตารางงบการเงิน 12 เดือนเต็ม (Monthly Spreadsheet Matrix)</span>
        </button>

        <button
          onClick={() => setStatementTab('p_l')}
          className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border ${
            statementTab === 'p_l'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border-slate-800'
          }`}
        >
          <span>📑 สรุปงบกำไรขาดทุน P&L</span>
        </button>

        <button
          onClick={() => window.print()}
          className="ml-auto px-4 py-2 rounded-xl font-extrabold text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-2 transition-all print:hidden"
        >
          <span>🖨️</span>
          <span>พิมพ์ / บันทึก PDF รายงานงบ</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: MONTHLY 12-MONTH SPREADSHEET MATRIX (JAN-DEC + FULL YEAR) */}
      {/* ---------------------------------------------------- */}
      {statementTab === 'monthly_matrix' && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0">
          
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>📊 ตารางสรุปงบกำไรขาดทุน, Cash Flow & งบดุล รายเดือนปี {selectedYear}</span>
              </h3>
              <p className="text-xs text-slate-400">ตารางแสดงเปรียบเทียบ 12 เดือนเต็ม (January - December) และยอดรวมทั้งปี (Full Year)</p>
            </div>
            <div className="text-xs text-amber-300 font-mono font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
              12 Months Matrix Enabled
            </div>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-right text-[11px] font-mono border-collapse select-text">
              
              {/* Header Row */}
              <thead>
                <tr className="bg-[#0b1329] text-white font-sans text-xs border-b-2 border-slate-700">
                  <th className="p-2.5 text-left font-bold min-w-[240px] sticky left-0 bg-[#0b1329] z-10 border-r border-slate-800">
                    รายการบัญชี / เดือน
                  </th>
                  {monthlyMatrix.months.map(m => (
                    <th key={m.name} className="p-2.5 font-bold min-w-[100px] border-r border-slate-800/60 text-center">
                      {m.name}
                    </th>
                  ))}
                  <th className="p-2.5 font-black min-w-[120px] bg-[#111c38] text-amber-300 text-center border-l-2 border-slate-700">
                    Full Year
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/40">
                
                {/* 1. REVENUE SECTION */}
                <tr className="bg-slate-900/60 text-slate-300">
                  <td className="p-2 text-left font-sans font-medium sticky left-0 bg-slate-900/90 border-r border-slate-800">Returns, Refunds, Discounts</td>
                  {monthlyMatrix.months.map(m => (
                    <td key={m.name} className="p-2 border-r border-slate-800/40 text-slate-400">{fmtNum(m.returnsDiscounts)}</td>
                  ))}
                  <td className="p-2 font-bold bg-slate-900 text-slate-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.returnsDiscounts)}</td>
                </tr>

                <tr className="bg-[#102447] text-white font-bold border-y-2 border-blue-600/50">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#102447] border-r border-slate-800 text-blue-200">Total Net Revenue</td>
                  {monthlyMatrix.months.map(m => (
                    <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-blue-200">{fmtNum(m.totalNetRevenue)}</td>
                  ))}
                  <td className="p-2.5 font-black text-amber-300 bg-[#0d1c38] border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalNetRevenue)}</td>
                </tr>

                {/* 2. COGS SECTION (33%) */}
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Material Expense ค่าซื้อสินค้า</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.materialExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.materialExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Transportation Expense ค่าขนส่ง สินค้า</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.transportExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.transportExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Document Registration ค่า จด เอกสาร ต่างๆ</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.docRegExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.docRegExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">ETC, โต๊ะโค้ด & ค่าประกันของ</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.etcInsuranceExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.etcInsuranceExp)}</td>
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Import Tax ภาษีนำเข้า</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.importTaxExp)}</td>)}
                  <td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.importTaxExp)}</td>
                </tr>
                <tr className="bg-[#1e1b4b] text-indigo-200 font-bold border-y border-indigo-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#1e1b4b] border-r border-slate-800">Cost of Goods Sold 33%</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-rose-300">{fmtNum(m.cogsTotal)}</td>)}
                  <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.cogsTotal)}</td>
                </tr>

                {/* GROSS PROFIT */}
                <tr className="bg-[#064e3b] text-emerald-100 font-extrabold border-y-2 border-emerald-500/50">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#064e3b] border-r border-slate-800">Gross Profit</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-emerald-200">{fmtNum(m.grossProfit)}</td>)}
                  <td className="p-2.5 font-black text-emerald-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.grossProfit)}</td>
                </tr>

                {/* 3. EXPENSES H/O 11% */}
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Rent ค่าเช่า</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.rentExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.rentExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Office Supplies ค่าใช้จ่ายออฟฟิศ</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.officeSuppliesExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.officeSuppliesExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Transportation & Postal ค่าส่งของ และค่าเดินทางของ H/O</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.postalExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.postalExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Office Other Expense ค่าใช้จ่ายอื่นๆ ออฟฟิศ</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.officeOtherExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.officeOtherExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Salaries, Benefits & Wages H/O เงินเดือน พนักงาน H/O</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.hoSalariesExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.hoSalariesExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Accounting Fee ค่าทำบัญชี</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.accountingFeeExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.accountingFeeExp)}</td></tr>
                <tr className="bg-[#1e1b4b] text-indigo-200 font-bold border-y border-indigo-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#1e1b4b] border-r border-slate-800">Expenses H/O 11%</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-indigo-300">{fmtNum(m.hoTotal)}</td>)}
                  <td className="p-2.5 font-black text-indigo-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.hoTotal)}</td>
                </tr>

                {/* 4. SALES EXPENSES (16%) */}
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Salaries, Benefits & Wages Sales เงินเดือนเซลล์</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.salesSalariesExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.salesSalariesExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Incentive Commission ค่าคอมแซลส์</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.incentiveCommExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.incentiveCommExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Staff Entertainment เลี้ยงทีมเซลล์</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.staffEntExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.staffEntExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Customers Entertainment ค่ารับรองลูกค้า</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.custEntExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.custEntExp)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Scrub Expense ค่าเข้าเคส สครับ</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.scrubExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.scrubExp)}</td></tr>
                <tr className="bg-[#3b0764] text-purple-200 font-bold border-y border-purple-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#3b0764] border-r border-slate-800">Sales Expense 16%</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-purple-300">{fmtNum(m.salesTotal)}</td>)}
                  <td className="p-2.5 font-black text-purple-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.salesTotal)}</td>
                </tr>

                {/* 5. SUMMARY & NET EARNINGS */}
                <tr className="bg-[#4c0519] text-rose-200 font-bold border-y-2 border-rose-600/50">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#4c0519] border-r border-slate-800">Total Expenses</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-rose-300">{fmtNum(m.totalExpenses)}</td>)}
                  <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalExpenses)}</td>
                </tr>

                <tr className="bg-[#022c22] text-emerald-200 font-extrabold border-y border-emerald-500/40">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#022c22] border-r border-slate-800">Earnings Before Interest & Taxes</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40">{fmtNum(m.ebit)}</td>)}
                  <td className="p-2.5 font-black border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.ebit)}</td>
                </tr>

                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800 pl-4">Interest Expense ดอกเบี้ย</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.interestExp)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.interestExp)}</td></tr>

                <tr className="bg-[#064e3b] text-emerald-100 font-black border-y-2 border-emerald-400">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#064e3b] border-r border-slate-800">Net Earnings</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-emerald-300">{fmtNum(m.netEarnings)}</td>)}
                  <td className="p-2.5 font-black text-amber-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.netEarnings)}</td>
                </tr>

                <tr className="bg-[#14532d] text-emerald-200 font-bold border-b-2 border-emerald-600">
                  <td className="p-2 text-left font-sans text-xs sticky left-0 bg-[#14532d] border-r border-slate-800">Cash flow</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40 text-emerald-300">{fmtNum(m.cashFlow)}</td>)}
                  <td className="p-2 font-black text-emerald-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.cashFlow)}</td>
                </tr>

                {/* 6. BALANCE SHEET SECTION */}
                <tr className="bg-[#1e3a8a] text-white font-extrabold text-xs uppercase tracking-wider">
                  <td colSpan="14" className="p-3 text-left bg-[#1e3a8a]">🏛️ Balance Sheet (งบดุล & สินทรัพย์ หนี้สิน)</td>
                </tr>

                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">Liability ลูกหนี้</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.accountsReceivable)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.accountsReceivable)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">Cash เงินสด ใบโบก วันสิ้นเดือน</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.cashBalance)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.cashBalance)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">Stock (สินค้าคงคลัง)</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.stockVal)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.stockVal)}</td></tr>
                
                <tr className="bg-[#064e3b] text-emerald-100 font-extrabold border-y-2 border-emerald-500">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#064e3b] border-r border-slate-800">สินทรัพย์ รวม (Total Assets)</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-emerald-300">{fmtNum(m.totalAssets)}</td>)}
                  <td className="p-2.5 font-black text-amber-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalAssets)}</td>
                </tr>

                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เจ้าหนี้ ค่าของคงค้าง</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.accountsPayable)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.accountsPayable)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินกู้ 1.5 Sme Bank</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.smeBank1)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.smeBank1)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินกู้ 2 Sme Bank</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.smeBank2)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.smeBank2)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินกู้ ญาติคุณ 2 ล้าน</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.relativeLoan)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.relativeLoan)}</td></tr>
                <tr className="bg-slate-900/40"><td className="p-2 text-left font-sans text-slate-300 sticky left-0 bg-slate-900/90 border-r border-slate-800">เงินทุนผู้ถือหุ้น</td>{monthlyMatrix.months.map(m => <td key={m.name} className="p-2 border-r border-slate-800/40">{fmtNum(m.equityCapital)}</td>)}<td className="p-2 font-bold border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.equityCapital)}</td></tr>
                
                <tr className="bg-[#4c0519] text-rose-200 font-bold border-t-2 border-rose-600">
                  <td className="p-2.5 text-left font-sans sticky left-0 bg-[#4c0519] border-r border-slate-800">หนี้สินรวม (Total Liabilities)</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-rose-300">{fmtNum(m.totalLiabilities)}</td>)}
                  <td className="p-2.5 font-black text-rose-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalLiabilities)}</td>
                </tr>

                <tr className="bg-[#78350f] text-amber-100 font-black border-y-2 border-amber-400">
                  <td className="p-2.5 text-left font-sans text-xs sticky left-0 bg-[#78350f] border-r border-slate-800">หนี้สินรวม สม หนี้สิน (Total Equity & Liabilities)</td>
                  {monthlyMatrix.months.map(m => <td key={m.name} className="p-2.5 border-r border-slate-800/40 text-amber-300">{fmtNum(m.totalEquityLiabilities)}</td>)}
                  <td className="p-2.5 font-black text-amber-300 border-l-2 border-slate-700">{fmtNum(monthlyMatrix.fullYear.totalEquityLiabilities)}</td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      // TAB 2: P&L EXECUTIVE SUMMARY
      {/* ---------------------------------------------------- */}
      {statementTab === 'p_l' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">💰 รายรับรวม (Total Revenue)</div>
              <div className="text-xl font-black font-mono text-emerald-400">
                {pnlBreakdown.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">100% สัดส่วนรายรับ</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">📦 ต้นทุนขาย COGS (33%)</div>
              <div className="text-xl font-black font-mono text-rose-400">
                {(pnlBreakdown?.totalCOGS || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">สัดส่วน: {(Number(pnlBreakdown?.cogsRatio) || 0).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">🏢 กำไรขั้นต้น Gross Profit</div>
              <div className="text-xl font-black font-mono text-indigo-300">
                {(pnlBreakdown?.grossProfit || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">Margin: {(Number(pnlBreakdown?.grossMarginRatio) || 0).toFixed(1)}%</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold">💵 กำไรสุทธิ Net Profit Margin</div>
              <div className={`text-xl font-black font-mono ${(pnlBreakdown?.netEarnings || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(pnlBreakdown?.netEarnings || 0).toLocaleString('th-TH', { minimumFractionDigits: 0 })} บ.
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">Net Margin: {(Number(pnlBreakdown?.netMarginRatio) || 0).toFixed(1)}%</div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-white text-sm">
                📑 งบกำไรขาดทุน P&L สรุปผลการดำเนินงาน (Profit & Loss Statement)
              </h3>
              <span className="text-xs text-amber-300 font-mono font-bold">
                ปีที่เลือก: {selectedYear}
              </span>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30 font-bold">
                <span className="text-emerald-300">💰 1. รายรับจากยอดขายสินค้าเครื่องมือแพทย์ (Total Revenue)</span>
                <span className="font-mono text-emerald-400 text-sm">
                  {(pnlBreakdown?.totalRevenue || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท (100%)
                </span>
              </div>

              <div className="space-y-1 pl-3 border-l-2 border-rose-500/40">
                <div className="flex justify-between font-bold text-slate-300 py-1">
                  <span>📦 2. ต้นทุนขาย COGS (Target 33%)</span>
                  <span className="font-mono text-rose-400">
                    -{(pnlBreakdown?.totalCOGS || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.cogsRatio) || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าซื้อสินค้า (Material Expense)</span>
                  <span className="font-mono">-{(pnlBreakdown?.materialExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าขนส่งสินค้า (Transportation Expense)</span>
                  <span className="font-mono">-{(pnlBreakdown?.transportExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าจดเอกสารต่างๆ / ภาษีนำเข้า</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.docRegExp || 0) + (pnlBreakdown?.importTaxExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-bold">
                <span className="text-white">🏢 กำไรขั้นต้น (Gross Profit)</span>
                <span className="font-mono text-indigo-300 text-sm">
                  {(pnlBreakdown?.grossProfit || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.grossMarginRatio) || 0).toFixed(1)}%)
                </span>
              </div>

              <div className="space-y-1 pl-3 border-l-2 border-indigo-500/40">
                <div className="flex justify-between font-bold text-slate-300 py-1">
                  <span>🏢 3. ค่าใช้จ่ายสำนักงานใหญ่ H/O (Target 11%)</span>
                  <span className="font-mono text-rose-400">
                    -{(pnlBreakdown?.totalHOExpenses || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.hoRatio) || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าเช่า Rent & ออฟฟิศ</span>
                  <span className="font-mono">-{( (pnlBreakdown?.rentExp || 0) + (pnlBreakdown?.officeSuppliesExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- เงินเดือน & สวัสดิการพนักงาน H/O</span>
                  <span className="font-mono">-{(pnlBreakdown?.hoSalariesExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าทำบัญชี & อื่นๆ</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.accountingFeeExp || 0) + (pnlBreakdown?.hoOtherExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
              </div>

              <div className="space-y-1 pl-3 border-l-2 border-amber-500/40">
                <div className="flex justify-between font-bold text-slate-300 py-1">
                  <span>💼 4. ค่าใช้จ่ายฝ่ายขาย Sales Expenses (Target 16%)</span>
                  <span className="font-mono text-rose-400">
                    -{(pnlBreakdown?.totalSalesExpenses || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.salesRatio) || 0).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- เงินเดือนเซลล์ & คอมมิชชั่น</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.salesSalariesExp || 0) + (pnlBreakdown?.salesCommExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- เลี้ยงทีมเซลล์ & ค่ารับรองลูกค้า</span>
                  <span className="font-mono font-bold">-{((pnlBreakdown?.staffEntExp || 0) + (pnlBreakdown?.custEntExp || 0)).toLocaleString('th-TH')} บาท</span>
                </div>
                <div className="flex justify-between text-slate-400 pl-4 py-0.5 text-[11px]">
                  <span>- ค่าเข้าเคสสครับ (Scrub Expense)</span>
                  <span className="font-mono">-{(pnlBreakdown?.scrubExp || 0).toLocaleString('th-TH')} บาท</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-950/60 to-slate-900 rounded-xl border border-emerald-500/40 font-black text-sm pt-3">
                <span className="text-emerald-300">🎉 5. กำไรสุทธิก่อนภาษี (Net Earnings / EBITDA)</span>
                <span className="font-mono text-emerald-400">
                  {(pnlBreakdown?.netEarnings || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ({(Number(pnlBreakdown?.netMarginRatio) || 0).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
