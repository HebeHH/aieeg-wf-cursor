# UI improvements needed

## Mobile
* Make it look better on mobile


## Calendar

`npm run dev` will show you a calendar tab.

This looks like crap.

Immediate points:
* the times along the sidebar are out of whack. These events do not start at midnight.
* why the fuck are the events extending across the screen. the width is set to 133.33%???? what the fuck?
* each event should have ONE div representing it. that single div should extend vertically across the calendar from the start time to the end time. don't just grid slot them in the hours.
* clicking on the event should expand the session modal. See pasted text.

More general description of how it was intended:
The calendar events should include:
- title (smallish font, possibly change font size depending on how many buttons there are)
- buttons: bookmark, reject, hide, and add to calendar 
    -hide just removes it from the view until the filters are changed, but doesn't reject it or remove it from the activelist
    - add to calendar button as mentioned above
- Room (grey tag)
- Company (as)
- Assigned track (color coded same way as SessionCard)

Otherwise:
- color code the session divs by level (same color mapping as in SessionCard)
- border color by scope (same color mapping again)
- these are the colors to put in the legend

Clicking on any of the calendar events opens the normal SessionModal 

## General UI
Do whatever you want to the UI.
- add to cal icon is shit
- general card design is shit


## Improvements
- the cards shouldn't report unknown or duplicate tag data (you'll see what I mean)
- icons
- 
