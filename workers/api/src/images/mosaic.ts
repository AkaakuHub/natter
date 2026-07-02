import { HttpError } from "../http";

const BLOCKS_PER_ROW = 4;
const BLOCKS_PER_COLUMN = 4;
const RGBA_CHANNELS = 4;

export async function createMosaicImageResponse(input: {
  images: ImagesBinding;
  object: R2ObjectBody;
}): Promise<Response> {
  const [infoStream, imageStream] = input.object.body.tee();
  const info = await input.images.info(infoStream);
  if (!("width" in info) || !("height" in info)) {
    throw new HttpError(500, "Image dimensions are missing");
  }

  const rgbaStream = await input.images
    .input(imageStream)
    .output({ format: "rgba", anim: false })
    .then((result) => result.image());
  const rgba = await readStream(rgbaStream);
  const expectedLength = info.width * info.height * RGBA_CHANNELS;
  if (rgba.length !== expectedLength) {
    throw new HttpError(500, "Decoded image size is invalid");
  }

  const mosaic = applyAverageColorMosaic(rgba, info.width, info.height);
  const png = await encodeRgbaPng(mosaic, info.width, info.height);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
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

async function encodeRgbaPng(
  rgba: Uint8Array,
  width: number,
  height: number,
): Promise<Uint8Array> {
  const scanlineLength = width * RGBA_CHANNELS + 1;
  const scanlines = new Uint8Array(scanlineLength * height);
  for (let y = 0; y < height; y++) {
    const sourceStart = y * width * RGBA_CHANNELS;
    const targetStart = y * scanlineLength;
    scanlines[targetStart] = 0;
    scanlines.set(
      rgba.subarray(sourceStart, sourceStart + width * RGBA_CHANNELS),
      targetStart + 1,
    );
  }

  const compressed = await deflate(scanlines);
  return concatBytes([
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdrData(width, height)),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", new Uint8Array()),
  ]);
}

function ihdrData(width: number, height: number): Uint8Array {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return data;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(concatBytes([typeBytes, data])));
  return chunk;
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(
    new CompressionStream("deflate"),
  );
  return readStream(stream);
}

async function readStream(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let length = 0;
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    length += value.length;
  }
  return concatBytes(chunks, length);
}

function concatBytes(chunks: Uint8Array[], knownLength?: number): Uint8Array {
  const length =
    knownLength ?? chunks.reduce((total, chunk) => total + chunk.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = new Uint32Array(
  Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    return value >>> 0;
  }),
);
