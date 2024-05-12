"use server";

import crypto from "crypto";
import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import getSession from "@/lib/session";
import twilio from "twilio";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "Wrong phone format"
  );

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });
  return Boolean(exists);
}

const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "This token does not exist.");

interface ActionState {
  token: boolean;
}

async function getToken() {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return getToken();
  } else {
    return token;
  }
}

export async function smsLogIn(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");
  if (!prevState.token) {
    // send otp
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    }

    await db.sMSToken.deleteMany({
      where: {
        user: {
          phone: result.data,
        },
      },
    });
    const token = await getToken();
    await db.sMSToken.create({
      data: {
        phone: process.env.MY_PHONE_NUMBER!, // should be result.data
        token,
        user: {
          connectOrCreate: {
            where: {
              phone: result.data,
            },
            create: {
              username: crypto.randomBytes(10).toString("hex"),
              phone: result.data,
            },
          },
        },
      },
    });
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    await client.messages.create({
      body: `Your Karrot verification code is: ${token}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: process.env.MY_PHONE_NUMBER!, // should be result.data
    });

    return {
      token: true,
    };
  } else {
    // verify otp
    const resultToken = await tokenSchema.spa(token);
    if (!resultToken.success) {
      return {
        token: true,
        error: resultToken.error.flatten(),
      };
    }

    const smsToken = await db.sMSToken.findUnique({
      where: {
        token: resultToken.data.toString(),
      },
      select: {
        id: true,
        userId: true,
        phone: true,
        user: {
          select: {
            phone: true,
          },
        },
      },
    });

    if (smsToken?.phone !== smsToken?.user.phone) {
      return {
        token: true,
        error: {
          formErrors: ["This token does not match the phone number."],
        },
      };
    }

    const session = await getSession();
    session.id = smsToken!.userId;
    await session.save();
    await db.sMSToken.delete({
      where: {
        id: smsToken!.id,
      },
    });
    redirect("/profile");
  }
}
