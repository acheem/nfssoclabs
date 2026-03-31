## Start the Lab

Run this command to pull and start the lab container:

```
docker run -it --rm --hostname NFC-WS-041 ghcr.io/acheem/nfcsoc-labs/windows-soc:latest
```{{execute}}

The PowerShell forensics environment will load automatically.

Use `Get-SOCHelp` inside the container to see all available commands.

When you find the flag (`NFCSOC{...}`), submit it on the NFCSOC platform at **nfssoclabs.vercel.app/ctf**.
