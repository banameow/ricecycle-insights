import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { lang, toggleLang, t } = useLang();

  const handleSync = () => {
    toast.success(t("Data Synchronized ✓", "ซิงค์ข้อมูลสำเร็จ ✓"), {
      description: new Date().toLocaleString(),
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 bg-card">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold text-foreground hidden sm:block">
                {t("RiceCycle Integrated Production Monitoring", "ระบบตรวจสอบการผลิตแบบบูรณาการ RiceCycle")}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSync}>
                <RefreshCw className="h-4 w-4 mr-1" />
                {t("Sync", "ซิงค์")}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleLang}>
                <Globe className="h-4 w-4 mr-1" />
                {lang === "en" ? "TH" : "EN"}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
