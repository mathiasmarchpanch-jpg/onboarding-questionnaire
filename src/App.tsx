"use client";

import { upload } from "@vercel/blob/client";
import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  poste: string;
  entreprise: string;
  activitePrincipale: string;
  offre: string;
  differenciateur: string;
  objectifLinkedin: string;
  ciblePrecise: string;
  problemesCible: string;
  aimeProfil: string;
  changeProfil: string;
  imageRenvoyer: string;
  elementsBanniere: string;
  couleurs: string;
  motsCles: string;
  profilsLinkedin: string;
  avisClient: string;
  siteWeb: string;
  police: string;
  signeRecurrent: string;
  refus: string;
  obligatoires: string;
  autres: string;
};

type UploadedFile = {
  file: File;
  name: string;
  size: number;
  preview?: string;
};

const STEPS = [
  { id: 1, label: "Infos" },
  { id: 2, label: "Positionnement" },
  { id: 3, label: "Objectif & Cible" },
  { id: 4, label: "Profil actuel" },
  { id: 5, label: "Image & Contenu" },
  { id: 6, label: "Références" },
  { id: 7, label: "Contraintes" },
];

export default function QuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [logos, setLogos] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({ mode: "onBlur" });

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["prenom", "nom", "email", "telephone", "poste", "entreprise"],
    2: ["activitePrincipale", "offre", "differenciateur"],
    3: ["objectifLinkedin", "ciblePrecise", "problemesCible"],
    4: ["aimeProfil", "changeProfil"],
    5: ["imageRenvoyer", "elementsBanniere", "couleurs", "motsCles"],
    6: ["avisClient"],
    7: ["refus", "obligatoires"],
  };

  const handleNext = async () => {
    const fields = stepFields[currentStep];
    const valid = await trigger(fields);
    if (valid) {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = useCallback(
  (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
    current: UploadedFile[]
  ) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - current.length;

    const toAdd = files.slice(0, remaining).map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      preview: f.type.startsWith("image/")
        ? URL.createObjectURL(f)
        : undefined,
    }));

    setter((prev) => [...prev, ...toAdd]);
  },
  []
);

  const removeFile = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

