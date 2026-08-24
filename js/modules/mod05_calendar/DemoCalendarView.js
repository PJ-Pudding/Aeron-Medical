// MODULE: mod05_calendar/DemoCalendarView.js

function DemoCalendarView({ demoBookings, products, projects, members, onOpenBookDemo, onDeleteBooking }) {
  const [filterProduct, setFilterProduct] = useState('all');
  const [calendarMode, setCalendarMode] = useState('month'); // 'month' or 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // Default August 2026 for mock data
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const filteredBookings = useMemo(() => {
    return demoBookings.filter(b => {
      if (filterProduct !== 'all' && b.productId !== filterProduct) return false;
      return true;
    });
  }, [demoBookings, filterProduct]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title & Controls Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
            📅
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ปฏิทินจองคิวเครื่อง Demo (Demo Booking Schedule)</span>
            </h2>
            <p className="text-xs text-slate-400">
              ฐานข้อมูลคิวสาธิตเครื่องร่วมกัน ป้องกันการจองเครื่องชนกันระหว่างทีมขาย
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* 📊 Demo Analytics Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 font-bold text-xs py-2.5 px-3.5 rounded-xl border border-amber-500/40 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            title="ดูรายงานประวัติการเดินทางของเครื่อง ค่าใช้จ่าย และอัตรา Win Rate"
          >
            <span>📊 รายงานประวัติ & สถิติ Demo</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarMode === 'month' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗓️ Month Grid
            </button>
            <button
              onClick={() => setCalendarMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 รายการ
            </button>
          </div>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 outline-none"
          >
            <option value="all">กรองทุกรุ่น</option>
            {(products || []).map(p => (
              <option key={p.id} value={p.id}>📦 {p.name}</option>
            ))}
          </select>

          <button
            onClick={onOpenBookDemo}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>+ เพิ่มการจองคิว Demo</span>
          </button>
        </div>
      </div>

      {/* Month View vs List View */}
      {calendarMode === 'month' ? (
        <MonthCalendarGrid
          currentMonth={currentMonth}
          bookings={filteredBookings}
          products={products}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onTodayMonth={handleTodayMonth}
          onDeleteBooking={onDeleteBooking}
        />
      ) : (
        /* Bookings List Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.length === 0 ? (
            <div className="col-span-full text-center py-12 glass-panel rounded-2xl text-slate-500 text-sm">
              ไม่มีรายการจองคิวเครื่องสาธิตในระบบ
            </div>
          ) : (
            filteredBookings.map(b => (
              <div key={b.id} className="glass-card p-4 rounded-2xl space-y-3 relative border border-slate-800/80 hover:border-purple-500/40 transition-colors">
                
                <div className="flex items-start justify-between">
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    🧪 {b.status || 'อนุมัติคิว'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                    SN: {b.demoSerial || 'AERON-DEMO'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{b.hospitalName}</h4>
                  <p className="text-xs text-indigo-300 font-medium mt-0.5">📦 {b.productName}</p>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-2.5 space-y-1 text-xs border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>📅 ช่วงวันที่สาธิต:</span>
                    <span className="font-mono text-amber-300 font-semibold">{b.startDate} ถึง {b.endDate}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>👤 ผู้จอง / เซลส์:</span>
                    <span className="text-emerald-300 font-medium">{b.salesPerson}</span>
                  </div>
                </div>

                {b.note && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    "{b.note}"
                  </p>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onDeleteBooking(b.id)}
                    className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded-lg bg-rose-950/30 border border-rose-800/40"
                  >
                    🗑️ ยกเลิกการจอง
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* 📊 Demo Analytics & History Report Modal */}
      <DemoReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        demoBookings={demoBookings}
        products={products}
        projects={projects}
        members={members}
      />

    </div>
  );
}
