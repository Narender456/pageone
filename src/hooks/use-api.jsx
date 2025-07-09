"use client"

import { useState, useEffect } from "react";

export function useApi(apiCall, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        
        // Call the API function
        const response = await apiCall();
        
        console.log('API Response:', response); // Debug log

        if (isMounted) {
          // Handle different response structures
          if (response && response.success !== false) {
            // If response has a success property and it's not false
            if (response.success === true) {
              setState({
                data: response.data || response,
                loading: false,
                error: null,
              });
            }
            // If response doesn't have success property but has data
            else if (response.data !== undefined) {
              setState({
                data: response.data,
                loading: false,
                error: null,
              });
            }
            // If response is the data itself
            else {
              setState({
                data: response,
                loading: false,
                error: null,
              });
            }
          } else {
            // Handle error response
            setState({
              data: null,
              loading: false,
              error: response?.message || response?.error || "An error occurred",
            });
          }
        }
      } catch (error) {
        console.error('API Error:', error); // Debug log
        
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : "An error occurred",
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      console.log('Refetch Response:', response); // Debug log
      
      // Handle different response structures
      if (response && response.success !== false) {
        if (response.success === true) {
          setState({
            data: response.data || response,
            loading: false,
            error: null,
          });
        } else if (response.data !== undefined) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
        } else {
          setState({
            data: response,
            loading: false,
            error: null,
          });
        }
      } else {
        setState({
          data: null,
          loading: false,
          error: response?.message || response?.error || "An error occurred",
        });
      }
      
      return response;
    } catch (error) {
      console.error('Refetch Error:', error); // Debug log
      
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : "An error occurred",
      });
      
      throw error;
    }
  };

  return { ...state, refetch };
}

export function useAsyncOperation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (operation) => {
    try {
      setLoading(true);
      setError(null);

      const response = await operation();
      
      console.log('Operation Response:', response); // Debug log

      // Handle different response structures
      if (response && response.success !== false) {
        if (response.success === true) {
          return response.data || response;
        } else if (response.data !== undefined) {
          return response.data;
        } else {
          return response;
        }
      } else {
        const errorMessage = response?.message || response?.error || "Operation failed";
        setError(errorMessage);
        return null;
      }
    } catch (error) {
      console.error('Operation Error:', error); // Debug log
      
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}