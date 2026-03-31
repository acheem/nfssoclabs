## Start the Lab

Run this command to start the target app and Kali environment:

```
docker run -it --rm -p 5000:5000 --hostname kali-lab ghcr.io/acheem/nfcsoc-labs/kali-appsec:latest
```{{execute}}

The Kali environment will start with the target app running at `http://localhost:5000`.

Use `show_objectives` to see all 3 challenges.
Use `check_flag 'NFCSOC{...}'` to verify each flag.

Submit all 3 flags at **nfssoclabs.vercel.app/ctf** to earn your points.
