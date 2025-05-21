import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Import the function from your server actions
import { getSignedUrlWithPermissionCheck } from '@/server/photo-actions';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get photo ID from query params
    const photoId = request.nextUrl.searchParams.get('id');
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Get optional variant parameter, default to 'public' if not provided
    const variant = request.nextUrl.searchParams.get('variant') || 'public';

    // Get signed URL with permission check
    const result = await getSignedUrlWithPermissionCheck(
      photoId,
      userId,
      variant
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to get signed URL' },
      { status: 500 }
    );
  }
}
