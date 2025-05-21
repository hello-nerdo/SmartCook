'use server';

import { auth } from '@clerk/nextjs/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { redirect } from 'next/navigation';

import { LOGIN_REDIRECT_URL } from '@/lib/constants';

import { getDb } from '@/db';
import { Photo } from '@/db/types';

import { getUserDefaultTeamId } from '../../../contractorHub/src/server/team-actions';

// Define proper return types for API functions
type UploadUrlSuccessResponse = {
  success: true;
  uploadURL: string;
  imageId: string;
};

type UploadUrlErrorResponse = {
  success: false;
  error: string;
};

type UploadUrlResponse = UploadUrlSuccessResponse | UploadUrlErrorResponse;

type SavePhotoSuccessResponse = {
  success: true;
  photo: Photo;
};

type SavePhotoErrorResponse = {
  success: false;
  error: string;
};

type SavePhotoResponse = SavePhotoSuccessResponse | SavePhotoErrorResponse;

type PhotoOperationResponse =
  | { success: true }
  | { success: false; error: string };

type PhotoUrlResponse = { url: string } | { error: string };

// Get a single photo by ID with permission check
export async function getPhoto(
  photoId: string,
  userId: string,
  dbParam?: D1Database
): Promise<Photo | null> {
  const db = dbParam || (await getDb());

  // Verify user has access to the photo through the team and ensure it's not soft deleted
  const photo = await db
    .prepare(
      `
      SELECT p.* FROM photos p
      JOIN team_memberships tm ON p.teamId = tm.teamId
      WHERE p.id = ? 
        AND tm.userId = ? 
        AND p.deletedAt IS NULL 
    `
    )
    .bind(photoId, userId)
    .first();

  if (!photo) {
    return null;
  }

  return photo as Photo;
}

// Get a direct upload URL for client-side uploads
export async function getDirectUploadUrl(
  metadata: Record<string, unknown>
): Promise<UploadUrlResponse> {
  try {
    // Get Cloudflare Images API access
    const { env } = await getCloudflareContext();
    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = env.CLOUDFLARE_IMAGE_API_TOKEN;

    // Create FormData
    const formData = new FormData();
    formData.append('requireSignedURLs', 'true');
    formData.append('metadata', JSON.stringify(metadata));

    // Request a one-time upload URL from Cloudflare Images using FormData
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('getDirectUploadUrl: Failed to get upload URL', errorData);
      return { success: false, error: 'Failed to get upload URL' };
    }

    // Define the expected response type
    interface CloudflareImageResponse {
      result: {
        id: string;
        uploadURL: string;
      };
      success: boolean;
    }

    const data = (await response.json()) as CloudflareImageResponse;
    return {
      success: true,
      uploadURL: data.result.uploadURL,
      imageId: data.result.id,
    };
  } catch (error) {
    console.error('getDirectUploadUrl: Error getting upload URL:', error);
    return { success: false, error: 'Failed to get upload URL' };
  }
}

