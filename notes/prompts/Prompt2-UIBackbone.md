# UI Initial Setup

We're going to create the backbone for a UI that let's us see and filter conference data.

There's two types of data/views that we're most interested in:
* speakers
* sessions

We also want to be able to bookmark and reject elements

## Available Data
The data is available in public/aiengdata/fullData.json.

You can see the full description of it in notes/interfaces/fullData.md. Typespecs are already available in src/app/types/conference.ts.

The particular objects we'll be working with are:

```
// Conference Data Types

export type Position =  | 'CEO'  | 'CTO'  | 'founder'  | 'Director/Head of Department'  | 'VP'  | 'Senior Engineer'  | 'Engineer'  | 'Founder'  | 'Product Manager/Lead'  | 'Other High-Level'  | 'Other Mid-Level'  | 'Other Low-Level';

export type Field =  | 'AI engineering'  | 'Software Engineering'  | 'Research'  | 'Developer Experience'  | 'Marketing/Sales'  | 'Product Management'  | 'Engineering'  | 'Data science'  | 'Investor';

export interface CombinedSession extends Omit<WebsiteSession, 'id'> {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  isPlenumSession: boolean;
  speakers: string[];
  roomId: string;
  isConfirmed: boolean;
  categoryItems: CategoryItem[];
  isInformed: boolean;
  isServiceSession: boolean;
  liveUrl: string;
  questionAnswers: QuestionAnswer[];
  recordingUrl: string;
  status: string;
  "Session Format": string;
  "Level": string;
  "Scope": string;
  "Assigned Track": string;
  "Room": string;
  "Speakers": string;
  "Companies": string;
  "Company Domains": string;
}

export interface EnhancedSpeaker extends WebsiteSpeaker {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  tagLine: string;
  profilePicture: string;
  isTopSpeaker: boolean;
  links: SpeakerLink[];
  sessions: string[];
  fullName: string;
  categoryItems: CategoryItem[];
  questionAnswers: QuestionAnswer[];
  company: string;
  title: string;
  position: Position[];
  field: Field;
}
```

## Bookmarks and Rejections
The user should be able to bookmark or reject both sessions and speakers through interacting with the cards.

Keep an 'active' session and speaker array, separate from the 'full' array. This extends 'sessions' with 'bookmarked' and 'speakerBookmarked', and 'speakers' with 'bookmarked' (default false).


Once a session is rejected, filter it out of the 'active' seesion arrray
A speaker being rejected filters them out of the 'active' speaker array. IF they have `isTopSpeaker=true`, it ALSO filters out any sessions where they are a speaker.

Bookmarks update `bookmarked=true` for the direct element. Speaker bookmarks update `speakerBookmarked = true` for ALL linked sessions (Regardless of isTopSpeaker).


A bookmark/reject id array is kept track of and saved locally. When the page initially loads, check for it and if present create the 'active' arrays respecting it. 

## UI General Setup
We will have 2 tabs along the top, Speakers, Sessions and You. we might add more later, so remember that.

We want a good looking UI, but also to communicate a lot of data quickly - so please don't use too much whitespace. I know you really really want to use a lot of whitespace, but please be reasonable. Use `-sm` for paragraph fonts, for instance.


use purple for the colors. pick some nice google fonts.

Use components. We'll be wanting to use the same elements across different pages - eg, pull up the speaker detail card from the sessions tab - so it's important that these are reusable.

