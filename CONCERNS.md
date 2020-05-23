# Performance
- added latency for verifiy
  - cache verification based upon the signature as the key, and a fast hash of the body or whole token as the data; TTL is some ratio of the JwT lifetime
  - perf test this as verify might be just as fast.
- added latency for cert retreival
  - cache the Jwks retrieval
  - TTL some ratio or number of minutes
  - timer or something to do it in the backgrond so executing request does not block
  - cold start issues?