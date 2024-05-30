import { UserIcon } from "@heroicons/react/24/solid";
import { getIsOwner, getProduct } from "@/app/products/[id]/page";
import CloseButton from "@/components/CloseButton";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";

export default async function Modal({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);
  return (
    <div className="absolute w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60 left-0 top-0">
      <CloseButton />
      <div className="max-w-screen-md flex justify-center w-full">
        <div className="w-full relative aspect-square bg-neutral-700 text-neutral-200 rounded-md flex justify-center items-center">
          <Image
            src={`${product.photo}/public`}
            fill
            className="object-cover"
            alt={product.photo}
          />
        </div>
        <section>
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
          <div className="p-5 flex flex-col gap-2 justify-between">
            <span>
              <h1 className="text-2xl font-semibold">{product.title}</h1>
              <p>{product.description}</p>
            </span>
            <div className="gap-2 flex flex-col items-end">
              <span className="font-semibold text-xl">
                {formatToWon(product.price)}원
              </span>
              {isOwner ? (
                <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold w-full text-center">
                  Delete product
                </button>
              ) : null}
              <Link
                className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold w-full text-center"
                href={``}
              >
                채팅하기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
