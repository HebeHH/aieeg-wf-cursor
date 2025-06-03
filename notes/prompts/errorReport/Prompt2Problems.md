# TODO

There are filters at the top of both the speaker and session tabs. THese filters are great and I want to be able to access them all the time! I'd like it if they stayed at the top of the screen when I scrolled, but:
Make it an expandable, so it can easily be collapsed/expanded from current state to just "Filters " with a collapse arrow
It's expanded on page load
It automatically collapses when you scroll down


# Completed


The speaker images (from sessionize) aren't loading:
```
Error: Invalid src prop (https://sessionize.com/image/4c5e-400o400o1-NBTnUuFrxX22XutvVhrvGP.jpg) on `next/image`, hostname "sessionize.com" is not configured under images in your `next.config.js`
See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host
```
All images are generally from sessionize. Can you either fix this (so we see the sessionize image) of give me a cli command to run to download all speaker images into public/speakerPics/[speakerId].jpg, and then update the code to use those images?

The speaker/session mini cards are a bit difficult to understand. they could use more labels/tags (eg: "Bio:"), font/color/wtv separation between the different parts, a bit more color in gneral.
Some specifics (but go past these):
- title and company should be visibly distinct from the bio (font, color, wtv)
- field should be a tag-looking rounded, colored span. Ideally different colors for the different fields (similar colors for related ones)
- session minicards: similar visual separation needed. Also, if the session company is 'unknown', instead see if the speaker(s) associated have one and use that. THe timing display could also be improved. Level and scope should also be tag-looking elements (similarly color-coded, there's not that many, graduate the 'level' by green/blue/yellow/orange in order of difficulty)

the big cards:
- shouldn't black out the rest of the screen, they should have a bit of a shadow but you should still be able to see the rest of the screen
- clicking outside of them should dismiss them
- clicking on one of the 'speakers' from a session big card should pull up all associated speaker cards by session.speakers[] array.
- if the user wants to open up multiple bigcards, they should all be visible. if there's both speaker and session cards open, session cards go on the left and speakers on the right. if there's multiple cards (eg two speaker cards and 3 session cards, by the user clicking on speaker.session and then session.speakers), these should be stacke&& with the most recent one on the bottom. you should be able to scroll these without scrolling the underlying page.
