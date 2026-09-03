// MODULE: mod09_accounting/PettyCashModal.js

function PettyCashModal({ isOpen, onClose, onSave }) {
  const [pettyAccounts, setPettyAccounts] = useState([]);
  const [newEmpName, setNewEmpName] = useState('');
  const [newLimit, setNewLimit] = useState(20000);

  // Initial Load from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('aeron_petty_cash_accounts');
        if (saved) {
          setPettyAccounts(JSON.parse(saved));
        } else {
          setPettyAccounts([
            { id: 'pc-1', empName: 'คุณตู้', limit: 20000, name: 'เงินสดสำรองจ่าย - คุณตู้ (Petty Cash)' },
            { id: 'pc-2', empName: 'คุณแบงค์', limit: 15000, name: 'เงินสดสำรองจ่าย - คุณแบงค์ (Petty Cash)' }
          ]);
        }
      } catch (e) {
        setPettyAccounts([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddPettyAccount = (e) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const empClean = newEmpName.trim();
    const newAcc = {
      id: 'pc-' + Date.now(),
      empName: empClean,
      limit: Number(newLimit) || 0,
      name: `เงินสดสำรองจ่าย - ${empClean} (Petty Cash)`
    };

    const updated = [...pettyAccounts, newAcc];
    setPettyAccounts(updated);
    setNewEmpName('');
    setNewLimit(20000);
  };

  const handleDeletePettyAccount = (id) => {
    if (confirm('คุณต้องการลบบัญชีเงินสดสำรองจ่ายนี้หรือไม่?')) {
      const updated = pettyAccounts.filter(a => a.id !== id);
      setPettyAccounts(updated);
    }
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem('aeron_petty_cash_accounts', JSON.stringify(pettyAccounts));
      if (typeof syncToDB === 'function') syncToDB('petty_cash_accounts', pettyAccounts);
      if (onSave) onSave(pettyAccounts);
      onClose();
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30">
              💵
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">ตั้งค่าบัญชีเงินสดสำรองจ่ายรายบุคคล (Petty Cash)</h3>
              <p className="text-xs text-slate-400">สำหรับ Head Admin เพิ่ม/จัดการวงเงินสำรองจ่ายประจำตัวพนักงาน</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">✕</button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Add New Petty Cash Account Form */}
          <form onSubmit={handleAddPettyAccount} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>➕ เพิ่มบัญชีเงินสดสำรองจ่ายใหม่</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อพนักงานผู้ถือเงินสำรองจ่าย *</label>
                <input
                  type="text"
                  placeholder="เช่น คุณตู้, คุณแบงค์, คุณหมิว"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">วงเงิน/ยอดตั้งสำรอง (บาท)</label>
                <input
                  type="number"
                  placeholder="20000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <span>➕ บันทึกเพิ่มบัญชีเงินสดสำรองจ่าย</span>
            </button>
          </form>

          {/* List of Active Petty Cash Accounts */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-slate-300 flex items-center justify-between">
              <span>📋 รายการบัญชีเงินสดสำรองจ่ายที่มีในระบบ ({pettyAccounts.length} บัญชี)</span>
            </div>

            {pettyAccounts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800">
                ยังไม่มีการตั้งค่าบัญชีเงินสดสำรองจ่าย
              </div>
            ) : (
              <div className="space-y-2">
                {pettyAccounts.map((acc) => (
                  <div key={acc.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center text-sm font-bold border border-amber-500/20">
                        👤
                      </div>
                      <div>
                        <div className="font-extrabold text-white text-xs">{acc.name}</div>
                        <div className="text-[11px] text-slate-400">
                          พนักงาน: <span className="text-amber-300 font-bold">{acc.empName}</span> | วงเงินตั้งสำรอง: <span className="font-mono text-emerald-400 font-bold">{Number(acc.limit || 0).toLocaleString()} บาท</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePettyAccount(acc.id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs transition-colors"
                      title="ลบบัญชีนี้"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20"
          >
            💾 บันทึกการเปลี่ยนแปลงทั้งหมด
          </button>
        </div>

      </div>
    </div>
  );
}
