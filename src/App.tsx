import React, { useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { generateLookbook, generateBroll, generateVideoPrompt, generatePoses, generateScene, generateCampaignKit, generateThemeExploration, generateVideoFromImage } from './services/geminiService.ts';
import type { ImageData, Look } from './types.ts';
import { Stepper } from './components/Stepper.tsx';
import { Step1_ModeSelection } from './components/Step1_ModeSelection.tsx';
import { Step2_Upload } from './components/Step2_Upload.tsx';
import { Step3_Customize } from './components/Step3_Customize.tsx';
import { ResultDisplay } from './components/ResultDisplay.tsx';
import { ApiKeyModal } from './components/ApiKeyModal.tsx';


export type GenerationMode = 'lookbook' | 'b-roll' | 'pose' | 'scene' | 'campaign' | 'theme';

const VALID_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const STEPS = ['Pilih Mode', 'Upload Asset', 'Kustomisasi', 'Hasil'];

const App: React.FC = () => {
  const [isAppVisible, setIsAppVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [modelImagePreview, setModelImagePreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<(ImageData | null)[]>([null]);
  const [productImagePreviews, setProductImagePreviews] = useState<(string | null)[]>([null]);
  const [lookbook, setLookbook] = useState<Look[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [promptLoadingIndex, setPromptLoadingIndex] = useState<number | null>(null);
  const [videoLoadingIndex, setVideoLoadingIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<string>('Studio Profesional');
  const [lighting, setLighting] = useState<string>('Cahaya Alami');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('lookbook');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(!localStorage.getItem('gemini_api_key'));


  // New states for new modes
  const [scenePrompt, setScenePrompt] = useState<string>('');
  const [artisticStyle, setArtisticStyle] = useState<string>('Cat Air');

  const enterApp = async () => {
    setIsAppVisible(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Gagal masuk mode layar penuh:", err);
    }
  };


  const resetState = () => {
    setCurrentStep(1);
    setModelImage(null);
    setModelImagePreview(null);
    setProductImages([null]);
    setProductImagePreviews([null]);
    setLookbook(null);
    setIsLoading(false);
    setError(null);
    setPromptLoadingIndex(null);
    setVideoLoadingIndex(null);
    setTheme('Studio Profesional');
    setLighting('Cahaya Alami');
    setScenePrompt('');
    setArtisticStyle('Cat Air');
  };

  const goToNextStep = () => setCurrentStep(prev => prev + 1);
  const goToPrevStep = () => setCurrentStep(prev => prev - 1);
  
  const fileToImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.split(';')[0].split(':')[1];
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleModelImageUpload = useCallback(async (file: File) => {
    if (!VALID_MIME_TYPES.includes(file.type)) {
      setError(`Tipe file tidak didukung: '${file.type}'. Harap unggah file PNG, JPG, atau WEBP.`);
      return;
    }
    setError(null);
    setModelImagePreview(URL.createObjectURL(file));
    const imageData = await fileToImageData(file);
    setModelImage(imageData);
  }, []);
  
  const handleModelImageRemove = useCallback(() => {
    setModelImage(null);
    setModelImagePreview(null);
  }, []);

  const handleProductImageUpload = useCallback(async (file: File, index: number) => {
    if (!VALID_MIME_TYPES.includes(file.type)) {
      setError(`Tipe file tidak didukung: '${file.type}'. Harap unggah file PNG, JPG, atau WEBP.`);
      return;
    }
    setError(null);
    const newPreviews = [...productImagePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setProductImagePreviews(newPreviews);

    const imageData = await fileToImageData(file);
    const newImages = [...productImages];
    newImages[index] = imageData;
    setProductImages(newImages);
  }, [productImages, productImagePreviews]);
  
  const handleProductImageRemove = useCallback((index: number) => {
    if (productImages.length === 1) { // If only one slot, just clear it
        setProductImagePreviews([null]);
        setProductImages([null]);
    } else { // Otherwise, remove the slot completely
        setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
        setProductImages(prev => prev.filter((_, i) => i !== index));
    }
  }, [productImages]);
  
  const handleAddProductSlot = useCallback(() => {
    if (productImages.length < 4) {
      setProductImages(prev => [...prev, null]);
      setProductImagePreviews(prev => [...prev, null]);
    }
  }, [productImages.length]);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Harap atur API Key kamu dulu di pengaturan (ikon gerigi di kanan atas).");
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLookbook(null);
    goToNextStep(); // Move to the results step

    try {
      let results: Look[] | null = null;
      switch (generationMode) {
        case 'lookbook':
          const validProductImages = productImages.filter(Boolean) as ImageData[];
          results = (await generateLookbook(modelImage!, validProductImages, theme, lighting, apiKey)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'b-roll':
           results = (await generateBroll(productImages[0]!, theme, lighting, apiKey)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'pose':
           results = (await generatePoses(modelImage!, theme, lighting, apiKey)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'scene':
           results = (await generateScene(productImages[0]!, scenePrompt, apiKey)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        case 'campaign':
           results = await generateCampaignKit(productImages[0]!, theme, lighting, apiKey);
          break;
        case 'theme':
           results = (await generateThemeExploration(productImages[0]!, artisticStyle, apiKey)).map(url => ({ imageUrl: url, videoPrompt: null }));
          break;
        default:
          throw new Error("Mode pembuatan tidak valid.");
      }
      
      if (results && results.length > 0) {
        setLookbook(results);
      } else {
        setError("AI tidak dapat menghasilkan gambar. Coba lagi dengan gambar atau pengaturan yang berbeda.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePrompt = async (index: number) => {
    if (!apiKey) {
      setError("Harap atur API Key kamu dulu di pengaturan (ikon gerigi di kanan atas).");
      setIsApiKeyModalOpen(true);
      return;
    }

    if (!lookbook) {
       setError("Tidak dapat membuat prompt tanpa lookbook.");
       return;
    }
    
    setPromptLoadingIndex(index);
    try {
      const look = lookbook[index];
      const response = await fetch(look.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `look-${index}.png`, { type: blob.type });
      const imageData = await fileToImageData(file);
      
      const prompt = await generateVideoPrompt(imageData, theme, lighting, apiKey);

      setLookbook(currentLookbook => {
        if (!currentLookbook) return null;
        const newLookbook = [...currentLookbook];
        newLookbook[index] = { ...newLookbook[index], videoPrompt: prompt };
        return newLookbook;
      });

    } catch (err) {
      console.error("Gagal membuat prompt video:", err);
    } finally {
      setPromptLoadingIndex(null);
    }
  };
  
  const handleOpenSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        // @ts-ignore
        await window.aistudio.openSelectKey();
    } else {
        setError("Lingkungan Anda tidak mendukung pemilihan kunci. Silakan kunjungi ai.google.dev/gemini-api/docs/billing untuk mempelajari lebih lanjut.");
    }
  };

  const handleGenerateVideo = async (index: number) => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      const hasPaidKey = await window.aistudio.hasSelectedApiKey();
      if (!hasPaidKey) {
        setError("Pembuatan video memerlukan kunci API berbayar dari proyek dengan penagihan diaktifkan. Silakan pilih satu untuk melanjutkan.");
        return;
      }
    } else {
        console.warn("aistudio SDK tidak ditemukan. Melanjutkan dengan pembuatan video, tetapi mungkin gagal tanpa kunci API berbayar.");
    }
    
    if (!lookbook) return;
    const look = lookbook[index];
    if (!look.videoPrompt) return;

    setVideoLoadingIndex(index);
    setError(null);

    try {
        const response = await fetch(look.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `video-source-${index}.png`, { type: blob.type });
        const imageData = await fileToImageData(file);

        const videoUrl = await generateVideoFromImage(imageData, look.videoPrompt, apiKey);

        setLookbook(currentLookbook => {
            if (!currentLookbook) return null;
            const newLookbook = [...currentLookbook];
            newLookbook[index] = { ...newLookbook[index], videoUrl };
            return newLookbook;
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui selama pembuatan video.";
        if (errorMessage.includes('Requested entity was not found')) {
            setError("Kunci API yang Anda pilih tampaknya tidak valid atau tidak memiliki izin. Silakan pilih kunci API berbayar yang valid.");
        } else {
            setError(errorMessage);
        }
    } finally {
        setVideoLoadingIndex(null);
    }
  };


  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
  };
    
  const handleOpenApiKeyModal = () => {
    setIsApiKeyModalOpen(true);
  };

  const canProceedFromUpload = 
    (generationMode === 'lookbook' && !!modelImage && !!productImages[0]) ||
    (generationMode === 'pose' && !!modelImage) ||
    (['b-roll', 'scene', 'campaign', 'theme'].includes(generationMode) && !!productImages[0]);


  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return <Step1_ModeSelection onModeSelect={(mode) => { setGenerationMode(mode); goToNextStep(); }} />;
      case 2:
        return <Step2_Upload 
            generationMode={generationMode}
            onModelUpload={handleModelImageUpload}
            onModelRemove={handleModelImageRemove}
            modelPreviewUrl={modelImagePreview}
            productPreviews={productImagePreviews}
            onProductUpload={handleProductImageUpload}
            onProductRemove={handleProductImageRemove}
            onAddProductSlot={handleAddProductSlot}
            onNext={goToNextStep}
            onBack={goToPrevStep}
            canProceed={canProceedFromUpload}
          />;
      case 3:
        return <Step3_Customize
            theme={theme}
            setTheme={setTheme}
            lighting={lighting}
            setLighting={setLighting}
            scenePrompt={scenePrompt}
            setScenePrompt={setScenePrompt}
            artisticStyle={artisticStyle}
            setArtisticStyle={setArtisticStyle}
            onGenerate={handleGenerate}
            onBack={goToPrevStep}
            isLoading={isLoading}
            generationMode={generationMode}
        />;
      case 4:
         return <ResultDisplay 
            lookbook={lookbook}
            isLoading={isLoading}
            error={error}
            onGeneratePrompt={handleGeneratePrompt}
            promptLoadingIndex={promptLoadingIndex}
            onGenerateVideo={handleGenerateVideo}
            videoLoadingIndex={videoLoadingIndex}
            generationMode={generationMode}
            onStartOver={resetState}
            onOpenSelectKey={handleOpenSelectKey}
          />;
      default:
        return <div>Langkah tidak valid</div>
    }
  }

  if (!isAppVisible) {
    return (
      <div className="min-h-screen bg-[#f0fcf3] text-[#3A3A3A] flex flex-col items-center justify-center font-sans p-4">
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3A3A3A]">Selamat Datang di VisioAI</h1>
            <p className="mt-4 text-lg text-[#3A3A3A]/80 max-w-2xl mx-auto">
                Ubah ide menjadi konten visual premium dengan kekuatan AI. Klik untuk memulai.
            </p>
            <button
                onClick={enterApp}
                className="mt-8 bg-[#6D597A] hover:bg-[#6d597ae0] text-[#FDF6F0] font-bold py-4 px-10 rounded-lg text-xl transition-all duration-200 ease-in-out border-2 border-[#6D597A] shadow-[4px_4px_0px_#B56576] hover:shadow-[2px_2px_0px_#B56576] hover:translate-x-0.5 hover:translate-y-0.5"
            >
                Mulai Berkreasi
            </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f0fcf3] text-[#3A3A3A] flex flex-col font-sans">
      <Header onOpenApiKeyModal={handleOpenApiKeyModal} />
      <main className="flex-grow container max-w-screen-xl mx-auto px-4 py-8 flex flex-col items-center">
        {currentStep < 4 && (
          <div className="text-center mb-12 w-full max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3A3A3A]">VisioAI - Transformasi Visual dengan AI</h2>
            <p className="mt-4 text-lg text-[#3A3A3A]/80 max-w-2xl mx-auto">
             Mengubah ide menjadi konten visual premium dengan dukungan teknologi AI.
            </p>
          </div>
        )}

        <div className="w-full max-w-4xl">
            {currentStep < 4 && <Stepper steps={STEPS} currentStep={currentStep} />}
            <div className={currentStep === 4 ? "w-full" : "mt-8"}>
              {renderStepContent()}
            </div>
        </div>

      </main>
      <Footer />
       <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />
    </div>
  );
};

export default App;
