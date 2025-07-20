Below is a phased rollout plan that layers **Datadog** on top of the Google Cloud Run + Cloudflare Zero Trust staging stack we designed earlier.
It covers log collection, APM traces, Real‑User‑Monitoring (RUM), dashboards/alerts, CI automation, security, and cost controls—so that by the end you can correlate a user click in the browser with the exact request, container log line, and Cloud Run CPU spike that followed.

---

## 1 · Prerequisites & one‑time setup

| Task                                                               | Why / Detail                                                                                                                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Create a Datadog org & choose site (us1, eu1, etc.)**            | Required for API endpoints and RUM SDK `site` option.                                                                                                            |
| **Add the Google Cloud Integration in Datadog**                    | Supplies Cloud Run metrics via GCP Monitoring APIs; service account needs `Monitoring Viewer`, `Logging Viewer`, `Pub/Sub Subscriber`. ([Datadog Monitoring][1]) |
| **Generate a Datadog API key + RUM Client Token / Application ID** | API key is used by log forwarders and the Node tracer; token/ID are embedded in the browser SDK. ([Datadog Monitoring][2], [Datadog Monitoring][2])              |
| **Store secrets in GCP Secret Manager & GitHub Actions secrets**   | Never commit keys or tokens; they are injected at deploy time.                                                                                                   |

---

## 2 · Backend observability (Cloud Run)

### 2.1 Logs

1. **Create a Log Router sink** in Cloud Logging that exports only the Cloud Run service’s logs to a **Pub/Sub topic**. ([Datadog Monitoring][1])
2. Deploy Datadog’s **Dataflow Log Forwarder template** (or Cloud Function) subscribed to that topic; it batches, compresses, and pushes logs to `https://gcp-intake.logs.<site>/api/v2/logs?dd-api-key=<KEY>`. ([Datadog Monitoring][3], [Google Cloud][4])
3. Tag the sink with `DD_SERVICE`, `DD_ENV=staging`, and `DD_VERSION` (git SHA) using **Unified Service Tagging** conventions; this makes logs joinable with traces/RUM. ([Datadog Monitoring][5])

**Side‑car alternative (for very high‑throughput or air‑gapped cases)**
Add Datadog’s “serverless” side‑car to the Cloud Run revision, mount an in‑memory volume `shared-volume/`, and set `DD_SERVERLESS_LOG_PATH=/shared-volume/logs/*.log`. ([Datadog Monitoring][6])

### 2.2 Metrics

Once the GCP integration is active, Datadog auto‑imports Cloud Run metrics such as `gcp.run.container.cpu.usage.avg` and `gcp.run.container.billable_instance_time`. ([Datadog Monitoring][1])

### 2.3 APM / Tracing

1. **Node / TypeScript services**

   ```js
   // index.js — must run before any other import
   require('dd-trace').init({
     service: 'api-staging',
     env: 'staging',
     logInjection: true,          // puts trace IDs in your logs
     appsec: true                 // optional App‑Sec WAF
   })
   ```

   *Key variables*: `DD_SITE`, `DD_ENV`, `DD_SERVICE`, `DD_VERSION`, `DD_LOGS_INJECTION=true` for auto log <-> trace links. ([Datadog Monitoring][7], [Datadog Monitoring][8], [Datadog Monitoring][9])
2. **Go / Rust micro‑services** – use OpenTelemetry exporters pointed at `https://trace.agent.datadoghq.com`, or the Datadog libraries if available; map `service.name`, `deployment.environment`, and `service.version` to the same tags used above. ([Datadog Monitoring][10])

---

## 3 · Frontend observability (Browser RUM)

### 3.1 Install & configure

```ts
import { datadogRum } from '@datadog/browser-rum'

datadogRum.init({
  applicationId: '<APP_ID>',
  clientToken:   '<CLIENT_TOKEN>',
  site:          'datadoghq.com',
  service:       'web-staging',
  env:           'staging',
  sessionSampleRate:        100,
  sessionReplaySampleRate:  20,   // optional
  trackResources:           true,
  trackLongTasks:           true,
  trackUserInteractions:    true
})
datadogRum.startSessionReplayRecording()
```

([Datadog Monitoring][2])
Inject the snippet through your build system so tokens never appear in source control (e.g., Next.js `process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN`).

### 3.2 Correlate RUM with backend traces

Enable “RUM & Traces correlation” in Datadog and be sure the service/env values match; Datadog will automatically decorate HTTP spans with `session_id` so you can pivot from a slow page view to the exact Cloud Run request. ([Datadog Monitoring][11])

### 3.3 Source‑map upload (optional but highly recommended)

Add a CI step after every front‑end build:

```yaml
- name: Upload JS source‑maps to Datadog
  run: npx datadog-ci sourcemaps upload ./dist \
       --service web-staging --release-version $GITHUB_SHA
  env:
    DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
```

([Datadog Monitoring][12])

---

## 4 · Dashboards, monitors & SLOs

