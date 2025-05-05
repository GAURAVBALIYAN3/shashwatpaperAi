'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';

type ImageUploaderProps = {
  onImagesSelected: (files: File[]) => void;
  onProcess: () => void;
  isProcessing: boolean;
  maxImages: number;
  language: string;
  onExtractedText: (texts: string[]) => void;
};

export default function ImageUploader({
  onImagesSelected,
  onProcess,
  isProcessing,
  maxImages,
  language,
  onExtractedText
}: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [processingImage, setProcessingImage] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = {
    hindi: {
      title: 'तस्वीरें अपलोड करें',
      uploadText: 'तस्वीरें अपलोड करने के लिए क्लिक करें या खींचकर छोड़ें',
      uploadTypeInfo: 'PNG, JPG, JPEG (अधिकतम {maxImages} तस्वीरें)',
      selectedImages: 'चयनित तस्वीरें',
      processButton: 'AI से टेक्स्ट निकालें और आगे बढ़ें',
      processingText: 'प्रोसेसिंग...',
      errorMessage: 'तस्वीरों से टेक्स्ट निकालने में समस्या आई है। कृपया पुनः प्रयास करें।'
    },
    english: {
      title: 'Upload Images',
      uploadText: 'Click or drag and drop to upload images',
      uploadTypeInfo: 'PNG, JPG, JPEG (Maximum {maxImages} images)',
      selectedImages: 'Selected Images',
      processButton: 'Extract Text with AI and Continue',
      processingText: 'Processing...',
      errorMessage: 'Error extracting text from images. Please try again.'
    }
  };

  const currentLabels = labels[language as keyof typeof labels];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    files.forEach(file => {
      if (newFiles.length < maxImages) {
        newFiles.push(file);
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
      }
    });
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesSelected(newFiles);
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    URL.revokeObjectURL(previews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onImagesSelected(newFiles);
  };

  const processImagesWithAI = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      const extractedTexts: string[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        setProcessingImage(i);
        
        const formData = new FormData();
        formData.append('image', selectedFiles[i]);
        formData.append('language', language);
        
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`API ने ${response.status} स्टेटस कोड दिया`);
        }
        
        const data = await response.json();
        extractedTexts.push(data.extractedText);
      }
      
      onExtractedText(extractedTexts);
      onProcess();
    } catch (error) {
      console.error('Error extracting text:', error);
      alert(currentLabels.errorMessage);
    } finally {
      setProcessingImage(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6 text-center">{currentLabels.title}</h2>
      
      <div className="flex flex-col items-center justify-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div 
          onClick={handleClickUpload}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition mb-4"
        >
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            <p className="text-gray-600 mb-1">{currentLabels.uploadText}</p>
            <p className="text-gray-400 text-sm">{currentLabels.uploadTypeInfo.replace('{maxImages}', maxImages.toString())}</p>
          </div>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="w-full mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {currentLabels.selectedImages} ({selectedFiles.length}/{maxImages})
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    {processingImage === index && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    disabled={isProcessing}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={processImagesWithAI}
          disabled={selectedFiles.length === 0 || isProcessing}
          className={`px-6 py-2 rounded-lg font-bold text-white transition ${
            selectedFiles.length === 0 || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-secondary'
          }`}
        >
          {isProcessing ? currentLabels.processingText : currentLabels.processButton}
        </button>
      </div>
    </div>
  );
} 