import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'summary';
    const chatId = searchParams.get('chatId');
    const workflowId = searchParams.get('workflowId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Supabase 함수 URL 구성
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const functionUrl = `${supabaseUrl}/functions/v1/openai-usage-stats`;
    const params = new URLSearchParams();

    if (action) params.append('action', action);
    if (chatId) params.append('chatId', chatId);
    if (workflowId) params.append('workflowId', workflowId);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await fetch(`${functionUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase function error:', errorText);
      throw new Error(`Failed to fetch OpenAI usage stats: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OpenAI usage stats API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch OpenAI usage statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
