import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Warehouse as WarehouseIcon, Package, AlertTriangle } from "lucide-react";

const PRODUCT_LABELS: Record<string, { en: string; th: string; unit: string }> = {
  riceBranOil: { en: "Rice Bran Oil", th: "น้ำมันรำข้าว", unit: "L" },
  bioFuel: { en: "Bio-fuel", th: "เชื้อเพลิงชีวภาพ", unit: "L" },
  organicFertilizer: { en: "Organic Fertilizer", th: "ปุ๋ยอินทรีย์", unit: "kg" },
};

const REORDER_THRESHOLD = 1000;

const Warehouse = () => {
  const { t } = useLang();
  const { inventory, adjustInventory, warehouseLogs } = useData();

  const [product, setProduct] = useState<"riceBranOil" | "bioFuel" | "organicFertilizer">("riceBranOil");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [amount, setAmount] = useState("");

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount);
    if (isNaN(a) || a <= 0) {
      toast.error(t("Please enter a valid amount", "กรุณากรอกจำนวนที่ถูกต้อง"));
      return;
    }
    const change = direction === "increase" ? a : -a;
    const reason = direction === "increase" ? "Manual increase" : "Manual decrease";
    adjustInventory(product, change, reason, "Warehouse");
    toast.success(t(`Inventory adjusted by ${change.toFixed(2)}`, `ปรับสินค้าคงคลัง ${change.toFixed(2)}`));
    setAmount("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Warehouse Coordination", "ประสานงานคลังสินค้า")}</h1>
        <p className="text-muted-foreground">
          {t("Monitor and adjust inventory levels", "ตรวจสอบและปรับระดับสินค้าคงคลัง")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.keys(PRODUCT_LABELS) as Array<keyof typeof inventory>).map((key) => {
          const label = PRODUCT_LABELS[key];
          const value = inventory[key];
          const low = value < REORDER_THRESHOLD;
          return (
            <Card key={key} className={low ? "border-destructive" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t(label.en, label.th)}</CardTitle>
                {low ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <Package className="h-5 w-5 text-primary" />}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {value.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{label.unit}</span>
                </p>
                {low && (
                  <p className="text-xs text-destructive mt-1">{t("Low stock — reorder needed", "สต็อกต่ำ — ต้องสั่งเพิ่ม")}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WarehouseIcon className="h-5 w-5" />
            {t("Inventory Adjustment", "ปรับปรุงสินค้าคงคลัง")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdjust} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t("Product", "สินค้า")}<span className="text-destructive"> *</span></Label>
              <Select value={product} onValueChange={(v) => setProduct(v as typeof product)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCT_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{t(v.en, v.th)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Operation", "การดำเนินการ")}<span className="text-destructive"> *</span></Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={direction === "increase" ? "default" : "outline"}
                  onClick={() => setDirection("increase")}
                  className={direction === "increase" ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}
                >
                  + {t("Increase", "เพิ่ม")}
                </Button>
                <Button
                  type="button"
                  variant={direction === "decrease" ? "default" : "outline"}
                  onClick={() => setDirection("decrease")}
                  className={direction === "decrease" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}
                >
                  − {t("Decrease", "ลด")}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("Amount", "จำนวน")}<span className="text-destructive"> *</span></Label>
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50.00" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">{t("Adjust", "ปรับ")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Warehouse Activity Log", "บันทึกกิจกรรมคลังสินค้า")}</CardTitle>
        </CardHeader>
        <CardContent>
          {warehouseLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("No warehouse activity yet", "ยังไม่มีกิจกรรม")}</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Date", "วันที่")}</TableHead>
                    <TableHead>{t("Product", "สินค้า")}</TableHead>
                    <TableHead>{t("Change", "เปลี่ยนแปลง")}</TableHead>
                    <TableHead>{t("Reason", "เหตุผล")}</TableHead>
                    <TableHead>{t("Operator", "ผู้ดำเนินการ")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseLogs.slice(0, 50).map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="text-xs">{new Date(w.date).toLocaleString()}</TableCell>
                      <TableCell>{t(PRODUCT_LABELS[w.product].en, PRODUCT_LABELS[w.product].th)}</TableCell>
                      <TableCell className={w.change >= 0 ? "text-accent font-medium" : "text-destructive font-medium"}>
                        {w.change >= 0 ? "+" : ""}{w.change.toFixed(2)}
                      </TableCell>
                      <TableCell>{w.reason}</TableCell>
                      <TableCell className="text-xs">{w.operator}</TableCell>
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

export default Warehouse;
