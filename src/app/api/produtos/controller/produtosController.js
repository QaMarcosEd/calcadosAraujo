// app/api/produtos/controller/produtosController.js
import prisma from '@/app/lib/prisma'

export async function getAllProdutos({ marca, modelo, genero, tamanho, referencia, tipo, page = 1, limit = 10 }) {
  try {
    const where = {};

    // 1. MARCA - Case insensitive
    if (marca && marca.trim()) {
      const marcaLower = marca.trim().toLowerCase();
      where.marca = { contains: marcaLower };
      console.log('Filtro MARCA:', marcaLower);
    }

    // 2. REFERÊNCIA - Case insensitive
    if (referencia && referencia.trim()) {
      const refLower = referencia.trim().toLowerCase();
      where.referencia = { contains: refLower };
      console.log('Filtro REFERÊNCIA:', refLower);
    }

    // 3. TAMANHO
    if (tamanho) {
      const numTamanho = parseInt(tamanho);
      if (!isNaN(numTamanho)) {
        where.tamanho = { equals: numTamanho };
        console.log('Filtro TAMANHO:', numTamanho);
      }
    }

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    // === CORREÇÃO: groupBy SEGURO ===
    if (tipo && ['genero', 'modelo', 'marca'].includes(tipo)) {
      try {
        const hasWhere = Object.keys(where).length > 0;
        const result = await prisma.produto.groupBy({
          by: [tipo],
          _sum: { quantidade: true },
          where: hasWhere ? where : undefined, // ← NUNCA {} VAZIO
        });

        return result.map((item) => ({
          [tipo]: item[tipo] || 'Desconhecido',
          total: item._sum.quantidade || 0,
        }));
      } catch (error) {
        console.error('Erro no groupBy de produtos:', error.message);
        return []; // Retorna vazio em caso de erro
      }
    }

    // === RESTO DA FUNÇÃO (SEM MUDANÇAS) ===
    const todosFiltrados = await prisma.produto.findMany({
      where,
      select: { id: true, marca: true, referencia: true, tamanho: true }
    });
    console.log('TODOS FILTRADOS:', todosFiltrados.length, 'produtos');
    console.log('Exemplos:', todosFiltrados.slice(0, 3));

    const [totalCount, totalAggregate, produtosParaCalc, produtos] = await Promise.all([
      prisma.produto.count({ where }),
      prisma.produto.aggregate({ where, _sum: { quantidade: true } }),
      prisma.produto.findMany({
        where,
        select: { precoVenda: true, quantidade: true, precoCusto: true },
      }),
      prisma.produto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true, nome: true, tamanho: true, referencia: true, cor: true,
          quantidade: true, precoVenda: true, precoCusto: true, genero: true,
          modelo: true, marca: true, disponivel: true, lote: true,
          dataRecebimento: true, imagem: true,
        },
      }),
    ]);

    const valorTotalRevenda = produtosParaCalc.reduce(
      (sum, p) => sum + (parseFloat(p.precoVenda || 0) * parseInt(p.quantidade || 0)), 0
    );
    const custoTotalEstoque = produtosParaCalc.reduce(
      (sum, p) => sum + (parseFloat(p.precoCusto || 0) * parseInt(p.quantidade || 0)), 0
    );
    const lucroProjetado = valorTotalRevenda - custoTotalEstoque;
    const margemLucro = custoTotalEstoque > 0
      ? ((lucroProjetado / custoTotalEstoque) * 100).toFixed(2) : 0;
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`RESULTADO: ${produtos.length} produtos na página ${page}/${totalPages}`);

    return {
      data: produtos,
      totalPages,
      currentPage: page,
      totalCount,
      totalProdutos: totalAggregate._sum?.quantidade || 0,
      valorTotalRevenda: valorTotalRevenda.toFixed(2),
      custoTotalEstoque: custoTotalEstoque.toFixed(2),
      lucroProjetado: lucroProjetado.toFixed(2),
      margemLucro: `${margemLucro}%`,
    };
  } catch (error) {
    console.error('ERRO getAllProdutos:', error);
    throw new Error(`Erro ao buscar produtos: ${error.message}`);
  }
}

// Usada no api/produtos/[id]/route.js
export async function getProdutoById(id) {
  try {
    const produtoId = parseInt(id);
    if (isNaN(produtoId)) throw new Error('ID inválido');
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      select: {
        id: true,
        nome: true,
        tamanho: true,
        referencia: true,
        cor: true,
        quantidade: true,
        precoVenda: true,
        precoCusto: true,
        genero: true,
        modelo: true,
        marca: true,
        disponivel: true,
        lote: true,
        dataRecebimento: true,
        imagem: true,
      },
    });
    if (!produto) throw new Error('Produto não encontrado');
    return produto;
  } catch (error) {
    console.error('Erro no getProdutoById:', error);
    throw error;
  }
}

export async function updateProduto(data) {
  try {
    const id = parseInt(data.id);
    if (isNaN(id)) throw new Error('ID inválido');

    const dataRecebimento = data.dataRecebimento ? new Date(data.dataRecebimento) : undefined;
    if (dataRecebimento && isNaN(dataRecebimento.getTime())) throw new Error('Data de recebimento inválida');

    const precoVenda = parseFloat(data.precoVenda) || 0;
    const precoCusto = parseFloat(data.precoCusto) || 0;
    if (precoVenda < 0 || precoCusto < 0) throw new Error('Preços inválidos');

    // === NOVO: Tratamento da promoção ===
    let precoPromocao = null;
    let emPromocao = false;

    if (data.emPromocao === true || data.emPromocao === 'true') {
      emPromocao = true;
      precoPromocao = parseFloat(data.precoPromocao);

      if (isNaN(precoPromocao) || precoPromocao <= 0) {
        throw new Error('Preço promocional deve ser maior que zero');
      }
      if (precoPromocao >= precoVenda) {
        throw new Error('Preço promocional deve ser menor que o preço de venda normal');
      }
    }
    // =====================================

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        nome: data.nome,
        tamanho: parseInt(data.tamanho),
        referencia: data.referencia,
        cor: data.cor,
        quantidade: parseInt(data.quantidade),
        precoVenda,
        precoCusto,
        genero: data.genero,
        modelo: data.modelo,
        marca: data.marca,
        disponivel: parseInt(data.quantidade) > 0,
        lote: data.lote || null,
        dataRecebimento,
        imagem: data.imagem || null,
        precoPromocao,
        emPromocao,
      },
    });

    return { status: 200, data: produto };
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error; // Deixa a route tratar o status
  }
}


export async function deleteProduto(id) {
  try {
    const produtoId = parseInt(id);
    if (isNaN(produtoId)) throw new Error('ID inválido');
    await prisma.produto.delete({ where: { id: produtoId } });
    return { status: 200, data: { message: 'Produto deletado com sucesso' } };
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    if (error.code === 'P2003') throw new Error('Não é possível deletar o produto porque ele está vinculado a uma venda.');
    throw error;
  }
}