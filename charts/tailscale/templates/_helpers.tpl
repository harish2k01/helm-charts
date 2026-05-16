{{/*
Expand the name of the chart.
*/}}
{{- define "tailscale.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "tailscale.fullname" -}}
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
{{- define "tailscale.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "tailscale.labels" -}}
helm.sh/chart: {{ include "tailscale.chart" . }}
{{ include "tailscale.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels.
*/}}
{{- define "tailscale.selectorLabels" -}}
app.kubernetes.io/name: {{ include "tailscale.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Name of the Secret containing TS_AUTHKEY.
*/}}
{{- define "tailscale.authSecretName" -}}
{{- if .Values.authKey.existingSecret }}
{{- .Values.authKey.existingSecret }}
{{- else }}
{{- printf "%s-auth" (include "tailscale.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Build TS_EXTRA_ARGS from structured exit-node values and raw extras.
*/}}
{{- define "tailscale.extraArgs" -}}
{{- $args := list -}}
{{- if .Values.tailscale.advertiseExitNode }}
{{- $args = append $args "--advertise-exit-node" -}}
{{- end }}
{{- range .Values.tailscale.extraArgs }}
{{- $args = append $args . -}}
{{- end }}
{{- join " " $args -}}
{{- end }}
