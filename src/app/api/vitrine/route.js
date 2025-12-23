// app/api/vitrine/route.js
import { NextResponse } from 'next/server';
import { getVitrineProdutos } from './controllers/vitrineController';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const genero = searchParams.get('genero');
    const minPreco = searchParams.get('minPreco');
    const maxPreco = searchParams.get('maxPreco');

    const result = await getVitrineProdutos({ 
      page, 
      limit, 
      genero, 
      minPreco: minPreco ? parseFloat(minPreco) : null, 
      maxPreco: maxPreco ? parseFloat(maxPreco) : null 
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}