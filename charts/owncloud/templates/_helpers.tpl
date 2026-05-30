{{/*
Expand the name of the chart.
*/}}
{{- define "owncloud.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "owncloud.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "owncloud.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "owncloud.labels" -}}
helm.sh/chart: {{ include "owncloud.chart" . }}
{{ include "owncloud.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels.
*/}}
{{- define "owncloud.selectorLabels" -}}
app.kubernetes.io/name: {{ include "owncloud.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
ServiceAccount name.
*/}}
{{- define "owncloud.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "owncloud.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
ownCloud admin Secret name.
*/}}
{{- define "owncloud.adminSecretName" -}}
{{- if .Values.owncloud.admin.existingSecret }}
{{- .Values.owncloud.admin.existingSecret }}
{{- else }}
{{- printf "%s-admin" (include "owncloud.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Database Secret name.
*/}}
{{- define "owncloud.databaseSecretName" -}}
{{- if .Values.database.existingSecret }}
{{- .Values.database.existingSecret }}
{{- else }}
{{- printf "%s-database" (include "owncloud.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Extra secret environment Secret name.
*/}}
{{- define "owncloud.secretEnvName" -}}
{{- if .Values.secretEnv.existingSecret.name }}
{{- .Values.secretEnv.existingSecret.name }}
{{- else if .Values.secretEnv.name }}
{{- .Values.secretEnv.name }}
{{- else }}
{{- printf "%s-secret" (include "owncloud.fullname" .) }}
{{- end }}
{{- end }}

{{/*
MariaDB service name.
*/}}
{{- define "owncloud.mariadbServiceName" -}}
{{- printf "%s-mariadb" (include "owncloud.fullname" .) }}
{{- end }}

{{/*
Redis service name.
*/}}
{{- define "owncloud.redisServiceName" -}}
{{- printf "%s-redis" (include "owncloud.fullname" .) }}
{{- end }}

{{/*
Database host passed to ownCloud.
*/}}
{{- define "owncloud.databaseHost" -}}
{{- if .Values.database.host }}
{{- .Values.database.host }}
{{- else if .Values.mariadb.enabled }}
{{- include "owncloud.mariadbServiceName" . }}
{{- else }}
{{- required "database.host is required when mariadb.enabled=false" .Values.database.host }}
{{- end }}
{{- end }}

{{/*
Redis host passed to ownCloud.
*/}}
{{- define "owncloud.redisHost" -}}
{{- if .Values.redis.host }}
{{- .Values.redis.host }}
{{- else if and .Values.redis.enabled .Values.redis.internal }}
{{- include "owncloud.redisServiceName" . }}
{{- else }}
{{- required "redis.host is required when redis.enabled=true and redis.internal=false" .Values.redis.host }}
{{- end }}
{{- end }}

{{/*
Comma-separated trusted domains for the container env var.
*/}}
{{- define "owncloud.trustedDomains" -}}
{{- if .Values.owncloud.trustedDomains }}
{{- join "," .Values.owncloud.trustedDomains }}
{{- else }}
{{- .Values.owncloud.domain }}
{{- end }}
{{- end }}
