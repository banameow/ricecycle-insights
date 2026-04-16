import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useData, Delivery } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

function generateBatchId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `BATCH-${date}-${seq}`;
}

const Sourcing = () => {
  const { t } = useLang();
  const { deliveries, addDelivery, updateDelivery } = useData();

  const [supplierId, setSupplierId] = useState("");
  const [weight, setWeight] = useState("");
  const [moisture, setMoisture] = useState("");
  const [acidity, setAcidity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const m = parseFloat(moisture);
    const a = parseFloat(acidity);

    if (!supplierId || isNaN(w) || isNaN(m) || isNaN(a)) {
      toast.error(t("Please fill all fields correctly", "กรุณากรอกข้อมูลให้ครบถ้วน"));
      return;
    }

    const delivery: Delivery = {
      id: crypto.randomUUID(),
      supplierId,
      weight: w,
      moisture: m,
      acidity: a,
      status: "Pending",
      batchId: null,
      date: new Date().toISOString(),
    };

    addDelivery(delivery);
    toast.success(t("Delivery recorded", "บันทึกการจัดส่งแล้ว"));
    setSupplierId("");
    setWeight("");
    setMoisture("");
    setAcidity("");
  };

  const handleApprove = (id: string) => {
    const d = deliveries.find((del) => del.id === id);
    if (!d) return;

    if (d.moisture > 14 || d.acidity > 5) {
      toast.error(
        t(
          `Quality check failed! Moisture: ${d.moisture.toFixed(2)}% (max 14%), Acidity: ${d.acidity.toFixed(2)} (max 5)`,
          `ตรวจสอบคุณภาพไม่ผ่าน! ความชื้น: ${d.moisture.toFixed(2)}% (สูงสุด 14%), ความเป็นกรด: ${d.acidity.toFixed(2)} (สูงสุด 5)`
        )
      );
      updateDelivery(id, { status: "Rejected" });
      return;
    }

    const batchId = generateBatchId();
    updateDelivery(id, { status: "Approved", batchId });
    toast.success(t(`Approved! Batch ID: ${batchId}`, `อนุมัติแล้ว! รหัสแบทช์: ${batchId}`));
  };

  const handleReject = (id: string) => {
    updateDelivery(id, { status: "Rejected" });
    toast.warning(t("Delivery rejected", "ปฏิเสธการจัดส่ง"));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Sourcing & Quality Control", "การจัดหาและควบคุมคุณภาพ")}</h1>
        <p className="text-muted-foreground">
          {t("Record deliveries and perform quality checks", "บันทึกการจัดส่งและตรวจสอบคุณภาพ")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("New Delivery", "การจัดส่งใหม่")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t("Supplier ID", "รหัสผู้จัดหา")}</Label>
              <Input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder="SUP-001" />
            </div>
            <div className="space-y-2">
              <Label>{t("Total Weight (kg)", "น้ำหนักรวม (กก.)")}</Label>
              <Input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="1000" />
            </div>
            <div className="space-y-2">
              <Label>{t("Moisture %", "ความชื้น %")}</Label>
              <Input type="number" step="0.01" value={moisture} onChange={(e) => setMoisture(e.target.value)} placeholder="12.5" />
            </div>
            <div className="space-y-2">
              <Label>{t("Acidity Level", "ระดับความเป็นกรด")}</Label>
              <Input type="number" step="0.01" value={acidity} onChange={(e) => setAcidity(e.target.value)} placeholder="3.2" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit">{t("Record Delivery", "บันทึกการจัดส่ง")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Delivery History", "ประวัติการจัดส่ง")}</CardTitle>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("No deliveries recorded yet", "ยังไม่มีบันทึกการจัดส่ง")}</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Batch ID", "รหัสแบทช์")}</TableHead>
                    <TableHead>{t("Supplier", "ผู้จัดหา")}</TableHead>
                    <TableHead>{t("Weight (kg)", "น้ำหนัก (กก.)")}</TableHead>
                    <TableHead>{t("Moisture %", "ความชื้น %")}</TableHead>
                    <TableHead>{t("Acidity", "ความเป็นกรด")}</TableHead>
                    <TableHead>{t("Status", "สถานะ")}</TableHead>
                    <TableHead>{t("Actions", "การดำเนินการ")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs">{d.batchId || "—"}</TableCell>
                      <TableCell>{d.supplierId}</TableCell>
                      <TableCell>{d.weight.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={d.moisture > 14 ? "text-destructive font-medium" : ""}>
                          {d.moisture.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={d.acidity > 5 ? "text-destructive font-medium" : ""}>
                          {d.acidity.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={d.status === "Approved" ? "default" : d.status === "Rejected" ? "destructive" : "secondary"}
                          className={d.status === "Approved" ? "bg-accent text-accent-foreground" : ""}
                        >
                          {d.status === "Approved" ? <CheckCircle className="h-3 w-3 mr-1" /> : d.status === "Rejected" ? <XCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {d.status === "Pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleApprove(d.id)}>
                              {t("Approve", "อนุมัติ")}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(d.id)}>
                              {t("Reject", "ปฏิเสธ")}
                            </Button>
                          </div>
                        )}
                      </TableCell>
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

export default Sourcing;
