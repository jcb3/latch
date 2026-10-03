# Latch

Latch is a planning tool for starting a web development studio while you still have a job. It holds the order of work, the week that fits around a 9-to-5, and the four gates that have to open before you resign.

Your checklist, numbers, offer, and pipeline are saved in this browser. There is no account and no server.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3847](http://localhost:3847).

```bash
npm test
npm run lint
npm run build
```

`npm run build` writes a static site to `out/`. Each browser keeps its own plan in local storage.

## GitHub Pages

The site publishes from a public GitHub repository on every push to `main`. The workflow is `.github/workflows/pages.yml`. A repository named `<user>.github.io` is served at `https://<user>.github.io/`. Any other name is served at `https://<user>.github.io/<repo>/`.

This environment cannot sign in as jaycb1978@gmail.com. After that GitHub account exists, run this from WSL:

```bash
gh auth login
bash scripts/publish-github-pages.sh
```

The script creates a public repo named `latch` (pass another lowercase name as the first argument), turns on Pages from GitHub Actions, and pushes `main`. The live URL prints when the push succeeds. The first visit works after the Pages workflow on GitHub turns green.

## What’s inside

- **Plan** — the sequence from “read your employment agreement” through the first paid client, a repeatable delivery, and a clean resignation.
- **Numbers** — a quit number from your expenses, health insurance, and retirement, plus the revenue the studio has to collect after a tax buffer. The figures start as an example. Replace them.
- **Clients** — one offer, three packages, a first outreach note, and the list of businesses you are going to contact.
- **Calls** — a Youngsville, Louisiana list built by opening the websites on the city business directory and writing down one specific fault.

## The gates

Leave the job when all four are true:

1. Six months of personal expenses in cash.
2. Three consecutive months of studio revenue at or above the monthly target.
3. Six weeks of paid work already signed.
4. Health coverage lined up, with a real quote or a partner’s plan confirmed.

The 30% tax buffer is a planning default for a US sole prop. It is not a filing instruction. A CPA should set the real percentage, and an employment attorney should read an unclear moonlighting or invention clause before you write client code.

## Stack

Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
