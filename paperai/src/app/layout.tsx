import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shashwat Public School Paper AI',
  description: 'Application to generate exam papers by extracting text from images',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white shadow-sm py-3">
          <div className="container mx-auto px-4 flex items-center">
            <div className="mr-3">
              <Image 
                src="/logos/school-logo.svg" 
                alt="Shashwat Public School Logo" 
                width={40} 
                height={40} 
              />
            </div>
            <h1 className="text-xl font-semibold">Shashwat Public School Paper AI</h1>
          </div>
        </header>
        
        <main className="min-h-screen container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
          <p>© All Rights Reserved. Shashwat Public School</p>
        </footer>
      </body>
    </html>
  );
} 