import { Routes, Route } from "react-router-dom";
import { useAuth } from "./lib/auth-context";
import AdminDashboard from "./components/layout/admin-dashboard";
import ProtectedRoute from "./components/layout/protected-route";
import LoginPage from "./page/login/LoginPage";
import user from "./components/User/User";
import UsersPage from "./page/User/UserPage";
import { StudyPhaseManagement } from "./components/study-phases/study-phase-management";
import { StudyManagement } from "./components/studies/study-management";
import StudiesPage from "./page/study/StudiesPage";
import StudyPhasePage from "./page/study/StudyPhasePage";
import StudyTypesPage from "./page/study/StudyTypesPage";
import StudyDesignsPage from "./page/study/StudyDesignsPage";
import BlindingStatuspage from "./page/study/BlindingStatuspage";
import SitePage from "./page/Site/SitePage";
import SponsorsPage from "./page/Sponsors/SponsorsPage";
import DrugsPage from "./page/Drugs/DrugsPage";
import DrugGroupsPage from "./page/Drugs/DrugGroupsPage";
import ExcelPage from "./page/Excel/ExcelPage";
import ShipmentList from "./page/Shipment/ShipmentList";
import AcknowledgeShipment from "./page/Shipment/AcknowledgeShipment";
import OllamaChat from "./OllamaChat";
import ShipmentPage from "./page/Shipment/ShipmentPage";
import RolesPage from "./page/role/RolesPage";
import StagePage from "./page/Stages/StagePage";
import MenuOptionsPage from "./page/MenuOption/MenuOptionsPage";
import PagesPage from "./page/pages/page";
import PageEditorPage from "./page/pages/editor/page";

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/users" element={
        <ProtectedRoute>
           <UsersPage />
        </ProtectedRoute>

       
      } 
      
        />
       <Route path="/studies" element={
        <ProtectedRoute>
           <StudiesPage />
        </ProtectedRoute>

       
      } 
        />
    
        <Route path="/study-phases" element={
        <ProtectedRoute>
           <StudyPhasePage />
        </ProtectedRoute>

       
      } 
        />
       <Route path="/study-type" element={
        <ProtectedRoute>
          <StudyTypesPage />
        </ProtectedRoute>

       
      } 
        />
      <Route path="/study-designs" element={
        <ProtectedRoute>
          <StudyDesignsPage />
        </ProtectedRoute>

       
      } 
        />

      <Route path="/blinding-status" element={
        <ProtectedRoute>
          <BlindingStatuspage />
        </ProtectedRoute>

       
      } 
        />
      <Route path="/site" element={
        <ProtectedRoute>
          <SitePage/>
        </ProtectedRoute>

       
      } 
        />
    <Route path="/sponsors" element={
        <ProtectedRoute>
          <SponsorsPage/>
        </ProtectedRoute>

       
      } 
        />
        <Route path="/drug" element={
        <ProtectedRoute>
          <DrugsPage/>
        </ProtectedRoute>

       
      } 
        />
     <Route path="/drug-group" element={
        <ProtectedRoute>
          <DrugGroupsPage/>
        </ProtectedRoute>

       
      } 
        />
     <Route path="/excel" element={
        <ProtectedRoute>
          <ExcelPage/>
        </ProtectedRoute>

       
      } 
        />
     <Route path="/shipment" element={
        <ProtectedRoute>
         <ShipmentPage />
        </ProtectedRoute>

       
      } 
        />
         <Route path="/acknowledge" element={
        <ProtectedRoute>
         <AcknowledgeShipment/>
        </ProtectedRoute>

       
      } 
        />
      <Route path="/role" element={
        <ProtectedRoute>
        <RolesPage />
        </ProtectedRoute>

       
      } 
        />
      <Route path="/stage" element={
        <ProtectedRoute>
        <StagePage />
        </ProtectedRoute>

       
      } 
        />
        <Route path="/menue" element={
        <ProtectedRoute>
        <MenuOptionsPage />
        </ProtectedRoute>

       
      } 
        />
        <Route path="/page" element={
        <ProtectedRoute>
        <PagesPage />
      </ProtectedRoute>

       
      } 
        />
      <Route
    path="/page-editor/:slug"
    element={
      <ProtectedRoute>
        <PageEditorPage />
      </ProtectedRoute>
    }
  />


    </Routes>
  );
}
