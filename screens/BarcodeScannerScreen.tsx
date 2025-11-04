import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Page, FoodSearchResult, MealType } from '../types';
import { lookupBarcode } from '../services/barcodeService';
import { BackIcon, EditIcon, PlusIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';
import RequestCameraAccess from '../components/RequestCameraAccess';
import PermissionDenied from '../components/PermissionDenied';
import { toYYYYMMDD } from '../utils/dateUtils';

// Check if BarcodeDetector is available in the browser
declare global {
  interface Window {
    BarcodeDetector: any;
  }
}

const getDefaultMealType = (): MealType => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) return MealType.Breakfast;
    if (currentHour >= 11 && currentHour < 16) return MealType.Lunch;
    if (currentHour >= 16 && currentHour < 22) return MealType.Dinner;
    return MealType.Snacks;
};

// Sub-component for displaying the found food item
const FoundItemCard: React.FC<{
    item: FoodSearchResult;
    onLog: (mealType: MealType) => void;
    onScanAgain: () => void;
}> = ({ item, onLog, onScanAgain }) => {
    const [mealType, setMealType] = useState<MealType>(getDefaultMealType());

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-card dark:bg-dark-card rounded-t-3xl p-6 z-30 animate-slide-in-up shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <div className="flex items-start mb-4">
                <img 
                    src={item.imageUrl || `https://placehold.co/80x80/E0F8F2/00C795?text=🍴`}
                    alt={item.name} 
                    className="w-20 h-20 rounded-lg object-cover mr-4 flex-shrink-0 bg-light-gray"
                />
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main">{item.name}</h2>
                    <p className="text-4xl font-extrabold text-primary">{Math.round(item.calories)} <span className="text-xl font-semibold text-text-light dark:text-dark-text-light">kcal</span></p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div><p className="font-bold text-protein">{item.protein}g</p><p className="text-xs text-text-light dark:text-dark-text-light">Protein</p></div>
                <div><p className="font-bold text-carbs">{item.carbs}g</p><p className="text-xs text-text-light dark:text-dark-text-light">Carbs</p></div>
                <div><p className="font-bold text-fats">{item.fats}g</p><p className="text-xs text-text-light dark:text-dark-text-light">Fats</p></div>
            </div>
            
            <div className="mb-4">
                <label className="text-sm font-semibold text-text-main dark:text-dark-text-main mb-2 block">Log to:</label>
                <select value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none">
                    {Object.values(MealType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>

            <div className="flex flex-col space-y-3">
                 <button onClick={() => onLog(mealType)} className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center">
                    <PlusIcon className="w-6 h-6 mr-2"/>
                    Log Meal
                </button>
                <button onClick={onScanAgain} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-bold py-3 rounded-xl">
                    Scan Again
                </button>
            </div>
        </div>
    );
};

// Sub-component for "not found" state
const NotFoundCard: React.FC<{ onRetry: () => void; onManualEntry: () => void }> = ({ onRetry, onManualEntry }) => {
    return (
        <div className="absolute bottom-0 left-0 right-0 bg-card dark:bg-dark-card rounded-t-3xl p-6 z-30 animate-slide-in-up shadow-[0_-10px_30px_rgba(0,0,0,0.1)] text-center">
            <h2 className="text-2xl font-bold text-text-main dark:text-dark-text-main mb-2">Product Not Found</h2>
            <p className="text-text-light dark:text-dark-text-light mb-6">Sorry, we couldn't find this barcode in our database.</p>
            <div className="flex flex-col space-y-3">
                 <button onClick={onManualEntry} className="w-full bg-secondary text-white font-bold py-3 rounded-xl flex items-center justify-center">
                    <EditIcon className="w-5 h-5 mr-2" />
                    Enter Manually
                </button>
                <button onClick={onRetry} className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-bold py-3 rounded-xl">
                    Try Again
                </button>
            </div>
        </div>
    );
};


const BarcodeScannerScreen: React.FC = () => {
    const { navigateTo, handleMealLogged } = useAppContext();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [scanState, setScanState] = useState<'scanning' | 'loading' | 'success' | 'error'>('scanning');
    const [foundFood, setFoundFood] = useState<FoodSearchResult | null>(null);
    const barcodeDetectorRef = useRef<any>(null);
    const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');

    useEffect(() => {
        if (!('BarcodeDetector' in window)) {
            setScanState('error');
            return;
        }
        try {
            barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a', 'ean_8'] });
        } catch (e) {
            console.error("Error creating BarcodeDetector:", e);
            setScanState('error');
        }
    }, []);

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
        if (stream) stream.getTracks().forEach(track => track.stop());
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(err => console.error("Video play failed:", err));
            }
            setStream(mediaStream);
            setPermissionStatus('granted');
        } catch (err) {
            console.error("Error accessing camera:", err);
            setPermissionStatus('denied');
        }
    };

    useEffect(() => {
        if (scanState === 'scanning' && permissionStatus === 'granted') {
            startCamera();
        } else {
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [scanState, permissionStatus]);
    
    const handleBarcodeDetection = async (barcodeValue: string) => {
        setScanState('loading');
        try {
            const foodData = await lookupBarcode(barcodeValue);
            setFoundFood(foodData);
            setScanState('success');
        } catch (err) {
            setScanState('error');
        }
    };

    const scanFrame = useCallback(async () => {
        if (scanState !== 'scanning' || !videoRef.current || !barcodeDetectorRef.current || videoRef.current.readyState < 2) return;
        try {
            const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            if (barcodes.length > 0) {
                handleBarcodeDetection(barcodes[0].rawValue);
            }
        } catch (err) { /* Silently ignore detection errors on single frames */ }
    }, [scanState]);

    useEffect(() => {
        let animationFrameId: number;
        const tick = () => {
            scanFrame();
            animationFrameId = requestAnimationFrame(tick);
        };
        if (scanState === 'scanning' && stream) {
            animationFrameId = requestAnimationFrame(tick);
        }
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [scanState, stream, scanFrame]);

    const handleLog = (mealType: MealType) => {
        if (foundFood) {
            handleMealLogged({ ...foundFood, type: mealType, date: toYYYYMMDD(new Date()) });
            // The handleMealLogged function already navigates away.
        }
    };
    
    const resetScanner = () => {
        setFoundFood(null);
        setScanState('scanning');
    };

    const statusMessage = {
        scanning: "Searching for barcode...",
        loading: "✓ Found! Looking up product...",
        success: "✓ Product Found!",
        error: "Product not found.",
    }[scanState];
    
    return (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center relative text-white">
            {permissionStatus === 'checking' && <div className="w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin"></div>}
            {permissionStatus === 'prompt' && <RequestCameraAccess onGrant={startCamera} onDeny={() => navigateTo(Page.LogMeal)} featureName="Barcode Scanning" featureDescription="Scan product barcodes to quickly log your food. We need camera access to use the scanner." />}
            {permissionStatus === 'denied' && <PermissionDenied onGoBack={() => navigateTo(Page.LogMeal)} featureName="Barcode Scanning" />}

            {permissionStatus === 'granted' && (
                <>
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity duration-300 ${scanState === 'success' || scanState === 'error' ? 'opacity-50' : 'opacity-100'}`} />
                    <div className="absolute inset-0 bg-black bg-opacity-20 z-10"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-8 z-20">
                        <div className="w-full flex justify-between items-center">
                            <button onClick={() => navigateTo(Page.LogMeal)} className="p-2 bg-black bg-opacity-40 rounded-full"><BackIcon className="w-6 h-6 text-white" /></button>
                            <h1 className="text-lg font-semibold bg-black bg-opacity-40 px-3 py-1 rounded-full">Scan Barcode</h1>
                            <div className="w-10"></div>
                        </div>
                        
                        <div className="w-full max-w-xs h-40 border-4 border-dashed border-white rounded-2xl relative bg-black bg-opacity-20">
                            {scanState === 'scanning' && <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-lg animate-pulse"></div>}
                            {scanState === 'loading' && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin"></div></div>}
                        </div>

                        <div className={`text-center bg-black bg-opacity-50 px-4 py-2 rounded-full min-h-[40px] flex items-center justify-center ${scanState === 'error' ? 'text-red-400' : ''}`}>
                            <p>{statusMessage}</p>
                        </div>
                    </div>
                    
                    {scanState === 'success' && foundFood && <FoundItemCard item={foundFood} onLog={handleLog} onScanAgain={resetScanner} />}
                    {scanState === 'error' && <NotFoundCard onRetry={resetScanner} onManualEntry={() => navigateTo(Page.ManualLog)} />}
                </>
            )}
        </div>
    );
};

export default BarcodeScannerScreen;
