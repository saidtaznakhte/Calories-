import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Page, Meal, MealAnalysis } from '../types';
import { analyzeMealPhoto } from '../services/geminiService';
import { BackIcon } from '../components/Icons';
import { toYYYYMMDD } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';
import RequestCameraAccess from '../components/RequestCameraAccess';
import PermissionDenied from '../components/PermissionDenied';

const loadingMessages = [
    "Analyzing textures and colors...",
    "Identifying ingredients...",
    "Estimating portion sizes...",
    "Calculating nutritional values...",
    "Finalizing the report..."
];

const NutrientPill: React.FC<{ label: string; value: string | number; unit: string; color: string }> = ({ label, value, unit, color }) => (
    <div className="flex flex-col items-center justify-center bg-light-gray dark:bg-gray-800 p-3 rounded-xl text-center">
        <span className="text-sm text-text-light dark:text-gray-400">{label}</span>
        <span className={`text-xl font-bold ${color}`}>{value}</span>
        <span className="text-xs text-gray-500 dark:text-gray-500">{unit}</span>
    </div>
);

const AnalysisResultOverlay: React.FC<{
    result: MealAnalysis;
    image: string;
    onLog: () => void;
    onRetake: () => void;
}> = ({ result, image, onLog, onRetake }) => (
    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-30 flex flex-col animate-slide-in-up">
        <header className="p-4 flex items-center">
            <button onClick={onRetake} className="p-2 -ml-2">
                <BackIcon className="w-6 h-6 text-text-main dark:text-gray-100" />
            </button>
            <h1 className="text-xl font-bold text-text-main dark:text-gray-100 mx-auto">Analysis Complete</h1>
            <div className="w-6"></div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
            <img src={image} alt="Captured meal" className="w-full h-48 object-cover rounded-2xl mb-4" />
            
            <h2 className="text-2xl font-bold text-text-main dark:text-gray-50 mb-1">{result.name}</h2>
            <p className="text-5xl font-extrabold text-primary mb-4">{result.calories} <span className="text-2xl font-semibold text-text-light dark:text-gray-400">cal</span></p>

            <div className="grid grid-cols-3 gap-3 mb-4">
                <NutrientPill label="Protein" value={result.protein} unit="grams" color="text-red-500" />
                <NutrientPill label="Carbs" value={result.carbs} unit="grams" color="text-yellow-500" />
                <NutrientPill label="Fats" value={result.fats} unit="grams" color="text-blue-500" />
            </div>

            {result.portionSuggestion && (
                 <div className="bg-primary-light dark:bg-primary/20 p-4 rounded-xl mb-4">
                    <h3 className="font-bold text-primary mb-1 text-sm">💡 Portion Suggestion</h3>
                    <p className="text-sm text-text-main dark:text-gray-200">{result.portionSuggestion}</p>
                </div>
            )}
            
            <div className="bg-light-gray dark:bg-gray-800 p-4 rounded-xl">
                 <h3 className="font-bold text-text-main dark:text-gray-200 mb-2 text-sm">Detailed Breakdown</h3>
                 <div className="grid grid-cols-3 gap-x-4 text-center">
                     <div>
                         <p className="font-semibold dark:text-gray-50">{result.fiber ?? 'N/A'}</p>
                         <p className="text-xs text-text-light dark:text-gray-400">Fiber (g)</p>
                     </div>
                     <div>
                         <p className="font-semibold dark:text-gray-50">{result.sugar ?? 'N/A'}</p>
                         <p className="text-xs text-text-light dark:text-gray-400">Sugar (g)</p>
                     </div>
                     <div>
                         <p className="font-semibold dark:text-gray-50">{result.sodium ?? 'N/A'}</p>
                         <p className="text-xs text-text-light dark:text-gray-400">Sodium (mg)</p>
                     </div>
                 </div>
            </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onLog} className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg">
                Log Meal
            </button>
        </div>
    </div>
);


