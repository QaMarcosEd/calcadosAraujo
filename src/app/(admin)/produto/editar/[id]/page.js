// /produto/editar/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function Editar() {
  const [form, setForm] = useState({
    nome: '',
    tamanho: '',
    referencia: '',
    cor: '',
    quantidade: '',
    precoVenda: '',
    genero: '',
    modelo: '',
    marca: '',
    disponivel: true,
    dataRecebimento: '',
    lote: '', // Adiciona lote,
    imagem: '' // Adicionado
  });
  const router = useRouter();
  const { id } = useParams();

useEffect(() => {
  if (id) {
    fetch(`/api/produtos/${id}`)
      .then(res => res.json())
      .then(produto => {
        if (!produto || produto.error) {
          console.error('Produto não encontrado para o ID:', id)
          return
        }
        // aqui atualiza o form inteiro de uma vez
        setForm({
          nome: produto.nome || '',
          tamanho: produto.tamanho || '',
          referencia: produto.referencia || '',
          cor: produto.cor || '',
          quantidade: produto.quantidade || '',
          precoVenda: produto.precoVenda || '',
          genero: produto.genero || '',
          modelo: produto.modelo || '',
          marca: produto.marca || '',
          disponivel: produto.quantidade > 0,
          dataRecebimento: produto.dataRecebimento ? format(new Date(produto.dataRecebimento), 'yyyy-MM-dd') : '',
          lote: produto.lote || '', // Adiciona lote
          imagem: produto.imagem || ''
        })
      })
      .catch(err => console.error('Erro ao carregar produto:', err))
  }
}, [id])


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.nome || !form.tamanho || !form.referencia || !form.cor || !form.quantidade || !form.precoVenda || !form.genero || !form.modelo || !form.marca || !form.dataRecebimento) {
    console.error('Erro: Todos os campos são obrigatórios. Dados atuais:', form);
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  if (new Date(form.dataRecebimento).toString() === 'Invalid Date' || !form.dataRecebimento) {
    console.error('Erro: Data de Recebimento inválida ou não preenchida');
    alert('Por favor, preencha uma Data de Recebimento válida!');
    return;
  }
  if (new Date(form.dataRecebimento) > new Date()) {
    console.error('Erro: Data de Recebimento não pode ser futura');
    alert('Data de Recebimento não pode ser futura!');
    return;
  }

  const data = {
    id: parseInt(id),
    nome: form.nome,
    tamanho: parseInt(form.tamanho),
    referencia: form.referencia,
    cor: form.cor,
    quantidade: parseInt(form.quantidade),
    precoVenda: parseFloat(form.precoVenda),
    genero: form.genero,
    modelo: form.modelo,
    marca: form.marca,
    disponivel: parseInt(form.quantidade) > 0,
    dataRecebimento: new Date(form.dataRecebimento),
    lote: form.lote // Adiciona lote
  };
  console.log('Antes do fetch, dados:', data); // Log antes do fetch
  const response = await fetch('/api/produtos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Erro na requisição:', {
      status: response.status,
      statusText: response.statusText,
      errorData: errorData,
    });
    return;
  }
  router.push('/');
};

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Editar Produto</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-5">
          <input
            name="nome"
            value={form.nome}
            placeholder="Nome"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="tamanho"
            type="number"
            value={form.tamanho}
            placeholder="Tamanho"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="referencia"
            type="text"
            value={form.referencia}
            placeholder="Referência (ex: NK-123)"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="cor"
            value={form.cor}
            placeholder="Cor"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="quantidade"
            type="number"
            value={form.quantidade}
            placeholder="Quantidade"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="precoVenda"
            type="number"
            step="0.01"
            value={form.precoVenda}
            placeholder="Preço"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="imagem"
            type="text"
            value={form.imagem}
            placeholder="URL da imagem (ex: http://localhost:3000/images/tenis.jpg)"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <select
            name="genero"
            value={form.genero}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 text-base placeholder-gray-500"
          >
            <option value="">Selecione o gênero</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMININO">Feminino</option>
            <option value="INFANTIL_MASCULINO">Infantil Masculino</option>
            <option value="INFANTIL_FEMININO">Infantil Feminino</option>
          </select>
          <select
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-800 text-base placeholder-gray-500"
          >
            <option value="">Selecione o modelo</option>
            <option value="TENIS">Tênis</option>
            <option value="SAPATENIS">Sapatênis</option>
            <option value="SANDALIA">Sandália</option>
            <option value="RASTEIRA">Rasteira</option>
            <option value="TAMANCO">Tamanco</option>
            <option value="SCARPIN">Scarpin</option>
            <option value="BOTA">Bota</option>
            <option value="CHINELO">Chinelo</option>
            <option value="MOCASSIM">Mocassim</option>
            <option value="OXFORD">Oxford</option>
            <option value="PEEPTOE">Peep Toe</option>
            <option value="SLINGBACK">Slingback</option>
          </select>
          <input
            name="marca"
            value={form.marca}
            placeholder="Marca"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="lote"
            value={form.lote}
            placeholder="Lote"
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <input
            name="dataRecebimento"
            type="date"
            value={form.dataRecebimento}
            placeholder="Data de Recebimento"
            onChange={handleChange}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 placeholder-gray-500 text-gray-800 text-base"
          />
          <p className="text-sm text-gray-600">Status: {form.disponivel ? 'Disponível' : 'Esgotado'}</p>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-3 rounded-lg w-full font-medium hover:bg-green-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
          >
            Atualizar
          </button>

           <button
            type="button"
            onClick={() => router.push("/")}
            className="bg-red-600 text-white px-4 py-3 rounded-lg w-full font-medium hover:bg-red-500 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

