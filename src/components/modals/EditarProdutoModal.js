// src/components/modals/EditarProdutoModal.js
'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function EditarProdutoModal({ isOpen, onClose, produtoId, onSuccess }) {
  const [form, setForm] = useState({
    nome: '',
    tamanho: '',
    referencia: '',
    cor: '',
    quantidade: '',
    precoCusto: '',
    precoVenda: '',
    precoPromocao: '',        // NOVO
    emPromocao: false,        // NOVO
    genero: '',
    modelo: '',
    marca: '',
    disponivel: true,
    dataRecebimento: '',
    lote: '',
    imagem: ''
  });
  const [loading, setLoading] = useState(true);

  // === CARREGA PRODUTO ===
  useEffect(() => {
    if (isOpen && produtoId) {
      setLoading(true);
      fetch(`/api/produtos/${produtoId}`)
        .then(res => {
          if (!res.ok) throw new Error('Produto não encontrado');
          return res.json();
        })
        .then(produto => {
          setForm({
            nome: produto.nome || '',
            tamanho: produto.tamanho?.toString() || '',
            referencia: produto.referencia || '',
            cor: produto.cor || '',
            quantidade: produto.quantidade?.toString() || '',
            precoCusto: produto.precoCusto?.toString() || '',
            precoVenda: produto.precoVenda?.toString() || '',
            precoPromocao: produto.precoPromocao?.toString() || '',
            emPromocao: produto.emPromocao || false,
            genero: produto.genero || '',
            modelo: produto.modelo || '',
            marca: produto.marca || '',
            disponivel: produto.quantidade > 0,
            dataRecebimento: produto.dataRecebimento
              ? format(new Date(produto.dataRecebimento), 'yyyy-MM-dd')
              : '',
            lote: produto.lote || '',
            imagem: produto.imagem || ''
          });
        })
        .catch(err => {
          console.error('Erro ao carregar produto:', err);
          toast.error('Erro ao carregar produto');
          onClose();
        })
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setForm({
        nome: '', tamanho: '', referencia: '', cor: '', quantidade: '', precoCusto: '',
        precoVenda: '', genero: '', modelo: '', marca: '', disponivel: true,
        dataRecebimento: '', lote: '', imagem: ''
      });
      setLoading(false);
    }
  }, [isOpen, produtoId, onClose]);

  // === INPUT CHANGE ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      disponivel: name === 'quantidade' ? parseInt(value) > 0 : prev.disponivel
    }));
  };