const onSubmit = async (data: FormData) => {
  setSubmitting(true);
  setSubmitError("");

  try {
    const photosUrls: string[] = [];
    const logoUrls: string[] = [];

    // 1. Upload direct des photos/documents vers Vercel Blob
    for (const item of photos) {
      const blob = await upload(
        `onboarding/photos/${Date.now()}-${item.name}`,
        item.file,
        {
          access: "public",
          handleUploadUrl: "/api/blob",
        }
      );

      photosUrls.push(blob.url);
    }

    // 2. Upload direct des logos vers Vercel Blob
    for (const item of logos) {
      const blob = await upload(
        `onboarding/logos/${Date.now()}-${item.name}`,
        item.file,
        {
          access: "public",
          handleUploadUrl: "/api/blob",
        }
      );

      logoUrls.push(blob.url);
    }

    // 3. Envoi des réponses + liens des fichiers à /api/submit
    const payload = {
      ...data,
      photosUrls,
      logoUrls,
    };

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur submit : ${errorText}`);
    }

    setSubmitted(true);
  } catch (err) {
    console.error(err);

    setSubmitError(
      err instanceof Error
        ? err.message
        : "Une erreur est survenue. Veuillez réessayer ou me contacter directement."
    );
  } finally {
    setSubmitting(false);
  }
};

  if (submitted) {
    return <SuccessPage />;
  }

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
      {/* Header */}
      <header
        style={{
          background: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid rgba(59,130,246,0.12)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "700",
                color: "white",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              A
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#111827",
                  fontFamily: "Space Grotesk, sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                Autorité Signal™
              </div>
              <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                Questionnaire Onboarding
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#6B7280",
              fontWeight: "500",
            }}
          >
            Étape{" "}
            <span style={{ color: "#2563EB", fontWeight: "700" }}>
              {currentStep}
            </span>{" "}
            / {STEPS.length}
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "2px",
            background: "rgba(59,130,246,0.1)",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg, #2563EB, #3B82F6)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </header>

      {/* Step indicators */}
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "20px 24px 0",
          display: "flex",
          gap: "6px",
          overflowX: "auto",
        }}
      >
        {STEPS.map((step) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              background:
                currentStep === step.id
                  ? "rgba(59,130,246,0.1)"
                  : "transparent",
              border:
                currentStep === step.id
                  ? "1px solid rgba(59,130,246,0.25)"
                  : "1px solid transparent",
              color:
                currentStep === step.id
                  ? "#2563EB"
                  : currentStep > step.id
                  ? "#9CA3AF"
                  : "#CBD5E1",
            }}
          >
            {currentStep > step.id && (
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "#2563EB",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "white",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
            )}
            {step.label}
          </div>
        ))}
      </div>

      {/* Form */}
      <main
        style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px 80px" }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1 — Infos personnelles */}
          {currentStep === 1 && (
            <div className="animate-fadeInUp">
              <SectionHeader
                badge="Étape 1"
                title="Tes informations personnelles"
                subtitle="Pour personnaliser ton questionnaire et te recontacter facilement."
              />
              <div style={{ display: "grid", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <Field label="Prénom" required error={errors.prenom?.message}>
                    <input
                      className={`form-input ${errors.prenom ? "error" : ""}`}
                      placeholder="ex : Thomas"
                      {...register("prenom", { required: "Le prénom est requis" })}
                    />
                  </Field>
                  <Field label="Nom" required error={errors.nom?.message}>
                    <input
                      className={`form-input ${errors.nom ? "error" : ""}`}
                      placeholder="ex : Dupont"
                      {...register("nom", { required: "Le nom est requis" })}
                    />
                  </Field>
                </div>
                <Field label="Adresse mail" required error={errors.email?.message}>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="ex : thomas@entreprise.com"
                    {...register("email", {
                      required: "L'email est requis",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Format d'email invalide",
                      },
                    })}
                  />
                </Field>
                <Field label="Numéro de téléphone" required error={errors.telephone?.message}>
                  <input
                    type="tel"
                    className={`form-input ${errors.telephone ? "error" : ""}`}
                    placeholder="ex : +33 6 12 34 56 78"
                    {...register("telephone", {
                      required: "Le téléphone est requis",
                    })}
                  />
                </Field>
                <Field label="Poste actuel (métier)" required error={errors.poste?.message}>
                  <input
                    className={`form-input ${errors.poste ? "error" : ""}`}
                    placeholder="ex : Consultant en stratégie, Coach business..."
                    {...register("poste", { required: "Le poste est requis" })}
                  />
                </Field>
                <Field label="Entreprise" required error={errors.entreprise?.message}>
                  <input
                    className={`form-input ${errors.entreprise ? "error" : ""}`}
                    placeholder="ex : Nom de ta société ou ton nom si freelance"
                    {...register("entreprise", {
                      required: "L'entreprise est requise",
                    })}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 2 — Positionnement */}
          {currentStep === 2 && (
            <div className="animate-fadeInUp">
              <SectionHeader
                badge="Étape 2"
                title="Ton positionnement"
                subtitle="Clarifie ce que tu fais et ce qui te différencie pour rendre ton profil immédiatement compréhensible."
              />
              <div style={{ display: "grid", gap: "20px" }}>
                <Field
                  label="Quelle est ton activité principale aujourd'hui ?"
                  required
                  error={errors.activitePrincipale?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.activitePrincipale ? "error" : ""}`}
                    placeholder="Décris en quelques phrases ce que tu fais concrètement au quotidien..."
                    {...register("activitePrincipale", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field
                  label="Quelle est ton offre (produit / service) ?"
                  required
                  error={errors.offre?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.offre ? "error" : ""}`}
                    placeholder="Décris ton offre principale : ce que tu proposes, à quel prix, sous quel format..."
                    {...register("offre", { required: "Ce champ est requis" })}
                  />
                </Field>
                <Field
                  label="Pourquoi te choisir toi, et pas quelqu'un d'autre ? (ce qui te différencie)"
                  required
                  error={errors.differenciateur?.message}
                >
                  <textarea
                    rows={4}
                    className={`form-input ${errors.differenciateur ? "error" : ""}`}
                    placeholder="Ta méthode unique, ton parcours atypique, tes résultats, ta personnalité..."
                    {...register("differenciateur", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 3 — Objectif & Cible */}
          {currentStep === 3 && (
            <div className="animate-fadeInUp">
              <SectionHeader
                badge="Étape 3"
                title="Ton objectif & ta cible"
                subtitle="Définit ce que tu attends de LinkedIn et identifie les personnes que tu veux attirer."
              />
              <div style={{ display: "grid", gap: "20px" }}>
                <Field
                  label="Quel est ton objectif principal avec LinkedIn ?"
                  hint="clients / visibilité / recrutement / opportunités / autre"
                  required
                  error={errors.objectifLinkedin?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.objectifLinkedin ? "error" : ""}`}
                    placeholder="ex : Attirer des clients high-ticket prêts à investir, développer ma visibilité d'expert..."
                    {...register("objectifLinkedin", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field
                  label="Qui veux-tu attirer précisément ?"
                  hint="type de client, secteur, niveau, problématique…"
                  required
                  error={errors.ciblePrecise?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.ciblePrecise ? "error" : ""}`}
                    placeholder="ex : Dirigeants de PME de 10-50 personnes dans le secteur tech, souhaitant scaler leur équipe..."
                    {...register("ciblePrecise", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field
                  label="Quels problèmes principaux rencontrent ces personnes ?"
                  required
                  error={errors.problemesCible?.message}
                >
                  <textarea
                    rows={4}
                    className={`form-input ${errors.problemesCible ? "error" : ""}`}
                    placeholder="ex : Ils ont du mal à déléguer, manquent de temps, ne savent pas comment structurer leur croissance..."
                    {...register("problemesCible", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 4 — Profil actuel */}
          {currentStep === 4 && (
            <div className="animate-fadeInUp">
              <SectionHeader
                badge="Étape 4"
                title="Ton profil actuel"
                subtitle="Aide à comprendre ce qui fonctionne déjà et ce qui doit être amélioré."
              />
              <div style={{ display: "grid", gap: "20px" }}>
                <Field
                  label="Qu'est-ce que tu aimes dans ton profil actuel ?"
                  required
                  error={errors.aimeProfil?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.aimeProfil ? "error" : ""}`}
                    placeholder="ex : Ma photo, certaines formulations, les recommandations reçues..."
                    {...register("aimeProfil", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field
                  label="Qu'est-ce que tu n'aimes pas / veux changer ?"
                  required
                  error={errors.changeProfil?.message}
                >
                  <textarea
                    rows={4}
                    className={`form-input ${errors.changeProfil ? "error" : ""}`}
                    placeholder="ex : Le manque de clarté sur mon offre, la section À propos trop générique, la bannière peu professionnelle..."
                    {...register("changeProfil", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  padding: "16px 20px",
                  background: "rgba(59,130,246,0.05)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: "12px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(59,130,246,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#2563EB", fontWeight: "700" }}>i</span>
                </div>
                <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.6" }}>
                  <strong style={{ color: "#2563EB" }}>Conseil :</strong> Ouvre ton profil LinkedIn dans un autre onglet pour te souvenir de tous les détails. Sois le plus précis possible — chaque information m&apos;aide à créer une transformation sur mesure.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5 — Image & Contenu */}
          {currentStep === 5 && (
            <div className="animate-fadeInUp">
              <SectionHeader
                badge="Étape 5"
                title="Contenu & image de marque"
                subtitle="Définit l'image que tu veux renvoyer et les bases de ta communication visuelle."
              />
              <div style={{ display: "grid", gap: "20px" }}>
                <Field
                  label="Quelle image veux-tu renvoyer ?"
                  hint="expert, accessible, premium, fun, corporate…"
                  required
                  error={errors.imageRenvoyer?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.imageRenvoyer ? "error" : ""}`}
                    placeholder="ex : Expert accessible, premium mais humain, sérieux sans être austère..."
                    {...register("imageRenvoyer", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field
                  label="Dans ta bannière, quels éléments souhaites-tu voir apparaître en particulier ?"
                  required
                  error={errors.elementsBanniere?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.elementsBanniere ? "error" : ""}`}
                    placeholder="ex : Mon accroche principale, le nom de mon offre, une preuve sociale, mon logo..."
                    {...register("elementsBanniere", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field
                  label="Quelles sont tes couleurs principales à utiliser ?"
                  hint="2-3 couleurs max"
                  required
                  error={errors.couleurs?.message}
                >
                  <input
                    className={`form-input ${errors.couleurs ? "error" : ""}`}
                    placeholder="ex : Bleu marine #1a2e4a, Blanc #FFFFFF, Orange #F97316"
                    {...register("couleurs", { required: "Ce champ est requis" })}
                  />
                </Field>
                <Field
                  label="Des mots-clés importants à inclure ?"
                  hint="ex : clarté, réactivité, simplifier, performance..."
                  required
                  error={errors.motsCles?.message}
                >
                  <input
                    className={`form-input ${errors.motsCles ? "error" : ""}`}
                    placeholder="ex : clarté, impact, résultats, transformation, scalabilité..."
                    {...register("motsCles", { required: "Ce champ est requis" })}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 6 — Références & éléments */}
          {currentStep === 6 && (
            <div className="animate-fadeInUp">
              <SectionHeader
                badge="Étape 6"
                title="Références & éléments à intégrer"
                subtitle="Permet de s'inspirer de profils efficaces et de recenser les ressources disponibles."
              />
              <div style={{ display: "grid", gap: "20px" }}>
                <Field
                  label="Y a-t-il des profils LinkedIn que tu aimes particulièrement ?"
                  hint="Liens si possible"
                >
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="ex : linkedin.com/in/example — ce que j'aime : la clarté de sa headline, son positionnement..."
                    {...register("profilsLinkedin")}
                  />
                </Field>

                <div
                  style={{
                    height: "1px",
                    background: "rgba(59,130,246,0.08)",
                    margin: "4px 0",
                  }}
                />

                <Field
                  label="Si tu avais un avis client à mettre en avant, ce serait lequel ?"
                  required
                  error={errors.avisClient?.message}
                >
                  <textarea
                    rows={4}
                    className={`form-input ${errors.avisClient ? "error" : ""}`}
                    placeholder="Colle ici ton meilleur témoignage client (verbatim si possible)..."
                    {...register("avisClient", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field label="Ton site web (si tu en as un)">
                  <input
                    type="url"
                    className="form-input"
                    placeholder="ex : https://monsite.fr"
                    {...register("siteWeb")}
                  />
                </Field>
                <Field label="Une police d'écriture que tu aimes bien ?">
                  <input
                    className="form-input"
                    placeholder="ex : Inter, Montserrat, Playfair Display, Neue Haas..."
                    {...register("police")}
                  />
                </Field>
                <Field label="Un signe, un élément qui revient souvent chez toi ? (dans la vie pro ou perso)">
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="ex : La métaphore du sport, les chiffres précis, une philosophie particulière..."
                    {...register("signeRecurrent")}
                  />
                </Field>

                {/* Photo upload */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: "8px",
                    }}
                  >
                    Une photo (ou plusieurs) de toi en bonne qualité ?{" "}
                    <span style={{ color: "#2563EB" }}>*</span>
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "12px",
                        color: "#9CA3AF",
                        fontWeight: "400",
                      }}
                    >
                      (pour la photo de profil)
                    </span>
                  </label>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginBottom: "12px",
                    }}
                  >
                    Importez jusqu&apos;à 5 fichiers compatibles. 10 MB max. par fichier.
                  </p>
                  <FileUploadZone
                    files={photos}
                    onRemove={(i) => removeFile(i, setPhotos)}
                    accept="image/*"
                    inputRef={photoInputRef}
                    onChange={(e) => handleFileChange(e, setPhotos, photos)}
                    max={5}
                  />
                </div>

                {/* Logo upload */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                      marginBottom: "8px",
                    }}
                  >
                    Ton logo (si tu en as un) ?{" "}
                    <span style={{ color: "#2563EB" }}>*</span>
                  </label>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginBottom: "12px",
                    }}
                  >
                    Importez jusqu&apos;à 5 fichiers compatibles. 10 MB max. par fichier.
                  </p>
                  <FileUploadZone
                    files={logos}
                    onRemove={(i) => removeFile(i, setLogos)}
                    accept="image/*,.svg,.pdf,.ai,.eps"
                    inputRef={logoInputRef}
                    onChange={(e) => handleFileChange(e, setLogos, logos)}
                    max={5}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7 — Contraintes */}
          {currentStep === 7 && (
            <div className="animate-fadeInUp">
              <SectionHeader
                badge="Étape 7 — Dernière étape"
                title="Contraintes & préférences"
                subtitle="Précise les limites à respecter pour rester aligné avec ta personnalité et ton univers."
              />
              <div style={{ display: "grid", gap: "20px" }}>
                <Field
                  label="Y a-t-il des choses que tu refuses ?"
                  hint="ton, style, vocabulaire, couleurs à éviter…"
                  required
                  error={errors.refus?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.refus ? "error" : ""}`}
                    placeholder="ex : Pas de ton trop agressif, pas de couleur rouge, pas de vocabulaire trop technique..."
                    {...register("refus", { required: "Ce champ est requis" })}
                  />
                </Field>
                <Field
                  label="Des éléments obligatoires à inclure ?"
                  required
                  error={errors.obligatoires?.message}
                >
                  <textarea
                    rows={3}
                    className={`form-input ${errors.obligatoires ? "error" : ""}`}
                    placeholder="ex : Mon accroche signature, la mention de ma garantie, mes 3 piliers de méthode..."
                    {...register("obligatoires", {
                      required: "Ce champ est requis",
                    })}
                  />
                </Field>
                <Field label="Autres remarques, détails ou informations utiles ?">
                  <textarea
                    rows={4}
                    className="form-input"
                    placeholder="Tout ce que tu penses utile de partager et qui n'a pas été abordé dans les questions précédentes..."
                    {...register("autres")}
                  />
                </Field>
              </div>

              {/* Recap box */}
              <div
                style={{
                  marginTop: "32px",
                  padding: "24px",
                  background: "rgba(37,99,235,0.05)",
                  border: "1px solid rgba(37,99,235,0.15)",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#111827",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    Prêt à envoyer ton questionnaire ?
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6B7280",
                    lineHeight: "1.7",
                  }}
                >
                  Une fois envoyé, je recevrai toutes tes informations directement et commencerai à préparer ta{" "}
                  <strong style={{ color: "#2563EB" }}>
                    transformation LinkedIn V1
                  </strong>
                  . Tu seras recontacté(e) dans les plus brefs délais.
                </p>
              </div>

              {submitError && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "10px",
                    color: "#DC2626",
                    fontSize: "14px",
                  }}
                >
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "40px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(59,130,246,0.08)",
            }}
          >
            <button
              type="button"
              onClick={handlePrev}
              style={{
                display: currentStep === 1 ? "none" : "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "10px",
                color: "#6B7280",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              ← Précédent
            </button>

            {currentStep === 1 && <div />}

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 4px 16px rgba(59,130,246,0.2)",
                }}
              >
                Continuer →
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 32px",
                  background: submitting
                    ? "rgba(37,99,235,0.4)"
                    : "linear-gradient(135deg, #2563EB, #3B82F6)",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  fontFamily: "Inter, sans-serif",
                  boxShadow: "0 4px 16px rgba(59,130,246,0.2)",
                }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Envoi en cours...
                  </>
                ) : (
                  <>Envoyer mon questionnaire</>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease forwards;
        }
        .form-input {
          width: 100%;
          padding: 12px 14px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          color: #111827;
          font-size: 14px;
          font-family: Inter, sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: vertical;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .form-input::placeholder {
          color: #CBD5E1;
        }
        .form-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }
        .form-input.error {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.06);
        }
        .section-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.15);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #2563EB;
          font-family: Inter, sans-serif;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }
        .upload-zone {
          border: 1.5px dashed #D1D5DB;
          border-radius: 12px;
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        .upload-zone:hover {
          border-color: #2563EB;
          background: rgba(37,99,235,0.02);
        }
        .upload-zone.drag-over {
          border-color: #2563EB;
          background: rgba(37,99,235,0.04);
        }
      `}</style>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div className="section-badge" style={{ marginBottom: "16px" }}>
        {badge}
      </div>
      <h1
        style={{
          fontSize: "26px",
          fontWeight: "700",
          color: "#111827",
          fontFamily: "Space Grotesk, sans-serif",
          letterSpacing: "-0.02em",
          lineHeight: "1.3",
          marginBottom: "10px",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: "15px",
          color: "#6B7280",
          lineHeight: "1.7",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "14px",
          fontWeight: "600",
          color: "#111827",
          marginBottom: "4px",
        }}
      >
        {label}{" "}
        {required && <span style={{ color: "#2563EB" }}>*</span>}
      </label>
      {hint && (
        <p
          style={{
            fontSize: "12px",
            color: "#9CA3AF",
            marginBottom: "10px",
            fontStyle: "italic",
          }}
        >
          {hint}
        </p>
      )}
      {!hint && <div style={{ marginBottom: "10px" }} />}
      {children}
      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#EF4444",
            marginTop: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function FileUploadZone({
  files,
  onRemove,
  accept,
  inputRef,
  onChange,
  max,
}: {
  files: UploadedFile[];
  onRemove: (index: number) => void;
  accept: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  max: number;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div>
      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dt = e.dataTransfer;
          if (dt.files.length && inputRef.current) {
            const changeEvent = {
              target: { files: dt.files },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onChange(changeEvent);
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          style={{ display: "none" }}
          onChange={onChange}
        />
        <div style={{ marginBottom: "8px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "#9CA3AF",
            lineHeight: "1.6",
          }}
        >
          Glisse tes fichiers ici ou{" "}
          <span style={{ color: "#2563EB", fontWeight: "600" }}>
            clique pour parcourir
          </span>
        </p>
        <p style={{ fontSize: "12px", color: "#CBD5E1", marginTop: "4px" }}>
          {files.length}/{max} fichiers — max 10 MB par fichier
        </p>
      </div>

      {files.length > 0 && (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {files.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {f.preview ? (
                <img
                  src={f.preview}
                  alt={f.name}
                  style={{
                    width: "36px",
                    height: "36px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#111827",
                    fontWeight: "500",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.name}
                </p>
                <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  {(f.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(i);
                }}
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "6px",
                  color: "#EF4444",
                  cursor: "pointer",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: "500",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SuccessPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          textAlign: "center",
          padding: "48px 32px",
          background: "white",
          border: "1px solid #E5E7EB",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563EB, #3B82F6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 4px 20px rgba(59,130,246,0.2)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "700",
            color: "#111827",
            fontFamily: "Space Grotesk, sans-serif",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          Questionnaire envoyé
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "#6B7280",
            lineHeight: "1.7",
            marginBottom: "32px",
          }}
        >
          Merci pour ta confiance. J&apos;ai bien reçu toutes tes informations et je commence dès maintenant à préparer ta transformation LinkedIn.
          <br />
          <br />
          <strong style={{ color: "#2563EB" }}>
            Tu seras recontacté(e) très prochainement avec la V1 de ton profil.
          </strong>
        </p>
        <div
          style={{
            padding: "14px 20px",
            background: "#F8FAFC",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            fontSize: "13px",
            color: "#9CA3AF",
          }}
        >
          <span style={{ color: "#2563EB", fontWeight: "600" }}>Autorité Signal™</span>
          {" "}— Aligne ta valeur perçue avec ton niveau réel.
        </div>
      </div>
    </div>
  );
}
