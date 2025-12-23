// // app/api/produtos/lote/controller/loteController.js
// import prisma from '@/app/lib/prisma'

// export async function createLote(data) {
//   try {
//     // Validações dos campos genéricos
//     const camposObrigatorios = ['nome', 'referencia', 'cor', 'precoVenda', 'genero', 'modelo', 'marca', 'dataRecebimento'];
//     const faltando = camposObrigatorios.filter(c => !data.genericos[c]);
//     if (faltando.length) {
//       throw new Error(`Campos obrigatórios faltando: ${faltando.join(', ')}`);
//     }

//     const dataRecebimento = new Date(data.genericos.dataRecebimento);
//     if (isNaN(dataRecebimento.getTime())) {
//       throw new Error('Data de recebimento inválida');
//     }
//     if (dataRecebimento > new Date()) {
//       throw new Error('Data de recebimento não pode ser futura');
//     }

//     const precoVenda = parseFloat(data.genericos.precoVenda);
//     const precoCusto = data.genericos.precoCusto ? parseFloat(data.genericos.precoCusto) : null;
//     if (isNaN(precoVenda) || precoVenda <= 0) {
//       throw new Error('Preço de venda inválido');
//     }
//     if (precoCusto !== null && (isNaN(precoCusto) || precoCusto < 0)) {
//       throw new Error('Preço de custo inválido');
//     }
//     if (precoCusto > precoVenda) {
//       console.warn('Aviso: Custo > Venda');
//     }

//     if (!data.variacoes || data.variacoes.length === 0) {
//       throw new Error('Pelo menos uma variação necessária');
//     }
//     const totalQuantidade = data.variacoes.reduce((sum, v) => sum + parseInt(v.quantidade), 0);
//     if (totalQuantidade <= 0) {
//       throw new Error('Lote deve ter pelo menos uma unidade');
//     }

//     // Validar duplicatas dentro do lote enviado
//     const combinacoes = new Set();
//     for (const variacao of data.variacoes) {
//       const tamanho = parseInt(variacao.tamanho);
//       const quantidade = parseInt(variacao.quantidade);
//       if (isNaN(tamanho) || tamanho <= 0 || isNaN(quantidade) || quantidade <= 0) {
//         throw new Error(`Variação inválida: tamanho ${variacao.tamanho}, qtd ${variacao.quantidade}`);
//       }
//       const chave = `${data.genericos.referencia}-${data.genericos.cor}-${tamanho}`;
//       if (combinacoes.has(chave)) {
//         throw new Error(`Combinação duplicada no lote: Referência ${data.genericos.referencia}, Cor ${data.genericos.cor}, Tamanho ${tamanho}`);
//       }
//       combinacoes.add(chave);
//     }

//     // Validar duplicatas no banco de dados
//     for (const variacao of data.variacoes) {
//       const tamanho = parseInt(variacao.tamanho);
//       const existente = await prisma.produto.findFirst({
//         where: {
//           referencia: data.genericos.referencia,
//           cor: data.genericos.cor,
//           tamanho,
//         },
//       });
//       if (existente) {
//         throw new Error(
//           `Produto com Referência ${data.genericos.referencia}, Cor ${data.genericos.cor}, Tamanho ${tamanho} já existe no banco (ID: ${existente.id})`
//         );
//       }
//     }

//     // Gerar identificador do lote
//     const lote = data.genericos.lote || `Lote-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

//     // Criar produtos em uma transação
//     const produtosCriados = await prisma.$transaction(async (tx) => {
//       const criados = [];
//       for (const variacao of data.variacoes) {
//         const tamanho = parseInt(variacao.tamanho);
//         const quantidade = parseInt(variacao.quantidade);

//         const novo = await tx.produto.create({
//           data: {
//             nome: data.genericos.nome,
//             referencia: data.genericos.referencia,
//             cor: data.genericos.cor,
//             tamanho,
//             quantidade,
//             precoCusto,
//             precoVenda,
//             genero: data.genericos.genero,
//             modelo: data.genericos.modelo,
//             marca: data.genericos.marca,
//             lote,
//             dataRecebimento,
//             imagem: data.genericos.imagem || null,
//             disponivel: quantidade > 0,
//           },
//         });
//         criados.push(novo);
//       }
//       return criados;
//     });

