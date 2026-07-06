import type { Env } from "../env";
import { HttpError } from "../http";
import { createMosaicImage, mosaicImageFilename } from "../images/mosaic";

const MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_POST_IMAGE_PIXELS = 4096 * 4096;

export async function savePostImages(
  env: Env,
  values: Array<File | string>,
): Promise<string[]> {
  const images: string[] = [];
  for (const value of values) {
    if (!(value instanceof File)) {
      throw new HttpError(400, "images must be files");
    }
    if (value.size > MAX_POST_IMAGE_BYTES) {
      throw new HttpError(413, "File size exceeds 10MB limit");
    }
    const imageData = await value.arrayBuffer();
    const imageType = detectSupportedImageType(imageData);
    const dimensions = readImageDimensions(imageData, imageType);
    assertImageDimensions(dimensions);
    const filename = `images-${Date.now()}-${crypto.randomUUID()}${extensionForImageType(imageType)}`;
    const mosaic = createPostImageMosaic(imageData, imageType);
    await env.ASSETS.put(mosaicImageFilename(filename), mosaic.body, {
      httpMetadata: {
        contentType: mosaic.contentType,
      },
    });
    await env.ASSETS.put(filename, imageData, {
      httpMetadata: {
        contentType: imageType,
      },
    });
    images.push(filename);
  }
  return images;
}

type SupportedPostImageType = "image/jpeg" | "image/png";

type ImageDimensions = {
  width: number;
  height: number;
};

function extensionForImageType(contentType: SupportedPostImageType): string {
  if (contentType === "image/jpeg") {
    return ".jpg";
  }
  return ".png";
}

function detectSupportedImageType(data: ArrayBuffer): SupportedPostImageType {
  const bytes = new Uint8Array(data);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  throw new HttpError(400, "Only PNG and JPEG images are allowed");
}

function readImageDimensions(
  data: ArrayBuffer,
  contentType: SupportedPostImageType,
): ImageDimensions {
  if (contentType === "image/png") {
    return readPngDimensions(data);
  }
  return readJpegDimensions(data);
}

function readPngDimensions(data: ArrayBuffer): ImageDimensions {
  const view = new DataView(data);
  if (view.byteLength < 24) {
    throw new HttpError(400, "Invalid PNG image");
  }
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
  };
}

function readJpegDimensions(data: ArrayBuffer): ImageDimensions {
  const view = new DataView(data);
  let offset = 2;

  while (offset + 9 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      throw new HttpError(400, "Invalid JPEG image");
    }

    const marker = view.getUint8(offset + 1);
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) {
      continue;
    }
    if (marker >= 0xd0 && marker <= 0xd7) {
      continue;
    }

    const segmentLength = view.getUint16(offset);
    if (segmentLength < 2 || offset + segmentLength > view.byteLength) {
      throw new HttpError(400, "Invalid JPEG image");
    }

    if (isJpegStartOfFrame(marker)) {
      if (segmentLength < 7) {
        throw new HttpError(400, "Invalid JPEG image");
      }
      return {
        height: view.getUint16(offset + 3),
        width: view.getUint16(offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new HttpError(400, "Invalid JPEG image");
}

function isJpegStartOfFrame(marker: number): boolean {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  );
}

function assertImageDimensions(dimensions: ImageDimensions): void {
  if (dimensions.width < 1 || dimensions.height < 1) {
    throw new HttpError(400, "Invalid image dimensions");
  }
  if (dimensions.width * dimensions.height > MAX_POST_IMAGE_PIXELS) {
    throw new HttpError(413, "Image dimensions exceed safe pixel limit");
  }
}

function createPostImageMosaic(
  data: ArrayBuffer,
  contentType: SupportedPostImageType,
) {
  try {
    return createMosaicImage({
      data,
      contentType,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(400, "Invalid image data");
  }
}
