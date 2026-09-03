// ====================================================
// MODULE: mod00_core/hooks/useAeronHR.js
// 👥 Domain Hook: HR, Leave Requests, Attendance Logs
// ====================================================

function useAeronHR({ currentUser }) {
  // 1. Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_leave_requests');
      return saved ? JSON.parse(saved) : window.INITIAL_LEAVE_REQUESTS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_leave_requests:', e);
      return window.INITIAL_LEAVE_REQUESTS || [];
    }
  });

  // 2. Attendance Logs State
  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_attendance_logs');
      return saved ? JSON.parse(saved) : window.INITIAL_ATTENDANCE_LOGS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_attendance_logs:', e);
      return window.INITIAL_ATTENDANCE_LOGS || [];
    }
  });

  // Modals
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Sync to localStorage & DB
  useEffect(() => {
    localStorage.setItem('aeron_leave_requests', JSON.stringify(leaveRequests));
    syncToDB('leave_requests', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('aeron_attendance_logs', JSON.stringify(attendanceLogs));
    syncToDB('attendance_logs', attendanceLogs);
  }, [attendanceLogs]);

  // ⚡ Startup Cloud Hydration: Fetch latest leave requests & attendance logs from Supabase Cloud on mount
  useEffect(() => {
    let isMounted = true;
    async function hydrateHRFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 1. Leave Requests
        const remoteLeaves = await fetcher('leave_requests', null);
        if (isMounted && Array.isArray(remoteLeaves) && remoteLeaves.length > 0) {
          setLeaveRequests(remoteLeaves);
          localStorage.setItem('aeron_leave_requests', JSON.stringify(remoteLeaves));
        }

        // 2. Attendance Logs
        const remoteAttendance = await fetcher('attendance_logs', null);
        if (isMounted && Array.isArray(remoteAttendance) && remoteAttendance.length > 0) {
          setAttendanceLogs(remoteAttendance);
          localStorage.setItem('aeron_attendance_logs', JSON.stringify(remoteAttendance));
        }
      } catch (e) {
        console.warn('[HR Cloud Hydration Notice]:', e.message);
      }
    }
    hydrateHRFromCloud();
    return () => { isMounted = false; };
  }, []);

  // Handlers
  const handleApproveLeave = useCallback((leaveId, newStatus = '✅ อนุมัติแล้ว') => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status: newStatus, approvedBy: currentUser?.name || 'ผู้จัดการ' } : l));
  }, [currentUser]);

  const handleDeleteLeave = useCallback((leaveId) => {
    if (window.confirm('ต้องการลบใบขอนี้?')) {
      setLeaveRequests(prev => prev.filter(l => l.id !== leaveId));
    }
  }, []);

  const handleSaveLeave = useCallback((leaveData) => {
    if (leaveData.id) {
      setLeaveRequests(prev => prev.map(l => l.id === leaveData.id ? leaveData : l));
    } else {
      setLeaveRequests(prev => [{ ...leaveData, id: 'leave-' + Date.now(), status: '⏳ รออนุมัติ' }, ...prev]);
    }
    setIsLeaveModalOpen(false);
  }, []);

  const handleDeleteAttendance = useCallback((attId) => {
    if (window.confirm('ต้องการลบรายการนี้?')) {
      setAttendanceLogs(prev => prev.filter(a => a.id !== attId));
    }
  }, []);

  const handleSaveAttendance = useCallback((attData) => {
    if (attData.id) {
      setAttendanceLogs(prev => prev.map(a => a.id === attData.id ? attData : a));
    } else {
      setAttendanceLogs(prev => [{ ...attData, id: 'att-' + Date.now() }, ...prev]);
    }
    setIsAttendanceModalOpen(false);
  }, []);

  return {
    leaveRequests, setLeaveRequests,
    attendanceLogs, setAttendanceLogs,
    isLeaveModalOpen, setIsLeaveModalOpen,
    isAttendanceModalOpen, setIsAttendanceModalOpen,
    handleApproveLeave,
    handleDeleteLeave,
    handleSaveLeave,
    handleDeleteAttendance,
    handleSaveAttendance
  };
}

window.useAeronHR = useAeronHR;
