import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import { WishistItem, AddWishlistItem } from "~/components/WishlistItem";

import { api } from "~/utils/api";

import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { LoadingSpinner } from "~/components/loading";

const WishlistItems = (props: { userId: string }) => {
  const { data, isLoading } = api.wishlistItem.getWishlistByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2 px-4 text-3xl font-bold text-violet-300">
        <h1>Wishlist</h1>
        <div className="justify-self-end font-normal">
          <AddWishlistItem />
        </div>
      </div>
      <div className="grid gap-4">
        {data && data.length > 0 ? (
          data.map((wishlistItem) => (
            <WishistItem key={wishlistItem.wishlistItem.id} {...wishlistItem} />
          ))
        ) : (
          <div className="flex items-center justify-center text-lg text-slate-400">
            No wishlist items! Press the + button to add some!🤩
          </div>
        )}
      </div>
    </>
  );
};

const Wishlist: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <Head>
        <title>
          {data.username ?? data.externalUsername ?? data.name} Wishlist
        </title>
      </Head>
      <div className="mx-auto my-4 flex min-h-screen max-w-2xl flex-col gap-2 p-2">
        <WishlistItems userId={data.id} />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("slug is not a string");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Wishlist;
