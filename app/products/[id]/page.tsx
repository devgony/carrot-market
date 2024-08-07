import db from "@/lib/db";
import {
  createChatRoom,
  formatToWon,
  getIsOwner,
  getProduct,
} from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import getSession from "@/lib/session";

const getCachedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail", "product"],
});

async function getProductTitle(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  return product;
}

const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
  tags: ["product-title", "product"],
});

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);
  const revalidate = async () => {
    "use server";
    revalidateTag("xxxx");
  };

  return (
    <div>
      <div className="relative aspect-square">
        <Image
          className="object-cover"
          fill
          src={`${product.photo}/width=500,height=500`}
          alt={product.title}
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 overflow-hidden rounded-full">
          {product.user.avatar !== null ? (
            <Image
              src={product.user.avatar}
              width={40}
              height={40}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <div className="sticky w-full bottom-0 left-0 p-5 bg-neutral-800 flex justify-between items-center max-w-screen-sm">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        <section className="flex gap-2 items-center">
          {isOwner ? (
            <form action={revalidate}>
              <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
                Revalidate title cache
              </button>
            </form>
          ) : null}
          <Link
            className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold"
            href={`/products/${product.id}/edit`}
          >
            Edit
          </Link>
          <form
            action={async () => {
              "use server";
              return await createChatRoom(product);
            }}
          >
            <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">
              채팅하기
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });
  return products.map((product) => ({ id: product.id + "" }));
}
