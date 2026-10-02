import { NumbersView } from "@/components/numbers-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Numbers",
  description:
    "Turn your expenses, tax buffer, and project price into the number that has to be true before you leave your job.",
}

export default function NumbersPage() {
  return <NumbersView />
}
