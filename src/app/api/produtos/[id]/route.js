// // app/api/produtos/[id]/route.js
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../../auth/[...nextauth]/route';
// import { getProdutoById, updateProduto, deleteProduto } from '../controller/produtosController';

// const requireAdmin = async () => {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) throw new Error('Não autenticado');
//   if (session.user.role !== 'ADMIN') throw new Error('Acesso negado. Apenas administradores.');
//   return session.user;
// };

// export async function GET(request, { params }) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) {
//     return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
//   }

//   const { id } = params;
//   if (!id || isNaN(parseInt(id))) {
//     return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
//   }

//   try {
//     const produto = await getProdutoById(id);
//     return NextResponse.json(produto, { status: 200 });
//   } catch (error) {
//     const status = error.message === 'Produto não encontrado' ? 404 : 500;
//     return NextResponse.json({ error: error.message }, { status });
//   }
// }

// export async function PUT(request, { params }) {
//   try {
//     await requireAdmin(); // Só admin

//     const { id } = params;
//     if (!id || isNaN(parseInt(id))) {
//       return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
//     }

//     const body = await request.json();
//     const result = await updateProduto({ ...body, id: parseInt(id) });
//     return NextResponse.json(result.data, { status: result.status });
//   } catch (error) {
//     return NextResponse.json(
//       { error: error.message },
//       { status: error.message.includes('Acesso negado') ? 403 : 500 }
//     );
//   }
// }

// export async function DELETE(request, { params }) {
//   try {
//     await requireAdmin(); // Só admin

//     const { id } = params;
//     if (!id || isNaN(parseInt(id))) {
//       return NextResponse.json(
//         { error: 'ID inválido' },
//         { status: 400 }
//       );
//     }

//     const result = await deleteProduto(parseInt(id));
//     return NextResponse.json(result.data, { status: result.status });
//   } catch (error) {
//     const status = error.message.includes('vinculado')
//       ? 409
//       : error.message.includes('Acesso negado')
//       ? 403
//       : 500;

//     return NextResponse.json(
//       { error: error.message },
//       { status }
//     );
//   }
// }
// src/app/api/produtos/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getProdutoById, updateProduto, deleteProduto } from '../controller/produtosController'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Não autenticado')
  if (session.user.role !== 'ADMIN') throw new Error('Acesso negado. Apenas administradores.')
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const id = parseInt(params.id, 10)
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    const produto = await getProdutoById(id)
    return NextResponse.json(produto)
  } catch (error) {
    const status = error.message.includes('não encontrado') ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin()

    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const body = await request.json()
    const result = await updateProduto({ ...body, id })
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    const status = error.message.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ error: error.message }, { status })
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin()

    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const result = await deleteProduto(id)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    const status = error.message.includes('vinculado') ? 409 : error.message.includes('Acesso negado') ? 403 : 500
    return NextResponse.json({ error: error.message }, { status })
  }
}
