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

  // ⚡ Universal Notion-Like Hydration: Initial Mount + Tab Focus + 20s Heartbeat Poller (Smart Merge - Zero Data Loss)
  useEffect(() => {
    let isMounted = true;

    async function hydrateHRFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 1. Leave Requests (Smart Merge - NEVER wipes local items)
        if (!window.isAeronMutating || !window.isAeronMutating('leave_requests')) {
          const remoteLeaves = await fetcher('leave_requests', null);
          if (isMounted && Array.isArray(remoteLeaves)) {
            setLeaveRequests(prev => {
              if (window.isAeronMutating && window.isAeronMutating('leave_requests')) return prev;
              const merged = typeof window.mergeAeronDatasets === 'function'
                ? window.mergeAeronDatasets(prev, remoteLeaves, 'id')
                : (remoteLeaves.length > 0 ? remoteLeaves : prev);
              if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
              try {
                localStorage.setItem('aeron_leave_requests', JSON.stringify(merged));
              } catch(e) {}
              return merged;
            });
          }
        }

        // 2. Attendance Logs (Smart Merge - NEVER wipes local items)
        if (!window.isAeronMutating || !window.isAeronMutating('attendance_logs')) {
          const remoteAttendance = await fetcher('attendance_logs', null);
          if (isMounted && Array.isArray(remoteAttendance)) {
            setAttendanceLogs(prev => {
              if (window.isAeronMutating && window.isAeronMutating('attendance_logs')) return prev;
              const merged = typeof window.mergeAeronDatasets === 'function'
                ? window.mergeAeronDatasets(prev, remoteAttendance, 'id')
                : (remoteAttendance.length > 0 ? remoteAttendance : prev);
              if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
              try {
                localStorage.setItem('aeron_attendance_logs', JSON.stringify(merged));
              } catch(e) {}
              return merged;
            });
          }
        }
      } catch (e) {
        console.warn('[HR Cloud Hydration Notice]:', e.message);
      } finally {
        if (isMounted) isHydrated.current = true;
      }
    }

    hydrateHRFromCloud();

    window.addEventListener('focus', hydrateHRFromCloud);
    const poller = setInterval(hydrateHRFromCloud, 20000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateHRFromCloud);
      clearInterval(poller);
    };
  }, []);

  // Handlers (All persistent with LocalStorage & Cloud Sync)
  const handleApproveLeave = useCallback((leaveId, newStatus = '✅ อนุมัติแล้ว') => {
    setLeaveRequests(prev => {
      const updated = prev.map(l => l.id === leaveId ? { ...l, status: newStatus, approvedBy: currentUser?.name || 'ผู้จัดการ', updated_at: new Date().toISOString() } : l);
      try {
        localStorage.setItem('aeron_leave_requests', JSON.stringify(updated));
        if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
          window.syncToDB('leave_requests', updated);
        }
      } catch(e) {}
      return updated;
    });
  }, [currentUser]);

  const handleDeleteLeave = useCallback((leaveId) => {
    if (window.confirm('ต้องการลบใบขอนี้?')) {
      setLeaveRequests(prev => {
        const updated = prev.filter(l => l.id !== leaveId);
        try {
          localStorage.setItem('aeron_leave_requests', JSON.stringify(updated));
          if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
            window.syncToDB('leave_requests', updated);
          }
        } catch(e) {}
        return updated;
      });
    }
  }, []);

  const handleSaveLeave = useCallback((leaveData) => {
    const timestampedLeave = {
      ...leaveData,
      updated_at: new Date().toISOString()
    };
    setLeaveRequests(prev => {
      let updated;
      if (timestampedLeave.id) {
        updated = prev.map(l => l.id === timestampedLeave.id ? timestampedLeave : l);
      } else {
        updated = [{ ...timestampedLeave, id: 'leave-' + Date.now(), status: '⏳ รออนุมัติ' }, ...prev];
      }
      try {
        localStorage.setItem('aeron_leave_requests', JSON.stringify(updated));
        if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
          window.syncToDB('leave_requests', updated);
        }
      } catch(e) {}
      return updated;
    });
    setIsLeaveModalOpen(false);
  }, []);

  const handleDeleteAttendance = useCallback((attId) => {
    if (window.confirm('ต้องการลบรายการนี้?')) {
      setAttendanceLogs(prev => {
        const updated = prev.filter(a => a.id !== attId);
        try {
          localStorage.setItem('aeron_attendance_logs', JSON.stringify(updated));
          if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
            window.syncToDB('attendance_logs', updated);
          }
        } catch(e) {}
        return updated;
      });
    }
  }, []);

  const handleSaveAttendance = useCallback((attData) => {
    const timestampedAtt = {
      ...attData,
      updated_at: new Date().toISOString()
    };
    setAttendanceLogs(prev => {
      let updated;
      if (timestampedAtt.id) {
        updated = prev.map(a => a.id === timestampedAtt.id ? timestampedAtt : a);
      } else {
        updated = [{ ...timestampedAtt, id: 'att-' + Date.now() }, ...prev];
      }
      try {
        localStorage.setItem('aeron_attendance_logs', JSON.stringify(updated));
        if (typeof window !== 'undefined' && typeof window.syncToDB === 'function') {
          window.syncToDB('attendance_logs', updated);
        }
      } catch(e) {}
      return updated;
    });
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
