import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

import logo from "../assets/bookLogo.png";

import { useState } from "react";


function Navbar() {
  const { isSignedIn, isLoaded: userLoaded, user } = useUser();

  const username = user?.externalAccounts.find(account => account.username)?.username

  const [navbar, setNavbar] = useState(false);

  if (!userLoaded) return <div className="p-3 w-full rounded-md bg-slate-950"></div>

  return (
    <div className="p-3">
      <nav className="w-full rounded-md bg-slate-950">
        <div className="mx-auto justify-between px-4 md:flex md:items-center md:px-8 lg:max-w-7xl">
          <div>
            <div className="flex items-center justify-between py-3 md:block md:py-5">
              <Link href="/" className="flex gap-1 items-center">
                <span>
                  <Image src={logo} alt="Book Keeper" width={30} height={30} />
                </span>
                <h2 className="text-1xl font-bold text-violet-300">
                  BookKeeper
                </h2>
              </Link>
              {/* HAMBURGER BUTTON FOR MOBILE */}
              <div className="md:hidden">
                <button
                  className="rounded-md p-2 text-violet-300 outline-none focus:border focus:border-gray-400"
                  onClick={() => setNavbar(!navbar)}
                >
                  {!navbar ? (
                    <svg
                      className="h-6 w-6"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div
              className={`mt-8 flex-1 justify-self-center transition-all pb-3 md:mt-0 md:block md:pb-0 ${
                navbar ? "block p-12 md:p-0" : "hidden"
              }`}
            >
              <ul className="h-screen items-center justify-center md:flex md:h-auto ">
                <li className="border-b-2 border-violet-500 py-3 text-center text-sm text-white hover:bg-violet-600  md:border-b-0  md:px-6  md:hover:bg-transparent md:hover:text-violet-600">
                  <Link href="/" onClick={() => setNavbar(!navbar)}>
                    Book Club
                  </Link>
                </li>
                {isSignedIn && (
                  <>
                    <li className="border-b-2 border-violet-500 py-3 text-center text-sm text-white hover:bg-violet-600  md:border-b-0  md:px-6  md:hover:bg-transparent md:hover:text-violet-600">
                      <Link href={`/@${username ? username : user.id}`} onClick={() => setNavbar(!navbar)}>
                        My Books
                      </Link>
                    </li>
                    <li className="border-b-2 border-violet-500 py-3 text-center text-sm text-white hover:bg-violet-600  md:border-b-0  md:px-6  md:hover:bg-transparent md:hover:text-violet-600">
                      <Link href="/add-book" onClick={() => setNavbar(!navbar)}>
                        Add Book
                      </Link>
                    </li>
                    <li className="border-b-2 border-violet-500 px-6 py-3 text-center text-sm text-white  hover:bg-violet-600  md:border-b-0  md:hover:bg-transparent md:hover:text-violet-600">
                      <Link href="/wishlist" onClick={() => setNavbar(!navbar)}>
                        Wishlist
                      </Link>
                    </li>
                  </>
                )}
                {!isSignedIn && (
                  <li className="border-b-2 border-violet-500 px-6 py-3 text-center text-sm text-white  hover:bg-violet-600  md:border-b-0  md:hover:bg-transparent md:hover:text-violet-600">
                    <SignInButton />
                  </li>
                )}
                <li className="border-violet-500 px-6 py-2 text-center text-white  hover:bg-violet-600  md:border-b-0  md:hover:bg-transparent md:hover:text-violet-600">
                  <div className="flex justify-center gap-2">
                    <UserButton />
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
