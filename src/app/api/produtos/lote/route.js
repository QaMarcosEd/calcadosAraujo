// // app/api/produtos/lote/route.js
// import { NextResponse } from 'next/server';
// import { createLote } from './controller/loteController';

// export async function POST(request) {
//   try {
//     const data = await request.json();
//     const result = await createLote(data);
//     return NextResponse.json(result.data, { status: result.status });
//   } catch (error) {
//     const status = error.message.includes('faltando') || error.message.includes('inválida') ? 400 : 500;
//     return NextResponse.json({ error: error.message }, { status });
//   }
// }
// src/app/api/produtos/lote/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createLote } from './controller/loteController'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado. Apenas administradores.')
  }
}

export async function POST(request) {
  try {
    await requireAdmin()
    const data = await request.json()
    const result = await createLote(data)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    console.error('Erro na rota POST /lote:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}