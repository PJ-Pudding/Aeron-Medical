// MODULE: mod03_projects/KanbanModal.js

function KanbanModal({ 
  isOpen, 
  onClose, 
  activeMemberId = 'kanban_all', 
  projects = [], 
  stages = window.STAGES || [], 
  members = [], 
  products = [], 
  demoBookings = [], 
  onMoveProject = () => {}, 
  onEditProject = () => {}, 
  onDeleteProject = () => {}, 
  onAddLog = () => {}, 
  onViewHistory = () => {}, 
  onOpenVoiceModal = () => {}, 
  onOpenNewModal = () => {}, 
  onBookDemo = () => {}, 
  onOpenChecklist = () => {} 
}) {
  const [selectedMemberId, setSelectedMemberId] = useState(activeMemberId || 'kanban_all');

  useEffect(() => {
    if (activeMemberId) {
      setSelectedMemberId(activeMemberId);
    }
  }, [activeMemberId]);

  if (!isOpen) return null;

  // Filter projects if specific member selected
  const displayProjects = useMemo(() => {
    if (selectedMemberId === 'kanban_all' || selectedMemberId === 'manager' || selectedMemberId === 'all') {
      return projects;
    }
    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      return projects.filter(p => p.assignee === member.name);
    }
    return projects;
  }, [projects, members, selectedMemberId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-[1700px] h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl shadow-lg shadow-emerald-600/30">
              📋
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>กระดานติดตามงานขาย Sales Kanban Board</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  {displayProjects.length} โครงการ
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                ลาก-วาง (Drag & Drop) เพื่อเปลี่ยนสถานะ หรือคลิกไอคอนเพื่ออัปเดตรายละเอียดโครงการ
              </p>
            </div>
          </div>

          {/* Member Filter Pills & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedMemberId('kanban_all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedMemberId === 'kanban_all' || selectedMemberId === 'manager'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 ทุกโครงการ ({projects.length})
              </button>
              {(members || []).map(m => {
                const count = projects.filter(p => p.assignee === m.name).length;
                const isSelected = selectedMemberId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{m.avatar} {m.name.split(' ')[0]}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { onClose(); onOpenNewModal(); }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1"
            >
              <span>+ เพิ่มโครงการ</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors border border-slate-700"
              title="ปิด Pop-up"
            >
              ✕ ปิด
            </button>
          </div>
        </div>

        {/* Modal Body with Scrollable Kanban */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/40">
          <MemberKanban
            projects={displayProjects}
            stages={stages}
            members={members}
            products={products}
            activeMemberId={selectedMemberId}
            demoBookings={demoBookings}
            onMoveProject={onMoveProject}
            onEditProject={onEditProject}
            onDeleteProject={onDeleteProject}
            onAddLog={onAddLog}
            onViewHistory={onViewHistory}
            onOpenVoiceModal={onOpenVoiceModal}
            onOpenNewModal={onOpenNewModal}
            onBookDemo={onBookDemo}
            onOpenChecklist={onOpenChecklist}
          />
        </div>

      </div>
    </div>
  );
}
