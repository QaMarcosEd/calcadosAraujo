// app/api/produtos/busca-lote/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lote = searchParams.get('lote');

  if (!lote || lote.trim() === '') {
    return NextResponse.json({ error: 'Código do lote obrigatório' }, { status: 400 });
  }

  try {
    const produtos = await prisma.produto.findMany({
      where: { lote: lote.trim() },
      select: {
        id: true,
        nome: true,
        tamanho: true,
        precoVenda: true,
        precoCusto: true,
        emPromocao: true,
        precoPromocao: true,
        quantidade: true,
      },
      orderBy: { tamanho: 'asc' },
    });

    if (produtos.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto encontrado com esse lote' }, { status: 404 });
    }

    // Pega valores comuns (assumindo que são iguais no lote)
    const valoresAtuais = {
      precoVenda: produtos[0].precoVenda,
      precoCusto: produtos[0].precoCusto,
      emPromocao: produtos[0].emPromocao,
      precoPromocao: produtos[0].precoPromocao,
    };

    return NextResponse.json({
      quantidade: produtos.length,
      produtos,
      valoresAtuais,
    });
  } catch (error) {
    console.error('Erro ao buscar lote:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}