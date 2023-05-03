import { type NextPage } from "next";
import Head from "next/head";

const Wishlist: NextPage = () => {
  return (
    <>
      <Head>
        <title>Wishlist</title>
      </Head>
      <div className="mx-auto my-4 flex min-h-screen max-w-2xl flex-col gap-2 p-2">
        <div className="flex items-center justify-center text-3xl font-bold">
          Wishlist
        </div>
        <div className="grid gap-4">
          <div className="flex flex-col items-center gap-2 rounded-lg bg-slate-950 p-4 shadow-md">
            <div className="flex flex-col items-center justify-center">
              <p className="text-2xl font-semibold text-violet-300">Title</p>
              <p className="text-slate-400">Author</p>
            </div>
            <div>
              <p className="text-slate-700">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Error,
                vero neque. Dignissimos unde dolorum ea. Lorem ipsum dolor sit
                amet consectetur adipisicing elit. Nihil ex, repellendus error
                eius perferendis mollitia.
              </p>
            </div>
            <div className="rounded-lg bg-violet-400 px-2 py-1 text-xs font-medium text-slate-950">
              <p>Buy Book</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 rounded-lg bg-slate-950 p-4 shadow-md">
            <div className="flex flex-col items-center justify-center">
              <p className="text-2xl font-semibold text-violet-300">Title</p>
              <p className="text-slate-400">Author</p>
            </div>
            <div>
              <p className="text-slate-700">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Error,
                vero neque. Dignissimos unde dolorum ea. Lorem ipsum dolor sit
                amet consectetur adipisicing elit. Nihil ex, repellendus error
                eius perferendis mollitia.
              </p>
            </div>
            <div className="rounded-lg bg-violet-400 px-2 py-1 text-xs font-medium text-slate-950">
              <p>Buy Book</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;
