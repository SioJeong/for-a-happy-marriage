import './globals.css';

export const metadata = {
  title: '청첩장',
  description: '정상영 & 이승미 결혼식에 초대합니다',
  metadataBase: new URL('https://for-a-happy-marriage.vercel.app'),
  openGraph: {
    title: '청첩장',
    description: '정상영 & 이승미 결혼식에 초대합니다',
    type: 'website',
    images: [
      {
        url: '/assets/og.png',
        width: 1200,
        height: 630,
        alt: '결혼식 초대장 대표 이미지',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '청첩장',
    description: '정상영 & 이승미 결혼식에 초대합니다',
    images: ['/assets/og.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
