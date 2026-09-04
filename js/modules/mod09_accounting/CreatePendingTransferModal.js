// MODULE: mod09_accounting/CreatePendingTransferModal.js

function CreatePendingTransferModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: `TXN-DRAFT-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`,
    date: new Date().toISOString().split('T')[0],
    title: '',
    expense_type: 'ค่าเช่า Rent',
    account_type: 'บริษัท KBANK',
    amount: 0,
    withholding_tax: 0,
    social_security: 0,
    loan_for_employee: 0,
    net_transfer: 0,
    payee: '',
    transaction_type: 'รายจ่าย',
    status: '⏳ รอโอน',
    rejection_reason: '',
    off_book_expense: false,
    hospital_name: '',
    notes: '[ตั้งค้างโอนประจำเดือน] รอผู้บริหารโอนเงินและแนบสลิป',
    vat_eligible: false,
    tax_deductible: true,
    pnd_submitted: false,
    attachment_url: '',
    is_pending_draft: true,
    created_by: 'ADMIN',
    updated_at: new Date().toISOString()
  });

  // Auto-calculate net_transfer
  useEffect(() => {
    const amt = Number(formData.amount) || 0;
    const wht = Number(formData.withholding_tax) || 0;
    const soc = Number(formData.social_security) || 0;
    const loan = Number(formData.loan_for_employee) || 0;
    
    const computedNet = formData.transaction_type === 'รายรับ'
      ? Math.max(0, amt - wht)
      : Math.max(0, amt - wht - soc - loan);

    setFormData(prev => ({ ...prev, net_transfer: computedNet }));
  }, [formData.amount, formData.withholding_tax, formData.social_security, formData.loan_for_employee, formData.transaction_type]);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleApplyTaxRate = (ratePercent) => {
    const amt = Number(formData.amount) || 0;
    const calculatedTax = (amt * ratePercent) / 100;
    setFormData(prev => ({ ...prev, withholding_tax: Math.round(calculatedTax * 100) / 100 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('กรุณาระบุชื่อรายการค้างโอน');
      return;
    }
    if (!formData.payee.trim()) {
      alert('กรุณาระบุผู้รับเงิน');
      return;
    }

    if (window.saveAeronDictionaryItem) {
      if (formData.payee) window.saveAeronDictionaryItem('payee', formData.payee);
      if (formData.title) window.saveAeronDictionaryItem('title', formData.title);
      if (formData.hospital_name) window.saveAeronDictionaryItem('hospital', formData.hospital_name);
    }
    onSave({ ...formData, updated_at: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 w-full max-w-2xl rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
              📌
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>📌 ตั้งรายการค้างโอนประจำเดือน (New Pending Transfer Draft)</span>
              </h3>
              <p className="text-xs text-slate-400">รายละเอียดฟิลด์และการคำนวณเหมือนบันทึกประจำวันทุกประการ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            สถานะเริ่มต้นเป็น <strong>"⏳ รอโอน"</strong> โดยจะไปสแตนด์บายในแท็บ <strong>"⏳ ค้างโอนประจำเดือน"</strong> และยังไม่นำไปแสดงในตารางรายวันหลัก จนกว่าแอดมินจะกด <strong>"✅ ยืนยันและแนบสลิป"</strong>
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทธุรกรรม <span className="text-rose-400">*</span></label>
              <select
                value={formData.transaction_type}
                onChange={(e) => handleChange('transaction_type', e.target.value)}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-extrabold outline-none focus:border-amber-500 ${
                  formData.transaction_type === 'รายรับ' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <option value="รายจ่าย">💸 รายจ่าย (Expense)</option>
                <option value="รายรับ">💰 รายรับ (Income / Revenue)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่นัดโอนเงินประจำเดือน <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่อรายการค้างโอน / คำอธิบาย <span className="text-rose-400">*</span></label>
            <SmartSuggestInput
              category="title"
              required
              placeholder="เช่น ค่าเช่าออฟฟิศประจำเดือน 8/69, ค่าทำบัญชี, ค่าเคสสครับ..."
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทค่าใช้จ่ายทั้งหมด <span className="text-rose-400">*</span></label>
              <select
                value={formData.expense_type}
                onChange={(e) => handleChange('expense_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 font-bold outline-none focus:border-amber-500"
              >
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

                <optgroup label="📦 ต้นทุนขาย (COGS)">
                  <option value="ค่าซื้อสินค้า Material Expense">ค่าซื้อสินค้า Material Expense</option>
                  <option value="ค่าขนส่งสินค้า Transportation Expense">ค่าขนส่งสินค้า Transportation Expense</option>
                  <option value="ค่าจดเอกสารต่างๆ Document Registration">ค่าจดเอกสารต่างๆ Document Registration</option>
                  <option value="ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง">ETC,ใต้โต๊ะ & ค่าค้ำประกันซอง</option>
                  <option value="ภาษีนำเข้า Import Tax">ภาษีนำเข้า Import Tax</option>
                </optgroup>

                <optgroup label="💵 ดอกเบี้ย & ภาษี">
                  <option value="ดอกเบี้ย Interest Expense">ดอกเบี้ย Interest Expense</option>
                  <option value="ภาษี Vat 7% Vat 7%">ภาษี Vat 7%</option>
                  <option value="ภาษีรายได้บริษัท Income Taxes">ภาษีรายได้บริษัท</option>
                </optgroup>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ช่องทาง/บัญชีชำระเงิน <span className="text-rose-400">*</span></label>
              <select
                value={formData.account_type}
                onChange={(e) => handleChange('account_type', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 font-medium outline-none"
              >
                {(window.getCompanyAccounts ? window.getCompanyAccounts() : ['Aeron Kbank ออมทรัพย์', 'Aeron Kbank กระแสรายวัน', 'Aeron Kbank ฝากประจำ', 'Aeron SCB ออมทรัพย์', 'Aeron SCB กระแสรายวัน']).map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Amounts & Deductions Grid */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🧮 คำนวณยอดเงินและภาษีหัก ณ ที่จ่าย</span>
                <span className="text-[10px] text-slate-400 font-normal">(Auto Tax W/H Preset)</span>
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
                <input
                  type="checkbox"
                  checked={formData.off_book_expense}
                  onChange={(e) => handleChange('off_book_expense', e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>รายการนอกระบบ (Off-book)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">จำนวนเงินรวม (บาท) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ภาษีหัก ณ ที่จ่าย</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyTaxRate(3)}
                      className="px-1.5 py-0.2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded text-[9.5px] font-bold border border-indigo-500/40"
                    >
                      3%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTaxRate(5)}
                      className="px-1.5 py-0.2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-[9.5px] font-bold border border-purple-500/40"
                    >
                      5%
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.withholding_tax}
                  onChange={(e) => handleChange('withholding_tax', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-rose-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">ประกันสังคม (ถ้ามี)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.social_security}
                  onChange={(e) => handleChange('social_security', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-indigo-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">หักยืม/เงินกู้พนักงาน</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.loan_for_employee}
                  onChange={(e) => handleChange('loan_for_employee', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-amber-300 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">💵 ยอดโอนสุทธิ (Net Transfer):</span>
              <span className="text-base font-black font-mono text-amber-400">
                {formData.net_transfer.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
              </span>
            </div>
          </div>

          {/* Tax Flags & Attachment URL */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-300">🏷️ สถานะทางภาษี & สลิปเอกสาร</div>
            <div className="flex flex-wrap gap-4 text-[11.5px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.vat_eligible}
                  onChange={(e) => handleChange('vat_eligible', e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>มีใบกำกับภาษี (VAT 7%)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.tax_deductible}
                  onChange={(e) => handleChange('tax_deductible', e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>ลงเป็นค่าใช้จ่ายบริษัทได้</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.pnd_submitted}
                  onChange={(e) => handleChange('pnd_submitted', e.target.checked)}
                  className="accent-emerald-500 rounded"
                />
                <span>ยื่น ภ.ง.ด.3/53 แล้ว</span>
              </label>
            </div>

            <div className="pt-2">
              <label className="text-[11px] text-slate-400">URL แนบสลิป / ใบเสร็จเอกสาร (ถ้ามีล่วงหน้า):</label>
              <input
                type="text"
                placeholder="เช่น https://images.unsplash.com/... หรือ /uploads/slips/slip_01.jpg"
                value={formData.attachment_url}
                onChange={(e) => handleChange('attachment_url', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none font-mono text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้รับเงิน / ผู้จ่ายเงิน (Payee) <span className="text-rose-400">*</span></label>
              <SmartSuggestInput
                category="payee"
                required
                placeholder="เช่น อาคารออฟฟิศ, สำนักงานบัญชี, แพทย์ DF..."
                value={formData.payee}
                onChange={(e) => handleChange('payee', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / โครงการที่เกี่ยวข้อง</label>
              <SmartSuggestInput
                category="hospital"
                placeholder="เช่น คณะแพทย์ศาสตร์ มหิดล, รพ.ศิริราช..."
                value={formData.hospital_name}
                onChange={(e) => handleChange('hospital_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / คำสั่งโอนเพิ่มเติม</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <span>📌 บันทึกตั้งค้างโอนประจำเดือน</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
