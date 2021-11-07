
# Audio Trip Choreo Analysis Tools

Some very basic choreo analysis tools for Audio Trip choreography files.

## Install:

````sh
npm install -g https://github.com/hn3000/at-choreo-tool
````

## Usage Examples:

Create a boatload of playlists.

````sh
# note: starting in the parent folder of atcd-choreos
cd atcd-playlists
ats-tool clonablePlaylists ../atcd-choreos
````

Gather and print some stats.

````sh
# note: starting in the parent folder of atcd-choreos
ats-tool stats ./atcd-choreos
ats-tool stats-extended ./atcd-choreos
````

Create a CSV with all the choreos in it.

````sh
# note: starting in the parent folder of atcd-choreos
ats-tool csv-songs ./atcd-choreos > atcd
````

Create a CSV with all the choreos in it, including last.fm tags.

````sh
# note: starting in the parent folder of atcd-choreos
set LASTFM_API_KEY=12ab...de89
ats-tool csv-songs --last-fm-tags ./atcd-choreos > atcd
````

You'll need a last.fm api key, get it at https://www.last.fm/api/accounts .
This version of the command can take very long because I send slightly fewer
than 1 request per second. Results are cached in a file in the current working
directory, so if you're re-running this command make sure to run it from the
same folder to avoid littering your drive with lots of files called
`.lastFmCache.json` -- and if you do, don't say I didn't warn you. The cache
also means the command will run quicker next time and the output won't include 
newer data unless you get rid of the cache first.
