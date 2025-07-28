import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const RateLimitHandler = ({ 
  isRateLimited, 
  error, 
  onRetry, 
  retryCount = 0, 
  maxRetries = 3,
  autoRetry = true 
}) => {
  const [countdown, setCountdown] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (isRateLimited && retryCount < maxRetries && autoRetry) {
      // Calculate delay based on retry count (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
      setCountdown(Math.ceil(delay / 1000));
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleRetry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRateLimited, retryCount, maxRetries, autoRetry]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  if (!isRateLimited && !error) {
    return null;
  }

  const isNetworkError = error?.includes('Network') || error?.includes('fetch');
  const canRetry = retryCount < maxRetries;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center space-x-3 mb-4">
        {isNetworkError ? (
          <WifiOff className="h-8 w-8 text-red-500" />
        ) : isRateLimited ? (
          <Clock className="h-8 w-8 text-yellow-500" />
        ) : (
          <AlertCircle className="h-8 w-8 text-red-500" />
        )}
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {isNetworkError 
              ? 'Connection Issue' 
              : isRateLimited 
              ? 'Rate Limited' 
              : 'Request Failed'
            }
          </h3>
          <p className="text-sm text-gray-600">
            {isNetworkError 
              ? 'Unable to reach the server'
              : isRateLimited 
              ? 'Too many requests, please wait'
              : error || 'An error occurred'
            }
          </p>
        </div>
      </div>

      {isRateLimited && canRetry && (
        <div className="text-center">
          {isRetrying ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="animate-spin h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Retrying...</span>
            </div>
          ) : countdown > 0 && autoRetry ? (
            <div className="space-y-3">
              <div className="text-2xl font-bold text-yellow-600">{countdown}</div>
              <p className="text-sm text-gray-600">
                Automatically retrying in {countdown} second{countdown !== 1 ? 's' : ''}
              </p>
              <div className="w-32 bg-gray-200 rounded-full h-2 mx-auto">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${((Math.pow(2, retryCount) * 1000 - countdown * 1000) / (Math.pow(2, retryCount) * 1000)) * 100}%` 
                  }}
                ></div>
              </div>
              <button
                onClick={handleRetry}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Retry Now
              </button>
            </div>
          ) : (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Retry Now'}
            </button>
          )}
        </div>
      )}

      {!canRetry && (
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">
            Maximum retry attempts reached ({maxRetries})
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Attempt {retryCount + 1} of {maxRetries + 1}</p>
        {isRateLimited && (
          <p className="mt-1">
            Our servers are experiencing high traffic. We're automatically retrying your request.
          </p>
        )}
      </div>
    </div>
  );
};

// Enhanced hook with better error handling and retry logic
export const useRateLimitHandler = () => {
  const [state, setState] = useState({
    isRateLimited: false,
    error: null,
    retryCount: 0,
    isLoading: false
  });

  const reset = useCallback(() => {
    setState({
      isRateLimited: false,
      error: null,
      retryCount: 0,
      isLoading: false
    });
  }, []);

  const handleApiCall = useCallback(async (apiFunction, maxRetries = 3) => {
    const attemptCall = async (currentRetry = 0) => {
      try {
        setState(prev => ({ 
          ...prev, 
          isLoading: true, 
          isRateLimited: false, 
          error: null,
          retryCount: currentRetry
        }));
        
        const result = await apiFunction();
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isRateLimited: false, 
          error: null,
          retryCount: 0 
        }));
        
        return result;
      } catch (error) {
        console.error('API call failed:', error);
        
        const isRateLimit = error.status === 429 || error.message?.includes('Too many requests');
        
        if (isRateLimit && currentRetry < maxRetries) {
          setState(prev => ({ 
            ...prev, 
            isRateLimited: true, 
            error: error.message || 'Rate limited',
            retryCount: currentRetry,
            isLoading: false
          }));
          
          // Don't auto-retry here, let the component handle it
          throw error;
        } else {
          setState(prev => ({ 
            ...prev, 
            isLoading: false,
            isRateLimited: isRateLimit,
            error: error.message || 'Request failed',
            retryCount: currentRetry
          }));
          throw error;
        }
      }
    };

    return attemptCall(state.retryCount);
  }, [state.retryCount]);

  const retry = useCallback(async () => {
    if (state.retryCount < 3) { // Max retries
      try {
        setState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1,
          isLoading: true 
        }));
        
        // Wait with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, state.retryCount), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // This will be handled by the calling component
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  }, [state.retryCount]);

  return {
    ...state,
    handleApiCall,
    retry,
    reset,
    RateLimitHandler: (props) => (
      <RateLimitHandler 
        isRateLimited={state.isRateLimited}
        error={state.error}
        retryCount={state.retryCount}
        onRetry={retry}
        {...props}
      />
    )
  };
};

export default RateLimitHandler;