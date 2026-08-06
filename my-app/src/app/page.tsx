import { redirect } from "next/navigation";

export default function Home() {
  // The proxy normally resolves this entry point by role.
  redirect("/login");
}
