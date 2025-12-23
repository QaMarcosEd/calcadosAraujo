'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Zap, TrendingUp, CreditCard, User, ShoppingCart, Plus } from 'lucide-react';
import ModalRegistroBaixa from '../../../components/modals/ModalRegistroBaixa';
import ConfirmDeleteModal from '../../../components/modals/ConfirmDeleteModal';
import ModalCadastroLoteCalçados from '../../../components/modals/ModalCadastroLoteCalcados';
import EditarProdutoModal from '../../../components/modals/EditarProdutoModal';
import EditarLoteModal from '../../../components/modals/EditarLoteModal';
import toast from 'react-hot-toast';
import PageHeader from '@/components/layout/Header';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { useSession } from 'next-auth/react';

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loteModalOpen, setLoteModalOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteProduto, setSelectedDeleteProduto] = useState(null);
  const [marcaFiltro, setMarcaFiltro] = useState('');
  const [tamanhoFiltro, setTamanhoFiltro] = useState('');
  const [referenciaFiltro, setReferenciaFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [valorEstoque, setValorEstoque] = useState(0);
  const [paresTotais, setParesTotais] = useState(0);
  const [esgotados, setEsgotados] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [editarLoteModalOpen, setEditarLoteModalOpen] = useState(false);

  const { data: session } = useSession();

  // --- Função principal para buscar produtos ---
  const fetchProdutos = async (filtros = {}, pg = 1) => {
    setLoading(true);
    setApiError(null);
    try {
      const query = new URLSearchParams();
      if (filtros.marca) query.append('marca', filtros.marca);
      if (filtros.tamanho) query.append('numeracao', filtros.tamanho);
      if (filtros.referencia) query.append('referencia', filtros.referencia);
      query.append('page', pg.toString());

      const res = await fetch(`/api/estoque?${query.toString()}`);
      if (!res.ok) {
        throw new Error(`Erro ao buscar estoque: ${res.status}`);
      }

      const data = await res.json();
      console.log('Resposta da API /api/estoque:', data);

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Formato de dados inválido: "data" não é um array');
      }

      setProdutos(data.data);
      setTotalPages(data.totalPages || 1);
      setValorEstoque(data.valorEstoque || 0);
      setParesTotais(data.paresTotais || 0);
      setEsgotados(data.esgotados || 0);
    } catch (error) {
      console.error('Erro no fetchProdutos:', error);
      toast.error('Erro ao carregar estoque. Verifique o console para detalhes.');
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Evita chamadas duplicadas no modo estrito do React ---
  useEffect(() => {
    let ignore = false;

    const carregar = async () => {
      if (!ignore) await fetchProdutos({}, page);
    };

    carregar();
    return () => {
      ignore = true;
    };
  }, [page]);

  // --- Garante que a página nunca passe do total disponível ---
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  // --- Filtro aplicado manualmente (mantém sua lógica original) ---
  const aplicarFiltro = () => {
    if (tamanhoFiltro && (isNaN(parseInt(tamanhoFiltro)) || parseInt(tamanhoFiltro) <= 0)) {
      toast.error('Numeração deve ser um número positivo');
      return;
    }
    fetchProdutos(
      {
        marca: marcaFiltro,
        tamanho: tamanhoFiltro,
        referencia: referenciaFiltro,
      },
      1
    );
    setPage(1);
  };

  // --- Reset dos filtros (mantém lógica original) ---
  const resetFiltros = () => {
    setMarcaFiltro('');
    setTamanhoFiltro('');
    setReferenciaFiltro('');
    setPage(1);
    fetchProdutos({}, 1);
  };

  // --- Deleção de produto ---
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { error: 'Resposta inválida do servidor' };
      }

      if (response.ok) {
        toast.success(data.message || 'Produto deletado com sucesso!');
        fetchProdutos();
      } else {
        toast.error(data.error || 'Erro ao deletar produto');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error('Erro inesperado ao deletar produto');
    }
  };

  // --- Modais ---
  const handleOpenDeleteModal = (produto) => {
    setSelectedDeleteProduto(produto);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDeleteProduto(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedDeleteProduto) {
      await handleDelete(selectedDeleteProduto.id);
      handleCloseDeleteModal();
    }
  };

  const handleOpenModal = (produto) => {
    setSelectedProduto(produto);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduto(null);
  };

  const handleSubmitBaixa = async (baixaData) => {
  const response = await fetch('/api/baixas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(baixaData),
  });
  return response;
};

  const handleSubmitLote = async (data) => {
    const response = await fetch('/api/produtos/lote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.status === 201) {
      fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page);
    }
    return { status: response.status, data: result };
  };

  if (loading) return <LoadingSkeleton type="estoque" />;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Estoque" greeting="👟 Gerenciamento Completo - Calçados Araújo" />

      <div className="max-w-7xl mx-auto w-full">
        {/* ERRO DA API */}
        {apiError && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-6">
            Erro ao carregar dados: {apiError}. Tente limpar os filtros ou verificar o servidor.
          </div>
        )}

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { icon: Package, label: 'Valor Estoque', value: `R$ ${valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: '#394189' },
            { icon: Zap, label: 'Pares Totais', value: paresTotais.toLocaleString('pt-BR'), color: '#10B981' },
            { icon: TrendingUp, label: 'Esgotados', value: esgotados.toLocaleString('pt-BR'), color: '#F59E0B' },
            { icon: CreditCard, label: 'Páginas', value: totalPages, color: '#c33638' },
          ].map((card, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-16 flex items-center justify-between"
            >
              <div className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: card.color }}></div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100">
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div className="flex-1 ml-2 pr-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{card.label}</p>
                <p className="text-sm font-bold text-gray-900 truncate">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[#394189] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Filtros Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <input
              placeholder="🔍 Marca"
              value={marcaFiltro}
              onChange={(e) => setMarcaFiltro(e.target.value)}
              className="border border-[#394189]/20 rounded-lg p-3 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500 placeholder-gray-400"
            />
            <input
              placeholder="📏 Numeração"
              type="number"
              value={tamanhoFiltro}
              onChange={(e) => setTamanhoFiltro(e.target.value)}
              className="border border-[#394189]/20 rounded-lg p-3 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500 placeholder-gray-400"
            />
            <input
              placeholder="📋 Referência"
              value={referenciaFiltro}
              onChange={(e) => setReferenciaFiltro(e.target.value)}
              className="border border-[#394189]/20 rounded-lg p-3 focus:ring-2 focus:ring-[#394189] bg-white text-gray-500 placeholder-gray-400"
            />
            <button
              onClick={aplicarFiltro}
              className="bg-gradient-to-r from-[#394189] to-[#c33638] text-white font-semibold rounded-lg p-3 hover:from-[#c33638] hover:to-[#394189] transition-all flex items-center justify-center"
            >
              🔍 Filtrar
            </button>
            <button
              onClick={resetFiltros}
              className="bg-gray-200 text-gray-600 font-semibold rounded-lg p-3 hover:bg-gray-300 transition-all flex items-center justify-center"
            >
              🗑️ Limpar Filtros
            </button>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setLoteModalOpen(true)}
            className="group relative bg-green-500 text-white rounded-xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-sm font-semibold">Adicionar</span>
          </button>
          <button
            onClick={() => setEditarLoteModalOpen(true)}
            className="group relative bg-orange-500 text-white rounded-xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
          >
            <Package className="w-6 h-6 mb-1" />
            <span className="text-sm font-semibold">Editar Lote</span>
          </button>
          <Link
            href="/dashboard"
            className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:bg-[#394189]/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer"
          >
            <TrendingUp className="w-6 h-6 text-[#394189] mb-1 group-hover:text-[#394189]/80" />
            <span className="text-sm font-semibold text-gray-900 group-hover:text-[#394189]">Dashboard</span>
          </Link>
          
        </div>

        {/* TABELA */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200 mb-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-semibold text-[#394189] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            Lista Completa de Produtos
          </h2>
          {produtos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-3 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Tam.</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Ref.</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Modelo</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Cor</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qtd</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preço</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Gen.</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Marca</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-1 sm:px-2 lg:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produtos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 sm:px-3 lg:px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {p.nome}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {p.tamanho}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {p.referencia || 'N/A'}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {p.modelo}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {p.cor}
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {p.quantidade}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm font-semibold text-[#c33638]">
                        R$ {p.precoVenda?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {(() => {
                          switch (p.genero) {
                            case 'MASCULINO':
                              return 'M';
                            case 'FEMININO':
                              return 'F';
                            case 'INFANTIL_MASCULINO':
                              return 'IM';
                            case 'INFANTIL_FEMININO':
                              return 'IF';
                            default:
                              return p.genero;
                          }
                        })()}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {p.marca}
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          p.quantidade > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.quantidade > 0 ? '✅' : '❌'}
                        </span>
                      </td>
                      <td className="px-1 sm:px-2 lg:px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                        {/* EDITAR */}
                        {session?.user?.role === 'ADMIN' ? (
                          <button
                            onClick={() => {
                              setSelectedEditId(p.id);
                              setEditModalOpen(true);
                            }}
                            className="text-[#10B981] hover:text-green-700 font-medium transition-colors cursor-pointer"
                            title="Editar"
                          >
                            ✏️
                          </button>
                        ) : (
                          <span
                            className="text-gray-400 cursor-not-allowed"
                            title="Apenas administradores podem editar"
                          >
                            ✏️
                          </span>
                        )}

                        {/* EXCLUIR */}
                        {session?.user?.role === 'ADMIN' ? (
                          <button
                            onClick={() => handleOpenDeleteModal(p)}
                            className="text-[#c33638] hover:text-red-700 font-medium transition-colors cursor-pointer"
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        ) : (
                          <span
                            className="text-gray-400 cursor-not-allowed"
                            title="Apenas administradores podem excluir"
                          >
                            🗑️
                          </span>
                        )}

                        {/* BAIXA (funcionário pode) */}
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="text-[#394189] hover:text-blue-700 font-medium transition-colors cursor-pointer"
                          title="Baixa"
                        >
                          📦
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">Nenhum produto encontrado. 😔 Tente limpar os filtros.</p>
          )}
        </div>

        {/* PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 bg-[#394189] text-white font-semibold rounded-md hover:bg-[#c33638] disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-200 font-semibold rounded-md text-gray-700">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2 bg-[#394189] text-white font-semibold rounded-md hover:bg-[#c33638] disabled:opacity-50 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}

        {/* MODAIS */}
        <ModalRegistroBaixa
          isOpen={modalOpen}
          onClose={handleCloseModal}
          produto={selectedProduto}
          onSubmit={handleSubmitBaixa}
        />
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          produtoNome={selectedDeleteProduto?.nome || ''}
        />
        <ModalCadastroLoteCalçados
          isOpen={loteModalOpen}
          onClose={() => setLoteModalOpen(false)}
          onSubmit={handleSubmitLote}
        />
        <EditarProdutoModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEditId(null);
          }}
          produtoId={selectedEditId}
          onSuccess={() => fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page)}
        />
        <EditarLoteModal
          isOpen={editarLoteModalOpen}
          onClose={() => setEditarLoteModalOpen(false)}
          onSuccess={() => {
            fetchProdutos({ marca: marcaFiltro, tamanho: tamanhoFiltro, referencia: referenciaFiltro }, page);
            toast.success('Lote atualizado com sucesso!');
          }}
        />
      </div>
    </div>
  );
}



