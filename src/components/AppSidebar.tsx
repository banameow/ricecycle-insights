import { Wheat, Factory, Truck, LayoutDashboard, Warehouse, MessageSquare } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { t } = useLang();

  const items = [
    { title: t("Dashboard", "แดชบอร์ด"), url: "/", icon: LayoutDashboard },
    { title: t("Sourcing & Quality", "จัดหาและคุณภาพ"), url: "/sourcing", icon: Wheat },
    { title: t("Production", "การผลิต"), url: "/production", icon: Factory },
    { title: t("Orders & Logistics", "คำสั่งซื้อและโลจิสติกส์"), url: "/logistics", icon: Truck },
    { title: t("Warehouse", "คลังสินค้า"), url: "/warehouse", icon: Warehouse },
    { title: t("Customer Feedback", "ความคิดเห็นลูกค้า"), url: "/feedback", icon: MessageSquare },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm">
            RC
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-sm text-sidebar-foreground">RiceCycle</p>
              <p className="text-xs text-sidebar-foreground/60">RIPMS</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            {!collapsed && t("Modules", "โมดูล")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
