import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PlantGen SaaS',
  description: 'Multi-tenant SaaS Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
