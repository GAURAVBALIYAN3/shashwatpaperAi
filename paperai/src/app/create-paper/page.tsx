'use client';

import { useState } from 'react';
import PaperForm from '@/components/PaperForm';
import ImageUploader from '@/components/ImageUploader';
import PaperEditor from '@/components/PaperEditor';
import PaperPreview from '@/components/PaperPreview';

type ExamPaper = {
  schoolName: string;
  className: string;
  subject: string;
  examTime: string;
  totalMarks: string;
  extractedText: string[];
  language: string;
  examTerm: string;
  hasStudentFields: boolean;
};

type TextFormat = {
  isBold: boolean;
  isItalic: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
};

export default function CreatePaper() {
  const [step, setStep] = useState<number>(1);
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [examPaper, setExamPaper] = useState<ExamPaper>({
    schoolName: 'SHASHWAT PUBLIC SCHOOL',
    className: '',
    subject: '',
    examTime: '',
    totalMarks: '',
    extractedText: [],
    language: 'english', // Default language is English
    examTerm: '',
    hasStudentFields: false,
  });
  const [textFormat, setTextFormat] = useState<TextFormat>({
    isBold: false,
    isItalic: false,
    fontSize: 11,
    alignment: 'left',
  });

  const labels = {
    hindi: {
      title: 'परीक्षा पेपर बनाएँ',
      steps: ['विवरण भरें', 'तस्वीरें अपलोड करें', 'प्रश्न संपादित करें', 'पूर्वावलोकन'],
    },
    english: {
      title: 'Create Exam Paper',
      steps: ['Fill Details', 'Upload Images', 'Edit Questions', 'Preview'],
    }
  };

  const currentLabels = labels[examPaper.language as keyof typeof labels];

  const handleFormSubmit = (data: Partial<ExamPaper>) => {
    setExamPaper((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleImagesUpload = (files: File[]) => {
    setImages(files);
  };

  const processImages = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    // AI प्रोसेसिंग ImageUploader में होती है, इसलिए यहां कुछ करने की जरूरत नहीं है
  };
  
  const handleExtractedText = (texts: string[]) => {
    setExamPaper((prev) => ({
      ...prev,
      extractedText: texts,
    }));
    setIsProcessing(false);
    setStep(3);
  };

  const handleTextEdit = (editedText: string[], formatOptions: TextFormat) => {
    setExamPaper((prev) => ({
      ...prev,
      extractedText: editedText,
    }));
    setTextFormat(formatOptions);
    setStep(4);
  };

  const handleMetadataEdit = (metadata: Partial<ExamPaper>) => {
    setExamPaper((prev) => ({ ...prev, ...metadata }));
  };

  const goBackFromEditor = () => {
    setStep(2);
  };

  const goBackFromPreview = () => {
    setStep(3);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">{currentLabels.title}</h1>
      
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          {currentLabels.steps.map((stepName, idx) => (
            <>
              <div 
                key={`step-${idx}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= idx + 1 ? 'bg-primary text-white' : 'bg-gray-300'
                }`}
              >
                {idx + 1}
              </div>
              {idx < currentLabels.steps.length - 1 && (
                <div 
                  key={`line-${idx}`}
                  className={`h-1 w-16 ${step > idx + 1 ? 'bg-primary' : 'bg-gray-300'}`}
                ></div>
              )}
            </>
          ))}
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        {step === 1 && (
          <PaperForm
            initialData={examPaper}
            onSubmit={handleFormSubmit}
          />
        )}
        
        {step === 2 && (
          <ImageUploader
            onImagesSelected={handleImagesUpload}
            onProcess={processImages}
            isProcessing={isProcessing}
            maxImages={4}
            language={examPaper.language}
            onExtractedText={handleExtractedText}
          />
        )}
        
        {step === 3 && (
          <PaperEditor
            extractedText={examPaper.extractedText}
            onSave={handleTextEdit}
            paperData={examPaper}
            onMetadataEdit={handleMetadataEdit}
            onBack={goBackFromEditor}
          />
        )}
        
        {step === 4 && (
          <PaperPreview 
            examPaper={examPaper} 
            textFormat={textFormat}
            onBack={goBackFromPreview}
          />
        )}
      </div>
    </div>
  );
} 