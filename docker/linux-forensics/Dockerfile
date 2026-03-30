FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    bash less file binutils grep gawk sed findutils \
    net-tools procps psmisc lsof curl wget python3 \
    vim nano bsdextrautils cron openssh-client ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Build all evidence artifacts
COPY setup/ /setup/
RUN chmod +x /setup/setup.sh && /setup/setup.sh

# Auto-source helper on login
RUN echo '. /etc/soc_lab.sh' >> /etc/bash.bashrc

WORKDIR /
ENV PS1="\[\e[31m\]forensics@NFC-SRV-WEB1\[\e[0m\]:\[\e[33m\]\w\[\e[0m\]# "
ENTRYPOINT ["/bin/bash", "--login"]
