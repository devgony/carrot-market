"use server";
import db from "./db";

export default async function saveMessageReadBy({
  userId,
  messageId,
}: {
  userId: number;
  messageId: number;
}) {
  await db.messageReadBy.create({
    data: {
      userId,
      messageId,
    },
  });
}
