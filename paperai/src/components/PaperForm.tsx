'use client';

import { useState, FormEvent } from 'react';

type PaperFormProps = {
  initialData: {
    schoolName: string;
    className: string;
    subject: string;
    language: string;
  };
  onSubmit: (data: {
    schoolName: string;
    className: string;
    subject: string;
    language: string;
  }) => void;
};

export default function PaperForm({ initialData, onSubmit }: PaperFormProps) {
  const [formData, setFormData] = useState({
    schoolName: initialData.schoolName || 'SHASHWAT PUBLIC SCHOOL',
    className: initialData.className || '',
    subject: initialData.subject || '',
    language: initialData.language || 'english',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const classes = {
    hindi: [
      'कक्षा 1', 'कक्षा 2', 'कक्षा 3', 'कक्षा 4', 'कक्षा 5',
      'कक्षा 6', 'कक्षा 7', 'कक्षा 8', 'कक्षा 9', 'कक्षा 10',
      'कक्षा 11', 'कक्षा 12'
    ],
    english: [
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11', 'Class 12'
    ]
  };

  const subjects = {
    hindi: [
      'हिंदी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान',
      'संस्कृत', 'कंप्यूटर', 'सामान्य ज्ञान', 'पर्यावरण अध्ययन',
      'भौतिक विज्ञान', 'रसायन विज्ञान', 'जीव विज्ञान'
    ],
    english: [
      'Hindi', 'English', 'Mathematics', 'Science', 'Social Science',
      'Sanskrit', 'Computer', 'General Knowledge', 'Environmental Studies',
      'Physics', 'Chemistry', 'Biology'
    ]
  };

  const labels = {
    hindi: {
      title: 'परीक्षा पेपर विवरण',
      schoolName: 'स्कूल का नाम',
      className: 'कक्षा चुनें',
      selectClass: 'कक्षा चुनें',
      subject: 'विषय चुनें',
      selectSubject: 'विषय चुनें',
      language: 'भाषा चुनें',
      hindi: 'हिंदी',
      english: 'अंग्रेजी',
      submit: 'आगे बढ़ें'
    },
    english: {
      title: 'Exam Paper Details',
      schoolName: 'School Name',
      className: 'Select Class',
      selectClass: 'Select Class',
      subject: 'Select Subject',
      selectSubject: 'Select Subject',
      language: 'Select Language',
      hindi: 'Hindi',
      english: 'English',
      submit: 'Continue'
    }
  };

  const currentLabels = labels[formData.language as keyof typeof labels];
  const currentClasses = classes[formData.language as keyof typeof classes];
  const currentSubjects = subjects[formData.language as keyof typeof subjects];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 text-center">{currentLabels.title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              {currentLabels.language}
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="hindi">{currentLabels.hindi}</option>
              <option value="english">{currentLabels.english}</option>
            </select>
          </div>

          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-1">
              {currentLabels.schoolName}
            </label>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
              {currentLabels.className}
            </label>
            <select
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="" disabled>{currentLabels.selectClass}</option>
              {currentClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              {currentLabels.subject}
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="" disabled>{currentLabels.selectSubject}</option>
              {currentSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          >
            {currentLabels.submit}
          </button>
        </div>
      </form>
    </div>
  );
} 