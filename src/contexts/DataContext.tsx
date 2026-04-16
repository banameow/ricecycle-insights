import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Delivery {
  id: string;
  supplierId: string;
  weight: number;
  moisture: number;
  acidity: number;
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
  status: "Pending" | "Shipped" | "Delivered";
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
}

const defaults: { deliveries: Delivery[]; productionLogs: ProductionLog[]; orders: Order[]; inventory: Inventory } = {
  deliveries: [],
  productionLogs: [],
  orders: [],
  inventory: { riceBranOil: 5000, bioFuel: 2000, organicFertilizer: 3000 },
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

  useEffect(() => localStorage.setItem("ripms_deliveries", JSON.stringify(deliveries)), [deliveries]);
  useEffect(() => localStorage.setItem("ripms_production", JSON.stringify(productionLogs)), [productionLogs]);
  useEffect(() => localStorage.setItem("ripms_orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("ripms_inventory", JSON.stringify(inventory)), [inventory]);

  const addDelivery = (d: Delivery) => setDeliveries((prev) => [d, ...prev]);
  const updateDelivery = (id: string, updates: Partial<Delivery>) =>
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

  const addProductionLog = (p: ProductionLog) => setProductionLogs((prev) => [p, ...prev]);

  const addOrder = (o: Order) => setOrders((prev) => [o, ...prev]);
  const updateOrder = (id: string, updates: Partial<Order>) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));

  return (
    <DataContext.Provider
      value={{ deliveries, addDelivery, updateDelivery, productionLogs, addProductionLog, orders, addOrder, updateOrder, inventory, setInventory }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