| Asset                                                                        | How to create                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cloud Run service overview** (CPU %, instance count, p95 latency, 4xx/5xx) | Import Datadog’s Cloud Run dashboard JSON or define with Terraform `datadog_dashboard` resources. ([Terraform Registry][13])                                                                                                  |
| **Full‑stack service map** (browser → API)                                   | Leverages the RUM + Trace correlation above; no extra work.                                                                                                                                                                   |
| **Alerts**                                                                   | Start with: <br/>• `avg(last_5m):trace.apm.errors{service:api-staging}.rate_by_status{status:5xx} > 0.05`<br/>• `p95(api-staging.http.response_time{env:staging}) > 1500ms`<br/>• `rum.lcp{service:web-staging}.p95 > 4000ms` |

---

## 5 · CI/CD integration

| Pipeline phase              | Action                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Build**                   | Docker build & push; Webpack/Vite bundle + RUM snippet.                                                        |
| **Test**                    | Run unit/integration tests; fail if `datadog-ci` synthetic‑tests step fails.                                   |
| **Deploy**                  | GitHub Action `google-github-actions/deploy-cloudrun@v2` as in the previous plan; then purge Cloudflare cache. |
| **Observability post‑step** | *Backend*: tracer sends spans automatically.<br/>*Frontend*: `datadog-ci sourcemaps upload` as above.          |

All secrets (`DD_API_KEY`, `DD_APP_KEY`, `DATADOG_API_KEY`, RUM tokens) live in **GitHub Actions Secrets** and are injected via environment variables.

---

## 6 · Security & compliance safeguards

* Use a **restricted Datadog API key** that is **logs + metrics + traces ingest‑only**—no read or admin scopes.
* Store RUM tokens in Cloudflare **Workers KV** if you ever render them at the edge.
* Add IP allow‑lists in the Datadog org settings so only Cloud Run and CI outbound ranges can post logs.

---

## 7 · Cost controls & sampling

| Layer              | Default     | Suggested for staging                          |
| ------------------ | ----------- | ---------------------------------------------- |
| **Cloud Run logs** | All lines   | Keep full logs; volume is low in staging.      |
| **Node tracer**    | 100 % spans | `DD_TRACE_SAMPLE_RATE=0.5` if cost spikes.     |
| **RUM sessions**   | 100 %       | `sessionSampleRate=20` once things are stable. |

Datadog’s free tier already covers 5 hosts and 1 M RUM events/month; the GCP integration itself is free. ([Datadog][14])

---

## 8 · Roll‑out timeline

| Phase                                             | Duration | Exit criteria                                                               |
| ------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| **0 – Enable GCP‑Datadog integration & log sink** | 30 min   | Cloud Run metrics visible; logs flowing.                                    |
| **1 – Add dd‑trace to API container**             | 1‑2 h    | Trace flame‑graphs in Datadog APM.                                          |
| **2 – Front‑end RUM SDK & source‑maps**           | 2 h      | Page views appear; stack traces de‑obfuscated.                              |
| **3 – Dashboards & monitors**                     | 1 day    | PagerDuty/Slack alerts firing on test errors.                               |
| **4 – Production promotion**                      | —        | Replicate the config with `DD_ENV=prod`, widen Cloudflare Zero Trust rules. |

Follow this checklist and you’ll have a **single, searchable timeline** from a user’s click in the staging site to the container log line on Cloud Run—protected by Cloudflare Zero Trust and ready to scale to production with a flip of `DD_ENV`.

[1]: https://docs.datadoghq.com/integrations/google-cloud-run/ "Google Cloud Run
"
[2]: https://docs.datadoghq.com/real_user_monitoring/browser/setup/client/ "Browser Monitoring Client-Side Instrumentation
"
[3]: https://docs.datadoghq.com/logs/guide/collect-google-cloud-logs-with-push/ "Collect Google Cloud Logs with a Pub/Sub Push Subscription
"
[4]: https://cloud.google.com/architecture/partners/stream-cloud-logs-to-datadog "Stream logs from Google Cloud to Datadog  |  Cloud Architecture Center"
[5]: https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/?utm_source=chatgpt.com "Unified Service Tagging - Datadog Docs"
[6]: https://docs.datadoghq.com/serverless/google_cloud_run/ "Google Cloud Run
"
[7]: https://docs.datadoghq.com/tracing/trace_collection/automatic_instrumentation/dd_libraries/nodejs/?utm_source=chatgpt.com "Tracing Node.js Applications - Datadog Docs"
[8]: https://docs.datadoghq.com/tracing/other_telemetry/connect_logs_and_traces/nodejs/?utm_source=chatgpt.com "Correlating Node.js Logs and Traces - Datadog Docs"
[9]: https://docs.datadoghq.com/security/application_security/setup/standalone/nodejs/?utm_source=chatgpt.com "Enabling Application & API Protection for Node.js - Datadog Docs"
[10]: https://docs.datadoghq.com/opentelemetry/config/environment_variable_support/?utm_source=chatgpt.com "Using OpenTelemetry Environment Variables with Datadog SDKs"
[11]: https://docs.datadoghq.com/real_user_monitoring/connect_rum_and_traces "Connect RUM and Traces
"
[12]: https://docs.datadoghq.com/real_user_monitoring/guide/upload-javascript-source-maps/?utm_source=chatgpt.com "Upload JavaScript Source Maps - Datadog Docs"
[13]: https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/dashboard?utm_source=chatgpt.com "datadog_dashboard | Resources | DataDog ... - Terraform Registry"
[14]: https://www.datadoghq.com/blog/monitoring-cloud-run-datadog/ "Monitor Cloud Run with Datadog | Datadog"
