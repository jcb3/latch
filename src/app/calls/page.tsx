import { CallsView } from "@/components/calls-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calls",
  description:
    "A Youngsville, Louisiana call list built by opening local business websites and noting one specific fix.",
}

export default function CallsPage() {
  return <CallsView />
}