For session/speaker specific components, it would be great if they could be summoned with either the full object data OR just the id (Again, so we can pull up the cards from pages that are cross-referencing it by id, but that it won't need loading time if we have the data available). You can always go find the info from the relevant data object by id.


## Speakers
The Speakers tab will list all speakers.

It has:
* filters: ability to filter on many speaker elements
* Speakers list: all the speakers that match the filters, cards
* Speakers full card: clicking on a speaker name/bio should pull up a more detailed card

### Filters
We should be able to filter on:

Multiselects:
- title
- position
- field
- company (get unique company values, then put the 25 most frequent in the multiselect)
- 'Bookmarked', 'Rejected', 'Neither'

Other:
* "Top Speakers Only" checkbox driven by 'isTopSpeaker' 
* text search for bio
* text search for name


Remember:
- any mix of filters can be applied at once
- have a 'Clear Filters' button
- it must be easy to edit or fully remove a filter

#### Actions
In the filter bar, also include two buttons:
* Bookmark All
* Reject All

These should bookmark/reject all speakers matching the selected filters, and all sessions for lead speakers matching the selected filters.


### speaker list

This shows cards for all speakers matching the filters.

These minicards should show:
* fullName
* company & title
* bio 
* position(s) (color coded tag, color code from vivid green -> light green -> grey according to how senior the title is)
* field
* Bookmark button
* Reject button

These minicards should be reasonably compressed/dense. Separate everything clearly, but make sure a lot of them can fit on screen at once. Eg: 

```
Name: Company, title
bio
field positions | bookmark reject 
```
isntead of every item being a new line

### Speakers full card
These are modals you get when clicking on a speaker. They can use a lot more whitespace and be a lot more pretty.

They include:

* fullName
* profile picture
* company 
* title
* bio 
* links
* 'sessions': find all sessions where they're speaking, give button/spans with the session name, clicking will open up the 'Session full card' 
* position(s) (color coded tag, color code from vivid green -> light green -> grey according to how senior the title is)
* field
* Bookmark button
* Reject button

When a 'session' button is clicked on, both speaker and session full cards will be open at once. In this situation, session cards are on the left and speaker cards on the right.


## Sessions
The sessions tab is very similar to the speakers tab, but we'll want to be able to filter on speaker `position` here, so you might want to join the arrays first to add a `session.speakerPositions: Position[]` element


### Filters
We should be able to filter on:

Multiselects:
- speaker position
- companies (get unique company values, then put the 25 most frequent in the multiselect)
- 'Bookmarked', 'Rejected', 'Neither'
- Assigned Track
- Day: 'Tuesday' 'Wednesday' 'Thursday' match to 3, 4, 5 June 2025 respectively
* Level
* Scope
- "Room"

Other:
* From [] to [] - time based, 'from' checks startsAt and 'to' checks EndsAt
* text search companies
* text search title/description combination


Remember:
- any mix of filters can be applied at once
- have a 'Clear Filters' button
- it must be easy to edit or fully remove a filter

#### Actions
In the filter bar, also include two buttons:
* Bookmark All
* Reject All

These should bookmark/reject all speakers matching the selected filters,




### session list

This shows cards for all sessions matching the filters.

These minicards should show:
* title
* companies 
* Assigned track (color coded, if exists - if empty nothing shows)
* Level & Scope
* day (or 'MULTIDAY')
* start - end
* speaker position(s) (color coded tag, color code from vivid green -> light green -> grey according to how senior the title is)
* Bookmark button
* Reject button

These minicards should be reasonably compressed/dense. Separate everything clearly, but make sure a lot of them can fit on screen at once. Eg: 

```
Title | track
level | scope | speaker positions
day  | start - end | bookmark reject 
```
isntead of every item being a new line

### sessions full card
These are modals you get when clicking on a session. They can use a lot more whitespace and be a lot more pretty.

They include:


* title
* companies 
* DESCRIPTION (new)
* company domains (links, clickable)
* "Room"
* Assigned track (color coded, if exists - if empty nothing shows)
* Level & Scope
* day (or 'MULTIDAY')
* start - end
* speaker position(s) (color coded tag, color code from vivid green -> light green -> grey according to how senior the title is)
* speakers:  give the names from "Speakers", clicking on either should open up the full speaker card for all speakers by id in `speakers` array
* Bookmark button
* Reject button

When a 'session' button is clicked on, both session and speaker full cards will be open at once. In this situation, session cards are on the left and speaker cards on the right.
