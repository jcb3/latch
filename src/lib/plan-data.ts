export type Task = {
  id: string
  title: string
  detail: string
}

export type Phase = {
  id: string
  number: string
  title: string
  goal: string
  tasks: Task[]
}

export const phases: Phase[] = [
  {
    id: "real",
    number: "01",
    title: "Make it real",
    goal: "You can take a payment without inventing the terms on the spot.",
    tasks: [
      {
        id: "agreement-read",
        title: "Read your employment agreement",
        detail:
          "Look for moonlighting, non-compete, and invention-assignment clauses. If the company claims work you do on your own time with your own equipment, get that cleared in writing before you write client code. If a clause is unclear, ask an employment attorney. A logo will not fix this.",
      },
      {
        id: "niche",
        title: "Choose one kind of buyer",
        detail:
          "A strong first niche is a local service business that already gets customers from ads or maps and has a site that fails on a phone: clinics, trades, studios, professional practices. You can change niches after five paid projects. Selling to everyone in month one keeps the pipeline empty.",
      },
      {
        id: "offer",
        title: "Write the offer in one sentence",
        detail:
          "Do this on the Clients page. The shape is: I build a specific site for that buyer so they can get a specific result. The sample sentence is about clinic booking. Replace it with the buyer you actually want.",
      },
      {
        id: "domain",
        title: "Buy the domain and an email",
        detail:
          "Your own name is a fine studio name. Buy the domain and a matching email the same day. The site can be plain. It has to say who you help, the price range, and how to start.",
      },
      {
        id: "bank",
        title: "Separate the money",
        detail:
          "Open a checking account that only the studio uses. Client payments land there, and you pay yourself out of it. Before the first invoice, ask a CPA whether a sole prop is enough where you live. An LLC can wait until the work, or the liability, is bigger than a brochure site.",
      },
      {
        id: "packages",
        title: "Price three packages",
        detail:
          "A small site, a fuller site, and a monthly care plan, with real numbers, on the Clients page. The middle package is the one you want them to buy. The care plan is what steadies income between builds. These sample prices are a starting point for local-service sites, not a quote for your city.",
      },
      {
        id: "contract",
        title: "Write a one-page agreement",
        detail:
          "Scope, price, a 50% deposit, two revision rounds, the timeline, and what happens if they go quiet for ten business days. You keep the files until the final invoice is paid. Further work is a written change. Use the same page every time.",
      },
      {
        id: "calendar",
        title: "Block eight hours a week",
        detail:
          "Two weeknights and one weekend morning, on the calendar as busy. If a week collapses, keep the weekend morning and five sales notes. Drop a delivery evening before you drop a sales week. Sunday stays off.",
      },
      {
        id: "proof",
        title: "Ship two proof pieces",
        detail:
          "Rebuild two real sites in the niche as case studies, or run one paid pilot at your real price for someone you know. One pilot. Label it as a pilot. Free work is not the model.",
      },
    ],
  },
  {
    id: "money",
    number: "02",
    title: "First money",
    goal: "One client who paid a price you would charge again.",
    tasks: [
      {
        id: "list-30",
        title: "Make a list of thirty",
        detail:
          "Names, URLs, and one specific fault. “The phone number isn’t tappable and the hours sit under a slider” is a sales note. “They need a modern web presence” is not. The pipeline on the Clients page can hold the list.",
      },
      {
        id: "outreach",
        title: "Send five notes a week",
        detail:
          "Short, about their site, one observation, and an offer to send a one-page outline. No attachment and no calendar link in the first note. Stop at five. A specific note beats a larger blast.",
      },
      {
        id: "tell-ten",
        title: "Tell ten people what you sell",
        detail:
          "Say who you help and the price range, then ask who they know. Friends and former coworkers need a sentence they can repeat. That sentence is the offer you wrote.",
      },
      {
        id: "package-not-hours",
        title: "Quote the package",
        detail:
          "If a prospect wants hourly, change the scope until it fits a package. An hourly quote turns the studio into a job with worse benefits. Cut pages before you cut the price.",
      },
      {
        id: "deposit",
        title: "Take the deposit before you send files",
        detail:
          "No design files, no repository, and no “I’ll start this weekend” until the deposit has cleared. This is the rule that filters clients who were never going to pay.",
      },
      {
        id: "one-project",
        title: "Keep one build open",
        detail:
          "While you have a job, one active project. The next one waits, or you refer it. A second build is how the work gets sloppy, and how a day job starts to notice.",
      },
      {
        id: "testimonial",
        title: "Close the loop the week you launch",
        detail:
          "Ask for a short testimonial and one introduction in the same week the site goes live. A referral from finished work is worth more than another cold list.",
      },
    ],
  },
  {
    id: "repeat",
    number: "03",
    title: "Make it repeatable",
    goal: "The second and third clients take less of you.",
    tasks: [
      {
        id: "delivery-checklist",
        title: "Write the delivery checklist",
        detail:
          "Kickoff questions, sitemap, design, build, review, launch, handoff. The same order every time. You are writing down a process you have already survived, not designing a methodology.",
      },
      {
        id: "case-study",
        title: "Publish a case study within two weeks of launch",
        detail:
          "The problem, what you changed, and one number if you have it: calls, bookings, or load time. Put it on your site before the details go cold.",
      },
      {
        id: "care-plan",
        title: "Offer care before the final invoice",
        detail:
          "Small edits, a check that forms still submit, a monthly note. Pitch it while the site is fresh. Enter what you actually collect as retainer income on the Numbers page.",
      },
      {
        id: "raise-price",
        title: "Raise the floor after two paid projects",
        detail:
          "The smallest package goes up. If buyers stay, the old price was low. If they leave, you have found the edge of this niche. Either result is information you did not have.",
      },
      {
        id: "books",
        title: "Keep the books once a month",
        detail:
          "Thirty minutes. Income, expenses, and what you paid yourself. A spreadsheet is enough until a CPA wants a different tool. Studio money stays in the studio account.",
      },
      {
        id: "say-no",
        title: "Write down the work you refuse",
        detail:
          "Rush jobs under two weeks, equity in place of a fee, unpaid exposure, and anything that needs you on call during the day job. The refusal is one or two sentences, sent the same day.",
      },
    ],
  },
  {
    id: "leave",
    number: "04",
    title: "Leave cleanly",
    goal: "The job ends because the studio can carry a month of your life.",
    tasks: [
      {
        id: "coverage",
        title: "Line up health coverage",
        detail:
          "Get a marketplace quote, and a COBRA quote if you want the comparison. Or confirm in writing that a partner’s plan covers you the month you leave. Put the monthly cost into the Numbers page. Checking this task opens the coverage gate.",
      },
      {
        id: "ninety-day",
        title: "Write the first ninety days after you leave",
        detail:
          "Half of each week stays on sales, even when delivery is full. A pipeline built at night empties if you only deliver. Plan the first month lighter than a normal month.",
      },
      {
        id: "notice-terms",
        title: "Read how notice works at your job",
        detail:
          "Two weeks is the common minimum. Your contract may require more. Prepare a written handoff. Tell your manager before coworkers hear about the studio.",
      },
    ],
  },
]

