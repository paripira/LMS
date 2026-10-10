import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Sekolah Teramia — LMS, CBT & e-Rapor',
  description: 'Sistem Informasi Akademik, CBT & e-Rapor Kurikulum Merdeka Sekolah Teramia',
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
