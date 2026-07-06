const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_EDGE = 10_000;
const MAX_CANVAS_PIXELS = 4096 * 4096;
const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_EXTENSION = ".jpg";
const OUTPUT_QUALITIES = [0.9, 0.82, 0.72, 0.62] as const;

export type ImageSize = {
  width: number;
  height: number;
};

export async function normalizePostImages(files: File[]): Promise<File[]> {
  const normalizedFiles: File[] = [];
  for (const file of files) {
    normalizedFiles.push(await normalizePostImage(file));
  }
  return normalizedFiles;
}

export async function appendNormalizedImages(
  formData: FormData,
  files: File[],
): Promise<void> {
  const normalizedFiles = await normalizePostImages(files);
  normalizedFiles.forEach((file) => {
    formData.append("images", file);
  });
}

async function normalizePostImage(file: File): Promise<File> {
  const sourceBlob = isHeicImage(file)
    ? await convertHeicToJpegBlob(file)
    : file;
  const image = await decodeImage(sourceBlob);
  const jpegBlob = await drawImageToJpegBlob(image);
  const normalizedFile = new File([jpegBlob], normalizedFilename(file.name), {
    type: OUTPUT_TYPE,
    lastModified: file.lastModified,
  });
  assertImageSize(normalizedFile);
  return normalizedFile;
}

function isHeicImage(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

async function convertHeicToJpegBlob(file: File): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: OUTPUT_TYPE,
    quality: OUTPUT_QUALITIES[0],
  });
  return Array.isArray(converted) ? converted[0] : converted;
}

async function decodeImage(
  blob: Blob,
): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    return createImageBitmap(blob);
  }
  return loadImageElement(blob);
}

async function loadImageElement(blob: Blob): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function drawImageToJpegBlob(
  image: ImageBitmap | HTMLImageElement,
): Promise<Blob> {
  const size = normalizedPostImageSize(image.width, image.height);
  try {
    return await drawImageWithSizeToJpegBlob(image, size);
  } finally {
    if ("close" in image) {
      image.close();
    }
  }
}

async function drawImageWithSizeToJpegBlob(
  image: ImageBitmap | HTMLImageElement,
  size: ImageSize,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) {
    releaseCanvas(canvas);
    throw new Error("この端末では画像を安全に変換できません");
  }
  context.drawImage(image, 0, 0, size.width, size.height);

  try {
    for (const quality of OUTPUT_QUALITIES) {
      const blob = await canvasToBlob(canvas, quality);
      if (blob.size <= MAX_IMAGE_BYTES) {
        return blob;
      }
    }
    throw new Error("画像変換後のファイルサイズが10MBを超えています");
  } finally {
    releaseCanvas(canvas);
  }
}

export function normalizedPostImageSize(
  width: number,
  height: number,
): ImageSize {
  if (width <= 0 || height <= 0) {
    throw new Error("画像の寸法を取得できませんでした");
  }

  const edgeScale = Math.min(1, MAX_IMAGE_EDGE / Math.max(width, height));
  const pixelScale = Math.min(
    1,
    Math.sqrt(MAX_CANVAS_PIXELS / (width * height)),
  );
  const scale = Math.min(edgeScale, pixelScale);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("画像の変換に失敗しました"));
          return;
        }
        resolve(blob);
      },
      OUTPUT_TYPE,
      quality,
    );
  });
}

function normalizedFilename(filename: string): string {
  const basename = filename.replace(/\.[^.]+$/, "");
  return `${basename || "image"}${OUTPUT_EXTENSION}`;
}

function assertImageSize(file: File): void {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`ファイル"${file.name}"は10MBを超えています`);
  }
}
