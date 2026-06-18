process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from "express";
import * as k8s from "@kubernetes/client-node";
import { randomUUID } from "node:crypto";

const app = express();
let count = 1;
async function intailizeKubernetesClientAndPods() {

  const pod = {
    apiVersion: "v1",
    kind: "Pod",
    metadata: { name: `lovable-worker-${randomUUID()}` },
    spec: {
      containers: [{ name: "nginx", image: "nginx:latest" }],
    },
  };

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);


  try {
    await k8sApi.createNamespacedPod({ namespace: "default", body: pod });
    count++;
    const pods = await k8sApi.listNamespacedPod({
      namespace: "default",
    });

    console.log("Existing pods:", pods.items.map((p) => p.metadata?.name));
    console.log("Pod 'lovable' created successfully.");
  } catch (err: any) {
    const isAlreadyExists = err.code === 409 || (err.body && JSON.parse(err.body).reason === "AlreadyExists");
    if (isAlreadyExists) {
      console.log("Pod 'lovable' already exists.");
    } else {
      console.error("Failed to create pod:", err.body || err);
    }
  }
  return kc;
}

const res = await intailizeKubernetesClientAndPods();
// console.log("[RESS]", res);

// app.get("project/:projectId", (req, res) => {
//   const { query } = req.body;

// });
// app.post("project", (req, res) => {});
// app.post("chat", (req, res) => {});

// app.listen(3000);
