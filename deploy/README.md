# VPS deployment (Caddy + Cloudflare)

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds the app and rsyncs `dist/` to the VPS.

## One-time VPS setup (Ubuntu)

```bash
apt update && apt install -y caddy rsync
adduser --disabled-password --gecos "" deploy
mkdir -p /var/www/squash && chown deploy:deploy /var/www/squash

# on your laptop: ssh-keygen -t ed25519 -f deploy_key -N ""
mkdir -p /home/deploy/.ssh
echo "<contents of deploy_key.pub>" >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys

ufw allow OpenSSH && ufw allow 80,443/tcp && ufw enable
```

Copy `deploy/Caddyfile` to `/etc/caddy/Caddyfile`, set your domain, then `systemctl reload caddy`.

## Cloudflare

- DNS: A record for the subdomain pointing at the VPS IP, proxied (orange cloud).
- SSL/TLS mode: **Full (strict)**. Caddy obtains a Let's Encrypt cert automatically.

## GitHub secrets (Settings → Secrets and variables → Actions)

| Secret | Example |
|---|---|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | `deploy` |
| `VPS_PATH` | `/var/www/squash/` |
| `VPS_SSH_KEY` | contents of `deploy_key` (private key) |

## Adding another app

1. `mkdir /var/www/<app> && chown deploy:deploy /var/www/<app>`
2. Add a block to the Caddyfile and `systemctl reload caddy`.
3. Add a Cloudflare DNS record.
4. Copy the workflow into that app's repo with its own `VPS_PATH`.
