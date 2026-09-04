// ====================================================
// MODULE: mod00_core/hooks/useAeronHR.js
// 👥 Domain Hook: HR, Leave Requests, Attendance Logs
// ====================================================

function useAeronHR({ currentUser }) {
  const isHydrated = useRef(false);

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

  // ⚡ Action-Driven Direct Cloud Sync

  // ⚡ Real-Time Universal Hydration: Initial Mount + Tab Focus + 10s Heartbeat Poller
  useEffect(() => {
    let isMounted = true;

    async function hydrateHRFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 1. Leave Requests
        const remoteLeaves = await fetcher('leave_requests', null);
        if (isMounted && Array.isArray(remoteLeaves)) {
          setLeaveRequests(remoteLeaves);
          localStorage.setItem('aeron_leave_requests', JSON.stringify(remoteLeaves));
        }

        // 2. Attendance Logs
        const remoteAttendance = await fetcher('attendance_logs', null);
        if (isMounted && Array.isArray(remoteAttendance)) {
          setAttendanceLogs(remoteAttendance);
          localStorage.setItem('aeron_attendance_logs', JSON.stringify(remoteAttendance));
        }
      } catch (e) {
        console.warn('[HR Cloud Hydration Notice]:', e.message);
      } finally {
        if (isMounted) isHydrated.current = true;
      }
    }

    hydrateHRFromCloud();

    window.addEventListener('focus', hydrateHRFromCloud);
    const poller = setInterval(hydrateHRFromCloud, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateHRFromCloud);
      clearInterval(poller);
    };
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
