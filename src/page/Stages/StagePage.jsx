
import { BlindingStatusManagement } from "../../components/BlindingStatus/BlindingStatusManagement"
import { AppSidebar } from "../../components/layout/app-sidebar" 
import { DashboardHeader } from "../../components/layout/dashboard-header"
import { SiteManagement } from "../../components/Site/SiteManagement"
import { StudyManagement } from "../../components/studies/study-management"
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"
import StageList from "./StageList"



export default function StagePage() {
  return (
  
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
            <StageList />
          </div>
        </SidebarInset>
      </SidebarProvider>
   
  )
}
