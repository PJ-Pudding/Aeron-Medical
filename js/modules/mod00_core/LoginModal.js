// MODULE: mod00_core/LoginModal.js

function LoginModal({ onLoginSuccess, onClose, isSwitching = false }) {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountsList, setAccountsList] = useState(() => {
    return window.getUserAccounts ? window.getUserAccounts() : DEMO_USERS;
  });

  const handleQuickLogin = (demoUser) => {
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      const authPayload = {
        ...demoUser,
        token: `aeron_jwt_token_${(demoUser.role || 'SALES').toLowerCase()}_${Date.now()}`,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('aeron_auth_user', JSON.stringify(authPayload));
      localStorage.setItem('aeron_jwt_token', authPayload.token);
      setLoading(false);
      onLoginSuccess(authPayload);
    }, 150);
  };

  const handleResetDefaultAccounts = () => {
    localStorage.setItem('aeron_user_accounts', JSON.stringify(DEMO_USERS));
    setAccountsList(DEMO_USERS);
    setUsername('owner');
    setPassword('123456');
    setErrorMsg('');
    alert('🔄 รีเซ็ตกู้คืนบัญชีผู้ใช้งานตั้งต้นเรียบร้อยแล้ว (Username: owner / Password: 123456)');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const uClean = username.trim().toLowerCase();
    const currentAccounts = window.getUserAccounts ? window.getUserAccounts() : DEMO_USERS;
    const foundUser = currentAccounts.find(u => (u.username || '').toLowerCase() === uClean || (u.id || '').toLowerCase() === uClean);

    setTimeout(() => {
      if (foundUser) {
        if (foundUser.password && foundUser.password !== password && password !== '123456') {
          setLoading(false);
          setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง (รหัสเริ่มต้น: 123456)');
          return;
        }

        const authPayload = {
          ...foundUser,
          token: `aeron_jwt_token_${(foundUser.role || 'SALES').toLowerCase()}_${Date.now()}`,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('aeron_auth_user', JSON.stringify(authPayload));
        localStorage.setItem('aeron_jwt_token', authPayload.token);
        setLoading(false);
        onLoginSuccess(authPayload);
      } else {
        setLoading(false);
        setErrorMsg('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้ หรือกดปุ่มกู้คืนบัญชีตั้งต้นด้านล่าง');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🛡️
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>AERON MEDICAL Authentication</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  v2.5 RBAC
                </span>
              </h2>
              <p className="text-xs text-slate-400">ระบบลงชื่อเข้าใช้งานและกำหนดสิทธิ์ตามบทบาทองค์กร</p>
            </div>
          </div>

          {isSwitching && (
            <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs">
              ✕
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Role Switcher (1-Click Demo Testing) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡</span> <span>เลือกเข้าใช้งานด่วนตามบทบาท (Quick Role Switcher):</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto">
              {(accountsList || []).map(u => {
                const config = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[u.role]) || {};
                return (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    disabled={loading}
                    className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-2xl text-left transition-all group flex items-center gap-3 active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xl border border-slate-800 group-hover:border-emerald-500/50 flex-shrink-0">
                      {u.avatar || '👤'}
                    </div>
                    <div className="overflow-hidden space-y-0.5">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                        <span>{u.name}</span>
                      </div>
                      <div className={`text-[10px] font-mono font-semibold px-2 py-0.2 rounded border inline-block ${config.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {u.role}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-mono">หรือลงชื่อเข้าใช้ด้วยบัญชี</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2">
                <span>⚠️</span> <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อผู้ใช้ (Username / Role ID)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น owner, sales_somchai, messenger..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รหัสผ่าน (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>⌛ กำลังยืนยันสิทธิ์...</span>
              ) : (
                <>
                  <span>🔓 เข้าสู่ระบบ (Log In)</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResetDefaultAccounts}
                className="text-[11px] text-slate-400 hover:text-amber-300 underline transition-colors"
              >
                🔄 รีเซ็ตกู้คืนบัญชีผู้ใช้งานตั้งต้น (Default Accounts: owner / 123456)
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
