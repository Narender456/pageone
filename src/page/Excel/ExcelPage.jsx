
import { BlindingStatusManagement } from "../../components/BlindingStatus/BlindingStatusManagement"
import { DrugsManagement } from "../../components/Drugs/DrugsManagement"
import { ExcelManagement } from "../../components/Excel/ExcelManagement"
import { AppSidebar } from "../../components/layout/app-sidebar" 
import { DashboardHeader } from "../../components/layout/dashboard-header"
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"



export default function ExcelPage() {
  return (
  
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <ExcelManagement />
          </div>
        </SidebarInset>
      </SidebarProvider>
   
  )
}