// Save photo record after client-side upload
export async function savePhotoRecord(
  CloudflareImageId: string,
  filename: string,
  logId: string,
  metadata?: Record<string, unknown>
): Promise<SavePhotoResponse> {
  const { userId } = await auth();
  if (!userId) {
    redirect(LOGIN_REDIRECT_URL);
  }

  const teamId = await getUserDefaultTeamId(userId);
  if (!teamId) {
    console.error('savePhotoRecord: No default team found for user:', userId);
    return {
      success: false,
      error: 'No default team found. Please create or join a team first.',
    };
  }

  const db = await getDb();

  try {
    // Verify that the log exists and user has access to it
    const logExists = await db
      .prepare(
        `
        SELECT l.id FROM logs l
        JOIN team_memberships tm ON l.teamId = tm.teamId
        WHERE l.id = ? AND tm.userId = ? AND l.deletedAt IS NULL
      `
      )
      .bind(logId, userId)
      .first();

    if (!logExists) {
      console.error(
        `savePhotoRecord: Log with ID ${logId} not found or user doesn't have access`
      );
      return {
        success: false,
        error: 'Log not found or you do not have access to it',
      };
    }

    // Process metadata
    const metadataToStore = metadata || {};

    // Ensure uploadedBy is always included in metadata
    metadataToStore.uploadedBy = userId;

    // Extract content type if available
    const contentType = metadataToStore.filetype?.toString() || 'image/jpeg';

    // Extract file size if available
    const size =
      typeof metadataToStore.filesize === 'number'
        ? metadataToStore.filesize
        : 0;

    // Get the team ID for the log to ensure we use the correct team
    const logTeam = (await db
      .prepare(`SELECT teamId FROM logs WHERE id = ?`)
      .bind(logId)
      .first()) as { teamId: string } | null;

    if (!logTeam) {
      console.error(`savePhotoRecord: Failed to get teamId for log ${logId}`);
      return { success: false, error: 'Failed to retrieve log information' };
    }

    // Use the log's teamId instead of user's default team
    const photoTeamId = logTeam.teamId;

    // Log insertion details for debugging
    console.log(
      `savePhotoRecord: Inserting photo with teamId=${photoTeamId}, logId=${logId}`
    );

    // Insert into database with all metadata in JSON field
    const stmt = db
      .prepare(
        `
      INSERT INTO photos (teamId, creatorId, filename, imageId, logId, contentType, size, metadata, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `
      )
      .bind(
        photoTeamId,
        userId,
        filename,
        CloudflareImageId,
        logId,
        contentType,
        size,
        JSON.stringify(metadataToStore)
      );

    const dbResult = await stmt.run();

    if (!dbResult.success) {
      console.error('savePhotoRecord: Database insert failed:', dbResult);
      return { success: false, error: 'Failed to save photo information' };
    }

    console.log(
      `savePhotoRecord: Photo insert successful for imageId ${CloudflareImageId}, trying to retrieve`
    );

    // Retrieve the newly created photo by the CloudflareImageId which is unique
    // This is more reliable than using last_row_id with custom ID generation
    const newPhoto = (await db
      .prepare(
        `
        SELECT * FROM photos 
        WHERE imageId = ? AND creatorId = ? AND deletedAt IS NULL
        ORDER BY createdAt DESC
        LIMIT 1
      `
      )
      .bind(CloudflareImageId, userId)
      .first()) as Photo | null;

    if (!newPhoto) {
      console.error(
        `savePhotoRecord: Failed to retrieve photo with imageId ${CloudflareImageId} for user ${userId}`
      );
      return {
        success: false,
        error: 'Failed to retrieve newly created photo',
      };
    }

    console.log(
      `savePhotoRecord: Successfully retrieved photo with ID ${newPhoto.id}`
    );

    // No need to revalidate path here, as we don't know the specific path
    // The caller can handle revalidation based on their needs

    return { success: true, photo: newPhoto };
  } catch (error) {
    console.error('savePhotoRecord: Error saving photo record:', error);
    return { success: false, error: 'Failed to save photo record' };
  }
}

// Delete a photo (soft delete)
export async function deletePhoto(
  photoId: string
): Promise<PhotoOperationResponse> {
  const { userId } = await auth();
  if (!userId) {
    redirect(LOGIN_REDIRECT_URL);
  }

  const db = await getDb();

  // Verify user has access to the photo through the team
  const photo = await getPhoto(photoId, userId, db);

  if (!photo) {
    return {
      success: false,
      error: 'Photo not found or you do not have access',
    };
  }

  try {
    // Soft delete photo record
    const result = await db
      .prepare(
        "UPDATE photos SET deletedAt = datetime('now'), updatedAt = datetime('now') WHERE id = ? AND deletedAt IS NULL"
      )
      .bind(photoId)
      .run();

    if (!result.success) {
      return { success: false, error: 'Failed to delete photo' };
    }

    // We can't revalidate specific paths here without knowing the team ID
    // The caller should handle revalidation based on their needs
    return { success: true };
  } catch (error) {
    console.error('Error deleting photo:', error);
    return { success: false, error: 'Failed to delete photo' };
  }
}

