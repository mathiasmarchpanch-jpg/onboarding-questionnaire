import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { onboardingSubmissions } from "../db/schema.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const client = postgres(connectionString, {
  ssl: "require",
});

const db = drizzle(client);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Méthode non autorisée",
    });
  }

  try {
    const body = req.body;

    const inserted = await db
      .insert(onboardingSubmissions)
      .values({
        prenom: body.prenom,
        nom: body.nom,
        email: body.email,
        telephone: body.telephone,
        poste: body.poste,
        entreprise: body.entreprise,

        activitePrincipale: body.activitePrincipale,
        offre: body.offre,
        differenciateur: body.differenciateur,

        objectifLinkedin: body.objectifLinkedin,
        ciblePrecise: body.ciblePrecise,
        problemesCible: body.problemesCible,

        aimeProfil: body.aimeProfil,
        changeProfil: body.changeProfil,

        imageRenvoyer: body.imageRenvoyer,
        elementsBanniere: body.elementsBanniere,
        couleurs: body.couleurs,
        motsCles: body.motsCles,

        profilsLinkedin: body.profilsLinkedin || null,
        avisClient: body.avisClient,
        siteWeb: body.siteWeb || null,
        police: body.police || null,
        signeRecurrent: body.signeRecurrent || null,

        refus: body.refus,
        obligatoires: body.obligatoires,
        autres: body.autres || null,

        photosUrls: body.photosUrls || [],
        logoUrls: body.logoUrls || [],
      })
      .returning();

    const submission = inserted[0];

    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: submission.id,
          createdAt: submission.createdAt,

          prenom: body.prenom,
          nom: body.nom,
          nomComplet: `${body.prenom} ${body.nom}`,

          email: body.email,
          telephone: body.telephone,
          poste: body.poste,
          entreprise: body.entreprise,

          activitePrincipale: body.activitePrincipale,
          offre: body.offre,
          differenciateur: body.differenciateur,

          objectifLinkedin: body.objectifLinkedin,
          ciblePrecise: body.ciblePrecise,
          problemesCible: body.problemesCible,

          aimeProfil: body.aimeProfil,
          changeProfil: body.changeProfil,

          imageRenvoyer: body.imageRenvoyer,
          elementsBanniere: body.elementsBanniere,
          couleurs: body.couleurs,
          motsCles: body.motsCles,

          profilsLinkedin: body.profilsLinkedin || "",
          avisClient: body.avisClient,
          siteWeb: body.siteWeb || "",
          police: body.police || "",
          signeRecurrent: body.signeRecurrent || "",

          refus: body.refus,
          obligatoires: body.obligatoires,
          autres: body.autres || "",

          photosUrls: body.photosUrls || [],
          logoUrls: body.logoUrls || [],
        }),
      });
    }

    return res.status(200).json({
      ok: true,
      id: submission.id,
    });
  } catch (error) {
    console.error("Erreur API /api/submit :", error);

    return res.status(500).json({
      ok: false,
      error: "Erreur pendant l'envoi du questionnaire",
    });
  }
}