// // app/api/estoque/route.js
// import { NextResponse } from 'next/server';
// import { getEstoqueData } from './controller/estoqueController';

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const tipo = searchParams.get('tipo');
//   const genero = searchParams.get('genero');
//   const marca = searchParams.get('marca');
//   const modelo = searchParams.get('modelo');
//   const numeracao = searchParams.get('numeracao');
//   const referencia = searchParams.get('referencia');
//   const page = parseInt(searchParams.get('page')) || 1;

//   try {
//     console.log('Requisição para /api/estoque:', { tipo, genero, marca, modelo, numeracao, referencia, page });
//     const resultado = await getEstoqueData(tipo, { genero, marca, modelo, numeracao, referencia }, page);
//     console.log('Resposta da API /api/estoque:', resultado);
//     return NextResponse.json(resultado);
//   } catch (error) {
//     console.error('Erro na rota /api/estoque:', error);
//     const status = error.message.includes('inválido') ? 400 : 500;
//     return NextResponse.json({ error: error.message || 'Erro ao buscar dados de estoque' }, { status });
//   }
// }
// src/app/api/estoque/route.js
import { NextResponse } from 'next/server'
import { getEstoqueData } from './controller/estoqueController'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')
  const genero = searchParams.get('genero')
  const marca = searchParams.get('marca')
  const modelo = searchParams.get('modelo')
  const numeracao = searchParams.get('numeracao')
  const referencia = searchParams.get('referencia')
  const page = parseInt(searchParams.get('page') || '1', 10)

  try {
    const filtros = { genero, marca, modelo, numeracao, referencia }
    const resultado = await getEstoqueData(tipo, filtros, page)

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Erro na rota /api/estoque:', error)
    const status = error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados de estoque' },
      { status }
    )
  }
}