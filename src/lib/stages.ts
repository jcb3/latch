import type { Stage } from "@/lib/types"

export const stageLabels: Record<Stage, string> = {
  new: "New",
  talking: "In conversation",
  proposal: "Proposal out",
  won: "Signed",
  passed: "Passed",
}

export const stageItems = (Object.keys(stageLabels) as Stage[]).map((value) => ({
  value,
  label: stageLabels[value],
}))
