// // src/app/api/baixas/route.js
// import prisma from '@/app/lib/prisma'
// import { NextResponse } from 'next/server';

// const ITEMS_PER_PAGE = 20;

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const page = parseInt(searchParams.get('page') || '1');
//   const marca = searchParams.get('marca');
//   const tamanho = searchParams.get('tamanho');
//   const referencia = searchParams.get('referencia');
//   const dataInicio = searchParams.get('dataInicio');
//   const dataFim = searchParams.get('dataFim');

//   try {
//     const where = {
//       ...(marca && { produto: { marca: { contains: marca, mode: 'insensitive' } } }),
//       ...(tamanho && { produto: { tamanho: parseInt(tamanho) } }),
//       ...(referencia && { produto: { referencia: { contains: referencia, mode: 'insensitive' } } }),
//       ...(dataInicio && { dataBaixa: { gte: new Date(dataInicio) } }),
//       ...(dataFim && { dataBaixa: { lte: new Date(new Date(dataFim).setHours(23, 59, 59)) } }),
//     };

//     const [baixas, total, agregados] = await prisma.$transaction([
//       prisma.baixa.findMany({
//         where,
//         include: { produto: true },
//         orderBy: { dataBaixa: 'desc' },
//         skip: (page - 1) * ITEMS_PER_PAGE,
//         take: ITEMS_PER_PAGE,
//       }),
//       prisma.baixa.count({ where }),
//       prisma.baixa.aggregate({
//         where,
//         _sum: { quantidade: true, valorTotal: true },
//       }),
//     ]);

//     return NextResponse.json({
//       data: baixas.map(b => ({
//         ...b,
//         custoTotal: (b.produto.precoCusto || 0) * b.quantidade,  // custo baseado no precoCusto do produto
//         lucro: b.valorTotal - ((b.produto.precoCusto || 0) * b.quantidade),
//       })),
//       totalPages: Math.ceil(total / ITEMS_PER_PAGE),
//       totalVendido: agregados._sum.valorTotal || 0,
//       totalPares: agregados._sum.quantidade || 0,
//     });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { produtoId, quantidade, valorTotal } = body;

//     if (!produtoId || !quantidade || valorTotal == null) {
//       return NextResponse.json(
//         { error: 'produtoId, quantidade e valorTotal são obrigatórios' },
//         { status: 400 }
//       );
//     }

//     if (quantidade <= 0) {
//       return NextResponse.json(
//         { error: 'Quantidade deve ser maior que 0' },
//         { status: 400 }
//       );
//     }

//     const produto = await prisma.produto.findUnique({
//       where: { id: Number(produtoId) },
//     });

//     if (!produto) {
//       return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
//     }

//     if (produto.quantidade < quantidade) {
//       return NextResponse.json({ error: 'Estoque insuficiente' }, { status: 400 });
//     }

//     // Atualiza estoque e salva a baixa
//     await prisma.$transaction([
//       prisma.produto.update({
//         where: { id: Number(produtoId) },
//         data: {
//           quantidade: { decrement: quantidade },
//         },
//       }),
//       prisma.baixa.create({
//         data: {
//           produtoId: Number(produtoId),
//           quantidade,
//           valorTotal,
//         },
//       }),
//     ]);

//     return NextResponse.json({ message: 'Baixa registrada com sucesso!' });
//   } catch (error) {
//     console.error('Erro ao dar baixa:', error);
//     return NextResponse.json(
//       { error: 'Erro ao processar a baixa' },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/baixas/route.js
import prisma from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

const ITEMS_PER_PAGE = 20

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const marca = searchParams.get('marca')
  const tamanho = searchParams.get('tamanho')
  const referencia = searchParams.get('referencia')
  const dataInicio = searchParams.get('dataInicio')
  const dataFim = searchParams.get('dataFim')

  try {
    const where = {
      ...(marca && { produto: { marca: { contains: marca, mode: 'insensitive' } } }),
      ...(tamanho && { produto: { tamanho: parseInt(tamanho) } }),
      ...(referencia && { produto: { referencia: { contains: referencia, mode: 'insensitive' } } }),
      ...(dataInicio && { dataBaixa: { gte: new Date(dataInicio) } }),
      ...(dataFim && {
        dataBaixa: { lte: new Date(new Date(dataFim).setHours(23, 59, 59, 999)) },
      }),
    }

    const [baixas, total, agregados] = await prisma.$transaction([
      prisma.Baixa.findMany({
        where,
        include: { produto: true },
        orderBy: { dataBaixa: 'desc' },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.Baixa.count({ where }),
      prisma.Baixa.aggregate({
        where,
        _sum: { quantidade: true, valorTotal: true },
      }),
    ])

    const dataFormatada = baixas.map((b) => ({
      ...b,
      custoTotal: (b.produto.precoCusto || 0) * b.quantidade,
      lucro: b.valorTotal - (b.produto.precoCusto || 0) * b.quantidade,
    }))

    return NextResponse.json({
      data: dataFormatada,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      totalVendido: agregados._sum.valorTotal || 0,
      totalPares: agregados._sum.quantidade || 0,
    })
  } catch (error) {
    console.error('Erro ao buscar histórico de baixas:', error)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { produtoId, quantidade, valorTotal } = body

    if (!produtoId || !quantidade || valorTotal == null) {
      return NextResponse.json(
        { error: 'produtoId, quantidade e valorTotal são obrigatórios' },
        { status: 400 }
      )
    }

    const qtd = Number(quantidade)
    const prodId = Number(produtoId)

    if (qtd <= 0) {
      return NextResponse.json({ error: 'Quantidade deve ser maior que 0' }, { status: 400 })
    }

    const produto = await prisma.Produto.findUnique({
      where: { id: prodId },
    })

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    if (produto.quantidade < qtd) {
      return NextResponse.json({ error: 'Estoque insuficiente' }, { status: 400 })
    }

    const [updatedProduto, novaBaixa] = await prisma.$transaction([
      prisma.Produto.update({
        where: { id: prodId },
        data: { quantidade: { decrement: qtd } },
      }),
      prisma.Baixa.create({
        data: {
          produtoId: prodId,
          quantidade: qtd,
          valorTotal,
        },
      }),
    ])

    return NextResponse.json({
      message: 'Baixa registrada com sucesso!',
      estoqueRestante: updatedProduto.quantidade,
      baixa: novaBaixa,
    })
  } catch (error) {
    console.error('Erro ao dar baixa:', error)
    return NextResponse.json({ error: 'Erro ao processar a baixa' }, { status: 500 })
  }
}