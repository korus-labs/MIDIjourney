---
title: First Sounds
layout: ../../layouts/MainLayout.astro
---

import { MiniRepl } from '@src/docs/MiniRepl';
import Box from '@components/Box.astro';
import QA from '@components/QA';

# First Sounds

This is the first chapter of the Strudel Workshop, nice to have you on board!

## Code Fields

The workshop is full of interactive code fields. Let's learn how to use those. Here is one:

<MiniRepl hideHeader client:visible tune={`sound("casio")`} dirt />

<Box>

1. ⬆️ click into the text field above ⬆️
2. press `ctrl`+`enter` to play
3. change `casio` to `metal`
4. press `ctrl`+`enter` to update
5. press `ctrl`+`.` to stop

</Box>

Congratulations, you are now live coding!

## Sounds

We have just played a sound with `sound` like this:

<MiniRepl hideHeader client:visible tune={`sound("casio")`} hideHeader />

<Box>

`casio` is one of many standard sounds.

Try out a few other sounds:

```
insect wind jazz metal east crow casio space numbers
```

You might hear a little pause while the sound is loading

</Box>

**Change Sample Number with :**

One Sound can contain multiple samples (audio files).

You can select the sample by appending `:` followed by a number to the name:

<MiniRepl hideHeader client:visible tune={`sound("casio:1")`} hideHeader />

<Box>

Try different sound / sample number combinations.

Not adding a number is like doing `:0`

</Box>

Now you know how to use different sounds.
For now we'll stick to this little selection of sounds, but we'll find out how to load your own sounds later.

## Drum Sounds

By default, Strudel comes with a wide selection of drum sounds:

<MiniRepl hideHeader client:visible tune={`sound("bd hh sd oh")`} hideHeader />

<Box>

These letter combinations stand for different parts of a drum set:

- `bd` = **b**ass **d**rum
- `sd` = **s**nare **d**rum
- `rim` = **rim**shot
- `hh` = **h**i**h**at
- `oh` = **o**pen **h**ihat

Try out different drum sounds!

</Box>

To change the sound character of our drums, we can use `bank` to change the drum machine:

<MiniRepl hideHeader client:visible tune={`sound("bd hh sd oh").bank("RolandTR909")`} hideHeader />

In this example `RolandTR909` is the name of the drum machine that we're using.
It is a famous drum machine for house and techno beats.

<Box>

Try changing `RolandTR909` to one of

- `AkaiLinn`
- `RhythmAce`
- `RolandTR808`
- `RolandTR707`
- `ViscoSpaceDrum`

There are a lot more, but let's keep it simple for now

🦥 Pro-Tip: Mark a name via double click. Then just copy and paste!

</Box>

## Sequences

In the last example, we already saw that you can play multiple sounds in a sequence by separating them with a space:

<MiniRepl hideHeader client:visible tune={`sound("bd hh sd hh")`} punchcard />

Notice how the currently playing sound is highlighted in the code and also visualized below.

<Box>

Try adding more sounds to the sequence!

</Box>

**The longer the sequence, the faster it runs**

<MiniRepl hideHeader client:visible tune={`sound("bd bd hh bd rim bd hh bd")`} punchcard />

The content of a sequence will be squished into what's called a cycle.

**One way to change the tempo is using `cpm`**

<MiniRepl hideHeader client:visible tune={`sound("bd bd hh bd rim bd hh bd").cpm(40)`} punchcard />

<Box>

cpm = cycles per minute

By default, the tempo is 60 cycles per minute = 1 cycle per second.

</Box>

We will look at other ways to change the tempo later!

**Add a rests in a sequence with '~'**

<MiniRepl hideHeader client:visible tune={`sound("bd hh ~ rim")`} punchcard />

**Sub-Sequences with [brackets]**

<MiniRepl hideHeader client:visible tune={`sound("bd [hh hh] sd [hh bd]")`} punchcard />

<Box>

Try adding more sounds inside a bracket!

</Box>

Similar to the whole sequence, the content of a sub-sequence will be squished to the its own length.

**Multiplication: Speed things up**

<MiniRepl hideHeader client:visible tune={`sound("bd hh*2 rim hh*3")`} punchcard />

**Multiplication: Speed up sequences**

<MiniRepl hideHeader client:visible tune={`sound("bd [hh rim]*2")`} punchcard />

