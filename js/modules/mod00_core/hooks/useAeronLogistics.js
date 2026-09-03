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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return (window.PRODUCT_CATEGORIES && window.PRODUCT_CATEGORIES.length > 0) ? window.PRODUCT_CATEGORIES : [
        'Traction Frame ตัวต่อเสริม เตียงในการผ่ากระดูก ( Fracture Table)',
        'เครื่องช่วยหายใจ (Ventilator)',
        'เครื่องมือแพทย์อื่นๆ',
        'Power drill (ปืน,สว่าน เจาะกระดูก)'
      ];
    } catch(e) {
      return window.PRODUCT_CATEGORIES || [];
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
    setProductCategories(updatedList);
  }, []);

  // 1. Central Product Catalog State (No hardcoded resurrection)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_products');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return (window.CENTRAL_PRODUCT_CATALOG && Array.isArray(window.CENTRAL_PRODUCT_CATALOG)) ? window.CENTRAL_PRODUCT_CATALOG : [];
    } catch (e) {
      return [];
    }
  });

  // 2. Delivered / Sold Products State (Assets)
  const [soldProducts, setSoldProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_sold_products');
      return saved ? JSON.parse(saved) : window.INITIAL_SOLD_PRODUCTS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_sold_products:', e);
      return window.INITIAL_SOLD_PRODUCTS || [];
    }
  });

  // 3. Import Logistics / Shipments State
  const [shipments, setShipments] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_shipments');
      return saved ? JSON.parse(saved) : window.INITIAL_SHIPMENTS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_shipments:', e);
      return window.INITIAL_SHIPMENTS || [];
    }
  });

  // 4. Repair Tickets State
  const [repairTickets, setRepairTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_repair_tickets');
      return saved ? JSON.parse(saved) : window.INITIAL_REPAIR_TICKETS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_repair_tickets:', e);
      return window.INITIAL_REPAIR_TICKETS || [];
    }
  });

  // 5. Thai FDA Registrations State
  const [fdaRegistrations, setFdaRegistrations] = useState(() => {
    try {
      const saved = localStorage.getItem('aeron_fda_registrations');
      return saved ? JSON.parse(saved) : window.INITIAL_FDA_REGISTRATIONS || [];
    } catch (e) {
      console.warn('localStorage parse fallback for aeron_fda_registrations:', e);
      return window.INITIAL_FDA_REGISTRATIONS || [];
    }
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

  // ⚡ Live Cloud Sync & Local Storage Persistence (Guarded against Mount Overwrite)

  useEffect(() => {
    localStorage.setItem('aeron_products', JSON.stringify(products));
    if (isHydrated.current && typeof syncToDB === 'function') {
      syncToDB('products', products);
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aeron_sold_products', JSON.stringify(soldProducts));
    if (isHydrated.current && typeof syncToDB === 'function') {
      syncToDB('sold_products', soldProducts);
    }
  }, [soldProducts]);

  useEffect(() => {
    localStorage.setItem('aeron_shipments', JSON.stringify(shipments));
    if (isHydrated.current && typeof syncToDB === 'function') {
      syncToDB('shipments', shipments);
    }
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('aeron_repair_tickets', JSON.stringify(repairTickets));
    if (isHydrated.current && typeof syncToDB === 'function') {
      syncToDB('repair_tickets', repairTickets);
    }
  }, [repairTickets]);

  useEffect(() => {
    localStorage.setItem('aeron_fda_registrations', JSON.stringify(fdaRegistrations));
    if (isHydrated.current && typeof syncToDB === 'function') {
      syncToDB('fda_registrations', fdaRegistrations);
    }
  }, [fdaRegistrations]);

  // ⚡ Universal Hydration with Focus Listener & Heartbeat Poller
  useEffect(() => {
    let isMounted = true;
    async function hydrateLogisticsFromCloud() {
      try {
        const fetcher = window.loadFromDB || (typeof loadFromDB === 'function' ? loadFromDB : null);
        if (!fetcher) return;

        // 1. Products (Authoritative Cloud State)
        const remoteProducts = await fetcher('products', null);
        if (isMounted && Array.isArray(remoteProducts)) {
          setProducts(remoteProducts);
          localStorage.setItem('aeron_products', JSON.stringify(remoteProducts));
        }

        // 2. Categories
        const remoteCategories = await fetcher('product_categories', null);
        if (isMounted && Array.isArray(remoteCategories) && remoteCategories.length > 0) {
          setProductCategories(remoteCategories);
          localStorage.setItem('aeron_product_categories', JSON.stringify(remoteCategories));
          window.PRODUCT_CATEGORIES = remoteCategories;
        }

        // 3. Sold Products
        const remoteSold = await fetcher('sold_products', null);
        if (isMounted && Array.isArray(remoteSold)) {
          setSoldProducts(remoteSold);
          localStorage.setItem('aeron_sold_products', JSON.stringify(remoteSold));
        }

        // 4. Shipments
        const remoteShipments = await fetcher('shipments', null);
        if (isMounted && Array.isArray(remoteShipments)) {
          setShipments(remoteShipments);
          localStorage.setItem('aeron_shipments', JSON.stringify(remoteShipments));
        }

        // 5. Repair Tickets
        const remoteRepairs = await fetcher('repair_tickets', null);
        if (isMounted && Array.isArray(remoteRepairs)) {
          setRepairTickets(remoteRepairs);
          localStorage.setItem('aeron_repair_tickets', JSON.stringify(remoteRepairs));
        }

        // 6. FDA Registrations
        const remoteFDA = await fetcher('fda_registrations', null);
        if (isMounted && Array.isArray(remoteFDA)) {
          setFdaRegistrations(remoteFDA);
          localStorage.setItem('aeron_fda_registrations', JSON.stringify(remoteFDA));
        }
      } catch (e) {
        console.warn('[Logistics Cloud Hydration Notice]:', e.message);
      } finally {
        if (isMounted) isHydrated.current = true;
      }
    }

    hydrateLogisticsFromCloud();

    window.addEventListener('focus', hydrateLogisticsFromCloud);
    const poller = setInterval(hydrateLogisticsFromCloud, 10000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', hydrateLogisticsFromCloud);
      clearInterval(poller);
    };
  }, []);

  // Handlers
  const handleSaveProduct = useCallback((productData) => {
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
  }, []);

  const handleSaveSoldAsset = useCallback((assetData) => {
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
  }, []);

  const handleDeleteSoldAsset = useCallback((assetId) => {
    if (window.confirm('คุณต้องการลบรายการเครื่องที่ส่งมอบนี้ใช่หรือไม่?')) {
      setSoldProducts(prev => prev.filter(a => a.id !== assetId));
    }
  }, []);

  const handleSaveShipment = useCallback((shipmentData) => {
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
  }, []);

  const handleDeleteShipment = useCallback((shipmentId) => {
    if (window.confirm('คุณต้องการลบรายการนำเข้าสินค้านี้ใช่หรือไม่?')) {
      setShipments(prev => prev.filter(s => s.id !== shipmentId));
    }
  }, []);

  const handleSaveRepairTicket = useCallback((ticketData) => {
    if (ticketData.id) {
      setRepairTickets(prev => prev.map(t => t.id === ticketData.id ? ticketData : t));
    } else {
      const newTicket = {
        ...ticketData,
        id: 'rep-' + Date.now()
      };
      setRepairTickets(prev => [newTicket, ...prev]);
    }

    // Auto Link back to Central Demo Catalog if category is "เครื่อง Demo"
    if (ticketData.category === 'เครื่อง Demo' && ticketData.sn) {
      const isFixed = ticketData.status === 'ซ่อมเสร็จแล้ว' || ticketData.status === 'ส่งคืนเรียบร้อย';
      const newUnitStatus = isFixed ? 'พร้อมใช้งาน' : 'ส่งซ่อม';

      setProducts(prevProducts => prevProducts.map(p => {
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
      }));
    }

    setIsRepairModalOpen(false);
    setEditingRepairTicket(null);
  }, []);

  const handleDeleteRepairTicket = useCallback((ticketId) => {
    if (window.confirm('คุณต้องการลบรายการส่งซ่อมนี้ใช่หรือไม่?')) {
      setRepairTickets(prev => prev.filter(t => t.id !== ticketId));
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
  }, []);

  const handleDeleteFDA = useCallback((fdaId) => {
    if (window.confirm('คุณต้องการลบรายการ อย. นี้ใช่หรือไม่?')) {
      setFdaRegistrations(prev => prev.filter(f => f.id !== fdaId));
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
