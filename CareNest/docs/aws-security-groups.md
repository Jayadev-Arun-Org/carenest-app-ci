# AWS Security Groups — CareNest Kubernetes Cluster

This document specifies the exact Security Group rules required for CareNest
to function correctly on AWS EC2 with Kubernetes.

---

## Overview

CareNest uses 3 types of EC2 instances:

| Instance | Role | Security Group |
|----------|------|----------------|
| Control Plane | Kubernetes master | `carenest-k8s-controlplane-sg` |
| Worker Node × 2 | Run all pods | `carenest-k8s-worker-sg` |
| HAProxy EC2 | Public entry point | `carenest-haproxy-sg` |

---

## Security Group: `carenest-k8s-controlplane-sg`

### Inbound Rules

| Type | Protocol | Port Range | Source | Description |
|------|----------|-----------|--------|-------------|
| Custom TCP | TCP | 6443 | Worker SG + HAProxy SG | Kubernetes API server |
| Custom TCP | TCP | 2379-2380 | Control Plane SG (self) | etcd server client API |
| Custom TCP | TCP | 10250 | Worker SG + Control Plane SG | Kubelet API |
| Custom TCP | TCP | 10259 | Control Plane SG (self) | kube-scheduler |
| Custom TCP | TCP | 10257 | Control Plane SG (self) | kube-controller-manager |
| SSH | TCP | 22 | Your IP | SSH access |

### Outbound Rules

| Type | Protocol | Port Range | Destination | Description |
|------|----------|-----------|-------------|-------------|
| All traffic | All | All | 0.0.0.0/0 | Allow all outbound |

---

## Security Group: `carenest-k8s-worker-sg`

### Inbound Rules

| Type | Protocol | Port Range | Source | Description |
|------|----------|-----------|--------|-------------|
| Custom TCP | TCP | 10250 | Control Plane SG + Worker SG | Kubelet API |
| Custom TCP | TCP | 10256 | Worker SG (self) | kube-proxy health check |
| Custom TCP | TCP | 30000-32767 | HAProxy SG + Worker SG | NodePort services |
| All traffic | All | All | Worker SG (self) | **Node-to-node pod traffic (CRITICAL)** |
| Custom UDP | UDP | 8472 | Worker SG (self) | VXLAN (Flannel CNI) |
| Custom TCP | TCP | 179 | Worker SG (self) | BGP (Calico CNI) |
| Custom | 4 (IP-in-IP) | All | Worker SG (self) | IP-in-IP encap (Calico CNI) |
| SSH | TCP | 22 | Your IP | SSH access |

> **⚠️ CRITICAL:** The "All traffic from Worker SG (self)" rule is the most
> commonly missed rule. Without it, pods on different nodes cannot communicate,
> causing intermittent 503 errors and DNS resolution failures.

### Outbound Rules

| Type | Protocol | Port Range | Destination | Description |
|------|----------|-----------|-------------|-------------|
| All traffic | All | All | 0.0.0.0/0 | Allow all outbound |

---

## Security Group: `carenest-haproxy-sg`

### Inbound Rules

| Type | Protocol | Port Range | Source | Description |
|------|----------|-----------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Public HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Public HTTPS traffic (future) |
| Custom TCP | TCP | 8404 | Your IP | HAProxy stats dashboard |
| SSH | TCP | 22 | Your IP | SSH access |

### Outbound Rules

| Type | Protocol | Port Range | Destination | Description |
|------|----------|-----------|-------------|-------------|
| Custom TCP | TCP | 30000-32767 | Worker SG | NodePort access to K8s |
| All traffic | All | All | 0.0.0.0/0 | Allow all outbound |

---

## AWS CLI Commands

### Create Worker Node Security Group (most critical)

```bash
# Get your VPC ID
VPC_ID=$(aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text)

# Create the worker SG (if not exists)
WORKER_SG=$(aws ec2 create-security-group \
  --group-name carenest-k8s-worker-sg \
  --description "CareNest K8s Worker Nodes" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# CRITICAL: Allow ALL traffic between worker nodes
aws ec2 authorize-security-group-ingress \
  --group-id $WORKER_SG \
  --protocol all \
  --source-group $WORKER_SG

# Allow NodePort range from HAProxy
HAPROXY_SG="sg-xxxxxxxxx"  # Replace with your HAProxy SG ID
aws ec2 authorize-security-group-ingress \
  --group-id $WORKER_SG \
  --protocol tcp \
  --port 30000-32767 \
  --source-group $HAPROXY_SG

# Allow kubelet from control plane
CONTROL_SG="sg-xxxxxxxxx"  # Replace with your control plane SG ID
aws ec2 authorize-security-group-ingress \
  --group-id $WORKER_SG \
  --protocol tcp \
  --port 10250 \
  --source-group $CONTROL_SG
```

### Quick Fix: Allow all inter-node traffic (simplest)

If you're unsure which specific rules are missing, this single command
opens all traffic between worker nodes:

```bash
# Get the worker node security group ID
WORKER_SG="sg-xxxxxxxxx"  # Replace with actual SG ID

# Allow ALL traffic from same security group
aws ec2 authorize-security-group-ingress \
  --group-id $WORKER_SG \
  --protocol all \
  --source-group $WORKER_SG
```

---

## Verification

```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids $WORKER_SG \
  --query 'SecurityGroups[*].IpPermissions' --output table

# Test connectivity between worker nodes (from node1)
ssh worker-node-1 "ping -c 3 <worker-node-2-private-ip>"

# Test NodePort from HAProxy EC2
ssh haproxy-ec2 "curl -s http://<worker-node-1-ip>:30080/healthz"
```

---

## Common Mistakes

1. **Only allowing HTTP/HTTPS/SSH** — Kubernetes needs many more ports
2. **Not allowing worker-to-worker traffic** — Pods on different nodes can't talk
3. **Forgetting VXLAN/IP-in-IP ports** — CNI overlay network breaks
4. **NodePort range blocked** — HAProxy can't reach the Gateway
5. **Outbound rules restricted** — Pods can't pull images or reach external APIs