**Multiplication: Speeeeeeeeed things up**

<MiniRepl hideHeader client:visible tune={`sound("bd hh*16 rim hh*8")`} punchcard />

<Box>

Pitch = really fast rhythm

</Box>

**Sub-Sub-Sequences with [[brackets]]**

<MiniRepl hideHeader client:visible tune={`sound("bd [[rim rim] hh]")`} punchcard />

<Box>

You can go as deep as you want!

</Box>

**Play sequences in parallel with comma**

<MiniRepl hideHeader client:visible tune={`sound("hh hh hh, bd casio")`} punchcard />

You can use as many commas as you want:

<MiniRepl hideHeader client:visible tune={`sound("hh hh hh, bd bd, ~ casio")`} punchcard />

Commas can also be used inside sub-sequences:

<MiniRepl hideHeader client:visible tune={`sound("hh hh hh, bd [bd,casio]")`} punchcard />

<Box>

Notice how the 2 above are the same?

It is quite common that there are many ways to express the same idea.

</Box>

**Multiple Lines with backticks**

<MiniRepl
  hideHeader
  client:visible
  tune={`sound(\`bd*2, ~ cp, 
~ ~ ~ oh, hh*4,
[~ casio]*2\`)`}
  punchcard
/>

**selecting sample numbers separately**

Instead of using ":", we can also use the `n` function to select sample numbers:

<MiniRepl hideHeader client:visible tune={`n("0 1 [4 2] 3*2").sound("jazz")`} punchcard />

This is shorter and more readable than:

<MiniRepl hideHeader client:visible tune={`sound("jazz:0 jazz:1 [jazz:4 jazz:2] jazz:3*2")`} punchcard />

## Recap

Now we've learned the basics of the so called Mini-Notation, the rhythm language of Tidal.
This is what we've leared so far:

| Concept           | Syntax   | Example                                                                          |
| ----------------- | -------- | -------------------------------------------------------------------------------- |
| Sequence          | space    | <MiniRepl hideHeader client:visible tune={`sound("bd bd sd hh")`} />             |
| Sample Number     | :x       | <MiniRepl hideHeader client:visible tune={`sound("hh:0 hh:1 hh:2 hh:3")`} />     |
| Rests             | ~        | <MiniRepl hideHeader client:visible tune={`sound("metal ~ jazz jazz:1")`} />     |
| Sub-Sequences     | \[\]     | <MiniRepl hideHeader client:visible tune={`sound("bd wind [metal jazz] hh")`} /> |
| Sub-Sub-Sequences | \[\[\]\] | <MiniRepl hideHeader client:visible tune={`sound("bd [metal [jazz sd]]")`} />    |
| Speed up          | \*       | <MiniRepl hideHeader client:visible tune={`sound("bd sd*2 cp*3")`} />            |
| Parallel          | ,        | <MiniRepl hideHeader client:visible tune={`sound("bd*2, hh*2 [hh oh]")`} />      |

The Mini-Notation is usually used inside some function. These are the functions we've seen so far:

| Name  | Description                         | Example                                                                            |
| ----- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| sound | plays the sound of the given name   | <MiniRepl hideHeader client:visible tune={`sound("bd sd")`} />                     |
| bank  | selects the sound bank              | <MiniRepl hideHeader client:visible tune={`sound("bd sd").bank("RolandTR909")`} /> |
| cpm   | sets the tempo in cycles per minute | <MiniRepl hideHeader client:visible tune={`sound("bd sd").cpm(90)`} />             |
| n     | select sample number                | <MiniRepl hideHeader client:visible tune={`n("0 1 4 2").sound("jazz")`} />         |

## Examples

**Basic rock beat**

<MiniRepl hideHeader client:visible tune={`sound("bd sd, hh*4").bank("RolandTR505").cpm(100/2)`} punchcard />

**Classic house**

<MiniRepl hideHeader client:visible tune={`sound("bd*2, ~ cp, [~ hh]*2").bank("RolandTR909")`} punchcard />

<Box>

Notice that the two patterns are extremely similar.
Certain drum patterns are reused across genres.

</Box>

We Will Rock you

<MiniRepl hideHeader client:visible tune={`sound("bd*2 cp").bank("RolandTR707").cpm(81/2)`} punchcard />

