variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_id" {
  type = string
}

variable "cloudflare_zone_id" {
  type = string
}

variable "project_name" {
  type    = string
  default = "natter"
}

variable "domain_name" {
  type = string
}

variable "frontend_worker_service_name" {
  type    = string
  default = "natter-frontend"
}

variable "api_worker_service_name" {
  type    = string
  default = "natter-api"
}

variable "frontend_worker_hostname" {
  type    = string
  default = null
}

variable "api_worker_hostname" {
  type    = string
  default = null
}

variable "enable_worker_custom_domains" {
  type    = bool
  default = false
}

variable "r2_bucket_location" {
  type    = string
  default = "apac"
}

locals {
  frontend_worker_hostname = coalesce(var.frontend_worker_hostname, var.domain_name)
  api_worker_hostname      = coalesce(var.api_worker_hostname, "api.${var.domain_name}")
  d1_database_name         = var.project_name
  r2_bucket_name           = "${var.project_name}-assets"
}
