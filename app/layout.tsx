import type { Metadata } from 'next';
import '../src/index.css';
import { TestProvider } from '../src/context/TestContext';

export const metadata: Metadata = {
  title: 'CBT Exam System',
  description: 'Computer-Based Testing System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TestProvider>
          {children}
        </TestProvider>
      </body>
    </html>
  );
}
