import { PageManagement } from "../../components/pages/page-management"; 
import { studiesApi } from "../../lib/studies-api";
import { siteAPI } from "../../lib/SiteAPI"; 
import { stagesAPI } from "../../lib/stagesAPI"; 
;

export default async function PagesPage() {
  // Fetch initial data
  const [studiesResponse, sitesResponse, stagesResponse] = await Promise.all([
    studiesApi.getStudies(),
    siteAPI.getSites(),
    stagesAPI.getStages(),
  ]);

  const studies = studiesResponse.success ? studiesResponse.data : [];
  const sites = sitesResponse.success ? sitesResponse.data : [];
  const stages = stagesResponse.success ? stagesResponse.data : [];

  return (
    <div className="container mx-auto py-6">
      <PageManagement studies={studies} sites={sites} stages={stages} />
    </div>
  );
}
