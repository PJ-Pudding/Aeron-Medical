// MODULE: mod02_clients/ClientsDirectoryView.js

function ClientsDirectoryView({ projects = [], members = [], demoBookings = [], soldProducts = [], searchTerm = '', setSearchTerm = () => {}, filterClientType = 'all', setFilterClientType = () => {}, onEditProject, onBookDemo, onAddLog, onOpenProjectDetail }) {
  const [selectedHospital, setSelectedHospital] = useState(null);

  const hospitalMap = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      const hName = p.hospitalName || 'ไม่ระบุชื่อโรงพยาบาล';
      if (!map[hName]) {
        map[hName] = {
          name: hName,
          clientType: p.clientType || 'รัฐบาล',
          projects: [],
          totalBudget: 0,
          decisionMakers: new Set(),
          salesAssignees: new Set()
        };
      }
      map[hName].projects.push(p);
      map[hName].totalBudget += Number(p.budget) || 0;
      if (p.decisionMakers) map[hName].decisionMakers.add(p.decisionMakers);
      if (p.assignee) map[hName].salesAssignees.add(p.assignee);
    });
    return Object.values(map);
  }, [projects]);

  const filteredHospitals = useMemo(() => {
    return hospitalMap.filter(h => {
      if (filterClientType !== 'all' && h.clientType !== filterClientType) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchName = h.name.toLowerCase().includes(query);
        const matchDoc = Array.from(h.decisionMakers).some(d => d.toLowerCase().includes(query));
        const matchSales = Array.from(h.salesAssignees).some(s => s.toLowerCase().includes(query));
        return matchName || matchDoc || matchSales;
      }
      return true;
    });
  }, [hospitalMap, filterClientType, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl shadow-inner">
            🏥
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลลูกค้า & โรงพยาบาล (Clients & Hospital Directory)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                {filteredHospitals.length} โรงพยาบาล
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              คลิกที่การ์ดโรงพยาบาลเพื่อเปิดดูรายละเอียดโครงการทั้งหมด อาจารย์แพทย์ผู้ตัดสินใจ คิว Demo และอุปกรณ์ที่ติดตั้งแล้ว
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterClientType}
            onChange={(e) => setFilterClientType(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 outline-none font-semibold"
          >
            <option value="all">ทุกประเภทลูกค้า</option>
            <option value="รัฐบาล">🏛️ รัฐบาล</option>
            <option value="เอกชน">🏢 เอกชน</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHospitals.map(h => (
          <div 
            key={h.name} 
            onClick={() => setSelectedHospital(h)}
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-blue-500/70 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all group"
            title="คลิกเพื่อเปิด Pop-up ดูรายละเอียดโรงพยาบาลนี้ทั้งหมด"
          >
            <div className="flex items-start justify-between">
              <span className={`text-[10.5px] font-semibold px-2.5 py-0.5 rounded-md border ${
                h.clientType === 'รัฐบาล' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {h.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                💰 {formatShortCurrency(h.totalBudget)}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base leading-snug flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                <span>🏥</span>
                <span>{h.name}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                มี {h.projects.length} โครงการในระบบ
              </p>
            </div>

            {h.decisionMakers.size > 0 && (
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                <span className="text-indigo-300 font-bold flex items-center gap-1">
                  <span>👨‍⚕️</span> อาจารย์ / แพทย์ผู้มีอำนาจสั่งซื้อ:
                </span>
                <p className="text-slate-200 line-clamp-2">
                  {Array.from(h.decisionMakers).join(', ')}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>👤 เซลล์ดูแล: <strong className="text-amber-300">{Array.from(h.salesAssignees).join(', ')}</strong></span>
              <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform">🔍 ดูข้อมูลทั้งหมด ➔</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hospital Detail Pop-up Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          demoBookings={demoBookings}
          soldProducts={soldProducts}
          stages={window.STAGES}
          onClose={() => setSelectedHospital(null)}
          onOpenProjectDetail={(p) => {
            if (onOpenProjectDetail) onOpenProjectDetail(p);
          }}
          onEditProject={onEditProject}
        />
      )}
    </div>
  );
}
