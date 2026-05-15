import { getEnvValue } from "@/lib/cloudflare-runtime";

export type TrackingConfig = {
  gaMeasurementId: string | null;
  googleAdsId: string | null;
  metaPixelId: string | null;
};

export async function getTrackingConfig(): Promise<TrackingConfig> {
  return {
    gaMeasurementId: sanitizeTrackingId(
      await getEnvValue("GA_MEASUREMENT_ID")
        ?? await getEnvValue("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
    ),
    googleAdsId: sanitizeTrackingId(
      await getEnvValue("GOOGLE_ADS_ID")
        ?? await getEnvValue("NEXT_PUBLIC_GOOGLE_ADS_ID"),
    ),
    metaPixelId: sanitizeTrackingId(
      await getEnvValue("META_PIXEL_ID")
        ?? await getEnvValue("NEXT_PUBLIC_META_PIXEL_ID"),
    ),
  };
}

function sanitizeTrackingId(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
