# IshaanLLM — Knowledge Base

<!--
  THIS DOCUMENT IS THE ONLY PLACE ANSWERS LIVE.

  Nothing in the interface knows anything about Ishaan. It reads this file,
  matches a question to a section, and shows what the section says. So writing
  a good answer here is the whole of teaching it something — there is no
  prompt, no model and no second copy of any of this in the code. Search the
  JavaScript for a question mark inside the suggestion engine: there are none.

  ── THE FORMAT ────────────────────────────────────────────────────────────

  Every `##` heading is one ENTRY: one subject, one answer. Under the heading
  come optional directive lines, then the prose.

      ## Cypherock
      tags: cypherock, hardware wallet, x1 vault, current job
      ask: What did you work on at Cypherock?
      ask: Tell me about Cypherock
      see: Cypherock X0, Design philosophy
      where: work

      The first paragraph is the answer. Keep it to two or three sentences —
      this is what someone gets when they ask about this subject, so it should
      be the version you would say out loud, not everything you know.

      ### The hard part
      when: hardest, difficult, challenge, tricky
      ask: What was the hardest part?

      A `###` block is a DETAIL. It is reached either by a question that uses
      one of its `when:` words, or by someone pressing the question in its
      `ask:`. This is how one entry answers "tell me about X" and "what was
      the hardest part of X" with two different paragraphs.

  ── THE DIRECTIVES ────────────────────────────────────────────────────────

  tags:   Words that should point at this entry. Comma separated. Write the
          words a stranger would use, not the ones you would — "wallet",
          "crypto", "security", not just the product name.

  ask:    A question this entry answers well, written the way a person would
          type it. These do double duty: they are the strongest possible match
          for that question, AND they are what appears as the clickable
          suggestions. Two or three per entry is plenty. The first `ask:` of
          an entry is the one offered as a follow-up when another entry
          points here.

          On a `###` detail it does the same thing one level down, and this is
          what makes a conversation go deeper instead of sideways: after the
          main answer, the panel offers this entry's own details before it
          offers anything from `see:`.

  see:    Other entry titles, comma separated. Once this entry's own details
          are exhausted, the interface offers the first `ask:` of each of
          these — so this is how you author where a conversation goes when a
          subject is finished. Names must match the `##` headings exactly.

  when:   Only on `###` detail blocks. The words that reach this detail rather
          than the entry's main answer.

  where:  WHERE IN THE PORTFOLIO THIS BELONGS, and it is what makes the
          suggestions change as a visitor moves around:

              where: work          offered on the Work page
              where: about         offered on About
              where: play          offered on Play
              where: work, about   offered on both

          A case study finds its own page automatically: `## Cypherock X0`
          matches the page `work/cypherock-x0.html` because the title slugs to
          the same thing. `where: project:some-other-slug` is only needed when
          an entry and its page are named differently.

          An entry with no `where:` is general — it is available everywhere and
          is what fills the list when a page's own entries run out.

  open:   Put `open: true` on the entries you want offered when there is no
          better context to go on. Three or four across the file, no more.

  ── FOUR RULES WORTH KEEPING ──────────────────────────────────────────────

  1. If it is not in this file, the answer is "I don't have that in my
     knowledge base yet." That is by design and it is the point: it cannot
     invent anything, so anything it says is something you wrote.

  2. The first paragraph of an entry is a real answer, not an introduction to
     one. "Cypherock is a hardware wallet company" is an answer. "Let me tell
     you about my time at Cypherock" is not.

  3. Write the answers the way you talk. The panel prints them verbatim, so a
     sentence that starts "Certainly! I'd be happy to..." is a sentence a
     visitor reads. Short, direct, first person, no preamble.

  4. Give every `###` detail an `ask:`. A detail without one can still be
     typed into but can never be offered, and the offered questions are how
     most people will use this.

  Everything below this comment is placeholder text, written so the whole
  thing is testable end to end. Replace the prose — the format is what
  matters, not the content.
-->

## Work

tags: work, projects, portfolio, what do you do, overview, designer, first, start, look
ask: Tell me about your work
see: Cypherock, Onefinnet Talent, Design philosophy
where: work
open: true

