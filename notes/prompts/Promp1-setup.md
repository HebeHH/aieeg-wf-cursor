combineData.ts should be a single runnable typescript file that:

1. Combines the data from the singleList.json and website.json files into a single array of objects.
2. Saves the combined data to a new file called combinedData.json.
3. Calls the gemini api on each speaker to get structured info


# combining the data

Returns an object with the following fields:

3. rooms
4. sessions
5. speakers

`sessions` is the merged result of the singleList.json array and website.json `object.sessions` array files. merge `singleList.[]."Session ID"` with `website.sessions.[].id` 

Resultant object should preserve from singleList.json:

        "Session Format"
        "Level"
        "Scope"
        "Assigned Track"
        "Room"
        "Speakers"
        "Companies"
        "Company Domains"

and from website.json.sessions:
        "id"
        "title"
        "description"
        "startsAt"
        "endsAt"
        "isPlenumSession"
        "speakers"
        "roomId"
        "isConfirmed"

Take 'rooms' and 'speakers' from website.json.rooms and website.json.speakers.



SAVE THIS TO A NEW FILE CALLED `combinedData.json` BEFORE PROCEEDING TO THE NEXT STEP.


# calling the gemini api

For each speaker in the `speakers` array, call the gemini api to get structured info.

Use model `gemini-2.0-flash-lite`. Do these calls in batches of 2. The gemini key will be an env variable in `GEMINI_API_KEY`

create a new file 'speakerData.json' to store the data.

### Input

User prompt for each speaker should be:
`
name: ${speaker.fullName}
bio: ${speaker.bio}
tagLine: ${speaker.tagLine}

Please give the following information for ${speaker.firstName}:
- company
- title
- position
- field
`
### Output
Constrain gemini to return structured output only: https://ai.google.dev/gemini-api/docs/structured-output#javascript for how.

It should return:
```
type position = 'CEO' | 'CTO' | 'founder' | 'Director/Head of Department' | 'VP' | 'Senior Engineer' | 'Engineer' | 'Founder' | 'Product Manager/Lead' | 'Other High-Level' | 'Other Mid-Level' | 'Other Low-Level' 

type field = 'AI engineering' | 'Software Engineering' | 'Research' | 'Developer Experience' | 'Marketing/Sales' | 'Product Management' | 'Engineering' | 'Data science' | 'Investor'

{
    "company": string,
    "title": string,
    "position": position[] , // at least one, can be more if needed
    "field": field
}
```

### Saving data
Save the data to a new file called `speakerData.json`. THis should be a single array of object, combining the data from the gemini api and the data from the combinedData.json.speakers array:

    "id"
    "firstName"
    "lastName"
    "bio"
    "tagLine"
    "profilePicture"
    "isTopSpeaker"
    "links"
    "sessions"
    "fullName"
    "company"
    "title"
    "position"
    "field"


IMPORTANT:
* save current data to file after every batch of 2 api calls
* add some kind of pause/resume functionality to the script
* handle errors and retry logic - backoff for 10 seconds if rate limited


# Finishing touches
1. make sure to save the data files to public/aiengdata
2. after you've got all the speaker data from the gemini api, make a final "fullData.json" with the `speakers` array from `combinedData.json` is replaced with the fuller speakers array from `speakerData.json`
3. add a new file to 'notes/interfaces' describing what 'fullData.json' looks like
4. add the relevant types in good well-typed typescript in a file in src/app/types