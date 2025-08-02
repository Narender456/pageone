"use client";

import { useState, useEffect } from "react";
import { PageManagement } from "../../components/pages/page-management"; 
import { studiesApi } from "../../lib/studies-api";
import { siteAPI } from "../../lib/SiteAPI"; 
import { stagesAPI } from "../../lib/stagesAPI";
import { useRateLimitHandler } from "../../components/ui/rate-limit-handler";

export default function PagesPage() {
  const [data, setData] = useState({
    studies: [],
    sites: [],
    stages: [],
    loading: true,
    initialized: false
  });

  const { isLoading, isRateLimited, error, handleApiCall, RateLimitHandler } = useRateLimitHandler();

  const fetchInitialData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));

      const responses = await handleApiCall(async () => {
        const [studiesResponse, sitesResponse, stagesResponse] = await Promise.allSettled([
          studiesApi.getStudies(),
          siteAPI.getSites(),
          stagesAPI.getAll(),
        ]);

        // Process studies response
        let studies = [];
        if (studiesResponse.status === 'fulfilled' && studiesResponse.value) {
          if (studiesResponse.value.success && studiesResponse.value.data) {
            studies = Array.isArray(studiesResponse.value.data) ? studiesResponse.value.data : [];
          } else if (Array.isArray(studiesResponse.value)) {
            studies = studiesResponse.value;
          }
        }

        // Process sites response  
        let sites = [];
        if (sitesResponse.status === 'fulfilled' && sitesResponse.value) {
          if (sitesResponse.value.success && sitesResponse.value.data) {
            sites = Array.isArray(sitesResponse.value.data) ? sitesResponse.value.data : [];
          } else if (Array.isArray(sitesResponse.value)) {
            sites = sitesResponse.value;
          }
        }

        // Process stages response with improved handling
        let stages = [];
        console.log('=== STAGES DEBUG INFO ===');
        console.log('stagesResponse.status:', stagesResponse.status);
        console.log('stagesResponse.value:', stagesResponse.value);
        
        if (stagesResponse.status === 'fulfilled' && stagesResponse.value) {
          console.log('Raw stages response:', stagesResponse.value);
          console.log('Response type:', typeof stagesResponse.value);
          console.log('Response keys:', Object.keys(stagesResponse.value));
          
          // Handle various response formats
          if (stagesResponse.value.success && stagesResponse.value.data) {
            console.log('Format 1: response.success.data');
            console.log('stagesResponse.value.data:', stagesResponse.value.data);
            stages = Array.isArray(stagesResponse.value.data) ? stagesResponse.value.data : [];
          } else if (Array.isArray(stagesResponse.value)) {
            console.log('Format 2: direct array');
            stages = stagesResponse.value;
          } else if (stagesResponse.value.data && Array.isArray(stagesResponse.value.data)) {
            console.log('Format 3: response.data array');
            stages = stagesResponse.value.data;
          } else {
            console.log('Unknown format, checking for other possible structures...');
            console.log('Checking for stages property:', stagesResponse.value.stages);
            console.log('Checking for results property:', stagesResponse.value.results);
            
            // Try other common response formats
            if (stagesResponse.value.stages && Array.isArray(stagesResponse.value.stages)) {
              stages = stagesResponse.value.stages;
            } else if (stagesResponse.value.results && Array.isArray(stagesResponse.value.results)) {
              stages = stagesResponse.value.results;
            } else if (stagesResponse.value.items && Array.isArray(stagesResponse.value.items)) {
              stages = stagesResponse.value.items;
            }
          }

          console.log('Stages before normalization:', stages);
          console.log('Stages array length:', stages.length);

          // Only normalize if we have stages
          if (stages && stages.length > 0) {
            stages = stages.map(stage => {
              console.log('Processing stage:', stage);
              return {
                id: stage.id || stage._id || stage.slug,
                name: stage.name || stage.title || stage.stageName || 'Unnamed Stage',
                slug: stage.slug || stage.id || stage._id,
                // Preserve original stage data
                ...stage
              };
            });
          }

          console.log('Final processed stages:', stages);
          console.log('=== END STAGES DEBUG ===');
        } else {
          console.error('Stages response failed or rejected:', stagesResponse);
          if (stagesResponse.status === 'rejected') {
            console.error('Rejection reason:', stagesResponse.reason);
          }
        }

        console.log('Fetched data:', { studies, sites, stages });

        return {
          studies,
          sites, 
          stages,
        };
      });

      setData(prev => ({
        ...prev,
        ...responses,
        loading: false,
        initialized: true
      }));

    } catch (error) {
      console.error("Error fetching initial data:", error);
      setData(prev => ({ 
        ...prev, 
        loading: false,
        initialized: true
      }));
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Show loading state
  if (data.loading && !data.initialized) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading page data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show rate limit or error state
  if ((isRateLimited || error) && !data.initialized) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-md mx-auto">
          <RateLimitHandler maxRetries={3} onRetry={fetchInitialData} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageManagement 
        studies={data.studies} 
        sites={data.sites} 
        stages={data.stages} 
      />
    </div>
  );
}