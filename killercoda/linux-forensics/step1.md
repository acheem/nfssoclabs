## Start the Lab

Run this command to pull and start the lab container:

```
docker run -it --rm --hostname NFC-SRV-WEB1 ghcr.io/acheem/nfcsoc-labs/linux-forensics:latest
```{{execute}}

The lab environment will load with the incident brief and available commands.

Use `show_hints <1-5>` inside the container if you need guidance.
Use `check_flag 'NFCSOC{...}'` to verify your flag.

Submit the correct flag at **nfssoclabs.vercel.app/ctf** to earn your points.
