##Open Banking - ADR
Open Banking ADR - is the data recipient implementation following the ACCC requirement.

### Modules

|Module|Functionality|Comments|
|---|---|---|
|api| API Layer | expose all functionality as ADR|
|consent-service| Consent Management||
|Ingestion-worker| Integtion work| the client which will send resource request|
|Nats| MSA management||
|Natsboard| dashboard for MSA||
|persistent-service| Persistent Layer||
|registration-management-service| authentication management||
|scheduler-service| Scheduler Job Management||
