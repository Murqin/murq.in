---
title: "After a Long Break: Opus, a Cheat Written by ChatGPT, and From Sketch to Image"
date: 2026-10-24
summary: Moving from Fable 5 to Opus 5.5, getting ChatGPT to write a game cheat, a better way to generate images with AI, who I make my mods for, and why I share what I build.
---

Hi. I haven't published a blog post in quite a while. Today is October 24, and I thought I'd record one and put it out. It's been a while since I shared what's on my mind here.

I also keep changing versions of the site: I used versions without a blog, tried a stripped-down one, and now I'm back to the old one. I don't know if anyone reads this; I'm writing on the assumption that someone does. Actually, I'm not even writing: I talk, and AI writes. My last post was also created with AI. From now on, all of this will be marked on the site with a badge.

## From Fable 5 to Opus 5.5

I wrote about using Fable 5. Since then, Opus models have been arriving one after another; I remember versions like Opus 5.4 and 5.5 coming out, plus Sonnet 5. I used Sonnet too, then moved to Opus. These days I'm on Opus 5.5.

I also tried Gemini 4.0 Argon. It's not really a model for me; I watched a YouTube review of it as well. I use AI to build tools for my own needs, and right now Opus is the model I'm most comfortable with.

Opus 5.5 is genuinely very smart. I run it on the medium setting; it seems to get a lot done without burning through many tokens.

## AI in daily life and system administration

I don't use Opus only for code; I use it in daily life too. I turn to it for system administration and complex tasks on Linux. I don't know commands anymore, and honestly I never did. I used to get by asking AI things like "How do I do this? How do I fix this problem?"

I have Opus set up local models for me, too. One day I was bored and wanted to try an uncensored model. I said, "Dude, go install this and do the optimizations it needs." It installed it, we downloaded it, I tried it. It was nice.

## Getting ChatGPT to write a cheat, and hack vs hack

The other day I discovered something. It's a topic that normally runs hard into Claude's guardrails: ChatGPT wrote me a game cheat, no questions asked.

By "no questions asked" I mean this: I think I told it I wouldn't join servers with regular players and would only play on hack vs hack servers or on a banned account; I'm not entirely sure, and I don't really remember what kind of conversation got it to agree. I said, "Let's build a CS cheat," and we got to work. It knocked it out, bit by bit. It looked at people's reverse engineering write-ups and did good work with them. On paper it was a nice-looking cheat; the wallhack worked, and in practice it worked somewhat too.

First I played a bit in my own private match. Then, thinking "I'll be cheating there anyway," I joined a hack vs hack server. The other players' computers played better than I did. Joining hack vs hack really is hilarious.

By the way, I had only just bought a ChatGPT subscription, so that's what I tried the cheat with. On the version I used that day, you didn't need to bother with any special jailbreak. But if one day they say "We want to ban cheat development," that may change. It's up to OpenAI.

Generally, though, I use Opus through Claude Code; it's part of most of what I do.

## Generating better images with AI

Let me talk about something I did just before recording: I found a more effective way to generate images with AI. You give the model a few references, describe "this should look like this, that like that," and have the prompt written for you. I don't write the prompt myself; I have Claude write it, and I just talk in plain language.

Image models still want detailed prompts, and so do video models; they're not like the chat models we use every day. If you don't give them detail, they can't produce anything good.

So Claude and I, meaning Claude Code, which goes from my computer to Anthropic's servers, sat down and tried things out to see how we could do better. My goal was to get away from that "house style," the generic look everyone recognizes in ChatGPT images. I have ComfyUI on my computer for generating images with local models. We thought, what if we generate an image with that and give it as a reference? It turned out really well. At least to my eye it didn't look like a generic ChatGPT image. You'll judge better than me; you might say, "Come on, it looks just like a generic ChatGPT image."

## From sketch to finished drawing

I thought that if I were someone who draws by hand, I'd send the model a sketch. I'd scribble something for 5–10 minutes, maybe 15–20, in a way that reflects my own style.

Honestly, I don't know how to develop my own style. I think you start drawing the things that look good to you, the things you borrow from others and mix together, and after a while what we call a style takes shape. I don't know much about drawing; I'd be glad if artists could enlighten me.

The idea is this: you draw a sketch for half an hour, 45 minutes. Then going from the sketch to a finished drawing takes 5–6, maybe 7–8 hours of work. If I can give the model a proper prompt, or tell Claude, "I drew something like this, let's generate it with AI; let it do the coloring and the final version," I'm spared that grind. It struck me as a really good idea.

From an artist's point of view it may be a bad idea, I can't say; people might say "human effort is necessary." But if the result looks like what I wanted, that's fair game for me. It feels like learning to draw just well enough to sketch would be enough for me. Basic anatomy and so on would be needed, of course, but right now I have other goals in mind: learning math, and a university goal I've set for myself. I don't know if it'll happen.

