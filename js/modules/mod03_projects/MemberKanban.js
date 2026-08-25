// MODULE: mod03_projects/MemberKanban.js

function MemberKanban({ projects = [], currentUser, stages = window.STAGES || [], members = [], products = [], activeMemberId, onMoveProject, onEditProject, onDeleteProject, onAddLog, onViewHistory, onOpenNewModal, onBookDemo }) {
  const activeMember = members.find(m => m.id === activeMemberId);
  const [selectedMobileStage, setSelectedMobileStage] = useState(stages[0] ? stages[0].id : 'stage_draft');
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [selectedDetailProject, setSelectedDetailProject] = useState(null);

  const handleDragStart = (e, projectId) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.setData('text/plain', projectId);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (projectId) {
      onMoveProject(projectId, targetStageId);
      setDraggedProjectId(null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">
      
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            {activeMember ? activeMember.avatar : '👨‍⚕️'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{activeMember ? activeMember.name : 'กระดาน Sales Kanban Board'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                {activeMember ? activeMember.role : 'ทุกโครงการ'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              แสดงการ์ดสรุปขนาดกะทัดรัด (ชื่อโครงการ, รพ., มูลค่า, เซลล์, โอกาส %) — คลิกที่การ์ดเพื่อดูรายละเอียดฉบับเต็ม
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-3.5 rounded-xl shadow-md transition-colors"
        >
          <span>+ เพิ่มงานใหม่</span>
        </button>
      </div>

      <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {stages.map(stage => {
          const count = projects.filter(p => p.status === stage.id).length;
          const isSelected = selectedMobileStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedMobileStage(stage.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{stage.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-emerald-900 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col lg:flex-row gap-3 min-h-[650px] items-start min-w-full lg:w-[2200px]">
          {stages.map(stage => {
            const stageProjects = projects.filter(p => p.status === stage.id);
            const stageTotalBudget = stageProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
            const isHiddenMobile = selectedMobileStage !== stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800/80 p-3 min-h-[550px] lg:w-[260px] lg:flex-shrink-0 ${
                  isHiddenMobile ? 'hidden lg:flex' : 'flex w-full'
                }`}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stage.headerBg} border border-slate-800 mb-3 space-y-1`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-100 text-xs line-clamp-1">{stage.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${stage.badgeColor}`}>
                      {stageProjects.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    รวม: <span className="text-emerald-400 font-semibold">{formatShortCurrency(stageTotalBudget)}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[700px] pr-1">
                  {stageProjects.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800/80 rounded-xl text-slate-600 text-xs font-medium">
                      ไม่มีโครงการในขั้นตอนนี้
                    </div>
                  ) : (
                    stageProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        stages={stages}
                        onDragStart={(e) => handleDragStart(e, project.id)}
                        onMoveProject={onMoveProject}
                        onEditProject={onEditProject}
                        onDeleteProject={onDeleteProject}
                        onAddLog={onAddLog}
                        onViewHistory={onViewHistory}
                        onBookDemo={onBookDemo}
                        onOpenDetail={(p) => setSelectedDetailProject(p)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Pop-up Modal */}
      {selectedDetailProject && (
        <ProjectDetailModal
          project={selectedDetailProject}
          currentUser={currentUser}
          stages={stages}
          members={members}
          products={products}
          onClose={() => setSelectedDetailProject(null)}
          onEditProject={onEditProject}
          onDeleteProject={onDeleteProject}
          onAddLog={onAddLog}
          onBookDemo={onBookDemo}
          onMoveProject={onMoveProject}
        />
      )}

    </div>
  );
}
