import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
// import Image from "next/image";
import BookPosts from "~/components/BookPosts";

import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { LoadingSpinner } from "~/components/loading";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.books.getBooksByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  if (!data || data.length === 0)
    return <div>User has not ready any books!</div>;

  return (
    <div className="m-auto grid grid-cols-1 justify-items-center gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((fullBook) => (
        <BookPosts key={fullBook.book.id} {...fullBook} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <Head>
        <title>{data.username ?? data.externalUsername}</title>
      </Head>
      <main className="min-h-screen flex-col items-center">
        <div className="mt-8 flex items-center justify-center">
          hello {data.username ?? data.externalUsername}
        </div>

        <div>
          <ProfileFeed userId={data.id} />
        </div>
      </main>
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

export default ProfilePage;
