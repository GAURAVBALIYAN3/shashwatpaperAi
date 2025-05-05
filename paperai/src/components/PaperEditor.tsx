'use client';

import { useState } from 'react';

type PaperEditorProps = {
  extractedText: string[];
  paperData: {
    schoolName: string;
    className: string;
    subject: string;
    examTime: string;
    totalMarks: string;
    language: string;
    examTerm?: string;
    hasStudentFields?: boolean;
  };
  onSave: (editedText: string[], textFormat: {
    isBold: boolean;
    isItalic: boolean;
    fontSize: number;
    alignment: 'left' | 'center' | 'right';
  }) => void;
  onMetadataEdit: (metadata: {
    examTime: string;
    totalMarks: string;
    examTerm?: string;
    hasStudentFields?: boolean;
  }) => void;
  onBack: () => void;
};

export default function PaperEditor({
  extractedText,
  paperData,
  onSave,
  onMetadataEdit,
  onBack,
}: PaperEditorProps) {
  const [editedText, setEditedText] = useState<string[]>(extractedText);
  const [metadata, setMetadata] = useState({
    examTime: paperData.examTime || '',
    totalMarks: paperData.totalMarks || '',
    examTerm: paperData.examTerm || '',
    hasStudentFields: paperData.hasStudentFields || false,
  });
  const [textFormat, setTextFormat] = useState<{
    isBold: boolean;
    isItalic: boolean;
    fontSize: number;
    alignment: 'left' | 'center' | 'right';
  }>({
    isBold: false,
    isItalic: false,
    fontSize: 11,
    alignment: 'left',
  });

  const labels = {
    hindi: {
      title: 'परीक्षा पेपर संपादन',
      examTime: 'परीक्षा समय (घंटे)',
      examTimePlaceholder: '3 घंटे',
      totalMarks: 'कुल अंक',
      totalMarksPlaceholder: '100',
      examTerm: 'परीक्षा अवधि',
      examTermPlaceholder: 'प्रथम सत्र / द्वितीय सत्र / वार्षिक',
      studentFields: 'छात्र विवरण फील्ड जोड़ें',
      editQuestions: 'प्रश्न संपादित करें',
      imageText: 'तस्वीर {index} से निकाला गया टेक्स्ट',
      textareaPlaceholder: 'टेक्स्ट यहां दिखाई देगा...',
      viewButton: 'परीक्षा पेपर देखें',
      backButton: 'वापस जाएँ'
    },
    english: {
      title: 'Edit Exam Paper',
      examTime: 'Exam Duration (hours)',
      examTimePlaceholder: '3 hours',
      totalMarks: 'Total Marks',
      totalMarksPlaceholder: '100',
      examTerm: 'Exam Term',
      examTermPlaceholder: 'First Term / Second Term / Annual',
      studentFields: 'Add Student Detail Fields',
      editQuestions: 'Edit Questions',
      imageText: 'Text extracted from Image {index}',
      textareaPlaceholder: 'Text will appear here...',
      viewButton: 'View Exam Paper',
      backButton: 'Go Back'
    }
  };

  const currentLabels = labels[paperData.language as keyof typeof labels];

  const handleTextChange = (index: number, value: string) => {
    const newText = [...editedText];
    newText[index] = value;
    setEditedText(newText);
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({
      ...prev,
      [name]: value,
    }));
    onMetadataEdit({
      ...metadata,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setMetadata((prev) => ({
      ...prev,
      [name]: checked,
    }));
    onMetadataEdit({
      ...metadata,
      [name]: checked,
    });
  };

  const handleFormatChange = (type: string, value: any) => {
    setTextFormat(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSave = () => {
    onSave(editedText, textFormat);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6 text-center">{currentLabels.title}</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="examTime" className="block text-sm font-medium text-gray-700 mb-1">
              {currentLabels.examTime}
            </label>
            <input
              type="text"
              id="examTime"
              name="examTime"
              value={metadata.examTime}
              onChange={handleMetadataChange}
              placeholder={currentLabels.examTimePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="totalMarks" className="block text-sm font-medium text-gray-700 mb-1">
              {currentLabels.totalMarks}
            </label>
            <input
              type="text"
              id="totalMarks"
              name="totalMarks"
              value={metadata.totalMarks}
              onChange={handleMetadataChange}
              placeholder={currentLabels.totalMarksPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="examTerm" className="block text-sm font-medium text-gray-700 mb-1">
              {currentLabels.examTerm}
            </label>
            <input
              type="text"
              id="examTerm"
              name="examTerm"
              value={metadata.examTerm}
              onChange={handleMetadataChange}
              placeholder={currentLabels.examTermPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="hasStudentFields"
              name="hasStudentFields"
              checked={metadata.hasStudentFields}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="hasStudentFields" className="ml-2 block text-sm text-gray-700">
              {currentLabels.studentFields}
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg">{currentLabels.editQuestions}</h3>
          
          {editedText.map((text, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{currentLabels.imageText.replace('{index}', (index + 1).toString())}</h4>
              </div>
              
              <textarea
                value={text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={currentLabels.textareaPlaceholder}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          {currentLabels.backButton}
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
          {currentLabels.viewButton}
        </button>
      </div>
    </div>
  );
} 