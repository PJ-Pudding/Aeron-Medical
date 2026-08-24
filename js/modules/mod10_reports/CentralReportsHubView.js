// MODULE: mod10_reports/CentralReportsHubView.js
// Dedicated Central Reports Hub Module View

function CentralReportsHubView({
  appState = {},
  onOpenReport = () => {}
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportingId, setExportingId] = useState(null);

  const categories = [
    { id: 'all', label: 'ทั้งหมด (All Reports)', icon: '📚' },
    { id: 'sales', label: 'งานขาย & โครงการ', icon: '💼' },
    { id: 'finance', label: 'การเงิน & ต้นทุน', icon: '🧮' },
    { id: 'logistics', label: 'นำเข้า & ทรัพย์สิน', icon: '🚢' },
    { id: 'demo', label: 'เครื่องสาธิต Demo', icon: '🧪' },
    { id: 'accounting', label: 'บัญชี & งบการเงิน', icon: '🧾' },
    { id: 'regulatory', label: 'อย. & เอกสาร', icon: '🛡️' },
    { id: 'hr', label: 'บุคลากร HR', icon: '👥' }
  ];

  const allReports = useMemo(() => {
    return Object.values(window.REPORT_REGISTRY || {});
  }, []);

  const filteredReports = useMemo(() => {
    return allReports.filter(r => {
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const matchSearch = !searchTerm.trim() || 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.module.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allReports, selectedCategory, searchTerm]);

  const handleQuickExport = (reportDef) => {
    setExportingId(reportDef.id);
    setTimeout(() => {
      try {
        const data = reportDef.transform(appState);
        ExcelExportEngine.exportToExcel(
          `AERON_${reportDef.id}`,
          reportDef.columns,
          data.rows,
          {
            reportTitle: `${reportDef.title} (${reportDef.module})`
          }
        );
      } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการส่งออก: ' + e.message);
      }
      setExportingId(null);
    }, 150);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <span>📊</span>
              <span>ENTERPRISE REPORTING ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ศูนย์รวมรายงานสารสนเทศเพื่อการบริหาร (Unified Reports Hub)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              ดึงข้อมูล Real-time ครอบคลุมทั้ง 9 โมดูลหลักของ AERON MEDICAL พร้อมแสดงผล KPI เชิงลึก และส่งออกเป็นไฟล์ Excel / CSV ได้ในคลิกเดียว
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
              <span className="text-[11px] text-slate-500 font-bold block">รายงานพร้อมใช้งาน</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{allReports.length}</span>
              <span className="text-[10px] text-slate-500 ml-1">รายงาน</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => {
            const count = cat.id === 'all' ? allReports.length : allReports.filter(r => r.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] ${
                  selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหารายงาน..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* 3. Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => {
          const isThisExporting = exportingId === report.id;
          return (
            <div
              key={report.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 space-y-4 shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {report.icon || '📊'}
                  </div>
                  <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {report.module}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-white text-sm group-hover:text-indigo-300 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {report.description}
                  </p>
                </div>

                {/* Column Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {report.columns.slice(0, 3).map((col, cIdx) => (
                    <span key={cIdx} className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
                      {col.label}
                    </span>
                  ))}
                  {report.columns.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                      +{report.columns.length - 3} คอลัมน์
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenReport(report.id)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <span>👁️</span>
                  <span>เปิดดูรายงาน</span>
                </button>

                <button
                  onClick={() => handleQuickExport(report)}
                  disabled={isThisExporting}
                  className="w-full py-2.5 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  title="ดาวน์โหลดไฟล์ Excel ทันที"
                >
                  <span>{isThisExporting ? '⏳' : '📥'}</span>
                  <span>{isThisExporting ? 'กำลังสร้าง...' : 'Export Excel'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

window.CentralReportsHubView = CentralReportsHubView;
