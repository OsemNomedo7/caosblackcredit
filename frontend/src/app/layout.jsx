import './globals.css';
import { SiteConfigProvider } from '@/context/SiteConfigContext';

export const metadata = {
  title: 'CreditoFácil — Cartão para Negativados',
  description: 'Cartão de crédito aprovado mesmo com restrições. Até R$2.000 de limite. Análise imediata.',
  keywords: 'cartão de crédito, negativado, limite, aprovação imediata, crédito fácil',
  openGraph: {
    title: 'CreditoFácil — Cartão para Negativados',
    description: 'Aprovação imediata. Até R$2.000 de limite.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#820AD1" />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <SiteConfigProvider>
          {children}
        </SiteConfigProvider>
      </body>
    </html>
  );
}
