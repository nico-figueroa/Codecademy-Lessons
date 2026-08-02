# Jammming Regression Test Script

## 1. App Boot

Expected
* App loads without errors
* Playlist title = “New Playlist”
* Playlist track count = 0
* Search results section shows no tracks
* “No results” message is not shown yet

## 2. Basic Search

Search: weeknd

Expected:
* Two tracks appear
* Add buttons enabled
* No “no results” message

## 3. Add Track

Add “Blinding Lights”.

Expected:
* Playlist shows “Blinding Lights”
* Remove button visible
* Track count = 1

## 4. Second Search

Search: dua

Expected:
* Two Dua Lipa tracks appear
* Playlist remains unchanged

## 5. Add Second Track

Add “Levitating”.

Expected:
* Playlist shows 2 tracks
* Both have remove buttons

## 6. No Results Case

Search: xyz123

Expected:
* Search results empty
* “No search results meet the search criteria” appears

## 7. Empty Search Clears

Search: "" (clear field)

Expected:
* Search results empty
* “No search results meet the search criteria” appears

## 8. Editing Mode

Click playlist title.

Expected:
* Input appears
* SearchBar disabled
* Add/remove buttons disabled

Exit editing by clicking outside.

Expected:
* Input disappears
* SearchBar enabled
* Add/remove enabled
* Playlist title updated

## 9. Remove Track

Remove “Blinding Lights”.

Expected:
* Playlist shows only “Levitating”
* Track count = 1

## 10. Save Playlist

Click “Save to Spotify”.

Expected:
* Console logs URIs
* Playlist resets to empty
* Title resets to “New Playlist”

## 11. Post-Save Search

Search: Hans Zimmer

Expected:
* Hans Zimmer tracks appear
* App fully functional