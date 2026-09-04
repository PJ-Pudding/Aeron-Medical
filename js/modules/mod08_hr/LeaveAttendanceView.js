// MODULE: mod08_hr/LeaveAttendanceView.js

function LeaveAttendanceView({ leaveRequests = [], attendanceLogs = [], members = [], currentUser, onOpenLeaveModal, onOpenAttendanceModal, onApproveLeave, onDeleteLeave, onDeleteAttendance }) {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'requests' | 'attendance'

  // Date Range Picker State (Default Year To Date YTD)
  const currentYear = new Date().getFullYear();
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState('');

  // Date Filtered Requests & Attendance Logs
  const filteredLeaveRequests = useMemo(() => {
    return (leaveRequests || []).filter(l => {
      const lDate = l.startDate || l.createdDate || '';
      if (lDate) {
        if (startDate && lDate < startDate) return false;
        if (endDate && lDate > endDate) return false;
      }
      return true;
    });
  }, [leaveRequests, startDate, endDate]);

  const filteredAttendanceLogs = useMemo(() => {
    return (attendanceLogs || []).filter(a => {
      const aDate = a.date || '';
      if (aDate) {
        if (startDate && aDate < startDate) return false;
        if (endDate && aDate > endDate) return false;
      }
      return true;
    });
  }, [attendanceLogs, startDate, endDate]);

  // Summary by staff member
  const staffSummary = useMemo(() => {
    return members.map(m => {
      const mLeaves = filteredLeaveRequests.filter(l => l.employeeName === m.name && l.status === '✅ อนุมัติแล้ว');
      const sickDays = mLeaves.filter(l => l.leaveType.includes('ป่วย')).reduce((sum, l) => sum + (l.totalDays || 1), 0);
      const personalDays = mLeaves.filter(l => l.leaveType.includes('กิจ')).reduce((sum, l) => sum + (l.totalDays || 1), 0);
      const vacationDays = mLeaves.filter(l => l.leaveType.includes('พักร้อน')).reduce((sum, l) => sum + (l.totalDays || 1), 0);

      const mAtt = filteredAttendanceLogs.filter(a => a.employeeName === m.name);
      const lateMins = mAtt.filter(a => a.type.includes('สาย')).reduce((sum, a) => sum + (a.lateMinutes || 0), 0);
      const absentTimes = mAtt.filter(a => a.type.includes('ขาด')).length;
      const totalFine = mAtt.reduce((sum, a) => sum + (a.fineAmount || 0), 0);

      return {
        ...m,
        sickDays,
        personalDays,
        vacationDays,
        lateMins,
        absentTimes,
        totalFine
      };
    });
  }, [members, filteredLeaveRequests, filteredAttendanceLogs]);

  return (
    <div className="space-y-6">
      {/* Header Banner & Date Range Controls */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-2xl shadow-inner text-amber-400">
            📅
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ระบบตารางวันลา & ขาด ลา มาสาย (Leave & Attendance Schedule)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                บุคลากร {members.length} ท่าน
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ลงวันลาป่วย/ลากิจ/ลาพักร้อน ตรวจสอบคิวลาป้องกันงานชนกัน และลงบันทึก ขาด-มาสาย พร้อมสรุปค่าปรับ
            </p>
          </div>
        </div>

        {/* High-Contrast Vibrant Yellow Date Range Picker Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-amber-500/40 text-xs shadow-md">
          <span className="font-black text-amber-400 flex items-center gap-1 text-xs">
            <span className="text-sm leading-none">📅</span>
            <span>เลือกช่วงวันที่:</span>
          </span>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />
          <span className="text-slate-500">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-900 border border-amber-500/30 text-amber-300 font-mono font-bold rounded-xl p-2 outline-none"
          />

          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-white px-2">✕ ล้างค่า</button>
          )}

          <button
            type="button"
            onClick={onOpenLeaveModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 ml-2"
          >
            <span>+ ลงวันลาใหม่</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenAttendanceModal}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5"
          >
            <span>+ บันทึก ขาด/สาย</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 text-xs">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
            activeTab === 'schedule' ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📊 สรุปวันลา & มาสายบุคลากร
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
            activeTab === 'requests' ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📑 รายการขออนุมัติลา ({filteredLeaveRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 font-bold rounded-t-xl transition-colors ${
            activeTab === 'attendance' ? 'bg-slate-800 text-white border-t border-x border-slate-700' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ⏰ บันทึก ขาด/มาสาย ({filteredAttendanceLogs.length})
        </button>
      </div>

      {/* Tab 1: Staff Summary Table */}
      {activeTab === 'schedule' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">📊 สรุปวันลาและสถิติมาสายรายบุคคล (Staff Attendance Summary)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3 text-center">ลาป่วย (วัน)</th>
                  <th className="p-3 text-center">ลากิจ (วัน)</th>
                  <th className="p-3 text-center">ลาพักร้อน (วัน)</th>
                  <th className="p-3 text-center">มาสาย (นาที)</th>
                  <th className="p-3 text-center">ขาดงาน (ครั้ง)</th>
                  <th className="p-3 text-right">ค่าปรับสะสม (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffSummary.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-rose-300">
                        {s.avatar || s.name.substring(0, 1)}
                      </div>
                      <div>
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{s.role}</div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-400">{s.sickDays}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-300">{s.personalDays}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-400">{s.vacationDays}</td>
                    <td className="p-3 text-center font-mono font-bold text-orange-400">{s.lateMins}</td>
                    <td className="p-3 text-center font-mono font-bold text-rose-400">{s.absentTimes}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400">
                      {s.totalFine ? formatCurrency(s.totalFine) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Leave Requests Table */}
      {activeTab === 'requests' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">📑 รายการขออนุมัติลาทั้งหมด (Leave Applications)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3">ประเภทการลา</th>
                  <th className="p-3">วันที่เริ่ม - สิ้นสุด</th>
                  <th className="p-3 text-center">จำนวนวัน</th>
                  <th className="p-3">เหตุผลการลา</th>
                  <th className="p-3 text-center">สถานะ</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                      ไม่พบประวัติขอลาในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredLeaveRequests.map(l => (
                    <tr key={l.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white">{l.employeeName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-medium">
                          {l.leaveType}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{window.formatAeronDate(l.startDate)} ถึง {window.formatAeronDate(l.endDate)}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-300">{l.totalDays || 1} วัน</td>
                      <td className="p-3 text-slate-400 max-w-[180px] truncate">{l.reason || '-'}</td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] ${
                          l.status === '✅ อนุมัติแล้ว' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {l.status !== '✅ อนุมัติแล้ว' && (
                          <button
                            onClick={() => onApproveLeave(l.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10.5px] font-bold"
                          >
                            ✓ อนุมัติ
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteLeave(l.id)}
                          className="px-2 py-1 bg-slate-800 text-rose-400 rounded text-[11px]"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Attendance Logs Table */}
      {activeTab === 'attendance' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm">⏰ บันทึก ขาด ลา มาสาย (Attendance Violations)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">วันที่</th>
                  <th className="p-3">พนักงาน</th>
                  <th className="p-3 text-center">ประเภทรายการ</th>
                  <th className="p-3 text-center">สายกี่นาที</th>
                  <th className="p-3 text-right">ค่าปรับ (บาท)</th>
                  <th className="p-3">หมายเหตุ</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAttendanceLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500 italic">
                      ไม่พบบันทึกการขาด/สายในช่วงเวลาที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredAttendanceLogs.map(a => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-300">{window.formatAeronDate(a.date)}</td>
                      <td className="p-3 font-bold text-white">{a.employeeName}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                          {a.type}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-orange-400">{a.lateMinutes || 0} นาที</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        {a.fineAmount ? formatCurrency(a.fineAmount) : '-'}
                      </td>
                      <td className="p-3 text-slate-400">{a.note || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteAttendance(a.id)}
                          className="px-2 py-1 bg-slate-800 text-rose-400 rounded text-[11px]"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
