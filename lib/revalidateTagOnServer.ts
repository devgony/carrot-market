"use server";
import { revalidateTag } from "next/cache";

export default async function revalidateTagOnServer(tag: string) {
  revalidateTag(tag);
}