//     return {
//       status: 201,
//       data: { message: `Lote com ${produtosCriados.length} itens criado`, produtos: produtosCriados },
//     };
//   } catch (error) {
//     console.error('Erro ao criar lote:', error);
//     return { status: 400, data: { error: error.message } };
//   }
// }
// src/app/api/produtos/lote/controller/loteController.js
import prisma from '@/app/lib/prisma'

export async function createLote(data) {
  try {
    const { genericos, variacoes } = data

    const camposObrigatorios = ['nome', 'referencia', 'cor', 'precoVenda', 'genero', 'modelo', 'marca', 'dataRecebimento']
    const faltando = camposObrigatorios.filter(c => !genericos[c]?.trim())
    if (faltando.length) throw new Error(`Campos obrigatórios faltando: ${faltando.join(', ')}`)

    const dataRecebimento = new Date(genericos.dataRecebimento)
    if (isNaN(dataRecebimento.getTime()) || dataRecebimento > new Date()) {
      throw new Error('Data de recebimento inválida ou futura')
    }

    const precoVenda = parseFloat(genericos.precoVenda)
    if (isNaN(precoVenda) || precoVenda <= 0) throw new Error('Preço de venda inválido')

    const precoCusto = genericos.precoCusto ? parseFloat(genericos.precoCusto) : null
    if (precoCusto !== null && (isNaN(precoCusto) || precoCusto < 0)) throw new Error('Preço de custo inválido')

    if (!variacoes || variacoes.length === 0) throw new Error('Pelo menos uma variação necessária')

    const totalQuantidade = variacoes.reduce((sum, v) => sum + parseInt(v.quantidade || 0), 0)
    if (totalQuantidade <= 0) throw new Error('Lote deve ter pelo menos uma unidade')

    // Valida duplicatas no lote enviado
    const combinacoes = new Set()
    for (const v of variacoes) {
      const tamanho = parseInt(v.tamanho)
      const qtd = parseInt(v.quantidade)
      if (isNaN(tamanho) || tamanho <= 0 || isNaN(qtd) || qtd <= 0) {
        throw new Error(`Variação inválida: tamanho ${v.tamanho}, quantidade ${v.quantidade}`)
      }
      const chave = `${genericos.referencia}-${genericos.cor}-${tamanho}`
      if (combinacoes.has(chave)) throw new Error(`Duplicata no lote: ${chave}`)
      combinacoes.add(chave)
    }

    // Valida duplicatas no banco
    for (const v of variacoes) {
      const tamanho = parseInt(v.tamanho)
      const existente = await prisma.Produto.findFirst({
        where: {
          referencia: genericos.referencia,
          cor: genericos.cor,
          tamanho,
        },
      })
      if (existente) throw new Error(`Produto já existe: Ref ${genericos.referencia}, Cor ${genericos.cor}, Tam ${tamanho} (ID: ${existente.id})`)
    }

    const lote = genericos.lote || `LOTE-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100+Math.random()*900)}`

    const produtosCriados = await prisma.$transaction(async (tx) => {
      const criados = []
      for (const v of variacoes) {
        const novo = await tx.Produto.create({
          data: {
            nome: genericos.nome,
            referencia: genericos.referencia,
            cor: genericos.cor,
            tamanho: parseInt(v.tamanho),
            quantidade: parseInt(v.quantidade),
            precoCusto,
            precoVenda,
            genero: genericos.genero,
            modelo: genericos.modelo,
            marca: genericos.marca,
            lote,
            dataRecebimento,
            imagem: genericos.imagem || null,
            disponivel: parseInt(v.quantidade) > 0,
            emPromocao: false,
            precoPromocao: null,
          },
        })
        criados.push(novo)
      }
      return criados
    })

    return {
      status: 201,
      data: { message: `Lote criado: ${produtosCriados.length} itens`, produtos: produtosCriados, lote },
    }
  } catch (error) {
    console.error('Erro ao criar lote:', error)
    throw error // deixa a route tratar status
  }
}
