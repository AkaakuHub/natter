resource "cloudflare_r2_bucket" "assets" {
  account_id = var.cloudflare_account_id
  name       = local.r2_bucket_name
  location   = var.r2_bucket_location
}
