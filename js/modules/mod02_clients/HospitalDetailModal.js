// MODULE: mod02_clients/HospitalDetailModal.js

function HospitalDetailModal({ hospital, demoBookings = [], soldProducts = [], stages = window.STAGES || [], onClose, onOpenProjectDetail, onEditProject }) {
  if (!hospital) return null;

  const hospitalProjects = hospital.projects || [];
  const hospitalDemos = demoBookings.filter(b => (b.hospitalName || b.hospital || '').includes(hospital.name));
  const hospitalSoldAssets = soldProducts.filter(s => (s.hospitalName || '').includes(hospital.name));
  const decisionMakersList = Array.from(hospital.decisionMakers || []);
  const salesList = Array.from(hospital.salesAssignees || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-3xl shadow-inner">
              🏥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${
                  hospital.clientType === 'รัฐบาล' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {hospital.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                  💰 งบประมาณรวม {formatCurrency(hospital.totalBudget)}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                <span>{hospital.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {hospitalProjects.length} โครงการ
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex-shrink-0"
          >
            ✕ ปิด
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Key Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">👤 เซลล์ผู้ดูแลพื้นที่</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">{salesList.join(', ') || 'ไม่ระบุ'}</div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">👨‍⚕️ แพทย์ผู้มีอำนาจสั่งซื้อ</div>
              <div className="text-sm font-bold text-indigo-300 mt-0.5 line-clamp-1" title={decisionMakersList.join(', ')}>
                {decisionMakersList.join(', ') || 'ไม่ระบุ'}
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">🏆 อุปกรณ์ที่ติดตั้งแล้ว</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">{hospitalSoldAssets.length} เครื่อง</div>
            </div>
          </div>

          {/* Section 1: โครงการทั้งหมดในโรงพยาบาลนี้ */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>📋 โครงการจัดซื้อจัดจ้างทั้งหมด ({hospitalProjects.length} งาน)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {hospitalProjects.map(p => {
                const stage = stages.find(s => s.id === p.status) || { title: p.status, badgeColor: 'bg-slate-800 text-slate-300' };
                return (
                  <div key={p.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${stage.badgeColor}`}>
                          {stage.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                          🎯 โอกาส {p.winProbability}%
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          💰 {formatCurrency(p.budget)}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-100 text-xs sm:text-sm">{p.title}</h4>

                      {p.productName && (
                        <div className="text-xs text-emerald-300 font-medium">
                          📦 สินค้า: {p.productName} ({p.productBrand || 'AERON MEDICAL'})
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400">
                        👤 เซลล์: <strong className="text-slate-200">{p.assignee}</strong> | 🏛️ งบ: {p.budgetType}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { onClose(); onOpenProjectDetail(p); }}
                        className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30"
                      >
                        🔍 ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => { onClose(); onEditProject(p); }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700"
                      >
                        ✏️ แก้ไข
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: คิวทดสอบเครื่อง Demo ที่โรงพยาบาลนี้ */}
          {hospitalDemos.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-purple-800/40 space-y-3 bg-purple-950/20">
              <h3 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                <span>🧪 คิวสาธิตเครื่อง Demo ({hospitalDemos.length} รายการ)</span>
              </h3>
              <div className="space-y-2">
                {hospitalDemos.map(b => (
                  <div key={b.id} className="p-3 bg-slate-900 rounded-xl border border-purple-800/40 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">📦 สินค้า: {b.productName}</div>
                      <div className="text-purple-200 font-mono mt-0.5">📅 {b.startDate} ถึง {b.endDate}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-900 text-purple-200 text-[11px] font-bold">
                      {b.status || 'นัดหมายแล้ว'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: ทะเบียนเครื่องที่ติดตั้งแล้ว & สภาพประกัน/PM */}
          {hospitalSoldAssets.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-emerald-800/40 space-y-3 bg-emerald-950/20">
              <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                <span>🏆 อุปกรณ์แพทย์ที่ติดตั้งแล้ว & กำหนด PM ({hospitalSoldAssets.length} เครื่อง)</span>
              </h3>
              <div className="space-y-2">
                {hospitalSoldAssets.map(a => (
                  <div key={a.id} className="p-3 bg-slate-900 rounded-xl border border-emerald-800/40 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">📦 {a.productName} (SN: {a.serialNumber})</div>
                      <div className="text-slate-400 mt-0.5">แผนก: {a.department} | หมดประกัน: {a.warrantyExpiryDate}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
                      {a.pmStatus || 'รับมอบเรียบร้อย'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex justify-end flex-shrink-0">
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
