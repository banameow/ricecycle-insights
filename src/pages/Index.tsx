import { useLang } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wheat, Factory, Truck, Package, MessageSquare, AlertTriangle } from "lucide-react";

const Index = () => {
  const { t } = useLang();
  const { deliveries, productionLogs, orders, inventory, feedback } = useData();

  const approvedDeliveries = deliveries.filter((d) => d.status === "Approved").length;
  const totalOilProduced = productionLogs.reduce((sum, p) => sum + p.crudeOilLiters, 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const openFeedback = feedback.filter((f) => !f.resolved).length;
  const lowStock = [inventory.riceBranOil, inventory.bioFuel, inventory.organicFertilizer].filter((v) => v < 1000).length;

  const stats = [
    { title: t("Approved Deliveries", "การจัดส่งที่อนุมัติ"), value: approvedDeliveries, icon: Wheat, color: "text-accent" },
    { title: t("Crude Oil Produced (L)", "น้ำมันดิบที่ผลิต (ลิตร)"), value: totalOilProduced.toFixed(2), icon: Factory, color: "text-primary" },
    { title: t("Pending Orders", "คำสั่งซื้อที่รอดำเนินการ"), value: pendingOrders, icon: Truck, color: "text-warning" },
    { title: t("Oil Inventory (L)", "คลังน้ำมัน (ลิตร)"), value: inventory.riceBranOil.toFixed(2), icon: Package, color: "text-primary" },
    { title: t("Open Feedback", "ความคิดเห็นที่เปิดอยู่"), value: openFeedback, icon: MessageSquare, color: "text-warning" },
    { title: t("Low Stock Alerts", "แจ้งเตือนสต็อกต่ำ"), value: lowStock, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Dashboard", "แดชบอร์ด")}</h1>
        <p className="text-muted-foreground">
          {t("Overview of RiceCycle factory operations", "ภาพรวมการดำเนินงานโรงงาน RiceCycle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("Recent Deliveries", "การจัดส่งล่าสุด")}</CardTitle>
          </CardHeader>
          <CardContent>
            {deliveries.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("No deliveries yet", "ยังไม่มีการจัดส่ง")}</p>
            ) : (
              <div className="space-y-2">
                {deliveries.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="font-medium">{d.batchId || d.id.slice(0, 8)}</span>
                    <span
                      className={
                        d.status === "Approved"
                          ? "text-accent font-medium"
                          : d.status === "Rejected"
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("Inventory Levels", "ระดับสินค้าคงคลัง")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: t("Rice Bran Oil", "น้ำมันรำข้าว"), value: inventory.riceBranOil, max: 10000 },
              { label: t("Bio-fuel", "เชื้อเพลิงชีวภาพ"), value: inventory.bioFuel, max: 5000 },
              { label: t("Organic Fertilizer", "ปุ๋ยอินทรีย์"), value: inventory.organicFertilizer, max: 8000 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value.toFixed(2)} kg/L</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
