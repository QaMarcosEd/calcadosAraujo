// src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Package, AlertTriangle, DollarSign, Box, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/layout/Header';
import toast from 'react-hot-toast';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [epoca, setEpoca] = useState('normal');
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => `R$ ${(parseFloat(value) || 0).toFixed(2).replace('.', ',')}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?epoca=${epoca}`);
        if (!res.ok) throw new Error('Erro ao carregar');
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error('Erro ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [epoca]);

  if (loading) return <LoadingSkeleton type="dashboard" />;
  if (!data) return <div>Erro ao carregar</div>;

  const COLORS = ['#394189', '#c33638', '#10B981', '#F59E0B'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader title="Dashboard" greeting="Visão Geral - Calçados Araújo" />

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {[
          { icon: Package, label: 'Pares Totais', value: data.totalPares.toLocaleString('pt-BR'), color: '#394189' },
          { icon: DollarSign, label: 'Valor Estoque', value: formatCurrency(data.valorTotal), color: '#c33638' },
          { icon: AlertTriangle, label: 'Baixo Estoque', value: data.lowStockCount, color: '#F59E0B' },
          { icon: Box, label: 'Lotes Hoje', value: data.lotesHoje, color: '#10B981' },
          { icon: TrendingUp, label: 'Modelos Ativos', value: data.modelosAtivos, color: '#8B5CF6' },
        ].map((card, i) => (
          <div key={i} className="group relative bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-20 flex items-center justify-between">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl" style={{ backgroundColor: card.color }}></div>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-sm border border-gray-100">
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-lg font-bold text-gray-900 truncate">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#394189] mb-4">Estoque por Gênero</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.estoquePorGenero}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // só %
                >
                  {data.estoquePorGenero.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" layout="vertical" align="right" />
              </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-[#394189] mb-4">Top 5 Modelos em Estoque</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topModelos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#394189" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}






