import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Booking App',
  description: 'Generated by create next app',
  icons: {
    icon: ['/favicon.ico?v=4'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${inter.className} m-0 p-0 flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
