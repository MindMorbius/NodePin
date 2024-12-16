import { NextResponse } from 'next/server';
import { decrypt } from '@/utils/crypto';

export async function POST(req: Request) {
  try {
    const { encrypted_url } = await req.json();

    if (!encrypted_url) {
      return NextResponse.json({ error: 'No encrypted URL provided' }, { status: 400 });
    }

    const decryptedUrl = await decrypt(encrypted_url);

    if (!decryptedUrl) {
      return NextResponse.json({ error: 'Failed to decrypt URL' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: decryptedUrl
    });
  } catch (error) {
    console.error('Decrypt error:', error);
    return NextResponse.json(
      { error: 'Failed to decrypt URL' },
      { status: 500 }
    );
  }
} 