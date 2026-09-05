// ====================================================
// MODULE: mod00_core/hooks/useAeronLogistics.js
// 📦 Domain Hook: Central Products, Shipments, Sold Assets, Repairs & FDA
// ====================================================

function useAeronLogistics({ setActiveView }) {
  const isHydrated = useRef(false);

  // 0. Product Categories Master State
  const [productCategories, setProductCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_product_categories');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filterFn = window.filterQuarantineData;
          return filterFn ? filterFn('product_categories', parsed) : parsed;
        }
      }
      const initial = (window.PRODUCT_CATEGORIES && Array.isArray(window.PRODUCT_CATEGORIES)) ? window.PRODUCT_CATEGORIES : [];
      const filterFn = window.filterQuarantineData;
      return filterFn ? filterFn('product_categories', initial) : initial;
    } catch(e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('aeron_product_categories', JSON.stringify(productCategories));
    window.PRODUCT_CATEGORIES = productCategories;
    // Only push to remote cloud if initial hydration has already finished!
    if (isHydrated.current) {
      syncToDB('product_categories', productCategories);
    }
  }, [productCategories]);

  const handleUpdateCategories = useCallback((updatedList) => {
    const filterFn = window.filterQuarantineData;
    const cleanList = filterFn ? filterFn('product_categories', updatedList) : updatedList;
    setProductCategories(cleanList);
    if (typeof window.syncToDB === 'function') {
      window.syncToDB('product_categories', cleanList);
    }
  }, []);

  // 1. Central Product Catalog State (No hardcoded resurrection)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_products');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filterFn = window.filterQuarantineData;
          return filterFn ? filterFn('products', parsed) : parsed;
        }
      }
      const initial = (window.CENTRAL_PRODUCT_CATALOG && Array.isArray(window.CENTRAL_PRODUCT_CATALOG)) ? window.CENTRAL_PRODUCT_CATALOG : [];
      const filterFn = window.filterQuarantineData;
      return filterFn ? filterFn('products', initial) : initial;
    } catch (e) {
      return [];
    }
  });

  // 2. Delivered / Sold Products State (Assets)
  const [soldProducts, setSoldProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_sold_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filterFn = window.filterQuarantineData;
        return filterFn ? filterFn('sold_products', parsed) : parsed;
      }
    } catch (e) {}
    return [];
  });

  // 3. Import Logistics / Shipments State
  const [shipments, setShipments] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_shipments');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filterFn = window.filterQuarantineData;
        return filterFn ? filterFn('shipments', parsed) : parsed;
      }
    } catch (e) {}
    return [];
  });

  // 4. Repair Tickets State
  const [repairTickets, setRepairTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_repair_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filterFn = window.filterQuarantineData;
        return filterFn ? filterFn('repair_tickets', parsed) : parsed;
      }
    } catch (e) {}
    return [];
  });

  // 5. Thai FDA Registrations State
  const [fdaRegistrations, setFdaRegistrations] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_fda_registrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filterFn = window.filterQuarantineData;
        return filterFn ? filterFn('fda_registrations', parsed) : parsed;
      }
    } catch (e) {}
    return [];
  });

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
  const [editingSoldAsset, setEditingSoldAsset] = useState(null);
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [editingRepairTicket, setEditingRepairTicket] = useState(null);
  const [isFDAModalOpen, setIsFDAModalOpen] = useState(false);
  const [editingFDA, setEditingFDA] = useState(null);

  // ⚡ Universal Hydration: Initial Mount + Tab Focus + 20s Heartbeat Poller (Server-Authoritative SSoT)
  useEffect(() => {
    let isMounted = true;
    async function hydrateLogisticsFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 1. Products (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('products')) {
          const remoteProducts = await fetcher('products', null);
          if (isMounted && Array.isArray(remoteProducts)) {
            setProducts(prev => {
              if (window.isAeronMutating && window.isAeronMutating('products')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(remoteProducts)) return prev;
              try { localStorage.setItem('aeron_products', JSON.stringify(remoteProducts)); } catch(e) {}
              return remoteProducts;
            });
          }
        }

        // 2. Categories (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('product_categories')) {
          const remoteCategories = await fetcher('product_categories', null);
          if (isMounted && Array.isArray(remoteCategories)) {
            setProductCategories(prev => {
              if (window.isAeronMutating && window.isAeronMutating('product_categories')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(remoteCategories)) return prev;
              try { localStorage.setItem('aeron_product_categories', JSON.stringify(remoteCategories)); } catch(e) {}
              window.PRODUCT_CATEGORIES = remoteCategories;
              return remoteCategories;
            });
          }
        }

        // 3. Sold Products (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('sold_products')) {
          const remoteSold = await fetcher('sold_products', null);
          if (isMounted && Array.isArray(remoteSold)) {
            const filterFn = window.filterQuarantineData;
            const cleanSold = filterFn ? filterFn('sold_products', remoteSold) : remoteSold;
            setSoldProducts(prev => {
              if (window.isAeronMutating && window.isAeronMutating('sold_products')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(cleanSold)) return prev;
              try { localStorage.setItem('aeron_sold_products', JSON.stringify(cleanSold)); } catch(e) {}
              return cleanSold;
            });
          }
        }

        // 4. Shipments (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('shipments')) {
          const remoteShipments = await fetcher('shipments', null);
          if (isMounted && Array.isArray(remoteShipments)) {
            const filterFn = window.filterQuarantineData;
            const cleanShipments = filterFn ? filterFn('shipments', remoteShipments) : remoteShipments;
            setShipments(prev => {
              if (window.isAeronMutating && window.isAeronMutating('shipments')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(cleanShipments)) return prev;
              try { localStorage.setItem('aeron_shipments', JSON.stringify(cleanShipments)); } catch(e) {}
              return cleanShipments;
            });
          }
        }

        // 5. Repair Tickets (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('repair_tickets')) {
          const remoteRepairs = await fetcher('repair_tickets', null);
          if (isMounted && Array.isArray(remoteRepairs)) {
            const filterFn = window.filterQuarantineData;
            const cleanRepairs = filterFn ? filterFn('repair_tickets', remoteRepairs) : remoteRepairs;
            setRepairTickets(prev => {
              if (window.isAeronMutating && window.isAeronMutating('repair_tickets')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(cleanRepairs)) return prev;
              try { localStorage.setItem('aeron_repair_tickets', JSON.stringify(cleanRepairs)); } catch(e) {}
              return cleanRepairs;
            });
          }
        }

        // 6. FDA Registrations (Server-Authoritative SSoT)
        if (!window.isAeronMutating || !window.isAeronMutating('fda_registrations')) {
          const remoteFDA = await fetcher('fda_registrations', null);
          if (isMounted && Array.isArray(remoteFDA)) {
            const filterFn = window.filterQuarantineData;
            const cleanFDA = filterFn ? filterFn('fda_registrations', remoteFDA) : remoteFDA;
            setFdaRegistrations(prev => {
              if (window.isAeronMutating && window.isAeronMutating('fda_registrations')) return prev;
              if (JSON.stringify(prev) === JSON.stringify(cleanFDA)) return prev;
              try { localStorage.setItem('aeron_fda_registrations', JSON.stringify(cleanFDA)); } catch(e) {}
              return cleanFDA;
            });
          }
        }
      } catch (e) {
        console.warn('[Logistics Cloud Hydration Notice]:', e.message);
      } finally {
        if (isMounted) isHydrated.current = true;
      }
    }

    hydrateLogisticsFromCloud();

    window.addEventListener('focus', hydrateLogisticsFromCloud);
    const poller = setInterval(hydrateLogisticsFromCloud, 20000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateLogisticsFromCloud);
      clearInterval(poller);
    };
  }, []);

  // Handlers (All persistent with LocalStorage & Cloud Sync)
  const handleSaveProduct = useCallback((productData) => {
    const timestamped = {
      ...productData,
      updated_at: new Date().toISOString()
    };
    setProducts(prev => {
      let updated;
      if (timestamped.id) {
        updated = prev.map(p => p.id === timestamped.id ? timestamped : p);
      } else {
        const newProd = {
          ...timestamped,
          id: 'prod-' + Date.now()
        };
        updated = [newProd, ...prev];
      }
      try {
        localStorage.setItem('aeron_products', JSON.stringify(updated));
        if (typeof window.syncToDB === 'function') {
          window.syncToDB('products', updated);
        }
      } catch(e) {}
      return updated;
    });
    setIsProductModalOpen(false);
    setEditingProduct(null);
  }, []);

  const handleSaveSoldAsset = useCallback((assetData) => {
    const timestamped = {
      ...assetData,
      updated_at: new Date().toISOString()
    };
    setSoldProducts(prev => {
      let updated;
      if (timestamped.id) {
        updated = prev.map(a => a.id === timestamped.id ? timestamped : a);
      } else {
        const newAsset = {
          ...timestamped,
          id: 'sold-' + Date.now()
        };
        updated = [newAsset, ...prev];
      }
      try {
        localStorage.setItem('aeron_sold_products', JSON.stringify(updated));
        if (typeof window.syncToDB === 'function') {
          window.syncToDB('sold_products', updated);
        }
      } catch(e) {}
      return updated;
    });
    setIsSoldModalOpen(false);
    setEditingSoldAsset(null);
  }, []);

  const handleDeleteSoldAsset = useCallback((assetId) => {
    if (window.confirm('คุณต้องการลบรายการเครื่องที่ส่งมอบนี้ใช่หรือไม่?')) {
      setSoldProducts(prev => {
        const updated = prev.filter(a => a.id !== assetId);
        try {
          localStorage.setItem('aeron_sold_products', JSON.stringify(updated));
          if (typeof window.syncToDB === 'function') {
            window.syncToDB('sold_products', updated);
          }
        } catch(e) {}
        return updated;
      });
    }
  }, []);

  const handleSaveShipment = useCallback((shipmentData) => {
    const timestamped = {
      ...shipmentData,
      updated_at: new Date().toISOString()
    };
    setShipments(prev => {
      let updated;
      if (timestamped.id) {
        updated = prev.map(s => s.id === timestamped.id ? timestamped : s);
      } else {
        const newShipment = {
          ...timestamped,
          id: 'shp-' + Date.now()
        };
        updated = [newShipment, ...prev];
      }
      try {
        localStorage.setItem('aeron_shipments', JSON.stringify(updated));
        if (typeof window.syncToDB === 'function') {
          window.syncToDB('shipments', updated);
        }
      } catch(e) {}
      return updated;
    });
    setIsShipmentModalOpen(false);
    setEditingShipment(null);
  }, []);

  const handleDeleteShipment = useCallback((shipmentId) => {
    if (window.confirm('คุณต้องการลบรายการนำเข้าสินค้านี้ใช่หรือไม่?')) {
      setShipments(prev => {
        const updated = prev.filter(s => s.id !== shipmentId);
        try {
          localStorage.setItem('aeron_shipments', JSON.stringify(updated));
          if (typeof window.syncToDB === 'function') {
            window.syncToDB('shipments', updated);
          }
        } catch(e) {}
        return updated;
      });
    }
  }, []);

  const handleSaveRepairTicket = useCallback((ticketData) => {
    const timestamped = {
      ...ticketData,
      updated_at: new Date().toISOString()
    };
    setRepairTickets(prev => {
      let updated;
      if (timestamped.id) {
        updated = prev.map(t => t.id === timestamped.id ? timestamped : t);
      } else {
        const newTicket = {
          ...timestamped,
          id: 'rep-' + Date.now()
        };
        updated = [newTicket, ...prev];
      }
      try {
        localStorage.setItem('aeron_repair_tickets', JSON.stringify(updated));
        if (typeof window.syncToDB === 'function') {
          window.syncToDB('repair_tickets', updated);
        }
      } catch(e) {}
      return updated;
    });

    // Auto Link back to Central Demo Catalog if category is "เครื่อง Demo"
    if (ticketData.category === 'เครื่อง Demo' && ticketData.sn) {
      const isFixed = ticketData.status === 'ซ่อมเสร็จแล้ว' || ticketData.status === 'ส่งคืนเรียบร้อย';
      const newUnitStatus = isFixed ? 'พร้อมใช้งาน' : 'ส่งซ่อม';

      setProducts(prevProducts => {
        const updatedProds = prevProducts.map(p => {
          if (p.demoUnits && p.demoUnits.some(u => u.sn === ticketData.sn)) {
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
        });
        try {
          localStorage.setItem('aeron_products', JSON.stringify(updatedProds));
          if (typeof window.syncToDB === 'function') {
            window.syncToDB('products', updatedProds);
          }
        } catch(e) {}
        return updatedProds;
      });
    }

    setIsRepairModalOpen(false);
    setEditingRepairTicket(null);
  }, []);

  const handleDeleteRepairTicket = useCallback((ticketId) => {
    if (window.confirm('คุณต้องการลบรายการส่งซ่อมนี้ใช่หรือไม่?')) {
      setRepairTickets(prev => {
        const updated = prev.filter(t => t.id !== ticketId);
        try {
          localStorage.setItem('aeron_repair_tickets', JSON.stringify(updated));
          if (typeof window.syncToDB === 'function') {
            window.syncToDB('repair_tickets', updated);
          }
        } catch(e) {}
        return updated;
      });
    }
  }, []);

  const handleOpenRepairFromCatalog = useCallback((product, unit) => {
    setEditingRepairTicket({
      category: 'เครื่อง Demo',
      productName: product.name,
      productCategory: product.category,
      brand: product.brand,
      sn: unit ? unit.sn : '',
      repairedItems: unit ? (unit.accessories || 'ตัวเครื่องหลัก และ อุปกรณ์ประกอบ') : 'ตัวเครื่องหลัก',
      lastHospital: unit ? (unit.location || 'สำนักงาน AERON (กรุงเทพฯ)') : 'สำนักงาน AERON',
      location: 'ศูนย์ซ่อม AERON Service Center (กรุงเทพฯ)',
      status: 'ส่งซ่อมอยู่',
      repairVendor: 'AERON Service Center (กรุงเทพฯ)',
      sentDate: new Date().toISOString().split('T')[0]
    });
    if (setActiveView) setActiveView('repair_service');
    setIsRepairModalOpen(true);
  }, [setActiveView]);

  const handleSaveFDA = useCallback((fdaData) => {
    const timestamped = {
      ...fdaData,
      updated_at: new Date().toISOString()
    };
    setFdaRegistrations(prev => {
      let updated;
      if (timestamped.id) {
        updated = prev.map(f => f.id === timestamped.id ? timestamped : f);
      } else {
        const newFDA = {
          ...timestamped,
          id: 'fda-' + Date.now()
        };
        updated = [newFDA, ...prev];
      }
      try {
        localStorage.setItem('aeron_fda_registrations', JSON.stringify(updated));
        if (typeof window.syncToDB === 'function') {
          window.syncToDB('fda_registrations', updated);
        }
      } catch(e) {}
      return updated;
    });
    setIsFDAModalOpen(false);
    setEditingFDA(null);
  }, []);

  const handleDeleteFDA = useCallback((fdaId) => {
    if (window.confirm('คุณต้องการลบรายการ อย. นี้ใช่หรือไม่?')) {
      setFdaRegistrations(prev => {
        const updated = prev.filter(f => f.id !== fdaId);
        try {
          localStorage.setItem('aeron_fda_registrations', JSON.stringify(updated));
          if (typeof window.syncToDB === 'function') {
            window.syncToDB('fda_registrations', updated);
          }
        } catch(e) {}
        return updated;
      });
    }
  }, []);

  const handleDeleteProduct = useCallback((productId) => {
    if (window.confirm('คุณต้องการลบรายการสินค้านี้ใช่หรือไม่?')) {
      setProducts(prev => {
        const updated = prev.filter(p => p.id !== productId);
        try {
          localStorage.setItem('aeron_products', JSON.stringify(updated));
          if (typeof window.syncToDB === 'function') {
            window.syncToDB('products', updated);
          }
        } catch(e) {}
        return updated;
      });
    }
  }, []);

  return {
    productCategories, setProductCategories,
    handleUpdateCategories,
    products, setProducts,
    soldProducts, setSoldProducts,
    shipments, setShipments,
    repairTickets, setRepairTickets,
    fdaRegistrations, setFdaRegistrations,
    isProductModalOpen, setIsProductModalOpen,
    editingProduct, setEditingProduct,
    isSoldModalOpen, setIsSoldModalOpen,
    editingSoldAsset, setEditingSoldAsset,
    isShipmentModalOpen, setIsShipmentModalOpen,
    editingShipment, setEditingShipment,
    isRepairModalOpen, setIsRepairModalOpen,
    editingRepairTicket, setEditingRepairTicket,
    isFDAModalOpen, setIsFDAModalOpen,
    editingFDA, setEditingFDA,
    handleSaveProduct,
    handleDeleteProduct,
    handleSaveSoldAsset,
    handleDeleteSoldAsset,
    handleSaveShipment,
    handleDeleteShipment,
    handleSaveRepairTicket,
    handleDeleteRepairTicket,
    handleOpenRepairFromCatalog,
    handleSaveFDA,
    handleDeleteFDA
  };
}

window.useAeronLogistics = useAeronLogistics;