**Yellow Magic Orchestra - Firecracker**

<MiniRepl
  hideHeader
  client:visible
  tune={`sound("bd sd, ~ ~ ~ hh ~ hh ~ ~, ~ perc ~ perc:1*2")
.bank("RolandCompurhythm1000")`}
  punchcard
/>

**Imitation of a 16 step sequencer**

<MiniRepl
  hideHeader
  client:visible
  tune={`sound(\`
[~  ~  oh ~ ] [~  ~  ~  ~ ] [~  ~  ~  ~ ] [~  ~  ~  ~ ],
[hh hh ~  ~ ] [hh ~  hh ~ ] [hh ~  hh ~ ] [hh ~  hh ~ ],
[~  ~  ~  ~ ] [cp ~  ~  ~ ] [~  ~  ~  ~ ] [cp ~  ~  ~ ],
[bd ~  ~  ~ ] [~  ~  ~  bd] [~  ~  bd ~ ] [~  ~  ~  bd]
\`).cpm(90/4)`}
  punchcard
/>

**Another one**

<MiniRepl
  hideHeader
  client:visible
  tune={`sound(\`
[~  ~  ~  ~ ] [~  ~  ~  ~ ] [~  ~  ~  ~ ] [~  ~  oh:1 ~ ],
[hh hh hh hh] [hh hh hh hh] [hh hh hh hh] [hh hh ~  ~ ],
[~  ~  ~  ~ ] [cp ~  ~  ~ ] [~  ~  ~  ~ ] [~  cp ~  ~ ],
[bd bd ~  ~ ] [~  ~  bd ~ ] [bd bd ~ bd ] [~  ~  ~  ~ ]
\`).bank("RolandTR808").cpm(88/4)`}
  punchcard
/>

**Not your average drums**

<MiniRepl
  hideHeader
  client:visible
  tune={`s(\`jazz*2, 
insect [crow metal] ~ ~, 
~ space:4 ~ space:1,
~ wind\`)
.cpm(100/2)`}
  punchcard
/>

Now that we know the basics of how to make beats, let's look at how we can play [notes](/workshop/first-notes)


---
title: First Notes
layout: ../../layouts/MainLayout.astro
---

import { MiniRepl } from '@src/docs/MiniRepl';
import { midi2note } from '@strudel.cycles/core/';
import Box from '@components/Box.astro';
import QA from '@components/QA';

# First Notes

Let's look at how we can play notes

## numbers and notes

**play notes with numbers**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("48 52 55 59").sound("piano")`}
  claviature
  claviatureLabels={Object.fromEntries(
    Array(49)
      .fill()
      .map((_, i) => [midi2note(i + 36), i + 36]),
  )}
/>

<Box>

Try out different numbers!

Try decimal numbers, like 55.5

</Box>

**play notes with letters**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("c e g b").sound("piano")`}
  claviature
  claviatureLabels={Object.fromEntries(['c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3'].map((n) => [n, n.split('')[0]]))}
/>

<Box>

Try out different letters (a - g).

Can you find melodies that are actual words? Hint: ☕ 😉 ⚪

</Box>

**add flats or sharps to play the black keys**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("db eb gb ab bb").sound("piano")`}
  claviature
  claviatureLabels={Object.fromEntries(
    ['db3', 'eb3', 'gb3', 'ab3', 'bb3'].map((n) => [n, n.split('').slice(0, 2).join('')]),
  )}
/>

<MiniRepl
  hideHeader
  client:visible
  tune={`note("c# d# f# g# a#").sound("piano")`}
  claviature
  claviatureLabels={Object.fromEntries(
    ['c#3', 'd#3', 'f#3', 'g#3', 'a#3'].map((n) => [n, n.split('').slice(0, 2).join('')]),
  )}
/>

**play notes with letters in different octaves**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("c2 e3 g4 b5").sound("piano")`}
  claviature
  claviatureLabels={Object.fromEntries(['c1', 'c2', 'c3', 'c4', 'c5'].map((n) => [n, n]))}
  claviatureLabels={Object.fromEntries(
    Array(49)
      .fill()
      .map((_, i) => [midi2note(i + 36), midi2note(i + 36)]),
  )}
/>

<Box>

Try out different octaves (1-8)

</Box>

