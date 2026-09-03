// MODULE: mod09_accounting/AccountingModule.js

function AccountingModule({ 
  transactions = [], 
  purchaseOrders = [],
  projects = [],
  products = [],
  initialFrozenMonths = [], 
  initialRecurringTemplates = [], 
  currentUser, 
  onSaveTxn, 
  onDeleteTxn, 
  onOpenPOModal,
  onDeletePO,
  accountingSubTab = 'daily_entries', 
  onSubTabChange 
}) {
  const [localSubTab, setLocalSubTab] = useState(accountingSubTab || 'daily_entries');
  const subTab = accountingSubTab || localSubTab;
  const setSubTab = (newTab) => {
    setLocalSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPendingTransferModalOpen, setIsPendingTransferModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);

  const [frozenMonths, setFrozenMonths] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_accounting_frozen_months');
      return saved ? JSON.parse(saved) : (initialFrozenMonths || ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]);
    } catch(e) { return initialFrozenMonths || []; }
  });

  const [recurringTemplates, setRecurringTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_accounting_recurring');
      return saved ? JSON.parse(saved) : (initialRecurringTemplates || []);
    } catch(e) { return initialRecurringTemplates || []; }
  });

  // Count pending draft transfers that need action
  const pendingCount = useMemo(() => {
    return transactions.filter(t => t.is_pending_draft || t.status === '⏳ รอโอน' || t.status === '💸 เจ้าของโอนแล้ว' || (t.notes && t.notes.includes('[Draft จ่ายประจำ]') && !t.notes.includes('[โอนเงินเรียบร้อยแล้ว]') && !t.notes.includes('[แอดมินแนบสลิปเรียบร้อย]'))).length;
  }, [transactions]);

  // ⚡ Live Cloud Sync to Supabase & localStorage
  useEffect(() => {
    localStorage.setItem('aeron_accounting_frozen_months', JSON.stringify(frozenMonths));
    if (typeof syncToDB === 'function') {
      syncToDB('accounting_frozen_months', frozenMonths);
    }
  }, [frozenMonths]);

  useEffect(() => {
    localStorage.setItem('aeron_accounting_recurring', JSON.stringify(recurringTemplates));
    if (typeof syncToDB === 'function') {
      syncToDB('accounting_recurring', recurringTemplates);
    }
  }, [recurringTemplates]);

  // ⚡ Startup Cloud Hydration: Fetch latest frozen months & recurring templates from Supabase
  useEffect(() => {
    async function hydrateAccountingMeta() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;
        const remoteFrozen = await fetcher('accounting_frozen_months', null);
        if (Array.isArray(remoteFrozen) && remoteFrozen.length > 0) {
          setFrozenMonths(remoteFrozen);
        }
        const remoteRec = await fetcher('accounting_recurring', null);
        if (Array.isArray(remoteRec) && remoteRec.length > 0) {
          setRecurringTemplates(remoteRec);
        }
      } catch(e) {
        console.warn('[Accounting Meta Hydration Notice]:', e.message);
      }
    }
    hydrateAccountingMeta();
  }, []);

  // Freeze month toggle handler
  const handleToggleFreeze = (monthStr) => {
    setFrozenMonths(prev => {
      if (prev.includes(monthStr)) {
        return prev.filter(m => m !== monthStr);
      } else {
        return [...prev, monthStr].sort();
      }
    });
  };

  // Save New Pending Transfer Draft
  const handleSavePendingTransfer = (pendingTxn) => {
    onSaveTxn(pendingTxn);
    setIsPendingTransferModalOpen(false);
    setSubTab('pending_transfers');
  };

  // Status Lifecycle Handlers
  const handleOwnerTransfer = (updatedTxn) => {
    onSaveTxn(updatedTxn);
    alert('💸 เจ้าของโอนเงินเสร็จเรียบร้อย! ส่งเรื่องให้แอดมินตรวจเช็กและแนบสลิป');
  };

  const handleConfirmTransfer = (confirmedTxn) => {
    onSaveTxn(confirmedTxn);
    alert('✅ ยืนยันและแนบสลิปโดยแอดมินเรียบร้อย! รายการย้ายเข้าตารางรายจ่ายประจำวันหลักแล้ว');
  };

  const handleRejectTransfer = (rejectedTxn) => {
    onSaveTxn(rejectedTxn);
    alert('❌ บันทึกการปฏิเสธการโอนเงินเรียบร้อยแล้ว');
  };

  const handleRescheduleTransfer = (rescheduledTxn) => {
    onSaveTxn(rescheduledTxn);
    alert(`📅 เลื่อนวันโอนเป็นวันที่ ${rescheduledTxn.date} เรียบร้อยแล้ว`);
  };

  // Generate monthly drafts from recurring templates
  const handleGenerateMonthlyDrafts = () => {
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    if (frozenMonths.includes(currentMonthKey)) {
      alert(`⛔ ไม่สามารถสร้าง Draft ได้: เดือน ${currentMonthKey} ถูกปิดงบแล้ว (Frozen Month)`);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let createdCount = 0;

    recurringTemplates.forEach(t => {
      if (!t.is_active) return;
      const draftTxn = {
        id: `TXN-REC-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        date: todayStr,
        title: `[Draft จ่ายประจำ] ${t.title}`,
        expense_type: t.expense_type,
        account_type: t.account_type,
        amount: t.amount,
        withholding_tax: t.withholding_tax || 0,
        social_security: 0,
        loan_for_employee: 0,
        net_transfer: t.amount - (t.withholding_tax || 0),
        payee: t.payee || '',
        transaction_type: 'รายจ่าย',
        status: '⏳ รอโอน',
        off_book_expense: false,
        hospital_name: '',
        notes: 'รายการจ่ายประจำค้างโอนประจำเดือน [รอแนบสลิป/ยืนยัน]',
        vat_eligible: false,
        tax_deductible: true,
        pnd_submitted: false,
        attachment_url: '',
        is_pending_draft: true,
        created_by: currentUser?.name || 'SYSTEM',
        updated_at: new Date().toISOString()
      };

      onSaveTxn(draftTxn);
      createdCount++;
    });

    alert(`⚡ สร้างรายการร่างค้างโอนประจำเดือนเรียบร้อยแล้ว ${createdCount} รายการ!`);
    setIsRecurringModalOpen(false);
    setSubTab('pending_transfers');
  };

  const handleSaveRecurringTemplate = (tData) => {
    setRecurringTemplates(prev => [tData, ...prev]);
  };

  const handleDeleteRecurringTemplate = (tId) => {
    setRecurringTemplates(prev => prev.filter(t => t.id !== tId));
  };

  const handleOpenNewModal = () => {
    setEditingTxn(null);
    setIsModalOpen(true);
  };

  const handleEditTxn = (txn) => {
    const monthKey = (txn.date || '').substring(0, 7);
    if (frozenMonths.includes(monthKey)) {
      alert(`⛔ เดือน ${monthKey} ถูกปิดงบแล้ว ไม่สามารถแก้ไขได้`);
      return;
    }
    setEditingTxn(txn);
    setIsModalOpen(true);
  };

  const handleDeleteTxn = (txnId, txnDate) => {
    if (txnDate) {
      const monthKey = (txnDate || '').substring(0, 7);
      if (frozenMonths.includes(monthKey)) {
        alert(`⛔ เดือน ${monthKey} ถูกปิดงบแล้ว ไม่สามารถลบได้`);
        return;
      }
    }
    onDeleteTxn(txnId);
  };

  const handleSaveModal = (txnData) => {
    onSaveTxn(txnData);
    setIsModalOpen(false);
    setEditingTxn(null);
  };

  const handleImportTxns = (importedArray) => {
    importedArray.forEach(t => onSaveTxn(t));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Bar & Action Controls */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/30 flex items-center justify-center text-2xl shadow-inner">
            🧾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MOD-09 ACCOUNTING & FINANCIAL MANAGEMENT
              </span>
              <span className="text-xs text-slate-400 font-medium">ผู้เข้าใช้: <strong>{currentUser?.name || 'ผู้ใช้งาน'}</strong> ({currentUser?.role})</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">ระบบลงบันทึกรายรับ-รายจ่าย & รายงานวิเคราะห์การเงินองค์กร</h2>
          </div>
        </div>

        {/* Action Buttons & Sub Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Dedicated Pending Transfer Creation Button */}
          <button
            onClick={() => setIsPendingTransferModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <span>📌 ตั้งค้างโอนประจำเดือน</span>
          </button>

          <button
            onClick={() => setIsRecurringModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>🔄 จ่ายประจำ (Recurring)</span>
          </button>

          <button
            onClick={() => setIsFreezeModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 shadow-md"
          >
            <span>🔒 ปิดงบ (Freeze Month)</span>
          </button>

          {/* Sub Tabs Navigation */}
          <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setSubTab('daily_entries')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'daily_entries' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 บันทึกรายวัน Grid
            </button>

            <button
              onClick={() => setSubTab('purchase_orders')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'purchase_orders' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 ใบสั่งซื้อ PO (Vendor)
            </button>

            <button
              onClick={() => setSubTab('pending_transfers')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                subTab === 'pending_transfers' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-amber-300 hover:text-white'
              }`}
            >
              <span>⏳ ค้างโอนประจำเดือน</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.2 bg-rose-500 text-white font-mono text-[10.5px] rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setSubTab('financial_statements')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'financial_statements' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📈 งบการเงิน P&L
            </button>

            <button
              onClick={() => setSubTab('hospital_payee_analytics')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'hospital_payee_analytics' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏥 Drill-Down ราย รพ.
            </button>

            <button
              onClick={() => setSubTab('bank_reconciliation')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
                subTab === 'bank_reconciliation' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏦 Bank Reconciliation
            </button>
          </div>
        </div>
      </div>

      {/* SUB TAB 1: Daily Transactions */}
      {subTab === 'daily_entries' && (
        <DailyTransactionView
          transactions={transactions}
          frozenMonths={frozenMonths}
          currentUser={currentUser}
          onOpenNewModal={handleOpenNewModal}
          onEditTxn={handleEditTxn}
          onDeleteTxn={handleDeleteTxn}
          onImportTxns={handleImportTxns}
        />
      )}

      {/* SUB TAB: Purchase Orders */}
      {subTab === 'purchase_orders' && (
        <PurchaseOrderView
          purchaseOrders={purchaseOrders}
          projects={projects}
          products={products}
          onOpenNewModal={onOpenPOModal}
          onEditPO={(po) => onOpenPOModal ? onOpenPOModal(po) : null}
          onDeletePO={onDeletePO}
        />
      )}

      {/* SUB TAB 2: Pending Transfers View */}
      {subTab === 'pending_transfers' && (
        <PendingTransfersView
          transactions={transactions}
          currentUser={currentUser}
          onSaveTxn={onSaveTxn}
          onDeleteTxn={onDeleteTxn}
          onOwnerTransfer={handleOwnerTransfer}
          onConfirmTransfer={handleConfirmTransfer}
          onRejectTransfer={handleRejectTransfer}
          onRescheduleTransfer={handleRescheduleTransfer}
        />
      )}

      {/* SUB TAB 3: Financial Statements */}
      {subTab === 'financial_statements' && (
        <FinancialStatementsView
          transactions={transactions}
          currentUser={currentUser}
        />
      )}

      {/* SUB TAB 4: Hospital & Payee Drill-Down Analytics */}
      {subTab === 'hospital_payee_analytics' && (
        <HospitalPayeeAnalyticsView
          transactions={transactions}
        />
      )}

      {/* SUB TAB 5: Bank Reconciliation */}
      {subTab === 'bank_reconciliation' && (
        <BankReconciliationView
          transactions={transactions}
        />
      )}

      {/* Dedicated Pending Transfer Modal */}
      {isPendingTransferModalOpen && (
        <CreatePendingTransferModal
          onSave={handleSavePendingTransfer}
          onClose={() => setIsPendingTransferModalOpen(false)}
        />
      )}

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          editingTxn={editingTxn}
          frozenMonths={frozenMonths}
          onSave={handleSaveModal}
          onClose={() => { setIsModalOpen(false); setEditingTxn(null); }}
        />
      )}

      {/* Recurring Payments Modal */}
      {isRecurringModalOpen && (
        <RecurringPaymentsModal
          templates={recurringTemplates}
          onSaveTemplate={handleSaveRecurringTemplate}
          onDeleteTemplate={handleDeleteRecurringTemplate}
          onGenerateDrafts={handleGenerateMonthlyDrafts}
          onClose={() => setIsRecurringModalOpen(false)}
        />
      )}

      {/* Freeze Month Control Modal */}
      {isFreezeModalOpen && (
        <FreezeMonthModal
          frozenMonths={frozenMonths}
          onToggleFreeze={handleToggleFreeze}
          onClose={() => setIsFreezeModalOpen(false)}
        />
      )}

    </div>
  );
}
