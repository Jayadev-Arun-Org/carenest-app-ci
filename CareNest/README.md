<div align="center">

# 🏥 CareNest

### Modern Healthcare Management Platform

[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/u/jayadevarun2003)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

*A microservices-based healthcare application — fully Dockerized, Helm-packaged, and production-ready on AWS EC2 with Kubernetes.*

</div>

---

## 📋 Overview

**CareNest** is a full-stack healthcare management platform with:

- **Patients**: Book appointments, view prescriptions, manage healthcare journey
- **Doctors**: Manage schedules, confirm appointments, create prescriptions
- **Platform**: JWT auth with RBAC, real-time notifications, Redis caching

---

## 🏗️ Production Architecture (AWS EC2 + Kubernetes)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       INTERNET                                      │
│                                                                     │
│  User Browser ──► HAProxy EC2 (Public IP :80)                       │
│                      │                                              │
│                      │  haproxy.cfg:                                 │
│                      │    server node1 <worker1>:30080               │
│                      │    server node2 <worker2>:30080               │
└──────────────────────┼──────────────────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────────────────┐
│                      ▼  KUBERNETES CLUSTER                          │
│                                                                     │
│  NodePort (30080) ──► Envoy Gateway Proxy Pods                      │
│                              │                                      │
│                       HTTPRoute Rules                               │
│              ┌───────┬───────┼───────┬──────────┐                   │
│              ▼       ▼       ▼       ▼          ▼                   │
│           auth    appt    pharma  notify    frontend                │
│          :3001   :3002    :3003   :3004       :80                   │
│              │       │       │       │                              │
│              └───────┴───────┴───────┘                              │
│                          │                                          │
│               MongoDB StatefulSet + Redis                           │
│                                                                     │
│                    (2 Worker Nodes on EC2)                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Traffic Flow

1. User sends request to **HAProxy EC2** (public IP, port 80)
2. HAProxy load-balances to Kubernetes **NodePort 30080** on worker nodes
3. NodePort reaches **Envoy Gateway** proxy pods
4. Envoy applies **HTTPRoute** path-based routing:
   - `/api/auth/*` → auth-service:3001
   - `/api/appointments/*` → appointment-service:3002
   - `/api/prescriptions/*` → pharmacy-service:3003
   - `/api/notifications/*` → notify-service:3004
   - `/*` → frontend-service:80
5. All backend services are **ClusterIP** (internal only)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JWT-based auth with RBAC (Patient & Doctor roles) |
| 📅 **Appointments** | Create, confirm, cancel, complete appointments |
| 💊 **Prescriptions** | Doctors create; patients view and track |
| 🔔 **Notifications** | Real-time alerts for patients and doctors |
| 🎨 **Modern UI** | React + Tailwind CSS v4 with animations |
| 🐳 **Dockerized** | Multi-stage production Dockerfiles |
| ☸️ **Kubernetes** | Full Helm chart with HPA, RBAC, PDB, NetworkPolicy |
| 🌐 **Gateway API** | Envoy Gateway with HTTPRoute routing |
| ❤️ **Health Checks** | Every service exposes `/health` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 6, Tailwind CSS v4, Axios |
| **Backend** | Node.js 20, Express 4, Mongoose 8, JWT |
| **Database** | MongoDB 7 (StatefulSet), Redis 7 |
| **Gateway** | Envoy Gateway (Gateway API) |
| **Proxy** | HAProxy (external EC2) |
| **Orchestration** | Kubernetes (kubeadm on EC2) |
| **Packaging** | Helm 3, Docker |

---

## 🚀 Deployment Guide

### Prerequisites

- 2+ EC2 instances for Kubernetes worker nodes
- 1 EC2 instance for HAProxy (public IP)
- Kubernetes cluster initialized (kubeadm)
- `kubectl`, `helm` 3.x installed
- Docker images pushed to Docker Hub

### Step 1: Install Gateway API CRDs + Envoy Gateway

