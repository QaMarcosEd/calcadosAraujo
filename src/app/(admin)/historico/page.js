'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '@/components/layout/Header';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { format } from 'date-fns';

export default function HistoricoBaixas() {
  const [baixas, setBaixas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');
  const [referenciaFiltro, setReferenciaFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [totalVendido, setTotalVendido] = useState(0);
  const [totalPares, setTotalPares] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [detalheModalOpen, setDetalheModalOpen] = useState(false);
  const [baixaSelecionada, setBaixaSelecionada] = useState(null);

    const abrirDetalhe = (baixa) => {
    setBaixaSelecionada(baixa);
    setDetalheModalOpen(true);
    };

    const fecharDetalhe = () => {
    setDetalheModalOpen(false);
    setBaixaSelecionada(null);
    };

  const fetchBaixas = async (filtros = {}, pg = 1) => {
    setLoading(true);
    setApiError(null);
    try {
      const query = new URLSearchParams();
      if (filtros.marca) query.append('marca', filtros.marca);
      if (filtros.tamanho) query.append('tamanho', filtros.tamanho);
      if (filtros.referencia) query.append('referencia', filtros.referencia);
      if (filtros.dataInicio) query.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) query.append('dataFim', filtros.dataFim);
      query.append('page', pg.toString());

      const res = await fetch(`/api/baixas?${query.toString()}`);
      if (!res.ok) throw new Error('Erro ao carregar histórico');
      const data = await res.json();

      setBaixas(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalVendido(data.totalVendido || 0);
      setTotalPares(data.totalPares || 0);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar histórico');
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaixas({}, page);
  }, [page]);

  const aplicarFiltro = () => {
    fetchBaixas({
      marca: marcaFiltro,
      tamanho: tamanhoFiltro,
      referencia: referenciaFiltro,
      dataInicio,
      dataFim,
    }, 1);
    setPage(1);
  };

  const resetFiltros = () => {
    setMarcaFiltro('');
    setTamanhoFiltro('');
    setReferenciaFiltro('');
    setDataInicio('');
    setDataFim('');
    setPage(1);
    fetchBaixas({}, 1);
  };

  if (loading) return <LoadingSkeleton type="estoque" />;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Histórico de Baixas" greeting="📊 Todas as vendas registradas" />

      <div className="max-w-7xl mx-auto w-full">
        {apiError && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-6">
            Erro: {apiError}
          </div>
        )}

        {/* Cards de totais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-sm text-gray-600">Valor Total Vendido</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalVendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-sm text-gray-600">Pares Vendidos</p>
            <p className="text-2xl font-bold text-blue-600">{totalPares}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-sm text-gray-600">Total de Registros</p>
            <p className="text-2xl font-bold text-gray-800">{baixas.length} nesta página</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <input placeholder="Marca" value={marcaFiltro} onChange={(e) => setMarcaFiltro(e.target.value)} className="border rounded-lg p-2" />
            <input placeholder="Tamanho" type="number" value={tamanhoFiltro} onChange={(e) => setTamanhoFiltro(e.target.value)} className="border rounded-lg p-2" />
            <input placeholder="Referência" value={referenciaFiltro} onChange={(e) => setReferenciaFiltro(e.target.value)} className="border rounded-lg p-2" />
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="border rounded-lg p-2" />
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border rounded-lg p-2" />
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={aplicarFiltro} className="bg-green-500 text-white px-4 py-2 rounded-lg">Aplicar</button>
            <button onClick={resetFiltros} className="bg-gray-300 px-4 py-2 rounded-lg">Limpar</button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Data</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Produto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tam.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold hidden md:table-cell">Ref.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Qtd</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Valor Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {baixas.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{format(new Date(b.dataBaixa), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3 text-sm font-medium">{b.produto.nome}</td>
                  <td className="px-4 py-3 text-sm">{b.produto.tamanho}</td>
                  <td className="px-4 py-3 text-sm hidden md:table-cell">{b.produto.referencia || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-bold">{b.quantidade}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    R$ {b.valorTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                        onClick={() => abrirDetalhe(b)}
                        className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                        Ver mais
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {baixas.length === 0 && <p className="text-center py-8 text-gray-500">Nenhuma baixa encontrada</p>}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-4">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Anterior</button>
            <span className="px-4 py-2">Página {page} de {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Próxima</button>
          </div>
        )}
      </div>
      {/* Modal de Detalhes da Baixa - VERSÃO SIMPLES E LIMPA */}
{detalheModalOpen && baixaSelecionada && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full m-4 p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h3 className="text-xl font-bold text-gray-800">Detalhes da Venda</h3>
        <button onClick={fecharDetalhe} className="text-3xl text-gray-500 hover:text-gray-700">&times;</button>
      </div>

      <div className="space-y-4 text-sm">
        <div className="text-center text-gray-600">
          <p className="text-lg font-medium">{baixaSelecionada.produto.nome}</p>
          <p>Tamanho {baixaSelecionada.produto.tamanho} • {baixaSelecionada.produto.cor}</p>
          <p className="text-xs mt-1">{format(new Date(baixaSelecionada.dataBaixa), 'dd/MM/yyyy')}</p>
          <p className="font-bold mt-2">Quantidade: {baixaSelecionada.quantidade} par{baixaSelecionada.quantidade > 1 ? 'es' : ''}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          <div className="flex justify-between text-base">
            <span className="text-gray-600">Preço de Custo</span>
            <span className="font-semibold">R$ {(baixaSelecionada.produto.precoCusto || 0).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base">
            <span className="text-gray-600">Preço de Venda</span>
            <span className="font-semibold text-blue-600">R$ {baixaSelecionada.produto.precoVenda.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-lg border-t pt-3">
            <span className="font-bold">Valor Vendido</span>
            <span className="font-bold text-green-600">R$ {baixaSelecionada.valorTotal.toFixed(2)}</span>
          </div>

          {/* Lucro */}
          <div className="flex justify-between text-xl font-bold border-t-2 pt-4">
            <span>Lucro</span>
            <span className={
              baixaSelecionada.valorTotal - (baixaSelecionada.produto.precoCusto || 0) * baixaSelecionada.quantidade >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }>
              R$ {(baixaSelecionada.valorTotal - (baixaSelecionada.produto.precoCusto || 0) * baixaSelecionada.quantidade).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Aviso de desconto ou venda acima */}
        {baixaSelecionada.valorTotal !== baixaSelecionada.produto.precoVenda * baixaSelecionada.quantidade && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-center text-sm font-medium text-yellow-800">
            {baixaSelecionada.valorTotal > baixaSelecionada.produto.precoVenda * baixaSelecionada.quantidade 
              ? 'Venda acima do preço padrão!' 
              : 'Desconto aplicado na venda'}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <button onClick={fecharDetalhe} className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition">
          Fechar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}