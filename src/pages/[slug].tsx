import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import BookPosts from "~/components/BookPosts";

import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { LoadingSpinner } from "~/components/loading";
import { useUser } from "@clerk/nextjs";

import { useState } from "react";

import { UpdateProfile, CreateProfile } from "~/components/ProfileEdit";
import { FollowBtn, FollowerCount } from "~/components/FollowBtn";
import { toast } from "react-hot-toast";

const RecommendedBooks = (props: { titles: string[] }) => {
  const [show, setShow] = useState(false);

  const generateRecommendations =
    api.recs.generateRecommendations.useMutation();

  const handleClick = async () => {
    setShow(true);
    try {
      await generateRecommendations.mutateAsync({
        titles: props.titles.slice(0, 5),
      });
    } catch (error) {
      toast.error("Something went wrong, try again later!");
      console.error(error);
    }
  };

  const { data, isLoading, isError } = generateRecommendations;

  if (isError) toast.error("Something went wrong, try again later!");

  return (
    <>
      <div className="fixed bottom-[-5.5rem] left-6 z-30 h-40 w-40 rounded-full">
        <button
          onClick={(): void => void handleClick()}
          className="rounded-lg bg-violet-500 px-2 py-2 text-xs shadow-lg"
        >
          Book Recommendations
        </button>
      </div>
      {show && (
        <div className="fixed bottom-20 z-40 flex h-96 w-80 flex-col items-start rounded-lg bg-violet-500 shadow-2xl sm:w-96">
          <button
            className="m-4 rounded-lg px-1 text-xl hover:bg-slate-400 hover:bg-opacity-50"
            onClick={() => setShow(false)}
          >
            X
          </button>
          <div className="flex items-center px-4">
            <div className="flex flex-col gap-5">
              {isLoading && <LoadingSpinner />}

              {data ? (
                data.map((book, index) => (
                  <div key={index}>
                    <p className="font-bold text-slate-950">{book.title}</p>
                    <p className="text-sm text-slate-300">By {book.author}</p>
                    <p className="text-xs">
                      {book.description.slice(0, 100)}...
                    </p>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-sm text-slate-300">
                    A.I is Trying to find you books!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProfileBio = (props: { userId: string }) => {
  const { data, isLoading } = api.profile.getProfileByUserId.useQuery({
    userId: props.userId,
  });

  const { user, isSignedIn } = useUser();

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
    <div className="flex flex-col gap-4">
      <p className="max-w-lg text-slate-500">{data.profile.bio}</p>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {tags.map((tag, index) => (
          <div
            className={`rounded-lg py-0.5 pl-2 pr-1 text-xs ${
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
      {user?.id !== props.userId && isSignedIn && (
        <FollowBtn id={data.profile.id} />
      )}
      <div>
        <FollowerCount profileId={data.profile.id} userId={props.userId} />
      </div>
    </div>
  );
};

const ProfileFeed = (props: { userId: string }) => {
  const [showLikedBooks, setShowLikedBooks] = useState(false);
  const readBooks = api.books.getBooksByUserId.useQuery({
    userId: props.userId,
  });

  const likedBooks = api.books.getUserWithLikes.useQuery({
    userId: props.userId,
  });

  const { isSignedIn } = useUser();

  const data = showLikedBooks ? likedBooks.data?.books : readBooks.data;
  const isLoading = showLikedBooks ? likedBooks.isLoading : readBooks.isLoading;

  const bookTitles = readBooks.data?.map((book) => book.book.title) ?? [];

  if (isLoading)
    return (
      <div>
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <div className="mx-auto my-3 flex max-w-fit items-center justify-center gap-4">
        {isSignedIn && bookTitles.length > 0 && (
          <RecommendedBooks titles={bookTitles} />
        )}
        <div>
          <button
            onClick={() => setShowLikedBooks(false)}
            className={`flex flex-col items-center rounded-lg p-4 text-2xl font-bold text-violet-300 shadow-lg ${
              showLikedBooks ? "bg-slate-950" : "bg-violet-500"
            }`}
          >
            {readBooks.data?.length ?? 0}
            <span className="text-sm font-normal text-slate-700">
              Books Read
            </span>
          </button>
        </div>
        <div>
          <button
            disabled={
              !likedBooks.data?.books || likedBooks.data?.books.length === 0
            }
            onClick={() => setShowLikedBooks(true)}
            className={`flex flex-col items-center rounded-lg p-4 text-2xl font-bold text-violet-300 shadow-lg ${
              showLikedBooks ? "bg-violet-500" : "bg-slate-950"
            }`}
          >
            {likedBooks.data?.likes.length ?? 0}
            <span className="text-sm font-normal text-slate-700">
              Liked Books
            </span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 py-4">
        {data && data.length > 0 ? (
          data.map((fullBook) => (
            <BookPosts key={fullBook.book.id} {...fullBook} />
          ))
        ) : (
          <div className="text-center text-lg font-medium text-violet-300">
            User has no books🥲
          </div>
        )}
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
              className="h-[50px] w-[50px] object-cover"
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
