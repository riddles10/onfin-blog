# Brief: upload and schedule approved OnFin weeks into Postiz

SCRATCH = /tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad
The content is final and approved: don't edit captions, images, dates or channels. Your job is mechanical: upload the images, build the payloads with the provided script, schedule them, and verify. Do it once per week you're given (e.g. w3), one week at a time.

For each week WK:
- Posts: SCRATCH/WK/posts.json. Images are committed to the public GitHub repo riddles10/onfin-blog at commit SHA (given in your task), folder social/WK/.
  `ls /home/user/onfin-blog/social/WK` lists the JPGs. Public URL of each: https://raw.githubusercontent.com/riddles10/onfin-blog/SHA/social/WK/<file>.jpg

Steps:
1. Load the Postiz tools with ToolSearch: "select:mcp__Postiz__uploadFromUrlTool,mcp__Postiz__integrationSchedulePostTool,mcp__Postiz__postsListTool".
2. Upload every JPG in social/WK with mcp__Postiz__uploadFromUrlTool (url = the raw URL; leave adjust off). Send about 12 uploads in parallel per message.
   After each batch, append lines `<file.jpg> <returned path>` to SCRATCH/WK/media.txt, e.g. `g-tips-en-01.jpg https://uploads.postiz.com/AbC123.jpg`.
   If media.txt already exists, skip files already listed in it, so a rerun never uploads twice. Retry a failed upload once.
3. Run `cd SCRATCH/wk && python3 payloads.py WK`. It writes SCRATCH/WK/payloads/batch-N.json and fails if any media is missing. Upload the missing files and rerun.
4. For each batch file, in order, call mcp__Postiz__integrationSchedulePostTool with socialPost set to the exact array from that file. Pass it as a real JSON array, not a string, and change nothing.
   Read each file with `cat`. Save the returned postIds to SCRATCH/WK/postids-batch-N.txt, one per line, in order.
   If a call returns validation errors, stop and report them. Don't retry a batch that succeeded.
5. Verify: call mcp__Postiz__postsListTool for the week's date range (min to max date in posts.json, padded by a day). The result is large and saved to a file; parse it with python.
   Confirm every post in posts.json has a queued match (same integrationId and publishDate, ignoring a trailing Z) whose content starts with the same first <p> line.
   Instagram stories have empty content, so match those on integrationId + date + post_type story. Report any missing or duplicate posts.
   A verification script from an earlier week is at SCRATCH/verify/verify.py, which you may adapt.

Never delete posts. If you created a duplicate by mistake, report the post IDs instead.
Final report per week (short): images uploaded, posts scheduled, verification result, any errors.
