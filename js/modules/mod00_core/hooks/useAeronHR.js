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
      if (saved) {
        const parsed = JSON.parse(saved);
        const filterFn = window.filterQuarantineData;
        return filterFn ? filterFn('leave_requests', parsed) : parsed;
      }
    } catch (e) {}
    return [];
  });

  // 2. Attendance Logs State
  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_attendance_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filterFn = window.filterQuarantineData;
        return filterFn ? filterFn('attendance_logs', parsed) : parsed;
      }
    } catch (e) {}
    return [];
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
        const filterFn = window.filterQuarantineData;

        // 1. Leave Requests (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('leave_requests')) {
          const remoteLeaves = await fetcher('leave_requests', null);
          if (isMounted && Array.isArray(remoteLeaves)) {
            const cleanLeaves = filterFn ? filterFn('leave_requests', remoteLeaves) : remoteLeaves;
            setLeaveRequests(prev => {
              if (window.isAeronMutating && window.isAeronMutating('leave_requests')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(cleanLeaves)) return prev;
              try {
                localStorage.setItem('aeron_leave_requests', JSON.stringify(cleanLeaves));
              } catch(e) {}
              return cleanLeaves;
            });
          }
        }

        // 2. Attendance Logs (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('attendance_logs')) {
          const remoteAttendance = await fetcher('attendance_logs', null);
          if (isMounted && Array.isArray(remoteAttendance)) {
            const cleanAttendance = filterFn ? filterFn('attendance_logs', remoteAttendance) : remoteAttendance;
            setAttendanceLogs(prev => {
              if (window.isAeronMutating && window.isAeronMutating('attendance_logs')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(cleanAttendance)) return prev;
              try {
                localStorage.setItem('aeron_attendance_logs', JSON.stringify(cleanAttendance));
              } catch(e) {}
              return cleanAttendance;
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
