const COMPANY_LOGO_OUTPUT_SIZE = 512;
const COMPANY_LOGO_OUTPUT_TYPE = "image/png";

function squareLogoFileName(file: File) {
  const baseName = file.name.replace(/\.[^.]+$/, "").trim() || "company-logo";
  return `${baseName}-square.png`;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve(image);
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Logotypen kunde inte läsas in."));
    });

    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Logotypen kunde inte göras kvadratisk."));
    }, COMPANY_LOGO_OUTPUT_TYPE);
  });
}

export async function createSquareCompanyLogoFile(file: File): Promise<File> {
  const image = await loadImage(file);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Logotypen saknar giltiga bildmått.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = COMPANY_LOGO_OUTPUT_SIZE;
  canvas.height = COMPANY_LOGO_OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas kunde inte startas.");
  }

  const scale = Math.min(
    COMPANY_LOGO_OUTPUT_SIZE / sourceWidth,
    COMPANY_LOGO_OUTPUT_SIZE / sourceHeight
  );
  const drawWidth = Math.round(sourceWidth * scale);
  const drawHeight = Math.round(sourceHeight * scale);
  const drawX = Math.round((COMPANY_LOGO_OUTPUT_SIZE - drawWidth) / 2);
  const drawY = Math.round((COMPANY_LOGO_OUTPUT_SIZE - drawHeight) / 2);

  context.clearRect(0, 0, COMPANY_LOGO_OUTPUT_SIZE, COMPANY_LOGO_OUTPUT_SIZE);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const blob = await canvasToBlob(canvas);

  return new File([blob], squareLogoFileName(file), {
    type: COMPANY_LOGO_OUTPUT_TYPE,
    lastModified: Date.now(),
  });
}
