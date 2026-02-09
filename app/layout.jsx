import './globals.css';

export const metadata = {
  title: '청첩장',
  description: '정상영 & 이승미 결혼식에 초대합니다',
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
