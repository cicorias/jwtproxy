# Performance
- added latency for verifiy
  - cache verification based upon the signature as the key, and a fast hash of the body or whole token as the data; TTL is some ratio of the JwT lifetime
  - perf test this as verify might be just as fast.
- added latency for cert retreival
  - cache the Jwks retrieval
  - TTL some ratio or number of minutes
  - timer or something to do it in the backgrond so executing request does not block
  - cold start issues?


# functional tests
- enabled or disabled
- can read the Authorization header
- Read the bearer token
- verify the token using local cert (pem)
- verify the token using url based cert
- benchmark the overhead for 

# Component
- a stand-alone npm package that can be enabled/disabled with an .env switch
- options passable to the component like other Express middleware that exposes an "options" function
- simple `app.use(jwtverify)` for inclusion.  or `app.use( { option1: ""})` for the option based
- async all
- when refreshing previously retrieved cert for jwkrs doesn't block - uses the TTL of the cache to determine if needs to refresh and keep rolling window/fresh token in cache
