'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ModalRegistroBaixa({
  isOpen,
  onClose,
  produto,
  onSubmit,
  onSubmitRefresh,
}) {
  const [quantidade, setQuantidade] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quando abre o modal, define valores iniciais
  useEffect(() => {
    if (isOpen && produto) {
      setQuantidade('1');
      setValorTotal(produto.precoVenda.toFixed(2));
    }
  }, [isOpen, produto]);

  // // Atualiza valor total automaticamente quando muda a quantidade (mas permite edição manual)
  // useEffect(() => {
  //   if (produto && quantidade) {
  //     const qtd = parseInt(quantidade, 10);
  //     if (!isNaN(qtd) && qtd > 0) {
  //       const valorCalculado = (produto.precoVenda * qtd).toFixed(2);
  //       // Só atualiza automaticamente se o usuário não alterou manualmente
  //       if (valorTotal === '' || parseFloat(valorTotal) === produto.precoVenda * (qtd - 1 || 1)) {
  //         setValorTotal(valorCalculado);
  //       }
  //     }
  //   }
  // }, [quantidade, produto]);

  // Atualiza valor total automaticamente quando muda a quantidade (mas permite edição manual)
  useEffect(() => {
    if (produto && quantidade) {
      const qtd = parseInt(quantidade, 10);
      if (!isNaN(qtd) && qtd > 0) {
        const valorCalculado = (produto.precoVenda * qtd).toFixed(2);
        // Só atualiza automaticamente se o usuário não alterou manualmente
        if (valorTotal === '' || parseFloat(valorTotal) === produto.precoVenda * (qtd - 1 || 1)) {
          setValorTotal(valorCalculado);
        }
      }
    }
  }, [quantidade, produto, valorTotal]); // ← adiciona valorTotal aqui

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const qtd = parseInt(quantidade, 10);

    // Validações
    if (!quantidade || isNaN(qtd) || qtd <= 0) {
      toast.error('Digite uma quantidade válida');
      setIsSubmitting(false);
      return;
    }

    if (qtd > produto.quantidade) {
      toast.error('Quantidade maior que o estoque disponível');
      setIsSubmitting(false);
      return;
    }

    if (!valorTotal || parseFloat(valorTotal) <= 0) {
      toast.error('Digite o valor total vendido');
      setIsSubmitting(false);
      return;
    }

    try {
      const baixaData = {
        produtoId: produto.id,
        quantidade: qtd,
        valorTotal: parseFloat(valorTotal),
      };

      const response = await onSubmit(baixaData);

      if (!response || !response.ok) {
        const errorData = response ? await response.json() : {};
        throw new Error(errorData.error || 'Erro ao registrar a baixa');
      }

      toast.success('Baixa registrada com sucesso!');

      // Limpa campos
      setQuantidade('');
      setValorTotal('');

      if (typeof onSubmitRefresh === 'function') {
        onSubmitRefresh();
      }

      onClose();
    } catch (error) {
      console.error('Erro ao registrar baixa:', error);
      toast.error(error.message || 'Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full m-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">↓</span>
            <h2 className="text-xl font-bold">Dar Baixa - {produto.nome}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-light"
          >
            ×
          </button>
        </div>

        {/* Corpo */}
        <div className="p-6 space-y-6">
          {/* Infos do produto */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p>Estoque atual: <span className="font-bold text-green-600">{produto.quantidade}</span></p>
            <p>Preço de venda: <span className="font-bold text-green-600">R$ {produto.precoVenda.toFixed(2)}</span></p>
          </div>

          {/* Quantidade */}
          <div className="relative">
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              min="1"
              max={produto.quantidade}
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <label className="absolute left-4 -top-2 text-xs bg-white px-2 text-gray-500 peer-focus:text-green-500">
              Quantidade <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Valor Total */}
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <label className="absolute left-4 -top-2 text-xs bg-white px-2 text-gray-500 peer-focus:text-green-500">
              Valor Total Vendido (R$) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Pode alterar para aplicar desconto ou preço diferente
            </p>
          </div>

          {/* Data automática */}
          <p className="text-sm text-gray-600 text-center">
            Data da baixa: <span className="font-medium">{format(new Date(), 'dd/MM/yyyy')}</span>
          </p>
        </div>

        {/* Botões */}
        <div className="p-6 bg-gray-50 border-t flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              isSubmitting
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSubmitting ? 'Processando...' : 'Confirmar Baixa'}
          </button>
        </div>
      </div>
    </div>
  );
}