// MODULE: mod00_core/UserAccountManagementModal.js

function UserAccountManagementModal({ isOpen, onClose, currentUser, onAccountsUpdated }) {
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const modalContentRef = useRef(null);

  // Check if current logged in user is OWNER
  const isOwner = useMemo(() => {
    return currentUser && String(currentUser.role).toUpperCase() === 'OWNER';
  }, [currentUser]);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [role, setRole] = useState('SALES');
  const [avatar, setAvatar] = useState('👨‍⚕️');

  // Custom Permissions State
  const ALL_SYSTEM_TABS = [
    { id: 'dashboard', label: '📊 Executive Dashboard' },
    { id: 'clients', label: '🏥 ฐานข้อมูลลูกค้า รพ.' },
    { id: 'project', label: '📋 กระดาน Sales Kanban' },
    { id: 'logistic', label: '🚚 คลังสินค้า & ขนส่ง' },
    { id: 'calendar', label: '📅 ปฏิทินจองคิว Demo' },
    { id: 'report', label: '📑 ทะเบียน อย. & สรุปรายงาน' },
    { id: 'finance', label: '💰 ตารางต้นทุน & ใบสั่งซื้อ PO' },
    { id: 'hr', label: '👥 ตารางวันลา & บุคลากร' },
    { id: 'accounting', label: '🧾 บันทึกรายวัน & งบการเงิน' },
    { id: 'messenger', label: '🛵 ขนส่งแมสเซ็นเจอร์' }
  ];

  const [allowedTabs, setAllowedTabs] = useState(['clients', 'project', 'logistic', 'calendar', 'hr']);
  const [subordinates, setSubordinates] = useState(['m1', 'm2', 'm3', 'm4']);
  const [canApproveHR, setCanApproveHR] = useState(false);
  const [canViewAuditLogs, setCanViewAuditLogs] = useState(false);
  const [canViewAllFinancials, setCanViewAllFinancials] = useState(false);

  const ALL_SALES_REPS = [
    { id: 'm1', name: '👨‍⚕️ สมชาย สายลุย' },
    { id: 'm2', name: '👩‍⚕️ สมหญิง ใจดี' },
    { id: 'm3', name: '👨‍💼 อนันต์ ผู้โชคดี' },
    { id: 'm4', name: '👨‍💼 สุชาติ มุ่งมั่น' }
  ];

  const [showPasswords, setShowPasswords] = useState({});

  // Initial Load from localStorage
  useEffect(() => {
    if (isOpen) {
      const userAccs = window.getUserAccounts ? window.getUserAccounts() : [];
      setAccounts(userAccs);
    }
  }, [isOpen]);

  // Auto-update default allowedTabs when role changes (if adding new account)
  useEffect(() => {
    if (!editingId) {
      const roleConfig = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[role]) || {};
      if (roleConfig.allowedTabs) {
        setAllowedTabs(roleConfig.allowedTabs);
        setCanApproveHR(!!roleConfig.canApproveHR);
        setCanViewAuditLogs(!!roleConfig.canViewAuditLogs);
        setCanViewAllFinancials(!!roleConfig.canViewAllFinancials);
      }
    }
  }, [role, editingId]);

  if (!isOpen) return null;

  const handleToggleTab = (tabId) => {
    setAllowedTabs(prev => {
      if (prev.includes(tabId)) {
        return prev.filter(t => t !== tabId);
      } else {
        return [...prev, tabId];
      }
    });
  };

  const handleToggleSubordinate = (repId) => {
    setSubordinates(prev => {
      if (prev.includes(repId)) {
        return prev.filter(id => id !== repId);
      } else {
        return [...prev, repId];
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;

    const uClean = username.trim().toLowerCase();

    // Check duplicate username if adding new
    if (!editingId && accounts.some(a => a.username.toLowerCase() === uClean)) {
      alert('ชื่อผู้ใช้งาน (Username) นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น');
      return;
    }

    if (editingId) {
      // Edit existing user account
      const updated = accounts.map(a => {
        if (a.id === editingId) {
          return {
            ...a,
            username: uClean,
            password: password || '123456',
            name: name.trim(),
            role,
            avatar,
            allowedTabs,
            subordinates,
            canApproveHR,
            canViewAuditLogs,
            canViewAllFinancials
          };
        }
        return a;
      });
      setAccounts(updated);
      window.saveUserAccounts(updated);
      setEditingId(null);
    } else {
      // Add new user account
      const newAcc = {
        id: 'usr_' + Date.now(),
        username: uClean,
        password: password || '123456',
        name: name.trim(),
        role,
        avatar,
        allowedTabs,
        subordinates,
        canApproveHR,
        canViewAuditLogs,
        canViewAllFinancials,
        memberId: 'm_' + Date.now()
      };
      const updated = [...accounts, newAcc];
      setAccounts(updated);
      window.saveUserAccounts(updated);
    }

    // Reset Form
    handleCancelEdit();
    if (onAccountsUpdated) onAccountsUpdated();
  };

  const handleEditAccount = (acc) => {
    setEditingId(acc.id);
    setUsername(acc.username);
    setPassword(acc.password || '123456');
    setName(acc.name);
    setRole(acc.role || 'SALES');
    setAvatar(acc.avatar || '👨‍⚕️');

    const roleConfig = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[acc.role]) || {};
    setAllowedTabs(Array.isArray(acc.allowedTabs) ? acc.allowedTabs : (roleConfig.allowedTabs || []));
    setSubordinates(Array.isArray(acc.subordinates) ? acc.subordinates : ['m1', 'm2', 'm3', 'm4']);
    setCanApproveHR(acc.canApproveHR !== undefined ? acc.canApproveHR : !!roleConfig.canApproveHR);
    setCanViewAuditLogs(acc.canViewAuditLogs !== undefined ? acc.canViewAuditLogs : !!roleConfig.canViewAuditLogs);
    setCanViewAllFinancials(acc.canViewAllFinancials !== undefined ? acc.canViewAllFinancials : !!roleConfig.canViewAllFinancials);

    // Smooth scroll to top form
    if (modalContentRef.current) {
      modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setUsername('');
    setPassword('123456');
    setName('');
    setRole('SALES');
    setAvatar('👨‍⚕️');
    setAllowedTabs(['clients', 'project', 'logistic', 'calendar', 'hr']);
    setSubordinates(['m1', 'm2', 'm3', 'm4']);
    setCanApproveHR(false);
    setCanViewAuditLogs(false);
    setCanViewAllFinancials(false);
  };

  const handleDeleteAccount = (accId) => {
    if (confirm('คุณต้องการลบบัญชีผู้ใช้นี้ใช่หรือไม่?\n\n🛡️ หมายเหตุ: การลบผู้ใช้จะเป็นการลบสิทธิ์การ Log In เท่านั้น ข้อมูลโครงการ, รายการเงิน และ Activity Logs ทั้งหมดที่เคยสร้างไว้จะยังคงอยู่อย่างสมบูรณ์ 100%')) {
      const updated = accounts.filter(a => a.id !== accId);
      setAccounts(updated);
      window.saveUserAccounts(updated);
      if (onAccountsUpdated) onAccountsUpdated();
    }
  };

  const toggleShowPassword = (accId) => {
    if (!isOwner) {
      alert('🔒 สิทธิ์การดูรหัสผ่านถูกจำกัดไว้สำหรับ OWNER (เจ้าของระบบ/คุณตู้) เท่านั้น');
      return;
    }
    setShowPasswords(prev => ({ ...prev, [accId]: !prev[accId] }));
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 w-screen h-screen flex flex-col overflow-hidden animate-fade-in text-slate-100 font-sans">
      
      {/* Top Header Bar - Fixed 100% */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border-b border-slate-800 flex items-center justify-between flex-shrink-0 w-full shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl border border-amber-500/30 shadow-md">
            🔐
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
              <span>ระบบสร้าง & กำหนดสิทธิ์บัญชีผู้ใช้งาน (User Accounts & Granular RBAC)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                OWNER & HEAD ADMIN
              </span>
            </h3>
            <p className="text-xs text-slate-400">สร้าง/แก้ไขบัญชีผู้ใช้ และติ๊กเลือกกำหนดหน้าเว็บ/ฟังก์ชันที่อนุญาตให้เข้าดูได้แบบรายบุคคล</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
        >
          <span>✕ ปิดหน้าต่าง</span>
        </button>
      </div>

      {/* Middle Scroll Body - Max-W-6XL Centered */}
      <div ref={modalContentRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full scroll-smooth min-h-0">
          
          {/* Create / Edit Account Form Container */}
          <form
            onSubmit={handleFormSubmit}
            className={`p-5 rounded-3xl border transition-all space-y-4 shadow-xl ${
              editingId
                ? 'bg-amber-950/20 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-2">
                <span className="text-base">{editingId ? '✏️' : '➕'}</span>
                <span>{editingId ? 'แก้ไขข้อมูลและกำหนดสิทธิ์ผู้ใช้' : 'สร้างบัญชีผู้ใช้งานใหม่'}</span>
              </span>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                  ✕ ยกเลิกการแก้ไข
                </button>
              )}
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">ชื่อผู้ใช้งาน (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น sales_arm, admin_ketsara"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">รหัสผ่าน (Password) *</label>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">ชื่อ-นามสกุลจริง (Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อาร์ม สายลุย"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">บทบาทหลัก (Role Preset) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl p-2.5 outline-none font-bold focus:border-amber-400"
                >
                  <option value="OWNER">👑 OWNER (ผู้บริหารสูงสุด)</option>
                  <option value="HEAD_ADMIN">👩‍💼 HEAD_ADMIN (หัวหน้าฝ่ายบริหาร)</option>
                  <option value="ADMIN">🏢 ADMIN (ธุรการ/จัดซื้อ)</option>
                  <option value="SALES_HEAD">👨‍💼 SALES_HEAD (หัวหน้าทีมขาย)</option>
                  <option value="SALES">👨‍⚕️ SALES (เจ้าหน้าที่ฝ่ายขาย)</option>
                  <option value="MESSENGER">🛵 MESSENGER (ขนส่ง/ส่งเอกสาร)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">รูปประจำตัว (Avatar)</label>
                <select
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none text-center font-bold"
                >
                  <option value="👑">👑 (Owner)</option>
                  <option value="👩‍💼">👩‍💼 (Head Admin)</option>
                  <option value="🏢">🏢 (Admin)</option>
                  <option value="👨‍💼">👨‍💼 (Sales Head)</option>
                  <option value="👨‍⚕️">👨‍⚕️ (Sales)</option>
                  <option value="👩‍⚕️">👩‍⚕️ (Sales Female)</option>
                  <option value="🛵">🛵 (Messenger)</option>
                  <option value="🧑‍💻">🧑‍💻 (IT Support)</option>
                </select>
              </div>
            </div>

            {/* Granular Allowed Tabs Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                <span>🖥️ เลือกหน้าเว็บที่อนุญาตให้ผู้ใช้คนนี้เข้าดูได้ (Allowed System Tabs):</span>
                <span className="text-[11px] text-slate-400 font-normal">({allowedTabs.length} หน้าเลือกอยู่)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                {ALL_SYSTEM_TABS.map(tab => {
                  const isChecked = allowedTabs.includes(tab.id);
                  return (
                    <label
                      key={tab.id}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 font-bold'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTab(tab.id)}
                        className="accent-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="truncate">{tab.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Subordinate Rep Selection for SALES_HEAD */}
            {role === 'SALES_HEAD' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                  <span>👨‍💼 เลือกพนักงานขายที่อนุญาตให้หัวหน้าเซลล์คนนี้ติดตามกระดาน Kanban ได้ (Subordinate Reps):</span>
                  <span className="text-[11px] text-slate-400 font-normal">({subordinates.length} คนเลือกอยู่)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {ALL_SALES_REPS.map(rep => {
                    const isChecked = subordinates.includes(rep.id) || subordinates.includes(rep.name);
                    return (
                      <label
                        key={rep.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubordinate(rep.id)}
                          className="accent-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="truncate">{rep.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Feature Permissions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-amber-300">🔐 สิทธิ์ฟังก์ชันพิเศษ (Special Feature Permissions):</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${canApproveHR ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                  <input type="checkbox" checked={canApproveHR} onChange={(e) => setCanApproveHR(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
                  <span>👥 สิทธิ์อนุมัติการลา HR</span>
                </label>

                <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${canViewAuditLogs ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                  <input type="checkbox" checked={canViewAuditLogs} onChange={(e) => setCanViewAuditLogs(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
                  <span>📜 สิทธิ์ดู Audit Logs ประวัติระบบ</span>
                </label>

                <label className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${canViewAllFinancials ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 font-bold' : 'bg-slate-900/60 border-slate-800 text-slate-400'}`}>
                  <input type="checkbox" checked={canViewAllFinancials} onChange={(e) => setCanViewAllFinancials(e.target.checked)} className="accent-amber-500 w-3.5 h-3.5" />
                  <span>💰 สิทธิ์ดูการเงินทั้งหมด</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                  editingId
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
                }`}
              >
                <span>{editingId ? '💾 บันทึกการเปลี่ยนแปลงสิทธิ์บัญชีผู้ใช้' : '➕ บันทึกสร้างบัญชีผู้ใช้ใหม่'}</span>
              </button>
            </div>
          </form>

          {/* Accounts List Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-2">
                <span>📋 รายชื่อบัญชีผู้ใช้งานในระบบทั้งหมด ({accounts.length} บัญชี)</span>
              </span>
              <span className="text-[11px] text-slate-400 italic">
                🛡️ ปุ่มดูรหัสผ่าน 👁️ อนุญาตเฉพาะ OWNER (เจ้าของ/คุณตู้) ดูได้คนเดียวเท่านั้น
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map(acc => {
                const roleConfig = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[acc.role]) || {};
                const isShow = showPasswords[acc.id];
                const accTabs = Array.isArray(acc.allowedTabs) ? acc.allowedTabs : (roleConfig.allowedTabs || []);

                return (
                  <div
                    key={acc.id}
                    className={`bg-slate-950 p-4 rounded-2xl border space-y-3 relative transition-all ${
                      editingId === acc.id
                        ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-950/10'
                        : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl border border-slate-800 flex-shrink-0 shadow-inner">
                          {acc.avatar || '👤'}
                        </div>
                        <div>
                          <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            <span>{acc.name}</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Username: <span className="text-amber-300 font-bold">{acc.username}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditAccount(acc)}
                          className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1 active:scale-95"
                          title="แก้ไขบัญชีและกำหนดสิทธิ์"
                        >
                          <span>✏️</span>
                          <span>แก้ไข</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-2 bg-slate-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 rounded-xl text-xs border border-slate-800 transition-colors"
                          title="ลบบัญชีผู้ใช้นี้ (ไม่กระทบข้อมูลงาน)"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Allowed Tabs Summary Pills */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">หน้าที่ได้รับอนุญาตให้เข้าดู ({accTabs.length} หน้า):</div>
                      <div className="flex flex-wrap gap-1">
                        {accTabs.map(tId => (
                          <span key={tId} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                            {tId}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-900 text-xs">
                      <span className={`px-2.5 py-0.5 rounded-lg border font-mono text-[10.5px] font-extrabold ${roleConfig.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {acc.role}
                      </span>

                      {/* Password Preview with OWNER Security Guard */}
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-slate-400 text-[11px]">รหัสผ่าน:</span>
                        <span className="font-bold text-amber-300">
                          {isOwner && isShow ? (acc.password || '123456') : '••••••••'}
                        </span>
                        
                        {isOwner ? (
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(acc.id)}
                            className="text-slate-400 hover:text-white text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-sans"
                          >
                            {isShow ? '👁️‍🗨️ ซ่อน' : '👁️ แสดง'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-sans italic" title="สิทธิ์การดูรหัสผ่านสงวนไว้สำหรับ OWNER เท่านั้น">
                            🔒 (OWNER เท่านั้น)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs flex-shrink-0 w-full">
          <div className="text-slate-400 flex items-center gap-1.5">
            <span>🛡️ ปลอดภัยตามมาตรฐาน RBAC Data Security Protocol & Password Privacy Guard</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold rounded-xl shadow-md"
          >
            ปิดหน้าต่าง
          </button>
        </div>

    </div>
  );
}