// Move photo to a log
export async function movePhotoToLog(
  userId: string,
  photoId: string,
  logId: string | null,
  dbParam?: D1Database
): Promise<PhotoOperationResponse> {
  const db = dbParam || (await getDb());

  // Verify user has access to the photo through the team
  const photo = await getPhoto(photoId, userId, db);

  if (!photo) {
    return {
      success: false,
      error: 'Photo not found or you do not have access',
    };
  }

  // If moving to a log (not unassigned), verify user has access to the log
  if (logId) {
    const log = await db
      .prepare(
        `SELECT l.* FROM logs l
         JOIN team_memberships tm ON l.teamId = tm.teamId
         WHERE l.id = ? AND tm.userId = ? AND l.deletedAt IS NULL`
      )
      .bind(logId, userId)
      .first();

    if (!log) {
      return {
        success: false,
        error: 'Log not found or you do not have access',
      };
    }
  }

  try {
    // Update photo's logId
    const result = await db
      .prepare(
        "UPDATE photos SET logId = ?, updatedAt = datetime('now') WHERE id = ?"
      )
      .bind(logId, photoId)
      .run();

    if (!result.success) {
      return { success: false, error: 'Failed to move photo' };
    }

    // No path revalidation here, as we don't know what paths to revalidate
    // The caller should handle revalidation

    return { success: true };
  } catch (error) {
    console.error('Error moving photo:', error);
    return { success: false, error: 'Failed to move photo' };
  }
}

// Utility function to generate signed URLs for image IDs
export async function getSignedImageUrl(
  imageId?: string,
  variant: string = 'public'
): Promise<string> {
  try {
    const env = process.env as any;
    const accountHash = env.CLOUDFLARE_ACCOUNT_HASH;
    const cfImagesKey = env.CLOUDFLARE_IMAGES_KEY;

    if (!accountHash || !cfImagesKey || !imageId) {
      return '';
    }

    // Create signed URL that expires in 1 hour
    const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiration

    // Properly format the URL for Cloudflare Images with the requested variant
    const imageUrl = new URL(
      `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`
    );
    imageUrl.searchParams.set('exp', expiry.toString());

    // Create the string to sign (pathname + query params)
    const stringToSign =
      imageUrl.pathname + '?' + imageUrl.searchParams.toString();

    // Generate signature using HMAC SHA-256
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(cfImagesKey);
    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const mac = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(stringToSign)
    );

    const sig = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Add the signature to the URL
    imageUrl.searchParams.set('sig', sig);
    return imageUrl.toString();
  } catch (error) {
    console.error('Error creating signed image URL:', error);
    return '';
  }
}

// Get all photos for a team
export async function getTeamPhotos(
  teamId: string,
  userId: string,
  dbParam?: D1Database
) {
  const db = dbParam || (await getDb());

  const photos = await db
    .prepare(
      `SELECT p.* FROM photos p
      JOIN team_memberships tm ON p.teamId = tm.teamId
      WHERE p.teamId = ? 
        AND tm.userId = ? 
        AND p.deletedAt IS NULL 
      ORDER BY p.updatedAt DESC`
    )
    .bind(teamId, userId)
    .all();

  return photos.results as Photo[];
}

// Get photos for a specific log
export async function getLogPhotos(
  logId: string,
  userId: string,
  dbParam?: D1Database
) {
  const db = dbParam || (await getDb());

  const photos = await db
    .prepare(
      `SELECT p.* FROM photos p
      JOIN team_memberships tm ON p.teamId = tm.teamId
      WHERE p.logId = ? 
        AND tm.userId = ? 
        AND p.deletedAt IS NULL 
      ORDER BY p.updatedAt DESC`
    )
    .bind(logId, userId)
    .all();

  return photos.results as Photo[];
}

export async function generatePhotosWithUrls(
  photos: Photo[]
): Promise<(Photo & { url: string })[]> {
  return Promise.all(
    photos.map(async (photo: Photo) => {
      let url = '';
      if (photo.imageId) {
        url = await getSignedImageUrl(photo.imageId);
      }
      return { ...photo, url };
    })
  );
}

export async function getSignedUrlWithPermissionCheck(
  photoId: string,
  userId: string,
  variant: string = 'public'
): Promise<PhotoUrlResponse> {
  // Get the photo to verify permissions
  const photo = await getPhoto(photoId, userId);
  if (!photo) {
    return { error: 'Photo not found' };
  }

  // Get signed URL
  if (!photo.imageId) {
    return { error: 'Photo has no associated image' };
  }

  const url = await getSignedImageUrl(photo.imageId, variant);
  return { url };
}
