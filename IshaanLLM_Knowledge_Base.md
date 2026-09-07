# IshaanLLM — Knowledge Base

<!--
  THIS DOCUMENT IS THE ONLY PLACE ANSWERS LIVE.

  Nothing in the interface knows anything about Ishaan. It reads this file,
  matches a question to a section, and shows what the section says. So writing
  a good answer here is the whole of teaching it something — there is no
  prompt, no model and no second copy of any of this in the code.

  ── THE FORMAT ────────────────────────────────────────────────────────────

  Every `##` heading is one ENTRY: one subject, one answer. Under the heading
  come optional directive lines, then the prose.

      ## Cypherock
      tags: cypherock, hardware wallet, x1 vault, current job
      ask: What did you work on at Cypherock?
      ask: Tell me about Cypherock
      see: Cypherock X0, Design philosophy

      The first paragraph is the answer. Keep it to two or three sentences —
      this is what someone gets when they ask about this subject, so it should
      be the version you would say out loud, not everything you know.

      ### The hard part
      when: hardest, difficult, challenge, tricky

      A `###` block is a DETAIL. It is only reached by a question that asks
      for it, using the words in `when:`. This is how one entry answers
      "tell me about X" and "what was the hardest part of X" differently.

  ── THE FOUR DIRECTIVES ───────────────────────────────────────────────────

  tags:   Words that should point at this entry. Comma separated. Write the
          words a stranger would use, not the ones you would — "wallet",
          "crypto", "security", not just the product name.

  ask:    A question this entry answers well, written the way a person would
          type it. These do double duty: they are the strongest possible match
          for that question, AND they are what appears as the clickable
          suggestions. Two or three per entry is plenty. The first `ask:` of
          an entry is the one offered as a follow-up when another entry
          points here.

  see:    Other entry titles, comma separated. After answering from this
          entry, the interface offers the first `ask:` of each of these as a
          follow-up question — so this is how you author the path a
          conversation takes. Names must match the `##` headings exactly.

  when:   Only on `###` detail blocks. The words that reach this detail
          rather than the entry's main answer.

  ── THREE RULES WORTH KEEPING ─────────────────────────────────────────────

  1. If it is not in this file, the answer is "I don't have that in my
     knowledge base yet." That is by design and it is the point: it cannot
     invent anything, so anything it says is something you wrote.

  2. The first paragraph of an entry is a real answer, not an introduction to
     one. "Cypherock is a hardware wallet company" is an answer. "Let me tell
     you about my time at Cypherock" is not.

  3. Put an `open: true` directive on the entries you want offered before the
     conversation starts. Three or four across the file, no more.

  Everything below this comment is placeholder text, written so the whole
  thing is testable end to end. Replace it — the format is what matters, not
  the content.
-->

## Work

tags: work, projects, portfolio, what do you do, overview, designer
ask: Tell me about your work
ask: What do you do?
see: Cypherock, Onefinnet Talent, Design philosophy
open: true

PLACEHOLDER — I'm a product designer who engineers. Most of my time goes into
hardware-adjacent products where the industrial object and the software have to
be designed as one thing, and the rest goes into design systems that let a
small team ship consistently.

### What I actually do day to day
when: day to day, daily, typical day, routine

PLACEHOLDER — Roughly: figuring out what the thing should be, drawing it,
building enough of it to know whether the drawing was right, and then writing
down the decision so the next person does not have to re-make it.

## Cypherock

tags: cypherock, hardware wallet, x1 vault, x0, current job, crypto, self custody, security
ask: What did you work on at Cypherock?
ask: Tell me about Cypherock
see: Cypherock X0, N45 Design System, How I work with engineers
open: true

PLACEHOLDER — Cypherock makes self-custody hardware wallets. I'm on the product
team, where I work across the mobile app, the design system behind it, and the
physical product itself.

### The hard part
when: hardest, hard, difficult, challenge, challenging, tricky, problem

PLACEHOLDER — The hard part is that a hardware wallet has to be understood by
someone who has never held one, in a category where being wrong once is
permanent. Almost every design decision is a trade between explaining more and
asking less.

## Cypherock X0

tags: x0, cards, nfc, tap, product identity, industrial design, case study
ask: Tell me about Cypherock X0
ask: What did you design for X0?
see: Cypherock, Design philosophy
open: true

PLACEHOLDER — X0 is a card-based wallet — the recovery is split across physical
cards you tap rather than a phrase you write down. I worked on its product
identity and the onboarding that has to teach the whole idea in about ninety
seconds.

### The NFC experience
when: nfc, tap, tapping, gesture, interaction

PLACEHOLDER — Tapping is the entire interaction, so most of the work was in
what happens in the half second around the tap: what confirms it, what happens
when it misses, and how you learn where to hold the card without being told.

## Onefinnet Talent

tags: onefinnet, talent, recruitment, saas, ai, dashboard, case study
ask: What was your role at Onefinnet?
ask: Tell me about Onefinnet Talent
see: Work, How I work with engineers

PLACEHOLDER — Onefinnet Talent is an AI-assisted recruitment product. I designed
the reviewer-facing side of it: the screens where a human decides what the model
got right.

## Design philosophy

tags: philosophy, approach, principles, process, how do you design, product design, different
ask: What is your design philosophy?
ask: What makes you different from other product designers?
see: How I work with engineers, Work
open: true

PLACEHOLDER — I think the job is to remove decisions, not to add features. A
design is finished when there is nothing left to take out and the thing still
explains itself without a tooltip.

### On craft
when: craft, detail, polish, quality

PLACEHOLDER — Detail is not decoration. The reason to spend a day on a spring
curve is that motion is how a person learns what an interface is made of.

## How I work with engineers

tags: engineers, engineering, developers, handoff, collaboration, team, code
ask: How do you work with engineers?
ask: Do you write code?
see: N45 Design System, Design philosophy

PLACEHOLDER — I build. Not production code most of the time, but enough that a
handoff is a conversation about trade-offs rather than a document. It also means
I find the impossible ideas before an engineer has to.

## N45 Design System

tags: n45, design system, tokens, components, documentation, library
ask: Tell me about the design system you built
see: How I work with engineers, Cypherock

PLACEHOLDER — N45 is the design system behind Cypherock's products: tokens,
components and the documentation that makes them survive contact with a
roadmap.

## Tools and technologies

tags: tools, technologies, tech, stack, software, figma, code, what do you use
ask: What technologies do you work with?
see: How I work with engineers

PLACEHOLDER — Figma for design work, and enough front-end to prototype
properly. This portfolio is hand-written HTML, CSS and JavaScript with no
framework and no build step, which is on purpose.

## Education

tags: education, study, studied, university, college, school, degree, upes
ask: Where did you study?
see: Work

PLACEHOLDER — I'm studying at UPES, in Dehradun.

## Where I am

tags: where, location, based, city, gurugram, india, remote
ask: Where are you based?
see: Work

PLACEHOLDER — Gurugram, India.

## Getting in touch

tags: contact, email, hire, hiring, available, reach, talk, work together
ask: How do I get in touch?
see: Work

PLACEHOLDER — The Copy email button in the sidebar is the fastest way, and the
Links list has everything else.