const handleSubmit = async (e) => {
  e?.preventDefault();
  console.log('BOTÃO CLICADO! ID:', produtoId);

  // VALIDAÇÃO
  const required = ['nome', 'tamanho', 'referencia', 'cor', 'quantidade', 'precoCusto', 'precoVenda', 'genero', 'modelo', 'marca', 'dataRecebimento'];
  for (const field of required) {
    if (!form[field]) {
      toast.error(`Preencha: ${field === 'precoVenda' ? 'Preço de Venda' : field}`);
      return;
    }
  }

    // Validação da promoção
  if (form.emPromocao) {
    if (!form.precoPromocao || parseFloat(form.precoPromocao) <= 0) {
      toast.error('Preencha o preço promocional corretamente');
      return;
    }
    if (parseFloat(form.precoPromocao) >= parseFloat(form.precoVenda)) {
      toast.error('O preço promocional deve ser menor que o preço normal');
      return;
    }
  }

  const dataRecebimento = new Date(form.dataRecebimento);
  if (isNaN(dataRecebimento.getTime())) {
    toast.error('Data inválida');
    return;
  }
  if (dataRecebimento > new Date()) {
    toast.error('Data futura');
    return;
  }

  const payload = {
    id: produtoId, // ADICIONE O ID AQUI
    nome: form.nome,
    tamanho: parseInt(form.tamanho),
    referencia: form.referencia,
    cor: form.cor,
    quantidade: parseInt(form.quantidade),
    precoCusto: parseFloat(form.precoCusto),
    precoVenda: parseFloat(form.precoVenda),
    precoPromocao: form.emPromocao ? parseFloat(form.precoPromocao) : null,
    emPromocao: form.emPromocao,
    genero: form.genero,
    modelo: form.modelo,
    marca: form.marca,
    lote: form.lote || null,
    imagem: form.imagem || null,
    dataRecebimento: dataRecebimento.toISOString(),
  };

  try {
    const res = await fetch(`/api/produtos/${produtoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: 'Resposta inválida' };
    }

    if (!res.ok) {
      // TRATAMENTO ESPECIAL PARA 403 (permissão)
      if (res.status === 403) {
        toast.error(data.error || 'Você não tem permissão para editar produtos.');
        return;
      }
      // Outros erros
      toast.error(data.error || 'Erro ao atualizar produto');
      return;
    }

    // SUCESSO
    toast.success('Produto atualizado com sucesso!');
    onSuccess?.();
    onClose();
  } catch (err) {
    console.error('Erro ao salvar:', err);
    toast.error('Erro inesperado ao atualizar');
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">Editar Produto</span>
            <h2 className="text-2xl font-bold font-poppins">Editar Produto</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">
            Fechar
          </button>
        </div>

        {/* Form com scroll e min-h-0 */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 bg-gray-50 text-gray-500 min-h-0"
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500"></div>
              <span className="ml-3 text-gray-600 font-poppins">Carregando...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

              {/* === TODOS OS INPUTS === */}
              <div className="relative">
                <input name="nome" value={form.nome} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Nome <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input name="tamanho" type="number" value={form.tamanho} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Tamanho <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input name="referencia" value={form.referencia} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Referência <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input name="cor" value={form.cor} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Cor <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input name="quantidade" type="number" value={form.quantidade} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Quantidade <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input name="precoCusto" type="number" step="0.01" value={form.precoCusto} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Preço de Custo
                </label>
              </div>

              <div className="relative">
                <input name="precoVenda" type="number" step="0.01" value={form.precoVenda} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Preço de Venda <span className="text-red-500">*</span>
                </label>
              </div>

              {/* === PROMOÇÃO === */}
              <div className="md:col-span-2 mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="checkbox"
                    id="emPromocao"
                    name="emPromocao"
                    checked={form.emPromocao}
                    onChange={(e) => setForm(prev => ({ ...prev, emPromocao: e.target.checked }))}
                    className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="emPromocao" className="text-lg font-semibold text-amber-800 cursor-pointer">
                    🔥 Colocar este produto em PROMOÇÃO
                  </label>
                </div>

                {form.emPromocao && (
                  <div className="relative animate-fadeIn">
                    <input
                      name="precoPromocao"
                      type="number"
                      step="0.01"
                      value={form.precoPromocao}
                      placeholder=" "
                      onChange={handleChange}
                      className="peer w-full px-4 py-3 pt-5 border-2 border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-lg font-semibold text-amber-900"
                    />
                    <label className="absolute left-4 -top-2 text-xs bg-amber-50 px-2 text-amber-700 peer-focus:text-amber-900 font-medium">
                      Preço Promocional <span className="text-red-500">*</span>
                    </label>
                    <p className="mt-2 text-sm text-amber-700">
                      De: <span className="line-through">R$ {parseFloat(form.precoVenda || 0).toFixed(2)}</span>
                      {' → '} Por: <span className="font-bold text-xl text-green-600">R$ {form.precoPromocao || '0,00'}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="relative md:col-span-2">
                <input name="imagem" type="text" value={form.imagem} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  URL da Imagem
                </label>
                {form.imagem && (
                  // <img src={form.imagem} alt="Preview" className="mt-3 max-w-full h-48 object-cover rounded-lg shadow-md border" />
                <div className="mt-3">
                    <Image
                      src={form.imagem}
                      alt="Preview da imagem"
                      width={800}   // largura máxima boa pra preview (ajusta se quiser menor)
                      height={400}  // altura aproximada (Next.js mantém proporção)
                      className="max-w-full h-48 object-cover rounded-lg shadow-md border"
                    />
                  </div>
                )}
              </div>

              <div className="relative">
                <select name="genero" value={form.genero} onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins">
                  <option value="">Selecione o gênero</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="INFANTIL_MASCULINO">Infantil Masculino</option>
                  <option value="INFANTIL_FEMININO">Infantil Feminino</option>
                </select>
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Gênero <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <select name="modelo" value={form.modelo} onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins">
                  <option value="">Selecione o modelo</option>
                  <option value="Scarpin">Scarpin</option>
                  <option value="Anabela">Anabela</option>
                  <option value="Rasteirinha">Rasteirinha</option>
                  <option value="Bota">Bota</option>
                  <option value="Coturno">Coturno</option>
                  <option value="Mule">Mule</option>
                  <option value="Tamanco">Tamanco</option>
                  <option value="Sapatilha">Sapatilha</option>
                  <option value="Sandália">Sandália</option>
                  <option value="Chinelo">Chinelo</option>
                  <option value="Sapato">Sapato</option>
                  <option value="Sapatênis">Sapatênis</option>
                  <option value="Slide">Slide</option>
                  <option value="Tênis casual">Tênis casual</option>
                  <option value="Tênis esportivo">Tênis esportivo</option>
                  <option value="Botina">Botina</option>
                  <option value="Crocs">Crocs</option>
                  <option value="Papete">Papete</option>
                  <option value="Chuteira de campo">Chuteira de campo</option>
                  <option value="Chuteira society">Chuteira society</option>
                  <option value="Chuteira de futsal">Chuteira de futsal</option>
                </select>
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Modelo <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input name="marca" value={form.marca} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Marca <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="relative">
                <input name="lote" value={form.lote} placeholder=" " onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Lote
                </label>
              </div>

              <div className="relative md:col-span-2">
                <input name="dataRecebimento" type="date" value={form.dataRecebimento} max={format(new Date(), 'yyyy-MM-dd')} onChange={handleChange}
                  className="peer w-full px-4 py-3 pt-5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-poppins" />
                <label className="absolute left-4 -top-2 text-xs bg-gray-50 px-1 text-gray-500 peer-focus:text-green-500">
                  Data de Recebimento <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-inner border border-gray-200 text-sm">
                Status: <span className={`inline-block px-3 py-1 rounded-full font-semibold ${form.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {form.disponivel ? 'Disponível' : 'Esgotado'}
                </span>
              </div>

            </div>
          )}

          {/* BOTÕES FIXOS NO FINAL (DENTRO DO FORM) */}
          {!loading && (
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
              >
                Atualizar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-md text-sm md:text-base font-poppins"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
