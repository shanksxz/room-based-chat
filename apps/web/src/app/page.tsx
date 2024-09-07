"use client"
import ChatArea from "@/components/ChatArea";
import ChatApp from "@/components/Main";
import { signOut, useSession } from "next-auth/react";
import { Main } from "next/document";
import { useRouter } from "next/navigation";

export default function Page() {
  // const session = await auth();
  // if(!session?.user.email) {
  //   return <p>Not logged in</p>
  // }

  const session = useSession();
  const router  = useRouter();
  console.log(session);

  if(!session.data?.user.email) {
    router.push("/auth/login");
  }

  return (
    <ChatApp />
  );
}
