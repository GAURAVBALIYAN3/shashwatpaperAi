'use client';

import { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Import the rich text editor dynamically to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return RQ;
  },
  { 
    ssr: false,
    loading: () => <div className="h-64 w-full border rounded bg-gray-50 flex items-center justify-center">Loading editor...</div>
  }
);

type TextFormatType = {
  isBold: boolean;
  isItalic: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right';
};

type TextBlockType = {
  text: string;
  format: TextFormatType;
};

type PaperPreviewProps = {
  examPaper: {
    schoolName: string;
    className: string;
    subject: string;
    examTime: string;
    totalMarks: string;
    extractedText: string[];
    language: string;
    examTerm?: string;
    hasStudentFields?: boolean;
  };
  textFormat: TextFormatType;
  onBack: () => void;
};

export default function PaperPreview({ examPaper, textFormat, onBack }: PaperPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedPaper, setEditedPaper] = useState({...examPaper});
  
  // Rich text content for each question
  const [richTextContent, setRichTextContent] = useState<Record<number, string>>({});
  
  // State to store text blocks with individual formatting
  const [textBlocks, setTextBlocks] = useState<TextBlockType[][]>(() => {
    return examPaper.extractedText.map(text => {
      return text
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => ({
          text: line,
          format: {...textFormat}
        }));
    });
  });
  
  // State for the selected block index
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Import Quill CSS only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only import CSS in browser environment
      require('react-quill/dist/quill.snow.css');
    }
  }, []);

  // Logo loading not needed anymore since we're drawing it directly in the PDF
  useEffect(() => {
    // No need to preload logo anymore
  }, []);

  // Initialize rich text content when entering edit mode
  useEffect(() => {
    if (isEditMode) {
      const content: Record<number, string> = {};
      
      textBlocks.forEach((block, blockIndex) => {
        // Convert the block to HTML for the rich text editor
        // First line (question) in bold, subsequent lines (sub-points) with indentation
        const html = block.map((line, lineIndex) => {
          const text = lineIndex === 0 
            ? `<strong>${blockIndex + 1}. ${line.text}</strong>` 
            : `&nbsp;&nbsp;&nbsp;&nbsp;${line.text}`;
          
          const style = `
            font-size: ${line.format.fontSize}pt;
            ${line.format.isBold ? 'font-weight: bold;' : ''}
            ${line.format.isItalic ? 'font-style: italic;' : ''}
            text-align: ${line.format.alignment};
          `;
          
          return `<p style="${style}">${text}</p>`;
        }).join('');
        
        content[blockIndex] = html;
      });
      
      setRichTextContent(content);
    }
  }, [isEditMode, textBlocks]);

  // Handle rich text editor content change
  const handleRichTextChange = (blockIndex: number, content: string) => {
    setRichTextContent(prev => ({
      ...prev,
      [blockIndex]: content
    }));
  };

  // Process HTML content back to text blocks with formatting
  const processRichTextContent = () => {
    const parser = new DOMParser();
    const newTextBlocks = [...textBlocks];
    
    Object.entries(richTextContent).forEach(([blockIdxStr, html]) => {
      const blockIndex = parseInt(blockIdxStr);
      
      // Parse the HTML content
      const doc = parser.parseFromString(html, 'text/html');
      const paragraphs = doc.querySelectorAll('p');
      
      // Convert paragraphs to text blocks
      const blockLines: TextBlockType[] = [];
      
      paragraphs.forEach((p, lineIndex) => {
        let text = p.textContent || '';
        
        // Remove question number from the first line if present
        if (lineIndex === 0 && text.startsWith(`${blockIndex + 1}. `)) {
          text = text.substring(`${blockIndex + 1}. `.length);
        }
        
        // Remove leading spaces from sub-points
        text = text.replace(/^\s+/, '');
        
        // Extract formatting from style attribute
        const style = p.getAttribute('style') || '';
        const isBold = style.includes('font-weight: bold') || p.querySelector('strong') !== null;
        const isItalic = style.includes('font-style: italic') || p.querySelector('em') !== null;
        
        // Extract font size
        let fontSize = textFormat.fontSize;
        const fontSizeMatch = style.match(/font-size:\s*(\d+)pt/);
        if (fontSizeMatch && fontSizeMatch[1]) {
          fontSize = parseInt(fontSizeMatch[1]);
        }
        
        // Extract alignment
        let alignment: 'left' | 'center' | 'right' = 'left';
        if (style.includes('text-align: center')) alignment = 'center';
        if (style.includes('text-align: right')) alignment = 'right';
        
        blockLines.push({
          text,
          format: { isBold, isItalic, fontSize, alignment }
        });
      });
      
      if (blockLines.length > 0) {
        newTextBlocks[blockIndex] = blockLines;
      }
    });
    
    return newTextBlocks;
  };

  const saveChanges = () => {
    if (isEditMode) {
      // Process the rich text content back to textBlocks
      const newTextBlocks = processRichTextContent();
      setTextBlocks(newTextBlocks);
      
      // Update editedPaper.extractedText
      const newExtractedText = newTextBlocks.map(block => 
        block.map(line => line.text).join('\n')
      );
      
      setEditedPaper({
        ...editedPaper,
        extractedText: newExtractedText
      });
    }
    
    setIsEditMode(false);
    setSelectedBlockIndex(null);
  };

  const cancelChanges = () => {
    // Reset to original values
    setEditedPaper({...examPaper});
    setTextBlocks(examPaper.extractedText.map(text => {
      return text
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => ({
          text: line,
          format: {...textFormat}
        }));
    }));
    setRichTextContent({});
    setIsEditMode(false);
    setSelectedBlockIndex(null);
  };

  const selectBlock = (blockIndex: number) => {
    setSelectedBlockIndex(blockIndex);
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Set margins and dimensions
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Clean white background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Calculate positions for centered logo and school name
      const schoolNameText = editedPaper.schoolName;
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      const schoolNameWidth = doc.getStringUnitWidth(schoolNameText) * 22 / doc.internal.scaleFactor;
      
      // Add school logo - simplified approach to avoid Image/canvas issues
      try {
        // Instead of using dynamic conversion, we'll draw a simple circle for the logo
        // Circle logo with 'S' in the center
        const logoSize = 18;
        const logoX = (pageWidth - schoolNameWidth) / 2 - logoSize - 5;
        const logoY = margin;
        
        // Draw blue circle
        doc.setFillColor(59, 130, 246); // Blue color
        doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
        
        // Add 'S' text in the center
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255); // White text
        doc.setFontSize(14);
        doc.text('S', logoX + logoSize/2 - 2, logoY + logoSize/2 + 2, { align: 'center' });
        
        // Reset text color for rest of the document
        doc.setTextColor(0, 0, 0);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Continue even if logo fails
      }
      
      // Add school name with better styling - bigger font
      doc.setTextColor(0, 0, 0);
      // Adjust the y-position to be in the same line as the logo
      doc.text(schoolNameText, (pageWidth - schoolNameWidth) / 2, margin + 10);
      
      // Add a thin header line 
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, margin + 20, pageWidth - margin, margin + 20);
      
      // Add class, subject, exam term in one line (left side)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const leftHeaderText = `${editedPaper.className} - ${editedPaper.subject}${editedPaper.examTerm ? ' | ' + currentLabels.examTerm + ': ' + editedPaper.examTerm : ''}`;
      doc.text(leftHeaderText, margin, margin + 30);
      
      // Add exam time and total marks on right side
      doc.setFontSize(11);
      const rightHeaderText = `${currentLabels.examTime}: ${editedPaper.examTime} | ${currentLabels.totalMarks}: ${editedPaper.totalMarks}`;
      const rightHeaderWidth = doc.getStringUnitWidth(rightHeaderText) * 11 / doc.internal.scaleFactor;
      doc.text(rightHeaderText, pageWidth - margin - rightHeaderWidth, margin + 30);
      
      // Add a thin second line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, margin + 35, pageWidth - margin, margin + 35);
      
      // Start Y position for content
      let y = margin + 50;
      
      // Add student fields if enabled
      if (editedPaper.hasStudentFields) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        
        // Student name field
        doc.text(`${currentLabels.studentName}: ____________________________`, margin, y);
        
        // Roll number field
        doc.text(`${currentLabels.studentRoll}: ______________`, pageWidth - margin - 80, y);
        
        y += 15;
      }
      
      // Skip displaying instructions if they're empty
      if (currentLabels.instructions && currentLabels.instructions.trim() !== '') {
        // Add instructions with better styling
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(0, 0, 0);
        doc.text(currentLabels.instructions, margin, y);
        
        y += 15;
      }
      
      // Add questions with individual formatting for each line
      textBlocks.forEach((block, blockIndex) => {
        block.forEach((line, lineIndex) => {
          // Check if we need a new page
          if (y > pageHeight - margin) {
            doc.addPage();
            
            // Add clean white background to new page
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            
            y = margin + 20;
          }
          
          // Apply individual formatting
          doc.setFontSize(line.format.fontSize);
          doc.setFont('helvetica', line.format.isBold ? 'bold' : line.format.isItalic ? 'italic' : 'normal');
          doc.setTextColor(0, 0, 0);
          
          // Add question number for the first line of each block
          let displayText = lineIndex === 0 ? `${blockIndex + 1}. ${line.text}` : line.text;
          
          // For sub-points with indentation
          if (lineIndex !== 0 && line.format.alignment === 'left') {
            displayText = `   ${displayText}`;
          }
          
          // Apply text alignment
          let xPosition = margin;
          if (line.format.alignment === 'center') {
            xPosition = pageWidth / 2;
          } else if (line.format.alignment === 'right') {
            xPosition = pageWidth - margin;
          }
          
          // Handle long lines by splitting into multiple lines
          const textWidth = doc.getStringUnitWidth(displayText) * line.format.fontSize / doc.internal.scaleFactor;
          if (textWidth > pageWidth - 2 * margin) {
            const splitLines = doc.splitTextToSize(displayText, pageWidth - 2 * margin);
            doc.text(splitLines, xPosition, y, { 
              align: line.format.alignment 
            });
            y += (lineIndex === 0 ? 7 : 6) * splitLines.length;
          } else {
            doc.text(displayText, xPosition, y, { 
              align: line.format.alignment
            });
            y += lineIndex === 0 ? 7 : 6;
          }
        });
        
        // Add space between questions
        y += 5;
      });
      
      // Add footer with page numbers and copyright
      // Since doc.internal.getNumberOfPages() is problematic in TypeScript definition
      // Let's handle it differently
      // Add footer to the current page only
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      // Add page number
      const pageText = `${currentLabels.pageText} 1`;
      doc.text(pageText, pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // Add copyright text at the bottom
      const copyrightText = "© All Rights Reserved. Shashwat Public School";
      doc.text(copyrightText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save the PDF with improved filename
      const fileName = `${editedPaper.schoolName.replace(/\s/g, '_')}_${editedPaper.className}_${editedPaper.subject}_ExamPaper.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(currentLabels.errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Rich text editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'size': ['9px', '10px', '11px', '12px', '14px', '16px', '18px'] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'size', 'align',
    'list', 'bullet', 'indent'
  ];

  const labels = {
    hindi: {
      title: 'परीक्षा पेपर प्रीव्यू',
      examTime: 'समय',
      totalMarks: 'पूर्णांक',
      examTerm: 'परीक्षा अवधि',
      studentName: 'छात्र का नाम',
      studentRoll: 'अनुक्रमांक',
      instructions: '',
      newPaperButton: 'नया परीक्षा पेपर बनाएँ',
      backButton: 'वापस जाएँ',
      pdfButtonText: 'PDF डाउनलोड करें',
      printButtonText: 'प्रिंट करें',
      editPaperButton: 'पेपर एडिट करें',
      saveEditButton: 'परिवर्तन सहेजें',
      cancelEditButton: 'रद्द करें',
      fontSizeLabel: 'फ़ॉन्ट आकार:',
      boldText: 'बोल्ड',
      italicText: 'इटैलिक',
      alignmentLabel: 'संरेखण:',
      leftAlign: 'बाएँ',
      centerAlign: 'केंद्र',
      rightAlign: 'दाएँ',
      generatingPdf: 'PDF बन रहा है...',
      printingPaper: 'प्रिंट हो रहा है...',
      pageText: 'पृष्ठ',
      of: '/',
      errorMessage: 'PDF बनाने में समस्या आई है। कृपया पुनः प्रयास करें।',
      selectTextPrompt: 'कृपया फॉर्मेटिंग के लिए टेक्स्ट चुनें',
      question: 'प्रश्न'
    },
    english: {
      title: 'Exam Paper Preview',
      examTime: 'Duration',
      totalMarks: 'Total Marks',
      examTerm: 'Exam Term',
      studentName: 'Student Name',
      studentRoll: 'Roll No.',
      instructions: '',
      newPaperButton: 'Create New Exam Paper',
      backButton: 'Go Back',
      pdfButtonText: 'Download PDF',
      printButtonText: 'Print Paper',
      editPaperButton: 'Edit Paper',
      saveEditButton: 'Save Changes',
      cancelEditButton: 'Cancel',
      fontSizeLabel: 'Font Size:',
      boldText: 'Bold',
      italicText: 'Italic',
      alignmentLabel: 'Alignment:',
      leftAlign: 'Left',
      centerAlign: 'Center',
      rightAlign: 'Right',
      generatingPdf: 'Generating PDF...',
      printingPaper: 'Printing...',
      pageText: 'Page',
      of: 'of',
      errorMessage: 'Error generating file. Please try again.',
      selectTextPrompt: 'Please select text to format',
      question: 'Question'
    }
  };

  const currentLabels = labels[examPaper.language as keyof typeof labels];

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 p-4 sm:p-8 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary bg-white py-3 rounded-lg shadow-sm">{currentLabels.title}</h2>
      
      <div ref={previewRef} id="previewRef" className="bg-white border rounded-lg p-4 sm:p-8 max-w-4xl mx-auto shadow-lg relative overflow-hidden">
        {/* Decorative background patterns */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-30"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full opacity-30"></div>
        
        <div className="flex items-center mb-6 pb-3 border-b-2 border-primary relative z-10">
          <div className="w-1/12">
            <div className="w-14 h-14 bg-white rounded-full p-1 shadow-md flex items-center justify-center">
              <Image
                id="school-logo"
                src="/logos/school-logo.svg"
                alt="School Logo"
                width={45}
                height={45}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="w-11/12 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{editedPaper.schoolName}</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between mb-6 pb-2 border-b border-gray-200 relative z-10">
          <div className="bg-blue-50 rounded-lg px-4 py-2 mb-2 sm:mb-0 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center">
              <p className="font-medium text-blue-800"><span className="font-bold">{editedPaper.className}</span> - {editedPaper.subject}</p>
              {editedPaper.examTerm && (
                <p className="font-medium text-blue-800">{currentLabels.examTerm}: <span className="font-semibold">{editedPaper.examTerm}</span></p>
              )}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center">
              <p className="font-medium text-blue-800">{currentLabels.examTime}: <span className="font-semibold">{editedPaper.examTime}</span></p>
              <p className="font-medium text-blue-800">{currentLabels.totalMarks}: <span className="font-semibold">{editedPaper.totalMarks}</span></p>
            </div>
          </div>
        </div>
        
        {editedPaper.hasStudentFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-200 relative z-10">
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
              <p className="text-gray-700 font-medium">{currentLabels.studentName}: <span className="border-b-2 border-dashed border-gray-400 inline-block w-40">__________________</span></p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 shadow-sm">
              <p className="text-gray-700 font-medium">{currentLabels.studentRoll}: <span className="border-b-2 border-dashed border-gray-400 inline-block w-24">__________</span></p>
            </div>
          </div>
        )}
        
        <div className="space-y-4 relative z-10">
          {isEditMode ? (
            // Rich text editor interface for each question
            textBlocks.map((block, blockIndex) => (
              <div key={blockIndex} className="mb-6 border-b border-gray-200 pb-4">
                <div className="pb-2 mb-2 bg-blue-50 p-2 rounded-t-lg">
                  <span className="font-medium text-blue-800">{currentLabels.question} {blockIndex + 1}</span>
                </div>
                <div className={selectedBlockIndex === blockIndex ? 'ring-2 ring-primary rounded-md' : ''}>
                  {typeof window !== 'undefined' && (
                    <div onClick={() => selectBlock(blockIndex)}>
                      <ReactQuill
                        value={richTextContent[blockIndex] || ''}
                        onChange={(content) => handleRichTextChange(blockIndex, content)}
                        modules={modules}
                        formats={formats}
                        theme="snow"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Read-only preview interface
            textBlocks.map((block, blockIndex) => (
              <div key={blockIndex} className="space-y-2 pb-4 mb-4 bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
                {block.map((line, lineIndex) => (
                  <p 
                    key={`${blockIndex}-${lineIndex}`} 
                    className={`${lineIndex === 0 ? 'font-medium text-blue-900 border-b border-gray-200 pb-2 mb-2' : 'pl-6 text-gray-800'} text-base`}
                    style={{
                      fontWeight: line.format.isBold ? 'bold' : 'normal',
                      fontStyle: line.format.isItalic ? 'italic' : 'normal',
                      fontSize: `${line.format.fontSize}pt`,
                      textAlign: line.format.alignment
                    }}
                  >
                    {lineIndex === 0 ? `${blockIndex + 1}. ${line.text}` : line.text}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 my-8">
        {isEditMode ? (
          <>
            <button
              type="button"
              onClick={cancelChanges}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {currentLabels.cancelEditButton}
            </button>
            
            <button
              type="button"
              onClick={saveChanges}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {currentLabels.saveEditButton}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {currentLabels.backButton}
            </button>
            
            <button
              type="button"
              onClick={setIsEditMode.bind(null, true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {currentLabels.editPaperButton}
            </button>
            
            <button
              type="button"
              onClick={generatePDF}
              disabled={isGenerating}
              className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-lg transition duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:hover:shadow-lg"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {currentLabels.generatingPdf}
                </span>
              ) : currentLabels.pdfButtonText}
            </button>
            
            <button
              type="button"
              onClick={handlePrint}
              className="bg-primary hover:bg-secondary text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {currentLabels.printButtonText}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