```bash
# Gateway API CRDs
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.0/standard-install.yaml

# Envoy Gateway controller
helm install envoy-gateway oci://docker.io/envoyproxy/gateway-helm \
  --version v1.2.0 -n envoy-gateway-system --create-namespace

# Verify GatewayClass exists
kubectl get gatewayclasses
# Expected: NAME=eg  CONTROLLER=gateway.envoyproxy.io/gatewayclass-controller
```

### Step 2: Create Namespace

```bash
kubectl create namespace carenest-dev
```

### Step 3: Configure AWS Security Groups

See [docs/aws-security-groups.md](docs/aws-security-groups.md) for complete rules.

**Critical rule**: Worker nodes must allow ALL traffic from each other:
```bash
aws ec2 authorize-security-group-ingress \
  --group-id <WORKER_SG_ID> --protocol all --source-group <WORKER_SG_ID>
```

### Step 4: Deploy with Helm

```bash
# Update values.yaml with your worker node IPs first
# Then deploy:
helm install carenest ./helm/carenest \
  --set namespace=carenest-dev \
  --set environment=dev

# Verify
kubectl get pods -n carenest-dev
kubectl get gateway,httproute -n carenest-dev
kubectl get svc -n carenest-dev
```

### Step 5: Find the Gateway NodePort

```bash
# The Envoy Gateway auto-creates a service — find its NodePort
kubectl get svc -n carenest-dev | grep envoy
# Look for the NodePort mapping (should be 30080)
```

### Step 6: Configure HAProxy EC2

```bash
# Copy the HAProxy config to your EC2
scp helm/carenest/haproxy-ec2.cfg ec2-user@<HAPROXY_IP>:/tmp/

# SSH into HAProxy EC2
ssh ec2-user@<HAPROXY_IP>

# Install HAProxy
sudo yum install haproxy -y   # Amazon Linux
# OR
sudo apt install haproxy -y   # Ubuntu

# Deploy config (edit IPs first!)
sudo cp /tmp/haproxy-ec2.cfg /etc/haproxy/haproxy.cfg
sudo nano /etc/haproxy/haproxy.cfg
# Replace WORKER_NODE_1_IP and WORKER_NODE_2_IP

# Start HAProxy
sudo systemctl enable haproxy
sudo systemctl restart haproxy
sudo systemctl status haproxy
```

### Step 7: Verify End-to-End

```bash
# From HAProxy EC2
curl http://localhost/api/auth/health
# Expected: {"status":"ok","service":"auth",...}

curl http://localhost/
# Expected: HTML (React frontend)

# From your browser
# Navigate to http://<HAPROXY_PUBLIC_IP>/
```

---

## 📁 Project Structure

```
CareNest/
├── frontend/                  # React Frontend (Vite + nginx)
│   ├── src/
│   ├── nginx.conf             # API proxy + SPA fallback
│   └── Dockerfile
├── services/
│   ├── auth/                  # Auth Service (JWT, RBAC)
│   ├── appointment/           # Appointment Service
│   ├── pharmacy/              # Pharmacy/Prescription Service
│   └── notify/                # Notification Service
├── helm/
│   └── carenest/
│       ├── Chart.yaml
│       ├── values.yaml        # All configurable values
│       ├── haproxy-ec2.cfg    # External HAProxy config
│       └── templates/
│           ├── envoy-gateway.yaml       # Gateway resource
│           ├── envoy-proxy-config.yaml  # EnvoyProxy NodePort config
│           ├── httproute.yaml           # Path-based routing
│           ├── haproxy-deployment.yaml  # In-cluster HAProxy (optional)
│           ├── networkpolicy.yaml       # Firewall rules
│           ├── *-deployment.yaml        # Service deployments
│           ├── *-service.yaml           # ClusterIP services
│           ├── mongo-statefulset.yaml   # MongoDB with PVC
│           ├── rbac.yaml                # ServiceAccount + Role
│           ├── pdb.yaml                 # Pod Disruption Budgets
│           └── hpa-frontend.yaml        # Frontend autoscaler
├── docs/
│   └── aws-security-groups.md # AWS networking guide
├── docker-compose.yml         # Local development
└── README.md
```

