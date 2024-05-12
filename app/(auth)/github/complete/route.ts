import db from "@/lib/db";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return new Response(null, {
      status: 400,
    });
  }

  const { error, access_token } = await getAccessToken(code);
  if (error) {
    return new Response(null, {
      status: 400,
    });
  }

  const { id, avatar_url, login } = await getUserProfile(access_token);

  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });
  if (user) {
    return await logUserIn(user.id);
  }

  const email = await getEmail(access_token);
  const username = await getUsername(login, id);

  const newUser = await db.user.create({
    data: {
      username,
      github_id: id + "",
      avatar: avatar_url,
      email,
    },
    select: {
      id: true,
    },
  });

  return await logUserIn(newUser.id);
}

async function getAccessToken(code: string): Promise<{
  error: Error;
  access_token: string;
}> {
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  return accessTokenResponse.json();
}

async function getUserProfile(access_token: string): Promise<{
  id: string;
  avatar_url: string;
  login: string;
}> {
  const userProfileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });

  return userProfileResponse.json();
}

async function getUsername(login: string, id: string) {
  const usernameExists = await db.user.findUnique({
    where: { username: login },
  });
  const username = usernameExists ? `${login}_${id}` : login;
  return username;
}

async function getEmail(access_token: string) {
  const emailResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });

  const res: [{ email: string }] = await emailResponse.json();
  const email = res.length > 0 ? res[0].email : null;
  return email;
}

async function logUserIn(id: number) {
  const session = await getSession();
  session.id = id;
  await session.save();
  return redirect("/profile");
}
