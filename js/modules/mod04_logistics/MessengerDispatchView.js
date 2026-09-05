// MODULE: mod04_logistics/MessengerDispatchView.js

function MessengerDispatchView({ currentUser, onLogout }) {
  const isHydrated = useRef(false);

  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_messenger_trips');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filterFn = window.filterQuarantineData;
        return filterFn ? filterFn('messenger_trips', parsed) : parsed;
      }
    } catch(e) {}
    return [];
  });

  const [selectedJob, setSelectedJob] = useState(null);

  // ⚡ Live Cloud Sync & LocalStorage Persistence (Only after initial hydration)
  useEffect(() => {
    if (!isHydrated.current) return;
    try {
      const filterFn = window.filterQuarantineData;
      const cleanJobs = filterFn ? filterFn('messenger_trips', jobs) : jobs;
      localStorage.setItem('aeron_messenger_trips', JSON.stringify(cleanJobs));
      if (typeof syncToDB === 'function') {
        syncToDB('messenger_trips', cleanJobs);
      }
    } catch(e) {}
  }, [jobs]);

  // ⚡ Server-Authoritative Cloud Hydration + Poller
  useEffect(() => {
    let isMounted = true;
    async function hydrateTrips() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;
        if (window.isAeronMutating && window.isAeronMutating('messenger_trips')) return;
        const remoteTrips = await fetcher('messenger_trips', null);
        if (isMounted && Array.isArray(remoteTrips)) {
          const filterFn = window.filterQuarantineData;
          const cleanTrips = filterFn ? filterFn('messenger_trips', remoteTrips) : remoteTrips;
          setJobs(prev => {
            if (window.isAeronMutating && window.isAeronMutating('messenger_trips')) return prev;
            if (JSON.stringify(prev) === JSON.stringify(cleanTrips)) return prev;
            try { localStorage.setItem('aeron_messenger_trips', JSON.stringify(cleanTrips)); } catch(e) {}
            return cleanTrips;
          });
        }
      } catch(e) {
        console.warn('[Messenger Cloud Hydration Notice]:', e.message);
      } finally {
        if (isMounted) isHydrated.current = true;
      }
    }

    hydrateTrips();
    window.addEventListener('focus', hydrateTrips);
    const poller = setInterval(hydrateTrips, 20000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateTrips);
      clearInterval(poller);
    };
  }, []);

  const handleUpdateStatus = (jobId, newStatus) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: newStatus,
          updatedAt: new Date().toLocaleString('th-TH')
        };
      }
      return j;
    }));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 text-slate-100">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-800/40 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-3xl shadow-inner">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                MESSENGER DISPATCH MOBILE
              </span>
              <span className="text-xs text-slate-400 font-medium">ผู้เข้าใช้งาน: <strong>{currentUser ? currentUser.name : 'พนักงานส่งเอกสาร'}</strong></span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">ระบบรับ-ส่งเอกสาร & จัดส่งสินค้าเครื่องมือแพทย์</h2>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
        >
          <span>🔒 ออกจากระบบ</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📦 รอดำเนินการ</div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {jobs.filter(j => j.status === '📦 รอดำเนินการ').length}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">🚚 ระหว่างจัดส่ง</div>
          <div className="text-2xl font-black font-mono text-blue-400">
            {jobs.filter(j => j.status === '🚚 อยู่ระหว่างจัดส่ง').length}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-medium">📌 ส่งมอบสำเร็จ</div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {jobs.filter(j => j.status === '📌 ส่งมอบสำเร็จ').length}
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-300 flex items-center gap-2">
          <span>📋 รายการเอกสาร & พัสดุที่ต้องจัดส่งวันนี้</span>
        </h3>

        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {job.id}
                  </span>
                  <h4 className="font-bold text-white text-base mt-1 flex items-center gap-2">
                    <span>🏥</span> <span>{job.hospitalName}</span>
                  </h4>
                  <p className="text-xs text-slate-400">{job.department}</p>
                </div>

                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  job.status === '📌 ส่งมอบสำเร็จ' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  job.status === '🚚 อยู่ระหว่างจัดส่ง' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {job.status}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                <div className="font-semibold text-emerald-300">{job.packageType}</div>
                <div className="text-slate-300">👨‍⚕️ ผู้รับ: <strong className="text-white">{job.recipient}</strong> (📞 {job.phone})</div>
                <div className="text-slate-400">💼 เซลส์เจ้าของงาน: {job.salesPerson}</div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">อัปเดตล่าสุด: {window.formatAeronDate(job.updatedAt)}</span>

                <div className="flex items-center gap-2">
                  {job.status !== '🚚 อยู่ระหว่างจัดส่ง' && job.status !== '📌 ส่งมอบสำเร็จ' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, '🚚 อยู่ระหว่างจัดส่ง')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md text-xs"
                    >
                      🚚 เริ่มจัดส่ง
                    </button>
                  )}

                  {job.status !== '📌 ส่งมอบสำเร็จ' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, '📌 ส่งมอบสำเร็จ')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md text-xs"
                    >
                      📌 บันทึกส่งมอบสำเร็จ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
