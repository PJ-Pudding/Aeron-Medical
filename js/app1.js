// Main React Application for Hospital & Government Sales Tracker
// Company: AERON MEDICAL Co., Ltd.
const { useState, useEffect, useRef, useMemo } = React;

// Helper: Format Thai currency
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '0 บาท';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(amount);
};

// Helper: Format short number (e.g. 4.5ล้าน)
const formatShortCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '0 บ.';
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + ' ล้านบาท';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + ' พันบาท';
  }
  return amount + ' บาท';
};

// Helper: Sync JSON table directly into d:\Team Projects\db\ subfolder
const syncToDB = (tableName, data) => {
  try {
    fetch(`./api/save-db?table=${tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2)
    }).catch(err => console.log(`DB sync info (${tableName}):`, err));
  } catch (e) {
    console.log(`DB sync info (${tableName}):`, e);
  }
};

// Main App Component
function App() {
  // Projects State
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('gov_hospital_projects');
    return saved ? JSON.parse(saved) : window.INITIAL_PROJECTS;
  });

  // Team Members State
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('gov_hospital_members');
    return saved ? JSON.parse(saved) : window.INITIAL_MEMBERS;
  });

  // Central Product Catalog State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('aeron_products');
    return saved ? JSON.parse(saved) : window.CENTRAL_PRODUCT_CATALOG;
  });

  // Demo Bookings State
  const [demoBookings, setDemoBookings] = useState(() => {
    const saved = localStorage.getItem('aeron_demo_bookings');
    return saved ? JSON.parse(saved) : window.INITIAL_DEMO_BOOKINGS;
  });

  // Vendor Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('aeron_purchase_orders');
    return saved ? JSON.parse(saved) : (window.INITIAL_PURCHASE_ORDERS || []);
  });

  // Repair Tickets State
  const [repairTickets, setRepairTickets] = useState(() => {
    const saved = localStorage.getItem('aeron_repair_tickets');
    return saved ? JSON.parse(saved) : (window.INITIAL_REPAIR_TICKETS || []);
  });

  // Delivered / Sold Products State
  const [soldProducts, setSoldProducts] = useState(() => {
    const saved = localStorage.getItem('aeron_sold_products');
    return saved ? JSON.parse(saved) : (window.INITIAL_SOLD_PRODUCTS || []);
  });

  // Import Logistics / Shipments State
  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem('aeron_shipments');
    return saved ? JSON.parse(saved) : (window.INITIAL_SHIPMENTS || []);
  });

  // Thai FDA Registrations State
  const [fdaRegistrations, setFdaRegistrations] = useState(() => {
    const saved = localStorage.getItem('aeron_fda_registrations');
    return saved ? JSON.parse(saved) : (window.INITIAL_FDA_REGISTRATIONS || []);
  });

  // View Mode: 'manager' | 'demo_calendar' | 'product_catalog' | 'purchase_orders' | 'repair_service' | 'sold_products' | 'shipment_tracking' | 'fda_registration' | member ID ('m1', 'm2'...)
  const [activeView, setActiveView] = useState('manager');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClientType, setFilterClientType] = useState('all'); // all, รัฐบาล, เอกชน
  const [filterBudgetType, setFilterBudgetType] = useState('all'); // all, งบลงทุน, งบเงินบำรุง, งบบริจาค...

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logTargetProject, setLogTargetProject] = useState(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoPrefill, setDemoPrefill] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [editingRepairTicket, setEditingRepairTicket] = useState(null);

  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [editingSoldAsset, setEditingSoldAsset] = useState(null);

  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

  const [isFDAModalOpen, setIsFDAModalOpen] = useState(false);
  const [editingFDA, setEditingFDA] = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTargetProject, setHistoryTargetProject] = useState(null);

  const [costCalculations, setCostCalculations] = useState(() => {
    const saved = localStorage.getItem('aeron_cost_calculations');
    return saved ? JSON.parse(saved) : (window.INITIAL_COST_CALCULATIONS || []);
  });

  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingCostCalc, setEditingCostCalc] = useState(null);

  const handleOpenHistoryModal = (proj) => {
    setHistoryTargetProject(proj);
    setIsHistoryModalOpen(true);
  };

  const handleSaveCostCalc = (calcData) => {
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
  };

  const handleDeleteCostCalc = (calcId) => {
    if (window.confirm('ยืนยันลบสเปรดชีตคำนวณต้นทุนนี้?')) {
      setCostCalculations(prev => prev.filter(c => c.id !== calcId));
    }
  };

  // Pending PO Projects Count (โครงการที่ชนะงานแล้วแต่ยังไม่ได้ออก PO)
  const pendingPOCount = useMemo(() => {
    const wonStages = ['stage_won', 'stage_ordering', 'stage_delivery'];
    return projects.filter(p => {
      if (!wonStages.includes(p.status)) return false;
      return !purchaseOrders.some(po => po.projectId === p.id);
    }).length;
  }, [projects, purchaseOrders]);

  // Active Repair Count
  const activeRepairCount = useMemo(() => {
    return repairTickets.filter(t => t.status === 'ส่งซ่อมอยู่' || t.status === 'รอส่งซ่อม' || t.status === 'ระหว่างขนส่ง').length;
  }, [repairTickets]);

  // Active Shipments Count
  const activeShipmentCount = useMemo(() => {
    return shipments.filter(s => s.status !== 'ส่งลูกค้าแล้ว' && s.status !== 'ของถึง ออฟฟิศ').length;
  }, [shipments]);

  // Active FDA Count (Pending or Expiry Warning)
  const activeFDACount = useMemo(() => {
    return fdaRegistrations.filter(f => f.status !== 'อนุมัติใบอนุญาตแล้ว').length;
  }, [fdaRegistrations]);

  // Save to LocalStorage & Sync to db/*.json subfolder
  useEffect(() => {
    localStorage.setItem('gov_hospital_projects', JSON.stringify(projects));
    syncToDB('projects', projects);
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('gov_hospital_members', JSON.stringify(members));
    syncToDB('members', members);
  }, [members]);

  useEffect(() => {
    localStorage.setItem('aeron_products', JSON.stringify(products));
    syncToDB('products', products);
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aeron_demo_bookings', JSON.stringify(demoBookings));
    syncToDB('demo_bookings', demoBookings);
  }, [demoBookings]);

  useEffect(() => {
    localStorage.setItem('aeron_purchase_orders', JSON.stringify(purchaseOrders));
    syncToDB('purchase_orders', purchaseOrders);
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('aeron_repair_tickets', JSON.stringify(repairTickets));
    syncToDB('repair_tickets', repairTickets);
  }, [repairTickets]);

  useEffect(() => {
    localStorage.setItem('aeron_sold_products', JSON.stringify(soldProducts));
    syncToDB('sold_products', soldProducts);
  }, [soldProducts]);

  useEffect(() => {
    localStorage.setItem('aeron_shipments', JSON.stringify(shipments));
    syncToDB('shipments', shipments);
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('aeron_fda_registrations', JSON.stringify(fdaRegistrations));
    syncToDB('fda_registrations', fdaRegistrations);
  }, [fdaRegistrations]);

  useEffect(() => {
    localStorage.setItem('aeron_cost_calculations', JSON.stringify(costCalculations));
    syncToDB('cost_calculations', costCalculations);
  }, [costCalculations]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Member view filter
      if (activeView !== 'manager' && activeView !== 'demo_calendar' && activeView !== 'product_catalog' && activeView !== 'purchase_orders' && activeView !== 'repair_service' && activeView !== 'sold_products' && activeView !== 'shipment_tracking' && activeView !== 'fda_registration' && activeView !== 'kanban_all' && activeView !== 'cost_calculation') {
        const currentMember = members.find(m => m.id === activeView);
        if (currentMember && p.assignee !== currentMember.name) {
          return false;
        }
      }

      // Client Type Filter
      if (filterClientType !== 'all' && p.clientType !== filterClientType) {
        return false;
      }

      // Budget Type Filter
      if (filterBudgetType !== 'all' && p.budgetType !== filterBudgetType) {
        return false;
      }

      // Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(term);
        const matchHosp = p.hospitalName.toLowerCase().includes(term);
        const matchAssignee = p.assignee.toLowerCase().includes(term);
        const matchProd = (p.productName || '').toLowerCase().includes(term);
        const matchDoctors = (p.decisionMakers || '').toLowerCase().includes(term);
        const matchComp = (p.competitors || '').toLowerCase().includes(term);
        return matchTitle || matchHosp || matchAssignee || matchProd || matchDoctors || matchComp;
      }

      return true;
    });
  }, [projects, activeView, members, filterClientType, filterBudgetType, searchTerm]);

  // Handle move project stage in Kanban
  const handleMoveProject = (projectId, targetStageId) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const isWon = targetStageId === 'stage_won' || targetStageId === 'stage_ordering';
        if (isWon && p.status !== targetStageId) {
          setToastNotification({
            show: true,
            title: `🎉 เซลส์ ${p.assignee} เปลี่ยนสถานะโครงการเป็นชนะงาน/ได้สัญญา!`,
            message: `โครงการ "${p.hospitalName}" (${formatCurrency(p.budget)}) ได้ถูกย้ายเข้าสู่หน้ารอสั่งซื้อ PO จาก Vendor`,
            projectId: p.id
          });
        }

        const isDelivered = targetStageId === 'stage_delivery' || targetStageId === 'stage_completed';
        if (isDelivered && p.status !== targetStageId) {
          const exists = soldProducts.some(sp => sp.projectId === p.id);
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
              freebies: 'กระดาษบันทึกมาตรฐาน 10 ม้วน, สายสัญญาณสำรอง, รถเข็นสแตนเลส, คู่มือการใช้งานภาษาไทย',
              salesPerson: p.assignee,
              contactPerson: p.decisionMakers || 'อาจารย์แพทย์ / หัวหน้าพยาบาล',
              deliveryDate: delivDate,
              projectValue: p.budget || 0,
              dfAmount: p.dfAmount || '100,000 บาท',
              bidGuaranteeAmount: Math.round((p.budget || 0) * 0.05),
              bidGuaranteeRefundDate: `${delivYr}-12-15`,
              warrantyYears: 1,
              warrantyExpiryDate: `${delivYr + 1}-${delivDate.substring(5)}`,
              nextPmDate: `${delivYr}-12-15`,
              pmFrequency: 'ทุก 6 เดือน (ปีละ 2 ครั้ง)',
              pmStatus: '⏳ ถึงกำหนดทำ PM',
              status: 'รับมอบเรียบร้อย'
            };
            setSoldProducts(prevSold => [newAsset, ...prevSold]);

            setToastNotification({
              show: true,
              title: `🚚 ส่งมอบสินค้าสำเร็จ! บันทึกเข้าตาราง "สินค้าที่ขายแล้ว" อัตโนมัติ`,
              message: `โครงการ "${p.hospitalName}" (${formatCurrency(p.budget)}) ได้ถูกบันทึกเข้าสู่หน้ารายการสินค้าที่ขายแล้ว พร้อมตั้งวันหมดประกันและนัด PM อัตโนมัติ`,
              projectId: p.id
            });
          }
        }

        return { ...p, status: targetStageId };
      }
      return p;
    }));
  };

  // Add Project
  const handleSaveProject = (projectData) => {
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
  };

  // Delete Project
  const handleDeleteProject = (projectId) => {
    if (window.confirm('คุณต้องการลบโครงการนี้ออกจากระบบใช่หรือไม่?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  };

  // Add Weekly Log Note
  const handleAddWeeklyLog = (projectId, note, author) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newLog = {
          date: new Date().toISOString().split('T')[0],
          author: author || p.assignee,
          note
        };
        const updatedLogs = [newLog, ...(p.weeklyLogs || [])];
        const updatedProj = {
          ...p,
          weeklyLogs: updatedLogs
        };

        if (historyTargetProject && historyTargetProject.id === projectId) {
          setHistoryTargetProject(updatedProj);
        }

        return updatedProj;
      }
      return p;
    }));
    setIsLogModalOpen(false);
    setLogTargetProject(null);
  };

  // Save Demo Booking
  const handleSaveDemoBooking = (bookingData) => {
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

    setIsDemoModalOpen(false);
    setDemoPrefill(null);
  };

  // Save Central Product
  const handleSaveProduct = (productData) => {
    if (productData.id) {
      setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
    } else {
      const newProd = {
        ...productData,
        id: 'prod-' + Date.now()
      };
      setProducts(prev => [newProd, ...prev]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Save Purchase Order (PO) with Auto-Linking to Shipment Tracking
  const handleSavePO = (poData) => {
    let savedPO = poData;
    if (poData.id) {
      setPurchaseOrders(prev => prev.map(po => po.id === poData.id ? poData : po));
    } else {
      savedPO = {
        ...poData,
        id: 'po-' + Date.now()
      };
      setPurchaseOrders(prev => [savedPO, ...prev]);
    }

    // Auto Link: Create Shipment Tracking Entry if not existing
    if (savedPO.poNumber) {
      setShipments(prevShipments => {
        const exists = prevShipments.some(s => s.poNumber === savedPO.poNumber || s.poId === savedPO.id);
        if (!exists) {
          const delivYr = new Date().getFullYear();
          const newShipment = {
            id: 'shp-' + Date.now(),
            shipmentNumber: `SHP-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
            poNumber: savedPO.poNumber,
            poId: savedPO.id,
            productName: savedPO.productName || 'เครื่องมือแพทย์ AERON',
            productCategory: savedPO.productCategory || 'อุปกรณ์แพทย์',
            quantity: savedPO.quantity || 1,
            vendorName: savedPO.vendorName || 'Vendor Manufacturer',
            vendorCountry: savedPO.vendorCountry || 'ต่างประเทศ',
            hospitalDestination: savedPO.hospitalName || 'โรงพยาบาลเป้าหมาย',
            shippingCompany: 'DHL Global Forwarding',
            trackingNumber: `AWB-${Math.floor(Math.random() * 89999999) + 10000000}`,
            cbm: 2.5,
            grossWeight: 150.0,
            transportType: '✈️ ทางอากาศ (Air Freight)',
            shippingCost: 35000,
            dutyTaxes: 12000,
            customsBroker: 'V-Cargo Logistics (Thailand)',
            etd: savedPO.poDate || new Date().toISOString().split('T')[0],
            eta: savedPO.expectedDelivery || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            status: 'รอจ่ายเงิน',
            notes: `ออก PO ส่งให้ Vendor ${savedPO.vendorName} เรียบร้อยแล้ว`
          };
          return [newShipment, ...prevShipments];
        }
        return prevShipments;
      });
    }

    setIsPOModalOpen(false);
    setEditingPO(null);
  };

  // Delete Purchase Order
  const handleDeletePO = (poId) => {
    if (window.confirm('คุณต้องการลบใบสั่งซื้อ PO นี้ออกจากระบบใช่หรือไม่?')) {
      setPurchaseOrders(prev => prev.filter(po => po.id !== poId));
    }
  };

  // Save Repair Ticket (Bi-directional Link with Demo Catalog)
  const handleSaveRepairTicket = (ticketData) => {
    if (ticketData.id) {
      setRepairTickets(prev => prev.map(t => t.id === ticketData.id ? ticketData : t));
    } else {
      const newTicket = {
        ...ticketData,
        id: 'rep-' + Date.now()
      };
      setRepairTickets(prev => [newTicket, ...prev]);
    }

    // Auto Link back to Central Demo Catalog if category is "สินค้า Demo"
    if (ticketData.category === 'สินค้า Demo' && ticketData.sn) {
      const isFixed = ticketData.status === 'ซ่อมเสร็จแล้ว' || ticketData.status === 'ส่งคืนลูกค้า';
      const newUnitStatus = isFixed ? 'พร้อมใช้งาน' : 'ส่งซ่อม';

      setProducts(prevProducts => prevProducts.map(p => {
        const hasMatchingUnit = (p.demoUnits || []).some(u => u.sn === ticketData.sn);
        if (hasMatchingUnit) {
          const updatedUnits = p.demoUnits.map(u => {
            if (u.sn === ticketData.sn) {
              return {
                ...u,
                status: newUnitStatus,
                location: isFixed ? (ticketData.location || 'สำนักงาน AERON') : (ticketData.repairVendor || 'ศูนย์ซ่อม AERON')
              };
            }
            return u;
          });
          return { ...p, demoUnits: updatedUnits };
        }
        return p;
      }));
    }

    setIsRepairModalOpen(false);
    setEditingRepairTicket(null);
  };

  // Delete Repair Ticket
  const handleDeleteRepairTicket = (ticketId) => {
    if (window.confirm('คุณต้องการลบรายการส่งซ่อมนี้ใช่หรือไม่?')) {
      setRepairTickets(prev => prev.filter(t => t.id !== ticketId));
    }
  };

  // Open Repair Modal from Demo Catalog
  const handleOpenRepairFromCatalog = (product, unit) => {
    setEditingRepairTicket({
      category: 'สินค้า Demo',
      productName: product.name,
      productCategory: product.category,
      sn: unit ? unit.sn : '',
      repairedItems: unit ? (unit.accessories || 'ตัวเครื่องหลัก และ อุปกรณ์ประกอบ') : 'ตัวเครื่องหลัก',
      lastHospital: unit ? (unit.location || 'สำนักงาน AERON (กรุงเทพฯ)') : 'สำนักงาน AERON',
      location: 'ศูนย์ซ่อม AERON Service Center (กรุงเทพฯ)',
      status: 'ส่งซ่อมอยู่',
      repairVendor: 'AERON Service Center (กรุงเทพฯ)',
      sentDate: new Date().toISOString().split('T')[0]
    });
    setActiveView('repair_service');
    setIsRepairModalOpen(true);
  };

  // Export Data to CSV
  const exportToCSV = () => {
    const headers = ["ชื่องาน/โครงการ", "โรงพยาบาล", "ประเภทลูกค้า", "ผู้รับผิดชอบ", "ชนิดสินค้า/รุ่น", "แบรนด์", "งบประมาณ(บาท)", "ประเภทงบประมาณ", "ทิศทางงบ", "สถานะขั้นตอน", "กำหนดจัดซื้อ", "สถานะเดโม่", "วันนัดเดโม่", "อาจารย์ผู้ตัดสินใจ", "ค่า DF", "คู่แข่ง", "โอกาสได้งาน(%)"];
    const rows = projects.map(p => {
      const stageName = (window.STAGES.find(s => s.id === p.status) || {}).title || p.status;
      return [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.hospitalName.replace(/"/g, '""')}"`,
        `"${p.clientType}"`,
        `"${p.assignee}"`,
        `"${p.productName || ''}"`,
        `"${p.productBrand || 'AERON MEDICAL'}"`,
        p.budget || 0,
        `"${p.budgetType}"`,
        `"${p.budgetTrend}"`,
        `"${stageName}"`,
        `"${p.procurementDate || ''}"`,
        `"${p.demoStatus || ''}"`,
        `"${p.demoStartDate ? p.demoStartDate + ' ถึง ' + p.demoEndDate : ''}"`,
        `"${(p.decisionMakers || '').replace(/"/g, '""')}"`,
        `"${p.dfAmount || ''}"`,
        `"${(p.competitors || '').replace(/"/g, '""')}"`,
        p.winProbability || 0
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AERON_Project_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Delivered / Sold Asset
  const handleSaveSoldAsset = (assetData) => {
    if (assetData.id) {
      setSoldProducts(prev => prev.map(a => a.id === assetData.id ? assetData : a));
    } else {
      const newAsset = {
        ...assetData,
        id: 'sold-' + Date.now()
      };
      setSoldProducts(prev => [newAsset, ...prev]);
    }
    setIsSoldModalOpen(false);
    setEditingSoldAsset(null);
  };

  // Delete Delivered / Sold Asset
  const handleDeleteSoldAsset = (assetId) => {
    if (window.confirm('คุณต้องการลบรายการสินค้าที่ขายแล้วนี้ใช่หรือไม่?')) {
      setSoldProducts(prev => prev.filter(a => a.id !== assetId));
    }
  };

  // Save Shipment Tracking Record
  const handleSaveShipment = (shipmentData) => {
    if (shipmentData.id) {
      setShipments(prev => prev.map(s => s.id === shipmentData.id ? shipmentData : s));
    } else {
      const newShipment = {
        ...shipmentData,
        id: 'shp-' + Date.now()
      };
      setShipments(prev => [newShipment, ...prev]);
    }
    setIsShipmentModalOpen(false);
    setEditingShipment(null);
  };

  // Delete Shipment Record
  const handleDeleteShipment = (shipmentId) => {
    if (window.confirm('คุณต้องการลบรายการนำเข้าลูกค้านี้ใช่หรือไม่?')) {
      setShipments(prev => prev.filter(s => s.id !== shipmentId));
    }
  };

  // Save FDA Registration Record
  const handleSaveFDA = (fdaData) => {
    if (fdaData.id) {
      setFdaRegistrations(prev => prev.map(f => f.id === fdaData.id ? fdaData : f));
    } else {
      const newFDA = {
        ...fdaData,
        id: 'fda-' + Date.now()
      };
      setFdaRegistrations(prev => [newFDA, ...prev]);
    }
    setIsFDAModalOpen(false);
    setEditingFDA(null);
  };

  // Delete FDA Registration Record
  const handleDeleteFDA = (fdaId) => {
    if (window.confirm('คุณต้องการลบรายการยื่นขอ อย. นี้ใช่หรือไม่?')) {
      setFdaRegistrations(prev => prev.filter(f => f.id !== fdaId));
    }
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตกลับเป็นข้อมูลตัวอย่างตั้งต้นของ AERON MEDICAL ทั้งหมดใช่หรือไม่?')) {
      localStorage.removeItem('gov_hospital_projects');
      localStorage.removeItem('gov_hospital_members');
      localStorage.removeItem('aeron_products');
      localStorage.removeItem('aeron_demo_bookings');
      localStorage.removeItem('aeron_purchase_orders');
      localStorage.removeItem('aeron_repair_tickets');
      localStorage.removeItem('aeron_sold_products');
      localStorage.removeItem('aeron_shipments');
      localStorage.removeItem('aeron_fda_registrations');
      setProjects(window.INITIAL_PROJECTS);
      setMembers(window.INITIAL_MEMBERS);
      setProducts(window.CENTRAL_PRODUCT_CATALOG);
      setDemoBookings(window.INITIAL_DEMO_BOOKINGS);
      setPurchaseOrders(window.INITIAL_PURCHASE_ORDERS || []);
      setRepairTickets(window.INITIAL_REPAIR_TICKETS || []);
      setSoldProducts(window.INITIAL_SOLD_PRODUCTS || []);
      setShipments(window.INITIAL_SHIPMENTS || []);
      setFdaRegistrations(window.INITIAL_FDA_REGISTRATIONS || []);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation Header */}
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        members={members}
        projects={projects}
        pendingPOCount={pendingPOCount}
        activeRepairCount={activeRepairCount}
        soldProductsCount={soldProducts.length}
        activeShipmentCount={activeShipmentCount}
        activeFDACount={activeFDACount}
        onOpenNewModal={() => { setEditingProject(null); setIsModalOpen(true); }}
        onOpenMemberModal={() => setIsMemberModalOpen(true)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterClientType={filterClientType}
        setFilterClientType={setFilterClientType}
        filterBudgetType={filterBudgetType}
        setFilterBudgetType={setFilterBudgetType}
        exportToCSV={exportToCSV}
        onResetDemo={handleResetDemoData}
        onOpenDemoModal={() => { setDemoPrefill(null); setIsDemoModalOpen(true); }}
        onOpenProductModal={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
        onOpenRepairModal={() => { setEditingRepairTicket(null); setIsRepairModalOpen(true); }}
        onOpenSoldModal={() => { setEditingSoldAsset(null); setIsSoldModalOpen(true); }}
        onOpenShipmentModal={() => { setEditingShipment(null); setIsShipmentModalOpen(true); }}
        onOpenFDAModal={() => { setEditingFDA(null); setIsFDAModalOpen(true); }}
      />

      {/* Main Content Body */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        {activeView === 'manager' && (
          <ManagerDashboard 
            projects={filteredProjects}
            allProjects={projects}
            members={members}
            onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
            onAddLog={(p) => { setLogTargetProject(p); setIsLogModalOpen(true); }}
            onViewHistory={handleOpenHistoryModal}
            onMoveProject={handleMoveProject}
            onBookDemo={(p) => { setDemoPrefill({ projectId: p.id, hospitalName: p.hospitalName, productId: p.productId, salesPerson: p.assignee }); setIsDemoModalOpen(true); }}
          />
        )}

        {activeView === 'demo_calendar' && (
          <DemoCalendarView 
            demoBookings={demoBookings}
            products={products}
            projects={projects}
            members={members}
            onOpenBookDemo={() => { setDemoPrefill(null); setIsDemoModalOpen(true); }}
            onDeleteBooking={(id) => setDemoBookings(prev => prev.filter(b => b.id !== id))}
          />
        )}

        {activeView === 'product_catalog' && (
          <ProductCatalogView 
            products={products}
            demoBookings={demoBookings}
            onOpenNewProduct={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
            onEditProduct={(product) => { setEditingProduct(product); setIsProductModalOpen(true); }}
            onDeleteProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
            onOpenRepairModal={handleOpenRepairFromCatalog}
          />
        )}

        {activeView === 'purchase_orders' && (
          <PurchaseOrderView 
            purchaseOrders={purchaseOrders}
            projects={projects}
            products={products}
            onOpenNewPO={(prefillProj) => { setEditingPO(prefillProj ? { projectId: prefillProj.id, hospitalName: prefillProj.hospitalName, productName: prefillProj.productName, quantity: prefillProj.quantity, totalAmountTHB: prefillProj.budget } : null); setIsPOModalOpen(true); }}
            onEditPO={(po) => { setEditingPO(po); setIsPOModalOpen(true); }}
            onDeletePO={handleDeletePO}
          />
        )}

        {activeView === 'repair_service' && (
          <RepairServiceView 
            repairTickets={repairTickets}
            products={products}
            members={members}
            onOpenNewTicket={(prefill) => { setEditingRepairTicket(prefill); setIsRepairModalOpen(true); }}
            onEditTicket={(ticket) => { setEditingRepairTicket(ticket); setIsRepairModalOpen(true); }}
            onDeleteTicket={handleDeleteRepairTicket}
            onViewInCatalog={(pName) => { setActiveView('product_catalog'); }}
          />
        )}

        {activeView === 'sold_products' && (
          <SoldProductsView 
            soldProducts={soldProducts}
            projects={projects}
            members={members}
            onOpenNewAsset={(prefill) => { setEditingSoldAsset(prefill); setIsSoldModalOpen(true); }}
            onEditAsset={(asset) => { setEditingSoldAsset(asset); setIsSoldModalOpen(true); }}
            onDeleteAsset={handleDeleteSoldAsset}
          />
        )}

        {activeView === 'shipment_tracking' && (
          <ShipmentTrackingView 
            shipments={shipments}
            purchaseOrders={purchaseOrders}
            products={products}
            onOpenNewShipment={(prefill) => { setEditingShipment(prefill); setIsShipmentModalOpen(true); }}
            onEditShipment={(shipment) => { setEditingShipment(shipment); setIsShipmentModalOpen(true); }}
            onDeleteShipment={handleDeleteShipment}
          />
        )}

        {activeView === 'fda_registration' && (
          <FDARegistrationView 
            fdaRegistrations={fdaRegistrations}
            products={products}
            members={members}
            onOpenNewFDA={(prefill) => { setEditingFDA(prefill); setIsFDAModalOpen(true); }}
            onEditFDA={(fda) => { setEditingFDA(fda); setIsFDAModalOpen(true); }}
            onDeleteFDA={handleDeleteFDA}
          />
        )}

        {activeView === 'cost_calculation' && (
          <CostCalculationView 
            costCalculations={costCalculations}
            projects={projects}
            members={members}
            onOpenNewCalc={(prefill) => { setEditingCostCalc(prefill); setIsCostModalOpen(true); }}
            onEditCalc={(calc) => { setEditingCostCalc(calc); setIsCostModalOpen(true); }}
            onDeleteCalc={handleDeleteCostCalc}
          />
        )}

        {activeView !== 'manager' && activeView !== 'demo_calendar' && activeView !== 'product_catalog' && activeView !== 'purchase_orders' && activeView !== 'repair_service' && activeView !== 'sold_products' && activeView !== 'shipment_tracking' && activeView !== 'fda_registration' && activeView !== 'cost_calculation' && (
          <MemberKanban 
            projects={filteredProjects} 
            stages={window.STAGES}
            members={members}
            products={products}
            activeMemberId={activeView}
            onMoveProject={handleMoveProject}
            onEditProject={(p) => { setEditingProject(p); setIsModalOpen(true); }}
            onDeleteProject={handleDeleteProject}
            onAddLog={(p) => { setLogTargetProject(p); setIsLogModalOpen(true); }}
            onViewHistory={handleOpenHistoryModal}
            onOpenNewModal={() => { setEditingProject(null); setIsModalOpen(true); }}
            onBookDemo={(p) => { setDemoPrefill({ projectId: p.id, hospitalName: p.hospitalName, productId: p.productId, salesPerson: p.assignee }); setIsDemoModalOpen(true); }}
          />
        )}
      </main>

      {/* Floating Action Button (Mobile Quick Add Task) */}
      <button
        onClick={() => { setEditingProject(null); setIsModalOpen(true); }}
        className="fixed bottom-5 right-5 z-40 sm:hidden flex items-center justify-center w-14 h-14 bg-gradient-to-r from-lime-500 to-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-transform"
        title="เพิ่มโครงการใหม่"
      >
        <span className="text-2xl font-bold">+</span>
      </button>

      {/* Project Create / Edit Modal */}
      {isModalOpen && (
        <ProjectModal 
          project={editingProject} 
          members={members}
          stages={window.STAGES}
          products={products}
          onSave={handleSaveProject}
          onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
        />
      )}

      {/* Weekly Progress Log Modal */}
      {isLogModalOpen && logTargetProject && (
        <WeeklyLogModal
          project={logTargetProject}
          members={members}
          onSave={(note, author) => handleAddWeeklyLog(logTargetProject.id, note, author)}
          onClose={() => { setIsLogModalOpen(false); setLogTargetProject(null); }}
        />
      )}

      {/* Team Member Management Modal */}
      {isMemberModalOpen && (
        <MemberManagementModal
          members={members}
          setMembers={setMembers}
          onClose={() => setIsMemberModalOpen(false)}
        />
      )}

      {/* Demo Booking Modal */}
      {isDemoModalOpen && (
        <DemoBookingModal
          prefill={demoPrefill}
          projects={projects}
          products={products}
          members={members}
          existingBookings={demoBookings}
          onSave={handleSaveDemoBooking}
          onClose={() => { setIsDemoModalOpen(false); setDemoPrefill(null); }}
        />
      )}

      {/* Product Master Modal */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        />
      )}

      {/* Purchase Order Modal */}
      {isPOModalOpen && (
        <PurchaseOrderModal
          po={editingPO}
          projects={projects}
          products={products}
          onSave={handleSavePO}
          onClose={() => { setIsPOModalOpen(false); setEditingPO(null); }}
        />
      )}

      {/* Repair Ticket Modal */}
      {isRepairModalOpen && (
        <RepairTicketModal
          ticket={editingRepairTicket}
          products={products}
          members={members}
          onSave={handleSaveRepairTicket}
          onClose={() => { setIsRepairModalOpen(false); setEditingRepairTicket(null); }}
        />
      )}

      {/* Delivered / Sold Product Modal */}
      {isSoldModalOpen && (
        <SoldProductModal
          asset={editingSoldAsset}
          projects={projects}
          members={members}
          onSave={handleSaveSoldAsset}
          onClose={() => { setIsSoldModalOpen(false); setEditingSoldAsset(null); }}
        />
      )}

      {/* Import Logistics / Shipment Modal */}
      {isShipmentModalOpen && (
        <ShipmentModal
          shipment={editingShipment}
          purchaseOrders={purchaseOrders}
          products={products}
          onSave={handleSaveShipment}
          onClose={() => { setIsShipmentModalOpen(false); setEditingShipment(null); }}
        />
      )}

      {/* Thai FDA Registration Modal */}
      {isFDAModalOpen && (
        <FDAModal
          fda={editingFDA}
          products={products}
          members={members}
          onSave={handleSaveFDA}
          onClose={() => { setIsFDAModalOpen(false); setEditingFDA(null); }}
        />
      )}

      {/* Project History & Activity Timeline Modal */}
      {isHistoryModalOpen && historyTargetProject && (
        <ProjectHistoryModal
          project={historyTargetProject}
          members={members}
          stages={window.STAGES}
          products={products}
          onAddLog={handleAddWeeklyLog}
          onClose={() => { setIsHistoryModalOpen(false); setHistoryTargetProject(null); }}
        />
      )}

      {/* Cost & Minimum Selling Price Financial Sheet Modal */}
      {isCostModalOpen && (
        <CostSheetModal 
          calc={editingCostCalc}
          projects={projects}
          onSave={handleSaveCostCalc}
          onClose={() => { setIsCostModalOpen(false); setEditingCostCalc(null); }}
        />
      )}

      {/* Floating Toast Notification when Sales Wins a Project */}
      {toastNotification && toastNotification.show && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900/95 border-2 border-amber-500/80 p-4 rounded-2xl shadow-2xl shadow-amber-500/30 text-white backdrop-blur-md animate-modal space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🔔</span>
              <h4 className="font-bold text-amber-300 text-sm leading-snug">{toastNotification.title}</h4>
            </div>
            <button onClick={() => setToastNotification(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
          <p className="text-xs text-slate-300">{toastNotification.message}</p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => { setActiveView('purchase_orders'); setToastNotification(null); }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/30"
            >
              🛒 ไปยังหน้าสั่งซื้อ Vendor (PO)
            </button>
            <button
              onClick={() => setToastNotification(null)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Header Component
// ----------------------------------------------------
function Header({ activeView, setActiveView, members, projects = [], pendingPOCount, activeRepairCount, soldProductsCount, activeShipmentCount, activeFDACount, onOpenNewModal, onOpenMemberModal, searchTerm, setSearchTerm, filterClientType, setFilterClientType, filterBudgetType, setFilterBudgetType, exportToCSV, onResetDemo, onOpenDemoModal, onOpenProductModal, onOpenRepairModal, onOpenSoldModal, onOpenShipmentModal, onOpenFDAModal }) {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800">
      <div className="px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Company Logo */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="bg-white p-1.5 rounded-2xl shadow-xl shadow-emerald-500/20 border-2 border-slate-700/80 flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden transition-transform hover:scale-105">
                <img 
                  src="./assets/logo.jpg" 
                  alt="AERON MEDICAL Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-base sm:text-xl font-black tracking-wider leading-tight font-sans flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-[#a3e635] via-[#65a30d] to-[#16a34a] bg-clip-text text-transparent font-extrabold drop-shadow">
                    AERON
                  </span>
                  <span className="text-white font-bold">
                    MEDICAL
                  </span>
                </h1>
                <div className="text-xs sm:text-sm font-semibold text-indigo-200/90 tracking-wide">
                  Project Tracker
                </div>
                <p className="text-[11px] text-slate-400 font-normal">ระบบติดตามงานขายและโครงการราชการ / โรงพยาบาล</p>
              </div>
            </div>
          </div>

          {/* View Switcher Dropdown & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Active Profile / System View Select */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/70 rounded-xl p-1 text-xs relative">
              <span className="pl-2 text-slate-400 font-medium hidden sm:inline">มุมมอง:</span>
              <select
                value={activeView}
                onChange={(e) => setActiveView(e.target.value)}
                className="bg-slate-800 text-slate-100 font-semibold py-1.5 px-2.5 rounded-lg border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none"
              >
                <option value="manager">📊 ภาพรวมหัวหน้างาน (Executive Overview)</option>
                <option value="kanban_all">📋 Kanban Board รวมทุกโครงการ (All Projects Kanban)</option>
                <option value="cost_calculation">🧮 คำนวณต้นทุน & ราคาขายต่ำสุด (Financial Calculator)</option>
                <option value="demo_calendar">📅 ปฏิทินจองคิวเครื่อง Demo (Demo Calendar)</option>
                <option value="product_catalog">📦 ฐานข้อมูลสินค้า Demo (Central Demo Catalog)</option>
                <option value="purchase_orders">
                  🛒 จัดซื้อสินค้า Vendor {pendingPOCount > 0 ? `(🔔 มี ${pendingPOCount} งานรอสั่งของ)` : ''}
                </option>
                <option value="repair_service">
                  🔧 สินค้าส่งซ่อม Repair Service {activeRepairCount > 0 ? `(⚙️ ${activeRepairCount} เครื่อง)` : ''}
                </option>
                <option value="sold_products">
                  🏆 สินค้าที่ขายแล้ว & ประกัน (Delivered Assets)
                </option>
                <option value="shipment_tracking">
                  🚢 ติดตามการนำเข้าสินค้า (Shipment Tracking) {activeShipmentCount > 0 ? `(✈️ ${activeShipmentCount} ล็อต)` : ''}
                </option>
                <option value="fda_registration">
                  🛡️ การจดทะเบียน อย. (Thai FDA Registration) {activeFDACount > 0 ? `(📋 ${activeFDACount} คำขอ)` : ''}
                </option>
                <optgroup label="-- Kanban รายบุคคล --">
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.avatar} Kanban {m.name} ({m.role})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Client Type Filter */}
            <select
              value={filterClientType}
              onChange={(e) => setFilterClientType(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/70 text-slate-200 text-xs py-2 px-2.5 rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="all">ทุกประเภทลูกค้า</option>
              <option value="รัฐบาล">🏛️ รัฐบาล</option>
              <option value="เอกชน">🏢 เอกชน</option>
            </select>

            {/* Budget Type Filter */}
            <select
              value={filterBudgetType}
              onChange={(e) => setFilterBudgetType(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/70 text-slate-200 text-xs py-2 px-2.5 rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="all">ทุกประเภทงบ</option>
              {window.BUDGET_TYPES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px] sm:min-w-[200px]">
              <input
                type="text"
                placeholder="ค้นหา รพ./ชื่องาน/หมอ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/70 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
              />
              <span className="absolute left-2.5 top-2 text-slate-500 text-xs">🔍</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewModal}
                className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs py-2 px-3.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span className="text-base font-bold leading-none">+</span>
                <span>เพิ่มโครงการ</span>
              </button>

              <button
                onClick={onOpenDemoModal}
                className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 p-2 px-2.5 rounded-xl border border-purple-700 text-xs transition-colors flex items-center gap-1 font-medium"
                title="จองคิวเครื่อง Demo"
              >
                🧪 จอง Demo
              </button>

              <button
                onClick={onOpenRepairModal}
                className="bg-rose-900/80 hover:bg-rose-800 text-rose-200 p-2 px-2.5 rounded-xl border border-rose-700 text-xs transition-colors flex items-center gap-1 font-medium"
                title="แจ้งส่งซ่อมสินค้า"
              >
                🔧 ส่งซ่อม
              </button>

              <button
                onClick={exportToCSV}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 text-xs transition-colors"
                title="ส่งออกรายงานเป็น CSV"
              >
                📥 CSV
              </button>

              <button
                onClick={onOpenMemberModal}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl border border-slate-700 text-xs transition-colors"
                title="จัดการทีม"
              >
                👥 ทีม
              </button>

              <button
                onClick={onResetDemo}
                className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 p-2 rounded-xl border border-rose-800/60 text-xs transition-colors"
                title="รีเซ็ตข้อมูลตัวอย่าง"
              >
                🔄 รีเซ็ต
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Quick Sales Switcher Sub-Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800 px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto gap-3 text-xs scrollbar-none">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <span>📌</span> <span>ทางลัดมุมมอง:</span>
          </span>

          <button
            onClick={() => setActiveView('manager')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
              activeView === 'manager'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <span>📊 ภาพรวมหัวหน้างาน</span>
          </button>

          <button
            onClick={() => setActiveView('kanban_all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
              activeView === 'kanban_all'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <span>📋 Kanban รวมทุกโครงการ ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveView('cost_calculation')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${
              activeView === 'cost_calculation'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <span>🧮 คำนวณต้นทุน & ราคาขาย</span>
          </button>
        </div>

        {/* Member Kanban Quick Pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-slate-400 font-medium text-[11px] hidden lg:inline mr-1">Kanban เซลส์รายบุคคล:</span>
          {members.map(m => {
            const isSelected = activeView === m.id;
            const count = projects.filter(p => p.assignee === m.name).length;
            return (
              <button
                key={m.id}
                onClick={() => setActiveView(m.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800/90'
                }`}
                title={`คลิกเพื่อดู Kanban Board ของ ${m.name}`}
              >
                <span>{m.avatar} {m.name.split(' ')[0]}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-emerald-900 text-white font-bold' : 'bg-slate-950 text-slate-400'
                }`}>
                  {count} งาน
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// ----------------------------------------------------
// Manager Dashboard Component
// ----------------------------------------------------
function ManagerDashboard({ projects, allProjects, members, onEditProject, onAddLog, onViewHistory, onMoveProject, onBookDemo }) {
  const chartRefWorkload = useRef(null);
  const chartRefStage = useRef(null);
  const chartInstanceWorkload = useRef(null);
  const chartInstanceStage = useRef(null);

  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const weightedForecast = projects.reduce((sum, p) => sum + ((Number(p.budget) || 0) * (Number(p.winProbability) || 0) / 100), 0);
  const wonProjects = projects.filter(p => p.status === 'stage_won' || p.status === 'stage_ordering' || p.status === 'stage_delivery');
  const wonBudget = wonProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const avgWinRate = totalProjects > 0 ? (projects.reduce((sum, p) => sum + (Number(p.winProbability) || 0), 0) / totalProjects).toFixed(0) : 0;

  const scheduledDemos = projects.filter(p => p.demoStatus === 'นัดหมายแล้ว' || p.demoStatus === 'กำลังเดโม่');

  useEffect(() => {
    if (chartRefWorkload.current) {
      if (chartInstanceWorkload.current) chartInstanceWorkload.current.destroy();

      const memberNames = members.map(m => m.name);
      const budgetPerMember = members.map(m => projects.filter(p => p.assignee === m.name).reduce((sum, p) => sum + (Number(p.budget) || 0), 0) / 1000000);
      const countPerMember = members.map(m => projects.filter(p => p.assignee === m.name).length);

      const ctx = chartRefWorkload.current.getContext('2d');
      chartInstanceWorkload.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: memberNames,
          datasets: [
            {
              label: 'มูลค่ารวม (ล้านบาท)',
              data: budgetPerMember,
              backgroundColor: 'rgba(16, 185, 129, 0.75)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 1.5,
              borderRadius: 8,
              yAxisID: 'y'
            },
            {
              label: 'จำนวนโครงการ (งาน)',
              data: countPerMember,
              backgroundColor: 'rgba(245, 158, 11, 0.75)',
              borderColor: 'rgba(245, 158, 11, 1)',
              borderWidth: 1.5,
              borderRadius: 8,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#cbd5e1', font: { family: 'Prompt', size: 11 } } } },
          scales: {
            x: { ticks: { color: '#94a3b8', font: { family: 'Prompt', size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { type: 'linear', position: 'left', ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y1: { type: 'linear', position: 'right', ticks: { color: '#94a3b8', precision: 0 }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }

    if (chartRefStage.current) {
      if (chartInstanceStage.current) chartInstanceStage.current.destroy();

      const stageLabels = window.STAGES.map(s => s.title.split('.')[1] || s.title);
      const stageValues = window.STAGES.map(s => projects.filter(p => p.status === s.id).reduce((sum, p) => sum + (Number(p.budget) || 0), 0) / 1000000);
      const colors = window.STAGES.map(s => s.accentColor);

      const ctx2 = chartRefStage.current.getContext('2d');
      chartInstanceStage.current = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: stageLabels,
          datasets: [{
            data: stageValues,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#020617'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#cbd5e1', font: { family: 'Prompt', size: 10 } } }
          }
        }
      });
    }

    return () => {
      if (chartInstanceWorkload.current) {
        chartInstanceWorkload.current.destroy();
        chartInstanceWorkload.current = null;
      }
      if (chartInstanceStage.current) {
        chartInstanceStage.current.destroy();
        chartInstanceStage.current = null;
      }
    };
  }, [projects, members]);

  return (
    <div className="space-y-6">
      
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Budget Card */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>มูลค่าโครงการรวมทั้งหมด</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalBudget)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>จากทั้งหมด {totalProjects} โครงการ</span>
            <span className="text-emerald-300 font-semibold">เฉลี่ย {totalProjects > 0 ? formatShortCurrency(totalBudget / totalProjects) : 0}</span>
          </div>
        </div>

        {/* Won Budget Card */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>ยอดชนะงานประมูลสำเร็จ</span>
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">🎉</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight font-mono">
            {formatCurrency(wonBudget)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>ชนะแล้ว {wonProjects.length} งาน</span>
            <span className="text-blue-300 font-semibold">{totalBudget > 0 ? ((wonBudget / totalBudget) * 100).toFixed(1) : 0}% ของเป้า</span>
          </div>
        </div>

        {/* Weighted Forecast Card */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>ประมาณการยอดขาย (Weighted)</span>
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">📈</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight font-mono">
            {formatCurrency(weightedForecast)}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>คำนวณตามโอกาสชนะ (%)</span>
            <span className="text-purple-300 font-semibold">Win Rate เฉลี่ย {avgWinRate}%</span>
          </div>
        </div>

        {/* Demo Units Status Card */}
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>คิวสาธิตเครื่อง (Active Demos)</span>
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">🧪</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight font-mono">
            {scheduledDemos.length} <span className="text-sm font-normal text-slate-400">งาน</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>นัดเดโม่กับโรงพยาบาล</span>
            <span className="text-amber-300 font-semibold">พร้อมเข้าทดสอบ</span>
          </div>
        </div>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
          <div className="mb-4">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">📊 มูลค่าโครงการและภาระงานแยกตามเซลส์ (Workload)</h3>
            <p className="text-xs text-slate-400">เปรียบเทียบมูลค่ารวม (ล้านบาท) และจำนวนงานของสมาชิกในทีม</p>
          </div>
          <div className="h-64 sm:h-72">
            <canvas ref={chartRefWorkload}></canvas>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800">
          <div className="mb-4">
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">🍩 สัดส่วนมูลค่างานตามขั้นตอน (Pipeline)</h3>
            <p className="text-xs text-slate-400">แยกตามขั้นตอน 8 Stage สัญญาราชการ</p>
          </div>
          <div className="h-64 sm:h-72 flex items-center justify-center">
            <canvas ref={chartRefStage}></canvas>
          </div>
        </div>
      </div>

      {/* Scheduled Demos Table */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>🧪 คิวสาธิตเครื่อง (Demo Schedule) & สินค้าที่ต้องเข้าทดสอบ</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {scheduledDemos.length} รายการ
              </span>
            </h3>
            <p className="text-xs text-slate-400">โครงการที่มีนัดหมายเดโม่เครื่องกับโรงพยาบาล</p>
          </div>
        </div>

        {scheduledDemos.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            ไม่มีโครงการที่อยู่ในช่วงนัดสาธิตเครื่องในขณะนี้
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">โรงพยาบาล / โครงการ</th>
                  <th className="p-3">สินค้าที่เดโม่</th>
                  <th className="p-3">เซลส์ผู้รับผิดชอบ</th>
                  <th className="p-3">ช่วงวันที่นัดสาธิต</th>
                  <th className="p-3 text-right">งบประมาณ</th>
                  <th className="p-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scheduledDemos.map(p => {
                  let demoDaysStr = '';
                  if (p.demoStartDate && p.demoEndDate) {
                    const start = new Date(p.demoStartDate);
                    const end = new Date(p.demoEndDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    demoDaysStr = ` (${diffDays} วัน)`;
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{p.hospitalName}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{p.title}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-lg text-[10.5px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                          📦 {p.productName || 'ไม่ระบุรุ่น'}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-emerald-300">{p.assignee}</td>
                      <td className="p-3 text-amber-300 font-mono">
                        {p.demoStartDate ? `${p.demoStartDate} ถึง ${p.demoEndDate || 'N/A'}${demoDaysStr}` : 'ยังไม่ระบุ'}
                      </td>
                      <td className="p-3 text-right font-semibold text-emerald-400">
                        {formatCurrency(p.budget)}
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => onViewHistory(p)}
                          className="px-2 py-1 bg-indigo-900/50 hover:bg-indigo-800/70 text-indigo-200 text-xs rounded-lg border border-indigo-700/60 font-medium"
                          title="ดูประวัติความเคลื่อนไหวย้อนหลัง"
                        >
                          📜 ประวัติ ({p.weeklyLogs ? p.weeklyLogs.length : 0})
                        </button>
                        <button
                          onClick={() => onBookDemo(p)}
                          className="px-2 py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs rounded-lg border border-purple-700/50"
                        >
                          🧪 จองคิว
                        </button>
                        <button
                          onClick={() => onEditProject(p)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                        >
                          ✏️ แก้ไข
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

// ----------------------------------------------------
// Demo Booking Calendar View Component
// ----------------------------------------------------
function DemoCalendarView({ demoBookings, products, projects, members, onOpenBookDemo, onDeleteBooking }) {
  const [filterProduct, setFilterProduct] = useState('all');
  const [calendarMode, setCalendarMode] = useState('month'); // 'month' or 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 7, 1)); // Default August 2026 for mock data

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

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarMode === 'month' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗓️ มุมมอง Month Grid
            </button>
            <button
              onClick={() => setCalendarMode('list')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 มุมมอง รายการ
            </button>
          </div>

          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 outline-none"
          >
            <option value="all">กรองตามเครื่องสาธิตทุกรุ่น</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>📦 {p.name}</option>
            ))}
          </select>

          <button
            onClick={onOpenBookDemo}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
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

    </div>
  );
}

// ----------------------------------------------------
// Month Calendar Grid Sub-Component
// ----------------------------------------------------
function MonthCalendarGrid({ currentMonth, bookings, products, onPrevMonth, onNextMonth, onTodayMonth, onDeleteBooking }) {
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

// ----------------------------------------------------
// Central Demo Catalog View Component
// ----------------------------------------------------
function ProductCatalogView({ products, demoBookings, onOpenNewProduct, onEditProduct, onDeleteProduct, onOpenRepairModal }) {
  const [expandedProduct, setExpandedProduct] = useState(null);

  const statusConfig = {
    'พร้อมใช้งาน': { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', dot: 'bg-emerald-400', icon: '✅' },
    'ส่งซ่อม':      { color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',   dot: 'bg-amber-400',   icon: '🔧' },
    'เสีย':         { color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',       dot: 'bg-rose-400',    icon: '❌' },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            📦
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลสินค้า Demo (Central Demo Catalog)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AERON MEDICAL
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ประเภทสินค้า รายชื่อรุ่นเครื่องมือแพทย์ และสถานะเครื่องสาธิต (Demo Units) พร้อมอุปกรณ์ประกอบในชุด
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewProduct}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ เพิ่มชนิดสินค้าใหม่</span>
        </button>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(p => {
          const activeBookingsCount = demoBookings.filter(b => b.productId === p.id).length;
          const units = p.demoUnits || (p.demoSerialNumbers || []).map(sn => ({ sn, status: 'พร้อมใช้งาน', location: '', accessories: '' }));
          const readyCount = units.filter(u => u.status === 'พร้อมใช้งาน').length;
          const repairCount = units.filter(u => u.status === 'ส่งซ่อม').length;
          const brokenCount = units.filter(u => u.status === 'เสีย').length;
          const isExpanded = expandedProduct === p.id;

          return (
            <div key={p.id} className="glass-card p-5 rounded-2xl space-y-3 border border-slate-800 hover:border-emerald-500/40 transition-colors relative">
              <div className="flex items-start justify-between">
                <span className="text-[10.5px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {p.category}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {formatCurrency(p.price)}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{p.name}</h3>
                <div className="text-xs text-indigo-300 font-medium">แบรนด์: {p.brand || 'AERON MEDICAL'}</div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {p.description || 'ไม่มีรายละเอียดสินค้า'}
              </p>

              {/* Demo Stock Summary */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>🧪 เครื่องสาธิตส่วนกลาง:</span>
                  <span className="font-bold text-emerald-400 font-mono">{units.length} เครื่อง</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>📅 ถูกจองคิวขณะนี้:</span>
                  <span className="font-mono text-purple-300 font-semibold">{activeBookingsCount} คิว</span>
                </div>

                {/* Status Summary Pills */}
                <div className="flex gap-1.5 flex-wrap pt-1 border-t border-slate-800">
                  {readyCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✅ พร้อมใช้ {readyCount}
                    </span>
                  )}
                  {repairCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      🔧 ส่งซ่อม {repairCount}
                    </span>
                  )}
                  {brokenCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      ❌ เสีย {brokenCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Expand/Collapse Demo Units Detail */}
              <button
                onClick={() => setExpandedProduct(isExpanded ? null : p.id)}
                className="w-full text-xs py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{isExpanded ? '▲ ซ่อนรายละเอียดเครื่องสาธิต' : '▼ ดูรายละเอียดเครื่องสาธิตแต่ละตัว'}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono text-[9px]">{units.length}</span>
              </button>

              {/* Demo Units Detail Cards (Expanded) */}
              {isExpanded && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300">🧪 รายชื่อเครื่องสาธิต ({units.length})</span>
                    <button
                      onClick={() => onEditProduct(p)}
                      className="text-[10.5px] font-bold text-amber-300 hover:text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1"
                    >
                      <span>➕ เพิ่ม/แก้ไขเครื่อง</span>
                    </button>
                  </div>
                  {units.map((unit, idx) => {
                    const cfg = statusConfig[unit.status] || statusConfig['พร้อมใช้งาน'];
                    return (
                      <div key={idx} className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-[11px]">
                        {/* SN + Status */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-slate-200 text-[10.5px]">🔖 SN: {unit.sn || 'ไม่ระบุ'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {unit.status}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-1.5 text-slate-400">
                          <span className="shrink-0 mt-0.5">📍</span>
                          <span className="leading-snug">
                            <span className="text-slate-500 mr-1">สถานที่อยู่ปัจจุบัน:</span>
                            <span className="text-slate-200 font-medium">{unit.location || 'สำนักงาน AERON'}</span>
                          </span>
                        </div>

                        {/* Accessories */}
                        <div className="flex items-start gap-1.5 text-slate-400">
                          <span className="shrink-0 mt-0.5">🧰</span>
                          <span className="leading-snug">
                            <span className="text-slate-500 mr-1">อุปกรณ์ประกอบในชุด:</span>
                            <span className="text-slate-300 font-normal">{unit.accessories || 'ชุดมาตรฐานประจำเครื่อง'}</span>
                          </span>
                        </div>

                        {/* Open Repair Ticket Button Link */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => onOpenRepairModal(p, unit)}
                            className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 text-[10.5px] font-semibold rounded-lg border border-rose-700/50 flex items-center gap-1"
                          >
                            <span>🔧 แจ้งเปิดใบส่งซ่อมเครื่องนี้</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Product Action Buttons (Edit Product & Delete Product) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <button
                  onClick={() => onEditProduct(p)}
                  className="px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 font-semibold rounded-xl border border-indigo-700/50 flex items-center gap-1 transition-all"
                >
                  <span>✏️ แก้ไขสินค้า / เครื่อง Demo</span>
                </button>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs px-2.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 transition-all"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Admin Purchase Order (Vendor PO) View Component
// ----------------------------------------------------
function PurchaseOrderView({ purchaseOrders, projects, products, onOpenNewPO, onEditPO, onDeletePO }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterVendor, setFilterVendor] = useState('all');
  const [searchPO, setSearchPO] = useState('');
  const [previewPO, setPreviewPO] = useState(null);

  // 1. Calculate Won Projects that don't have a PO issued yet
  const pendingWonProjects = useMemo(() => {
    const wonStages = ['stage_won', 'stage_ordering', 'stage_delivery'];
    return projects.filter(p => {
      if (!wonStages.includes(p.status)) return false;
      const hasPO = purchaseOrders.some(po => po.projectId === p.id);
      return !hasPO;
    });
  }, [projects, purchaseOrders]);

  // 2. Filtered Pending Won Projects for Table
  const filteredPendingProjects = useMemo(() => {
    return pendingWonProjects.filter(p => {
      const yr = p.procurementDate ? new Date(p.procurementDate).getFullYear() : (p.createdDate ? new Date(p.createdDate).getFullYear() : 2026);
      if (selectedYear !== 'all' && Number(yr) !== Number(selectedYear)) return false;
      if (searchPO.trim()) {
        const term = searchPO.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(term);
        const matchHosp = p.hospitalName.toLowerCase().includes(term);
        const matchAssignee = p.assignee.toLowerCase().includes(term);
        const matchProd = (p.productName || '').toLowerCase().includes(term);
        return matchTitle || matchHosp || matchAssignee || matchProd;
      }
      return true;
    });
  }, [pendingWonProjects, selectedYear, searchPO]);

  // 3. Available Years
  const availableYears = useMemo(() => {
    const years = new Set(purchaseOrders.map(p => p.year || new Date(p.poDate).getFullYear()));
    years.add(2026);
    years.add(2025);
    return Array.from(years).sort((a, b) => b - a);
  }, [purchaseOrders]);

  // 4. Filtered POs by Year, Vendor, and Search
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const poYear = po.year || new Date(po.poDate).getFullYear();
      if (selectedYear !== 'all' && Number(poYear) !== Number(selectedYear)) return false;
      if (filterVendor !== 'all' && po.vendorId !== filterVendor && po.vendorName !== filterVendor) return false;
      if (searchPO.trim()) {
        const term = searchPO.toLowerCase();
        const matchNo = po.poNumber.toLowerCase().includes(term);
        const matchVendor = po.vendorName.toLowerCase().includes(term);
        const matchHosp = (po.hospitalName || '').toLowerCase().includes(term);
        const matchProd = (po.productName || '').toLowerCase().includes(term);
        return matchNo || matchVendor || matchHosp || matchProd;
      }
      return true;
    });
  }, [purchaseOrders, selectedYear, filterVendor, searchPO]);

  // 5. Summary Metrics
  const totalSpentTHB = useMemo(() => {
    return filteredPOs.reduce((sum, po) => sum + (Number(po.totalAmountTHB) || 0), 0);
  }, [filteredPOs]);

  const uniqueVendorsCount = useMemo(() => {
    return new Set(filteredPOs.map(po => po.vendorName)).size;
  }, [filteredPOs]);

  const receivedCount = useMemo(() => {
    return filteredPOs.filter(po => po.status === 'รับสินค้าแล้ว' || po.status === 'สินค้าถึงไทย').length;
  }, [filteredPOs]);

  // 6. Vendor Spend Breakdown
  const vendorBreakdown = useMemo(() => {
    const map = {};
    filteredPOs.forEach(po => {
      const vName = po.vendorName || 'ไม่ระบุ Vendor';
      if (!map[vName]) {
        map[vName] = {
          name: vName,
          country: po.vendorCountry || '',
          totalTHB: 0,
          ordersCount: 0,
          products: {},
          statuses: {}
        };
      }
      map[vName].totalTHB += Number(po.totalAmountTHB) || 0;
      map[vName].ordersCount += 1;
      
      const pName = po.productName || 'สินค้าอื่นๆ';
      if (!map[vName].products[pName]) map[vName].products[pName] = { name: pName, qty: 0, amountTHB: 0 };
      map[vName].products[pName].qty += Number(po.quantity) || 1;
      map[vName].products[pName].amountTHB += Number(po.totalAmountTHB) || 0;

      const st = po.status || 'ร่าง PO';
      map[vName].statuses[st] = (map[vName].statuses[st] || 0) + 1;
    });

    return Object.values(map).sort((a, b) => b.totalTHB - a.totalTHB);
  }, [filteredPOs]);

  const statusColors = {
    'ร่าง PO': 'bg-slate-700/50 text-slate-300 border-slate-600',
    'รออนุมัติ': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'อนุมัติแล้ว': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'ส่ง PO ให้ Vendor': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Vendor ยืนยันรับ PO': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'รอผลิต / รอของ': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'สินค้าถึงไทย': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'รับสินค้าแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
            🛒
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>การสั่งสินค้า Vendor (Admin Purchase Orders)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                หลังชนะงานประมูล
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ระบบออกใบสั่งซื้อ (PO) สรุปยอดซื้อสินค้าแยกตาม Vendor ผู้ผลิต และติดตามสถานะการส่งมอบสินค้า
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewPO(null)}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ ออกใบสั่งซื้อ PO ใหม่</span>
        </button>
      </div>

      {/* Pending PO Notification Alert Section */}
      {pendingWonProjects.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/70 p-5 rounded-2xl border-2 border-amber-500/60 shadow-xl shadow-amber-500/10 space-y-3 relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl animate-bounce">
                🔔
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <span>แจ้งเตือนสั่งของ: มี {pendingWonProjects.length} โครงการชนะงานที่ยังไม่ออกใบสั่งซื้อ (Pending PO)</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-bold animate-pulse">
                    ด่วน
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  เซลส์ในทีมชนะงานและเซ็นสัญญาเรียบร้อยแล้ว กรุณาออกใบสั่งซื้อ (PO) ส่งให้ Vendor เพื่อเริ่มผลิตและจัดส่งสินค้า
                </p>
              </div>
            </div>
          </div>

          {/* Pending Won Projects List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingWonProjects.map(proj => (
              <div key={proj.id} className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/40 space-y-2 relative">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🎉 ชนะงานแล้ว
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{proj.hospitalName}</h4>
                    <p className="text-xs text-indigo-300 line-clamp-1">{proj.title}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-amber-400">{formatCurrency(proj.budget)}</div>
                    <div className="text-[10.5px] text-emerald-300 font-medium mt-0.5">👤 {proj.assignee}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <span className="text-slate-400">
                    📦 สินค้า: <span className="text-slate-200 font-semibold">{proj.productName || 'ไม่ระบุ'}</span> ({proj.quantity || 1} ชุด)
                  </span>
                  <button
                    onClick={() => onOpenNewPO(proj)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20 flex items-center gap-1 transition-all"
                  >
                    <span>🛒 ออก PO งานนี้</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Year Tabs Selection */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">เลือกปีงบประมาณ / สั่งซื้อ:</span>
          {availableYears.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr.toString())}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedYear === yr.toString()
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>📅 ปี {yr + 543}</span>
              <span className="text-[10px] opacity-75 font-mono">({yr})</span>
            </button>
          ))}
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedYear === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            🌐 สรุปทุกปี
          </button>
        </div>

        <div className="text-xs text-slate-400">
          แสดงข้อมูล {filteredPOs.length + filteredPendingProjects.length} รายการ (ใบสั่งซื้อ + งานรอ PO)
        </div>
      </div>

      {/* Executive KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💳 ยอดสั่งซื้อรวมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalSpentTHB)}
          </div>
          <div className="text-[11px] text-slate-400">
            {selectedYear === 'all' ? 'รวมยอดสั่งซื้อจากทุกปี' : `ยอดรวมเฉพาะปี ${Number(selectedYear) + 543}`}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📄 จำนวนใบสั่งซื้อ (PO)</span>
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-300 tracking-tight font-mono">
            {filteredPOs.length} <span className="text-xs font-normal text-slate-400">ฉบับ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ออก PO จาก Vendor ในปีนี้
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🏢 จำนวน Vendor ผู้ผลิต</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">🏭</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {uniqueVendorsCount} <span className="text-xs font-normal text-slate-400">บริษัท</span>
          </div>
          <div className="text-[11px] text-slate-400">
            คู่ค้าที่เปิด PO สั่งสินค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🚛 ส่งมอบ / รับของแล้ว</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">📦</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {receivedCount} / {filteredPOs.length} <span className="text-xs font-normal text-slate-400">PO</span>
          </div>
          <div className="text-[11px] text-slate-400">
            คิดเป็น {filteredPOs.length > 0 ? Math.round((receivedCount / filteredPOs.length) * 100) : 0}% ของรายการทั้งหมด
          </div>
        </div>

      </div>

      {/* Vendor Spend Breakdown Dashboard Cards */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📊 สรุปยอดสั่งซื้อแยกตาม Vendor ผู้ผลิต (Vendor Purchasing Summary)</span>
            </h3>
            <p className="text-xs text-slate-400">
              สรุปจำนวนเงินที่สั่งซื้อ ชนิดสินค้าที่ซื้อ และสัดส่วนยอดสั่งซื้อของแต่ละ Vendor
            </p>
          </div>
        </div>

        {vendorBreakdown.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            ไม่มีรายการสั่งซื้อในช่วงเวลาที่เลือก
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorBreakdown.map((vb, idx) => {
              const pct = totalSpentTHB > 0 ? ((vb.totalTHB / totalSpentTHB) * 100).toFixed(1) : 0;
              const productItems = Object.values(vb.products);

              return (
                <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3 relative hover:border-amber-500/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>🏭 {vb.name}</span>
                      </h4>
                      {vb.country && (
                        <span className="text-[10px] text-slate-400">ประเทศ: {vb.country}</span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                      {vb.ordersCount} PO
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex justify-between items-center">
                    <span className="text-xs text-slate-400">ยอดรวมสั่งซื้อ:</span>
                    <span className="text-sm font-bold font-mono text-amber-400">{formatCurrency(vb.totalTHB)}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                      <span>สัดส่วนยอดซื้อ:</span>
                      <span className="text-amber-300 font-mono">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <div className="text-[10.5px] font-semibold text-indigo-300">📦 รายการสินค้าที่สั่งซื้อ:</div>
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {productItems.map((pi, pIdx) => (
                        <div key={pIdx} className="flex justify-between items-center text-[10.5px] bg-slate-950/60 p-1.5 rounded border border-slate-900">
                          <span className="text-slate-200 line-clamp-1 font-medium">{pi.name} ({pi.qty} ชิ้น)</span>
                          <span className="text-slate-400 font-mono shrink-0 ml-2">{formatCurrency(pi.amountTHB)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PO List Table & Controls */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 รายการใบสั่งซื้อจาก Vendor (Purchase Orders List)</span>
            </h3>
            <p className="text-xs text-slate-400">รายการใบสั่งซื้อทั้งหมด สามารถแก้ไขและติดตามสถานะจัดส่งได้</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหาเลข PO / รพ. / สินค้า..."
              value={searchPO}
              onChange={(e) => setSearchPO(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุก Vendor</option>
              {window.VENDOR_LIST.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ PO / วันที่</th>
                <th className="p-3">Vendor / ผู้จัดจำหน่าย</th>
                <th className="p-3">โครงการ / โรงพยาบาล</th>
                <th className="p-3">สินค้าที่สั่ง</th>
                <th className="p-3 text-right">จำนวนเงิน (FX & THB)</th>
                <th className="p-3 text-center">สถานะ PO</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Render Pending Won Projects Waiting for PO */}
              {filteredPendingProjects.map(proj => (
                <tr key={`pending-${proj.id}`} className="bg-amber-950/40 hover:bg-amber-900/50 transition-colors border-l-4 border-l-amber-500">
                  <td className="p-3">
                    <div className="font-mono font-bold text-amber-300 flex items-center gap-1">
                      <span>🔔</span> <span>(รอออก PO)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">ชนะงานเมื่อ: {proj.procurementDate || 'ล่าสุด'}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-amber-200/90 italic">ยังไม่ได้ออก PO ให้ Vendor</div>
                    <div className="text-[10px] text-slate-400">รอดำเนินการออกใบสั่งซื้อ</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-white text-sm">{proj.hospitalName}</div>
                    <div className="text-[11px] text-emerald-300 font-medium">👤 เซลส์: {proj.assignee}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-200">{proj.productName || 'ไม่ระบุ'}</div>
                    <div className="text-[10px] text-slate-400">จำนวน: <span className="font-mono font-bold text-amber-300">{proj.quantity || 1}</span> ชุด</div>
                  </td>
                  <td className="p-3 text-right font-mono">
                    <div className="font-bold text-amber-400 text-sm">{formatCurrency(proj.budget)}</div>
                    <div className="text-[10px] text-slate-400">(งบชนะประมูล)</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/30 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse">
                      ⏳ รอออกใบสั่งซื้อ
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onOpenNewPO(proj)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/30 flex items-center gap-1 mx-auto transition-all hover:scale-105"
                    >
                      <span>🛒 ออก PO ทันที</span>
                    </button>
                  </td>
                </tr>
              ))}

              {/* Render Issued POs */}
              {filteredPOs.length === 0 && filteredPendingProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการใบสั่งซื้อ PO ตรงตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const badgeStyle = statusColors[po.status] || 'bg-slate-800 text-slate-300';
                  return (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-bold text-amber-300">{po.poNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">📅 {po.poDate || 'ไม่ระบุ'}</div>
                        {po.expectedDelivery && (
                          <div className="text-[9.5px] text-indigo-300 font-mono">🚛 ครบกำหนด: {po.expectedDelivery}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-100">{po.vendorName}</div>
                        {po.vendorCountry && (
                          <div className="text-[10px] text-slate-400">🌍 {po.vendorCountry}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-emerald-300">{po.hospitalName || 'ไม่ระบุ รพ.'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-200">{po.productName}</div>
                        <div className="text-[10px] text-slate-400">จำนวน: <span className="font-mono font-bold text-amber-300">{po.quantity}</span> ชุด</div>
                      </td>
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400 text-sm">{formatCurrency(po.totalAmountTHB)}</div>
                        {po.currency && po.currency !== 'THB' && po.totalAmountFX && (
                          <div className="text-[10px] text-slate-400">
                            ({po.totalAmountFX.toLocaleString()} {po.currency} @ {po.exchangeRate})
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold border ${badgeStyle}`}>
                          {po.status || 'ร่าง PO'}
                        </span>
                      </td>
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewPO(po)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบสั่งซื้อ"
                        >
                          👁️ ดู PO
                        </button>
                        <button
                          onClick={() => onEditPO(po)}
                          className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeletePO(po.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO View Modal Preview */}
      {previewPO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal font-sans text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  PURCHASE ORDER (PO)
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewPO.poNumber}</h3>
                <p className="text-xs text-slate-400">วันที่ออก PO: {previewPO.poDate}</p>
              </div>
              <button onClick={() => setPreviewPO(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">VENDOR / ผู้จัดจำหน่าย:</div>
                <div className="font-bold text-amber-300 text-sm mt-0.5">{previewPO.vendorName}</div>
                <div className="text-slate-400">ประเทศ: {previewPO.vendorCountry || 'N/A'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">โครงการ / โรงพยาบาล:</div>
                <div className="font-bold text-emerald-300 text-sm mt-0.5">{previewPO.hospitalName || 'ไม่ระบุ'}</div>
                <div className="text-slate-400">สถานะสั่งซื้อ: <span className="text-indigo-300 font-bold">{previewPO.status}</span></div>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">รายการสินค้า (Product Description)</th>
                    <th className="p-3 text-center">จำนวน</th>
                    <th className="p-3 text-right">ราคา/หน่วย</th>
                    <th className="p-3 text-right">มูลค่ารวม (THB)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/60">
                    <td className="p-3 font-semibold text-white">
                      {previewPO.productName}
                      <div className="text-[10px] text-slate-400 font-normal">{previewPO.productCategory}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-300">{previewPO.quantity}</td>
                    <td className="p-3 text-right font-mono">
                      {previewPO.unitPrice ? previewPO.unitPrice.toLocaleString() + ' ' + (previewPO.currency || 'THB') : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(previewPO.totalAmountTHB)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {previewPO.note && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-amber-400">📝 หมายเหตุ / เงื่อนไข:</span> {previewPO.note}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700"
              >
                🖨️ พิมพ์เอกสาร
              </button>
              <button
                onClick={() => setPreviewPO(null)}
                className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------
// Purchase Order Create/Edit Modal Component
// ----------------------------------------------------
function PurchaseOrderModal({ po, projects, products, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (po) return { ...po };
    const wonProjects = projects.filter(p => p.status === 'stage_won' || p.status === 'stage_ordering' || p.status === 'stage_delivery');
    const firstProj = wonProjects[0] || projects[0] || {};
    return {
      poNumber: `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      year: new Date().getFullYear(),
      projectId: firstProj.id || '',
      hospitalName: firstProj.hospitalName || '',
      vendorId: window.VENDOR_LIST[0].id,
      vendorName: window.VENDOR_LIST[0].name,
      vendorCountry: window.VENDOR_LIST[0].country,
      currency: window.VENDOR_LIST[0].currency || 'THB',
      productId: firstProj.productId || (products[0] ? products[0].id : ''),
      productName: firstProj.productName || (products[0] ? products[0].name : ''),
      quantity: firstProj.quantity || 1,
      unitPrice: 100000,
      totalAmountFX: 100000,
      exchangeRate: 1,
      totalAmountTHB: firstProj.budget || 100000,
      poDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '',
      status: 'ร่าง PO',
      note: ''
    };
  });

  const handleProjectSelect = (projId) => {
    const selected = projects.find(p => p.id === projId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        projectId: projId,
        hospitalName: selected.hospitalName,
        productId: selected.productId || prev.productId,
        productName: selected.productName || prev.productName,
        quantity: selected.quantity || prev.quantity,
        totalAmountTHB: selected.budget || prev.totalAmountTHB
      }));
    } else {
      setFormData(prev => ({ ...prev, projectId: projId }));
    }
  };

  const handleVendorSelect = (vendorId) => {
    const v = window.VENDOR_LIST.find(x => x.id === vendorId);
    if (v) {
      let defaultRate = 1;
      if (v.currency === 'USD') defaultRate = 36.5;
      if (v.currency === 'EUR') defaultRate = 39.5;
      if (v.currency === 'JPY') defaultRate = 0.24;

      setFormData(prev => ({
        ...prev,
        vendorId,
        vendorName: v.name,
        vendorCountry: v.country,
        currency: v.currency,
        exchangeRate: defaultRate,
        totalAmountTHB: prev.quantity * prev.unitPrice * defaultRate
      }));
    }
  };

  const updateCalc = (field, val) => {
    const newForm = { ...formData, [field]: val };
    const qty = Number(newForm.quantity) || 1;
    const price = Number(newForm.unitPrice) || 0;
    const rate = Number(newForm.exchangeRate) || 1;
    newForm.totalAmountFX = qty * price;
    newForm.totalAmountTHB = qty * price * rate;
    setFormData(newForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.poNumber.trim()) {
      alert('กรุณากรอกเลขที่ PO');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🛒 {po ? 'แก้ไขใบสั่งซื้อ' : 'ออกใบสั่งซื้อ (Issue Purchase Order)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ PO <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ปีงบประมาณ / สั่งซื้อ</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
              >
                <option value="2026">2026 (พ.ศ. 2569)</option>
                <option value="2025">2025 (พ.ศ. 2568)</option>
                <option value="2024">2024 (พ.ศ. 2567)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เลือกโครงการที่ชนะงาน (เพื่อเชื่อมข้อมูล)</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              <option value="">-- ไม่ระบุ / สั่งซื้ออิสระ --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  🏥 {p.hospitalName} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / ลูกค้า</label>
              <input
                type="text"
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Vendor / ผู้จัดจำหน่าย <span className="text-rose-400">*</span></label>
              <select
                value={formData.vendorId}
                onChange={(e) => handleVendorSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-semibold text-amber-300 outline-none"
              >
                {window.VENDOR_LIST.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.country})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้าที่สั่งซื้อ</label>
              <input
                type="text"
                required
                placeholder="เช่น AERON Cardio 12L-AI"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">จำนวนสั่งซื้อ</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateCalc('quantity', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-center outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ราคาต่อหน่วย (Foreign FX)</label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => updateCalc('unitPrice', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">สกุลเงิน / อัตราแลกเปลี่ยน</label>
              <div className="flex gap-1">
                <select
                  value={formData.currency}
                  onChange={(e) => updateCalc('currency', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold outline-none"
                >
                  <option value="THB">THB (฿)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Rate"
                  value={formData.exchangeRate}
                  onChange={(e) => updateCalc('exchangeRate', Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">มูลค่ารวม (บาท THB)</label>
              <input
                type="number"
                value={formData.totalAmountTHB}
                onChange={(e) => setFormData({ ...formData, totalAmountTHB: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ออก PO</label>
              <input
                type="date"
                value={formData.poDate}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">กำหนดรับของ (Expected)</label>
              <input
                type="date"
                value={formData.expectedDelivery}
                onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">สถานะ PO</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold text-indigo-300"
              >
                {window.PO_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / เงื่อนไขจัดส่ง</label>
            <textarea
              rows="2"
              placeholder="ระบุข้อความหรือหมายเหตุถึง Vendor..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl">บันทึกใบสั่งซื้อ PO</button>
          </div>

        </form>
      </div>
    </div>
  );
}
function MemberKanban({ projects, stages, members, products, activeMemberId, onMoveProject, onEditProject, onDeleteProject, onAddLog, onViewHistory, onOpenNewModal, onBookDemo }) {
  const activeMember = members.find(m => m.id === activeMemberId);
  const [selectedMobileStage, setSelectedMobileStage] = useState(stages[0].id);
  const [draggedProjectId, setDraggedProjectId] = useState(null);

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
              <span>{activeMember ? activeMember.name : 'สมาชิกทีม'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                {activeMember ? activeMember.role : 'Sales Specialist'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              กำลังแสดง Kanban Board โครงการโรงพยาบาลประจำตัว ({projects.length} โครงการ)
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

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-1">
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
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// Project Card Component
// ----------------------------------------------------
function ProjectCard({ project, stages, onDragStart, onMoveProject, onEditProject, onDeleteProject, onAddLog, onViewHistory, onBookDemo }) {
  const [showQuickMove, setShowQuickMove] = useState(false);
  const logs = project.weeklyLogs || [];
  const latestLog = logs.length > 0 ? logs[0] : null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="glass-card rounded-xl p-3.5 space-y-3 cursor-grab active:cursor-grabbing hover:translate-y-[-2px] transition-all relative group border border-slate-800/80"
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
          project.clientType === 'รัฐบาล' 
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }`}>
          {project.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
        </span>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
          🎯 โอกาส {project.winProbability}%
        </span>
      </div>

      <div>
        <h4 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-1 flex items-center gap-1.5">
          <span className="text-emerald-400">🏥</span>
          <span>{project.hospitalName}</span>
        </h4>
        <p className="text-xs text-slate-300 mt-1 font-medium leading-snug line-clamp-2">
          {project.title}
        </p>

        {project.productName && (
          <div className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
            <span>📦</span>
            <span className="line-clamp-1">{project.productName} ({project.productBrand || 'AERON MEDICAL'})</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>💰 งบประมาณ:</span>
          <span className="font-bold text-amber-400 font-mono text-sm">{formatCurrency(project.budget)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>🏛️ ประเภทงบ:</span>
          <span className="text-slate-300 font-medium">{project.budgetType}</span>
        </div>
      </div>

      {project.demoStatus && project.demoStatus !== 'ยังไม่ได้เข้าเดโม่' && (
        <div className="bg-purple-950/50 p-2 rounded-lg border border-purple-800/50 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-purple-300 font-semibold">🧪 {project.demoStatus}</span>
            <button
              onClick={() => onBookDemo(project)}
              className="text-[9.5px] px-1.5 py-0.5 bg-purple-800/60 hover:bg-purple-700 text-purple-100 rounded border border-purple-600"
            >
              จองคิว
            </button>
          </div>
          {project.demoStartDate && (
            <div className="text-[10px] text-purple-200/80 font-mono">
              📅 {project.demoStartDate} - {project.demoEndDate || 'N/A'}
            </div>
          )}
        </div>
      )}

      {(project.decisionMakers || project.competitors) && (
        <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
          {project.decisionMakers && (
            <div className="line-clamp-1" title={project.decisionMakers}>
              <span className="text-indigo-400 font-medium">👨‍⚕️ อาจารย์:</span> {project.decisionMakers}
            </div>
          )}
          {project.competitors && (
            <div className="line-clamp-1 text-rose-300/90" title={project.competitors}>
              <span className="text-rose-400 font-medium">⚔️ คู่แข่ง:</span> {project.competitors}
            </div>
          )}
        </div>
      )}

      {latestLog ? (
        <div 
          onClick={() => onViewHistory && onViewHistory(project)}
          className="bg-slate-900/90 hover:bg-slate-900 rounded-lg p-2 border-l-2 border-emerald-500 text-[11px] text-slate-300 space-y-0.5 cursor-pointer transition-colors"
          title="คลิกเพื่อดูประวัติความเคลื่อนไหวย้อนหลังทั้งหมด"
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>📝 อัปเดตรายสัปดาห์ ({latestLog.date})</span>
            <span className="text-emerald-300 font-bold">📜 ประวัติ ({logs.length}) ➔</span>
          </div>
          <p className="line-clamp-2 text-slate-200 italic text-[10.5px]">
            "{latestLog.note}"
          </p>
        </div>
      ) : (
        <button
          onClick={() => onViewHistory && onViewHistory(project)}
          className="w-full text-center py-1.5 bg-slate-900/50 hover:bg-slate-900 border border-dashed border-slate-800 rounded-lg text-[10.5px] text-slate-400 transition-colors"
        >
          📜 ยังไม่มีประวัติ (คลิกเพื่อเริ่มบันทึก)
        </button>
      )}

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1 line-clamp-1 max-w-[90px]">
          <span>👤</span> {project.assignee}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewHistory && onViewHistory(project)}
            className="p-1 px-2 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 rounded-md text-[10px] font-bold border border-indigo-700/60 transition-all flex items-center gap-1 shadow-sm"
            title="ดูประวัติความเคลื่อนไหวย้อนหลังทั้งหมด"
          >
            <span>📜 ประวัติ ({logs.length})</span>
          </button>

          <button
            onClick={() => onAddLog(project)}
            className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-md text-[10px] font-medium border border-slate-700"
            title="เพิ่มบันทึกรายสัปดาห์"
          >
            + Log
          </button>

          <div className="relative">
            <button
              onClick={() => setShowQuickMove(!showQuickMove)}
              className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] border border-slate-700"
              title="ย้ายสถานะ"
            >
              ➔
            </button>

            {showQuickMove && (
              <div className="absolute right-0 bottom-7 z-20 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-1 space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 border-b border-slate-800">
                  ย้ายไปยังสถานะ:
                </div>
                {stages.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onMoveProject(project.id, s.id); setShowQuickMove(false); }}
                    className={`w-full text-left px-2 py-1 text-[11px] rounded-md transition-colors ${
                      project.status === s.id ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onEditProject(project)}
            className="p-1 px-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-md text-[10px] border border-emerald-500/30"
            title="แก้ไข"
          >
            ✏️
          </button>

          <button
            onClick={() => onDeleteProject(project.id)}
            className="p-1 px-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded-md text-[10px] border border-rose-500/30"
            title="ลบ"
          >
            🗑️
          </button>
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// Project Add/Edit Modal Component
// ----------------------------------------------------
function ProjectModal({ project, members, stages, products, onSave, onClose }) {
  const [formData, setFormData] = useState(project || {
    hospitalName: '',
    clientType: 'รัฐบาล',
    title: '',
    details: '',
    assignee: members[0] ? members[0].name : '',
    productId: products[0] ? products[0].id : '',
    productName: products[0] ? products[0].name : '',
    productCategory: products[0] ? products[0].category : '',
    productBrand: products[0] ? products[0].brand : 'AERON MEDICAL',
    quantity: 1,
    budget: '',
    budgetType: 'งบลงทุน',
    budgetTrend: 'ขาขึ้น',
    procurementDate: '',
    demoStatus: 'ยังไม่ได้เข้าเดโม่',
    demoStartDate: '',
    demoEndDate: '',
    decisionMakers: '',
    dfAmount: '',
    competitors: '',
    winProbability: 50,
    status: stages[0].id
  });

  const handleProductSelect = (productId) => {
    const selected = products.find(p => p.id === productId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        productId: selected.id,
        productName: selected.name,
        productCategory: selected.category,
        productBrand: selected.brand || 'AERON MEDICAL'
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.title.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาลและชื่องานโครงการ');
      return;
    }
    onSave({
      ...formData,
      budget: Number(formData.budget) || 0,
      quantity: Number(formData.quantity) || 1,
      winProbability: Number(formData.winProbability) || 50
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
            <span>🏥 {project ? 'แก้ไขข้อมูลโครงการ' : 'เพิ่มโครงการโรงพยาบาลใหม่'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">ชื่อโรงพยาบาล / หน่วยงาน <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทลูกค้า</label>
              <select
                value={formData.clientType}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                <option value="รัฐบาล">🏛️ รัฐบาล</option>
                <option value="เอกชน">🏢 เอกชน</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่องาน / รายละเอียดโครงการจัดซื้อ <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น จัดซื้อเครื่องตรวจคลื่นหัวใจไฟฟ้า 12 ลีด 5 เครื่อง"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl space-y-3">
            <div className="text-emerald-300 font-semibold flex items-center justify-between">
              <span>📦 สินค้าเครื่องมือแพทย์ที่เสนอ (Central Catalog)</span>
              <span className="text-[10.5px] font-normal text-slate-400">เลือกจากคลังสินค้าส่วนกลาง</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300">เลือกรุ่นสินค้า</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none focus:border-emerald-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand || 'AERON'}) - {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">จำนวนที่จัดซื้อ (ชุด)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono text-center outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">งบประมาณรวม (บาท) <span className="text-rose-400">*</span></label>
              <input
                type="number"
                required
                placeholder="เช่น 4500000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทงบประมาณ</label>
              <select
                value={formData.budgetType}
                onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                {window.BUDGET_TYPES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium outline-none focus:border-emerald-500"
              >
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ขั้นตอนการติดตาม (Stage)</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <label className="font-semibold">โอกาสได้งาน (%)</label>
                <span className="font-mono text-purple-300 font-bold">{formData.winProbability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.winProbability}
                onChange={(e) => setFormData({ ...formData, winProbability: e.target.value })}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">กำหนดจัดซื้อจัดจ้างเมื่อไหร่</label>
              <input
                type="date"
                value={formData.procurementDate}
                onChange={(e) => setFormData({ ...formData, procurementDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ค่า DF (Doctor Fee / ดำเนินงาน)</label>
              <input
                type="text"
                placeholder="เช่น 150,000 บาท"
                value={formData.dfAmount}
                onChange={(e) => setFormData({ ...formData, dfAmount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-purple-200 font-semibold">
              <span>🧪 สถานะและวันนัดเดโม่เครื่อง (Demo Schedule)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">สถานะเดโม่</label>
                <select
                  value={formData.demoStatus}
                  onChange={(e) => setFormData({ ...formData, demoStatus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="ยังไม่ได้เข้าเดโม่">ยังไม่ได้เข้าเดโม่</option>
                  <option value="นัดหมายแล้ว">นัดหมายแล้ว</option>
                  <option value="กำลังเดโม่">กำลังเดโม่</option>
                  <option value="เดโม่เสร็จสิ้น">เดโม่เสร็จสิ้น</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">วันเริ่มนัดเดโม่</label>
                <input
                  type="date"
                  value={formData.demoStartDate}
                  onChange={(e) => setFormData({ ...formData, demoStartDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">ถึงวันที่ (สิ้นสุด)</label>
                <input
                  type="date"
                  value={formData.demoEndDate}
                  onChange={(e) => setFormData({ ...formData, demoEndDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รายชื่ออาจารย์ที่ตัดสินใจ</label>
              <textarea
                rows="2"
                placeholder="เช่น ศ.ดร.นพ.สมศักดิ์ (หัวหน้าภาควิชา), นพ.วิชัย"
                value={formData.decisionMakers}
                onChange={(e) => setFormData({ ...formData, decisionMakers: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">คู่แข่งเป็นใคร (Competitors)</label>
              <textarea
                rows="2"
                placeholder="เช่น แบรนด์ A (บริษัท เมดิคอลไบโอ), แบรนด์ B"
                value={formData.competitors}
                onChange={(e) => setFormData({ ...formData, competitors: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows="2"
              placeholder="เงื่อนไขสเปก ข้อตกลงพิเศษ หรือข้อคิดเห็นเพิ่มเติม..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-600/30">
              💾 บันทึกโครงการ
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Demo Booking Modal Dialog (with Conflict Detection)
// ----------------------------------------------------
function DemoBookingModal({ prefill, projects, products, members, existingBookings, onSave, onClose }) {
  const [formData, setFormData] = useState({
    projectId: prefill?.projectId || '',
    hospitalName: prefill?.hospitalName || '',
    productId: prefill?.productId || (products[0] ? products[0].id : ''),
    demoSerial: '',
    salesPerson: prefill?.salesPerson || (members[0] ? members[0].name : ''),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'อนุมัติคิว',
    note: ''
  });

  const [conflictWarning, setConflictWarning] = useState('');

  const selectedProduct = products.find(p => p.id === formData.productId);

  useEffect(() => {
    if (!formData.startDate || !formData.endDate || !formData.productId) {
      setConflictWarning('');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    const conflicts = existingBookings.filter(b => {
      if (b.id === formData.id) return false;
      if (b.productId !== formData.productId) return false;

      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);

      return (start <= bEnd && end >= bStart);
    });

    if (conflicts.length > 0) {
      const c = conflicts[0];
      setConflictWarning(`⚠️ คำเตือน: เครื่องรุ่นนี้ถูกจองคิวแล้วโดย ${c.salesPerson} ที่ ${c.hospitalName} ช่วงวันที่ ${c.startDate} ถึง ${c.endDate}`);
    } else {
      setConflictWarning('');
    }
  }, [formData.startDate, formData.endDate, formData.productId, existingBookings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.productId) {
      alert('กรุณากรอกชื่อโรงพยาบาลและเลือกรุ่นสินค้าสาธิต');
      return;
    }

    const prod = products.find(p => p.id === formData.productId);
    onSave({
      ...formData,
      productName: prod ? prod.name : 'เครื่องมือแพทย์ AERON',
      productCategory: prod ? prod.category : 'อุปกรณ์แพทย์'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl animate-modal">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🧪 ระบบจองคิวเครื่องสาธิต (Demo Booking)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        {conflictWarning && (
          <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-start gap-2">
            <span>⚠️</span>
            <div>{conflictWarning}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชื่อโรงพยาบาล / โครงการ <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น โรงพยาบาลศิริราช"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เครื่องสาธิตส่วนกลาง (Product Model) <span className="text-rose-400">*</span></label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  📦 {p.name} (มี {p.demoUnitsAvailable || 1} เครื่อง)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันเริ่มนัดเดโม่</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ถึงวันที่ (สิ้นสุด)</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้จอง / เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
              >
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลขอุปกรณ์ (SN)</label>
              <select
                value={formData.demoSerial}
                onChange={(e) => setFormData({ ...formData, demoSerial: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
              >
                <option value="">-- เลือกหมายเลข SN เครื่อง --</option>
                {selectedProduct && selectedProduct.demoSerialNumbers ? (
                  selectedProduct.demoSerialNumbers.map(sn => (
                    <option key={sn} value={sn}>{sn}</option>
                  ))
                ) : (
                  <option value="AERON-DEMO-01">AERON-DEMO-01</option>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุการประสานงาน / ติดตั้ง</label>
            <textarea
              rows="2"
              placeholder="ระบุสถานที่ แผนก หรือช่างผู้เข้าติดตั้งเครื่อง..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-purple-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium">บันทึกการจองคิว</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Product Master Modal Component (Create / Edit Product & Demo Units)
// ----------------------------------------------------
function ProductModal({ product, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (product) {
      return {
        id: product.id,
        category: product.category || window.PRODUCT_CATEGORIES[0],
        name: product.name || '',
        brand: product.brand || 'AERON MEDICAL',
        price: product.price || '',
        description: product.description || ''
      };
    }
    return {
      category: window.PRODUCT_CATEGORIES[0],
      name: '',
      brand: 'AERON MEDICAL',
      price: '',
      description: ''
    };
  });

  const [demoUnits, setDemoUnits] = useState(() => {
    if (product && product.demoUnits && product.demoUnits.length > 0) {
      return product.demoUnits.map(u => ({ ...u }));
    }
    if (product && product.demoSerialNumbers && product.demoSerialNumbers.length > 0) {
      return product.demoSerialNumbers.map(sn => ({ sn, status: 'พร้อมใช้งาน', location: '', accessories: '' }));
    }
    return [{ sn: '', status: 'พร้อมใช้งาน', location: '', accessories: '' }];
  });

  const handleAddUnit = () => {
    setDemoUnits([...demoUnits, { sn: '', status: 'พร้อมใช้งาน', location: '', accessories: '' }]);
  };

  const handleRemoveUnit = (idx) => {
    setDemoUnits(demoUnits.filter((_, i) => i !== idx));
  };

  const handleUnitChange = (idx, field, value) => {
    setDemoUnits(demoUnits.map((u, i) => i === idx ? { ...u, [field]: value } : u));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อรุ่นสินค้า');
      return;
    }
    const validUnits = demoUnits.filter(u => u.sn && u.sn.trim());
    onSave({
      ...formData,
      price: Number(formData.price) || 0,
      demoUnitsAvailable: validUnits.length || 1,
      demoSerialNumbers: validUnits.map(u => u.sn),
      demoUnits: validUnits
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>📦 {product ? 'แก้ไขข้อมูลสินค้า & เครื่องสาธิต' : 'เพิ่มชนิดสินค้าใหม่'} (Central Demo Catalog)</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมวดหมู่/ประเภทสินค้า</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              {window.PRODUCT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อรุ่นสินค้า (Model) <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น AERON Cardio 12L-AI"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">แบรนด์/บริษัท</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500 font-semibold text-emerald-300"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ราคาประมาณการ (บาท THB)</label>
            <input
              type="number"
              placeholder="เช่น 900000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">รายละเอียดสินค้า</label>
            <textarea
              rows="2"
              placeholder="คำอธิบายจุดเด่นสินค้า สเปกคร่าวๆ..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                  <span>🧪 รายการเครื่องสาธิตเดโม่ ({demoUnits.length} เครื่อง)</span>
                </label>
                <p className="text-[10.5px] text-slate-400">กำหนดหมายเลข SN, สถานะเครื่อง, ที่อยู่ปัจจุบัน และอุปกรณ์ประกอบในชุด</p>
              </div>
              <button
                type="button"
                onClick={handleAddUnit}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1 transition-all"
              >
                <span>➕ เพิ่มเครื่อง Demo</span>
              </button>
            </div>

            <div className="space-y-3">
              {demoUnits.map((unit, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 relative hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <span>📦</span> <span>เครื่องเดโม่ตัวที่ {idx + 1}</span>
                    </span>
                    {demoUnits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUnit(idx)}
                        className="text-rose-400 text-xs hover:text-rose-300 px-2 py-0.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-center gap-1"
                      >
                        <span>🗑️ ลบเครื่องนี้</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">หมายเลข SN เครื่อง <span className="text-rose-400">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น AERON-DEMO-ECG-01"
                        value={unit.sn}
                        onChange={(e) => handleUnitChange(idx, 'sn', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-mono text-xs focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold">สถานะเครื่องเดโม่</label>
                      <select
                        value={unit.status || 'พร้อมใช้งาน'}
                        onChange={(e) => handleUnitChange(idx, 'status', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none font-semibold"
                      >
                        <option value="พร้อมใช้งาน">✅ พร้อมใช้งาน</option>
                        <option value="ส่งซ่อม">🔧 ส่งซ่อม</option>
                        <option value="เสีย">❌ เสีย</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">📍 ที่อยู่ / สถานที่ประจำการเครื่องขณะนี้</label>
                    <input
                      type="text"
                      placeholder="เช่น สำนักงาน AERON กรุงเทพฯ / โรงพยาบาลศิริราช (ยืมสาธิต)"
                      value={unit.location || ''}
                      onChange={(e) => handleUnitChange(idx, 'location', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">🧰 รายละเอียดสินค้า / อุปกรณ์ประกอบในชุด</label>
                    <textarea
                      rows="2"
                      placeholder="เช่น สาย Lead 10 เส้น, กระดาษบันทึก 5 ม้วน, คู่มือภาษาไทย, กระเป๋าหิ้ว..."
                      value={unit.accessories || ''}
                      onChange={(e) => handleUnitChange(idx, 'accessories', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-100 outline-none"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30">
              บันทึกข้อมูลสินค้า & เครื่องเดโม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Project History & Timeline View Modal Component
// ----------------------------------------------------
function ProjectHistoryModal({ project, members, stages, products, onAddLog, onClose }) {
  const [newLogNote, setNewLogNote] = useState('');
  const [logAuthor, setLogAuthor] = useState(project.assignee);
  const [logSearchQuery, setLogSearchQuery] = useState('');

  const currentStageObj = stages.find(s => s.id === project.status) || { title: project.status, badgeColor: 'bg-slate-800 text-slate-300' };

  // Filtered Logs
  const logs = project.weeklyLogs || [];
  const filteredLogs = useMemo(() => {
    if (!logSearchQuery.trim()) return logs;
    const q = logSearchQuery.toLowerCase();
    return logs.filter(l => (l.note || '').toLowerCase().includes(q) || (l.author || '').toLowerCase().includes(q) || (l.date || '').toLowerCase().includes(q));
  }, [logs, logSearchQuery]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newLogNote.trim()) return;
    onAddLog(project.id, newLogNote, logAuthor);
    setNewLogNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-6 space-y-5 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStageObj.badgeColor}`}>
                {currentStageObj.title}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                🎯 โอกาสได้งาน {project.winProbability}%
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {project.clientType === 'รัฐบาล' ? '🏛️ รัฐบาล' : '🏢 เอกชน'}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mt-1">
              <span>🏥 {project.hospitalName}</span>
            </h3>
            <p className="text-sm font-semibold text-emerald-300 line-clamp-1">{project.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">💰 งบประมาณโครงการ:</span>
            <span className="text-amber-400 font-bold text-base font-mono">{formatCurrency(project.budget)}</span>
            <span className="text-[10px] text-slate-500 block">({project.budgetType})</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">📦 รุ่นสินค้าที่เสนอ:</span>
            <span className="text-emerald-300 font-bold text-sm line-clamp-1">{project.productName || 'ไม่ระบุ'}</span>
            <span className="text-[10px] text-slate-500 block">จำนวน {project.quantity || 1} ชุด</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">👤 เซลส์ผู้รับผิดชอบ:</span>
            <span className="text-white font-bold text-sm">{project.assignee}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">📅 กำหนดจัดซื้อ:</span>
            <span className="text-cyan-300 font-mono font-bold text-sm">{project.procurementDate || 'N/A'}</span>
          </div>
        </div>

        {/* Quick Add Log Form inside History Modal */}
        <form onSubmit={handleAddSubmit} className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>✍️ บันทึก Progress ความเคลื่อนไหวประจำสัปดาห์ใหม่</span>
            </label>
            <select
              value={logAuthor}
              onChange={(e) => setLogAuthor(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="พิมพ์รายละเอียดกิจกรรม / การเข้าพบลูกค้าสัปดาห์นี้..."
              value={newLogNote}
              onChange={(e) => setNewLogNote(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-emerald-500"
            />
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex-shrink-0">
              + บันทึก Log
            </button>
          </div>
        </form>

        {/* History Timeline Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <span>📜 ประวัติความเคลื่อนไหวย้อนหลัง (Activity Timeline History)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
                {logs.length} บันทึก
              </span>
            </h4>

            {logs.length > 0 && (
              <input
                type="text"
                placeholder="ค้นหาในประวัติ..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            )}
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-xs">
              {logSearchQuery ? 'ไม่พบบันทึกที่ตรงกับคำค้นหา' : 'ยังไม่มีประวัติการอัปเดตย้อนหลัง สามารถพิมพ์บันทึกแรกได้ที่ช่องด้านบน'}
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {filteredLogs.map((log, index) => (
                <div key={index} className="relative group">
                  {/* Timeline node icon */}
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md shadow-emerald-500/50"></div>
                  
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-xs border-b border-slate-900/80 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-300">👤 {log.author || project.assignee}</span>
                        <span className="text-[10.5px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                          {log.date}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        #{filteredLogs.length - index}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed pt-1 whitespace-pre-wrap">
                      {log.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extra Information Reference */}
        {(project.decisionMakers || project.competitors || project.torDetails || project.details) && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h5 className="font-bold text-slate-300">📋 ข้อมูลประกอบโครงการ</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              {project.decisionMakers && (
                <div><span className="text-indigo-400 font-semibold">👨‍⚕️ ผู้ตัดสินใจ:</span> {project.decisionMakers}</div>
              )}
              {project.competitors && (
                <div><span className="text-rose-400 font-semibold">⚔️ คู่แข่ง:</span> {project.competitors}</div>
              )}
              {project.dfAmount && (
                <div><span className="text-purple-300 font-semibold">💵 ค่า DF:</span> {project.dfAmount}</div>
              )}
              {project.demoStatus && (
                <div><span className="text-purple-300 font-semibold">🧪 สถานะเดโม่:</span> {project.demoStatus} ({project.demoStartDate || 'N/A'})</div>
              )}
            </div>
            {project.details && (
              <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                "{project.details}"
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700"
          >
            🖨️ พิมพ์ประวัติความเคลื่อนไหว
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------
// Weekly Progress Log Modal & Member Modal
// ----------------------------------------------------
function WeeklyLogModal({ project, members, onSave, onClose }) {
  const [note, setNote] = useState('');
  const [author, setAuthor] = useState(project.assignee);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    onSave(note, author);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 space-y-4 shadow-2xl animate-modal">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-100 text-base">📝 อัปเดต Progress รายสัปดาห์</h3>
            <p className="text-xs text-emerald-300 line-clamp-1">{project.hospitalName} - {project.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ผู้บันทึกข้อความ</label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">รายละเอียดความคืบหน้าสัปดาห์นี้ <span className="text-rose-400">*</span></label>
            <textarea
              rows="3"
              required
              placeholder="ระบุสิ่งที่เข้าดำเนินการ เช่น เข้าพบอาจารย์, ยื่นเอกสาร TOR, ส่งเครื่องเดโม่..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium">บันทึก Log</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberManagementModal({ members, setMembers, onClose }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Sales Specialist');
  const [avatar, setAvatar] = useState('👨‍⚕️');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newMember = {
      id: 'm-' + Date.now(),
      name,
      role,
      avatar
    };
    setMembers([...members, newMember]);
    setName('');
  };

  const handleDelete = (id) => {
    if (window.confirm('ลบสมาชิกท่านนี้ใช่หรือไม่?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-modal">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base">👥 จัดการรายชื่อสมาชิกในทีม</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{m.avatar}</span>
                <div>
                  <div className="font-semibold text-white">{m.name}</div>
                  <div className="text-[10px] text-slate-400">{m.role}</div>
                </div>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-rose-400 p-1.5 rounded-lg">🗑️</button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddMember} className="space-y-2 pt-2 border-t border-slate-800 text-xs">
          <h4 className="font-semibold text-slate-300">➕ เพิ่มสมาชิกคนใหม่</h4>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="text"
              required
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none"
            >
              <option value="Sales Specialist">Sales</option>
              <option value="Medical Representative">Med Rep</option>
              <option value="Product Specialist">Product Spec</option>
              <option value="Key Account Manager">KAM</option>
            </select>
            <select
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 outline-none text-center"
            >
              <option value="👨‍⚕️">👨‍⚕️</option>
              <option value="👩‍⚕️">👩‍⚕️</option>
              <option value="👨‍💼">👨‍💼</option>
              <option value="👩‍💼">👩‍💼</option>
              <option value="🧑‍💻">🧑‍💻</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium mt-2">
            + บันทึกเพิ่มสมาชิก
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Repair & Service Center View Component
// ----------------------------------------------------
function RepairServiceView({ repairTickets, products, members, onOpenNewTicket, onEditTicket, onDeleteTicket, onViewInCatalog }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return repairTickets.filter(t => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mNo = (t.ticketNumber || '').toLowerCase().includes(q);
        const mProd = (t.productName || '').toLowerCase().includes(q);
        const mSN = (t.sn || '').toLowerCase().includes(q);
        const mHosp = (t.lastHospital || '').toLowerCase().includes(q);
        const mSales = (t.salesPerson || '').toLowerCase().includes(q);
        const mVendor = (t.repairVendor || '').toLowerCase().includes(q);
        return mNo || mProd || mSN || mHosp || mSales || mVendor;
      }
      return true;
    });
  }, [repairTickets, filterCategory, filterStatus, searchQuery]);

  // Metrics KPI
  const totalTickets = filteredTickets.length;
  const inRepairCount = filteredTickets.filter(t => t.status === 'ส่งซ่อมอยู่' || t.status === 'รอส่งซ่อม' || t.status === 'ระหว่างขนส่ง').length;
  const completedCount = filteredTickets.filter(t => t.status === 'ซ่อมเสร็จแล้ว' || t.status === 'ส่งคืนลูกค้า').length;
  const totalRepairCost = filteredTickets.reduce((sum, t) => sum + (Number(t.repairCost) || 0), 0);
  const totalShippingCost = filteredTickets.reduce((sum, t) => sum + (Number(t.shippingCost) || 0), 0);

  const statusColors = {
    'รอส่งซ่อม': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'ส่งซ่อมอยู่': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'ระหว่างขนส่ง': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'ซ่อมเสร็จแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    'ส่งคืนลูกค้า': 'bg-blue-500/20 text-blue-300 border-blue-500/40'
  };

  const categoryColors = {
    'สินค้า Demo': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'สินค้าส่งซ่อมจาก รพ': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'สินค้าอยู่ในประกันของ บริษัท': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'สินค้า นอกประกันของบริษัท': 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-2xl shadow-inner">
            🔧
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ศูนย์ซ่อม & เคลมสินค้า (Repair Service & Claims)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                AERON SERVICE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามตารางสินค้าส่งซ่อม ทั้งเครื่อง Demo, สินค้าส่งซ่อมจาก รพ., สินค้าในประกัน และนอกประกัน
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewTicket(null)}
          className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ แจ้งเปิดใบส่งซ่อมใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🔧 รวมเคสส่งซ่อมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight font-mono">
            {totalTickets} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ประวัติงานซ่อมและเคลมสินค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>⏳ อยู่ระหว่างการซ่อม/ขนส่ง</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">⚙️</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {inRepairCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ยังไม่ได้รับของคืนจากศูนย์ซ่อม
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>✅ ซ่อมเสร็จ / ส่งคืนแล้ว</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">🎉</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {completedCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            พร้อมกลับมาใช้งาน / ส่งคืน รพ.
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💰 รวมค่าใช้จ่ายซ่อม & ขนส่ง</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalRepairCost + totalShippingCost)}
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>ค่าซ่อม: {formatShortCurrency(totalRepairCost)}</span>
            <span>ค่าส่ง: {formatShortCurrency(totalShippingCost)}</span>
          </div>
        </div>

      </div>

      {/* Controls & Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางรายการสินค้าส่งซ่อม (Repair Orders List)</span>
            </h3>
            <p className="text-xs text-slate-400">ตรวจสอบรายละเอียดอาการเสีย สถานะการซ่อม และอุปกรณ์ในเซ็ต</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา เลขซ่อม / SN / รุ่น / รพ...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตาม Category ทุกประเภท</option>
              {window.REPAIR_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะ</option>
              {window.REPAIR_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Repair Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ซ่อม / ประเภท</th>
                <th className="p-3">รุ่นสินค้า & หมายเลข SN</th>
                <th className="p-3">ชิ้นส่วนส่งซ่อม & อาการเสีย</th>
                <th className="p-3">รพ.ใช้ล่าสุด & ผู้ใช้ / เซลส์</th>
                <th className="p-3">ส่งซ่อมกับเจ้าไหน / ที่อยู่เครื่อง</th>
                <th className="p-3 text-right">ค่าซ่อม / ขนส่ง</th>
                <th className="p-3 text-center">สถานะ</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการสินค้าส่งซ่อมตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => {
                  const catStyle = categoryColors[ticket.category] || 'bg-slate-800 text-slate-300';
                  const stStyle = statusColors[ticket.status] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Ticket Number & Category */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-rose-300">{ticket.ticketNumber}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-semibold border ${catStyle}`}>
                          {ticket.category}
                        </span>
                        <div className="text-[9.5px] text-slate-400 font-mono mt-1">📅 ส่ง: {ticket.sentDate || 'N/A'}</div>
                        {ticket.returnedDate && (
                          <div className="text-[9.5px] text-emerald-300 font-mono">📅 รับ: {ticket.returnedDate}</div>
                        )}
                      </td>

                      {/* Product Name & SN */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{ticket.productName}</div>
                        <div className="text-[10px] text-slate-400">{ticket.productCategory}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-amber-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          SN: {ticket.sn || 'ไม่ระบุ'}
                        </div>
                      </td>

                      {/* Repaired Items & Issue */}
                      <td className="p-3 max-w-xs">
                        <div className="font-semibold text-slate-200 leading-snug">
                          🧰 <span className="text-slate-300">{ticket.repairedItems || 'ตัวเครื่องหลัก'}</span>
                        </div>
                        <div className="text-[11px] text-rose-300/90 italic mt-1 line-clamp-2 bg-rose-950/30 p-1.5 rounded border border-rose-900/40">
                          ❌ "{ticket.issueDescription}"
                        </div>
                      </td>

                      {/* Last Hospital & User / Sales */}
                      <td className="p-3">
                        <div className="font-semibold text-emerald-300">🏥 {ticket.lastHospital || 'สำนักงาน AERON'}</div>
                        {ticket.lastUser && (
                          <div className="text-[10.5px] text-slate-300">👤 ผู้ใช้: {ticket.lastUser}</div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">💼 เซลส์: {ticket.salesPerson}</div>
                      </td>

                      {/* Repair Vendor & Location */}
                      <td className="p-3">
                        <div className="font-semibold text-purple-300">🏭 {ticket.repairVendor || 'ศูนย์ซ่อมทั่วไป'}</div>
                        <div className="text-[10.5px] text-slate-300 flex items-start gap-1 mt-0.5">
                          <span>📍</span> <span className="line-clamp-2">{ticket.location || 'ศูนย์ซ่อม'}</span>
                        </div>
                      </td>

                      {/* Costs */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400">{formatCurrency(ticket.repairCost)}</div>
                        {ticket.shippingCost > 0 && (
                          <div className="text-[10px] text-slate-400">+ ส่ง {formatCurrency(ticket.shippingCost)}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${stStyle}`}>
                          {ticket.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-y-1">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => onEditTicket(ticket)}
                            className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                            title="แก้ไขใบส่งซ่อม"
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                            title="ลบ"
                          >
                            🗑️
                          </button>
                        </div>
                        {ticket.category === 'สินค้า Demo' && (
                          <button
                            onClick={() => onViewInCatalog(ticket.productName)}
                            className="w-full text-[10px] px-2 py-0.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 rounded border border-emerald-700/50 block font-semibold"
                            title="ไปที่หน้าคลัง Demo"
                          >
                            📦 ดูในคลัง Demo
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ----------------------------------------------------
// Repair Ticket Create/Edit Modal Component
// ----------------------------------------------------
function RepairTicketModal({ ticket, products, members, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (ticket) return { ...ticket };
    const firstProd = products[0] || {};
    const firstSN = firstProd.demoSerialNumbers ? firstProd.demoSerialNumbers[0] : '';
    return {
      ticketNumber: `REP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      productCategory: firstProd.category || window.PRODUCT_CATEGORIES[0],
      productName: firstProd.name || '',
      sn: firstSN || '',
      repairedItems: 'ตัวเครื่องหลัก และ อุปกรณ์มาตรฐาน',
      issueDescription: '',
      lastHospital: '',
      lastUser: '',
      salesPerson: members[0] ? members[0].name : '',
      repairVendor: 'AERON Service Center (กรุงเทพฯ)',
      sentDate: new Date().toISOString().split('T')[0],
      returnedDate: '',
      repairCost: 0,
      shippingCost: 0,
      category: window.REPAIR_CATEGORIES[0],
      status: window.REPAIR_STATUSES[0],
      location: 'ศูนย์ซ่อม AERON Service Center (กรุงเทพฯ)'
    };
  });

  const handleProductSelect = (pName) => {
    const p = products.find(prod => prod.name === pName);
    if (p) {
      const snList = p.demoSerialNumbers || [];
      setFormData(prev => ({
        ...prev,
        productName: p.name,
        productCategory: p.category,
        sn: snList[0] || prev.sn
      }));
    } else {
      setFormData(prev => ({ ...prev, productName: pName }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.issueDescription.trim()) {
      alert('กรุณากรอกชื่อรุ่นสินค้าและอาการเสีย');
      return;
    }
    onSave({
      ...formData,
      repairCost: Number(formData.repairCost) || 0,
      shippingCost: Number(formData.shippingCost) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🔧 {ticket ? 'แก้ไขใบส่งซ่อม' : 'เปิดใบส่งซ่อมใหม่ (Repair Service Ticket)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ใบส่งซ่อม <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.ticketNumber}
                onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-rose-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category สินค้าที่ส่งซ่อม</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              >
                {window.REPAIR_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้าที่ส่งซ่อม <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                list="products-list"
                placeholder="เลือกหรือพิมพ์ชื่อรุ่นสินค้า"
                value={formData.productName}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
              <datalist id="products-list">
                {products.map(p => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลข SN เครื่อง</label>
              <input
                type="text"
                placeholder="เช่น AERON-DEMO-ECG-01"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชิ้นส่วน หรือ อุปกรณ์ในเซ็ต ที่ส่งซ่อม <span className="text-rose-400">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น ตัวเครื่องหลัก, หัวโพรบ Linear Probe, สาย Lead 10 เส้น, แท่นชาร์จ..."
              value={formData.repairedItems}
              onChange={(e) => setFormData({ ...formData, repairedItems: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">อาการเสีย / สิ่งที่ชำรุด <span className="text-rose-400">*</span></label>
            <textarea
              rows="2"
              required
              placeholder="อธิบายอาการเสียโดยละเอียด เช่น ชาร์จไฟไม่เข้า, หน้าจอไม่ติด, สายขาด..."
              value={formData.issueDescription}
              onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-rose-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ใช้ครั้งสุดท้ายจาก รพ. ไหน</label>
              <input
                type="text"
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.lastHospital}
                onChange={(e) => setFormData({ ...formData, lastHospital: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ระบุตัวคนใช้ / อาจารย์ผู้ใช้</label>
              <input
                type="text"
                placeholder="เช่น พญ.สมศรี / พยาบาล ER"
                value={formData.lastUser}
                onChange={(e) => setFormData({ ...formData, lastUser: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ที่รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ส่งซ่อมกับเจ้าไหน / ศูนย์ซ่อม</label>
              <input
                type="text"
                placeholder="เช่น AERON Service Center (ไทย) / Drager Germany"
                value={formData.repairVendor}
                onChange={(e) => setFormData({ ...formData, repairVendor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ที่อยู่ / สถานที่ประจำเครื่องปัจจุบัน</label>
              <input
                type="text"
                placeholder="เช่น ศูนย์ซ่อม AERON กรุงเทพฯ / คลังสินค้า"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ส่งเข้าซ่อม</label>
              <input
                type="date"
                value={formData.sentDate}
                onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ได้รับของคืน (Expected Return)</label>
              <input
                type="date"
                value={formData.returnedDate}
                onChange={(e) => setFormData({ ...formData, returnedDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าใช้จ่ายในการซ่อม (บาท)</label>
              <input
                type="number"
                value={formData.repairCost}
                onChange={(e) => setFormData({ ...formData, repairCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าขนส่ง (บาท)</label>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">สถานะการส่งซ่อม</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-bold outline-none"
              >
                {window.REPAIR_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30">
              บันทึกใบส่งซ่อม
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Delivered / Sold Products & Warranty View Component
// ----------------------------------------------------
function SoldProductsView({ soldProducts, projects, members, onOpenNewAsset, onEditAsset, onDeleteAsset }) {
  const [filterYear, setFilterYear] = useState('all');
  const [filterSales, setFilterSales] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewAsset, setPreviewAsset] = useState(null);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return soldProducts.filter(a => {
      if (filterYear !== 'all') {
        const yr = a.deliveryDate ? new Date(a.deliveryDate).getFullYear() : 2026;
        if (Number(yr) !== Number(filterYear)) return false;
      }
      if (filterSales !== 'all' && a.salesPerson !== filterSales) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mAsset = (a.assetNumber || '').toLowerCase().includes(q);
        const mContract = (a.contractNumber || '').toLowerCase().includes(q);
        const mHosp = (a.hospitalName || '').toLowerCase().includes(q);
        const mProd = (a.productName || '').toLowerCase().includes(q);
        const mBrand = (a.brand || '').toLowerCase().includes(q);
        const mSN = (a.serialNumber || '').toLowerCase().includes(q);
        const mSales = (a.salesPerson || '').toLowerCase().includes(q);
        return mAsset || mContract || mHosp || mProd || mBrand || mSN || mSales;
      }
      return true;
    });
  }, [soldProducts, filterYear, filterSales, searchQuery]);

  // Metrics KPI
  const totalDeliveredValue = filteredAssets.reduce((sum, a) => sum + (Number(a.projectValue) || 0), 0);
  const totalGuaranteeAmount = filteredAssets.reduce((sum, a) => sum + (Number(a.bidGuaranteeAmount) || 0), 0);
  const totalAssetsCount = filteredAssets.length;
  const pmDueCount = filteredAssets.filter(a => a.pmStatus === '⏳ ถึงกำหนดทำ PM' || a.pmStatus === '🚨 เลยกำหนด PM').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            🏆
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ฐานข้อมูลสินค้าที่ขายแล้ว & ประกันสินค้า (Delivered Assets & Warranty)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                INSTALLED BASE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามสินค้าที่ส่งมอบและตรวจรับแล้ว การรับคืนเงินค้ำประกันซอง วันหมดประกัน และรอบ PM บำรุงรักษา
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewAsset(null)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ เพิ่มรายการส่งมอบสินค้า</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💎 มูลค่างานส่งมอบรวมทั้งหมด</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalDeliveredValue)}
          </div>
          <div className="text-[11px] text-slate-400">
            จากทั้งหมด {totalAssetsCount} สัญญาจัดซื้อ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🛡️ รวมเงินค้ำประกันซอง/สัญญา</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">💵</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {formatCurrency(totalGuaranteeAmount)}
          </div>
          <div className="text-[11px] text-slate-400">
            เงินประกันสัญญาที่รอรับคืนจาก รพ.
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🩺 เครื่องที่ติดตั้งใช้งานจริง</span>
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-300">🏥</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-300 tracking-tight font-mono">
            {totalAssetsCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ติดตั้ง ณ โรงพยาบาลคู่ค้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>⚙️ กำหนดทำ PM บำรุงรักษา</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">📅</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {pmDueCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ถึงรอบ Preventive Maintenance
          </div>
        </div>

      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางรายการสินค้าที่ขายแล้ว (Delivered Assets List)</span>
            </h3>
            <p className="text-xs text-slate-400">รายละเอียดสินค้า ของแถม มูลค่างาน ค่า DF เงินประกันซอง และกำหนด PM</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา รพ. / เครื่อง / SN / เซลส์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามปีที่ส่งมอบ (ทุกปี)</option>
              <option value="2026">ส่งมอบปี 2026 (2569)</option>
              <option value="2025">ส่งมอบปี 2025 (2568)</option>
              <option value="2024">ส่งมอบปี 2024 (2567)</option>
            </select>

            <select
              value={filterSales}
              onChange={(e) => setFilterSales(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามเซลส์ผู้รับผิดชอบ</option>
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Delivered Assets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขรหัสสินค้า / วันส่งมอบ</th>
                <th className="p-3">โรงพยาบาล & ผู้ติดต่อ / เซลส์</th>
                <th className="p-3">ยี่ห้อ & รุ่นสินค้า / หมายเลข SN</th>
                <th className="p-3">🎁 รายการของแถม</th>
                <th className="p-3 text-right">มูลค่างาน & ค่า DF</th>
                <th className="p-3 text-right">เงินประกันซอง & วันคืน</th>
                <th className="p-3 text-center">หมดประกัน & รอบ PM</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการสินค้าที่ขายแล้วตรงตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredAssets.map(asset => {
                  const isWarrantyActive = new Date(asset.warrantyExpiryDate) >= new Date();

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Asset Number & Delivery Date */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-emerald-300">{asset.assetNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">สัญญา: {asset.contractNumber || 'N/A'}</div>
                        <div className="text-[9.5px] text-amber-300 font-mono mt-1">🚚 ส่งมอบ: {asset.deliveryDate}</div>
                      </td>

                      {/* Hospital & Sales */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">🏥 {asset.hospitalName}</div>
                        {asset.department && (
                          <div className="text-[10.5px] text-slate-300">📍 {asset.department}</div>
                        )}
                        {asset.contactPerson && (
                          <div className="text-[10px] text-slate-400">👨‍⚕️ {asset.contactPerson}</div>
                        )}
                        <div className="text-[10.5px] text-emerald-300 font-medium mt-0.5">💼 เซลส์: {asset.salesPerson}</div>
                      </td>

                      {/* Brand & Model & SN */}
                      <td className="p-3">
                        <div className="font-bold text-white">{asset.productName}</div>
                        <div className="text-[10px] text-indigo-300">แบรนด์: {asset.brand || 'AERON MEDICAL'}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-amber-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          SN: {asset.serialNumber || 'ไม่ระบุ'}
                        </div>
                      </td>

                      {/* Freebies */}
                      <td className="p-3 max-w-xs">
                        {asset.freebies ? (
                          <div className="text-[11px] text-slate-300 leading-snug bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                            🎁 <span className="text-slate-200">{asset.freebies}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[10.5px]">ไม่มีของแถม</span>
                        )}
                      </td>

                      {/* Project Value & DF */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-emerald-400 text-sm">{formatCurrency(asset.projectValue)}</div>
                        <div className="text-[10px] text-purple-300 font-medium">DF: {asset.dfAmount || 'ไม่ระบุ'}</div>
                      </td>

                      {/* Bid Guarantee & Refund Date */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-amber-400">{formatCurrency(asset.bidGuaranteeAmount)}</div>
                        <div className="text-[10px] text-slate-400">
                          📅 คืนเงิน: <span className="text-amber-300 font-semibold">{asset.bidGuaranteeRefundDate || 'ไม่ระบุ'}</span>
                        </div>
                      </td>

                      {/* Warranty & PM Status */}
                      <td className="p-3 text-center space-y-1">
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isWarrantyActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {isWarrantyActive ? `🛡️ ประกันถึง ${asset.warrantyExpiryDate}` : `❌ หมดประกัน (${asset.warrantyExpiryDate})`}
                          </span>
                        </div>

                        <div className="pt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            ⚙️ PM ถัดไป: {asset.nextPmDate || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewAsset(asset)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบรับมอบ"
                        >
                          👁️ ดู
                        </button>
                        <button
                          onClick={() => onEditAsset(asset)}
                          className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs rounded-lg border border-indigo-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteAsset(asset.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Certificate / Delivery Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                  DELIVERY & WARRANTY CERTIFICATE
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewAsset.assetNumber}</h3>
                <p className="text-xs text-slate-400">เลขที่สัญญา: {previewAsset.contractNumber}</p>
              </div>
              <button onClick={() => setPreviewAsset(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">โรงพยาบาล / ลูกค้า:</div>
                <div className="font-bold text-emerald-300 text-sm mt-0.5">{previewAsset.hospitalName}</div>
                <div className="text-slate-400">แผนก: {previewAsset.department}</div>
                <div className="text-slate-400">ผู้ติดต่อ: {previewAsset.contactPerson}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการส่งมอบ:</div>
                <div className="text-amber-300 font-semibold mt-0.5">📅 วันส่งมอบ: {previewAsset.deliveryDate}</div>
                <div className="text-slate-300">💼 เซลส์: {previewAsset.salesPerson}</div>
                <div className="text-slate-300 font-mono font-bold">💰 มูลค่างาน: {formatCurrency(previewAsset.projectValue)}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📦 รายละเอียดสินค้า & ของแถมที่ได้รับ</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>รุ่นสินค้า: <span className="font-bold text-white">{previewAsset.productName}</span></div>
                <div>แบรนด์: <span className="text-indigo-300">{previewAsset.brand}</span></div>
                <div>Serial Number: <span className="font-mono text-amber-300 font-bold">{previewAsset.serialNumber}</span></div>
                <div>ค่า DF: <span className="text-purple-300 font-semibold">{previewAsset.dfAmount}</span></div>
              </div>
              <div className="pt-2 border-t border-slate-900 text-slate-300">
                <span className="font-bold text-emerald-300">🎁 ของแถม / รายการอุปกรณ์ประกอบ:</span>
                <p className="text-slate-200 mt-0.5 italic">{previewAsset.freebies || 'ไม่มีของแถม'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div>
                <div className="text-amber-400 font-bold">🛡️ เงินค้ำประกันซอง / สัญญา:</div>
                <div className="text-lg font-mono font-bold text-amber-300">{formatCurrency(previewAsset.bidGuaranteeAmount)}</div>
                <div className="text-slate-400">📅 กำหนดรับเงินคืน: <span className="text-white font-semibold">{previewAsset.bidGuaranteeRefundDate}</span></div>
              </div>
              <div>
                <div className="text-purple-300 font-bold">⚙️ การรับประกัน & รอบ PM:</div>
                <div className="text-slate-200">วันหมดประกัน: <span className="font-semibold text-emerald-300">{previewAsset.warrantyExpiryDate}</span></div>
                <div className="text-slate-200">วันทำ PM ถัดไป: <span className="font-semibold text-purple-300">{previewAsset.nextPmDate}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์เอกสารรับมอบ
              </button>
              <button onClick={() => setPreviewAsset(null)} className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------
// Delivered Product Create/Edit Modal Component
// ----------------------------------------------------
function SoldProductModal({ asset, projects, members, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (asset) return { ...asset };
    const wonProj = projects.find(p => p.status === 'stage_delivery' || p.status === 'stage_completed') || projects[0] || {};
    const delivDate = new Date().toISOString().split('T')[0];
    const delivYr = new Date().getFullYear();

    return {
      assetNumber: `AST-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      contractNumber: `PO-HOSP-${delivYr}/${Math.floor(Math.random() * 80) + 10}`,
      projectId: wonProj.id || '',
      hospitalName: wonProj.hospitalName || '',
      department: 'แผนกห้องผ่าตัด / CCU',
      productName: wonProj.productName || 'เครื่องมือแพทย์ AERON',
      brand: wonProj.productBrand || 'AERON MEDICAL',
      productCategory: wonProj.productCategory || 'อุปกรณ์แพทย์',
      serialNumber: `SN-AERON-${Math.floor(Math.random() * 899999) + 100000}`,
      freebies: 'กระดาษบันทึกมาตรฐาน 10 ม้วน, สายสัญญาณสำรอง, รถเข็นสแตนเลส',
      salesPerson: wonProj.assignee || (members[0] ? members[0].name : ''),
      contactPerson: wonProj.decisionMakers || '',
      deliveryDate: delivDate,
      projectValue: wonProj.budget || 1000000,
      dfAmount: wonProj.dfAmount || '100,000 บาท',
      bidGuaranteeAmount: Math.round((wonProj.budget || 1000000) * 0.05),
      bidGuaranteeRefundDate: `${delivYr}-12-15`,
      warrantyYears: 1,
      warrantyExpiryDate: `${delivYr + 1}-${delivDate.substring(5)}`,
      nextPmDate: `${delivYr}-12-15`,
      pmFrequency: 'ทุก 6 เดือน (ปีละ 2 ครั้ง)',
      pmStatus: '⏳ ถึงกำหนดทำ PM',
      status: 'รับมอบเรียบร้อย'
    };
  });

  const handleProjectSelect = (pId) => {
    const p = projects.find(x => x.id === pId);
    if (p) {
      setFormData(prev => ({
        ...prev,
        projectId: p.id,
        hospitalName: p.hospitalName,
        productName: p.productName || prev.productName,
        salesPerson: p.assignee || prev.salesPerson,
        projectValue: p.budget || prev.projectValue,
        dfAmount: p.dfAmount || prev.dfAmount,
        bidGuaranteeAmount: Math.round((p.budget || prev.projectValue) * 0.05)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hospitalName.trim() || !formData.productName.trim()) {
      alert('กรุณากรอกชื่อโรงพยาบาลและชื่อรุ่นสินค้า');
      return;
    }
    onSave({
      ...formData,
      projectValue: Number(formData.projectValue) || 0,
      bidGuaranteeAmount: Number(formData.bidGuaranteeAmount) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>📦 {asset ? 'แก้ไขข้อมูลสินค้าที่ขายแล้ว' : 'บันทึกการส่งมอบสินค้าใหม่ (Delivered Asset)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รหัสครุภัณฑ์ / Asset Code <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.assetNumber}
                onChange={(e) => setFormData({ ...formData, assetNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่สัญญา / PO โรงพยาบาล</label>
              <input
                type="text"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">เชื่อมโยงโครงการในระบบ (ถ้ามี)</label>
            <select
              value={formData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            >
              <option value="">-- ไม่เชื่อมโยง / บันทึกแยกอิสระ --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  🏥 {p.hospitalName} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">โรงพยาบาล / ลูกค้า <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                placeholder="เช่น โรงพยาบาลศิริราช"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">แผนกที่ติดตั้ง</label>
              <input
                type="text"
                placeholder="เช่น แผนกห้องผ่าตัด (OR)"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เซลส์ผู้รับผิดชอบ</label>
              <select
                value={formData.salesPerson}
                onChange={(e) => setFormData({ ...formData, salesPerson: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                {members.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รุ่นสินค้า <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ยี่ห้อ (Brand)</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">หมายเลข Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">🎁 ของแถม / รายการอุปกรณ์ประกอบในสัญญา</label>
            <textarea
              rows="2"
              placeholder="ระบุของแถม เช่น กระดาษบันทึก 10 ม้วน, สาย Lead สำรอง, รถเข็นสแตนเลส..."
              value={formData.freebies}
              onChange={(e) => setFormData({ ...formData, freebies: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">วันที่ส่งมอบสินค้า</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">มูลค่างาน (บาท)</label>
              <input
                type="number"
                value={formData.projectValue}
                onChange={(e) => setFormData({ ...formData, projectValue: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่า DF (Doctor Fee)</label>
              <input
                type="text"
                value={formData.dfAmount}
                onChange={(e) => setFormData({ ...formData, dfAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-purple-300 font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">จำนวนเงินค้ำประกันซอง (บาท)</label>
              <input
                type="number"
                value={formData.bidGuaranteeAmount}
                onChange={(e) => setFormData({ ...formData, bidGuaranteeAmount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">วันที่กำหนดรับคืนเงินประกันซอง</label>
              <input
                type="date"
                value={formData.bidGuaranteeRefundDate}
                onChange={(e) => setFormData({ ...formData, bidGuaranteeRefundDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-emerald-400 font-semibold">วันหมดอายุการรับประกัน (Warranty)</label>
              <input
                type="date"
                value={formData.warrantyExpiryDate}
                onChange={(e) => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-purple-300 font-semibold">วันที่ต้องเข้าทำ PM ครั้งถัดไป</label>
              <input
                type="date"
                value={formData.nextPmDate}
                onChange={(e) => setFormData({ ...formData, nextPmDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30">
              บันทึกรายการสินค้าที่ขายแล้ว
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Import Logistics & Shipment Tracking View Component
// ----------------------------------------------------
function ShipmentTrackingView({ shipments, purchaseOrders, products, onOpenNewShipment, onEditShipment, onDeleteShipment }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTransport, setFilterTransport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewShipment, setPreviewShipment] = useState(null);

  // Filtered Shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (filterTransport !== 'all' && s.transportType !== filterTransport) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mShp = (s.shipmentNumber || '').toLowerCase().includes(q);
        const mPO = (s.poNumber || '').toLowerCase().includes(q);
        const mProd = (s.productName || '').toLowerCase().includes(q);
        const mVendor = (s.vendorName || '').toLowerCase().includes(q);
        const mCarrier = (s.shippingCompany || '').toLowerCase().includes(q);
        const mTrack = (s.trackingNumber || '').toLowerCase().includes(q);
        const mHosp = (s.hospitalDestination || '').toLowerCase().includes(q);
        return mShp || mPO || mProd || mVendor || mCarrier || mTrack || mHosp;
      }
      return true;
    });
  }, [shipments, filterStatus, filterTransport, searchQuery]);

  // Metrics KPI
  const totalShipments = filteredShipments.length;
  const inTransitCount = filteredShipments.filter(s => s.status === 'ระหว่างขนส่ง' || s.status === 'ถึงประเทศไทย รอออกของ').length;
  const totalCBM = filteredShipments.reduce((sum, s) => sum + (Number(s.cbm) || 0), 0);
  const totalShippingCosts = filteredShipments.reduce((sum, s) => sum + (Number(s.shippingCost) || 0) + (Number(s.dutyTaxes) || 0), 0);

  const statusColors = {
    'รอจ่ายเงิน': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'จ่ายเงินแล้ว รอผลิต': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'ผลิตเสร็จแล้ว รอส่ง': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    'ระหว่างขนส่ง': 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
    'ถึงประเทศไทย รอออกของ': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    'ของถึง ออฟฟิศ': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    'ส่งลูกค้าแล้ว': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner">
            🚢
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>ติดตามการนำเข้าสินค้า (Import Logistics & Shipment Tracking)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                IMPORT LOGISTICS
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามสถานะชิปปิ้งนำเข้าจากต่างประเทศ ค่าขนส่ง CBM ด่านศุลกากร และกำหนดสินค้าเข้าออฟฟิศ/ส่งมอบ
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewShipment(null)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ บันทึกรายการนำเข้าใหม่</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📦 รวมรายการนำเข้าสินค้า</span>
            <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300">📋</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-400 tracking-tight font-mono">
            {totalShipments} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ใบสั่งซื้อที่ดำเนินการนำเข้า
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>✈️ อยู่ระหว่างขนส่ง / ด่านศุลกากร</span>
            <span className="p-1 rounded-lg bg-purple-500/20 text-purple-300">⚓</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 tracking-tight font-mono">
            {inTransitCount} <span className="text-xs font-normal text-slate-400">ล็อต</span>
          </div>
          <div className="text-[11px] text-slate-400">
            กำลังเดินทาง / รอดำเนินการออกของ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📐 ปริมาตรรวม (Total CBM)</span>
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-300">📐</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {totalCBM.toFixed(1)} <span className="text-xs font-normal text-slate-400">CBM</span>
          </div>
          <div className="text-[11px] text-slate-400">
            ลูกบาศก์เมตร (Volume)
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💵 รวมค่าขนส่ง & ภาษีนำเข้า</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalShippingCosts)}
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าระวาง + ชิปปิ้ง + ภาษีศุลกากร
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางติดตามสถานะสินค้าชิปปิ้ง (Import Shipments List)</span>
            </h3>
            <p className="text-xs text-slate-400">ตรวจสอบสถานะนำเข้า 7 ขั้นตอน เลข AWB ค่าขนส่ง CBM และด่านศุลกากร</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา PO / สินค้า / AWB / ชิปปิ้ง / รพ...."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะนำเข้า</option>
              {window.SHIPMENT_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterTransport}
              onChange={(e) => setFilterTransport(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามประเภทการขนส่ง</option>
              {window.TRANSPORT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่ชิปปิ้ง / PO</th>
                <th className="p-3">สินค้าที่สั่ง & บริษัทผู้ผลิต</th>
                <th className="p-3">ผู้จัดขนส่ง & เลข AWB/BL</th>
                <th className="p-3">ปริมาตร CBM / น้ำหนัก</th>
                <th className="p-3 text-right">ค่าขนส่ง & ภาษีศุลกากร</th>
                <th className="p-3 text-center">วันที่ ETD / ETA</th>
                <th className="p-3 text-center">สถานะนำเข้า</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการนำเข้าสินค้าตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredShipments.map(shp => {
                  const badgeStyle = statusColors[shp.status] || 'bg-slate-800 text-slate-300';

                  return (
                    <tr key={shp.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* Shipment & PO Number */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-cyan-300">{shp.shipmentNumber}</div>
                        <div className="text-[10.5px] font-mono text-amber-300 font-semibold mt-0.5">PO: {shp.poNumber}</div>
                        {shp.hospitalDestination && (
                          <div className="text-[9.5px] text-emerald-300 line-clamp-1 mt-0.5">🏥 {shp.hospitalDestination}</div>
                        )}
                      </td>

                      {/* Product Name & Vendor */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{shp.productName}</div>
                        <div className="text-[10px] text-slate-400">{shp.productCategory}</div>
                        <div className="text-[10.5px] text-indigo-300 font-medium mt-0.5">🏭 {shp.vendorName} ({shp.vendorCountry})</div>
                      </td>

                      {/* Carrier & Tracking Number */}
                      <td className="p-3">
                        <div className="font-semibold text-purple-300">{shp.shippingCompany || 'ไม่ระบุสายส่ง'}</div>
                        <div className="text-[10px] text-slate-300">{shp.transportType}</div>
                        {shp.trackingNumber && (
                          <div className="inline-block mt-1 font-mono font-bold text-slate-200 text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            🏷️ {shp.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* CBM & Weight */}
                      <td className="p-3 font-mono">
                        <div className="font-bold text-amber-300 text-sm">{shp.cbm} <span className="text-[10px] font-normal text-slate-400">CBM</span></div>
                        <div className="text-[10px] text-slate-400">{shp.grossWeight ? `${shp.grossWeight} kg` : '-'}</div>
                      </td>

                      {/* Shipping Cost & Duties */}
                      <td className="p-3 text-right font-mono">
                        <div className="font-bold text-emerald-400">{formatCurrency(shp.shippingCost)}</div>
                        {shp.dutyTaxes > 0 && (
                          <div className="text-[10px] text-purple-300">+ ภาษี {formatCurrency(shp.dutyTaxes)}</div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="p-3 text-center font-mono text-[10.5px]">
                        <div className="text-slate-400">ออก: <span className="text-slate-200">{shp.etd || 'N/A'}</span></div>
                        <div className="text-cyan-300 font-bold mt-0.5">ถึง: {shp.eta || 'N/A'}</div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-extrabold border ${badgeStyle}`}>
                          {shp.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewShipment(shp)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบชิปปิ้ง"
                        >
                          👁️ ดู
                        </button>
                        <button
                          onClick={() => onEditShipment(shp)}
                          className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-200 text-xs rounded-lg border border-cyan-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteShipment(shp.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Preview Modal */}
      {previewShipment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  IMPORT LOGISTICS DOCUMENT
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewShipment.shipmentNumber}</h3>
                <p className="text-xs text-slate-400">อ้างอิงใบสั่งซื้อ PO: {previewShipment.poNumber}</p>
              </div>
              <button onClick={() => setPreviewShipment(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลสินค้า & บริษัทผู้ผลิต:</div>
                <div className="font-bold text-white text-sm mt-0.5">{previewShipment.productName}</div>
                <div className="text-indigo-300">บริษัท: {previewShipment.vendorName} ({previewShipment.vendorCountry})</div>
                <div className="text-emerald-300 font-medium">ส่งถึง: {previewShipment.hospitalDestination || 'สำนักงาน AERON'}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการขนส่งชิปปิ้ง:</div>
                <div className="text-purple-300 font-bold mt-0.5">บริษัทขนส่ง: {previewShipment.shippingCompany}</div>
                <div className="text-slate-300">รูปแบบ: {previewShipment.transportType}</div>
                <div className="text-amber-300 font-mono">AWB/BL: {previewShipment.trackingNumber || 'N/A'}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-bold">ปริมาตร (CBM):</span>
                <div className="text-amber-400 font-bold text-base">{previewShipment.cbm} CBM</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">น้ำหนักรวม (Weight):</span>
                <div className="text-slate-200 font-bold text-base">{previewShipment.grossWeight || 0} kg</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">ค่าขนส่งรวม:</span>
                <div className="text-emerald-400 font-bold text-base">{formatCurrency(previewShipment.shippingCost)}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📍 สถานะการนำเข้าปัจจุบัน</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {previewShipment.status}
                </span>
                <span className="text-slate-400">ชิปปิ้ง/พิธีการศุลกากร: <span className="text-slate-200 font-semibold">{previewShipment.customsBroker || 'N/A'}</span></span>
              </div>
              {previewShipment.notes && (
                <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                  "{previewShipment.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์เอกสารนำเข้า
              </button>
              <button onClick={() => setPreviewShipment(null)} className="px-5 py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl hover:bg-cyan-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------
// Shipment Create/Edit Modal Component
// ----------------------------------------------------
function ShipmentModal({ shipment, purchaseOrders, products, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (shipment) return { ...shipment };
    const firstPO = purchaseOrders[0] || {};
    const delivYr = new Date().getFullYear();

    return {
      shipmentNumber: `SHP-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      poNumber: firstPO.poNumber || `PO-${delivYr}-101`,
      poId: firstPO.id || '',
      productName: firstPO.productName || (products[0] ? products[0].name : ''),
      productCategory: firstPO.productCategory || (products[0] ? products[0].category : ''),
      quantity: firstPO.quantity || 1,
      vendorName: firstPO.vendorName || 'Mindray Medical Singapore',
      vendorCountry: firstPO.vendorCountry || 'สิงคโปร์',
      hospitalDestination: firstPO.hospitalName || 'โรงพยาบาลศิริราช',
      shippingCompany: 'DHL Global Forwarding',
      trackingNumber: `AWB-${Math.floor(Math.random() * 89999999) + 10000000}`,
      cbm: 2.5,
      grossWeight: 150.0,
      transportType: window.TRANSPORT_TYPES[0],
      shippingCost: 35000,
      dutyTaxes: 12000,
      customsBroker: 'V-Cargo Logistics (Thailand)',
      etd: new Date().toISOString().split('T')[0],
      eta: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: window.SHIPMENT_STATUSES[0],
      notes: ''
    };
  });

  const handlePOSelect = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      setFormData(prev => ({
        ...prev,
        poId: po.id,
        poNumber: po.poNumber,
        productName: po.productName,
        vendorName: po.vendorName,
        vendorCountry: po.vendorCountry,
        hospitalDestination: po.hospitalName || prev.hospitalDestination,
        quantity: po.quantity || prev.quantity
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.vendorName.trim()) {
      alert('กรุณากรอกชื่อสินค้าและชื่อบริษัทผู้ผลิต');
      return;
    }
    onSave({
      ...formData,
      cbm: Number(formData.cbm) || 0,
      grossWeight: Number(formData.grossWeight) || 0,
      shippingCost: Number(formData.shippingCost) || 0,
      dutyTaxes: Number(formData.dutyTaxes) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🚢 {shipment ? 'แก้ไขข้อมูลนำเข้าสินค้า' : 'บันทึกรายการนำเข้าสินค้าใหม่ (Shipment Tracking)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ชิปปิ้ง / Tracking ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.shipmentNumber}
                onChange={(e) => setFormData({ ...formData, shipmentNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เชื่อมโยงใบสั่งซื้อ (PO)</label>
              <select
                value={formData.poId}
                onChange={(e) => handlePOSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-bold"
              >
                <option value="">-- เลือก PO ในระบบ --</option>
                {purchaseOrders.map(po => (
                  <option key={po.id} value={po.id}>
                    📄 {po.poNumber} - {po.vendorName} ({po.productName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ชื่อรุ่นสินค้าที่นำเข้า <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทผู้ผลิต / Vendor <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทขนส่ง (Freight Carrier)</label>
              <input
                type="text"
                placeholder="เช่น DHL, Kuehne+Nagel, FedEx"
                value={formData.shippingCompany}
                onChange={(e) => setFormData({ ...formData, shippingCompany: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลข Air Waybill / Bill of Lading</label>
              <input
                type="text"
                placeholder="เช่น AWB-98765432"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ขนส่งทางไหน</label>
              <select
                value={formData.transportType}
                onChange={(e) => setFormData({ ...formData, transportType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold"
              >
                {window.TRANSPORT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">ปริมาตร (CBM)</label>
              <input
                type="number"
                step="0.1"
                value={formData.cbm}
                onChange={(e) => setFormData({ ...formData, cbm: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">น้ำหนักรวม (kg)</label>
              <input
                type="number"
                step="0.5"
                value={formData.grossWeight}
                onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ค่าขนส่ง (บาท)</label>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">ภาษีศุลกากร (บาท)</label>
              <input
                type="number"
                value={formData.dutyTaxes}
                onChange={(e) => setFormData({ ...formData, dutyTaxes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-purple-300 font-bold font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่ส่งออกจากต้นทาง (ETD)</label>
              <input
                type="date"
                value={formData.etd}
                onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">วันที่คาดว่าถึงไทย (ETA)</label>
              <input
                type="date"
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">สถานะการนำเข้า <span className="text-rose-400">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-2.5 text-cyan-300 font-bold outline-none"
              >
                {window.SHIPMENT_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">ชิปปิ้ง / ตัวแทนศุลกากร & หมายเหตุ</label>
            <input
              type="text"
              placeholder="ระบุบริษัทชิปปิ้ง เที่ยวบิน หรือข้อความเพิ่มเติม..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30">
              บันทึกรายการนำเข้า
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Helper: Calculate actual working days excluding weekends (Sat/Sun)
function calculateWorkingDays(startDateStr, endDateStr) {
  if (!startDateStr) return 0;
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  let count = 0;
  let cur = new Date(start.getTime());
  cur.setHours(0,0,0,0);
  const finish = new Date(end.getTime());
  finish.setHours(0,0,0,0);

  while (cur <= finish) {
    const dayOfWeek = cur.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// ----------------------------------------------------
// Thai FDA Registration View Component
// ----------------------------------------------------
function FDARegistrationView({ fdaRegistrations, products, members, onOpenNewFDA, onEditFDA, onDeleteFDA }) {
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFDA, setPreviewFDA] = useState(null);

  // Filtered FDA Registrations
  const filteredFDAs = useMemo(() => {
    return fdaRegistrations.filter(f => {
      if (filterClass !== 'all' && f.deviceClass !== filterClass) return false;
      if (filterStatus !== 'all' && f.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mReg = (f.registrationNumber || '').toLowerCase().includes(q);
        const mLic = (f.fdaLicenseNo || '').toLowerCase().includes(q);
        const mProd = (f.productName || '').toLowerCase().includes(q);
        const mVendor = (f.vendorName || '').toLowerCase().includes(q);
        const mAgency = (f.agencyName || '').toLowerCase().includes(q);
        const mRA = (f.raSpecialist || '').toLowerCase().includes(q);
        return mReg || mLic || mProd || mVendor || mAgency || mRA;
      }
      return true;
    });
  }, [fdaRegistrations, filterClass, filterStatus, searchQuery]);

  // Metrics KPI
  const totalRegistrations = filteredFDAs.length;
  const approvedCount = filteredFDAs.filter(f => f.status === 'อนุมัติใบอนุญาตแล้ว').length;
  
  // Overdue count (Red Alert)
  const overdueCount = filteredFDAs.filter(f => {
    if (f.status === 'อนุมัติใบอนุญาตแล้ว') return false;
    const elapsed = calculateWorkingDays(f.paymentDate, f.approvalDate);
    const target = f.targetDays || 30;
    return elapsed > target;
  }).length;

  // Expiring count (Orange Alert <= 6 months)
  const expiringCount = filteredFDAs.filter(f => {
    if (!f.expiryDate) return false;
    const exp = new Date(f.expiryDate);
    const today = new Date();
    const diffMonths = (exp.getFullYear() - today.getFullYear()) * 12 + (exp.getMonth() - today.getMonth());
    return diffMonths >= 0 && diffMonths <= 6;
  }).length;

  const totalCost = filteredFDAs.reduce((sum, f) => sum + (Number(f.costTHB) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
            🛡️
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>การจดทะเบียน อย. เครื่องมือแพทย์ (Thai FDA Medical Device Registration)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                REGULATORY COMPLIANCE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              ติดตามระยะเวลา SLA ใบอนุญาต อย. ตาม Class เครื่องมือแพทย์ เตือนความเสี่ยงเกินกำหนด และวันหมดอายุต่อสัญญา
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenNewFDA(null)}
          className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5"
        >
          <span>+ บันทึกการยื่นขอ อย. ใหม่</span>
        </button>
      </div>

      {/* SLA Benchmarks Reference Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟢 Class 1 (ความเสี่ยงต่ำ)</span>
            <span className="text-emerald-400 font-mono">30 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับจดแจ้ง (Low Risk Medical Device)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟡 Class 2 (เสี่ยงปานกลางต่ำ)</span>
            <span className="text-amber-400 font-mono">120 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับแจ้งรายการละเอียด (90 - 150 วัน)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🟠 Class 3 (เสี่ยงปานกลางสูง)</span>
            <span className="text-orange-400 font-mono">180 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบรับแจ้งรายการละเอียด (150 - 200 วัน)</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
          <div className="font-bold text-slate-200 flex items-center justify-between">
            <span>🔴 Class 4 (ความเสี่ยงสูง)</span>
            <span className="text-rose-400 font-mono">300 วันทำการ</span>
          </div>
          <p className="text-[11px] text-slate-400">ใบอนุญาต (High Risk / Invasive Device)</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>📋 ยื่นขอ อย. ทั้งหมด</span>
            <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">📄</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-tight font-mono">
            {totalRegistrations} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-slate-400">
            อนุมัติแล้ว {approvedCount} รายการ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🚨 ยื่นเกินเวลา อย. (Overdue)</span>
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-300">🚨</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 tracking-tight font-mono">
            {overdueCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-rose-300 font-medium">
            เกินจำนวนวันทำการที่ อย. กำหนด
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>🟧 ใบอย. ใกล้หมดอายุ (6 เดือน)</span>
            <span className="p-1 rounded-lg bg-orange-500/20 text-orange-300">🔔</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-400 tracking-tight font-mono">
            {expiringCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
          </div>
          <div className="text-[11px] text-orange-300 font-medium">
            ต้องเริ่มดำเนินการยื่นต่ออายุ
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>💵 รวมค่าใช้จ่ายจด อย.</span>
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formatCurrency(totalCost)}
          </div>
          <div className="text-[11px] text-slate-400">
            ค่าธรรมเนียม + ค่าบริการเอเยนต์
          </div>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>📋 ตารางติดตามสถานะ อย. และการแจ้งเตือน SLA (FDA Registrations)</span>
            </h3>
            <p className="text-xs text-slate-400">ระบบเตือนสีแดง (เกิน SLA), สีเหลือง (สุ่มเสี่ยงเหลือ 30%), สีส้ม (ใกล้หมดอายุ 6 เดือน)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="ค้นหา สินค้า / เลข อย. / บริษัท / เอเยนต์ / RA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none"
            />

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุก Class อย.</option>
              {window.FDA_CLASSES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="all">กรองตามทุกสถานะ</option>
              {window.FDA_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FDA Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">เลขที่คำขอ / เลขใบอนุญาต อย.</th>
                <th className="p-3">สินค้าที่จด & บริษัทผู้ผลิต</th>
                <th className="p-3">Class ความเสี่ยง & บริษัทรับจด</th>
                <th className="p-3 text-center">วันเริ่มจ่ายเงิน ➔ อนุมัติ</th>
                <th className="p-3 text-center">วันทำการที่ใช้ / เกณฑ์ SLA</th>
                <th className="p-3 text-center">วันหมดอายุใบ อย.</th>
                <th className="p-3 text-right">ค่าบริการจด (บาท)</th>
                <th className="p-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFDAs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500 text-xs">
                    ไม่พบรายการจดทะเบียน อย. ตรงตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredFDAs.map(fda => {
                  const elapsedDays = calculateWorkingDays(fda.paymentDate, fda.approvalDate);
                  const targetDays = fda.targetDays || 30;
                  const isApproved = fda.status === 'อนุมัติใบอนุญาตแล้ว';

                  // SLA Alert Logic
                  const isOverdue = !isApproved && elapsedDays > targetDays;
                  const isWarningSLA = !isApproved && !isOverdue && elapsedDays >= Math.floor(targetDays * 0.7);

                  // License Expiry Logic (< 6 months)
                  let isNearExpiry = false;
                  if (fda.expiryDate) {
                    const exp = new Date(fda.expiryDate);
                    const today = new Date();
                    const diffMonths = (exp.getFullYear() - today.getFullYear()) * 12 + (exp.getMonth() - today.getMonth());
                    if (diffMonths >= 0 && diffMonths <= 6) {
                      isNearExpiry = true;
                    }
                  }

                  // Row background style based on alert
                  let rowStyle = 'hover:bg-slate-800/40';
                  if (isOverdue) rowStyle = 'bg-rose-950/20 hover:bg-rose-950/40 border-l-4 border-l-rose-500';
                  else if (isWarningSLA) rowStyle = 'bg-amber-950/20 hover:bg-amber-950/40 border-l-4 border-l-amber-500';
                  else if (isNearExpiry) rowStyle = 'bg-orange-950/20 hover:bg-orange-950/40 border-l-4 border-l-orange-500';

                  return (
                    <tr key={fda.id} className={`transition-colors ${rowStyle}`}>
                      
                      {/* Registration & License Number */}
                      <td className="p-3">
                        <div className="font-mono font-bold text-amber-300">{fda.registrationNumber}</div>
                        <div className="inline-block mt-1 font-mono font-bold text-emerald-300 text-[10.5px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {fda.fdaLicenseNo || 'รอใบอนุญาต'}
                        </div>
                      </td>

                      {/* Product Name & Vendor */}
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{fda.productName}</div>
                        <div className="text-[10px] text-indigo-300">แบรนด์: {fda.brand}</div>
                        <div className="text-[10.5px] text-slate-400 font-medium">🏭 {fda.vendorName}</div>
                      </td>

                      {/* Class & Agency */}
                      <td className="p-3">
                        <div className="font-bold text-amber-400">{fda.deviceClass}</div>
                        <div className="text-[10px] text-slate-300">🏢 {fda.agencyName}</div>
                        <div className="text-[10px] text-indigo-300">👤 {fda.raSpecialist}</div>
                      </td>

                      {/* Payment & Approval Date */}
                      <td className="p-3 text-center font-mono text-[10.5px]">
                        <div className="text-slate-400">เริ่ม: <span className="text-white font-semibold">{fda.paymentDate}</span></div>
                        <div className="text-emerald-300 font-bold mt-0.5">เสร็จ: {fda.approvalDate || 'กำลังดำเนินการ'}</div>
                      </td>

                      {/* Elapsed Working Days & SLA Badge */}
                      <td className="p-3 text-center space-y-1 font-mono">
                        <div className="font-bold text-sm text-slate-100">
                          {elapsedDays} <span className="text-[10px] font-normal text-slate-400">วันทำการ</span>
                        </div>

                        <div>
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                              🚨 เกิน SLA ({targetDays} วัน)
                            </span>
                          ) : isWarningSLA ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ⚠️ สุ่มเสี่ยง (เหลือ 30%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              เกณฑ์มาตรฐาน {targetDays} วัน
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiration Date & Expiry Alert */}
                      <td className="p-3 text-center font-mono">
                        <div className="font-bold text-slate-200 text-[11px]">{fda.expiryDate || 'ยังไม่มีวันหมดอายุ'}</div>
                        {isNearExpiry && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-bounce">
                              🟧 เตือนยื่นต่ออายุ 6 เดือน
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(fda.costTHB)}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center space-x-1">
                        <button
                          onClick={() => setPreviewFDA(fda)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700"
                          title="ดูรายละเอียดใบ อย."
                        >
                          👁️ ดู
                        </button>
                        <button
                          onClick={() => onEditFDA(fda)}
                          className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 text-xs rounded-lg border border-amber-700/50"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => onDeleteFDA(fda.id)}
                          className="px-1.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs rounded-lg border border-rose-800/50"
                        >
                          🗑️
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FDA Certificate Preview Modal */}
      {previewFDA && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 shadow-2xl animate-modal text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  THAI FDA COMPLIANCE CERTIFICATE
                </span>
                <h3 className="text-xl font-mono font-extrabold text-white mt-1">{previewFDA.registrationNumber}</h3>
                <p className="text-xs text-emerald-300 font-mono font-bold">เลขที่ใบอนุญาต อย.: {previewFDA.fdaLicenseNo || 'อยู่ระหว่างพิจารณา'}</p>
              </div>
              <button onClick={() => setPreviewFDA(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="text-slate-500 font-bold">รายละเอียดสินค้า & ผู้ผลิต:</div>
                <div className="font-bold text-white text-sm mt-0.5">{previewFDA.productName}</div>
                <div className="text-indigo-300">แบรนด์: {previewFDA.brand}</div>
                <div className="text-slate-400">ผู้ผลิต: {previewFDA.vendorName}</div>
              </div>
              <div>
                <div className="text-slate-500 font-bold">ข้อมูลการรับจด อย.:</div>
                <div className="text-amber-400 font-bold mt-0.5">Class ความเสี่ยง: {previewFDA.deviceClass}</div>
                <div className="text-slate-300">บริษัทรับจด: {previewFDA.agencyName}</div>
                <div className="text-purple-300 font-semibold">ผู้ดูแล RA: {previewFDA.raSpecialist}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 font-bold">วันเริ่มจ่ายเงิน/ยื่น:</span>
                <div className="text-slate-100 font-bold text-sm mt-0.5">{previewFDA.paymentDate}</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">วันอนุมัติเสร็จ:</span>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">{previewFDA.approvalDate || 'กำลังรอดำเนินการ'}</div>
              </div>
              <div>
                <span className="text-slate-500 font-bold">วันหมดอายุใบ อย.:</span>
                <div className="text-orange-400 font-bold text-sm mt-0.5">{previewFDA.expiryDate || 'N/A'}</div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📍 สถานะขั้นตอนคำขอ</div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {previewFDA.status}
                </span>
                <span className="text-slate-400">ค่าธรรมเนียมรวม: <span className="text-emerald-400 font-bold font-mono">{formatCurrency(previewFDA.costTHB)}</span></span>
              </div>
              {previewFDA.notes && (
                <p className="text-slate-300 italic pt-1 border-t border-slate-900">
                  "{previewFDA.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-xl hover:bg-slate-700">
                🖨️ พิมพ์รายละเอียด อย.
              </button>
              <button onClick={() => setPreviewFDA(null)} className="px-5 py-2 bg-amber-600 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-500">
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------
// FDA Registration Create/Edit Modal Component
// ----------------------------------------------------
function FDAModal({ fda, products, members, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    if (fda) return { ...fda };
    const firstProd = products[0] || {};
    const delivYr = new Date().getFullYear();

    return {
      registrationNumber: `FDA-${delivYr}-${String(Math.floor(Math.random() * 900) + 100)}`,
      fdaLicenseNo: '',
      productName: firstProd.name || '',
      brand: firstProd.brand || 'AERON MEDICAL',
      vendorName: firstProd.manufacturer || 'Mindray Medical Singapore',
      deviceClass: 'Class 1',
      targetDays: 30,
      agencyName: 'Pharmatech FDA Consulting Co., Ltd.',
      raSpecialist: members[0] ? members[0].name : 'ภก. วิศรุต ธรรมรักษ์',
      costTHB: 50000,
      submissionType: 'ยื่นขอใหม่',
      paymentDate: new Date().toISOString().split('T')[0],
      approvalDate: '',
      expiryDate: '',
      status: window.FDA_STATUSES[0],
      notes: ''
    };
  });

  const handleClassSelect = (classCode) => {
    const clsObj = window.FDA_CLASSES.find(c => c.code === classCode);
    if (clsObj) {
      setFormData(prev => ({
        ...prev,
        deviceClass: clsObj.code,
        targetDays: clsObj.targetDays
      }));
    }
  };

  const handleProductSelect = (pName) => {
    const p = products.find(x => x.name === pName);
    if (p) {
      setFormData(prev => ({
        ...prev,
        productName: p.name,
        brand: p.brand || prev.brand,
        vendorName: p.manufacturer || prev.vendorName
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.vendorName.trim()) {
      alert('กรุณากรอกชื่อสินค้าและบริษัทผู้ผลิต');
      return;
    }
    onSave({
      ...formData,
      costTHB: Number(formData.costTHB) || 0,
      targetDays: Number(formData.targetDays) || 30
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-5 space-y-4 shadow-2xl animate-modal max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>🛡️ {fda ? 'แก้ไขข้อมูลการยื่นขอ อย.' : 'บันทึกการยื่นขอ อย. ใหม่ (Thai FDA Registration)'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">รหัสอ้างอิงคำขอ / FDA ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลขที่ใบรับจดแจ้ง / ใบอนุญาต อย.</label>
              <input
                type="text"
                placeholder="เช่น 65-1-2-2-0008891 (ถ้ามี)"
                value={formData.fdaLicenseNo}
                onChange={(e) => setFormData({ ...formData, fdaLicenseNo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">เลือกสินค้าในแคตตาล็อก <span className="text-rose-400">*</span></label>
              <select
                value={formData.productName}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ยี่ห้อ (Brand)</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-indigo-300 font-semibold outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทผู้ผลิต / Vendor ต่างประเทศ <span className="text-rose-400">*</span></label>
              <input
                type="text"
                required
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">Class เครื่องมือแพทย์ (เกณฑ์เวลา อย.) <span className="text-rose-400">*</span></label>
              <select
                value={formData.deviceClass}
                onChange={(e) => handleClassSelect(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold outline-none"
              >
                {window.FDA_CLASSES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-amber-400 font-semibold">จำนวนวันทำการเกณฑ์ SLA อย.</label>
              <input
                type="number"
                value={formData.targetDays}
                onChange={(e) => setFormData({ ...formData, targetDays: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">บริษัทที่ทำหน้าที่รับจด</label>
              <input
                type="text"
                placeholder="เช่น Pharmatech FDA Consulting"
                value={formData.agencyName}
                onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ผู้รับผิดชอบ RA / เภสัชกร</label>
              <input
                type="text"
                placeholder="เช่น ภก. วิศรุต"
                value={formData.raSpecialist}
                onChange={(e) => setFormData({ ...formData, raSpecialist: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ราคาค่าจด อย. (บาท)</label>
              <input
                type="number"
                value={formData.costTHB}
                onChange={(e) => setFormData({ ...formData, costTHB: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-mono font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">วันที่เริ่มจ่ายเงิน / ยื่นคำขอ <span className="text-rose-400">*</span></label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-emerald-400 font-semibold">วันที่เสร็จ / อนุมัติใบอนุญาต</label>
              <input
                type="date"
                value={formData.approvalDate}
                onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-orange-400 font-semibold">วันที่ใบ อย. หมดอายุ</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">สถานะคำขอปัจจุบัน <span className="text-rose-400">*</span></label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-amber-300 font-bold outline-none"
              >
                {window.FDA_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">ประเภทการยื่น</label>
              <select
                value={formData.submissionType}
                onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
              >
                <option value="ยื่นขอใหม่">ยื่นขอใหม่ (New Filing)</option>
                <option value="ยื่นขอต่ออายุ">ยื่นขอต่ออายุ (Renewal)</option>
                <option value="ขอแก้ไขรายการ">ขอแก้ไขรายการ (Amendment)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">หมายเหตุ / ประวัติการแก้ไขตามสั่ง อย.</label>
            <input
              type="text"
              placeholder="ระบุข้อความหรือประวัติการติดต่อกับเจ้าหน้าที่ อย...."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">ยกเลิก</button>
            <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/30">
              บันทึกรายการจด อย.
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
