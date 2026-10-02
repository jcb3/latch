import { ClientsView } from "@/components/clients-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clients",
  description:
    "Write the offer, price three packages, and keep the list of businesses you are going to contact.",
}

export default function ClientsPage() {
  return <ClientsView />
}
