import { Fredoka, Nunito_Sans } from 'next/font/google';
import './globals.css';
import IntlProvider from '../components/IntlProvider.client';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Brown Farm 戰術百科',
  description: 'LINE Brown Farm Strategy Wiki 的靜態版首頁、Tips 與 Resources。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant" className={`${nunitoSans.variable} ${fredoka.variable}`}>
      <body>
        <IntlProvider>{children}</IntlProvider>
      </body>
    </html>
  );
}
