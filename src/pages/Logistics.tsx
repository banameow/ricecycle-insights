import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useData, Order } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileText, Package } from "lucide-react";

function genOrderId(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

const PRODUCTS = ["Rice Bran Oil", "Bio-fuel", "Organic Fertilizer"];

const Logistics = () => {
  const { t } = useLang();
  const { orders, addOrder, updateOrder, inventory } = useData();

  const [customerType, setCustomerType] = useState<"B2B" | "B2C">("B2B");
  const [customerName, setCustomerName] = useState("");
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [quantity, setQuantity] = useState("");
  const [packagingSpec, setPackagingSpec] = useState("");
  const [qualityCertificate, setQualityCertificate] = useState("");
  const [certOpen, setCertOpen] = useState(false);
  const [certOrder, setCertOrder] = useState<Order | null>(null);

  const defaultPackaging = (type: "B2B" | "B2C") => (type === "B2B" ? "Bulk 200L drum" : "Retail 1L bottle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!customerName || isNaN(qty) || qty <= 0) {
      toast.error(t("Please fill all fields correctly", "กรุณากรอกข้อมูลให้ครบถ้วน"));
      return;
    }
    if (customerType === "B2B" && !qualityCertificate.trim()) {
      toast.error(t("B2B orders require a Quality Certificate reference", "คำสั่งซื้อ B2B ต้องระบุเลขใบรับรองคุณภาพ"));
      return;
    }

    const invKey = product === "Rice Bran Oil" ? "riceBranOil" : product === "Bio-fuel" ? "bioFuel" : "organicFertilizer";
    if (inventory[invKey] < qty) {
      toast.error(t(`Insufficient inventory for ${product}`, `สินค้าคงคลังไม่เพียงพอสำหรับ ${product}`));
      return;
    }

    const order: Order = {
      id: genOrderId(),
      customerType,
      customerName,
      product,
      quantity: qty,
      packagingSpec: packagingSpec || defaultPackaging(customerType),
      qualityCertificate: qualityCertificate.trim() || "—",
      status: "Pending",
      date: new Date().toISOString(),
    };

    addOrder(order);
    toast.success(t(`Order ${order.id} created`, `สร้างคำสั่งซื้อ ${order.id} แล้ว`));
    setCustomerName("");
    setQuantity("");
    setPackagingSpec("");
    setQualityCertificate("");
  };

  const handleStatusChange = (id: string, status: "Pending" | "Shipped" | "Delivered") => {
    updateOrder(id, { status });
    toast.success(t(`Order updated to ${status}`, `อัพเดทคำสั่งซื้อเป็น ${status}`));
  };

  const handleCert = (order: Order) => {
    setCertOrder(order);
    setCertOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Orders & Logistics", "คำสั่งซื้อและโลจิสติกส์")}</h1>
        <p className="text-muted-foreground">{t("Manage orders, deliveries, and inventory", "จัดการคำสั่งซื้อ การจัดส่ง และสินค้าคงคลัง")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t("Rice Bran Oil", "น้ำมันรำข้าว"), value: inventory.riceBranOil, unit: "L" },
          { label: t("Bio-fuel", "เชื้อเพลิงชีวภาพ"), value: inventory.bioFuel, unit: "L" },
          { label: t("Organic Fertilizer", "ปุ๋ยอินทรีย์"), value: inventory.organicFertilizer, unit: "kg" },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <Package className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{item.value.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Create Order", "สร้างคำสั่งซื้อ")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("Customer Type", "ประเภทลูกค้า")}</Label>
              <Select value={customerType} onValueChange={(v) => setCustomerType(v as "B2B" | "B2C")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="B2C">B2C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Customer Name", "ชื่อลูกค้า")}</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t("Hospital/Company", "โรงพยาบาล/บริษัท")} />
            </div>
            <div className="space-y-2">
              <Label>{t("Product Type", "ประเภทสินค้า")}</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Order Quantity", "จำนวนสั่งซื้อ")}</Label>
              <Input type="number" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label>{t("Packaging Spec", "บรรจุภัณฑ์")}</Label>
              <Input value={packagingSpec} onChange={(e) => setPackagingSpec(e.target.value)} placeholder={defaultPackaging(customerType)} />
            </div>
            <div className="space-y-2">
              <Label>
                {t("Quality Certificate", "ใบรับรองคุณภาพ")}
                {customerType === "B2B" && <span className="text-destructive"> *</span>}
              </Label>
              <Input
                value={qualityCertificate}
                onChange={(e) => setQualityCertificate(e.target.value)}
                placeholder={customerType === "B2B" ? "QC-2024-001" : t("Optional", "ไม่บังคับ")}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" className="w-full sm:w-auto">{t("Create Order", "สร้างคำสั่งซื้อ")}</Button>
              <p className="text-xs text-muted-foreground mt-2">
                {t(
                  "System returns Order ID, current Inventory Level, and Delivery Status.",
                  "ระบบจะส่งคืนรหัสคำสั่งซื้อ, ระดับสินค้าคงคลังปัจจุบัน และสถานะการจัดส่ง"
                )}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Order History", "ประวัติคำสั่งซื้อ")}</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("No orders yet", "ยังไม่มีคำสั่งซื้อ")}</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Order ID", "รหัสคำสั่งซื้อ")}</TableHead>
                    <TableHead>{t("Type", "ประเภท")}</TableHead>
                    <TableHead>{t("Customer", "ลูกค้า")}</TableHead>
                    <TableHead>{t("Product", "สินค้า")}</TableHead>
                    <TableHead>{t("Qty", "จำนวน")}</TableHead>
                    <TableHead>{t("Packaging", "บรรจุภัณฑ์")}</TableHead>
                    <TableHead>{t("Status", "สถานะ")}</TableHead>
                    <TableHead>{t("Actions", "การดำเนินการ")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id}</TableCell>
                      <TableCell>
                        <Badge variant={o.customerType === "B2B" ? "default" : "secondary"}>{o.customerType}</Badge>
                      </TableCell>
                      <TableCell>{o.customerName}</TableCell>
                      <TableCell>{o.product}</TableCell>
                      <TableCell>{o.quantity.toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{o.packagingSpec}</TableCell>
                      <TableCell>
                        <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v as Order["status"])}>
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">{t("Pending", "รอดำเนินการ")}</SelectItem>
                            <SelectItem value="Shipped">{t("Shipped", "จัดส่งแล้ว")}</SelectItem>
                            <SelectItem value="Delivered">{t("Delivered", "ส่งถึงแล้ว")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {o.customerType === "B2B" && (
                          <Button size="sm" variant="outline" onClick={() => handleCert(o)}>
                            <FileText className="h-3 w-3 mr-1" />
                            {t("Certificate", "ใบรับรอง")}
                          </Button>
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

      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Quality Certificate", "ใบรับรองคุณภาพ")}</DialogTitle>
          </DialogHeader>
          {certOrder && (
            <div className="border-2 border-primary rounded-lg p-6 space-y-4">
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold text-primary">RiceCycle Co., Ltd.</h2>
                <p className="text-sm text-muted-foreground">{t("Quality Certificate", "ใบรับรองคุณภาพ")}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t("Order ID", "รหัสคำสั่งซื้อ")}</p>
                  <p className="font-mono font-medium">{certOrder.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("Date", "วันที่")}</p>
                  <p className="font-medium">{new Date(certOrder.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("Customer", "ลูกค้า")}</p>
                  <p className="font-medium">{certOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("Product", "สินค้า")}</p>
                  <p className="font-medium">{certOrder.product}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("Quantity", "จำนวน")}</p>
                  <p className="font-medium">{certOrder.quantity.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("Grade", "เกรด")}</p>
                  <p className="font-medium text-accent">A — {t("Premium Quality", "คุณภาพพรีเมียม")}</p>
                </div>
              </div>
              <div className="border-t pt-4 text-center">
                <p className="text-xs text-muted-foreground">{t("This certifies the product meets all quality standards.", "ใบรับรองนี้ยืนยันว่าผลิตภัณฑ์เป็นไปตามมาตรฐานคุณภาพทั้งหมด")}</p>
                <p className="mt-2 font-semibold text-sm">✓ {t("Verified by Quality Control", "ตรวจสอบโดยฝ่ายควบคุมคุณภาพ")}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Logistics;
