{{/*
Expand the name of the chart.
*/}}
{{- define "pocket-id.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "pocket-id.fullname" -}}
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
{{- define "pocket-id.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "pocket-id.labels" -}}
helm.sh/chart: {{ include "pocket-id.chart" . }}
{{ include "pocket-id.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels.
*/}}
{{- define "pocket-id.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pocket-id.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Secret name.
*/}}
{{- define "pocket-id.secretName" -}}
{{- if .Values.secretEnv.existingSecret.name }}
{{- .Values.secretEnv.existingSecret.name }}
{{- else if .Values.secretEnv.name }}
{{- .Values.secretEnv.name }}
{{- else }}
{{- printf "%s-secret" (include "pocket-id.fullname" .) }}
{{- end }}
{{- end }}
