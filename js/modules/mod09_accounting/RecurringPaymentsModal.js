// MODULE: mod09_accounting/RecurringPaymentsModal.js

function RecurringPaymentsModal({ templates = [], onSaveTemplate, onDeleteTemplate, onGenerateDrafts, onClose }) {
  const [newTitle, setNewTitle] = useState('');
  const [newExpenseType, setNewExpenseType] = useState('ค่าเช่า');
  const [newAccountType, setNewAccountType] = useState('บริษัท KBANK');
  const [newAmount, setNewAmount] = useState(0);
  const [newWht, setNewWht] = useState(0);
  const [newPayee, setNewPayee] = useState('');
  const [newDueDay, setNewDueDay] = useState(28);

  const handleAddTemplate = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('กรุณาระบุชื่อรายการประจำ');
      return;
    }

    const tData = {
      id: `REC-${Date.now()}`,
      title: newTitle,
      expense_type: newExpenseType,
      account_type: newAccountType,
      amount: Number(newAmount) || 0,
      withholding_tax: Number(newWht) || 0,
      payee: newPayee,
      due_day_of_month: Number(newDueDay) || 28,
      is_active: true
    };

    if (window.saveAeronDictionaryItem) {
      if (newTitle) window.saveAeronDictionaryItem('title', newTitle);
      if (newPayee) window.saveAeronDictionaryItem('payee', newPayee);
    }
    onSaveTemplate(tData);
    setNewTitle('');
    setNewAmount(0);
    setNewWht(0);
    setNewPayee('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-3xl rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner">
              🔄
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">ระบบตั้งค่าและจ่ายเงินประจำเดือน (Monthly Recurring Payments)</h3>
              <p className="text-xs text-slate-400">กำหนดรายการจ่ายประจำ และสร้างรายการร่าง (Drafts) อัตโนมัติทุกต้นเดือน</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Generate Drafts Action Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 rounded-2xl border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-white text-sm">⚡ สร้างรายการร่างประจำเดือนใหม่ (Auto Draft Generator)</div>
            <div className="text-slate-300 text-[11px] mt-0.5">
              สร้างรายการจ่ายประจำประจำเดือนปัจจุบันเข้าสู่ตาราง Daily Log อัตโนมัติ เพื่อรอแอดมินแนบสลิปและยืนยัน
            </div>
          </div>
          <button
            onClick={onGenerateDrafts}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <span>⚡ สั่งสร้าง Draft ประจำเดือน</span>
          </button>
        </div>

        {/* Existing Templates Table */}
        <div className="space-y-2 overflow-y-auto max-h-[35vh]">
          <h4 className="font-bold text-slate-200 text-xs flex items-center justify-between">
            <span>📋 รายการจ่ายประจำทั้งหมด ({templates.length} รายการ)</span>
          </h4>

          <div className="space-y-1.5 text-xs">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic bg-slate-950/40 rounded-xl">
                ยังไม่มีรายการจ่ายประจำในระบบ
              </div>
            ) : (
              templates.map(t => (
                <div key={t.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.2 bg-slate-800 text-indigo-300 rounded font-mono">{t.expense_type}</span>
                      <span>🏦 {t.account_type}</span>
                      <span>👤 ผู้รับ: {t.payee || '-'}</span>
                      <span className="text-slate-500">📅 ทุกวันที่ {t.due_day_of_month}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <div className="font-extrabold text-rose-400">-{Number(t.amount).toLocaleString()} บ.</div>
                      {t.withholding_tax > 0 && (
                        <div className="text-[10px] text-indigo-300">WHT: {t.withholding_tax} บ.</div>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteTemplate(t.id)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-[11px]"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add New Template Form */}
        <form onSubmit={handleAddTemplate} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
          <div className="font-bold text-amber-300 text-xs">➕ เพิ่มรายการจ่ายประจำใหม่</div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">ชื่อรายการประจำ *</label>
              <SmartSuggestInput
                category="title"
                required
                placeholder="เช่น ค่าเช่าออฟฟิศ, ค่าทำบัญชี..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">หมวดหมู่ค่าใช้จ่าย</label>
              <select
                value={newExpenseType}
                onChange={(e) => setNewExpenseType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
              >
                <option value="ค่าเช่า">ค่าเช่า</option>
                <option value="ค่าทำบัญชี">ค่าทำบัญชี</option>
                <option value="ค่าใช้จ่ายออฟฟิศ">ค่าใช้จ่ายออฟฟิศ</option>
                <option value="เงินเดือนเซลล์">เงินเดือนเซลล์</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">จำนวนเงิน (บาท) *</label>
              <input
                type="number"
                required
                min="0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">ผู้รับเงิน (Payee)</label>
              <SmartSuggestInput
                category="payee"
                placeholder="เช่น อาคารออฟฟิศ..."
                value={newPayee}
                onChange={(e) => setNewPayee(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">กำหนดจ่ายทุกวันที่</label>
              <input
                type="number"
                min="1"
                max="31"
                value={newDueDay}
                onChange={(e) => setNewDueDay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              + เพิ่มรายการจ่ายประจำ
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
