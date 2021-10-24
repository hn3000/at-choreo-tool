
# Audio Trip Choreo Analysis Tools

Some very basic choreo analysis tools for Audio Trip choreography files.

## Install:

````sh
npm install -g @hn3000/at-choreo-tools
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

