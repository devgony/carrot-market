import db from "./db";
import getSession from "./session";
import { getUploadUrl } from "./cloudflare";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export function formatToTimeAgo(date: string): string {
  const dayInMs = 1000 * 60 * 60 * 24;
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  const diff = Math.round((time - now) / dayInMs);

  const formatter = new Intl.RelativeTimeFormat("ko");

  return formatter.format(diff, "days");
}

export function formatToWon(price: number): string {
  return price.toLocaleString("ko-KR");
}

export async function getIsOwner(userId: number) {
  // const session = await getSession();
  // if (session.id) {
  //   return session.id === userId;
  // }
  return false;
}

export async function getProduct(id: number) {
  console.log("product");
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
}
type ProductType = Prisma.PromiseReturnType<typeof getProduct>;

export const onImageChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setPreview: (url: string) => void,
  setFile: (file: File) => void,
  setUploadUrl: (url: string) => void,
  setValue: (
    name: "photo" | "title" | "price" | "description",
    value: string
  ) => void
) => {
  const {
    target: { files },
  } = event;
  if (!files) {
    return;
  }
  const file = files[0];

  if (file.type.split("/")[0] !== "image") {
    alert("이미지 파일만 업로드 가능합니다."); // TODO: toast
    return;
  }

  if (file.size > 1024 * 1024 * 5) {
    alert("5MB 이하의 이미지만 업로드 가능합니다."); // TODO: toast
    return;
  }

  const url = URL.createObjectURL(file);
  setPreview(url);
  setFile(file);

  const { success, result } = await getUploadUrl();
  if (success) {
    const { id, uploadURL } = result;
    setUploadUrl(uploadURL);
    setValue("photo", `${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGE_URL}/${id}`);
  }
};

export const createChatRoom = async (product: Exclude<ProductType, null>) => {
  const session = await getSession();
  const room = await db.chatRoom.create({
    data: {
      users: {
        connect: [
          {
            id: product.userId,
          },
          {
            id: session.id,
          },
        ],
      },
    },
    select: {
      id: true,
    },
  });
  redirect(`/chats/${room.id}`);
};
