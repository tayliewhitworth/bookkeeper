import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import Image from "next/image";
import Link from "next/link";

import { useUser } from "@clerk/nextjs";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import UpdateBook from "~/components/UpdateBookForm";

import { LikeBtn } from "~/components/LikeBtn";

dayjs.extend(relativeTime);

const SingleBookPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.books.getById.useQuery({ id });

  const { isSignedIn, user } = useUser();

  if (!data) return <div>Something went wrong...</div>;

  const { mutate, isLoading, isSuccess, isError } =
    api.wishlistItem.create.useMutation();

  const addToWishlist = () => {
    mutate({
      title: data.book.title,
      author: data.book.author,
      description: data.book.description,
      link: `https://amazon.com/s?k=${data.book.title}+${data.book.author}`,
    });
  };

  if (isError) {
    toast.error("Unable to add to wishlist...");
  }

  const matchedUser = user?.id === data.user.id;

  return (
    <>
      <Head>
        <title>{data.book.title}</title>
      </Head>
      <div className="min-h-screenp-4 mx-auto my-4 max-w-3xl p-2">
        <div className="flex flex-col items-center justify-between px-5 sm:flex-row">
          <div className="flex items-center gap-4 p-4">
            <div className="overflow-hidden rounded-full">
              <Image
                src={data.user.profileImageUrl}
                width={50}
                height={50}
                alt={
                  data.user.username ??
                  data.user.externalUsername ??
                  data.user.name
                }
              />
            </div>
            <div>
              <Link
                href={`/@${
                  data.user?.username ? data.user.username : data.user.id
                }`}
              >
                <p className="text-2xl font-bold text-violet-300">
                  @
                  {data.user.username ??
                    data.user.externalUsername ??
                    data.user.name}
                </p>
              </Link>
              <p className="text-slate-500">
                posted {dayjs(data.book.createdAt).fromNow()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn && !matchedUser && (
              <div>
                <button
                  onClick={addToWishlist}
                  disabled={isLoading || isSuccess}
                  className="rounded bg-violet-400 p-1 text-sm font-medium text-slate-950 transition-colors hover:bg-violet-400"
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : isSuccess ? (
                    "Added!"
                  ) : (
                    "+ to wishlist"
                  )}
                </button>
              </div>
            )}
            {isSignedIn && matchedUser && <UpdateBook id={data.book.id} />}
            <LikeBtn id={data.book.id} />
          </div>
        </div>
        <div className="flex flex-col justify-evenly gap-2 p-4 max-md:items-center md:flex-row">
          <div className="p-4">
            <Image
              src={data.book.imgSrc}
              width={300}
              height={300}
              alt={data.book.title}
              className="rounded-lg shadow-lg shadow-slate-900"
            />
          </div>
          <div className="flex flex-col items-start justify-evenly gap-4 text-slate-700">
            <div className="grid gap-3 rounded-lg bg-slate-200 p-4">
              <div>
                <h1 className="text-4xl font-bold text-violet-400">
                  {data.book.title}
                </h1>
                <p className="text-slate-500">by {data.book.author}</p>
              </div>
              <div>
                <p className="max-w-sm text-lg">{data.book.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-950 p-4 text-violet-300">
              <p>
                Date Started:{" "}
                {dayjs(data.book.dateStarted).format("MM/DD/YYYY")}
              </p>
              <p>
                Date Finished:{" "}
                {dayjs(data.book.dateFinished).format("MM/DD/YYYY")}
              </p>
            </div>
            <div className="rounded-lg bg-violet-300 p-4">
              <p>Genre: {data.book.genre}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const id = context.params?.id;
  if (typeof id !== "string") throw new Error("id is not a string");

  await helpers.books.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SingleBookPage;
