import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Delivery {
  id: string;
  supplierId: string;
  arrivalTime: string;
  weight: number;
  moisture: number;
  acidity: number;
  inspectionStatus: "Pending" | "Inspected" | "Failed";
  status: "Approved" | "Rejected" | "Pending";
  batchId: string | null;
  date: string;
}

export interface ProductionLog {
  id: string;
  machineId: string;
  batchId: string;
  rawWeight: number;
  crudeOilLiters: number;
  residualBiomass: number;
  startTime: string;
  endTime: string;
  efficiency: number;
  temperature: number;
  pressure: number;
  date: string;
}

export interface Order {
  id: string;
  customerType: "B2B" | "B2C";
  customerName: string;
  product: string;
  quantity: number;
  packagingSpec: string;
  status: "Pending" | "Shipped" | "Delivered";
  date: string;
}

export interface Feedback {
  id: string;
  customerName: string;
  orderId: string;
  rating: number;
  comment: string;
  resolved: boolean;
  date: string;
}

export interface WarehouseLog {
  id: string;
  product: "riceBranOil" | "bioFuel" | "organicFertilizer";
  change: number;
  reason: string;
  operator: string;
  date: string;
}

interface Inventory {
  riceBranOil: number;
  bioFuel: number;
  organicFertilizer: number;
}

interface DataContextType {
  deliveries: Delivery[];
  addDelivery: (d: Delivery) => void;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  productionLogs: ProductionLog[];
  addProductionLog: (p: ProductionLog) => void;
  orders: Order[];
  addOrder: (o: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  inventory: Inventory;
  setInventory: (i: Inventory) => void;
  adjustInventory: (product: keyof Inventory, change: number, reason: string, operator: string) => void;
  feedback: Feedback[];
  addFeedback: (f: Feedback) => void;
  updateFeedback: (id: string, updates: Partial<Feedback>) => void;
  warehouseLogs: WarehouseLog[];
}

const defaults: {
  deliveries: Delivery[];
  productionLogs: ProductionLog[];
  orders: Order[];
  inventory: Inventory;
  feedback: Feedback[];
  warehouseLogs: WarehouseLog[];
} = {
  deliveries: [],
  productionLogs: [],
  orders: [],
  inventory: { riceBranOil: 5000, bioFuel: 2000, organicFertilizer: 3000 },
  feedback: [],
  warehouseLogs: [],
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => load("ripms_deliveries", defaults.deliveries));
  const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(() => load("ripms_production", defaults.productionLogs));
  const [orders, setOrders] = useState<Order[]>(() => load("ripms_orders", defaults.orders));
  const [inventory, setInventory] = useState<Inventory>(() => load("ripms_inventory", defaults.inventory));
  const [feedback, setFeedback] = useState<Feedback[]>(() => load("ripms_feedback", defaults.feedback));
  const [warehouseLogs, setWarehouseLogs] = useState<WarehouseLog[]>(() => load("ripms_warehouse", defaults.warehouseLogs));

  useEffect(() => localStorage.setItem("ripms_deliveries", JSON.stringify(deliveries)), [deliveries]);
  useEffect(() => localStorage.setItem("ripms_production", JSON.stringify(productionLogs)), [productionLogs]);
  useEffect(() => localStorage.setItem("ripms_orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("ripms_inventory", JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem("ripms_feedback", JSON.stringify(feedback)), [feedback]);
  useEffect(() => localStorage.setItem("ripms_warehouse", JSON.stringify(warehouseLogs)), [warehouseLogs]);

  const addDelivery = (d: Delivery) => setDeliveries((prev) => [d, ...prev]);
  const updateDelivery = (id: string, updates: Partial<Delivery>) =>
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

  const addProductionLog = (p: ProductionLog) => {
    setProductionLogs((prev) => [p, ...prev]);
    // Auto-update inventory from production output
    setInventory((inv) => ({
      ...inv,
      riceBranOil: inv.riceBranOil + p.crudeOilLiters,
      organicFertilizer: inv.organicFertilizer + p.residualBiomass * 0.6,
      bioFuel: inv.bioFuel + p.residualBiomass * 0.2,
    }));
    setWarehouseLogs((prev) => [
      {
        id: crypto.randomUUID(),
        product: "riceBranOil",
        change: p.crudeOilLiters,
        reason: `Production from ${p.batchId}`,
        operator: "System (Production)",
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addOrder = (o: Order) => {
    setOrders((prev) => [o, ...prev]);
    const key: keyof Inventory =
      o.product === "Rice Bran Oil" ? "riceBranOil" : o.product === "Bio-fuel" ? "bioFuel" : "organicFertilizer";
    setInventory((inv) => ({ ...inv, [key]: inv[key] - o.quantity }));
    setWarehouseLogs((prev) => [
      {
        id: crypto.randomUUID(),
        product: key,
        change: -o.quantity,
        reason: `Order ${o.id}`,
        operator: "System (Sales)",
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const updateOrder = (id: string, updates: Partial<Order>) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));

  const adjustInventory = (product: keyof Inventory, change: number, reason: string, operator: string) => {
    setInventory((inv) => ({ ...inv, [product]: Math.max(0, inv[product] + change) }));
    setWarehouseLogs((prev) => [
      { id: crypto.randomUUID(), product, change, reason, operator, date: new Date().toISOString() },
      ...prev,
    ]);
  };

  const addFeedback = (f: Feedback) => setFeedback((prev) => [f, ...prev]);
  const updateFeedback = (id: string, updates: Partial<Feedback>) =>
    setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));

  return (
    <DataContext.Provider
      value={{
        deliveries,
        addDelivery,
        updateDelivery,
        productionLogs,
        addProductionLog,
        orders,
        addOrder,
        updateOrder,
        inventory,
        setInventory,
        adjustInventory,
        feedback,
        addFeedback,
        updateFeedback,
        warehouseLogs,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
