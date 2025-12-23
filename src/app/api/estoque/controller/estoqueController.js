// // app/api/estoque/controller/estoqueController.js
// import prisma from '@/app/lib/prisma'

// export async function getEstoqueData(tipo, filtros = {}, page = 1) {
//   const { genero, marca, modelo, numeracao, referencia } = filtros;

//   try {
//     // Validação da numeração
//     const numeracaoInt = numeracao ? parseInt(numeracao) : undefined;
//     if (numeracao && isNaN(numeracaoInt)) {
//       throw new Error('Numeração inválida (deve ser número)');
//     }

//     // Filtros base
//     const whereBase = {};
//     if (genero) whereBase.genero = genero;
//     if (marca) whereBase.marca = { contains: marca, mode: 'insensitive' };
//     if (modelo) whereBase.modelo = { contains: modelo, mode: 'insensitive' };
//     if (numeracaoInt) whereBase.tamanho = numeracaoInt;
//     if (referencia) whereBase.referencia = { contains: referencia, mode: 'insensitive' };

//     console.log('Filtros aplicados:', whereBase); // Log para depuração

//     // Lógica para agregações (gráficos: genero, modelo, marca)
//     if (tipo && ['genero', 'modelo', 'marca'].includes(tipo)) {
//       const contagem = await prisma.produto.groupBy({
//         by: [tipo],
//         _sum: { quantidade: true },
//         where: whereBase,
//       });
//       return contagem.map((item) => ({
//         [tipo]: item[tipo] || 'Desconhecido',
//         total: item._sum.quantidade || 0,
//       }));
//     }

//     // Validação de tipo inválido
//     if (tipo && !['genero', 'modelo', 'marca'].includes(tipo)) {
//       throw new Error('Tipo inválido para agregação');
//     }

//     // Paginação
//     const pageSize = 10;
//     const skip = (page - 1) * pageSize;

//     // Busca geral de produtos
//     const produtos = await prisma.produto.findMany({
//       where: whereBase,
//       select: {
//         id: true,
//         nome: true,
//         genero: true,
//         marca: true,
//         modelo: true,
//         tamanho: true,
//         quantidade: true,
//         precoVenda: true,
//         cor: true,
//         referencia: true,
//         dataRecebimento: true,
//       },
//       orderBy: { dataRecebimento: 'desc' },
//       skip,
//       take: pageSize,
//     });

//     console.log('Produtos retornados:', produtos); // Log para depuração

//     // Calcular totais gerais
//     const totalQuantidade = await prisma.produto.aggregate({
//       where: whereBase,
//       _sum: { quantidade: true },
//     });
//     const paresTotais = totalQuantidade._sum.quantidade || 0;

//     const produtosParaValor = await prisma.produto.findMany({
//       where: whereBase,
//       select: {
//         quantidade: true,
//         precoVenda: true,
//       },
//     });
//     const valorEstoque = produtosParaValor.reduce((sum, p) => sum + ((p.quantidade || 0) * (p.precoVenda || 0)), 0);

//     const esgotados = await prisma.produto.count({
//       where: { ...whereBase, quantidade: 0 },
//     });

//     console.log('Totais calculados:', { valorEstoque, paresTotais, esgotados }); // Log para depuração

//     // Contagem total para paginação
//     const totalProdutos = await prisma.produto.count({ where: whereBase });
//     const totalPages = Math.ceil(totalProdutos / pageSize);

//     // Calcular disponivel com base na quantidade
//     const produtosComDisponivel = produtos.map((produto) => ({
//       ...produto,
//       disponivel: produto.quantidade > 0,
//     }));

//     return {
//       data: produtosComDisponivel,
//       totalPages,
//       totalProdutos,
//       valorEstoque,
//       paresTotais,
//       esgotados,
//     };
//   } catch (error) {
//     console.error('Erro no getEstoqueData:', error);
//     throw error;
//   }
// }
// src/app/api/estoque/controller/estoqueController.js
import prisma from '@/app/lib/prisma'

export async function getEstoqueData(tipo, filtros = {}, page = 1) {
  const { genero, marca, modelo, numeracao, referencia } = filtros

  try {
    // Validação da numeração
    const numeracaoInt = numeracao ? parseInt(numeracao, 10) : undefined
    if (numeracao && isNaN(numeracaoInt)) {
      throw new Error('Numeração inválida (deve ser número)')
    }

    // Filtros base
    const whereBase = {
      ...(genero && { genero }),
      ...(marca && { marca: { contains: marca, mode: 'insensitive' } }),
      ...(modelo && { modelo: { contains: modelo, mode: 'insensitive' } }),
      ...(numeracaoInt && { tamanho: numeracaoInt }),
      ...(referencia && { referencia: { contains: referencia, mode: 'insensitive' } }),
    }

    // Agregações para gráficos (genero, modelo, marca)
    if (tipo && ['genero', 'modelo', 'marca'].includes(tipo)) {
      const contagem = await prisma.Produto.groupBy({
        by: [tipo],
        _sum: { quantidade: true },
        where: whereBase,
      })

      return contagem.map((item) => ({
        name: item[tipo] || 'Desconhecido',
        value: item._sum.quantidade || 0,
      }))
    }

    if (tipo && !['genero', 'modelo', 'marca'].includes(tipo)) {
      throw new Error('Tipo inválido para agregação')
    }

    // Paginação
    const pageSize = 10
    const skip = (page - 1) * pageSize

    // Busca única com tudo que precisa (otimizado: evita query duplicada)
    const produtos = await prisma.Produto.findMany({
      where: whereBase,
      select: {
        id: true,
        nome: true,
        genero: true,
        marca: true,
        modelo: true,
        tamanho: true,
        quantidade: true,
        precoVenda: true,
        cor: true,
        referencia: true,
        dataRecebimento: true,
      },
      orderBy: { dataRecebimento: 'desc' },
      skip,
      take: pageSize,
    })

    // Cálculos com os mesmos produtos da lista
    const paresTotais = produtos.reduce((acc, p) => acc + p.quantidade, 0)
    const valorEstoque = produtos.reduce((acc, p) => acc + p.quantidade * p.precoVenda, 0)

    const esgotados = await prisma.Produto.count({
      where: { ...whereBase, quantidade: 0 },
    })

    const totalProdutos = await prisma.Produto.count({ where: whereBase })
    const totalPages = Math.ceil(totalProdutos / pageSize)

    const data = produtos.map((produto) => ({
      ...produto,
      disponivel: produto.quantidade > 0,
    }))

    return {
      data,
      totalPages,
      totalProdutos,
      valorEstoque: Number(valorEstoque.toFixed(2)),
      paresTotais,
      esgotados,
    }
  } catch (error) {
    console.error('Erro no getEstoqueData:', error)
    throw error
  }
}