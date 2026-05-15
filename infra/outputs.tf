output "d1_database_id" {
  value = cloudflare_d1_database.main.id
}

output "d1_database_name" {
  value = cloudflare_d1_database.main.name
}

output "r2_bucket_name" {
  value = cloudflare_r2_bucket.assets.name
}

output "frontend_worker_service_name" {
  value = var.frontend_worker_service_name
}

output "api_worker_service_name" {
  value = var.api_worker_service_name
}

output "frontend_worker_hostname" {
  value = var.enable_worker_custom_domains ? cloudflare_workers_custom_domain.frontend[0].hostname : null
}

output "api_worker_hostname" {
  value = var.enable_worker_custom_domains ? cloudflare_workers_custom_domain.api[0].hostname : null
}
