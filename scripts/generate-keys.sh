#!/bin/bash
# Generates the RSA key pair used to sign OIDC tokens (RS256).
# Usage: bash scripts/generate-keys.sh
set -e
CERT_DIR="apps/api/cert"
mkdir -p "$CERT_DIR"
openssl genpkey -algorithm RSA -out "$CERT_DIR/private-key.pem" -pkeyopt rsa_keygen_bits:2048
openssl rsa -in "$CERT_DIR/private-key.pem" -pubout -out "$CERT_DIR/public-key.pub"
echo "Keys generated in $CERT_DIR/"
