import { useState, useEffect } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useData, ProductionLog } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Thermometer, Gauge, Zap, AlertTriangle } from "lucide-react";

const TEMP_MIN = 160;
const TEMP_MAX = 180;
const PRES_MIN = 3.5;
const PRES_MAX = 5.0;

const MACHINES = ["MCH-001", "MCH-002", "MCH-003"];

const Production = () => {
  const { t } = useLang();
  const { deliveries, productionLogs, addProductionLog } = useData();
  const approvedBatches = deliveries.filter((d) => d.status === "Approved");

  const [machineId, setMachineId] = useState(MACHINES[0]);
  const [batchId, setBatchId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Simulated live data (auto-logged by the system)
  const [liveTemp, setLiveTemp] = useState(165);
  const [livePressure, setLivePressure] = useState(4.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTemp((prev) => Math.max(150, Math.min(200, prev + (Math.random() - 0.5) * 5)));
      setLivePressure((prev) => Math.max(3, Math.min(6, prev + (Math.random() - 0.5) * 0.4)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId || !startTime || !endTime) {
      toast.error(t("Please fill all fields", "กรุณากรอกข้อมูลให้ครบ"));
      return;
    }
    // Auto-captured environmental readings from live sensors
    const temp = liveTemp;
    const pres = livePressure;

    const batch = approvedBatches.find((d) => d.batchId === batchId);
    if (!batch) {
      toast.error(t("Batch not found", "ไม่พบแบทช์"));
      return;
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const hours = (end - start) / 3600000;

    if (hours <= 0) {
      toast.error(t("End time must be after start time", "เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น"));
      return;
    }

    const rawWeight = batch.weight;
    const crudeOilLiters = rawWeight * 0.18;
    const residualBiomass = rawWeight * 0.82;
    const efficiency = crudeOilLiters / hours;

    const log: ProductionLog = {
      id: crypto.randomUUID(),
      machineId,
      batchId,
      rawWeight,
      crudeOilLiters,
      residualBiomass,
      startTime,
      endTime,
      efficiency,
      temperature: temp,
      pressure: pres,
      date: new Date().toISOString(),
    };

    addProductionLog(log);
    toast.success(
      t(
        `Logged: ${crudeOilLiters.toFixed(2)} L oil, ${residualBiomass.toFixed(2)} kg biomass`,
        `บันทึก: น้ำมัน ${crudeOilLiters.toFixed(2)} ลิตร, ชีวมวล ${residualBiomass.toFixed(2)} กก.`
      )
    );
    setBatchId("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Production Monitoring", "การตรวจสอบการผลิต")}</h1>
        <p className="text-muted-foreground">{t("Track extraction and machine performance", "ติดตามการสกัดและประสิทธิภาพเครื่องจักร")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Temperature", "อุณหภูมิ")}</CardTitle>
            <Thermometer className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{liveTemp.toFixed(1)}°C</p>
            <p className="text-xs text-muted-foreground">{t("Target: 160-180°C", "เป้าหมาย: 160-180°C")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Pressure", "ความดัน")}</CardTitle>
            <Gauge className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{livePressure.toFixed(2)} bar</p>
            <p className="text-xs text-muted-foreground">{t("Target: 3.5-5.0 bar", "เป้าหมาย: 3.5-5.0 bar")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("Total Logs", "บันทึกทั้งหมด")}</CardTitle>
            <Zap className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{productionLogs.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Log Extraction (Technician Input)", "บันทึกการสกัด (ข้อมูลจากช่างเทคนิค)")}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {t(
              "Technician enters Machine ID and Start/End Times. Temperature & Pressure are auto-logged from live sensors.",
              "ช่างเทคนิคกรอกรหัสเครื่องจักรและเวลาเริ่ม/สิ้นสุด อุณหภูมิและความดันถูกบันทึกอัตโนมัติจากเซ็นเซอร์"
            )}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("Machine ID", "รหัสเครื่องจักร")}<span className="text-destructive"> *</span></Label>
              <Select value={machineId} onValueChange={setMachineId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MACHINES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Batch ID", "รหัสแบทช์")}<span className="text-destructive"> *</span></Label>
              <Select value={batchId} onValueChange={setBatchId}>
                <SelectTrigger><SelectValue placeholder={t("Select batch", "เลือกแบทช์")} /></SelectTrigger>
                <SelectContent>
                  {approvedBatches.map((b) => (
                    <SelectItem key={b.id} value={b.batchId!}>{b.batchId} ({b.weight.toFixed(0)} kg)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Start Time", "เวลาเริ่มต้น")}<span className="text-destructive"> *</span></Label>
              <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("End Time", "เวลาสิ้นสุด")}<span className="text-destructive"> *</span></Label>
              <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit">{t("Log Production", "บันทึกการผลิต")}</Button>
              <p className="text-xs text-muted-foreground mt-2">
                {t(
                  "System will calculate Oil Volume (L) = weight × 0.18 and Residual Biomass (kg) = weight × 0.82.",
                  "ระบบจะคำนวณปริมาณน้ำมัน (ลิตร) = น้ำหนัก × 0.18 และชีวมวลเหลือ (กก.) = น้ำหนัก × 0.82"
                )}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Production Log History", "ประวัติบันทึกการผลิต")}</CardTitle>
        </CardHeader>
        <CardContent>
          {productionLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("No production logs yet", "ยังไม่มีบันทึกการผลิต")}</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Machine", "เครื่องจักร")}</TableHead>
                    <TableHead>{t("Batch", "แบทช์")}</TableHead>
                    <TableHead>{t("Raw (kg)", "วัตถุดิบ (กก.)")}</TableHead>
                    <TableHead>{t("Oil (L)", "น้ำมัน (ลิตร)")}</TableHead>
                    <TableHead>{t("Biomass (kg)", "ชีวมวล (กก.)")}</TableHead>
                    <TableHead>{t("Efficiency (L/hr)", "ประสิทธิภาพ (ลิตร/ชม.)")}</TableHead>
                    <TableHead>{t("Temp °C", "อุณหภูมิ °C")}</TableHead>
                    <TableHead>{t("Pressure", "ความดัน")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionLogs.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.machineId}</TableCell>
                      <TableCell className="font-mono text-xs">{p.batchId}</TableCell>
                      <TableCell>{p.rawWeight.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">{p.crudeOilLiters.toFixed(2)}</TableCell>
                      <TableCell>{p.residualBiomass.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">{p.efficiency.toFixed(2)}</TableCell>
                      <TableCell>{p.temperature.toFixed(1)}</TableCell>
                      <TableCell>{p.pressure.toFixed(2)} bar</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Production;
