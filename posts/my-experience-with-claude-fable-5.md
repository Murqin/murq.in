# My Experience with Fable 5

## A quick disclaimer

I want to be upfront about the timeline: I wasn't one of the people who tried Fable 5 on its actual day-one launch (June 9). What I actually got was access from around July 1st–2nd — which, as it turns out, was itself a kind of "day one," since Fable 5 had been pulled offline for everyone worldwide on June 12 due to a US export-control directive, and only came back online on July 1 after the controls were lifted. So I didn't miss some lucky-few early window — for about three weeks in between, nobody outside a small vetted group could use it at all. I just happened to jump in right as it reopened to the public.

## Projects I built with it

* **3D Art Museum** — built with Vite + Three.js + React, a museum of public-domain artworks organized by era. (I lifted the idea from a YouTube video.)
* **The blog you're reading right now**, on my site.

## Project-by-project experience

**3D Art Museum**

This was a project idea I picked up from a video my YouTube algorithm recommended while I was watching Fable 5 content — I wanted to build it myself just to have it as one of my own hands-on experiences with the model. One thing worth mentioning first: I normally use [superpowers](https://github.com/obra/superpowers), but I turned it off for this project. My reasoning was that skill-injection tools like that tend to constrain the model slightly, so I went into this one without it. I might be wrong about that, but I didn't get noticeably worse results without it either.

The one real problem I ran into: I ran Fable and Opus side by side to compare them, and my quota burned through before I was even halfway done. I ended up solving it 3–4 hours later by running Fable alone — it still ate through quota fast, but at least I got to see the project through to the end.

**Murq.in blog section**

I'd actually been working on this blog section for a day or two, and it reached its final form today. I have to admit I burned through a good chunk of Claude quota on this one too — honestly, most of the time went into waiting for quota to refresh rather than actual work. I'm not a "real" developer in the old sense of hand-writing everything, so these days I basically just vibe-code — I don't have the luxury of writing code without a model. Even though I know a little bit of programming, I can't get much further than a "hello world" or a basic calculator on my own.

One more thing worth explaining: why I didn't use a standard web framework for this site and blog. It's not really about not wanting to strain people's systems — if anything, code generated through vibe-coding probably strains your systems *more* than usual. It's more that I felt a framework would be over-engineering for what this is, so I went vanilla. It also feels a bit more like it has my own signature on it — though I'm honestly not sure if the site really carries my signature, or how much "my own" a piece of AI-generated code can really be.

## General experience with the model

I'm not someone who works with these models anywhere near as much as a professional developer does, but comparing this model against others in my usage history, I've needed far fewer corrections with this one. I saw its ability to handle more complex tasks with minimal hand-holding clearly in the 3D Art Museum project.

To be fair — I did feed [Anthropic's documentation](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) to Opus 4.8 and had it draft a detailed master prompt for me first. But even so, the project felt basically ready to ship after just one or two polish passes. I'm aware the code quality itself is debatable — but my view on software is: if it does the job and solves the problem, that's good enough for me. There's probably a cliff of technical debt behind me somewhere. :D

## Note on this post's production

For transparency: this specific post was translated into English and lightly edited for readability by Claude Sonnet 5, based on my original Turkish draft. No new claims or content were added — the edits were limited to phrasing, structure, and translation.