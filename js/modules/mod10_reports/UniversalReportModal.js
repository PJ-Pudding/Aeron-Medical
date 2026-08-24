// MODULE: mod10_reports/UniversalReportModal.js
// Pluggable Universal Report Viewer Modal with Real-time Filters & Excel Export

function UniversalReportModal({
  isOpen,
  onClose,
  reportId,
  appState = {}
}) {
  if (!isOpen || !reportId) return null;

  const reportDef = (window.REPORT_REGISTRY && window.REPORT_REGISTRY[reportId]) || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Compute report data on demand
  const reportData = useMemo(() => {
    if (!reportDef || !reportDef.transform) return { rows: [], kpis: [] };
    try {
      return reportDef.transform(appState);
    } catch (err) {
      console.error('Report computation error:', err);
      return { rows: [], kpis: [] };
    }
  }, [reportDef, appState]);

  // Real-time Search Filter
  const filteredRows = useMemo(() => {
    const rows = reportData.rows || [];
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter(row => {
      return Object.values(row).some(val => {
        if (val === undefined || val === null) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [reportData.rows, searchQuery]);

  const handleExportExcel = () => {
    if (!reportDef) return;
    setIsExporting(true);
    setTimeout(() => {
      ExcelExportEngine.exportToExcel(
        `AERON_${reportDef.id}`,
        reportDef.columns,
        filteredRows,
        {
          reportTitle: `${reportDef.title} (${reportDef.module})`
        }
      );
      setIsExporting(false);
    }, 150);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!reportDef) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl text-center space-y-3 max-w-md">
          <div className="text-3xl">⚠️</div>
          <div className="text-white font-bold">ไม่พบรายงานรหัส "{reportId}"</div>
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-6xl rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl animate-modal max-h-[94vh] flex flex-col text-slate-100">

        {/* 1. Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {reportDef.icon || '📊'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">{reportDef.title}</h3>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                  {reportDef.module}
                </span>
              </div>
              <p className="text-xs text-slate-400">{reportDef.description}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportExcel}
              disabled={isExporting || filteredRows.length === 0}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
              title="ส่งออกรายงานเป็นไฟล์ Excel / CSV พร้อมเปิดใช้งาน"
            >
              <span>{isExporting ? '⏳' : '📥'}</span>
              <span>{isExporting ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลด Excel'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
              title="พิมพ์รายงาน"
            >
              <span>🖨️ พิมพ์</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 2. KPI Summary Cards */}
        {reportData.kpis && reportData.kpis.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {reportData.kpis.map((kpi, idx) => {
              const bgCol = kpi.color === 'emerald' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
                            kpi.color === 'rose' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
                            kpi.color === 'amber' ? 'bg-amber-950/40 border-amber-500/30 text-amber-300' :
                            kpi.color === 'indigo' ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300' :
                            'bg-slate-800/50 border-slate-700 text-slate-200';
              return (
                <div key={idx} className={`p-3 rounded-2xl border ${bgCol} flex flex-col justify-between`}>
                  <span className="text-[11px] text-slate-400 font-medium">{kpi.label}</span>
                  <span className="text-sm sm:text-base font-extrabold mt-0.5 tracking-tight font-mono">{kpi.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาข้อมูลในรายงาน (เช่น ชื่อ รพ., รุ่นเครื่อง, เซลส์, S/N)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center justify-end gap-2 px-1">
            <span>แสดง <strong>{filteredRows.length}</strong> จาก <strong>{reportData.rows.length}</strong> รายการ</span>
          </div>
        </div>

        {/* 4. Interactive Data Table */}
        <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/50 scrollbar-thin">
          {filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-2">
              <span className="text-3xl">📭</span>
              <span className="text-sm font-bold">ไม่พบข้อมูลตรงกับเงื่อนไขที่ค้นหา</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  {reportDef.columns.map((col, cIdx) => (
                    <th key={cIdx} className={`p-3 whitespace-nowrap ${col.format === 'currency' || col.format === 'number' || col.format === 'percent' ? 'text-right' : ''}`}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11.5px]">
                {filteredRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-center text-slate-500 text-[10.5px] font-sans">{rIdx + 1}</td>
                    {reportDef.columns.map((col, cIdx) => {
                      const val = row[col.key];
                      let displayVal = val;
                      let extraClass = 'text-slate-200';

                      if (val === undefined || val === null || val === '') {
                        displayVal = '-';
                        extraClass = 'text-slate-600';
                      } else if (col.format === 'currency') {
                        displayVal = formatCurrency(val);
                        extraClass = 'text-right font-bold text-emerald-400';
                      } else if (col.format === 'percent') {
                        displayVal = typeof val === 'number' ? `${val.toFixed(2)}%` : String(val);
                        extraClass = 'text-right font-bold text-amber-300';
                      } else if (col.format === 'number') {
                        displayVal = typeof val === 'number' ? val.toLocaleString('th-TH') : String(val);
                        extraClass = 'text-right font-bold text-slate-200';
                      } else if (typeof val === 'string' && (val.includes('หมดประกัน') || val.includes('หมดอายุ') || val.includes('แพ้งาน'))) {
                        extraClass = 'text-rose-400 font-bold font-sans';
                      } else if (typeof val === 'string' && (val.includes('ใกล้หมด') || val.includes('รอผล'))) {
                        extraClass = 'text-amber-300 font-bold font-sans';
                      } else if (typeof val === 'string' && (val.includes('ในประกัน') || val.includes('ชนะ') || val.includes('ปกติ'))) {
                        extraClass = 'text-emerald-300 font-bold font-sans';
                      } else {
                        extraClass = 'font-sans text-slate-200';
                      }

                      return (
                        <td key={cIdx} className={`p-3 whitespace-nowrap ${extraClass}`}>
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 5. Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-500 shrink-0">
          <span>* รายงานคำนวณแบบ Real-time จากฐานข้อมูลปัจจุบันของระบบ AERON MEDICAL</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
}

window.UniversalReportModal = UniversalReportModal;
