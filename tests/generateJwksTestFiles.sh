#!/usr/bin/env bash
openssl genrsa 2048 | tee private.pem | npx pem-jwk > private.json
openssl rsa -in private.pem -pubout -out public.pem
