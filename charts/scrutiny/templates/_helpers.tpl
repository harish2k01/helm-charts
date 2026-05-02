{{/*
Expand the name of the chart
*/}}
{{- define "scrutiny.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a fully qualified app name
*/}}
{{- define "scrutiny.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else if eq .Release.Name .Chart.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "scrutiny.labels" -}}
app.kubernetes.io/name: {{ include "scrutiny.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "scrutiny.selectorLabels" -}}
app.kubernetes.io/name: {{ include "scrutiny.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}