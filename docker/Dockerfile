FROM splunk/splunk:9.2.1

ENV SPLUNK_START_ARGS=--accept-license
ENV SPLUNK_PASSWORD=AABVINLABS1!

USER root
COPY scripts/setup.sh /tmp/setup.sh
RUN chmod +x /tmp/setup.sh

USER splunk
