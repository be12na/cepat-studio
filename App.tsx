import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { generateLookbook, generateBroll, generateVideoPrompt, generatePoses, generateScene, generateCampaignKit, generateThemeExploration } from './services/geminiService';
import type { ImageData, Look } from './types';
import { Stepper } from './components/Stepper';
import { Step1_ModeSelection } from './components/Step1_ModeSelection';
import { Step2_Upload } from './components/Step2_Upload';
import { Step3_Customize } from './components/Step3_Customize';
import { ResultDisplay } from './components/ResultDisplay';
import { ApiKeyModal } from './components/ApiKeyModal';


export type GenerationMode = 'lookbook' | 'b-roll' | 'pose' | 'scene' | 'campaign' | 'theme';

const VALID_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const STEPS = ['Pilih Mode', 'Upload Asset', 'Kustomisasi', 'Hasil'];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [modelImagePreview, setModelImagePreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<(ImageData | null)[]>([null]);
  const [productImagePreviews, setProductImagePreviews] = useState<(string | null)[]>([null]);
  const [lookbook, setLookbook] = useState<Look[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [promptLoadingIndex, setPromptLoadingIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState<string>('Studio Profesional');
  const [lighting, setLighting] = useState<string>('Cahaya Alami');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('lookbook');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(!localStorage.getItem('gemini_api_key'));


  // New states for new modes
  const [scenePrompt, setScenePrompt] = useState<string>('');
  const [artisticStyle, setArtisticStyle] = useState<string>('Cat Air');


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

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
  };
    
  const handleOpenApiKeyModal = () => {
    setIsApiKeyModalOpen(true);
  };

  const canProceedFromUpload = (generationMode === 'lookbook' 
      ? (!!modelImage && !!productImages[0])
      : (generationMode === 'pose' ? !!modelImage : !!productImages[0])
  );

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
            generationMode={generationMode}
            onStartOver={resetState}
          />;
      default:
        return <div>Langkah tidak valid</div>
    }
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