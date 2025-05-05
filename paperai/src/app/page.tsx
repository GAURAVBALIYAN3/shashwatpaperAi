'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [language, setLanguage] = useState<'hindi' | 'english'>('hindi');

  const content = {
    hindi: {
      title: 'शाश्वत पब्लिक स्कूल पेपर AI',
      description: 'अपनी छवियों से परीक्षा पत्र बनाने के लिए नीचे दिए गए बटन पर क्लिक करें',
      buttonText: 'परीक्षा पत्र बनाएं',
      howItWorksTitle: 'परीक्षा पत्र जनरेटर कैसे काम करता है?',
      steps: [
        'स्कूल का नाम, कक्षा और विषय चुनें',
        'अपने प्रश्नों की छवियां अपलोड करें (अधिकतम 4 छवियां)',
        'OCR तकनीक का उपयोग करके छवियों से टेक्स्ट निकाला जाएगा',
        'परीक्षा अवधि और अंक जोड़ें',
        'अपने प्रश्नों को संपादित करें',
        'PDF या Word प्रारूप में परीक्षा पत्र डाउनलोड करें'
      ]
    },
    english: {
      title: 'Shashwat Public School Paper AI',
      description: 'Click the button below to create an exam paper from your images',
      buttonText: 'Create Exam Paper',
      howItWorksTitle: 'How Exam Paper Generator Works?',
      steps: [
        'Select school name, class, and subject',
        'Upload images of your questions (maximum 4 images)',
        'Text will be extracted from images using OCR technology',
        'Add exam duration and marks',
        'Edit your questions',
        'Download exam paper in PDF or Word format'
      ]
    }
  };

  const currentContent = content[language];

  const toggleLanguage = () => {
    setLanguage(language === 'hindi' ? 'english' : 'hindi');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <div className="text-right mb-4">
          <button 
            onClick={toggleLanguage}
            className="bg-white px-4 py-2 rounded-full text-sm font-medium text-blue-600 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {language === 'hindi' ? 'English' : 'हिंदी'}
          </button>
        </div>
        
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-8">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full"></div>
              <div className="absolute top-40 left-20 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute -bottom-16 right-40 w-48 h-48 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                  {currentContent.title}
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 max-w-2xl">
                  {currentContent.description}
                </p>
              </div>
              
              <div className="w-40 h-40 relative">
                <Image
                  src="/logos/school-logo.svg"
                  alt="School Logo"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-8">
            <div className="flex flex-col items-center space-y-12">
              {/* Create Paper Button */}
              <div className="text-center">
                <Link href="/create-paper" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                  {currentContent.buttonText}
                </Link>
              </div>
              
              {/* How it Works */}
              <div className="w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 border-b pb-2">
                  {currentContent.howItWorksTitle}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentContent.steps.map((step, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4 flex items-start shadow-sm hover:shadow transition-shadow">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Features */}
              <div className="w-full max-w-4xl mt-8 bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{language === 'hindi' ? 'तेज़ और आसान' : 'Fast & Easy'}</h3>
                    <p className="text-gray-600 text-sm">{language === 'hindi' ? 'मिनटों में परीक्षा पत्र बनाएँ' : 'Create exam papers in minutes'}</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{language === 'hindi' ? 'सुरक्षित और निजी' : 'Secure & Private'}</h3>
                    <p className="text-gray-600 text-sm">{language === 'hindi' ? 'आपके डेटा की सुरक्षा सुनिश्चित' : 'Your data remains safe'}</p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{language === 'hindi' ? 'AI तकनीक' : 'AI Technology'}</h3>
                    <p className="text-gray-600 text-sm">{language === 'hindi' ? 'स्मार्ट OCR और टेक्स्ट प्रोसेसिंग' : 'Smart OCR & text processing'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 