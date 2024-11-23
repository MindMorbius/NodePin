import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    total: 0,
    page: 1,
    pageSize: 10,
    data: []
  });
}

export async function POST() {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}

export async function PUT() {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 }); 
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
}