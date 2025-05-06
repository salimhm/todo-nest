
FROM redis:7.2-alpine

EXPOSE 6379

RUN mkdir -p /data
VOLUME /data

CMD ["redis-server", "--appendonly", "yes"]