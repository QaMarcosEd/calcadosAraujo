// app/api/produtos/lote/route.js
import { NextResponse } from 'next/server';
import { createLote } from './controller/loteController';

export async function POST(request) {
  try {
    const data = await request.json();
    const result = await createLote(data);
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    const status = error.message.includes('faltando') || error.message.includes('inválida') ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}