---

## 📡 API Endpoints

| Service | Method | Endpoint | Auth | Description |
|---------|--------|----------|------|-------------|
| Auth | POST | `/api/auth/register` | ❌ | Register user |
| Auth | POST | `/api/auth/login` | ❌ | Login (returns JWT) |
| Auth | GET | `/api/auth/profile` | ✅ | Current user profile |
| Auth | GET | `/api/auth/doctors` | ✅ | List all doctors |
| Appointment | POST | `/api/appointments` | ✅ | Create appointment |
| Appointment | GET | `/api/appointments` | ✅ | List appointments |
| Appointment | PUT | `/api/appointments/:id` | ✅ | Update appointment |
| Pharmacy | POST | `/api/prescriptions` | ✅ | Create prescription |
| Pharmacy | GET | `/api/prescriptions` | ✅ | List prescriptions |
| Notify | GET | `/api/notifications` | ✅ | List notifications |
| Notify | PUT | `/api/notifications/read-all` | ✅ | Mark all read |
| All | GET | `/health` | ❌ | Health check |

---

## ☸️ Kubernetes Features

| Feature | Implementation |
|---------|---------------|
| **Rolling Updates** | maxUnavailable: 1, maxSurge: 1 |
| **Health Probes** | readinessProbe + livenessProbe on `/health` |
| **Init Containers** | Wait for MongoDB before starting |
| **HPA** | Frontend: 2→10 pods at 70% CPU |
| **PDB** | minAvailable: 1 for every service |
| **RBAC** | Minimal read-only ServiceAccount |
| **Network Policies** | Default deny + explicit allows (incl. Envoy Gateway) |
| **Gateway API** | Envoy Gateway with HTTPRoute |
| **Persistent Storage** | MongoDB StatefulSet with dynamic PVC |
| **Graceful Shutdown** | terminationGracePeriodSeconds: 30 |

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|---------|
| **503 upstream error** | Check NetworkPolicies allow Envoy → backends: `kubectl get netpol -n carenest-dev` |
| **Gateway not Programmed** | Verify GatewayClass: `kubectl get gatewayclasses` — must be `eg` |
| **Pods stuck in Init** | MongoDB not ready: `kubectl logs <pod> -c wait-for-mongo` |
| **Cross-node pod failure** | AWS SG: worker nodes must allow all traffic from same SG |
| **NodePort unreachable** | Check SG allows 30000-32767 from HAProxy SG |
| **DNS resolution fails** | Check CoreDNS: `kubectl get pods -n kube-system -l k8s-app=kube-dns` |
| **HAProxy 503** | Test NodePort directly: `curl http://<WORKER_IP>:30080/health` |
| **HPA not scaling** | Install metrics-server: `kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml` |
| **PVC pending** | Check StorageClass: `kubectl get sc` |

### Debug Commands

```bash
# Full cluster status
kubectl get all -n carenest-dev

# Gateway status
kubectl describe gateway carenest-gateway -n carenest-dev

# HTTPRoute status
kubectl describe httproute carenest-routes -n carenest-dev

# Envoy proxy logs
kubectl logs -l gateway.envoyproxy.io/owning-gateway-name=carenest-gateway -n carenest-dev

# Test DNS from inside cluster
kubectl run tmp --rm -i --tty --image=busybox -- nslookup auth-service.carenest-dev.svc.cluster.local

# Test service connectivity
kubectl run tmp --rm -i --tty --image=curlimages/curl -- curl -s http://auth-service.carenest-dev:3001/health
```

---

## 🐳 Docker Compose (Local Dev)

```bash
git clone https://github.com/JayadevArun/CareNest.git
cd CareNest
docker-compose up --build
# Frontend: http://localhost:3000
```

---

## 📝 License

This project is licensed under the MIT License.

<div align="center">

**Built with ❤️ using microservices architecture**

[⬆ Back to Top](#-carenest)

</div>
