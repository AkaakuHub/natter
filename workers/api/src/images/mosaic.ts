import { decode as decodePng, encode as encodePng, type DecodedPng } from "fast-png";
import { decode as decodeJpeg } from "jpeg-js";
import { HttpError } from "../http";

const BLOCKS_PER_ROW = 4;
const BLOCKS_PER_COLUMN = 4;
const RGBA_CHANNELS = 4;

type DecodedRgbaImage = {
  width: number;
  height: number;
  rgba: Uint8Array;
};

export async function createMosaicImageResponse(input: {
  object: R2ObjectBody;
  contentType: string;
}): Promise<Response> {
  const image = decodeImage(await input.object.arrayBuffer(), input.contentType);
  const mosaic = applyAverageColorMosaic(image.rgba, image.width, image.height);
  const png = encodePng({
    width: image.width,
    height: image.height,
    data: mosaic,
    channels: RGBA_CHANNELS,
    depth: 8,
  });
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

function decodeImage(data: ArrayBuffer, contentType: string): DecodedRgbaImage {
  const bytes = new Uint8Array(data);
  if (contentType === "image/png") {
    return decodePngImage(bytes);
  }
  if (contentType === "image/jpeg") {
    const decoded = decodeJpeg(bytes, {
      formatAsRGBA: true,
      tolerantDecoding: true,
      useTArray: true,
    });
    if (!(decoded.data instanceof Uint8Array)) {
      throw new HttpError(500, "Decoded JPEG data is invalid");
    }
    return {
      width: decoded.width,
      height: decoded.height,
      rgba: decoded.data,
    };
  }
  throw new HttpError(415, "Unsupported image type for mosaic");
}

function decodePngImage(bytes: Uint8Array): DecodedRgbaImage {
  const decoded = decodePng(bytes);
  return {
    width: decoded.width,
    height: decoded.height,
    rgba: pngToRgba(decoded),
  };
}

function pngToRgba(decoded: DecodedPng): Uint8Array {
  if (decoded.depth !== 8 && decoded.depth !== 16) {
    throw new HttpError(415, "Unsupported PNG bit depth");
  }
  if (decoded.channels < 1 || decoded.channels > 4) {
    throw new HttpError(415, "Unsupported PNG channel count");
  }

  const pixelCount = decoded.width * decoded.height;
  const rgba = new Uint8Array(pixelCount * RGBA_CHANNELS);
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex++) {
    const sourceIndex = pixelIndex * decoded.channels;
    const targetIndex = pixelIndex * RGBA_CHANNELS;
    if (decoded.channels === 1) {
      const gray = channelValue(decoded.data, sourceIndex);
      rgba[targetIndex] = gray;
      rgba[targetIndex + 1] = gray;
      rgba[targetIndex + 2] = gray;
      rgba[targetIndex + 3] = 255;
      continue;
    }
    if (decoded.channels === 2) {
      const gray = channelValue(decoded.data, sourceIndex);
      rgba[targetIndex] = gray;
      rgba[targetIndex + 1] = gray;
      rgba[targetIndex + 2] = gray;
      rgba[targetIndex + 3] = channelValue(decoded.data, sourceIndex + 1);
      continue;
    }
    rgba[targetIndex] = channelValue(decoded.data, sourceIndex);
    rgba[targetIndex + 1] = channelValue(decoded.data, sourceIndex + 1);
    rgba[targetIndex + 2] = channelValue(decoded.data, sourceIndex + 2);
    rgba[targetIndex + 3] =
      decoded.channels === 4 ? channelValue(decoded.data, sourceIndex + 3) : 255;
  }
  return rgba;
}

function channelValue(data: DecodedPng["data"], index: number): number {
  const value = data[index] ?? 0;
  return data instanceof Uint16Array ? Math.floor(value / 257) : value;
}

function applyAverageColorMosaic(
  data: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const output = new Uint8Array(data.length);
  const blockWidth = Math.max(1, Math.floor(width / BLOCKS_PER_ROW));
  const blockHeight = Math.max(1, Math.floor(height / BLOCKS_PER_COLUMN));

  for (let blockY = 0; blockY < BLOCKS_PER_COLUMN; blockY++) {
    for (let blockX = 0; blockX < BLOCKS_PER_ROW; blockX++) {
      const startX = blockX * blockWidth;
      const startY = blockY * blockHeight;
      const endX =
        blockX === BLOCKS_PER_ROW - 1
          ? width
          : Math.min(startX + blockWidth, width);
      const endY =
        blockY === BLOCKS_PER_COLUMN - 1
          ? height
          : Math.min(startY + blockHeight, height);
      fillAverageColorBlock(data, output, width, startX, startY, endX, endY);
    }
  }

  return output;
}

function fillAverageColorBlock(
  source: Uint8Array,
  target: Uint8Array,
  width: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): void {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalA = 0;
  let pixelCount = 0;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (y * width + x) * RGBA_CHANNELS;
      totalR += source[index] ?? 0;
      totalG += source[index + 1] ?? 0;
      totalB += source[index + 2] ?? 0;
      totalA += source[index + 3] ?? 255;
      pixelCount++;
    }
  }

  const averageR = Math.floor(totalR / pixelCount);
  const averageG = Math.floor(totalG / pixelCount);
  const averageB = Math.floor(totalB / pixelCount);
  const averageA = Math.floor(totalA / pixelCount);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (y * width + x) * RGBA_CHANNELS;
      target[index] = averageR;
      target[index + 1] = averageG;
      target[index + 2] = averageB;
      target[index + 3] = averageA;
    }
  }
}
