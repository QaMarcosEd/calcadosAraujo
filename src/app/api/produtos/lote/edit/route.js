// app/api/produtos/lote/edit/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma'

// Função pra exigir admin
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Não autenticado');
  if (session.user.role !== 'ADMIN') throw new Error('Acesso negado. Apenas administradores.');
  return session.user;
}

export async function POST(request) {
  try {
    await requireAdmin(); // Só admin pode editar lote

    const body = await request.json();
    const { lote, precoVenda, precoCusto, emPromocao, precoPromocao } = body;

    if (!lote || lote.trim() === '') {
      return NextResponse.json({ error: 'Código do lote é obrigatório' }, { status: 400 });
    }

    // Validações dos preços
    let dataToUpdate = {};

    if (precoVenda !== undefined) {
      const pv = parseFloat(precoVenda);
      if (isNaN(pv) || pv <= 0) {
        return NextResponse.json({ error: 'Preço de venda inválido' }, { status: 400 });
      }
      dataToUpdate.precoVenda = pv;
    }

    if (precoCusto !== undefined) {
      const pc = parseFloat(precoCusto);
      if (isNaN(pc) || pc < 0) {
        return NextResponse.json({ error: 'Preço de custo inválido' }, { status: 400 });
      }
      dataToUpdate.precoCusto = pc;
    }

    // Tratamento da promoção
    if (emPromocao !== undefined) {
      dataToUpdate.emPromocao = emPromocao === true;

      if (emPromocao === true) {
        if (!precoPromocao) {
          return NextResponse.json({ error: 'Preço promocional é obrigatório quando ativa promoção' }, { status: 400 });
        }
        const pp = parseFloat(precoPromocao);
        if (isNaN(pp) || pp <= 0) {
          return NextResponse.json({ error: 'Preço promocional inválido' }, { status: 400 });
        }
        if (precoVenda !== undefined && pp >= precoVenda) {
          return NextResponse.json({ error: 'Preço promocional deve ser menor que o preço de venda' }, { status: 400 });
        }
        dataToUpdate.precoPromocao = pp;
      } else {
        // Se desativar promoção, limpa o preço promocional
        dataToUpdate.precoPromocao = null;
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar' }, { status: 400 });
    }

    // Atualiza TODOS os produtos do lote
    const updateResult = await prisma.produto.updateMany({
      where: { lote: lote.trim() },
      data: dataToUpdate,
    });

    if (updateResult.count === 0) {
      return NextResponse.json({ error: 'Nenhum produto encontrado com esse lote' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Lote atualizado com sucesso! ${updateResult.count} produtos alterados.`,
      atualizados: updateResult.count,
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao editar lote:', error);
    const status = error.message.includes('Acesso negado') || error.message.includes('autenticado') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Erro interno ao editar lote' }, { status });
  }
}