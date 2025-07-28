
import { BlindingStatusManagement } from "../../components/BlindingStatus/BlindingStatusManagement"
import { AppSidebar } from "../../components/layout/app-sidebar" 
import { DashboardHeader } from "../../components/layout/dashboard-header"
import { MenuOptionManagement } from "../../components/menu-options/menu-option-management"
import { SiteManagement } from "../../components/Site/SiteManagement"
import { StudyManagement } from "../../components/studies/study-management"
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"




export default function MenuOptionsPage() {
  return (
  
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <MenuOptionManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
   
  )
}
