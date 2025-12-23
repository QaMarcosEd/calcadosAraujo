// src/components/modals/EditarLoteModal.js
'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EditarLoteModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: digitar lote, 2: editar
  const [loteCodigo, setLoteCodigo] = useState('');
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [loteData, setLoteData] = useState(null); // dados do lote

  const [precoPromocao, setPrecoPromocao] = useState('');
  const [emPromocao, setEmPromocao] = useState(false);

  if (!isOpen) return null;

  const buscarLote = async () => {
    if (!loteCodigo.trim()) {
      toast.error('Digite o código do lote');
      return;
    }

    setLoadingBusca(true);
    try {
      const res = await fetch(`/api/produtos/busca-lote?lote=${encodeURIComponent(loteCodigo.trim())}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao buscar');
      }
      const data = await res.json();

      setLoteData(data);
      setEmPromocao(data.valoresAtuais.emPromocao);
      setPrecoPromocao(data.valoresAtuais.precoPromocao?.toString() || '');
      setStep(2);
      toast.success(`Lote encontrado: ${data.quantidade} produtos`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingBusca(false);
    }
  };

  const salvar = async () => {
    if (!emPromocao) {
      toast.error('Marque "Ativar promoção" para continuar');
      return;
    }

    if (!precoPromocao || parseFloat(precoPromocao) <= 0) {
      toast.error('Preço promocional obrigatório e válido');
      return;
    }

    const pp = parseFloat(precoPromocao);
    if (pp >= loteData.valoresAtuais.precoVenda) {
      toast.error('Preço promocional deve ser menor que o preço atual');
      return;
    }

    const payload = {
      lote: loteCodigo.trim(),
      emPromocao: true,
      precoPromocao: pp,
    };

    setLoadingSalvar(true);
    try {
      const res = await fetch('/api/produtos/lote/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      toast.success(result.message);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setLoadingSalvar(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 bg-gradient-to-r from-[#394189] to-[#c33638] text-white rounded-t-2xl relative">
          <h2 className="text-2xl font-bold">Promoção em Lote</h2>
          <button onClick={onClose} className="absolute top-6 right-6 text-white text-3xl hover:opacity-80">×</button>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 ? (
            <>
              <p className="text-gray-600">Digite o código do lote para ativar promoção em massa.</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={loteCodigo}
                  onChange={(e) => setLoteCodigo(e.target.value)}
                  placeholder="Ex: Lote-20251218-456"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#394189]"
                  onKeyDown={(e) => e.key === 'Enter' && buscarLote()}
                />
                <button
                  onClick={buscarLote}
                  disabled={loadingBusca}
                  className="bg-[#394189] text-white px-6 py-3 rounded-lg hover:bg-[#c33638] disabled:opacity-50"
                >
                  {loadingBusca ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold">Lote: {loteCodigo}</p>
                <p>{loteData.quantidade} produtos</p>
                <p className="mt-2">Preço atual: R$ {loteData.valoresAtuais.precoVenda.toFixed(2)}</p>
                {loteData.valoresAtuais.precoCusto && <p>Custo: R$ {loteData.valoresAtuais.precoCusto.toFixed(2)}</p>}
                {loteData.valoresAtuais.emPromocao && <p className="text-red-600 font-medium">Já em promoção: R$ {loteData.valoresAtuais.precoPromocao?.toFixed(2)}</p>}
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-lg font-medium">
                  <input
                    type="checkbox"
                    checked={emPromocao}
                    onChange={(e) => setEmPromocao(e.target.checked)}
                    className="w-6 h-6 text-[#c33638] rounded"
                  />
                  Ativar promoção para todo o lote
                </label>

                {emPromocao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promocional</label>
                    <input
                      type="number"
                      step="0.01"
                      value={precoPromocao}
                      onChange={(e) => setPrecoPromocao(e.target.value)}
                      placeholder="Ex: 99.90"
                      className="w-full px-4 py-3 border-2 border-[#c33638] rounded-lg focus:ring-red-500 font-semibold text-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep(1);
                    setLoteData(null);
                    setEmPromocao(false);
                    setPrecoPromocao('');
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={salvar}
                  disabled={loadingSalvar || !emPromocao || !precoPromocao}
                  className="flex-1 bg-[#c33638] text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
                >
                  {loadingSalvar ? 'Aplicando...' : 'Ativar Promoção'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}