export const rules: { title: string; detail: string }[] = [
  {
    title: "The contract comes before the code",
    detail:
      "Moonlighting, non-compete, and invention clauses decide whether this is a business or a problem with your employer.",
  },
  {
    title: "One buyer, three prices",
    detail:
      "A package for one kind of local business. The middle price is the one you want. Care is how the quiet months still pay.",
  },
  {
    title: "One build while you are employed",
    detail:
      "Eight hours a week can finish a site. It cannot finish two, and it cannot absorb a client who treats you as on call.",
  },
  {
    title: "Half the fee before any files",
    detail:
      "Two revision rounds are included. The next change is a written change to the scope.",
  },
  {
    title: "Resign when the gates are open",
    detail:
      "Six months of expenses in cash, three months of revenue at your number, six weeks signed, and health coverage lined up.",
  },
]

export const week = [
  {
    day: "Monday",
    block: "45 minutes",
    detail: "Five follow-ups, or five new notes if nobody is waiting.",
  },
  {
    day: "Wednesday",
    block: "2 hours",
    detail: "Delivery. Pick up the build where Saturday left it.",
  },
  {
    day: "Thursday",
    block: "2 hours",
    detail: "Delivery again. Protect the block from errands.",
  },
  {
    day: "Saturday",
    block: "3 hours",
    detail: "The deep block. Start on the work, not the inbox.",
  },
  {
    day: "Sunday",
    block: "Off",
    detail: "A studio that takes Sunday is usually gone by month four.",
  },
]

export const allTasks = phases.flatMap((phase) => phase.tasks)

export function taskById(id: string): Task | undefined {
  return allTasks.find((task) => task.id === id)
}
