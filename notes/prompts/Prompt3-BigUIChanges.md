## Small items

### Add to calendar
There should be an 'add to calendar' button (use an icon, not text) on all session cards that will add the session to the user's google calendar. Make sure this always uses the session data. It should go near the bookmark/reject buttons. Applies to both small and large session cards.

### Manage rejected items
The "You" tab should also let you see rejected items and unreject them. Same cards, but the reject button is already lit and clicking it again unrejects the item. Bookmarking also unrejects it. Applies to both sessions and speakers.

### Mobile adjustments
The way session and speaker modals go to the left and write is PERFECT for desktop, but doens't work on mobile. On smaller screens, center both of them.


# Calendar

Let's add a 'Calendar' tab. This shows a calendar view of the conference. It should only show `max_events = 40` at once. `max_events` should be pretty easy to change in the code.

The UI has:
* Filters similar to src/app/components/SessionsTab.tsx. Collapsible nature is important. Don't include the 'Bookmark Status' filter or the 'Room' filter.
* Calendar configuration
* Calendar itself, showing the appropriate events

### general ui instructions
* use pastels
* make this mobile-friendly from the start. Think hard about what the might mean for each element - possibly we make certain options unavailable in mobile. MOBILE FRIENDLY IS IMPORTANT.

### Filters
You can steal these pretty much wholesale from src/app/components/SessionsTab.tsx. Collapsible nature is important. Don't include the 'Bookmark Status' filter or the 'Room' filter.

## Calendar configuration
Users can configure the day, the room, or the bookmark status

### Day
Select Monday, Tuesday, or Wednesday.

### Room
Room dropdown from the filters goes here

### Sessions to show
Users can select between 'Bookmarks Only' and 'All Sessions'. 'All Sessions' doesn't include rejected sessions (aka only active sessions). Show the total number of sessions that would be shown (active sessions, given filters, given room, given day selection) for each of those selections. If that number of sessions is more than `max_events`, grey out the ability to select and put an info/warn tag ⚠︎ (use nice icon) that tells the user they need to have fewer sessions before it will show.

### legend

also add in a legend for the Level and Scope (see reference below)

## Calendar display
the calendar itself is the most important element! this shows all the events that match the filters and config.

show the day selected at the top. try not to take up too much space there, we need it!

Calendar starts at the latest hour before the first event time (eg if the earliest filtered events started 9:15 tuesday, 10am wednesday, then the calendar would start at 9am) and the earliest hour after the last event time (eg last event ends at 5:45pm, calendar ends at 6pm).



Show all events on the calendar. These should be arranged kinda like google calendar, so that they avoid overlap as much as possible. Do your best not to make sure events never overlay. THis may be a bit tricky, but I have faith in you.

### Calendar events
Don't use the SessionCard for calendar events. Make a new one.

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

Clicking on any of the calendar events opens the normal SessionModal (which should also have add to cal button)


## Pass it forward

Create a new doc in `interfaces` and add in anything that would be useful for the next dev to know - like 'uiSessionsAndSpeakers' and 'fullData.md' did for you.