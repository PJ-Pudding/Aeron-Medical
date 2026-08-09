// MODULE: mod09_accounting/HospitalPayeeAnalyticsView.js

function HospitalPayeeAnalyticsView({ transactions = [] }) {
  const [subReport, setSubReport] = useState('profitability'); // profitability, hospital_rev, payee_disb, hospital_exp
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedPayee, setSelectedPayee] = useState('all');

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Range Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || t.status === '⏳ รอโอนเงิน') {
        return false;
      }
      if (t.date) {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
      }
      return true;
    });
  }, [transactions, startDate, endDate]);

  // List of unique hospitals & payees
  const hospitalList = useMemo(() => {
    const set = new Set();
    filteredTransactions.forEach(t => {
      if (t.hospital_name && t.hospital_name.trim()) set.add(t.hospital_name.trim());
    });
    return Array.from(set).sort();
  }, [filteredTransactions]);

  const payeeList = useMemo(() => {
    const set = new Set();
    filteredTransactions.forEach(t => {
      if (t.payee && t.payee.trim()) set.add(t.payee.trim());
    });
    return Array.from(set).sort();
  }, [filteredTransactions]);

  // 1. Profitability Summary by Hospital
  const hospitalProfitability = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(t => {
      const hName = t.hospital_name && t.hospital_name.trim() ? t.hospital_name.trim() : 'ไม่ระบุโรงพยาบาล';
      if (!map[hName]) {
        map[hName] = { revenue: 0, expenses: 0, netProfit: 0, txnCount: 0, lastDate: '' };
      }
      const netVal = Number(t.net_transfer) || 0;
      map[hName].txnCount++;
      if (t.date && (!map[hName].lastDate || t.date > map[hName].lastDate)) {
        map[hName].lastDate = t.date;
      }

      if (t.transaction_type === 'รายรับ') {
        map[hName].revenue += netVal;
        map[hName].netProfit += netVal;
      } else {
        map[hName].expenses += netVal;
        map[hName].netProfit -= netVal;
      }
    });

    return Object.keys(map).map(hName => {
      const data = map[hName];
      const margin = data.revenue > 0 ? (data.netProfit / data.revenue) * 100 : 0;
      return { hospital: hName, ...data, margin };
    }).sort((a, b) => b.netProfit - a.netProfit);
  }, [filteredTransactions]);

  // 2. Payee Disbursements Breakdown
  const payeeBreakdown = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(t => {
      if (t.transaction_type !== 'รายจ่าย') return;
      const pName = t.payee && t.payee.trim() ? t.payee.trim() : 'ไม่ระบุผู้รับเงิน';
      if (!map[pName]) {
        map[pName] = { payee: pName, totalAmount: 0, txnCount: 0, categories: {}, lastDate: '' };
      }
      const netVal = Number(t.net_transfer) || 0;
      map[pName].totalAmount += netVal;
      map[pName].txnCount++;
      if (t.date && (!map[pName].lastDate || t.date > map[pName].lastDate)) {
        map[pName].lastDate = t.date;
      }

      const cat = t.expense_type || 'ทั่วไป';
      map[pName].categories[cat] = (map[pName].categories[cat] || 0) + netVal;
    });

    return Object.values(map).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Header & Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400">
            🏥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HOSPITAL & PAYEE DRILL-DOWN ANALYTICS
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">รายงานวิเคราะห์เจาะลึกรายโรงพยาบาล & บุคคลผู้รับเงิน</h2>
          </div>
        </div>

        {/* High-Contrast Vibrant Yellow Date Range Picker Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>ช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}
        </div>
      </div>

      {/* Sub Report Navigation */}
      <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setSubReport('profitability')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            subReport === 'profitability' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🏆 สรุปกำไรสุทธิตามโรงพยาบาล (Hospital Profitability)
        </button>
        <button
          onClick={() => setSubReport('payee_disb')}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            subReport === 'payee_disb' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          💸 สรุปการจ่ายเงินให้บุคคล/ผู้รับเงิน (Payee Disbursements)
        </button>
      </div>

      {/* Sub Report 1: Hospital Profitability Table */}
      {subReport === 'profitability' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm">
              🏥 สรุปรายรับ รายจ่าย และกำไรสุทธิ แยกรายโรงพยาบาล (Hospital Profitability Matrix)
            </h3>
            <span className="text-xs text-amber-300 font-mono font-bold">
              {hospitalProfitability.length} โรงพยาบาล
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">โรงพยาบาล / โครงการ</th>
                  <th className="p-3 text-right">รายรับรวม (วางบิล รพ.)</th>
                  <th className="p-3 text-right">รายจ่ายรวม (ต้นทุน+DF)</th>
                  <th className="p-3 text-right">กำไรสุทธิ (Net Profit)</th>
                  <th className="p-3 text-right">Net Margin %</th>
                  <th className="p-3 text-center">จำนวนรายการ</th>
                  <th className="p-3">ทำรายการล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {hospitalProfitability.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                      ไม่พบข้อมูลรายรับ-รายจ่ายของโรงพยาบาลในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  hospitalProfitability.map(h => (
                    <tr key={h.hospital} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span>🏥</span> <span>{h.hospital}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {h.revenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        {h.expenses.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 text-right font-mono font-extrabold ${h.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {h.netProfit.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 text-right font-mono font-bold ${h.margin >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
                        {(Number(h?.margin) || 0).toFixed(1)}%
                      </td>
                      <td className="p-3 text-center font-mono text-slate-400">{h.txnCount}</td>
                      <td className="p-3 font-mono text-slate-400">{h.lastDate || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Report 2: Payee Disbursements Breakdown */}
      {subReport === 'payee_disb' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-extrabold text-white text-sm">
              💸 รายงานสรุปการจ่ายเงินออกให้บุคคล (Payee Disbursements Audit)
            </h3>
            <span className="text-xs text-purple-300 font-mono font-bold">
              {payeeBreakdown.length} บุคคล/ผู้รับเงิน
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ชื่อผู้รับเงิน / แพทย์ / เคสสครับ / บริษัท</th>
                  <th className="p-3 text-right">ยอดจ่ายเงินออกรวม (บาท)</th>
                  <th className="p-3">หมวดหมู่ค่าใช้จ่ายหลัก</th>
                  <th className="p-3 text-center">จำนวนครั้งที่โอน</th>
                  <th className="p-3">โอนล่าสุดเมื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payeeBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                      ไม่พบประวัติการโอนเงินออกในระบบช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  payeeBreakdown.map(p => (
                    <tr key={p.payee} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span>👤</span> <span>{p.payee}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-rose-400 text-sm">
                        {p.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(p.categories).map(cat => (
                            <span key={cat} className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10.5px]">
                              {cat}: {p.categories[cat].toLocaleString('th-TH')} บ.
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">{p.txnCount}</td>
                      <td className="p-3 font-mono text-slate-400">{p.lastDate || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
