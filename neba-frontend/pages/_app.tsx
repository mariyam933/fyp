import Layout from "@/components/layouts/Layout";
import { AuthProvider } from "@/context/auth";
import "@/styles/globals.css";
import ToasterProvider from "@/utils/ToasterProvider";
import type { AppProps } from "next/app";
import Head from "next/head";
import { resetServerContext } from "react-beautiful-dnd";


export default function App({ Component, pageProps }: AppProps) {
  resetServerContext();
  const getLayout = (Component as any).getLayout || ((page: JSX.Element) => <Layout>{page}</Layout>);
  return (
    <>
      <Head>
        <title>Neba Billing</title>
      </Head>
      <AuthProvider>
        <ToasterProvider />
        {getLayout(
          <Component {...pageProps} />
        )}
      </AuthProvider>
    </>
  );
}
