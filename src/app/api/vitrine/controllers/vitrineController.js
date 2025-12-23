// // api/vitrine/controllers/vitrineController.js
// import { prisma } from "../../../lib/prisma";

// export async function getVitrineProdutos({ page = 1, limit = 12, genero = null, minPreco = null, maxPreco = null }) {
//   try {
//     const skip = (page - 1) * limit;

//     // 1. AGRUPAR PRODUTOS ÚNICOS por referência + cor
//     const produtosUnicos = await prisma.produto.groupBy({
//       by: ['nome', 'modelo', 'marca', 'cor', 'referencia', 'precoVenda', 'imagem'],
//       where: {
//         disponivel: true,
//         quantidade: { gt: 0 },
//         ...(genero && { genero }),
//         precoVenda: {
//           ...(minPreco && { gte: minPreco }),
//           ...(maxPreco && { lte: maxPreco }),
//         },
//       },
//       _sum: { quantidade: true },
//       _min: { precoPromocao: true },   // NOVO: pega o menor preço promo (se tiver)
//       _max: { emPromocao: true },      // NOVO: verifica se algum está em promoção
//       orderBy: { nome: 'asc' },
//       take: limit,
//       skip,
//     });

//     // 2. COLETAR TAMANHOS DISPONÍVEIS pra cada produto único
//     const produtosComTamanhos = await Promise.all(
//       produtosUnicos.map(async (produto) => {
//         const tamanhos = await prisma.produto.findMany({
//           where: {
//             referencia: produto.referencia,
//             cor: produto.cor,
//             disponivel: true,
//             quantidade: { gt: 0 },
//           },
//           select: { tamanho: true, quantidade: true },
//           orderBy: { tamanho: 'asc' },
//         });

//         return {
//           id: `${produto.referencia}-${produto.cor.replace(/\s/g, '')}`,
//           nome: produto.nome,
//           modelo: produto.modelo,
//           marca: produto.marca,
//           cor: produto.cor,
//           precoVenda: produto.precoVenda,
//           precoPromocao: produto._min.precoPromocao,     // NOVO
//           emPromocao: produto._max.emPromocao || false, // NOVO: true se algum do grupo tiver
//           imagem: produto.imagem,
//           tamanhosDisponiveis: tamanhos.map((t) => t.tamanho),
//           estoqueTotal: tamanhos.reduce((acc, t) => acc + t.quantidade, 0),
//           tamanhosDetalhados: tamanhos,
//         };
//       })
//     );

//     // 3. TOTAL pra paginação
//     const total = await prisma.produto.count({
//       where: {
//         disponivel: true,
//         quantidade: { gt: 0 },
//       },
//     });

//     return {
//       data: produtosComTamanhos,
//       totalPages: Math.ceil(total / limit),
//       totalProdutos: total,
//     };
//   } catch (error) {
//     throw new Error('Erro ao buscar produtos para vitrine: ' + error.message);
//   }
// }

// export async function getProdutoDetalhe(produtoId) {
//   // Implementar no Passo 3
//   return null;
// }
// src/app/api/vitrine/controllers/vitrineController.js
import prisma from '@/app/lib/prisma'

export async function getVitrineProdutos({
  page = 1,
  limit = 12,
  genero = null,
  minPreco = null,
  maxPreco = null,
}) {
  try {
    page = Math.max(1, parseInt(page, 10) || 1)
    limit = Math.max(1, Math.min(50, parseInt(limit, 10) || 12)) // limite de segurança

    const skip = (page - 1) * limit

    const where = {
      disponivel: true,
      quantidade: { gt: 0 },
      ...(genero && { genero }),
      precoVenda: {
        ...(minPreco && { gte: parseFloat(minPreco) }),
        ...(maxPreco && { lte: parseFloat(maxPreco) }),
      },
    }

    // 1. Busca todos os produtos filtrados (com os campos necessários)
    const produtos = await prisma.Produto.findMany({
      where,
      select: {
        nome: true,
        modelo: true,
        marca: true,
        cor: true,
        referencia: true,
        precoVenda: true,
        precoPromocao: true,
        emPromocao: true,
        imagem: true,
        tamanho: true,
        quantidade: true,
      },
      orderBy: { nome: 'asc' },
    })

    // 2. Agrupa manualmente por referência + cor (único visual)
    const grupos = new Map()

    for (const p of produtos) {
      const chave = `${p.referencia}-${p.cor.trim().replace(/\s+/g, '-')}`

      if (!grupos.has(chave)) {
        grupos.set(chave, {
          id: chave,
          nome: p.nome,
          modelo: p.modelo,
          marca: p.marca,
          cor: p.cor,
          referencia: p.referencia,
          precoVenda: p.precoVenda,
          imagem: p.imagem,
          tamanhosDisponiveis: [],
          tamanhosDetalhados: [],
          estoqueTotal: 0,
          emPromocao: false,
          precoPromocao: null,
        })
      }

      const grupo = grupos.get(chave)

      // Adiciona tamanho se tiver estoque
      if (p.quantidade > 0) {
        grupo.tamanhosDisponiveis.push(p.tamanho)
        grupo.tamanhosDetalhados.push({ tamanho: p.tamanho, quantidade: p.quantidade })
        grupo.estoqueTotal += p.quantidade
      }

      // Atualiza promoção se algum do grupo tiver
      if (p.emPromocao && p.precoPromocao) {
        grupo.emPromocao = true
        // Pega o menor preço promocional do grupo
        if (!grupo.precoPromocao || p.precoPromocao < grupo.precoPromocao) {
          grupo.precoPromocao = p.precoPromocao
        }
      }
    }

    // Converte Map pra array e ordena
    let produtosUnicos = Array.from(grupos.values())

    // Ordenação consistente
    produtosUnicos.sort((a, b) => a.nome.localeCompare(b.nome))

    // Paginação manual (agora correta)
    const totalProdutosUnicos = produtosUnicos.length
    const paginados = produtosUnicos.slice(skip, skip + limit)

    return {
      data: paginados,
      totalPages: Math.ceil(totalProdutosUnicos / limit),
      currentPage: page,
      totalProdutos: totalProdutosUnicos,
    }
  } catch (error) {
    console.error('Erro ao buscar produtos para vitrine:', error)
    throw new Error('Erro ao carregar vitrine: ' + error.message)
  }
}

// Placeholder pra quando implementar detalhe
export async function getProdutoDetalhe(produtoId) {
  // TODO: buscar todos os tamanhos de uma referência + cor
  return null
}