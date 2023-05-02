import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
// import { Inter } from 'next/font/google'
import { Poppins } from "next/font/google";
import Navbar from "~/components/NavBar";
import Head from "next/head";


import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";

// const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({
  weight: ['100', '400', '500', '700'],
  subsets: ['latin'] 
})

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Book Keeper</title>
        <meta name="description" content="A place for your books" />
        <link rel="icon" href="/book-stack.png" />
      </Head>
      <Toaster />
      <div className={poppins.className}>
        <Navbar />
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
