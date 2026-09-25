import { prisma } from "@/lib/prisma";
import type { ContactSettingsInput } from "@/lib/contact-validation";

export interface ContactSettings extends ContactSettingsInput {
  updatedAt?: string;
}

export const defaultContactSettings: ContactSettings = {
  readyText: "READY WHEN YOU ARE.",
  designerLabel: "@DANNY.LINES",
  designerUrl: "https://www.linkedin.com/in/danny-lines-4113ab15/",
  locationName: "TOTTENHAM",
  locationAddress: "LONDON, UNITED KINGDOM",
  coordinates: "51.5072° N, 0.1276° W",
  footerBrand: "D O N P R O D",
  footerDescription: "DOUBLE OR NOTHING PRODUCTIONS",
  copyrightYear: "2026",
  showreelUrl: "https://vimeo.com/1173388074",
  tickerText: "DOUBLE OR NOTHING PRODUCTIONS",
  socialLinks: [
    { label: "TIKTOK", url: "https://www.tiktok.com/@donprod" },
    { label: "YOUTUBE", url: "https://youtube.com/@donprod" },
    { label: "INSTA", url: "https://www.instagram.com/donprod" },
    { label: "EMAIL US", url: "mailto:doubleornothingproductions@gmail.com" },
  ],
  btsImages: [],
};

function asJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function fromRow(row: {
  readyText: string;
  designerLabel: string;
  designerUrl: string;
  locationName: string;
  locationAddress: string;
  coordinates: string;
  footerBrand: string;
  footerDescription: string;
  copyrightYear: string;
  showreelUrl: string;
  tickerText: string;
  socialLinks: unknown;
  btsImages: unknown;
  updatedAt: Date;
}): ContactSettings {
  return {
    readyText: row.readyText,
    designerLabel: row.designerLabel,
    designerUrl: row.designerUrl,
    locationName: row.locationName,
    locationAddress: row.locationAddress,
    coordinates: row.coordinates,
    footerBrand: row.footerBrand,
    footerDescription: row.footerDescription,
    copyrightYear: row.copyrightYear,
    showreelUrl: row.showreelUrl,
    tickerText: row.tickerText,
    socialLinks: asJsonArray<ContactSettingsInput["socialLinks"][number]>(row.socialLinks),
    btsImages: asJsonArray<ContactSettingsInput["btsImages"][number]>(row.btsImages),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getContactSettings(): Promise<ContactSettings> {
  const row = await prisma.contactSettings.findUnique({ where: { id: "default" } });
  return row ? { ...defaultContactSettings, ...fromRow(row) } : defaultContactSettings;
}

export async function updateContactSettings(input: ContactSettingsInput): Promise<ContactSettings> {
  const row = await prisma.contactSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...input },
    update: input,
  });
  return fromRow(row);
}
