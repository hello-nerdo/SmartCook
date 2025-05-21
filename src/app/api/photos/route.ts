import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { CloudflareImageResponse, CloudflareImageResult } from '@/lib/types';

import { getDb } from '@/db';
import { Photo, PhotoSchema } from '@/db/types';
import {
  deletePhoto,
  generatePhotosWithUrls,
  getPhoto,
  getSignedImageUrl,
  getTeamPhotos,
  savePhotoRecord,
} from '@/server/photo-actions';

// Define schemas for API validation
export const PostSchema = z.object({
  imageId: z.string(),
  filename: z.string(),
  logId: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const DeleteSchema = z.object({
  id: z.string(),
});

// POST handler for saving a photo record after Cloudflare Images direct upload
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse JSON body
    const body = await req.json();

    // Validate input schema
    const validationResult = PostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { imageId, filename, logId, metadata } = validationResult.data;

    console.log('POST /api/photos - Received valid photo data:', {
      imageId,
      filename,
      logId,
      metadataKeys: metadata ? Object.keys(metadata) : [],
    });

    // Use the savePhotoRecord server action
    const result = await savePhotoRecord(imageId, filename, logId, metadata);

    if (!result.success) {
      console.error('POST /api/photos - savePhotoRecord failed:', result.error);
      return NextResponse.json(
        { message: result.error || 'Failed to save photo information' },
        { status: 500 }
      );
    }

    console.log(
      'POST /api/photos - Photo saved successfully with ID:',
      result.photo.id
    );
    return NextResponse.json(result.photo, { status: 201 });
  } catch (error) {
    console.error('POST /api/photos - Error creating photo record:', error);
    return NextResponse.json(
      { message: 'Failed to create photo record' },
      { status: 500 }
    );
  }
}

// GET handler for retrieving photos
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get team ID from search params
    const searchParams = req.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');
    const photoId = searchParams.get('id');

    // If photoId is provided, get a single photo
    if (photoId) {
      const photo = await getPhoto(photoId, userId);

      if (!photo) {
        return NextResponse.json(
          { message: 'Photo not found or you do not have access' },
          { status: 404 }
        );
      }

      // Generate signed URL if image has an imageId
      let url = '';
      if (photo.imageId) {
        url = await getSignedImageUrl(photo.imageId);
      }

      return NextResponse.json({ ...photo, url });
    }

    // Otherwise, get all photos for a team
    if (!teamId) {
      return NextResponse.json(
        { message: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Use getTeamPhotos server action to fetch photos
    const photos = await getTeamPhotos(teamId, userId);

    // Generate URLs for each photo using the new function
    const photosWithUrls = await generatePhotosWithUrls(photos);

    return NextResponse.json(photosWithUrls);
  } catch (error) {
    console.error('GET /api/photos - Error fetching photos:', error);
    return NextResponse.json(
      { message: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// DELETE handler for deleting a photo
export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get photo ID from search params
    const searchParams = req.nextUrl.searchParams;
    const photoId = searchParams.get('id');

    // Validate input schema
    const validationResult = DeleteSchema.safeParse({
      id: photoId,
    });

    if (!validationResult.success || !photoId) {
      return NextResponse.json(
        {
          message: 'Invalid input',
          errors: validationResult.success
            ? { id: 'Required' }
            : validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Use the deletePhoto server action
    const result = await deletePhoto(photoId);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to delete photo' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/photos - Error deleting photo:', error);
    return NextResponse.json(
      { message: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
