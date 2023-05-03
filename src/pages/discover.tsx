import { type NextPage } from "next";

import { LoadingSpinner } from "~/components/loading";
import Image from "next/image";

import { api } from "~/utils/api";

import { useState } from "react";
import Link from "next/link";

const Feed = () => {
  const { data } = api.profile.getAllUsers.useQuery();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data?.filter((user) => {
    if (searchTerm.trim() === "") {
      return true;
    } else if (user.username) {
      return user.username.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (user.externalUsername) {
      return user.externalUsername
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    } else {
      return user.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <input
          type="text"
          placeholder="Search Readers"
          value={searchTerm}
          className="w-full max-w-sm rounded-md border-2 border-gray-600 bg-gray-600 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="m-auto grid place-content-center gap-4 p-5">
        {filteredData?.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <div className="overflow-hidden rounded-full">
              <Image
                src={user.profileImageUrl}
                alt={user.name}
                width={50}
                height={50}
              />
            </div>
            <div>
              <Link href={`/@${user.externalUsername ?? user.name}`}>
                <p>{user.externalUsername ?? user.name}</p>
              </Link>
            </div>
          </div>
        ))}
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