If you are not comfortable with the note letter system, it should be easier to use numbers instead.
Most of the examples below will use numbers for that reason.
We will also look at ways to make it easier to play the right notes later.

## changing the sound

Just like with unpitched sounds, we can change the sound of our notes with `sound`:

<MiniRepl hideHeader client:visible tune={`note("36 43, 52 59 62 64").sound("piano")`} />

{/* c2 g2, e3 b3 d4 e4 */}

<Box>

Try out different sounds:

- gm_electric_guitar_muted
- gm_acoustic_bass
- gm_voice_oohs
- gm_blown_bottle
- sawtooth
- square
- triangle
- how about bd, sd or hh?
- remove `.sound('...')` completely

</Box>

**switch between sounds**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("48 67 63 [62, 58]")
.sound("piano gm_electric_guitar_muted")`}
/>

**stack multiple sounds**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("48 67 63 [62, 58]")
.sound("piano, gm_electric_guitar_muted")`}
/>

<Box>

The `note` and `sound` patterns are combined!

We will see more ways to combine patterns later..

</Box>

## Longer Sequences

**Divide sequences with `/` to slow them down**

{/* [c2 bb1 f2 eb2] */}

<MiniRepl hideHeader client:visible tune={`note("[36 34 41 39]/4").sound("gm_acoustic_bass")`} punchcard />

<Box>

The `/4` plays the sequence in brackets over 4 cycles (=4s).

So each of the 4 notes is 1s long.

Try adding more notes inside the brackets and notice how it gets faster.

</Box>

Because it is so common to just play one thing per cycle, you can..

**Play one per cycle with \< \>**

<MiniRepl hideHeader client:visible tune={`note("<36 34 41 39>").sound("gm_acoustic_bass")`} punchcard />

<Box>

Try adding more notes inside the brackets and notice how it does **not** get faster.

</Box>

**Play one sequence per cycle**

{/* <[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2 */}

<MiniRepl
  hideHeader
  client:visible
  tune={`note("<[36 48]*4 [34 46]*4 [41 53]*4 [39 51]*4>/2")
.sound("gm_acoustic_bass")`}
  punchcard
/>

**Alternate between multiple things**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("60 <63 62 65 63>")
.sound("gm_xylophone")`}
  punchcard
/>

This is also useful for unpitched sounds:

<MiniRepl
  hideHeader
  client:visible
  tune={`sound("bd*2, ~ <sd cp>, [~ hh]*2")
.bank("RolandTR909")`}
  punchcard
/>

## Scales

Finding the right notes can be difficult.. Scales are here to help:

<MiniRepl
  hideHeader
  client:visible
  tune={`n("0 2 4 <[6,8] [7,9]>")
.scale("C:minor").sound("piano")`}
  punchcard
/>

<Box>

Try out different numbers. Any number should sound good!

Try out different scales:

- C:major
- A2:minor
- D:dorian
- G:mixolydian
- A2:minor:pentatonic
- F:major:pentatonic

</Box>

**automate scales**

Just like anything, we can automate the scale with a pattern:

<MiniRepl
  hideHeader
  client:visible
  tune={`n("<0 -3>, 2 4 <[6,8] [7,9]>")
.scale("<C:major D:mixolydian>/4")
.sound("piano")`}
  punchcard
/>

<Box>

If you have no idea what these scale mean, don't worry.
These are just labels for different sets of notes that go well together.

Take your time and you'll find scales you like!

</Box>

## Repeat & Elongate

**Elongate with @**

<MiniRepl hideHeader client:visible tune={`note("c@3 eb").sound("gm_acoustic_bass")`} punchcard />

<Box>

Not using `@` is like using `@1`. In the above example, c is 3 units long and eb is 1 unit long.

Try changing that number!

</Box>

**Elongate within sub-sequences**

<MiniRepl
  hideHeader
  client:visible
  tune={`n("<[4@2 4] [5@2 5] [6@2 6] [5@2 5]>*2")