PLACEHOLDER — I'm a product designer who engineers. Most of my time goes into
hardware-adjacent products where the industrial object and the software have to
be designed as one thing, and the rest goes into design systems that let a
small team ship consistently.

### The kind of problems
when: problems, problem, kind of work, sort of, what kind
ask: What kind of problems do you work on?

PLACEHOLDER — The ones where the hard part is not what it looks like. A
hardware product that has to explain itself in ninety seconds, a model whose
output a human has to be able to disagree with cheaply, a design system that
has to survive a roadmap — all the same problem wearing different clothes.

### Where to start
when: first, start, begin, which project, should i look, recommend
ask: Which project should I look at first?

PLACEHOLDER — Cypherock X0. It is the one where the physical object and the
software had to be designed as a single thing, so it is the clearest example of
what I am actually for. Onefinnet Talent is the better read if you care about
how a person argues with a model.

### What I actually do day to day
when: day to day, daily, typical day, routine
ask: What does a normal week look like?

PLACEHOLDER — Roughly: figuring out what the thing should be, drawing it,
building enough of it to know whether the drawing was right, and then writing
down the decision so the next person does not have to re-make it.

## Cypherock

tags: cypherock, hardware wallet, x1 vault, x0, current job, crypto, self custody, security
ask: What did you work on at Cypherock?
ask: Tell me about Cypherock
see: Cypherock X0, N45 Design System, How I work with engineers
where: work
open: true

PLACEHOLDER — Cypherock makes self-custody hardware wallets. I'm on the product
team, where I work across the mobile app, the design system behind it, and the
physical product itself.

### The hard part
when: hardest, hard, difficult, challenge, challenging, tricky, problem
ask: What was the hardest part?

PLACEHOLDER — The hard part is that a hardware wallet has to be understood by
someone who has never held one, in a category where being wrong once is
permanent. Almost every design decision is a trade between explaining more and
asking less.

## Cypherock X0

tags: x0, cards, nfc, tap, product identity, industrial design, case study
ask: Tell me about Cypherock X0
ask: What was your role in X0?
see: Cypherock, Design philosophy
where: work
open: true

PLACEHOLDER — X0 is a card-based wallet — the recovery is split across physical
cards you tap rather than a phrase you write down. I worked on its product
identity and the onboarding that has to teach the whole idea in about ninety
seconds.

### The hard part
when: hardest, hard, difficult, challenge, challenging, tricky, biggest
ask: What was the hardest problem to solve?

PLACEHOLDER — Teaching the split-card idea without a diagram. People already
have a model for a recovery phrase, and X0 replaces it with something better
that looks, at first glance, like more things to lose.

### The NFC experience
when: nfc, tap, tapping, gesture, interaction, experience, designed this way
ask: Why is the tap designed this way?

PLACEHOLDER — Tapping is the entire interaction, so most of the work was in
what happens in the half second around the tap: what confirms it, what happens
when it misses, and how you learn where to hold the card without being told.

### How it was made
when: process, design process, how did you, approach, method, steps
ask: Tell me about the design process

PLACEHOLDER — Physical mock-ups before screens. The card had to feel right in a
hand before there was any point drawing what the phone said about it, so the
first three weeks were paper, plastic and a lot of thrown-away thickness.

## Onefinnet Talent

tags: onefinnet, talent, recruitment, saas, ai, dashboard, case study
ask: Tell me about Onefinnet Talent
ask: What was your role at Onefinnet?
see: Work, How I work with engineers
where: work

PLACEHOLDER — Onefinnet Talent is an AI-assisted recruitment product. I designed
the reviewer-facing side of it: the screens where a human decides what the model
got right.

### The hard part
when: hardest, hard, difficult, challenge, challenging, tricky
ask: What was the hardest part?

PLACEHOLDER — Making a confidence score mean something to someone who is not
going to read a definition of it. The reviewer has forty of these to get
through and needs to know instantly which ones deserve their attention.

### Designing around a model
when: model, ai, confidence, wrong, trust, machine
ask: How do you design around an AI that gets things wrong?

PLACEHOLDER — You design for the correction, not for the answer. The interesting
screens in that product are all about how cheap it is to disagree with the
model, because that is the moment a reviewer decides whether to trust it.

## Design philosophy

