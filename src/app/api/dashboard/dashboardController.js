// src/app/api/dashboard/controller/dashboardController.js
import prisma from '@/app/lib/prisma'

const normalizar = (str) => {
  if (!str) return 'sem-modelo';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

export async function getDashboardData(epoca = 'normal') {
  try {
    // 1. ESTOQUE TOTAL
    const produtos = await prisma.produto.findMany({
      select: { quantidade: true, precoVenda: true, precoCusto: true },
    });

    const totalPares = produtos.reduce((acc, p) => acc + p.quantidade, 0);
    const valorTotal = produtos.reduce((acc, p) => acc + (p.precoVenda * p.quantidade), 0);
    const custoTotal = produtos.reduce((acc, p) => acc + ((p.precoCusto || 0) * p.quantidade), 0);
    const lucroProjetado = valorTotal - custoTotal;
    const margemLucro = valorTotal > 0 ? ((lucroProjetado / valorTotal) * 100).toFixed(1) + '%' : '0%';

    // 4. DADOS DA HOME
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
    fimDia.setMilliseconds(-1);

    // DEPOIS (CORRETO):
    const lotesHoje = await prisma.produto.groupBy({
    by: ['lote'],
    where: {
        createdAt: { gte: inicioDia, lte: fimDia },
        lote: { not: null },
    },
    _count: { lote: true },
    });

    const totalLotesHoje = lotesHoje.length;

    const lowStockCount = produtos.filter(p => p.quantidade <= 5).length;
    const modelosAtivos = new Set(produtos.map(p => p.modelo)).size;

    const estoquePorGenero = await prisma.produto.groupBy({
      by: ['genero'],
      _sum: { quantidade: true },
      where: { genero: { not: null } },
    });

    const topModelos = await prisma.produto.groupBy({
      by: ['modelo'],
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 5,
    });

    return {
      totalPares,
      valorTotal,
      custoTotal,
      lucroProjetado,
      margemLucro,
      // resumoVendas,
      // rankingVendidos,
      lowStockCount,
      lotesHoje: totalLotesHoje,
      modelosAtivos,
      estoquePorGenero: estoquePorGenero.map(g => ({
        name: g.genero,
        value: g._sum.quantidade,
      })),
      topModelos: topModelos.map(m => ({
        name: m.modelo,
        quantidade: m._sum.quantidade,
      })),
      alerts: [],
    };
  } catch (error) {
    console.error('Erro no getDashboardData:', error);
    throw error;
  }
}