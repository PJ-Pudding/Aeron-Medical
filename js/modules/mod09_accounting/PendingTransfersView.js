// MODULE: mod09_accounting/PendingTransfersView.js

function PendingTransfersView({ transactions = [], currentUser, onSaveTxn, onDeleteTxn, onConfirmTransfer, onOwnerTransfer, onRejectTransfer, onRescheduleTransfer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  
  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [activeSlipModalTxn, setActiveSlipModalTxn] = useState(null);
  const [inputSlipUrl, setInputSlipUrl] = useState('');

  const [activeRejectModalTxn, setActiveRejectModalTxn] = useState(null);
  const [inputRejectReason, setInputRejectReason] = useState('');

  const [activeRescheduleModalTxn, setActiveRescheduleModalTxn] = useState(null);
  const [inputNewDate, setInputNewDate] = useState('');

  // Pending Drafts list
  const pendingDrafts = useMemo(() => {
    return transactions.filter(t => {
      const isDraft = t.is_pending_draft || t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || t.status === '❌ ปฏิเสธการโอน' || t.status === '📅 เลื่อนวันโอนไปรอบต่อไป' || (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]'));
      if (!isDraft) return false;

      if (selectedStatusFilter !== 'all' && t.status !== selectedStatusFilter) return false;
      if (selectedDateFilter !== 'all' && t.date !== selectedDateFilter) return false;

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
  }, [transactions, selectedStatusFilter, selectedDateFilter, startDate, endDate, searchTerm]);

  // Unique Scheduled Dates list
  const scheduledDates = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if ((t.is_pending_draft || t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว') && t.date) {
        set.add(t.date);
      }
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Total pending transfer amount
  const totalPendingAmount = useMemo(() => {
    return pendingDrafts.reduce((sum, t) => sum + (Number(t.net_transfer) || Number(t.amount) || 0), 0);
  }, [pendingDrafts]);

  // Handle Dropdown Change - Flexible Workflow without blocking
  const handleStatusDropdownChange = (txn, targetStatus) => {
    if (targetStatus === '⏳ รอโอน') {
      onSaveTxn({ ...txn, status: '⏳ รอโอน', updated_at: new Date().toISOString() });
      return;
    }

    if (targetStatus === '💸 เจ้าของโอนแล้ว') {
      onOwnerTransfer({
        ...txn,
        status: '💸 เจ้าของโอนแล้ว',
        notes: (txn.notes || '').replace('[รอแนบสลิป/ยืนยัน]', '[เจ้าของโอนเงินแล้ว รอแอดมินแนบสลิป]'),
        updated_at: new Date().toISOString()
      });
      return;
    }

    // Step 3: Directly allowed at any time, slip attachment is optional
    if (targetStatus === '✅ ยืนยันและแนบสลิป โดยแอดมิน') {
      setActiveSlipModalTxn(txn);
      setInputSlipUrl(txn.attachment_url || '');
      return;
    }

    if (targetStatus === '❌ ปฏิเสธการโอน') {
      setActiveRejectModalTxn(txn);
      setInputRejectReason('');
      return;
    }

    if (targetStatus === '📅 เลื่อนวันโอนไปรอบต่อไป') {
      setActiveRescheduleModalTxn(txn);
      setInputNewDate(txn.date || new Date().toISOString().split('T')[0]);
      return;
    }
  };

  // Confirm Step 3 - Slip is completely optional
  const handleConfirmAdminSlip = () => {
    if (!activeSlipModalTxn) return;

    const updatedTxn = {
      ...activeSlipModalTxn,
      status: '✅ ยืนยันและแนบสลิป โดยแอดมิน',
      attachment_url: inputSlipUrl || activeSlipModalTxn.attachment_url || '',
      notes: (activeSlipModalTxn.notes || '').replace('[รอแนบสลิป/ยืนยัน]', '[โอนเงินเรียบร้อยแล้ว]'),
      updated_at: new Date().toISOString()
    };

    onConfirmTransfer(updatedTxn);
    setActiveSlipModalTxn(null);
    setInputSlipUrl('');
  };

  const handleOpenRejectModal = (txn) => {
    setActiveRejectModalTxn(txn);
    setInputRejectReason('');
  };

  const handleConfirmReject = () => {
    if (!activeRejectModalTxn) return;
    if (!inputRejectReason.trim()) {
      alert('กรุณาระบุเหตุผลที่ปฏิเสธการโอนเงิน');
      return;
    }

    const updatedTxn = {
      ...activeRejectModalTxn,
      status: '❌ ปฏิเสธการโอน',
      rejection_reason: inputRejectReason,
      notes: `[ปฏิเสธการโอน] เหตุผล: ${inputRejectReason}`,
      updated_at: new Date().toISOString()
    };

    onRejectTransfer(updatedTxn);
    setActiveRejectModalTxn(null);
    setInputRejectReason('');
  };

  const handleOpenRescheduleModal = (txn) => {
    setActiveRescheduleModalTxn(txn);
    setInputNewDate(txn.date || new Date().toISOString().split('T')[0]);
  };

  const handleConfirmReschedule = () => {
    if (!activeRescheduleModalTxn) return;
    if (!inputNewDate) {
      alert('กรุณาระบุวันที่โอนเงินใหม่');
      return;
    }

    const updatedTxn = {
      ...activeRescheduleModalTxn,
      date: inputNewDate,
      status: '📅 เลื่อนวันโอนไปรอบต่อไป',
      notes: `[เลื่อนวันโอนไปรอบต่อไป] เป็นวันที่ ${inputNewDate}`,
      updated_at: new Date().toISOString()
    };

    onRescheduleTransfer(updatedTxn);
    setActiveRescheduleModalTxn(null);
    setInputNewDate('');
  };

  // Status Badge Renderer helper
  const renderStatusBadge = (statusStr, reasonStr) => {
    switch (statusStr) {
      case '💸 เจ้าของโอนแล้ว':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold text-[11px] border border-purple-500/30 flex items-center gap-1 justify-center">
            <span>💸 เจ้าของโอนแล้ว</span>
          </span>
        );
      case '✅ ยืนยันและแนบสลิป โดยแอดมิน':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1 justify-center">
            <span>✅ ยืนยันโอนแล้ว</span>
          </span>
        );
      case '❌ ปฏิเสธการโอน':
        return (
          <span className="px-2 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-extrabold text-[11px] border border-rose-500/30 block max-w-[160px] truncate text-center" title={reasonStr ? `เหตุผล: ${reasonStr}` : ''}>
            ❌ ปฏิเสธการโอน {reasonStr ? `(${reasonStr})` : ''}
          </span>
        );
      case '📅 เลื่อนวันโอนไปรอบต่อไป':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/30 flex items-center gap-1 justify-center">
            <span>📅 เลื่อนวันโอนไปรอบต่อไป</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-[11px] border border-amber-500/30 flex items-center gap-1 justify-center">
            <span>⏳ รอโอน</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner text-amber-400">
            ⏳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PENDING DRAFT TRANSFERS (FLEXIBLE WORKFLOW)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">ตารางตั้งค่าใช้จ่ายค้างโอนประจำเดือน & อนุมัติการโอนเงิน (Dropdown เลือกสถานะอิสระ)</h2>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-right">
          <div className="text-[11px] text-slate-400 font-semibold">ยอดเงินค้างโอนรวมในมุมมองนี้</div>
          <div className="text-xl font-black font-mono text-amber-400">
            {totalPendingAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Date Range Picker */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        
        <div className="flex flex-wrap items-center gap-2 flex-1">
          
          {/* High-Contrast Vibrant Yellow Date Range Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/40 rounded-xl p-1.5 shadow-md">
            <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
              <span className="text-sm leading-none">📅</span>
              <span>ช่วงวันที่นัดโอน:</span>
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
              placeholder="🔍 ค้นหารายการค้างโอน, ผู้รับเงิน, โรงพยาบาล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 pl-3 text-slate-100 outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
          >
            <option value="all">🚦 สถานะการโอนทั้งหมด ({pendingDrafts.length} รายการ)</option>
            <option value="⏳ รอโอน">⏳ 1. รอโอน</option>
            <option value="💸 เจ้าของโอนแล้ว">💸 2. เจ้าของโอนแล้ว</option>
            <option value="✅ ยืนยันและแนบสลิป โดยแอดมิน">✅ 3. ยืนยันโอนเรียบร้อย</option>
            <option value="❌ ปฏิเสธการโอน">❌ ปฏิเสธการโอน</option>
            <option value="📅 เลื่อนวันโอนไปรอบต่อไป">📅 เลื่อนวันโอนไปรอบต่อไป</option>
          </select>

          {/* Date Filter Dropdown */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 outline-none font-mono"
          >
            <option value="all">📅 ทุกวันที่นัดโอน</option>
            {scheduledDates.map(d => (
              <option key={d} value={d}>📅 {d}</option>
            ))}
          </select>
        </div>

      </div>

      {/* 14-Column Spreadsheet Grid Table matching DailyTransactionView Exactly */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <span>📋 ตารางรายการตั้งค้างโอนประจำเดือน (Spreadsheet Grid View)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono font-bold">
              {pendingDrafts.length} รายการ
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">วันที่นัดโอน</th>
                <th className="p-3">รายการค้างโอน</th>
                <th className="p-3">ประเภทค่าใช้จ่าย</th>
                <th className="p-3">บัญชีผู้โอน</th>
                <th className="p-3 text-right">ยอดเงิน</th>
                <th className="p-3 text-right">W/H</th>
                <th className="p-3 text-right">ประกันสังคม</th>
                <th className="p-3 text-right">ยอดโอนสุทธิ</th>
                <th className="p-3">หมายเหตุ</th>
                <th className="p-3">ผู้รับเงิน</th>
                <th className="p-3 text-center">ประเภท / สถานะโอน</th>
                <th className="p-3">โรงพยาบาล</th>
                <th className="p-3 text-center">สลิป/เอกสาร</th>
                <th className="p-3 text-right">จัดการสถานะ (Dropdown)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pendingDrafts.length === 0 ? (
                <tr>
                  <td colSpan="14" className="p-8 text-center text-slate-500 italic">
                    ไม่พบรายการตั้งค้างโอนที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                pendingDrafts.map(t => (
                  <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-mono text-amber-300 font-bold whitespace-nowrap">
                      {window.formatAeronDate(t.date)}
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
                    <td className="p-3 text-slate-300 font-medium whitespace-nowrap">{t.account_type}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                      -{(t.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-mono text-indigo-300 whitespace-nowrap">
                      {t.withholding_tax > 0 ? (t.withholding_tax).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-indigo-300 whitespace-nowrap">
                      {t.social_security > 0 ? (t.social_security).toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-extrabold text-amber-400 whitespace-nowrap">
                      {(t.net_transfer || t.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px] max-w-[150px] truncate" title={t.notes || ''}>
                      {t.notes || '-'}
                    </td>
                    <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">{t.payee || '-'}</td>
                    
                    {/* Status Badge Column */}
                    <td className="p-3 text-center">
                      {renderStatusBadge(t.status, t.rejection_reason)}
                    </td>

                    <td className="p-3 text-slate-300">{t.hospital_name || '-'}</td>
                    
                    {/* Slip Attachment Column */}
                    <td className="p-3 text-center">
                      {t.attachment_url ? (
                        <button
                          onClick={() => { setActiveSlipModalTxn(t); setInputSlipUrl(t.attachment_url); }}
                          className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-[10.5px] font-bold border border-indigo-500/40"
                        >
                          🖼️ ดูสลิป
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10.5px]">ไม่มี</span>
                      )}
                    </td>

                    {/* Interactive Status Select Dropdown in Table Row */}
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <select
                        value={t.status || '⏳ รอโอน'}
                        onChange={(e) => handleStatusDropdownChange(t, e.target.value)}
                        className={`bg-slate-950 border rounded-xl p-2 font-bold text-xs outline-none shadow-md ${
                          t.status === '💸 เจ้าของโอนแล้ว'
                            ? 'text-purple-300 border-purple-500/40'
                            : t.status === '✅ ยืนยันและแนบสลิป โดยแอดมิน'
                            ? 'text-emerald-300 border-emerald-500/40'
                            : t.status === '❌ ปฏิเสธการโอน'
                            ? 'text-rose-300 border-rose-500/40'
                            : 'text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <option value="⏳ รอโอน">⏳ 1. รอโอน</option>
                        <option value="💸 เจ้าของโอนแล้ว">💸 2. เจ้าของโอนแล้ว (ผู้บริหารกด)</option>
                        <option value="✅ ยืนยันและแนบสลิป โดยแอดมิน">✅ 3. ยืนยันและแนบสลิป (โดยแอดมิน)</option>
                        <option value="📅 เลื่อนวันโอนไปรอบต่อไป">📅 เลื่อนวันโอนไปรอบต่อไป</option>
                        <option value="❌ ปฏิเสธการโอน">❌ ปฏิเสธการโอน (ระบุเหตุผล)</option>
                      </select>

                      <button
                        onClick={() => onDeleteTxn(t.id)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg text-[11px] ml-1"
                        title="ลบรายการ"
                      >
                        🗑️
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Admin Confirm & Optional Slip Modal */}
      {activeSlipModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 max-w-lg w-full rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-sm">📸 3. ยืนยันการโอนเงิน ({activeSlipModalTxn.title})</h4>
              <button onClick={() => setActiveSlipModalTxn(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold">แนบ URL รูปภาพสลิปโอนเงิน / เอกสารแนบ (ไม่จำเป็นต้องระบุ):</label>
              <input
                type="text"
                placeholder="เช่น https://images.unsplash.com/... หรือ ปล่อยว่างไว้ได้"
                value={inputSlipUrl}
                onChange={(e) => setInputSlipUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono outline-none"
              />
              <p className="text-[11px] text-emerald-300">
                เมื่อกดปุ่มยืนยัน สถานะจะเปลี่ยนเป็น <strong>`✅ ยืนยันและแนบสลิป โดยแอดมิน`</strong> และจะย้ายไปแสดงผลในตารางรายจ่ายประจำวันหลัก + คำนวณ P&L ทันที!
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveSlipModalTxn(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleConfirmAdminSlip}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                ✅ ยืนยันและย้ายเข้าตารางรายวัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Reject Reason Modal */}
      {activeRejectModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 max-w-lg w-full rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-rose-300 text-sm">❌ ปฏิเสธการโอนเงิน ({activeRejectModalTxn.title})</h4>
              <button onClick={() => setActiveRejectModalTxn(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold">เหตุผลที่ปฏิเสธการโอนเงิน <span className="text-rose-400">*</span>:</label>
              <textarea
                rows="3"
                required
                placeholder="ระบุเหตุผล เช่น ข้อมูลเอกสารไม่ถูกต้อง, ยอดเงินไม่ตรงกับใบแจ้งหนี้..."
                value={inputRejectReason}
                onChange={(e) => setInputRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-rose-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveRejectModalTxn(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                ❌ ยืนยันปฏิเสธการโอน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Reschedule Date Modal */}
      {activeRescheduleModalTxn && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-indigo-500/40 max-w-lg w-full rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-indigo-300 text-sm">📅 เลื่อนวันโอนไปรอบต่อไป ({activeRescheduleModalTxn.title})</h4>
              <button onClick={() => setActiveRescheduleModalTxn(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold">เลือกวันที่โอนเงินใหม่ <span className="text-rose-400">*</span>:</label>
              <input
                type="date"
                required
                value={inputNewDate}
                onChange={(e) => setInputNewDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-300 font-mono font-bold outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveRescheduleModalTxn(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleConfirmReschedule}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                📅 บันทึกเลื่อนวันโอน
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
