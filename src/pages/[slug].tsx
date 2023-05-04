import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
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
    <>
      <div className="mx-auto my-3 flex max-w-fit flex-col items-center justify-center rounded-lg bg-slate-950 p-4 shadow-lg">
        <p className="text-2xl font-bold text-violet-300">{data.length}</p>
        <p className="text-sm text-slate-700">Books Read</p>
      </div>
      <div className="m-auto grid grid-cols-1 justify-items-center gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((fullBook) => (
          <BookPosts key={fullBook.book.id} {...fullBook} />
        ))}
      </div>
    </>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({ username });

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <Head>
        <title>{data.username ?? data.externalUsername ?? data.name}</title>
      </Head>
      <main className="min-h-screen">
        <div className="m-4 flex flex-col items-center justify-center">
          {/* hello {data.username ?? data.externalUsername} */}
          <div className="overflow-hidden rounded-full">
            <Image
              src={data.profileImageUrl}
              width={50}
              height={50}
              alt="profile pic"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-violet-300">
              @{data.username ?? data.externalUsername ?? data.name}
            </p>
          </div>
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
