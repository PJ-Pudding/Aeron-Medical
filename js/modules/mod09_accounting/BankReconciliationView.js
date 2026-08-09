// MODULE: mod09_accounting/BankReconciliationView.js

function BankReconciliationView({ transactions = [] }) {
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Filtered Transactions
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

  // Reconciliation balances
  const bankReconData = useMemo(() => {
    const accounts = window.getCompanyAccounts ? window.getCompanyAccounts() : ['Aeron Kbank ออมทรัพย์', 'Aeron Kbank กระแสรายวัน', 'Aeron Kbank ฝากประจำ', 'Aeron SCB ออมทรัพย์', 'Aeron SCB กระแสรายวัน'];
    const map = {};

    accounts.forEach(acc => {
      map[acc] = {
        accountName: acc,
        totalIncome: 0,
        totalExpense: 0,
        endingBalance: 0,
        txnCount: 0,
        txns: []
      };
    });

    filteredTransactions.forEach(t => {
      const acc = t.account_type || 'Aeron Kbank ออมทรัพย์';
      if (!map[acc]) {
        map[acc] = { accountName: acc, totalIncome: 0, totalExpense: 0, endingBalance: 0, txnCount: 0, txns: [] };
      }
      const netVal = Number(t.net_transfer) || 0;
      map[acc].txnCount++;
      map[acc].txns.push(t);

      if (t.transaction_type === 'รายรับ') {
        map[acc].totalIncome += netVal;
        map[acc].endingBalance += netVal;
      } else {
        map[acc].totalExpense += netVal;
        map[acc].endingBalance -= netVal;
      }
    });

    return Object.values(map);
  }, [filteredTransactions]);

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-3xl shadow-inner text-amber-400">
            🏦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                AUTOMATED BANK RECONCILIATION
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">ระบบพิสูจน์ยอดและสรุปดุลบัญชีธนาคารองค์กร (Reconciliation Engine)</h2>
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

      {/* Reconciliation Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bankReconData.map(acc => (
          <div key={acc.accountName} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>🏦 {acc.accountName}</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono font-bold">
                {acc.txnCount} รายการ
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10.5px] text-slate-400 font-medium">💰 เงินรับเข้า</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  +{acc.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10.5px] text-slate-400 font-medium">💸 เงินจ่ายออก</div>
                <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                  -{acc.totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10.5px] text-slate-400 font-medium">💵 ดุลสุทธิ</div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${acc.endingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {acc.endingBalance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
