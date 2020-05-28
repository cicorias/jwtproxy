
```mermaid

sequenceDiagram
    participant User
    participant App
    participant Module
    participant KeyHelper
    participant JwksHost
    App->>+Module: Options?
    Note left of Module: optional and if present <br/> than NO env variables are used. 
    User->>+App: api(h:jwt)
    App->>+Module: verify(jwt)
    Module->>Module: decode(kid,claims)
    Note Right of Module: decode but not verify <br/>
    Module->>+KeyHelper: getKey(decoded token, kid)
    alt Local or Remote
      KeyHelper->>+JwksHost: getKeys()
    else
      KeyHelper->>KeyHelper: getKey(kid, filePath)
      Note right of KeyHelper: developer and test experience <br/> without relying on <br/>external Jwks Host [A]
    end
    KeyHelper-->>-Module: key for kid
    Module-->>-App: done
    App-->>-User: ok/not ok

```

# Options object
An option object is optionaly injected at the start. The presence of the `options` object implies that **NO** environment variables are to be used. This permits couple of scenarios
- Explicit paths that need something different - so the injection can override what an `env` variable might provide. Regardless, even in that situation, the code that creates the `options` object can also pull from `env`.
- Developer and Test scenarios - Test frameworks need to create valid tokens, and the verification needs some key data offline and disconnected at least during unit testing. For develper experience, this allows ease of use whithout the need to standup a signing authority and Jwks Endpoint just to try out the module.

## Rule for Options

```
{ exclude: 'paths to exlude in routes',
  alg?: 'if there is an alt alg to use - note that RS256 is default',
  jwksurl: 'this can be `string|function`,
  iss? : 'if present also validate',
  aud? : 'if present also validate'}

```

### alg
if `alg` is supplied, this becomes a verification aspect. Jwt tokens supply the `alg` as part of the header, along with the `kid`

### jwksurl
if the `jwksurl` is a string, it is parsed to ensure its valid url. If so, then the `JwksHost` is to be called for the keyset and key for `kid`.

if `jwksurl` is a string and not a url, it is assumed to be the verification key - in `RS256` this is the public key material in PEM format.

If the `jwksurl` is a function then it implements a known interface (TBD) that provides a callback that delivers the secret or key for the `kid`

> Notes: from the diagram

- [A] Key information provided as part of the `options` object or an `environment` variable can be full `URL` or file reference to local `PEM` file that contains the `public key` to verify the singature.

## Environment Variables.
The presence of an `options` object precludes any `env` variables to be used for processing. If the `options` object is absent or empty, the `env` variables are used for configuration.

>Note: all of the `jwtproxy` variables are prefixed with `JWTP_`

- JWTP_ALG: string
- JWTP_URL: string
- JWTP_ISS: string
- JWTP_AUD: string

It is NOT expected in the `env` use case that the `JWTP_URL` will be used as a `function` type. Either a pure `PEM` public key for signature verification or a proper `URL` to a Jwks Host endpoint that provide key material.