tags: philosophy, approach, principles, process, how do you design, product design, different, believe
ask: What is your design philosophy?
ask: What do you believe about design?
see: How I work with engineers, Work
where: about, work
open: true

PLACEHOLDER — I think the job is to remove decisions, not to add features. A
design is finished when there is nothing left to take out and the thing still
explains itself without a tooltip.

### On craft
when: craft, detail, polish, quality
ask: Does the detail actually matter?

PLACEHOLDER — Detail is not decoration. The reason to spend a day on a spring
curve is that motion is how a person learns what an interface is made of.

## How I got into design

tags: how did you start, got into, background, story, beginning, why design, path
ask: How did you get into product design?
see: Design philosophy, Work
where: about

PLACEHOLDER — Through building things that did not work. I wanted to make
software before I knew design was a job, and the gap between what I could build
and what I could make understandable is the thing I have been closing ever
since.

## What I'm good at

tags: good at, strengths, strength, best, skill, skills, particularly
ask: What are you particularly good at?
see: How I work with engineers, Design philosophy
where: about

PLACEHOLDER — Sitting between the drawing and the build. I am at my most useful
on a product where the hard part is not what it looks like but whether the idea
survives being made — which is most hardware, and most of anything with a model
underneath it.

## Outside of work

tags: outside, hobbies, fun, free time, weekend, lego, besides, else
ask: What do you do outside of work?
see: This playground, Where I am
where: about

PLACEHOLDER — LEGO, mostly, and taking apart things that were working fine. The
playground on this site is the same instinct with a smaller cleanup cost.

## This playground

tags: play, playground, lego, bricks, physics, desk, experiment, sandbox, this site, portfolio site
ask: Why is there LEGO everywhere?
ask: Why did you build this?
see: Tools and technologies, Design philosophy
where: play

PLACEHOLDER — Because a portfolio that only describes interaction design is a
document about swimming. The bricks are a real rigid-body simulation, they push
the navigation around, and none of it is decorative — it is the argument the
site is making, made playable.

### How the bricks work
when: how, work, works, physics, engine, simulation, interaction, drag
ask: How does the LEGO interaction work?

PLACEHOLDER — One rigid-body engine, hand-written: gravity, restitution,
stud-aligned stacking, and a set of springs that let the navigation text be
shoved sideways by anything heavy passing near it. Dragging a brick throws it
with the velocity you let go at.

### What else is in here
when: else, other, more, can i, do here, try
ask: What else can I do here?

PLACEHOLDER — Draw on the desk, drop stickers, leave a note, turn the layout
grid on, stack the bricks into something. Nothing is saved, which is deliberate
— it is a desk, not a document.

## How I work with engineers

tags: engineers, engineering, developers, handoff, collaboration, team, code
ask: How do you work with engineers?
ask: Do you write code?
see: N45 Design System, Design philosophy
where: about, work

PLACEHOLDER — I build. Not production code most of the time, but enough that a
handoff is a conversation about trade-offs rather than a document. It also means
I find the impossible ideas before an engineer has to.

## N45 Design System

tags: n45, design system, tokens, components, documentation, library
ask: Tell me about the design system you built
see: How I work with engineers, Cypherock
where: work

PLACEHOLDER — N45 is the design system behind Cypherock's products: tokens,
components and the documentation that makes them survive contact with a
roadmap.

## Tools and technologies

tags: tools, technologies, tech, stack, software, figma, code, what do you use, built this
ask: What technologies do you work with?
ask: How was this site built?
see: How I work with engineers, This playground
where: play

PLACEHOLDER — Figma for design work, and enough front-end to prototype
properly. This portfolio is hand-written HTML, CSS and JavaScript with no
framework and no build step, which is on purpose.

## Education

tags: education, study, studied, university, college, school, degree, upes
ask: Where did you study?
see: Work
where: about

PLACEHOLDER — I'm studying at UPES, in Dehradun.

## Where I am

tags: where, location, based, city, gurugram, india, remote
ask: Where are you based?
see: Work
where: about

PLACEHOLDER — Gurugram, India.

## Getting in touch

tags: contact, email, hire, hiring, available, reach, talk, work together
ask: How do I get in touch?
see: Work

PLACEHOLDER — The Copy email button in the sidebar is the fastest way, and the
Links list has everything else.
