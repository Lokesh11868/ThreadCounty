import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawText = await req.text();
    if (!rawText) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }
    const { input, targetLang } = JSON.parse(rawText);

    if (!input || !targetLang) {
      return NextResponse.json({ error: 'Missing input or targetLang' }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    // Map our language codes to Sarvam's expected codes
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      te: 'te-IN'
    };

    const target_language_code = langMap[targetLang];
    if (!target_language_code) {
      return NextResponse.json({ error: 'Unsupported target language' }, { status: 400 });
    }

    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        input,
        source_language_code: 'en-IN',
        target_language_code,
        speaker_gender: 'Female',
        mode: 'formal',
        model: 'sarvam-translate:v1'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam API Error:', errorText);
      return NextResponse.json({ error: 'Sarvam API request failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ translated_text: data.translated_text });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
