'use client';

import { Toaster } from 'react-hot-toast';

export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        success: {
          style: {
            background: '#D1FAE5',
            color: '#065F46',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          style: {
            background: '#FEE2E2',
            color: '#991B1B',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
        // Exemplo de aviso
        custom: {
          style: {
            background: '#FEF9C3',
            color: '#92400E',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          },
          iconTheme: {
            primary: '#FACC15',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
