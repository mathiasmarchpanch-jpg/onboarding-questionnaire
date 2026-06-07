import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Méthode non autorisée",
    });
  }

  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
          ],
          maximumSizeInBytes: 20 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            pathname,
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Blob upload completed:", blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Erreur handleUpload:", error);

    return res.status(500).json({
      ok: false,
      error: "Erreur pendant la préparation de l'upload Blob",
    });
  }
}