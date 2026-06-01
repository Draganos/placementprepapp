import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PlacementPrep — Placement Intelligence for Students',
  description:
    'Track your placement applications, understand your funnel, and get AI-powered strategy insights.',
  keywords: ['placement', 'internship', 'graduate scheme', 'job tracker', 'university'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
