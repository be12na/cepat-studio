import React, { useState } from 'react';
import { Spinner } from './Spinner.tsx';
import type { Look } from '../types.ts';
import { ImageZoomModal } from './ImageZoomModal.tsx';

interface ResultDisplayProps {
  lookbook: Look[] | null;
  isLoading: boolean;
  error: string | null;
  onGeneratePrompt: (index: number) => void;
  promptLoadingIndex: number | null;
  onGenerateVideo: (index: number) => void;
  videoLoadingIndex: number | null;
  generationMode: 'lookbook' | 'b-roll' | 'pose' | 'scene' | 'campaign' | 'theme';
  onStartOver: () => void;
  onOpenSelectKey: () => void;
}

const LoadingMessage: React.FC = () => {
    const messages = [
        "AI stylist lagi siap-siap...",
        "Lagi ngeracik konten buat kamu...",
        "Nyari angle yang paling pas...",
        "Keajaiban butuh waktu sebentar...",
        "Menata setiap detail...",
        "Menyusun showcase keren buatmu..."
    ];
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return <p className="text-[#3A3A3A]/80 mt-4 text-lg">{message}</p>;
}

const LookCard: React.FC<{ 
    look: Look; 
    index: number; 
    onGeneratePrompt: (index: number) => void; 
    onGenerateVideo: (index: number) => void; 
    promptIsLoading: boolean; 
    videoIsLoading: boolean;
    onZoom: (imageUrl: string) => void; 
    generationMode: ResultDisplayProps['generationMode']; 
}> = ({ look, index, onGeneratePrompt, onGenerateVideo, promptIsLoading, videoIsLoading, onZoom, generationMode }) => {
    const [copied, setCopied] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const showPromptButton = generationMode === 'lookbook' || generationMode === 'pose';

    const handleCopy = () => {
        if (look.videoPrompt) {
            navigator.clipboard.writeText(look.videoPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Gambar Dibuat dengan VisioAI',
            text: 'Lihat gambar keren yang saya buat dengan VisioAI!',
            url: look.imageUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Gagal membagikan:", err);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(look.imageUrl);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        }
    };

    const ZoomButton: React.FC<{ isSecondary?: boolean }> = ({ isSecondary = false }) => (
        <button
            onClick={() => onZoom(look.imageUrl)}
            className={`font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#6D597A] w-full ${isSecondary ? 'bg-[#B56576] hover:bg-[#b56576e0] text-[#FDF6F0]' : 'bg-[#FDF6F0] hover:bg-[#FDF6F0]/80 text-[#3A3A3A]'}`}
            aria-label={`Zoom in look ${index + 1}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span>Zoom</span>
        </button>
    );

    const DownloadButton: React.FC<{ isSecondary?: boolean }> = ({ isSecondary = false }) => (
        <a
            href={look.imageUrl}
            download={`look-${index + 1}.png`}
            className={`font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#6D597A] w-full ${isSecondary ? 'bg-[#B56576] hover:bg-[#b56576e0] text-[#FDF6F0]' : 'bg-[#FDF6F0] hover:bg-[#FDF6F0]/80 text-[#3A3A3A]'}`}
            aria-label={`Download look ${index + 1}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Download</span>
        </a>
    );

     const ShareButton: React.FC<{ isSecondary?: boolean }> = ({ isSecondary = false }) => (
        <button
            onClick={handleShare}
            className={`font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#6D597A] w-full ${isSecondary ? 'bg-[#B56576] hover:bg-[#b56576e0] text-[#FDF6F0]' : 'bg-[#FDF6F0] hover:bg-[#FDF6F0]/80 text-[#3A3A3A]'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            <span>{shareCopied ? 'Copied!' : 'Bagikan'}</span>
        </button>
    );

    return (
        <div className="relative group overflow-hidden rounded-lg border-2 border-[#6D597A] bg-gray-100 shadow-[4px_4px_0px_#6D597A]">
            {videoIsLoading && (
                <div className="absolute inset-0 bg-[#3A3A3A]/90 z-20 flex flex-col items-center justify-center p-4 text-center text-white">
                    <Spinner />
                    <p className="mt-4 font-semibold text-lg">Lagi bikin video...</p>
                    <p className="text-sm text-white/80 mt-1">Proses ini bisa makan waktu beberapa menit. Jangan tutup tab ini ya.</p>
                </div>
            )}
            {look.name && (
                <div className="absolute top-2 left-2 bg-[#E56B6F] text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    {look.name}
                </div>
            )}
            
            {look.videoUrl ? (
                <video src={look.videoUrl} className="w-full h-auto object-cover" controls autoPlay loop muted playsInline />
            ) : (
                <img src={look.imageUrl} alt={`Look ${index + 1}`} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110" />
            )}

            <div className="absolute inset-0 bg-[#3A3A3A]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                {look.videoUrl ? (
                     <div className="flex flex-col space-y-3 w-4/5">
                        <a
                            href={look.videoUrl}
                            download={`video-${index + 1}.mp4`}
                            className="bg-[#B56576] hover:bg-[#b56576e0] text-[#FDF6F0] font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#6D597A] w-full"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                           <span>Download Video</span>
                        </a>
                    </div>
                ) : look.videoPrompt ? (
                    <div className="text-center text-[#FDF6F0] p-2 flex flex-col justify-center items-center h-full w-full">
                        <p className="text-sm mb-3 font-mono flex-grow overflow-y-auto custom-scrollbar">{look.videoPrompt}</p>
                        <div className="w-full space-y-2 mt-auto">
                            <button
                                onClick={handleCopy}
                                className="bg-[#FDF6F0] hover:bg-[#FDF6F0]/80 text-[#3A3A3A] font-bold py-2 px-4 rounded-lg transition-all text-sm border-2 border-[#6D597A] w-full"
                            >
                                {copied ? 'Copied!' : 'Copy Prompt'}
                            </button>
                            <button
                                onClick={() => onGenerateVideo(index)}
                                className="bg-[#B56576] hover:bg-[#b56576e0] text-[#FDF6F0] font-bold py-2 px-4 rounded-lg transition-all text-sm border-2 border-[#6D597A] w-full"
                            >
                                Generate Video
                            </button>
                            <div className="flex space-x-2 pt-1">
                                <ZoomButton isSecondary={true} />
                                <DownloadButton isSecondary={true} />
                                <ShareButton isSecondary={true} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3 w-4/5">
                        <ZoomButton />
                        <DownloadButton />
                        <ShareButton />
                        {showPromptButton && (
                            <button
                                onClick={() => onGeneratePrompt(index)}
                                disabled={promptIsLoading}
                                className="bg-[#B56576] hover:bg-[#b56576e0] text-[#FDF6F0] font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm border-2 border-[#6D597A] disabled:bg-[#3A3A3A]/40"
                                aria-label={`Buat prompt video untuk look ${index + 1}`}
                            >
                                {promptIsLoading ? (
                                    <> <Spinner/> <span>Membuat...</span> </>
                                ) : (
                                    <span>Buat Prompt</span>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ lookbook, isLoading, error, onGeneratePrompt, promptLoadingIndex, onGenerateVideo, videoLoadingIndex, generationMode, onStartOver, onOpenSelectKey }) => {
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  
  const handleZoomIn = (imageUrl: string) => {
    setZoomedImageUrl(imageUrl);
  };

  const handleZoomOut = () => {
    setZoomedImageUrl(null);
  };

  const getTitle = () => {
    switch (generationMode) {
        case 'lookbook': return 'Outfit Studio Kamu!';
        case 'pose': return 'Ragam Pose Kamu!';
        case 'b-roll': return 'Your Product Shots!';
        case 'scene': return 'Your New Scenes!';
        case 'campaign': return 'Your Campaign Kit!';
        case 'theme': return 'Your Artistic Styles!';
        default: return 'Your Results!';
    }
  }
  
  const gridClasses = generationMode === 'campaign' 
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-start" 
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8";


  return (
    <div className="w-full bg-white/50 border-2 border-[#6D597A] rounded-xl shadow-[8px_8px_0px_#6D597A] p-4 md:p-6 flex justify-center items-center text-center">
      <div className="w-full">
        {isLoading && (
          <div className="flex flex-col items-center min-h-[400px] justify-center">
            <Spinner />
            <LoadingMessage />
          </div>
        )}

        {error && !isLoading && (
          <div className="min-h-[400px] flex flex-col justify-center items-center">
            <div className="text-red-700 bg-red-100 p-6 rounded-lg border-2 border-red-700 w-full max-w-lg">
              <p className="font-semibold text-lg">Waduh, ada error</p>
              <p className="mt-2">{error}</p>
               {error.includes("paid API key") && (
                    <button
                        onClick={onOpenSelectKey}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                    >
                        Pilih API Key
                    </button>
                )}
            </div>
            <button
                onClick={onStartOver}
                className="mt-8 bg-[#6D597A] hover:bg-[#6d597ae0] text-[#FDF6F0] font-bold py-3 px-10 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#6D597A] shadow-[4px_4px_0px_#B56576] hover:shadow-[2px_2px_0px_#B56576] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Coba Lagi Yuk
            </button>
          </div>
        )}

        {!isLoading && !error && lookbook && lookbook.length > 0 && (
          <div>
            <h3 className="text-3xl md:text-4xl font-bold mb-2 text-[#3A3A3A]">
              {getTitle()}
            </h3>
            <p className="text-lg text-[#3A3A3A]/80 mb-8">Hasilnya udah siap! Kamu bisa download, zoom, atau bikin video prompt.</p>

            <div className={gridClasses}>
              {lookbook.map((look, index) => (
                <LookCard 
                    key={index}
                    look={look}
                    index={index}
                    onGeneratePrompt={onGeneratePrompt}
                    onGenerateVideo={onGenerateVideo}
                    promptIsLoading={promptLoadingIndex === index}
                    videoIsLoading={videoLoadingIndex === index}
                    onZoom={handleZoomIn}
                    generationMode={generationMode}
                />
              ))}
            </div>
            <div className="mt-12 text-center">
                <button
                    onClick={onStartOver}
                    className="bg-[#B56576] hover:bg-[#b56576e0] text-[#FDF6F0] font-bold py-3 px-10 rounded-lg text-lg transition-all duration-200 ease-in-out border-2 border-[#6D597A] shadow-[4px_4px_0px_#6D597A] hover:shadow-[2px_2px_0px_#6D597A] hover:translate-x-0.5 hover:translate-y-0.5"
                >
                    Bikin Lagi
                </button>
            </div>
          </div>
        )}
      </div>
       <ImageZoomModal imageUrl={zoomedImageUrl} onClose={handleZoomOut} />
    </div>
  );
};