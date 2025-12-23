// api/vitrine/controllers/vitrineController.js
import { prisma } from "../../../lib/prisma";

export async function getVitrineProdutos({ page = 1, limit = 12, genero = null, minPreco = null, maxPreco = null }) {
  try {
    const skip = (page - 1) * limit;

    // 1. AGRUPAR PRODUTOS ÚNICOS por referência + cor
    const produtosUnicos = await prisma.produto.groupBy({
      by: ['nome', 'modelo', 'marca', 'cor', 'referencia', 'precoVenda', 'imagem'],
      where: {
        disponivel: true,
        quantidade: { gt: 0 },
        ...(genero && { genero }),
        precoVenda: {
          ...(minPreco && { gte: minPreco }),
          ...(maxPreco && { lte: maxPreco }),
        },
      },
      _sum: { quantidade: true },
      _min: { precoPromocao: true },   // NOVO: pega o menor preço promo (se tiver)
      _max: { emPromocao: true },      // NOVO: verifica se algum está em promoção
      orderBy: { nome: 'asc' },
      take: limit,
      skip,
    });

    // 2. COLETAR TAMANHOS DISPONÍVEIS pra cada produto único
    const produtosComTamanhos = await Promise.all(
      produtosUnicos.map(async (produto) => {
        const tamanhos = await prisma.produto.findMany({
          where: {
            referencia: produto.referencia,
            cor: produto.cor,
            disponivel: true,
            quantidade: { gt: 0 },
          },
          select: { tamanho: true, quantidade: true },
          orderBy: { tamanho: 'asc' },
        });

        return {
          id: `${produto.referencia}-${produto.cor.replace(/\s/g, '')}`,
          nome: produto.nome,
          modelo: produto.modelo,
          marca: produto.marca,
          cor: produto.cor,
          precoVenda: produto.precoVenda,
          precoPromocao: produto._min.precoPromocao,     // NOVO
          emPromocao: produto._max.emPromocao || false, // NOVO: true se algum do grupo tiver
          imagem: produto.imagem,
          tamanhosDisponiveis: tamanhos.map((t) => t.tamanho),
          estoqueTotal: tamanhos.reduce((acc, t) => acc + t.quantidade, 0),
          tamanhosDetalhados: tamanhos,
        };
      })
    );

    // 3. TOTAL pra paginação
    const total = await prisma.produto.count({
      where: {
        disponivel: true,
        quantidade: { gt: 0 },
      },
    });

    return {
      data: produtosComTamanhos,
      totalPages: Math.ceil(total / limit),
      totalProdutos: total,
    };
  } catch (error) {
    throw new Error('Erro ao buscar produtos para vitrine: ' + error.message);
  }
}

export async function getProdutoDetalhe(produtoId) {
  // Implementar no Passo 3
  return null;
}