const CameraScreen: React.FC = () => {
  const { handleMealLogged: onMealLogged, navigateTo } = useAppContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const loadingMessageInterval = useRef<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');

  useEffect(() => {
    if (isLoading) {
        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]); // Set initial message
        loadingMessageInterval.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 2000); // Change message every 2 seconds
    } else {
        if (loadingMessageInterval.current) {
            clearInterval(loadingMessageInterval.current);
        }
    }

    return () => {
        if (loadingMessageInterval.current) {
            clearInterval(loadingMessageInterval.current);
        }
    };
  }, [isLoading]);

  useEffect(() => {
    if (typeof navigator.permissions?.query !== 'function') {
      setPermissionStatus('prompt');
      return;
    }
    navigator.permissions.query({ name: 'camera' as any }).then((status) => {
        setPermissionStatus(status.state);
        status.onchange = () => setPermissionStatus(status.state);
    }).catch(() => {
        setPermissionStatus('prompt');
    });
  }, []);

  const startCamera = async () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Explicitly play the video, as autoplay can be unreliable
        videoRef.current.play().catch(err => {
            console.error("Video play failed:", err);
            setError("Could not start camera view.");
        });
      }
      setStream(mediaStream);
      setPermissionStatus('granted');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
      setPermissionStatus('denied');
    }
  };
  
  useEffect(() => {
    if (permissionStatus === 'granted' && !analysisResult) {
        startCamera();
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [permissionStatus, analysisResult]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    const base64Image = imageDataUrl.split(',')[1];
    
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);

    try {
        const mealData = await analyzeMealPhoto(base64Image);
        setAnalysisResult(mealData);
    } catch(err) {
        console.error(err);
        setError('Could not analyze the meal. Please try again.');
        setCapturedImage(null);
    } finally {
        setIsLoading(false);
    }
  }, [stream]);
  
  const handleLogMeal = () => {
      if (analysisResult) {
          onMealLogged({
            ...analysisResult,
            date: toYYYYMMDD(new Date()),
          });
      }
  };

  const handleRetake = () => {
      setAnalysisResult(null);
      setCapturedImage(null);
      setError(null);
      setPermissionStatus('checking'); // Re-check permission to restart flow
      setTimeout(() => {
          if (typeof navigator.permissions?.query !== 'function') {
            setPermissionStatus('prompt');
          } else {
            navigator.permissions.query({ name: 'camera' as any }).then(status => setPermissionStatus(status.state));
          }
      }, 100);
  };

  const handleGrantAccess = () => {
      startCamera();
  };

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative text-white">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-20 transition-opacity duration-300">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-center px-4 transition-opacity duration-300">{loadingMessage}</p>
        </div>
      )}
      {error && !analysisResult && (
        <div className="absolute top-10 left-4 right-4 bg-red-500 p-3 rounded-lg z-20 text-center">
            <p>{error}</p>
            <button onClick={() => navigateTo(Page.LogMeal)} className="font-bold mt-2 underline">Go Back</button>
        </div>
      )}
      
      {analysisResult && capturedImage && (
          <AnalysisResultOverlay 
            result={analysisResult}
            image={capturedImage}
            onLog={handleLogMeal}
            onRetake={handleRetake}
          />
      )}

      {permissionStatus === 'checking' && !analysisResult && (
          <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
              <div className="w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
          </div>
      )}

      {permissionStatus === 'prompt' && !analysisResult && (
          <RequestCameraAccess
              onGrant={handleGrantAccess}
              onDeny={() => navigateTo(Page.LogMeal)}
              featureName="Meal Snapping"
              featureDescription="Snap a photo of your food for instant nutritional analysis. We need camera access to see your meal."
          />
      )}

      {permissionStatus === 'denied' && !analysisResult && (
          <PermissionDenied
              onGoBack={() => navigateTo(Page.LogMeal)}
              featureName="Meal Snapping"
          />
      )}
      
      {permissionStatus === 'granted' && !analysisResult && (
          <>
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover animate-fade-in`} />
            <div className="absolute inset-0 flex flex-col items-center justify-between p-8">
              <button onClick={() => navigateTo(Page.LogMeal)} className="self-start p-2 bg-black bg-opacity-40 rounded-full">
                  <BackIcon className="w-6 h-6 text-white"/>
              </button>
              <div className="w-full h-2/3 border-2 border-dashed border-white border-opacity-70 rounded-3xl flex items-center justify-center">
                   <p className="text-center font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">
                      Center your food in the frame
                  </p>
              </div>
              <div className="flex flex-col items-center">
                  <button
                      onClick={capturePhoto}
                      disabled={isLoading}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 transition-transform hover:scale-105 disabled:opacity-50"
                  >
                      <div className="w-16 h-16 bg-white rounded-full border-2 border-primary ring-2 ring-white"></div>
                  </button>
                  <p className="mt-4 text-sm font-medium">Tap to scan</p>
              </div>
            </div>
          </>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default CameraScreen;
