import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('Debug route called');
    
    // Get the content type
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    // Clone the request to read the body
    const clonedReq = req.clone();
    let bodyText;
    
    try {
      bodyText = await clonedReq.text();
      console.log('Raw request body text:', bodyText);
    } catch (error) {
      console.error('Error reading request body as text:', error);
      return NextResponse.json({ error: 'Failed to read request body as text' }, { status: 400 });
    }
    
    // Try to parse as JSON if content type is application/json
    let parsedBody = null;
    if (contentType?.includes('application/json') && bodyText) {
      try {
        parsedBody = JSON.parse(bodyText);
        console.log('Parsed JSON body:', parsedBody);
      } catch (error) {
        console.error('Error parsing JSON body:', error);
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
      }
    }
    
    // Return the parsed body or raw text
    return NextResponse.json({
      receivedContentType: contentType,
      rawBodyLength: bodyText?.length || 0,
      parsedBody: parsedBody,
      rawBodyPreview: bodyText?.substring(0, 100)
    });
  } catch (error) {
    console.error('Debug route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 