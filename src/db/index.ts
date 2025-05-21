import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Gets the D1 database instance directly from Cloudflare context
 */
export async function getDb() {
  const { env } = await getCloudflareContext();
  return env.HUB_DB;
}
