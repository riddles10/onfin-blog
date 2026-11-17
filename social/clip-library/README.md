# OnFin clip library

Short clips cut from long-form videos, ready to turn into reels. Agreed 17 Nov 2026.

## Where things live

Google Drive: OnFin Videos / Clip Library (https://drive.google.com/drive/folders/1fU1LejhdRqXbhWIve-pwbUHjJR5ry41I)

| Folder | What goes in it |
|---|---|
| 01 Transcripts | `manifest.csv` (one row per long video) and every caption file, named `<video_id>.<lang>.vtt` |
| 02 For review | Batches waiting for approval (the first 10 clips go here first) |
| 03 Clips / Trader memes, Legends on trading, Market history, Fed and policy, Weird money news, Our take | Approved clips, by theme |
| 04 Used | Clips that have been posted (moved here after posting) |

The long videos stay on the PC (`C:\Users\user\Development\onfin-video-dump`) and are deleted once mined. Only transcripts and short clips go to Drive.

## Who does what

- **Download session (PC):** downloads long videos and captions, uploads transcripts and the manifest, cuts clips from cut lists, uploads them, deletes long files once mined.
- **Social session (cloud, this repo):** picks moments from transcripts, writes cut lists (`cutlists/*.csv`), keeps `index.csv`, builds the reels and schedules them.
- **You:** approve each review batch, set the risk level and sources.

## Clip spec

- Raw clips: no branding, no burned-in text. Hooks, captions and languages are added per post.
- 5 to 15 s for meme reactions; 20 to 45 s for insight and history clips. Start on a strong line, end on a full sentence, 0.5 s handle at each end.
- Source resolution (at least 720p), landscape as filmed, original audio normalised to about -16 LUFS. H.264 (CRF 18) and AAC 192k in MP4.
- File name: `<theme>__<speaker>__<topic>__<duration>s__<video_id>-<start>.mp4`.
- Originals only: never re-cut someone else's repost (no third-party watermarks).

## Risk level: medium

- Low (fine): public-domain footage (Fed, Congress, Treasury, SEC, White House, government archives).
- Medium (fine): interviews, podcasts, conference talks and news segments. Keep clips short, credit the source on screen and in the caption, and always add our take.
- High (not used): films, TV series and documentaries.

## index.csv columns

`clip_id, status (picked, cut, in review, approved, used, rejected), theme, speaker, topic, video_id, source_url, source_owner, risk, start, end, duration_s, transcript, hooks, our_take, evergreen, compliance_notes, drive_file, posted_on`

## Steps

1. The download session uploads `manifest.csv` and the captions to 01 Transcripts.
2. The social session picks 10 clips and writes `cutlists/batch-01.csv`.
3. The download session cuts batch 01 into 02 For review. You give feedback.
4. Once batch 01 is approved, the remaining 90 clips go in batches straight to 03 Clips.
