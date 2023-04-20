import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
// import { Inter } from 'next/font/google'
import { Poppins } from "next/font/google";

import Navbar from "~/components/NavBar";

import { api } from "~/utils/api";

import "~/styles/globals.css";

// const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({
  weight: ['100', '400', '500', '700'],
  subsets: ['latin'] 
})

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <main className={poppins.className}>

      <div className="bg-slate-800">
        <Navbar />
        <Component {...pageProps} />
      </div>
      </main>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
