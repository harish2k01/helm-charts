{{/*
Expand the name of the chart.
*/}}
{{- define "cloudflared.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "cloudflared.fullname" -}}
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
{{- define "cloudflared.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "cloudflared.labels" -}}
helm.sh/chart: {{ include "cloudflared.chart" . }}
app.kubernetes.io/name: {{ include "cloudflared.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels.
*/}}
{{- define "cloudflared.selectorLabels" -}}
{{- toYaml .Values.selectorLabels }}
{{- end }}

{{/*
Name of the Secret containing the tunnel token.
*/}}
{{- define "cloudflared.tokenSecretName" -}}
{{- .Values.token.secretName | default (printf "%s-token" (include "cloudflared.fullname" .)) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Build the cloudflared tunnel run command.
*/}}
{{- define "cloudflared.command" -}}
{{- $args := list "cloudflared" "tunnel" -}}
{{- if .Values.cloudflared.noAutoupdate }}
{{- $args = append $args "--no-autoupdate" -}}
{{- end }}
{{- $args = append $args "--loglevel" -}}
{{- $args = append $args .Values.cloudflared.logLevel -}}
{{- if .Values.cloudflared.metrics.enabled }}
{{- $args = append $args "--metrics" -}}
{{- $args = append $args .Values.cloudflared.metrics.address -}}
{{- end }}
{{- range .Values.cloudflared.extraArgs }}
{{- $args = append $args . -}}
{{- end }}
{{- $args = append $args "run" -}}
{{- toYaml $args }}
{{- end }}
