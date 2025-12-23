'use client';

import { useState } from 'react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, produtoNome }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
 setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full m-4 p-6 transform transition-all duration-300">
        {/* Header com ícone de alerta */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-xl font-bold font-poppins text-gray-800">Confirmar Exclusão</h2>
        </div>
        
        {/* Mensagem com destaque no nome */}
        <p className="text-sm font-poppins text-gray-600 mb-6 leading-relaxed">
          Tem certeza que deseja deletar o produto <span className="font-semibold text-red-600">{produtoNome}</span>? Essa ação não pode ser desfeita e removerá permanentemente todos os dados associados.
        </p>

        {/* Botões com loading spinner e estilos consistentes */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-5 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm font-poppins disabled:opacity-50"
          >
            ❌ Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm font-poppins disabled:opacity-50 relative"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid"></div>
                Deletando...
              </>
            ) : (
              <>
                🗑️ Deletar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}