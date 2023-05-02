import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

const SingleBookPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.books.getById.useQuery({ id });

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <Head>
        <title>{data.book.title}</title>
      </Head>
      <div>{data.book.title}</div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const id = context.params?.id;
  if (typeof id !== "string") throw new Error("id is not a string");

  await helpers.books.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SingleBookPage;
