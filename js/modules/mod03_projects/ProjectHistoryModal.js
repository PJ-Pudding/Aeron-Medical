// MODULE: mod03_projects/ProjectHistoryModal.js

function ProjectHistoryModal({ project, members = [], stages = window.STAGES || [], products = [], onAddLog, onClose }) {
  const [newLogNote, setNewLogNote] = useState('');
  const [logAuthor, setLogAuthor] = useState(project.assignee);
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const currentStageObj = stages.find(s => s.id === project.status) || { title: project.status, badgeColor: 'bg-slate-800 text-slate-300' };

  // Filtered Logs
  const logs = Array.isArray(project.weeklyLogs) ? project.weeklyLogs : [];
  const filteredLogs = useMemo(() => {
    if (!logSearchQuery.trim()) return logs;
    const q = logSearchQuery.toLowerCase();
    return logs.filter(l => (l.note || '').toLowerCase().includes(q) || (l.author || '').toLowerCase().includes(q) || (l.date || '').toLowerCase().includes(q));
  }, [logs, logSearchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;
    onAddLog(project.id, newLogNote, logAuthor);
    setNewLogNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStageObj.badgeColor}`}>
                {currentStageObj.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                🎯 โอกาสได้งาน {project.winProbability}%
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {project.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mt-1">
              <span>🏥 {project.hospitalName}</span>
            </h3>
            <p className="text-sm font-semibold text-emerald-300 line-clamp-1">{project.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">💰 งบประมาณโครงการ:</span>
            <span className="text-amber-400 font-bold text-base font-mono">{formatCurrency(project.budget)}</span>
            <span className="text-[10px] text-slate-500 block">({project.budgetType})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">📦 รุ่นสินค้าที่เสนอ:</span>
            <span className="text-emerald-300 font-bold text-sm line-clamp-1">{project.productName || 'ไม่ระบุ'}</span>
            <span className="text-[10px] text-slate-500 block">จำนวน {project.quantity || 1} ชุด</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">👤 เซลส์ผู้รับผิดชอบ:</span>
            <span className="text-white font-bold text-sm">{project.assignee}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">📅 กำหนดจัดซื้อ:</span>
            <span className="text-cyan-300 font-mono font-bold text-sm">{project.procurementDate || 'N/A'}</span>
          </div>
        </div>

        {/* Quick Add Log Form inside History Modal */}
        <form onSubmit={handleAddSubmit} className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>✍️ บันทึก Progress ความเคลื่อนไหวประจำสัปดาห์ใหม่</span>
            </label>
            <select
              value={logAuthor}
              onChange={(e) => setLogAuthor(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
            >
              {(members || []).map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="พิมพ์รายละเอียดกิจกรรม / การเข้าพบลูกค้าสัปดาห์นี้..."
              value={newLogNote}
              onChange={(e) => setNewLogNote(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex-shrink-0">
              + บันทึก Log
            </button>
          </div>
        </form>

        {/* History Timeline Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span>📜 ประวัติความเคลื่อนไหวย้อนหลัง (Activity Timeline History)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
                {logs.length} บันทึก
              </span>
            </h4>

            {logs.length > 0 && (
              <input
                type="text"
                placeholder="ค้นหาในประวัติ..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            )}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
              {logSearchQuery ? 'ไม่พบบันทึกที่ตรงกับคำค้นหา' : 'ยังไม่มีประวัติการอัปเดตย้อนหลัง สามารถพิมพ์บันทึกแรกได้ที่ช่องด้านบน'}
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {filteredLogs.map((log, index) => (
                <div key={index} className="relative group">
                  {/* Timeline node icon */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md shadow-emerald-500/50"></div>
                  
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs border-b border-slate-900/80 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-300">👤 {log.author || project.assignee}</span>
                        <span className="text-[10.5px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                          {window.formatAeronDate(log.date)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{filteredLogs.length - index}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed pt-1 whitespace-pre-wrap">
                      {log.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extra Information Reference */}
        {(project.decisionMakers || project.competitors || project.torDetails || project.details) && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h5 className="font-bold text-slate-300">📋 ข้อมูลประกอบโครงการ</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              {project.decisionMakers && (
                <div><span className="text-indigo-400 font-semibold">👨‍⚕️ ผู้ตัดสินใจ:</span> {project.decisionMakers}</div>
              )}
              {project.competitors && (
                <div><span className="text-rose-400 font-semibold">⚔️ คู่แข่ง:</span> {project.competitors}</div>
              )}
              {project.dfAmount && (
                <div><span className="text-purple-300 font-semibold">💵 ค่า DF:</span> {project.dfAmount}</div>
              )}
              {project.demoStatus && (
                <div><span className="text-purple-300 font-semibold">🧪 สถานะเดโม่:</span> {project.demoStatus} ({project.demoStartDate || 'N/A'})</div>
              )}
            </div>
            {project.details && (
              <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                "{project.details}"
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700"
          >
            🖨️ พิมพ์ประวัติความเคลื่อนไหว
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