.scale("<C2:mixolydian F2:mixolydian>/4")
.sound("gm_acoustic_bass")`}
  punchcard
/>

<Box>

This groove is called a `shuffle`.
Each beat has two notes, where the first is twice as long as the second.
This is also sometimes called triplet swing. You'll often find it in blues and jazz.

</Box>

**Replicate**

<MiniRepl hideHeader client:visible tune={`note("c!2 [eb,<g a bb a>]").sound("piano")`} punchcard />

<Box>

Try switching between `!`, `*` and `@`

What's the difference?

</Box>

## Recap

Let's recap what we've learned in this chapter:

| Concept   | Syntax | Example                                                             |
| --------- | ------ | ------------------------------------------------------------------- |
| Slow down | \/     | <MiniRepl hideHeader client:visible tune={`note("[c a f e]/2")`} /> |
| Alternate | \<\>   | <MiniRepl hideHeader client:visible tune={`note("c <e g>")`} />     |
| Elongate  | @      | <MiniRepl hideHeader client:visible tune={`note("c@3 e")`} />       |
| Replicate | !      | <MiniRepl hideHeader client:visible tune={`note("c!3 e")`} />       |

New functions:

| Name  | Description                         | Example                                                                                      |
| ----- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| note  | set pitch as number or letter       | <MiniRepl hideHeader client:visible tune={`note("b g e c").sound("piano")`} />               |
| scale | interpret `n` as scale degree       | <MiniRepl hideHeader client:visible tune={`n("6 4 2 0").scale("C:minor").sound("piano")`} /> |
| stack | play patterns in parallel (read on) | <MiniRepl hideHeader client:visible tune={`stack(s("bd sd"),note("c eb g"))`} />             |

## Examples

**Classy Bassline**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2")
.sound("gm_synth_bass_1")
.lpf(800) // <-- we'll learn about this soon`}
/>

**Classy Melody**

<MiniRepl
  hideHeader
  client:visible
  tune={`n(\`<
[~ 0] 2 [0 2] [~ 2]
[~ 0] 1 [0 1] [~ 1]
[~ 0] 3 [0 3] [~ 3]
[~ 0] 2 [0 2] [~ 2]
>*2\`).scale("C4:minor")
.sound("gm_synth_strings_1")`}
/>

**Classy Drums**

<MiniRepl
  hideHeader
  client:visible
  tune={`sound("bd*2, ~ <sd cp>, [~ hh]*2")
.bank("RolandTR909")`}
/>

**If there just was a way to play all the above at the same time.......**

<Box>

It's called `stack` 😙

</Box>

<MiniRepl
  hideHeader
  client:visible
  tune={`stack(
  note("<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2")
  .sound("gm_synth_bass_1").lpf(800),
  n(\`<
  [~ 0] 2 [0 2] [~ 2]
  [~ 0] 1 [0 1] [~ 1]
  [~ 0] 3 [0 3] [~ 3]
  [~ 0] 2 [0 2] [~ 2]
  >*2\`).scale("C4:minor")
  .sound("gm_synth_strings_1"),
  sound("bd*2, ~ <sd cp>, [~ hh]*2")
  .bank("RolandTR909")
)`}
/>

This is starting to sound like actual music! We have sounds, we have notes, now the last piece of the puzzle is missing: [effects](/workshop/first-effects)



---
title: Pattern Effects
layout: ../../layouts/MainLayout.astro
---

import { MiniRepl } from '@src/docs/MiniRepl';
import Box from '@components/Box.astro';
import QA from '@components/QA';

# Pattern Effects

Up until now, most of the functions we've seen are what other music programs are typically capable of: sequencing sounds, playing notes, controlling effects.

In this chapter, we are going to look at functions that are more unique to tidal.

**reverse patterns with rev**

<MiniRepl hideHeader client:visible tune={`n("0 1 [4 3] 2").sound("jazz").rev()`} />

**play pattern left and modify it right with jux**

<MiniRepl hideHeader client:visible tune={`n("0 1 [4 3] 2").sound("jazz").jux(rev)`} />

This is the same as:

<MiniRepl
  hideHeader
  client:visible
  tune={`stack(
  n("0 1 [4 3] 2").sound("jazz").pan(0),
  n("0 1 [4 3] 2").sound("jazz").pan(1).rev()
)`}
/>

Let's visualize what happens here:

<MiniRepl
  hideHeader
  client:visible
  tune={`stack(
  n("0 1 [4 3] 2").sound("jazz").pan(0).color("cyan"),
  n("0 1 [4 3] 2").sound("jazz").pan(1).color("magenta").rev()
)`}
  punchcard
/>

<Box>

