FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    python3 python3-pip curl wget nikto sqlmap dirb \
    iputils-ping net-tools procps less vim nano ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY lab/ /lab/
RUN pip3 install -q flask flask-sqlalchemy --break-system-packages

# Flags stored server-side — analyst must exploit app to read them
RUN echo -n 'NFCSOC{sql_1nj3ct10n_4uth_byp4ss}' > /lab/flags/flag1.txt && \
    echo -n 'NFCSOC{p4th_tr4v3rs4l_f1l3_r34d}'  > /lab/flags/flag2.txt && \
    echo -n 'NFCSOC{c0mm4nd_1nj3ct10n_rc3}'      > /lab/flags/flag3.txt && \
    chmod 640 /lab/flags/*.txt

RUN echo '. /lab/soc_appsec.sh' >> /etc/bash.bashrc && \
    chmod +x /lab/start.sh

EXPOSE 5000
ENV PS1="\[\e[32m\]appsec@kali-lab\[\e[0m\]:\[\e[36m\]\w\[\e[0m\]\$ "
ENTRYPOINT ["/lab/start.sh"]
