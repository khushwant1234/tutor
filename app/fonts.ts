import { Big_Shoulders_Display } from 'next/font/google';
import localFont from 'next/font/local';

export const bigShouldersDisplay = Big_Shoulders_Display({ 
  subsets: ['latin'],
  variable: '--font-big-shoulders',
  display: 'swap',
});

export const helveticaCompressed = localFont({
  src: './fonts/helvetica-Compressed.otf', // Update this path to match your actual file
  variable: '--font-helvetica-compressed',
  display: 'swap',
});

export const qualy = localFont({
  src: './fonts/QualyBold.ttf', // Changed from .tff to .ttf (TrueType Font)
  variable: '--font-qualy',
  display: 'swap',
});