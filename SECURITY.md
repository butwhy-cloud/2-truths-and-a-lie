# Security

## Reporting a problem

Found a security or privacy problem in the game, the phone page or the relay Worker? Please don't open a public issue. Report it privately instead: on this repository's **Security** tab, choose **Report a vulnerability**. We'll reply as soon as we can.

## What the game keeps, and where

- Nothing is uploaded to this site or anywhere else. The spreadsheet, photos and results stay on the host's computer.
- During a round, the host's computer sends that person's name, statements and a small copy of their photo straight to the players' phones, over an encrypted connection (WebRTC).
- When the game ends, everyone is disconnected and the computer and phones forget the game. Only the results file the host saves is left.
- The relay Worker (`tools/relay-worker.js`) only hands out short-lived relay details to someone who has an access code. Keep your codes, and your Cloudflare secrets, out of any repository.

## Supported version

Only the latest version on the `main` branch (and the published pages) gets fixes.
