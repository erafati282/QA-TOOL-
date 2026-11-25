# AssureHub — Application Quality

AssureHub is a local interactive prototype for an internal application assurance portal. It demonstrates a quality dashboard, application registry, reusable scenario library, simulated test runs, developer findings, and sample reports.

## Run locally

Requires Node.js. From this directory, run:

```sh
node serve.mjs
```

Then open <http://127.0.0.1:4173>.

## Test Standards and Tavily

The Test Standards page includes the latest published ISO/IEC 27701 edition shown in ISO’s catalogue: ISO/IEC 27701:2025, Edition 2 (published October 2025). The “Refresh from Tavily” action searches ISO-domain sources through a same-origin server endpoint.

For Tavily refreshes, set `TAVILY_API_KEY` in the environment used to start Node, then run `node serve.mjs`. Keep the key in a local secret manager or environment variable; do not add it to client JavaScript or commit it. If the variable is absent, the official ISO record remains visible and the refresh action reports that Tavily is not configured.

## AI report and chat

The Discover report can send its compact dashboard summary to NVIDIA's `moonshotai/kimi-k3.1-pro` model after opt-in. A screenshot is withheld unless the user separately confirms it was manually checked and personal details removed. Configure `NVIDIA_API_KEY` in the Node server environment; never put the key in browser code or project files. The repository includes a floating assistant chat that uses OpenRouter's `baidu/ernie-5.5-flash-preview:free` model and `OPENROUTER_API_KEY`. Dashboard context in chat is optional and off by default. Restart the server after configuring environment variables.

## Automation scenario suggestions

The Automation tab accepts TXT, Markdown, or CSV RFP text plus build metadata and an optional build package reference. With explicit consent, locally filtered RFP text and metadata are sent to OpenRouter's Baidu ERNIE Flash model to produce traceable scenario suggestions and coverage gaps. A separate, optional consent sends filtered scenario drafts and build metadata to OpenAI `gpt-5-mini` for a constrained review; the RFP itself and build package are not sent in this second step. The OpenAI key must be configured as `OPENAI_API_KEY` in the Node server environment, never browser code or project files. The review treats supplied text as untrusted data, uses structured output, validates the returned fields and count, and cannot run tools or tests. Reviewed scenarios and a redacted activity summary are kept in this browser's local storage and shown in Audit & Logs → Automation AI. This prototype does not inspect or execute uploaded builds and does not run automated tests. For production use, move audit records to authenticated server-side storage with access controls and retention policies.

## PII filtering

`privacy.mjs` applies deterministic local pattern filters at the server boundary before text is sent to OpenRouter, OpenAI, or NVIDIA. Its data categories follow the linked [`pii` project](https://github.com/ramishaheen/pii), which focuses on likely PII fields and combinations in tabular data; this Node app uses its own local filters and does not install the R package. It masks common email and phone formats, IP addresses, labeled names and identifiers, labeled addresses and locations, coordinates, likely payment-card numbers, and common API-token formats. Sensitive values in fields such as owner, actor, or contact are pseudonymized before local-storage writes. The demo login no longer persists the entered username. AI outputs are filtered again before they are returned or stored. Screenshots are never automatically scanned; a selected image remains local unless the user separately confirms manual PII removal.

This is a lightweight filter, not a complete PII detector: unlabelled names or locations, indirect identifiers, and combinations of otherwise ordinary details can be missed. Review and minimize data before sharing; use synthetic examples where possible. Browser local storage is not encrypted. Run `node privacy-check.mjs` for a small check of the PII filters.

## Prototype boundary

The username/password screen is a demo gate only: it accepts any non-empty values, stores only the username for the browser tab session, and does not authenticate users or protect server endpoints. All applications, results, owners, findings, and reports are sample data. “Start a test run” simulates a run and does not open or execute tests against an application. The optional test URL in the registration form is not called. No CI, source control, ticketing, or operator systems are connected.

Before using real applications, the next implementation step is to agree on supported test frameworks and approved QA environments, then add an authenticated runner/CI integration with scoped credentials, isolated test data, evidence retention, and reviewer-controlled closure. Only run checks against systems the organization owns or has explicitly authorized for testing.
