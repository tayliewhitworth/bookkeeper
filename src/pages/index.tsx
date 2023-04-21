import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";

import BookPosts from "~/components/BookPosts";


import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();

  const { data, isLoading } = api.books.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <Head>
        <title>Book Keeper</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/book-stack.png" />
      </Head>
      <main className="min-h-screen flex-col items-center">
        {/* <Navbar /> */}
        <div className="m-auto grid grid-cols-1 justify-items-center gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map(({ book, user }) => ( <BookPosts key={book.id} book={book} user={user} /> ))}
          <div className="max-w-xs overflow-hidden rounded bg-slate-950 py-4 shadow-lg">
            <img
              src="https://placehold.co/200x250?text=Book+Cover&font=roboto"
              alt="Book Keeper"
              className="m-auto flex justify-center rounded shadow-sm shadow-slate-400"
            />
            <div className="px-5 py-4">
              <div className="mb-2 text-xl font-bold text-violet-300">
                Book Title
              </div>
              <p className="text-sm text-slate-700">
                lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis,
                architecto?
              </p>
            </div>
            <div className="flex items-center gap-2 px-5 py-2">
              {/* user image */}

              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-600">
                <svg
                  className="absolute -left-1 h-10 w-10 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </div>

              <div className="text-sm">
                <p className="leading-none text-slate-700">Username</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
