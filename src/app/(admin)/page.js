// src/app/(admin)/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Package, AlertTriangle, DollarSign, TrendingUp, ChevronRight,
  Box, ShoppingBag
} from 'lucide-react';
import PageHeader from '@/components/layout/Header';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

const formatCurrency = (value) => `R$ ${(parseFloat(value) || 0).toFixed(2).replace('.', ',')}`;

const COLORS = ['#394189', '#c33638', '#F59E0B', '#10B981', '#8B5CF6'];

export default function Home() {
  const router = useRouter();
  const [epoca, setEpoca] = useState('normal');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalPares: 0,
    valorTotal: 0,
    lowStockCount: 0,
    lotesHoje: 0,
    modelosAtivos: 0,
    alerts: [],
    topSemana: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = new URL('/api/home', window.location.origin);
        url.searchParams.set('semana', 'true');  // muda de 'hoje' pra 'semana'
        url.searchParams.set('limit', '3');
        if (epoca === 'pico') url.searchParams.set('epoca', 'pico');

        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao carregar dados');
        const result = await res.json();
        setData(result);
      } catch (err) {
        toast.error('Erro ao carregar visão geral');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [epoca]);

  const handleVerDetalhes = (alert) => {
    const modelo = alert.message.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '-');
    router.push(`/dashboard?alerta=${modelo}`);
  };

  if (loading) return <LoadingSkeleton type="home" />;

  const cards = [
    { icon: Package, label: 'Pares Totais', value: data.totalPares.toLocaleString('pt-BR'), color: '#394189' },
    { icon: DollarSign, label: 'Valor Estoque', value: formatCurrency(data.valorTotal), color: '#c33638' },
    { icon: AlertTriangle, label: 'Baixo Estoque', value: data.lowStockCount, color: '#F59E0B' },
    { icon: Box, label: 'Lotes Hoje', value: data.lotesHoje, color: '#10B981' },
    { icon: TrendingUp, label: 'Modelos Ativos', value: data.modelosAtivos, color: '#8B5CF6' },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Home" greeting="Visão Geral Rápida" />

      {/* Cards com Hover + Barra Colorida */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-24 flex items-center justify-between"
          >
            {/* Barra lateral colorida */}
            <div
              className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl"
              style={{ backgroundColor: card.color }}
            />

            {/* Ícone */}
            <div className="relative flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100 ml-1.5">
              <card.icon className="w-6 h-6" style={{ color: card.color }} />
            </div>

            {/* Texto */}
            <div className="flex-1 ml-3 pr-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className="text-xl font-bold text-gray-900 truncate">
                {card.value}
              </p>
            </div>

            {/* Ícone de crescimento no hover */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <TrendingUp className="w-4 h-4" style={{ color: card.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Alertas Urgentes */}
      {data.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Ações Urgentes
          </h3>
          <ul className="space-y-3">
            {data.alerts.map((a, i) => (
              <li
                key={i}
                className="text-sm bg-white p-4 rounded-lg shadow-sm border border-red-100 flex items-center justify-between hover:shadow transition-shadow"
              >
                <span className={`font-medium text-red-700 ${a.urgente ? 'font-bold' : ''}`}>
                  {a.urgente && 'Prioridade '}
                  {a.message}
                </span>
                <button
                  onClick={() => handleVerDetalhes(a)}
                  className="text-sm font-medium text-[#394189] hover:text-[#c33638] flex items-center gap-1 transition-colors"
                >
                  Ver <ChevronRight className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top 3 da Semana */}
      {/* <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-[#394189] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Top 3 da Semana
          </h3>
          <button
            onClick={() => router.push('/dashboard?vendas=semana')}
            className="text-sm font-medium text-[#394189] hover:text-[#c33638] hover:underline"
          >
            Ver tudo →
          </button>
        </div>

        {data.topSemana.length > 0 ? (
          <ol className="space-y-4">
            {data.topSemana.map((item, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#394189] to-[#c33638] text-white font-bold text-sm shadow-md">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-gray-800">{item.modelo}</span>
                </div>
                <span className="font-bold text-xl text-[#c33638]">{item.qtd} unid</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center text-gray-500 py-6">Nenhuma venda na semana.</p>
        )}
      </div> */}
    </div>
  );
}