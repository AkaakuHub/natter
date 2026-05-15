resource "cloudflare_workers_custom_domain" "frontend" {
  count = var.enable_worker_custom_domains ? 1 : 0

  account_id = var.cloudflare_account_id
  hostname   = local.frontend_worker_hostname
  service    = var.frontend_worker_service_name
  zone_id    = var.cloudflare_zone_id
}

resource "cloudflare_workers_custom_domain" "api" {
  count = var.enable_worker_custom_domains ? 1 : 0

  account_id = var.cloudflare_account_id
  hostname   = local.api_worker_hostname
  service    = var.api_worker_service_name
  zone_id    = var.cloudflare_zone_id
}
