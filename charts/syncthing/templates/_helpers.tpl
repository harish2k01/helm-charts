{{/*
Expand the name of the chart.
*/}}
{{- define "syncthing.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "syncthing.fullname" -}}
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
{{- define "syncthing.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "syncthing.labels" -}}
helm.sh/chart: {{ include "syncthing.chart" . }}
{{ include "syncthing.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels.
*/}}
{{- define "syncthing.selectorLabels" -}}
app.kubernetes.io/name: {{ include "syncthing.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Primary HTTP service port used by Ingress and HTTPRoute.
*/}}
{{- define "syncthing.httpPort" -}}
{{- $port := 8384 -}}
{{- range .Values.service.ports }}
{{- if or (eq .name "http") (eq .name "web") (eq .name "web-ui") }}
{{- $port = .port -}}
{{- end }}
{{- end }}
{{- $port -}}
{{- end }}
