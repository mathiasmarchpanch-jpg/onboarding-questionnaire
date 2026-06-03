import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const onboardingSubmissions = pgTable("onboarding_submissions", {
  id: serial("id").primaryKey(),

  prenom: text("prenom"),
  nom: text("nom"),
  email: text("email"),
  telephone: text("telephone"),
  poste: text("poste"),
  entreprise: text("entreprise"),

  activitePrincipale: text("activite_principale"),
  offre: text("offre"),
  differenciateur: text("differenciateur"),

  objectifLinkedin: text("objectif_linkedin"),
  ciblePrecise: text("cible_precise"),
  problemesCible: text("problemes_cible"),

  aimeProfil: text("aime_profil"),
  changeProfil: text("change_profil"),

  imageRenvoyer: text("image_renvoyer"),
  elementsBanniere: text("elements_banniere"),
  couleurs: text("couleurs"),
  motsCles: text("mots_cles"),

  profilsLinkedin: text("profils_linkedin"),
  avisClient: text("avis_client"),
  siteWeb: text("site_web"),
  police: text("police"),
  signeRecurrent: text("signe_recurrent"),

  refus: text("refus"),
  obligatoires: text("obligatoires"),
  autres: text("autres"),

  photosUrls: jsonb("photos_urls").$type<string[]>().default([]),
  logoUrls: jsonb("logo_urls").$type<string[]>().default([]),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});