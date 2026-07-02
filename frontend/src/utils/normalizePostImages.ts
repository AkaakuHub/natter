const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_EXTENSION = ".jpg";
const OUTPUT_QUALITIES = [0.9, 0.82, 0.72] as const;

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
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("画像の変換に失敗しました");
  }
  context.drawImage(image, 0, 0);
  if ("close" in image) {
    image.close();
  }

  for (const quality of OUTPUT_QUALITIES) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= MAX_IMAGE_BYTES) {
      return blob;
    }
  }
  throw new Error("画像変換後のファイルサイズが10MBを超えています");
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
