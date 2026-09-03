// ====================================================
// MODULE: mod00_core/hooks/useAeronProjects.js
// 🎯 Domain Hook: Hospital Projects, Kanban, Cost Calculations & Demo Bookings
// ====================================================

function useAeronProjects({ soldProducts, setSoldProducts, setToastNotification }) {
  // 1. Projects State
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('gov_hospital_projects');
      return saved ? JSON.parse(saved) : window.INITIAL_PROJECTS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for gov_hospital_projects:', e);
      return window.INITIAL_PROJECTS || [];
    }
  });

  // 2. Cost Calculations State
  const [costCalculations, setCostCalculations] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_cost_calculations');
      return saved ? JSON.parse(saved) : window.INITIAL_COST_CALCULATIONS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_cost_calculations:', e);
      return window.INITIAL_COST_CALCULATIONS || [];
    }
  });

  // 3. Demo Bookings State
  const [demoBookings, setDemoBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_demo_bookings');
      return saved ? JSON.parse(saved) : window.INITIAL_DEMO_BOOKINGS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_demo_bookings:', e);
      return window.INITIAL_DEMO_BOOKINGS || [];
    }
  });

  // Modals & Target States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logTargetProject, setLogTargetProject] = useState(null);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingCostCalc, setEditingCostCalc] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetProject, setHistoryTargetProject] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistTargetBooking, setChecklistTargetBooking] = useState(null);
  const [isDemoBookingModalOpen, setIsDemoBookingModalOpen] = useState(false);
  const [editingDemoBooking, setEditingDemoBooking] = useState(null);

  // Sync to localStorage & DB
  useEffect(() => {
    localStorage.setItem('gov_hospital_projects', JSON.stringify(projects));
    syncToDB('projects', projects);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('aeron_cost_calculations', JSON.stringify(costCalculations));
    syncToDB('cost_calculations', costCalculations);
  }, [costCalculations]);

  useEffect(() => {
    localStorage.setItem('aeron_demo_bookings', JSON.stringify(demoBookings));
    syncToDB('demo_bookings', demoBookings);
  }, [demoBookings]);

  // Handlers
  const handleOpenHistoryModal = useCallback((proj) => {
    setHistoryTargetProject(proj);
    setIsHistoryModalOpen(true);
  }, []);

  const handleUpdateBookingStatus = useCallback((bookingId, newStatus) => {
    setDemoBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  }, []);

  const handleSaveCostCalc = useCallback((calcData) => {
    setCostCalculations(prev => {
      const idx = prev.findIndex(c => c.id === calcData.id || c.projectId === calcData.projectId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...calcData, id: copy[idx].id };
        return copy;
      } else {
        return [{ ...calcData, id: `calc-${Date.now()}` }, ...prev];
      }
    });
    setIsCostModalOpen(false);
    setEditingCostCalc(null);
  }, []);

  const handleDeleteCostCalc = useCallback((calcId) => {
    if (window.confirm('ยืนยันการลบการคำนวณต้นทุนนี้?')) {
      setCostCalculations(prev => prev.filter(c => c.id !== calcId));
    }
  }, []);

  // Handle move project stage in Kanban
  const handleMoveProject = useCallback((projectId, targetStageId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const isWon = targetStageId === 'stage_won' || targetStageId === 'stage_ordering';
        if (isWon && p.status !== targetStageId && setToastNotification) {
          setToastNotification({
            show: true,
            title: `🎉 คุณ ${p.assignee} ได้รับการอนุมัติโครงการได้ชนะ/ได้สัญญา!`,
            message: `โครงการ "${p.hospitalName}" (${formatCurrency(p.budget)}) ได้ถูกเลื่อนสู่สถานะสั่งซื้อ PO กับ Vendor`,
            projectId: p.id
          });
        }

        const isDelivered = targetStageId === 'stage_delivery' || targetStageId === 'stage_completed';
        if (isDelivered && p.status !== targetStageId && setSoldProducts) {
          setSoldProducts(prevSold => {
            const exists = (prevSold || []).some(sp => sp.projectId === p.id);
            if (!exists) {
              const delivDate = p.procurementDate || new Date().toISOString().split('T')[0];
              const delivYr = new Date(delivDate).getFullYear();
              const newAsset = {
                id: 'sold-' + Date.now(),
                assetNumber: `AST-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
                contractNumber: `PO-HOSP-${delivYr}/${Math.floor(Math.random() * 80) + 10}`,
                projectId: p.id,
                hospitalName: p.hospitalName,
                department: 'แผนกห้องผ่าตัด / CCU',
                productName: p.productName || 'เครื่องมือแพทย์ AERON',
                brand: p.productBrand || 'AERON MEDICAL',
                productCategory: p.productCategory || 'อุปกรณ์ทางการแพทย์',
                serialNumber: `SN-AERON-${Math.floor(Math.random() * 899999) + 100000}`,
                freebies: 'สายไฟ AC, ตัวแปลงสัญญาณ 10 ชิ้น, คู่มือการใช้งานภาษาไทย/อังกฤษ',
                salesPerson: p.assignee,
                contactPerson: p.decisionMakers || 'ผอ.แพทย์ / หัวหน้าพัสดุ',
                deliveryDate: delivDate,
                projectValue: p.budget || 0,
                dfAmount: p.dfAmount || '100,000 บาท',
                bidGuaranteeAmount: Math.round((p.budget || 0) * 0.05),
                bidGuaranteeRefundDate: `${delivYr}-12-15`,
                warrantyYears: 1,
                warrantyExpiryDate: `${delivYr + 1}-${delivDate.substring(5)}`,
                nextPmDate: `${delivYr}-12-15`,
                pmFrequency: 'ทุก 6 เดือน (ปีละ 2 ครั้ง)',
                pmStatus: '🟢 ตามกำหนดการ PM',
                status: 'ติดตั้งเรียบร้อย'
              };
              return [newAsset, ...prevSold];
            }
            return prevSold;
          });
        }

        return { ...p, status: targetStageId };
      }
      return p;
    }));
  }, [setSoldProducts, setToastNotification]);

  // Add / Save Project
  const handleSaveProject = useCallback((projectData) => {
    if (projectData.id) {
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
    } else {
      const newProj = {
        ...projectData,
        id: 'proj-' + Date.now(),
        createdDate: new Date().toISOString().split('T')[0],
        weeklyLogs: []
      };
      setProjects(prev => [newProj, ...prev]);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  }, []);

  // Delete Project
  const handleDeleteProject = useCallback((projectId) => {
    if (window.confirm('คุณต้องการลบโครงการนี้ออกจากระบบใช่หรือไม่?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  }, []);

  // Add Weekly Log Note
  const handleAddWeeklyLog = useCallback((projectId, note, author) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newLog = {
          date: new Date().toISOString().split('T')[0],
          author: author || p.assignee,
          note
        };
        return {
          ...p,
          weeklyLogs: [newLog, ...(p.weeklyLogs || [])]
        };
      }
      return p;
    }));
    setIsLogModalOpen(false);
    setLogTargetProject(null);
  }, []);

  // Save Demo Booking
  const handleSaveDemoBooking = useCallback((bookingData) => {
    if (bookingData.id) {
      setDemoBookings(prev => prev.map(b => b.id === bookingData.id ? bookingData : b));
    } else {
      const newBooking = {
        ...bookingData,
        id: 'booking-' + Date.now()
      };
      setDemoBookings(prev => [newBooking, ...prev]);

      if (bookingData.projectId) {
        setProjects(prev => prev.map(p => {
          if (p.id === bookingData.projectId) {
            return {
              ...p,
              demoStatus: 'นัดหมายแล้ว',
              demoStartDate: bookingData.startDate,
              demoEndDate: bookingData.endDate
            };
          }
          return p;
        }));
      }
    }

    setIsDemoBookingModalOpen(false);
    setEditingDemoBooking(null);
  }, []);

  return {
    projects, setProjects,
    costCalculations, setCostCalculations,
    demoBookings, setDemoBookings,
    isModalOpen, setIsModalOpen,
    editingProject, setEditingProject,
    isLogModalOpen, setIsLogModalOpen,
    logTargetProject, setLogTargetProject,
    isCostModalOpen, setIsCostModalOpen,
    editingCostCalc, setEditingCostCalc,
    isHistoryModalOpen, setIsHistoryModalOpen,
    historyTargetProject, setHistoryTargetProject,
    isChecklistModalOpen, setIsChecklistModalOpen,
    checklistTargetBooking, setChecklistTargetBooking,
    isDemoBookingModalOpen, setIsDemoBookingModalOpen,
    editingDemoBooking, setEditingDemoBooking,
    handleMoveProject,
    handleSaveProject,
    handleDeleteProject,
    handleAddWeeklyLog,
    handleSaveDemoBooking,
    handleUpdateBookingStatus,
    handleSaveCostCalc,
    handleDeleteCostCalc,
    handleOpenHistoryModal
  };
}

window.useAeronProjects = useAeronProjects;
