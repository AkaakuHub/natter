resource "cloudflare_d1_database" "main" {
  account_id       = var.cloudflare_account_id
  name             = local.d1_database_name
  read_replication = { mode = "disabled" }
}
