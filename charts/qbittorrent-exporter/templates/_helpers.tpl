{{/*
Expand the name of the chart.
*/}}
{{- define "qbittorrent-exporter.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "qbittorrent-exporter.fullname" -}}
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
{{- define "qbittorrent-exporter.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "qbittorrent-exporter.labels" -}}
helm.sh/chart: {{ include "qbittorrent-exporter.chart" . }}
{{ include "qbittorrent-exporter.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/component: exporter
app.kubernetes.io/part-of: qbittorrent
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels.
*/}}
{{- define "qbittorrent-exporter.selectorLabels" -}}
app.kubernetes.io/name: {{ include "qbittorrent-exporter.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Secret name for qBittorrent credentials.
*/}}
{{- define "qbittorrent-exporter.secretName" -}}
{{- if .Values.qbittorrent.auth.existingSecret }}
{{- .Values.qbittorrent.auth.existingSecret }}
{{- else }}
{{- include "qbittorrent-exporter.fullname" . }}
{{- end }}
{{- end }}
