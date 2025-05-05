import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// Gemini API setup
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const language = formData.get('language') as string || 'hindi'; // 'hindi' या 'english'

    if (!image) {
      return NextResponse.json(
        { error: language === 'hindi' ? 'तस्वीर अपलोड करना आवश्यक है' : 'Image upload is required' },
        { status: 400 }
      );
    }

    // Convert image to Uint8Array
    const arrayBuffer = await image.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);
    
    // Get Gemini 1.5 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create multimodal prompt with image - Better prompting for OCR
    let prompt = "";
    if (language === 'hindi') {
      prompt = `इस छवि से परीक्षा पेपर / प्रश्नों का टेक्स्ट निकालें।

निम्नलिखित निर्देशों का पालन करें:
1. प्रश्न संख्या, अंक और सभी फ़ॉर्मेटिंग बनाए रखें
2. प्रश्नों के बीच खाली रेखाएं बनाए रखें
3. सब-सेक्शन (जैसे a, b, c या i, ii, iii) और उनका स्वरूप बनाए रखें
4. केवल टेक्स्ट देना है, कोई अतिरिक्त टिप्पणी या व्याख्या नहीं
5. यदि परीक्षा का समय, पूर्णांक या विभाग दिखाई देता है, तो उसे भी शामिल करें

छवि में मौजूद सटीक टेक्स्ट दें, किसी भी प्रकार की अपनी व्याख्या या संपादन न करें।`;
    } else {
      prompt = `Extract the text of exam paper / questions from this image.

Follow these instructions:
1. Maintain question numbers, marks, and all formatting
2. Preserve blank lines between questions
3. Keep sub-sections (like a, b, c or i, ii, iii) and their structure
4. Provide text only, no additional comments or explanations
5. If exam time, total marks, or department is visible, include that too

Provide the exact text present in the image without any interpretation or editing of your own.`;
    }
    
    const imagePart: Part = {
      inlineData: {
        data: Buffer.from(imageBytes).toString('base64'),
        mimeType: image.type,
      },
    };

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const extractedText = response.text();

    return NextResponse.json({ extractedText });
  } catch (error: any) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: error.message || 'तस्वीर प्रोसेस करने में त्रुटि हुई' },
      { status: 500 }
    );
  }
} 