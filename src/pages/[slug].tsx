import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import BookPosts from "~/components/BookPosts";

import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { LoadingSpinner } from "~/components/loading";
import { useUser } from "@clerk/nextjs";

import { UpdateProfile, CreateProfile } from "~/components/ProfileEdit";

const ProfileBio = (props: { userId: string }) => {
  const { data, isLoading } = api.profile.getProfileByUserId.useQuery({
    userId: props.userId,
  });

  const { user } = useUser();

  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  if (!data || data.profile === null)
    return (
      <div className="text-slate-500">
        <p>No Bio</p>
        {user?.id === props.userId && <CreateProfile />}
      </div>
    );

  const colors = [
    "bg-violet-500",
    "bg-purple-500",
    "bg-violet-700",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const tags = data.profile.tags.split(",");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-slate-500">{data.profile.bio}</p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {tags.map((tag, index) => (
          <div
            className={`rounded-lg px-2 py-0.5 text-xs ${
              colors[index % colors.length] ?? "bg-violet-500"
            }`}
            key={index}
          >
            {tag}
          </div>
        ))}
      </div>
      <div>
        {user?.id === props.userId && <UpdateProfile userId={props.userId} />}
      </div>
    </div>
  );
};

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
        <div className="m-4 flex flex-col items-center justify-center  rounded bg-slate-950 p-4">
          <div className="overflow-hidden rounded-full">
            <Image
              src={data.profileImageUrl}
              width={50}
              height={50}
              alt="profile pic"
              className="object-cover h-[50px] w-[50px]"
            />
          </div>
          <div>
            <p className="text-2xl font-bold text-violet-300">
              @{data.username ?? data.externalUsername ?? data.name}
            </p>
          </div>
          <div className="p-4 text-center">
            <ProfileBio userId={data.id} />
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
