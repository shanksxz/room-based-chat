"use client"

import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Room from '@/components/Room';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace("/auth/login");
    }
    console.log("status", status);
    console.log("session", session);
  }, [status, router]);

  if (status === 'loading') {
    return <h1>Loading........</h1> 
  }

  if (status === 'authenticated' && session?.user?.email) {
    return (
      <Room/>
    );
  }

  return null;
}