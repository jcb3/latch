import { CallsView } from "@/components/calls-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calls",
  description:
    "Gather a local call list. Choose a city and state, and Latch opens business websites there.",
}

export default function CallsPage() {
  return <CallsView />
}
