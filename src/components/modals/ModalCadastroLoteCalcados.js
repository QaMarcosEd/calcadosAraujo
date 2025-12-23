// src/components/modals/ModalCadastroLoteCalcados.js
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ModalCadastroLoteCalçados({ isOpen, onClose, onSubmit }) {
  const [genericos, setGenericos] = useState({
    nome: '',
    referencia: '',
    cor: '',
    precoCusto: '',
    precoVenda: '',
    imagem: '',
    genero: '',
    modelo: '',
    marca: '',
    lote: '',
    dataRecebimento: format(new Date(), 'yyyy-MM-dd'),
  });
  const [variacoes, setVariacoes] = useState([]);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');

  const tamanhos = Array.from({ length: 25 }, (_, i) => 20 + i); // 20 a 44
  const tamanhosPorGenero = {
    MASCULINO: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    FEMININO: [33, 34, 35, 36, 37, 38, 39, 40],
    INFANTIL_MASCULINO: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
    INFANTIL_FEMININO: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
  };

  const handleGenericosChange = (e) => {
    setGenericos({ ...genericos, [e.target.name]: e.target.value });
  };

  const toggleTamanho = (tamanho) => {
    const existente = variacoes.find((v) => v.tamanho === tamanho);
    if (existente) {
      setVariacoes(variacoes.filter((v) => v.tamanho !== tamanho));
    } else {
      setVariacoes([...variacoes, { tamanho, quantidade: 1 }]);
    }
  };

  const updateQuantidade = (tamanho, quantidade) => {
    setVariacoes(variacoes.map((v) => (v.tamanho === tamanho ? { ...v, quantidade: parseInt(quantidade) || 0 } : v)));
  };

  const aplicarQuantidadeTodos = (quantidade) => {
    setVariacoes(variacoes.map((v) => ({ ...v, quantidade: parseInt(quantidade) || 0 })));
  };

  const handleSubmit = async () => {
    if (!variacoes.length || variacoes.every((v) => v.quantidade <= 0)) {
      toast.error('Selecione pelo menos um tamanho com quantidade maior que 0');
      return;
    }

    if (!genericos.dataRecebimento) {
      toast.error('Data de Recebimento é obrigatória');
      return;
    }
    if (new Date(genericos.dataRecebimento).toString() === 'Invalid Date') {
      toast.error('Data de Recebimento inválida');
      return;
    }
    if (new Date(genericos.dataRecebimento) > new Date()) {
      toast.error('Data de Recebimento não pode ser futura');
      return;
    }
    if (!genericos.precoVenda || parseFloat(genericos.precoVenda) <= 0) {
      toast.error('Preço de venda é obrigatório e deve ser maior que 0');
      return;
    }

    const data = { genericos, variacoes };
    try {
      const response = await onSubmit(data);
      if (response.status === 201) {
        toast.success('Lote cadastrado com sucesso! ✅');
        resetForm();
        onClose();
      } else {
        toast.error(response.data.error || 'Erro ao cadastrar lote ❌');
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao cadastrar lote ❌');
    }
  };

  const resetForm = () => {
    setGenericos({
      nome: '',
      referencia: '',
      cor: '',
      precoCusto: '',
      precoVenda: '',
      imagem: '',
      genero: '',
      modelo: '',
      marca: '',
      lote: '',
      dataRecebimento: format(new Date(), 'yyyy-MM-dd'),
    });
    setVariacoes([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full m-4 flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300">
        {/* Header estilizado com emoji */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-bold font-poppins">Cadastrar Lote de Calçados</h2>
          </div>
          <button onClick={handleClose} aria-label="Fechar modal" className="text-white hover:text-gray-200 transition text-2xl">
            ❌
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-8">
          {/* Dados Genéricos */}
          <div className="bg-white p-5 rounded-lg shadow-inner border border-gray-200">
            <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-5 flex items-center gap-2">
              <span className="text-xl">📋</span> Cadastro de Lote
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
              <div className="relative">
                <input
                  name="nome"
                  value={genericos.nome}
                  onChange={handleGenericosChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                  required
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Nome do Modelo <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative">
                <input
                  name="referencia"
                  value={genericos.referencia}
                  onChange={handleGenericosChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                  required
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Referência <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative">
                <input
                  name="cor"
                  value={genericos.cor}
                  onChange={handleGenericosChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                  required
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Cor <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative">
                <input
                  name="precoCusto"
                  type="number"
                  value={genericos.precoCusto}
                  onChange={handleGenericosChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Preço de Custo (R$) (opcional)
                </label>
              </div>

              <div className="relative">
                <input
                  name="precoVenda"
                  type="number"
                  value={genericos.precoVenda}
                  onChange={handleGenericosChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                  required
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Preço de Venda (R$) <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative sm:col-span-2">
                <input
                  name="imagem"
                  value={genericos.imagem}
                  onChange={handleGenericosChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  URL da Imagem (opcional)
                </label>
              </div>

              {genericos.imagem && (
                <div className="sm:col-span-2 mt-2">
                  <img
                    src={genericos.imagem}
                    alt="Prévia da imagem"
                    className="max-w-full h-48 object-cover rounded-lg shadow-md border border-gray-200"
                    onError={() => toast.error('URL da imagem inválida')}
                  />
                </div>
              )}

              <div className="relative">
                <select
                  name="genero"
                  value={genericos.genero}
                  onChange={handleGenericosChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                  required
                >
                  <option value="">Selecione o Gênero</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="INFANTIL_MASCULINO">Infantil Masculino</option>
                  <option value="INFANTIL_FEMININO">Infantil Feminino</option>
                </select>
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Gênero <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative">
                <select
                  name="modelo"
                  value={genericos.modelo}
                  onChange={handleGenericosChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                  required
                >
                  <option value="">Selecione o Modelo</option>
                  <option value="Anabela">Anabela</option>
                  <option value="Ankle Boot">Ankle Boot</option>
                  <option value="Bota">Bota</option>
                  <option value="Chinelo">Chinelo</option>
                  <option value="Coturno">Coturno</option>
                  <option value="Crocs">Crocs</option>
                  <option value="Mocassim">Mocassim</option>
                  <option value="Mule">Mule</option>
                  <option value="Papete">Papete</option>
                  <option value="Plataforma">Plataforma</option>
                  <option value="Rasteirinha">Rasteirinha</option>
                  <option value="Sandália">Sandália</option>
                  <option value="Sapatilha">Sapatilha</option>
                  <option value="Sapatênis">Sapatênis</option>
                  <option value="Scarpin">Scarpin</option>
                  <option value="Slide">Slide</option>
                  <option value="Tamanco">Tamanco</option>
                  <option value="Tênis Casual">Tênis Casual</option>
                  <option value="Tênis Esportivo">Tênis Esportivo</option>
                  <option value="Chuteira de Campo">Chuteira de Campo</option>
                  <option value="Chuteira Society">Chuteira Society</option>
                  <option value="Chuteira de Futsal">Chuteira de Futsal</option>
                </select>
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Modelo <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative">
                <select
                  name="marca"
                  value={genericos.marca}
                  onChange={handleGenericosChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                  required
                >
                  <option value="">Selecione a Marca</option>
                  <option value="Adidas">Adidas</option>
                  <option value="Beira Rio">Beira Rio</option>
                  <option value="Cartago">Cartago</option>
                  <option value="Comfortflex">Comfortflex</option>
                  <option value="Constance">Constance</option>
                  <option value="Dakota">Dakota</option>
                  <option value="Dalponte">Dalponte</option>
                  <option value="Democrata">Democrata</option>
                  <option value="DPlaka">DPlaka</option>
                  <option value="Euro">Euro</option>
                  <option value="Ferracini">Ferracini</option>
                  <option value="Fila">Fila</option>
                  <option value="Grendene Kids">Grendene Kids</option>
                  <option value="Jet Kids">Jet Kids</option>
                  <option value="Kenner">Kenner</option>
                  <option value="Klin">Klin</option>
                  <option value="Kolosh">Kolosh</option>
                  <option value="Mathaus">Mathaus</option>
                  <option value="Mississipi">Mississipi</option>
                  <option value="Mizuno">Mizuno</option>
                  <option value="Modare">Modare</option>
                  <option value="Moleca">Moleca</option>
                  <option value="Molekinha">Molekinha</option>
                  <option value="Molekinho">Molekinho</option>
                  <option value="New Balance">New Balance</option>
                  <option value="Nike">Nike</option>
                  <option value="Olympikus">Olympikus</option>
                  <option value="Pé com Pé">Pé com Pé</option>
                  <option value="Pegada">Pegada</option>
                  <option value="Piccadilly">Piccadilly</option>
                  <option value="Ramarim">Ramarim</option>
                  <option value="Rider">Rider</option>
                  <option value="Softli">Softli</option>
                  <option value="Strike">Strike</option>
                  <option value="Sua Cia">Sua Cia</option>
                  <option value="Mini Sua Cia">Mini Sua Cia</option>
                  <option value="Vans">Vans</option>
                  <option value="Via Marte">Via Marte</option>
                  <option value="Via Scarpa">Via Scarpa</option>
                  <option value="Vitz">Vitz</option>
                  <option value="Vizzano">Vizzano</option>
                </select>
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Marca <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <div className="relative">
                <input
                  name="lote"
                  value={genericos.lote}
                  onChange={handleGenericosChange}
                  placeholder=" "
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-transparent font-poppins text-sm"
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Lote (opcional)
                </label>
              </div>

              <div className="relative sm:col-span-2">
                <input
                  name="dataRecebimento"
                  type="date"
                  value={genericos.dataRecebimento}
                  onChange={handleGenericosChange}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-poppins text-sm"
                  required
                />
                <label className="absolute left-4 -top-2 text-xs bg-white px-1 text-gray-500 pointer-events-none transition-all duration-200 peer-focus:text-blue-500">
                  Data de Recebimento <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
            </div>
          </div>

          {/* Numerações e Quantidades */}
          <div className="bg-white p-5 rounded-lg shadow-inner border border-gray-200">
            <h3 className="text-lg font-semibold font-poppins text-gray-700 mb-5 flex items-center gap-2">
              <span className="text-xl">👟</span> Tamanhos e Quantidades
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-5">
              {(genericos.genero ? tamanhosPorGenero[genericos.genero] || tamanhos : tamanhos).map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTamanho(t)}
                  className={`p-2 rounded-lg text-sm font-poppins transition-all duration-200 ${
                    variacoes.some((v) => v.tamanho === t)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {variacoes.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center mb-5 gap-3">
                <input
                  type="number"
                  placeholder="Quantidade para todos"
                  onChange={(e) => aplicarQuantidadeTodos(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm"
                />
                <button
                  onClick={() => aplicarQuantidadeTodos(document.querySelector('input[placeholder="Quantidade para todos"]').value)}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-poppins text-sm shadow-md"
                >
                  Aplicar a Todos
                </button>
              </div>
            )}
            <div className="space-y-3 mb-4">
              {variacoes.map((v) => (
                <div key={v.tamanho} className="flex items-center gap-3">
                  <span className="w-24 font-poppins text-sm text-gray-700">Tamanho {v.tamanho}:</span>
                  <input
                    type="number"
                    value={v.quantidade}
                    onChange={(e) => updateQuantidade(v.tamanho, e.target.value)}
                    className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-poppins text-sm text-gray-600"
                    min="0"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-poppins text-gray-600 font-medium">
              Total: <span className="text-blue-600">{variacoes.reduce((sum, v) => sum + parseInt(v.quantidade || 0), 0)} pares</span>
            </p>
          </div>
        </div>

        {/* Footer com botões e emojis */}
        <div className="p-6 bg-white border-t border-gray-200 flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
          >
            ❌ Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
          >
            💾 Salvar Lote
          </button>
        </div>
      </div>
    </div>
  );
}
