# Performance
- added latency for verifiy (very low priority - depending upon benchmark results)
  - cache verification based upon the signature as the key, and a fast hash of the body or whole token as the data; TTL is some ratio of the JwT lifetime (very low priority - depending upon benchmark results)
  - perf test this as verify might be just as fast.
- added latency for cert retreival (assuming jwks-rsa library "is enough")
  - cache the Jwks retrieval (existing jwks-rsa feature)
  - TTL some ratio or number of minutes - (existing jwks-feature? or possibly in the backing cache library 'lru-memoizer')
  - timer or something to do it in the backgrond so executing request does not block - a "prefetch" may not be 
  - cold start issues? - again, benchmark needed.

# functional tests
- inject into specic routes, or exclude from specific routes
  - must handle being "mounted" by express router not from the root -- ensure functional tests validate this.
- enabled or disabled
  - turn off via Option object OR ENV variables
  - when off it's as few noop as possible
- can read the Authorization header
  - ensure AuthZ header present with "Bearer prefix" - 401 if not
- Read the bearer token
  - can read the toke and it verifies - 401 if not
- verify the token using local cert (pem)
  - can verify using local PEM file for dev experience
  - can in test automation, sign a test token for dev experience.
    - these require PEM to JWK tooling and there are npm libraries for this.
    - openssl can be used to create a PEM keypair -> PEM2JWK lib -> this can create the jwks.json file locally
- verify the token using url based cert
  - using the jwks endpoint and the "verify" key (public key)
- benchmark the overhead for when in place
  - 2ms probably a good initial target in non-cold start
- validation:
  - aud validation
  - other JwT fields?
  - https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
- Options
  - an options object to the library takes precedence over direct ENV variables that the module would normally recognize
    - exclude or include paths
    - aud validation needs
    - other jwks-rsa options that we can feed in
    - other jsonwebtoken lib options we can feed in
  - in absence of options, strive to re-use existing config settings already in the app
    - token signer 
    - aud
- 


# Component
- a stand-alone npm package that can be enabled/disabled with an .env switch
- options passable to the component like other Express middleware that exposes an "options" function
- simple `app.use(jwtverify)` for inclusion.  or `app.use( { option1: ""})` for the option based
- async all
- when refreshing previously retrieved cert for jwkrs doesn't block - uses the TTL of the cache to determine if needs to refresh and keep rolling window/fresh token in cache
- debug logging - both for THIS component and one of the two critical dependant components - `jwks-rsa` - which uses the npm packge `debug`. The package `jsonwebtoken` and deeper dependancies do not use `debug` and rely on error propagation when invalid calls occur.


