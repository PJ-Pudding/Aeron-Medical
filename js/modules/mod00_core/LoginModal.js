// MODULE: mod00_core/LoginModal.js

function LoginModal({ onLoginSuccess, onClose, isSwitching = false }) {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountsList, setAccountsList] = useState(() => {
    return window.getUserAccounts ? window.getUserAccounts() : DEMO_USERS;
  });

  useEffect(() => {
    async function refreshUsers() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (fetcher) {
          const remoteUsers = await fetcher('users', null);
          if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
            const rawStr = JSON.stringify(remoteUsers);
            if (!rawStr.includes('à¸') && !rawStr.includes('à¹') && !rawStr.includes('ðŸ')) {
              localStorage.setItem('aeron_user_accounts', rawStr);
              setAccountsList(remoteUsers);
            }
          }
        }
      } catch (e) {}
    }
    refreshUsers();
  }, []);

  const handleQuickLogin = (demoUser) => {
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      const authPayload = {
        ...demoUser,
        token: `aeron_jwt_token_${(demoUser.role || 'SALES').toLowerCase()}_${Date.now()}`,
        loginTime: new Date().toISOString()
      };
      setLoading(false);
      onLoginSuccess(authPayload);
    }, 120);
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
        setLoading(false);
        onLoginSuccess(authPayload);
      } else {
        setLoading(false);
        setErrorMsg('ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้ หรือเลือกเข้าใช้งานด่วน');
      }
    }, 150);
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950 overflow-y-auto ${isSwitching ? 'backdrop-blur-md bg-slate-950/90' : 'min-h-screen'}`}>
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container: Auto-scales from 280px narrow cover screens up to 900px Vivo X Fold 3 Pro & Tablets */}
      <div className="relative bg-slate-900/95 border border-slate-700/80 w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh] backdrop-blur-xl">
        
        {/* Header with Branding */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 shadow-lg shadow-emerald-500/20 border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
              <img 
                src="./assets/logo.jpg" 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=AERON&background=4f46e5&color=fff&size=128'; }}
                alt="AERON MEDICAL Logo" 
                className="h-full w-full object-contain rounded-xl"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-wider leading-tight">
                  <span className="bg-gradient-to-r from-[#a3e635] via-[#65a30d] to-[#16a34a] bg-clip-text text-transparent font-extrabold">AERON </span>
                  <span className="text-white font-bold">MEDICAL</span>
                </h1>
                <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  v2.5
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-200/90 font-medium">ระบบเข้าสู่ระบบเพื่อความปลอดภัย (Authentication Portal)</p>
            </div>
          </div>

          {isSwitching && (
            <button 
              onClick={onClose} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-sm transition-colors"
              title="ปิดหน้าต่างสลับสิทธิ์"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content Body: Adaptive 1-column on narrow cover screens, 2-column on Vivo X Fold 3 Pro / Tablets */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">
            
            {/* Column 1: Quick Role Switcher (1-Click Login for Demo/Testing) */}
            <div className="space-y-3 bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚡</span> <span>เลือกเข้าใช้งานด่วน (Quick Login):</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 max-h-56 md:max-h-72 overflow-y-auto p-0.5">
                {(accountsList || []).map(u => {
                  const config = (window.ROLES_PERMISSIONS && window.ROLES_PERMISSIONS[u.role]) || {};
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      disabled={loading}
                      className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition-all group flex items-center gap-2.5 active:scale-95 touch-manipulation"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-base border border-slate-800 group-hover:border-emerald-500/50 flex-shrink-0">
                        {u.avatar || '👤'}
                      </div>
                      <div className="overflow-hidden space-y-0.5 min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {u.name}
                        </div>
                        <div className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border inline-block ${config.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                          {u.role}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Standard Username & Password Form */}
            <div className="space-y-4 bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <span>🔑</span>
                <span>กรอก Username & Password:</span>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2">
                    <span>⚠️</span> <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-[11px] sm:text-xs text-slate-300">ชื่อผู้ใช้ (Username)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น owner, sales_somchai, messenger..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-base sm:text-xs text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[11px] sm:text-xs text-slate-300">รหัสผ่าน (Password)</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      {showPassword ? '🙈 ซ่อน' : '👁️ แสดงรหัส'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-base sm:text-xs text-white font-mono outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
                >
                  {loading ? (
                    <span>⌛ กำลังตรวจสอบสิทธิ์...</span>
                  ) : (
                    <>
                      <span>🔓 เข้าสู่ระบบ (Log In)</span>
                    </>
                  )}
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleResetDefaultAccounts}
                    className="text-[10px] text-slate-400 hover:text-amber-300 underline transition-colors"
                  >
                    🔄 รีเซ็ตกู้คืนบัญชีผู้ใช้งานตั้งต้น (รหัสเริ่มต้น: 123456)
                  </button>
                </div>
              </form>
            </div>

          </div>

          <div className="text-center pt-2 text-[10.5px] text-slate-500">
            🛡️ ระบบรักษาความปลอดภัยข้อมูลองค์กร AERON MEDICAL (Thailand)
          </div>

        </div>

      </div>
    </div>
  );
}
