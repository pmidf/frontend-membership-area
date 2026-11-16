"use server";

import { updateTag } from "next/cache";

import { TAG_EVENTOS } from "@/features/agenda/services/agenda-service";

export async function revalidarAgendaPublica(): Promise<void> {
  updateTag(TAG_EVENTOS);
}
