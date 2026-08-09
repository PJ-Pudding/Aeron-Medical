// MODULE: mod03_projects/ProjectDetailModal.js

function ProjectDetailModal({ project, currentUser, stages = window.STAGES || [], members = [], products = [], onClose, onEditProject, onDeleteProject, onAddLog, onBookDemo, onMoveProject }) {
  if (!project) return null;

  const canEdit = window.canEditProject ? window.canEditProject(currentUser, project) : true;
  const stageInfo = stages.find(s => s.id === project.status) || { title: project.status, badgeColor: 'bg-slate-800 text-slate-300' };
  const logs = project.weeklyLogs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${
                project.clientType === 'รัฐบาล' 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {project.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
              </span>

              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-md border ${stageInfo.badgeColor}`}>
                {stageInfo.title}
              </span>

              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                🎯 โอกาสได้งาน {project.winProbability}%
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 mt-1">
              <span className="text-emerald-400">🏥</span>
              <span>{project.hospitalName}</span>
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {project.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex-shrink-0"
          >
            ✕ ปิด
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">💰 มูลค่างานประมูล</div>
              <div className="text-base font-black text-amber-400 font-mono mt-0.5">{formatCurrency(project.budget)}</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">👤 เซลล์ผู้รับผิดชอบ</div>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">{project.assignee}</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">🏛️ ประเภทงบประมาณ</div>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">{project.budgetType || 'งบประมาณแผ่นดิน'}</div>
            </div>
          </div>

          {/* Product Info */}
          {project.productName && (
            <div className="bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-800/40 space-y-1">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span>📦 สินค้าและแบรนด์ที่เสนอ:</span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {project.productName} <span className="text-emerald-400 font-normal text-xs">({project.productBrand || 'AERON MEDICAL'})</span>
              </p>
            </div>
          )}

          {/* Demo Schedule Status */}
          <div className="bg-purple-950/40 p-3.5 rounded-2xl border border-purple-800/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <span>🧪 สถานะทดสอบเครื่อง Demo:</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-800/60 text-purple-100 text-[11px]">
                  {project.demoStatus || 'ยังไม่ได้เข้าเดโม่'}
                </span>
              </span>
              <button
                onClick={() => { onClose(); onBookDemo(project); }}
                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                <span>🧪 จองคิว Demo เครื่องมือ</span>
              </button>
            </div>
            {project.demoStartDate && (
              <p className="text-xs text-purple-200 font-mono mt-1">
                📅 ช่วงวันนัดหมาย: {project.demoStartDate} ถึง {project.demoEndDate || 'N/A'}
              </p>
            )}
          </div>

          {/* Doctor & Competitors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.decisionMakers && (
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                  <span>👨‍⚕️</span> อาจารย์แพทย์ผู้ตัดสินใจ:
                </span>
                <p className="text-xs text-slate-200 font-medium">{project.decisionMakers}</p>
              </div>
            )}

            {project.competitors && (
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <span>⚔️</span> คู่แข่งในงานประมูล:
                </span>
                <p className="text-xs text-rose-200 font-medium">{project.competitors}</p>
              </div>
            )}
          </div>

          {/* Weekly Progress Logs Timeline */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>📝 ประวัติบันทึกความเคลื่อนไหว (Weekly Log History)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {logs.length} รายการ
                </span>
              </h3>
              <button
                onClick={() => { onClose(); onAddLog(project); }}
                className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30"
              >
                + เพิ่ม Log ใหม่
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-4 text-slate-500 text-xs italic">
                ยังไม่มีบันทึกประวัติความเคลื่อนไหวสำหรับโครงการนี้
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {logs.map((log, idx) => (
                  <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-emerald-400">👤 {log.author || project.assignee}</span>
                      <span className="font-mono text-[10.5px]">📅 {log.date}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-snug">{log.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {canEdit ? (
              <>
                <button
                  onClick={() => { onClose(); onEditProject(project); }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1"
                >
                  <span>✏️ แก้ไขข้อมูลโครงการ</span>
                </button>

                <button
                  onClick={() => { onClose(); onBookDemo(project); }}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1"
                >
                  <span>🧪 จองคิว Demo</span>
                </button>

                <button
                  onClick={() => { onClose(); onDeleteProject(project.id); }}
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800 transition-colors"
                >
                  🗑️ ลบโครงการ
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 font-medium bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  🔒 อ่านอย่างเดียว (เฉพาะ OWNER เท่านั้นที่แก้ไขงานผู้อื่นได้)
                </span>
                <button
                  onClick={() => { onClose(); onBookDemo(project); }}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  <span>🧪 จองคิว Demo</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
