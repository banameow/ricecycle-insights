import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { useData, Feedback as FeedbackType } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageSquare, Star } from "lucide-react";

const Feedback = () => {
  const { t } = useLang();
  const { orders, feedback, addFeedback, updateFeedback } = useData();

  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !comment) {
      toast.error(t("Please fill required fields", "กรุณากรอกข้อมูลที่จำเป็น"));
      return;
    }
    const f: FeedbackType = {
      id: crypto.randomUUID(),
      customerName,
      orderId: orderId || "—",
      rating: parseInt(rating),
      comment,
      resolved: false,
      date: new Date().toISOString(),
    };
    addFeedback(f);
    toast.success(t("Feedback submitted to Client Relations", "ส่งความคิดเห็นไปยังฝ่ายลูกค้าสัมพันธ์"));
    setCustomerName("");
    setOrderId("");
    setComment("");
    setRating("5");
  };

  const avgRating = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : 0;
  const unresolved = feedback.filter((f) => !f.resolved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Customer Feedback", "ความคิดเห็นลูกค้า")}</h1>
        <p className="text-muted-foreground">
          {t("Capture and route customer feedback to Client Relations", "บันทึกและส่งต่อความคิดเห็นไปยังฝ่ายลูกค้าสัมพันธ์")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("Total Feedback", "ความคิดเห็นทั้งหมด")}</CardTitle>
            <MessageSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{feedback.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("Avg Rating", "คะแนนเฉลี่ย")}</CardTitle>
            <Star className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{avgRating.toFixed(2)} / 5.00</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("Unresolved", "ยังไม่แก้ไข")}</CardTitle>
            <MessageSquare className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{unresolved}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("Submit Feedback", "ส่งความคิดเห็น")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("Customer Name", "ชื่อลูกค้า")}<span className="text-destructive"> *</span></Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("Order (optional)", "คำสั่งซื้อ (ไม่บังคับ)")}</Label>
              <Select value={orderId} onValueChange={setOrderId}>
                <SelectTrigger><SelectValue placeholder={t("Select order", "เลือกคำสั่งซื้อ")} /></SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.id} — {o.customerName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Rating", "คะแนน")}</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} ★</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("Comment", "ความคิดเห็น")}<span className="text-destructive"> *</span></Label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">{t("Submit to Client Relations", "ส่งไปยังฝ่ายลูกค้าสัมพันธ์")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("Feedback Queue", "คิวความคิดเห็น")}</CardTitle></CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("No feedback yet", "ยังไม่มีความคิดเห็น")}</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Date", "วันที่")}</TableHead>
                    <TableHead>{t("Customer", "ลูกค้า")}</TableHead>
                    <TableHead>{t("Order", "คำสั่งซื้อ")}</TableHead>
                    <TableHead>{t("Rating", "คะแนน")}</TableHead>
                    <TableHead>{t("Comment", "ความคิดเห็น")}</TableHead>
                    <TableHead>{t("Status", "สถานะ")}</TableHead>
                    <TableHead>{t("Action", "การดำเนินการ")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="text-xs">{new Date(f.date).toLocaleDateString()}</TableCell>
                      <TableCell>{f.customerName}</TableCell>
                      <TableCell className="font-mono text-xs">{f.orderId}</TableCell>
                      <TableCell>{f.rating} ★</TableCell>
                      <TableCell className="max-w-xs truncate">{f.comment}</TableCell>
                      <TableCell>
                        <Badge variant={f.resolved ? "default" : "secondary"} className={f.resolved ? "bg-accent text-accent-foreground" : ""}>
                          {f.resolved ? t("Resolved", "แก้ไขแล้ว") : t("Open", "เปิด")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!f.resolved && (
                          <Button size="sm" variant="outline" onClick={() => { updateFeedback(f.id, { resolved: true }); toast.success(t("Marked resolved", "ทำเครื่องหมายว่าแก้ไขแล้ว")); }}>
                            {t("Resolve", "แก้ไข")}
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
    </div>
  );
};

export default Feedback;
