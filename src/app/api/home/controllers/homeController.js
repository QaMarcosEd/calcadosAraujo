// // src/app/api/home/controllers/homeController.js
// import prisma from '@/app/lib/prisma'
// import { getAllProdutos } from '../../produtos/controller/produtosController';

// export async function getHomeData(
//   isEpocaPico = false,

// ) {
//   try {
//     // 1. TOTAIS DO ESTOQUE
//     const totais = await getAllProdutos({});
//     const totalPares = totais.totalProdutos || 0;
//     const valorTotal = totais.valorTotalRevenda || 0;

//     // 2. DADOS DO DASHBOARD
//     const estoquePorGenero = await getAllProdutos({ tipo: 'genero' });
//     const topModelos = await getAllProdutos({ tipo: 'modelo' });

//     // 3. LOTES HOJE → CONTAR LOTES ÚNICOS POR createdAt
//     const hoje = new Date();
//     const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
//     const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
//     fimDia.setMilliseconds(-1);

//     const lotesHojeData = await prisma.produto.groupBy({
//       by: ['lote'],
//       where: {
//         createdAt: {
//           gte: inicioDia,
//           lte: fimDia,
//         },
//         lote: { not: null },
//       },
//       _count: { lote: true },
//     });

//     const lotesHoje = lotesHojeData.length;

//     // 4. MODELOS ATIVOS
//     const modelosAtivos = topModelos.filter(m => (m.total || 0) > 0).length;

//     // 6. ALERTAS + LOW STOCK
//     const produtosResponse = await getAllProdutos({});
//     const produtos = produtosResponse.data || [];
//     const estoquePorCategoria = produtos.reduce((acc, p) => {
//       const modelo = p.modelo || 'Desconhecida';
//       const genero = p.genero || 'Desconhecido';
//       const tamanho = p.tamanho || 'Desconhecido';
//       const chave = modelo === 'Tamancos' ? 'Tamancos' : `${modelo}_${genero}`;
//       const chaveCompleta = `${chave}_${tamanho}`;

//       if (!acc[chaveCompleta]) {
//         acc[chaveCompleta] = { modelo, genero: modelo === 'Tamancos' ? null : genero, tamanho, total: 0 };
//       }
//       acc[chaveCompleta].total += p.quantidade || 0;
//       return acc;
//     }, {});

//     const alerts = [];
//     let lowStockCount = 0;
//     for (const [chave, info] of Object.entries(estoquePorCategoria)) {
//       // const chaveLimite = info.modelo === 'Tamancos' ? 'Tamancos' : `${info.modelo}_${info.genero}`;
//       const limite =  3;
//       if (info.total > 0 && info.total < limite) {
//         lowStockCount++;
//         const msg = info.modelo === 'Tamancos'
//           ? `${info.modelo} tamanho ${info.tamanho}: ${info.total} unid`
//           : `${info.modelo} ${info.genero} tam ${info.tamanho}: ${info.total} unid`;
//         alerts.push({ message: msg, urgente: msg.includes('Sandálias Infantil') });
//       }
//     }

//     let topSemana = [];

//     // 8. RETORNO FINAL
//     return {
//       totalPares,
//       valorTotal,
//       lowStockCount,
//       lotesHoje, // ← AGORA É 1 LOTE, NÃO 9 PRODUTOS!
//       modelosAtivos,
//       alerts,
//       topSemana,
//       estoquePorGenero: estoquePorGenero.map(g => ({ name: g.genero, value: g.total || 0 })),
//       topModelos: topModelos.map(m => ({ name: m.modelo, quantidade: m.total || 0 })),
//     };
//   } catch (error) {
//     console.error('Erro no getHomeData:', error);
//     throw new Error('Erro ao buscar dados da home: ' + error.message);
//   }
// }
// src/app/api/home/controllers/homeController.js
import prisma from '@/app/lib/prisma'
import { getAllProdutos } from '../../produtos/controller/produtosController' // mantém por enquanto

export async function getHomeData(isEpocaPico = false) {
  try {
    // 1. TOTAIS DO ESTOQUE (reutiliza getAllProdutos da lista geral)
    const totaisResponse = await getAllProdutos({})
    const totalPares = totaisResponse.paresTotais || 0
    const valorTotal = totaisResponse.valorEstoque || 0 // ajusta se o nome for diferente

    // 2. GRÁFICOS
    const estoquePorGeneroRaw = await getAllProdutos({ tipo: 'genero' })
    const topModelosRaw = await getAllProdutos({ tipo: 'modelo' })

    // Formata pra gráfico (assumindo que getAllProdutos retorna [{ name, value }] ou similar)
    const estoquePorGenero = estoquePorGeneroRaw.map(g => ({
      name: g.name || g.genero || 'Desconhecido',
      value: g.value || g.total || 0,
    }))

    const topModelos = topModelosRaw.map(m => ({
      name: m.name || m.modelo || 'Desconhecido',
      quantidade: m.value || m.total || 0,
    }))

    // 3. LOTES RECEBIDOS HOJE
    const hoje = new Date()
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
    fimDia.setMilliseconds(-1)

    const lotesHojeData = await prisma.Produto.groupBy({
      by: ['lote'],
      where: {
        createdAt: { gte: inicioDia, lte: fimDia },
        lote: { not: null },
      },
      _count: { lote: true },
    })

    const lotesHoje = lotesHojeData.length

    // 4. MODELOS ATIVOS
    const modelosAtivos = topModelos.filter(m => m.quantidade > 0).length

    // 5. ALERTAS E LOW STOCK
    const produtosResponse = await getAllProdutos({})
    const produtos = produtosResponse.data || []

    const estoquePorCategoria = produtos.reduce((acc, p) => {
      const modelo = p.modelo || 'Desconhecida'
      const genero = p.genero || 'Desconhecido'
      const tamanho = p.tamanho || 'Desconhecido'

      const chave = modelo === 'Tamancos' ? 'Tamancos' : `${modelo}_${genero}`
      const chaveCompleta = `${chave}_${tamanho}`

      if (!acc[chaveCompleta]) {
        acc[chaveCompleta] = { modelo, genero: modelo === 'Tamancos' ? null : genero, tamanho, total: 0 }
      }
      acc[chaveCompleta].total += p.quantidade || 0
      return acc
    }, {})

    const alerts = []
    let lowStockCount = 0
    const limite = 3

    for (const [chave, info] of Object.entries(estoquePorCategoria)) {
      if (info.total > 0 && info.total < limite) {
        lowStockCount++
        const msg = info.modelo === 'Tamancos'
          ? `${info.modelo} tamanho ${info.tamanho}: ${info.total} unid`
          : `${info.modelo} ${info.genero} tam ${info.tamanho}: ${info.total} unid`
        alerts.push({ message: msg, urgente: msg.includes('Sandálias Infantil') })
      }
    }

    // 6. TOP SEMANA (por enquanto vazio – a gente adiciona depois se quiser)
    const topSemana = []

    return {
      totalPares,
      valorTotal: Number(valorTotal.toFixed(2)),
      lowStockCount,
      lotesHoje,
      modelosAtivos,
      alerts,
      topSemana,
      estoquePorGenero,
      topModelos,
    }
  } catch (error) {
    console.error('Erro no getHomeData:', error)
    throw new Error('Erro ao buscar dados da home: ' + error.message)
  }
}
