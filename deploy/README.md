# Deployment Guide

This folder contains deployment assets for the Merkeb Music streaming site.

## Docker Compose Production

```powershell
docker compose -f docker-compose.prod.yml up --build -d
```

Check health:

```powershell
curl http://localhost:3000/api/health
```

Stop:

```powershell
docker compose -f docker-compose.prod.yml down
```

## Kubernetes

Update the image in `deploy/kubernetes/deployment.yaml`:

```yaml
image: ghcr.io/your-github-username/merkeb-music:latest
```

Apply:

```powershell
kubectl apply -k deploy/kubernetes
```

Check rollout:

```powershell
kubectl rollout status deployment/merkeb-music -n merkeb-music
```

Port-forward for local testing:

```powershell
kubectl port-forward service/merkeb-music-service 3000:80 -n merkeb-music
```

Then open:

```text
http://localhost:3000
```

## DevOps Checklist

- CI runs syntax checks and smoke tests.
- Docker image is buildable from `Dockerfile`.
- Health endpoint is available at `/api/health`.
- Kubernetes has liveness and readiness probes.
- Nginx reverse proxy preserves audio range requests for streaming.
- Runtime configuration is kept in environment variables.
