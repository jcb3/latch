# Latch

Latch is a planning tool for starting a web development studio while you still have a job. It holds the order of work, the week that fits around a 9-to-5, and the four gates that have to open before you resign.

Your checklist, numbers, offer, and pipeline are saved in this browser. There is no account. Gather calls looks up local websites in the browser and asks Arbiter to write the notes when you have saved Arbiter's address on the Calls page.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3847](http://localhost:3847).

```bash
npm test
npm run lint
npm run build
npm start
```

Each browser keeps its own plan in local storage.

## Arbiter

Arbiter is the quota-aware LLM gateway. On Calls, paste its address (and a key, if it requires one). Latch stores that pair in this browser only. It is not part of the published site.

Latch sends one OpenAI-compatible chat completion per gather, at `POST {address}/v1/chat/completions`, with model `auto`. The request carries only the pages Latch already opened: name, phone, address, status, title, and a short excerpt. Arbiter chooses the provider. Latch keeps the phone, address, and website from the page and uses Arbiter's note when it names one of those sites.

If the address is empty, or Arbiter does not answer, Latch still fills Calls from the pages it opened and says so on the list. The private Arbiter repository is not in this tree. The gateway stays a separate process. A browser on GitHub Pages can call it only when that gateway allows the Pages origin.

## Calls

On Calls, choose a city and a state, then **Gather calls**. Latch geocodes the place, takes business websites mapped within about 12 km, and opens the local ones from this browser. When a site does not allow a browser to read it, Latch reads that public page through `api.allorigins.win` and does not send private addresses there. National chains and social profiles are set aside. The Youngsville sample stays available until a gather replaces it.

## GitHub Pages

`npm run build` writes a static `out/` folder. Pushing `main` to the GitHub repository runs `.github/workflows/pages.yml`, which tests, builds with base path `/latch`, and deploys Pages. From a machine signed in to that GitHub account:

```bash
gh auth login
./scripts/publish-github-pages.sh
```

The live site is [https://jcb3.github.io/latch/](https://jcb3.github.io/latch/).

## What’s inside

- **Plan** — the sequence from “read your employment agreement” through the first paid client, a repeatable delivery, and a clean resignation.
- **Numbers** — a quit number from your expenses, health insurance, and retirement, plus the revenue the studio has to collect after a tax buffer. The figures start as an example. Replace them.
- **Clients** — one offer, three packages, a first outreach note, and the list of businesses you are going to contact.
- **Calls** — a Youngsville sample, or a fresh list for any US city. Gather calls opens local websites in the browser and asks Arbiter for the note you can say on the phone.

## The gates

Leave the job when all four are true:

1. Six months of personal expenses in cash.
2. Three consecutive months of studio revenue at or above the monthly target.
3. Six weeks of paid work already signed.
4. Health coverage lined up, with a real quote or a partner’s plan confirmed.

The 30% tax buffer is a planning default for a US sole prop. It is not a filing instruction. A CPA should set the real percentage, and an employment attorney should read an unclear moonlighting or invention clause before you write client code.

## Stack

Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
