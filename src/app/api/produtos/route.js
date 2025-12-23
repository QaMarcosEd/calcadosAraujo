// app/api/produtos/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getAllProdutos } from './controller/produtosController'; // Ajuste


export async function GET(request) {
  try {
    // ← VERIFICAÇÃO DE AUTENTICAÇÃO (igual aos outros métodos)
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Parse dos parâmetros da query string
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Debug no servidor
    console.log('API GET /produtos - Parâmetros recebidos:', params);

    // Chama o getAllProdutos com os params corretos
    const result = await getAllProdutos(params);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Erro na API GET /produtos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar produtos' }, 
      { status: 500 }
    );
  }
}


