import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the direct upload URL from photo-actions
    const { getDirectUploadUrl } = await import('@/server/photo-actions');
    const metadata = {
      userId,
      uploadedAt: new Date().toISOString(),
    };
    const result = await getDirectUploadUrl(metadata);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to get upload URL' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
