// MODULE: mod03_projects/ProjectCard.js

function ProjectCard({ project, stages = window.STAGES || [], onDragStart, onMoveProject, onEditProject, onDeleteProject, onAddLog, onViewHistory, onBookDemo, onOpenDetail }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onOpenDetail && onOpenDetail(project)}
      className="glass-card rounded-2xl p-3 space-y-2 cursor-pointer hover:border-emerald-500/80 hover:shadow-lg hover:shadow-emerald-500/10 transition-all border border-slate-800/90 relative group bg-slate-900/90"
      title="คลิกเพื่อดูรายละเอียดโครงการเต็มทั้งหมด"
    >
      {/* Top Row: Hospital & Win Probability % */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-slate-100 text-xs line-clamp-1 flex items-center gap-1.5 flex-1">
          <span className="text-emerald-400 text-sm">🏥</span>
          <span className="group-hover:text-emerald-300 transition-colors">{project.hospitalName}</span>
        </h4>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-extrabold flex-shrink-0">
          🎯 โอกาส {project.winProbability}%
        </span>
      </div>

      {/* Project Title */}
      <p className="text-xs text-slate-300 font-semibold leading-snug line-clamp-2">
        {project.title}
      </p>

      {/* Bottom Row: Budget & Sales Assignee */}
      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="font-bold text-amber-400 font-mono text-xs">
          💰 {formatCurrency(project.budget)}
        </span>

        <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1">
          <span>👤</span> {project.assignee}
        </span>
      </div>

      {/* Hover Hint */}
      <div className="text-[9.5px] text-slate-500 group-hover:text-emerald-400 text-right font-medium transition-colors">
        🔍 คลิกเพื่อดูรายละเอียดทั้งหมด ➔
      </div>
    </div>
  );
}
