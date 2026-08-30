export type AssetType = "IMAGE" | "CAROUSEL" | "VIDEO";

export type StoredPreviewInput = {
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  position: number;
};

export type ReviewFeedbackInput = {
  type: "GENERAL" | "TIMECODE" | "CAROUSEL_ITEM";
  body: string;
  timestampMs?: number | null;
  carouselPosition?: number | null;
};
