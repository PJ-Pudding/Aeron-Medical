// MODULE: mod05_calendar/MonthCalendarGrid.js

function MonthCalendarGrid({ currentMonth, bookings = [], products = [], onPrevMonth, onNextMonth, onTodayMonth, onDeleteBooking }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const getBookingsForDay = (dayNum) => {
    if (!dayNum) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return bookings.filter(b => {
      if (!b.startDate || !b.endDate) return false;
      return dateStr >= b.startDate && dateStr <= b.endDate;
    });
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🗓️ {monthNames[month]} {year + 543}</span>
            <span className="text-xs font-normal text-slate-400 font-mono">({year})</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700"
          >
            ◀ เดือนก่อน
          </button>
          <button
            onClick={onTodayMonth}
            className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs rounded-xl border border-purple-700 font-semibold"
          >
            เดือนปัจจุบัน
          </button>
          <button
            onClick={onNextMonth}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700"
          >
            เดือนถัดไป ▶
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayNames.map((d, i) => (
          <div key={d} className={`text-center py-2 text-xs font-bold ${i === 0 ? 'text-rose-400' : i === 6 ? 'text-amber-400' : 'text-slate-400'}`}>
            {d}
          </div>
        ))}

        {calendarDays.map((dayNum, idx) => {
          if (dayNum === null) {
            return <div key={`empty-${idx}`} className="bg-slate-950/40 rounded-xl min-h-[90px] p-1 border border-slate-900/40"></div>;
          }

          const dayBookings = getBookingsForDay(dayNum);
          const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;

          return (
            <div
              key={`day-${dayNum}`}
              className={`bg-slate-900/80 rounded-xl min-h-[100px] p-1.5 border transition-colors space-y-1 relative flex flex-col justify-between ${
                isToday ? 'border-purple-500 bg-purple-950/30' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  isToday ? 'bg-purple-500 text-white' : 'text-slate-300'
                }`}>
                  {dayNum}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">
                    {dayBookings.length} คิว
                  </span>
                )}
              </div>

              <div className="space-y-1 max-h-[80px] overflow-y-auto pr-0.5">
                {dayBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-1 rounded bg-purple-900/60 border border-purple-700/60 text-[9.5px] leading-tight space-y-0.5 group relative"
                    title={`${b.hospitalName} - ${b.productName} (โดย ${b.salesPerson})`}
                  >
                    <div className="font-bold text-white line-clamp-1">{b.hospitalName}</div>
                    <div className="text-purple-200 line-clamp-1">{b.productName}</div>
                    <div className="text-emerald-300 text-[8.5px]">👤 {b.salesPerson}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
