import { getProfile } from "@/lib/content";
import Navbar from "./components/layout/navbar/navbar";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  return (
    <>
      <Navbar profile={profile} />
      {children}
    </>
  );
}
