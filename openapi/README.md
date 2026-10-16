# OpenAPI contract

`openapi.yaml` is the agreed shape of the API between the front end and back end (endpoints, request/response bodies, error format). Update it in the same PR as any endpoint change — this file should never lag behind what the backend actually does.

## Get docs

Use **https://editor.swagger.io** to generate docs. To run locally or in CI instead:

```bash
npx @redocly/cli preview-docs openapi.yaml   # Redoc, live-reloading
# or
npx swagger-ui-watcher openapi.yaml          # Swagger UI
```

## Validate

Catches a broken `$ref`, a malformed schema, etc. Worth running in CI on every change:

```bash
npx @redocly/cli lint openapi.yaml
```

## Generate TypeScript types

Turns every schema in the contract into a TS type.

```bash
npx openapi-typescript openapi.yaml -o ../front/src/types/api.d.ts
```

## Mock the API

```bash
npx openapi-mock -p 4010 openapi.yaml
```

Point API base URL at the mock server's port while the real backend endpoint isn't ready yet.
'