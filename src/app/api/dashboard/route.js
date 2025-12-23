// src/app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import { getDashboardData } from './dashboardController';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const epoca = searchParams.get('epoca') || 'normal';
    const data = await getDashboardData(epoca);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}