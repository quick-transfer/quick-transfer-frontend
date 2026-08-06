import { redirect } from "next/navigation";

export default function LegacyManagerLocationsPage() {
  redirect("/manager/vacancies");
}