Try commenting out one of the two by adding `//` before a line

</Box>

**multiple tempos**

<MiniRepl hideHeader client:visible tune={`note("c2, eb3 g3 [bb3 c4]").sound("piano").slow("1,2,3")`} />

This is like doing

<MiniRepl
  hideHeader
  client:visible
  tune={`stack(
  note("c2, eb3 g3 [bb3 c4]").s("piano").slow(1).color('cyan'),
  note("c2, eb3 g3 [bb3 c4]").s("piano").slow(2).color('magenta'),
  note("c2, eb3 g3 [bb3 c4]").s("piano").slow(3).color('yellow')
)`}
  punchcard
/>

<Box>

Try commenting out one or more by adding `//` before a line

</Box>

**add**

<MiniRepl
  hideHeader
  client:visible
  tune={`note("c2 [eb3,g3]".add("<0 <1 -1>>"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)`}
  punchcard
/>

<Box>

If you add a number to a note, the note will be treated as if it was a number

</Box>

We can add as often as we like:

<MiniRepl
  hideHeader
  client:visible
  tune={`note("c2 [eb3,g3]".add("<0 <1 -1>>").add("0,7"))
.color("<cyan <magenta yellow>>").adsr("[.1 0]:.2:[1 0]")
.sound("gm_acoustic_bass").room(.5)`}
  punchcard
/>

**add with scale**

<MiniRepl
  hideHeader
  client:visible
  tune={`n("<0 [2 4] <3 5> [~ <4 1>]>*2".add("<0 [0,2,4]>/4"))
.scale("C5:minor").release(.5)
.sound("gm_xylophone").room(.5)`}
  punchcard
/>

**time to stack**

<MiniRepl
  hideHeader
  client:visible
  tune={`stack(
  n("<0 [2 4] <3 5> [~ <4 1>]>*2".add("<0 [0,2,4]>/4"))
  .scale("C5:minor")
  .sound("gm_xylophone")
  .room(.4).delay(.125),
  note("c2 [eb3,g3]".add("<0 <1 -1>>"))
  .adsr("[.1 0]:.2:[1 0]")
  .sound("gm_acoustic_bass")
  .room(.5),
  n("0 1 [2 3] 2").sound("jazz").jux(rev).slow(2)
)`}
/>

**ply**

<MiniRepl hideHeader client:visible tune={`sound("hh, bd rim").bank("RolandTR707").ply(2)`} punchcard />

this is like writing:

<MiniRepl hideHeader client:visible tune={`sound("hh*2, bd*2 rim*2").bank("RolandTR707")`} punchcard />

<Box>

Try patterning the `ply` function, for example using `"<1 2 1 3>"`

</Box>

**off**

<MiniRepl
  hideHeader
  client:visible
  tune={`n("<0 [4 <3 2>] <2 3> [~ 1]>"
  .off(1/8, x=>x.add(4))
  //.off(1/4, x=>x.add(7))
).scale("<C5:minor Db5:mixolydian>/4")
.s("triangle").room(.5).ds(".1:0").delay(.5)`}
  punchcard
/>

<Box>

In the notation `x=>x.`, the `x` is the shifted pattern, which where modifying.

</Box>

off is also useful for sounds:

<MiniRepl
  hideHeader
  client:visible
  tune={`s("bd sd,[~ hh]*2").bank("CasioRZ1")
  .off(1/8, x=>x.speed(1.5).gain(.25))`}
/>

| name | description                    | example                                                                                        |
| ---- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| rev  | reverse                        | <MiniRepl hideHeader client:visible tune={`n("0 2 4 6").scale("C:minor").rev()`} />            |
| jux  | split left/right, modify right | <MiniRepl hideHeader client:visible tune={`n("0 2 4 6").scale("C:minor").jux(rev)`} />         |
| add  | add numbers / notes            | <MiniRepl hideHeader client:visible tune={`n("0 2 4 6".add("<0 1 2 1>")).scale("C:minor")`} /> |
| ply  | speed up each event n times    | <MiniRepl hideHeader client:visible tune={`s("bd sd").ply("<1 2 3>")`} />                      |
| off  | copy, shift time & modify      | <MiniRepl hideHeader client:visible tune={`s("bd sd, hh*4").off(1/8, x=>x.speed(2))`} />       |