## Ownership, and why I share

There are copyright laws too, of course: once you run something through AI, it no longer counts as yours. Say you've drawn the kind of basic but somewhat detailed sketch a skilled artist would turn out in 30–45 minutes; over time you'll reach those speeds too. You send it to the model and say "color this, do that like this." None of that matters to me anymore, because I'm the user.

Models let me increase my productive capacity, however much of an illusion that may seem. An open source developer might come along and say, "But you didn't write that code, AI did." Yes, AI writes it; it writes the material that gets my work done. And I share the results of my experiments, their inputs and outputs, my coding write-ups and my experiences for anyone who wants to use them.

Because there could be security holes, I'll add a disclaimer from now on: I use AI. Even if I build a 100% product, I'll state "AI was used, be aware of that."

## Who my mods are for

Minecraft mods don't need that much security effort; a few basic precautions are enough. I don't expect scalability from a Minecraft mod either.

I make mods for fun, for people to use while playing with their friends. Five or six people use one and that's it. I removed the plugins I'd built for large servers; I think I also made them private on GitHub. My idea of a mod is this: a group of five or six friends gets together, turns the mods on and plays. That's why I don't push hard on product thinking or heavy security thinking.

I know my audience is laid-back players. I don't offer anti-cheat to PvP servers, or tools that make PvP improvements; I don't write mods or plugins like that. For example, I have a mod called No Crop Trample. What does it do? It stops crops from getting trampled: a simple thing that hooks into an in-game action and changes it.

## Goals

I know the things on my mind lately are a bit unusual. But it's fun; setting myself different goals feels like it could make my life better. I don't actually want to be a software developer. First I'll finish high school, then decide depending on how things go. I'm thinking of computer science up to PhD level, but that's a bit much: why am I talking about it before I've done it? It's most likely a goal that will blow up in my face.

Until then, I'll keep developing with AI as a hobby and lay down foundations, template-like, that people can benefit from. People can take them and adapt them to their own level of expertise; the work goes faster. If someone has already built something and the code isn't badly maintained, the next person says "Here are some problems, shall we fix them?" and improves it. I know reviewing code is the bigger headache right now. But I share my experiments and the tools I use myself when I think they might be useful to someone else.

## How No Crop Trample came about

I used to use a plugin that did this on a server. No Crop Trample has two versions, and I have a confession about the first one: I tried to do a clean room implementation, but it wasn't clean room. Back then I didn't know much; I didn't know where using code from unlicensed repositories would lead. I told the AI agent, "Go into this code, look through it, we're porting it to Fabric." In the end I decided to delete that first version and released a new one, which is the one up now.

For the new version I tried to do a clean room implementation, and actually took a different route from that. With Claude, we found an approach that doesn't break with every version; there turned out to be a few ways to do it, and I think we picked a somewhat different one. We went with that.

If I rebuilt this mod from scratch with Opus 5.5 now, we'd most likely take a very different approach. I'd look at what's out there and what isn't, and ask which approaches we could use.

My idea of development goes beyond building scalable products or feats of engineering: the reason I use software is to make things that solve my problems. I can't write code at a level where a thousand people can use it at once without issues, or that saves thousands of dollars on a server bill.

## Everything I make is with AI

These days I generate everything from scratch with AI, my profile pictures included. Everything I have will be made with AI, and with the method I just discovered.

In practice it goes like this: I send Akane Kurokawa as "make it look like this," I add a nice pose if I find one, then I say "Combine all of these, buddy" and give the prompt. Claude splits and packages the references so I can hand them to the model, and I send them all to the model.

I look for references on Pinterest. I usually browse myself; a few times I had Claude browse for me, but it also picks up low-quality images. I want to find them myself, but I don't know how to search Pinterest properly, and I don't want to learn anything extra just for that. We're slowly moving to an agentic internet. I don't know if we're there yet; you'll be reading this in years to come. If we got there, we'll say "We finally made it to the agentic internet." If we didn't, either I had to learn how to use Pinterest, or I asked someone who uses it, "Find me some profile pictures."

## Wrapping up

I think I already said "I'm wrapping up" once before, but this is the real ending.

If you were curious about what's in this post and had AI summarize it for you, thank you first of all. And thanks for reading. You don't have to read the whole thing; AI can summarize what I talked about and what I went through. That's why I added a prompt to the "copy md" button on this page: a standard summarizing prompt that works with any model, so you don't have to write your own. Just press the button and paste.

My name is actually Muratcan, but everyone knows me as Murqin. One of my close friends straight up calls me "Muq." If he's reading, he's reading this post too, I hope. I used to publish only in English; in case he can't be bothered to read English, from now on I'll publish everything in Turkish too, since most of what I do is AI-assisted anyway.

Murqin out. Bye bye.
