import { GetObjectCommand } from "@aws-sdk/client-s3";
import { type Response } from "express";
import PDFDocument from "pdfkit";
import { chromium } from "playwright";
import sharp from "sharp";
import { Readable } from "stream";
import { getBucketName, getS3Client } from "../s3-image-module";
import { ApiError } from "../utils/ApiError";
import CatalogoImage from "../models/CatalogoImage";
import { getCatalogoById } from "./catalogosService";
import { logger } from "../utils/logger";

type PdfDoc = InstanceType<typeof PDFDocument>;

type ImageDimensions = {
  width: number;
  height: number;
};

function extractS3Key(url: string): string | null {
  const marker = ".com/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return url.slice(index + marker.length);
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function fetchImageBuffer(key: string): Promise<Buffer | null> {
  try {
    const s3Client = getS3Client();
    const bucketName = getBucketName();
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );

    const body = response.Body;
    if (!body || !(body instanceof Readable)) {
      return null;
    }

    return await streamToBuffer(body);
  } catch {
    return null;
  }
}

async function toPdfImageBuffer(buffer: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buffer).png().toBuffer();
  } catch {
    return null;
  }
}

async function getImageDimensions(buffer: Buffer): Promise<ImageDimensions | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return null;
    }
    return { width: metadata.width, height: metadata.height };
  } catch {
    return null;
  }
}

export async function generateCatalogoPdf(userId: string, catalogoId: string, res: Response): Promise<void> {
  let doc: PdfDoc | null = null;

  try {
    logger.info("[catalogos] pdf: start", { userId, catalogoId });
    const catalogo = await getCatalogoById(userId, catalogoId);
    const images = await CatalogoImage.findAll({
      where: { catalogId: catalogo.id },
      order: [["sortOrder", "ASC"], ["createdAt", "ASC"]]
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"catalogo-${catalogo.id}.pdf\"`);

    doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.on("error", (err) => {
      logger.error("[catalogos] pdf: stream error", { userId, catalogoId });
      if (!res.headersSent) {
        throw err;
      }
      try {
        res.end();
      } catch {
        // ignore
      }
    });
    doc.pipe(res);

    doc.fontSize(20).text("Catalogo", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`ID: ${catalogo.id}`);
    doc.text(`Titulo: ${catalogo.title}`);
    doc.text(`Descripcion: ${catalogo.description ?? "-"}`);
    doc.text(`Publicado: ${catalogo.isPublished ? "Si" : "No"}`);
    doc.text(`Color de fondo: ${catalogo.backgroundColor ?? "-"}`);
    doc.text(`Color de componente: ${catalogo.componentColor ?? "-"}`);
    doc.text(`Logo URL: ${catalogo.logoUrl ?? "-"}`);

    doc.moveDown();
    doc.fontSize(16).text("Imagenes");

    if (images.length === 0) {
      doc.fontSize(12).text("Sin imagenes");
      doc.end();
      logger.info("[catalogos] pdf: done", { userId, catalogoId });
      return;
    }

    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const maxWidth = Math.min(500, contentWidth);
    const maxHeight = 400;

    for (let i = 0; i < images.length; i += 1) {
      const image = images[i];
      const key = extractS3Key(image.imageUrl);
      if (!key) {
        doc.fontSize(12).text(`${i + 1}. ${image.imageUrl}`);
        continue;
      }

      const buffer = await fetchImageBuffer(key);
      if (!buffer) {
        doc.fontSize(12).text(`${i + 1}. ${image.imageUrl}`);
        continue;
      }

      const pngBuffer = await toPdfImageBuffer(buffer);
      if (!pngBuffer) {
        doc.fontSize(12).text(`${i + 1}. ${image.imageUrl}`);
        continue;
      }

      const dimensions = await getImageDimensions(pngBuffer);
      if (!dimensions) {
        doc.fontSize(12).text(`${i + 1}. ${image.imageUrl}`);
        continue;
      }

      const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height, 1);
      const displayWidth = Math.round(dimensions.width * scale);
      const displayHeight = Math.round(dimensions.height * scale);

      const requiredHeight = displayHeight + 30;
      const bottomLimit = doc.page.height - doc.page.margins.bottom;
      if (doc.y + requiredHeight > bottomLimit) {
        doc.addPage();
      }

      doc.moveDown(0.5);
      doc.fontSize(12).text(`${i + 1}. ${image.imageUrl}`);

      const x = doc.page.margins.left + (contentWidth - displayWidth) / 2;
      const y = doc.y;
      doc.image(pngBuffer, x, y, { width: displayWidth, height: displayHeight });
      doc.y = y + displayHeight + 10;
    }

    doc.end();
    logger.info("[catalogos] pdf: done", { userId, catalogoId });
  } catch (error) {
    logger.error("[catalogos] pdf: error", { userId, catalogoId });
    if (res.headersSent) {
      try {
        doc?.end();
      } catch {
        // ignore
      }
      return;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Error al generar PDF");
  }
}

export async function generateCatalogoPdfFromHtml(
  userId: string,
  catalogoId: string,
  html: string,
  res: Response
): Promise<void> {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

  try {
    logger.info("[catalogos] pdf html: start", { userId, catalogoId });
    const catalogo = await getCatalogoById(userId, catalogoId);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "screen" });
    await page.evaluateHandle("document.fonts.ready");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" }
    });

    await page.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"catalogo-${catalogo.id}.pdf\"`);
    res.send(pdfBuffer);
    logger.info("[catalogos] pdf html: done", { userId, catalogoId });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("[catalogos] pdf html: error", {
        userId,
        catalogoId,
        message: error.message,
        stack: error.stack
      });
    } else {
      logger.error("[catalogos] pdf html: error", { userId, catalogoId, error });
    }
    if (res.headersSent) {
      try {
        res.end();
      } catch {
        // ignore
      }
      return;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Error al generar PDF");
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
  }
}
