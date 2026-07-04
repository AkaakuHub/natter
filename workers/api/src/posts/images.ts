import type { Env } from "../env";
import { HttpError } from "../http";
import {
  createMosaicImage,
  mosaicImageFilename,
} from "../images/mosaic";

const MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024;

export async function savePostImages(
  env: Env,
  values: Array<File | string>,
): Promise<string[]> {
  const images: string[] = [];
  for (const value of values) {
    if (!(value instanceof File)) {
      throw new HttpError(400, "images must be files");
    }
    if (!isSupportedPostImageType(value.type)) {
      throw new HttpError(400, "Only PNG and JPEG images are allowed");
    }
    if (value.size > MAX_POST_IMAGE_BYTES) {
      throw new HttpError(400, "File size exceeds 10MB limit");
    }
    const filename = `images-${Date.now()}-${crypto.randomUUID()}${extensionForFile(value)}`;
    const imageData = await value.arrayBuffer();
    const mosaic = createMosaicImage({
      data: imageData,
      contentType: value.type,
    });
    await env.ASSETS.put(mosaicImageFilename(filename), mosaic.body, {
      httpMetadata: {
        contentType: mosaic.contentType,
      },
    });
    await env.ASSETS.put(filename, imageData, {
      httpMetadata: {
        contentType: value.type,
      },
    });
    images.push(filename);
  }
  return images;
}

function extensionForFile(file: File): string {
  const nameExtension = /\.[a-zA-Z0-9]+$/.exec(file.name)?.[0];
  if (nameExtension) {
    return nameExtension.toLowerCase();
  }
  if (file.type === "image/jpeg") {
    return ".jpg";
  }
  if (file.type === "image/png") {
    return ".png";
  }
  if (file.type === "image/gif") {
    return ".gif";
  }
  if (file.type === "image/webp") {
    return ".webp";
  }
  if (file.type === "image/avif") {
    return ".avif";
  }
  throw new HttpError(400, "Unsupported image type");
}

function isSupportedPostImageType(contentType: string): boolean {
  return contentType === "image/png" || contentType === "image/jpeg";
}
