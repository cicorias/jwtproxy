#!/usr/bin/env bash
openssl genrsa 2048 | tee private.pem | npx pem-jwk > private.json