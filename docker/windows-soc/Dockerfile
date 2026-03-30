FROM mcr.microsoft.com/powershell:lts-ubuntu-22.04

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends figlet curl 2>/dev/null && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY lab/ /lab/

RUN mkdir -p /root/.config/powershell && \
    echo '. /lab/profile.ps1' > /root/.config/powershell/Microsoft.PowerShell_profile.ps1

WORKDIR /lab
ENTRYPOINT ["pwsh", "-NoLogo", "-NoExit"]
