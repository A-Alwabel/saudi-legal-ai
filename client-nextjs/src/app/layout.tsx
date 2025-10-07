import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saudi Legal AI v2.0',
  description: 'AI-powered legal consultation platform for Saudi Arabia',
  keywords: 'legal, AI, Saudi Arabia, consultation, law firm',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
