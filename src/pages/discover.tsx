import { type NextPage } from "next";

import { LoadingSpinner } from "~/components/loading";
import Image from "next/image";

import { api } from "~/utils/api";

import { useState, useMemo } from "react";
import Link from "next/link";

const Feed = () => {
  const { data } = api.profile.getAllUsers.useQuery();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.users.filter((user) => {
      if (searchTerm.trim() === "") {
        return true;
      }

      const lowerCaseSearchTerm = searchTerm.toLowerCase();

      const userProfile = data.profiles.find(
        (profile) => profile.userId === user.id
      );
      const profileTags = userProfile?.tags.toLowerCase().split(",") ?? [];

      return (
        (user.username &&
          user.username.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (user.externalUsername &&
          user.externalUsername.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (user.name && user.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        profileTags.some((tag) => tag.includes(lowerCaseSearchTerm))
      );
    });
  }, [data, searchTerm]);

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <input
          type="text"
          placeholder="Search Readers or Genres"
          value={searchTerm}
          className="w-full max-w-sm rounded-md border-2 border-gray-600 bg-gray-600 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="m-auto grid place-content-center gap-4 p-5">
        {filteredData.length > 0 ? (
          filteredData.map((user) => (
            <div key={user.id} className="flex items-center gap-2">
              <Link href={`/@${user.externalUsername ?? user.name}`}>
                <div className="overflow-hidden rounded-full transition-shadow hover:shadow-md hover:shadow-violet-300">
                  <Image
                    src={user.profileImageUrl}
                    alt={user.name}
                    width={50}
                    height={50}
                    className="h-[50px] w-[50px] object-cover"
                  />
                </div>
              </Link>
              <div className="transition-colors hover:text-violet-400">
                <Link href={`/@${user.externalUsername ?? user.name}`}>
                  <p>@{user.externalUsername ?? user.name}</p>
                </Link>
                <div className="flex flex-wrap gap-2 text-xs">
                  {data?.profiles
                    .find((profile) => profile.userId === user.id)
                    ?.tags.split(",")
                    .map((tag) => (
                      <div
                        key={tag}
                        className="cursor-pointer rounded-xl bg-slate-950 py-1 pl-2 pr-1"
                      >
                        <p>{tag}</p>
                      </div>
                    )) ?? ""}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No Matches</div>
        )}
      </div>
    </>
  );
};

const Discover: NextPage = () => {
  const { data, isLoading } = api.profile.getAllUsers.useQuery();

  if (isLoading)
    return (
      <div className="mt-4 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <main className="min-h-screen flex-col items-center">
        <div>
          <h1 className="text-center text-4xl font-bold text-violet-300">
            Discover
          </h1>
        </div>
        <Feed />
      </main>
    </>
  );
};

export default Discover;
