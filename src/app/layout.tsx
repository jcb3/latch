import { Shell } from "@/components/shell"
import { StudioProvider } from "@/components/studio-provider"
import type { Metadata } from "next"
import { Newsreader, Outfit } from "next/font/google"
import "./globals.css"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
})

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: {
    default: "Latch — a plan to start a web studio",
    template: "%s · Latch",
  },
  description:
    "A practical plan for starting a web development studio while you still have a job, and the numbers that say when it can replace your paycheck.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <StudioProvider>
          <Shell>{children}</Shell>
        </StudioProvider>
      </body>
    </html>
  )
}
