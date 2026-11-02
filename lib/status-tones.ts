function toneForNamirial(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "FAILED" || status === "CANCELLED" || status === "EXPIRED") {
    return "danger" as const;
  }
  if (status === "RUNNING" || status === "CREATED" || status === "DRAFT") {
    return "warning" as const;
  }
  return "neutral" as const;
}

function toneForVerification(status: string) {
  if (status === "PENDING" || status === "En revisión") return "warning" as const;
  if (status === "VERIFIED" || status === "Aprobado") return "success" as const;
  if (status === "REJECTED" || status === "Rechazado") return "danger" as const;
  return "neutral" as const;
}

function toneForAccount(status: string) {
  if (status === "ACTIVE" || status === "Activo") return "success" as const;
  if (status === "BANNED" || status === "Baneado") return "danger" as const;
  if (status === "SUSPENDED" || status === "Suspendido") return "warning" as const;
  return "neutral" as const;
}

export { toneForVerification, toneForAccount, toneForNamirial };
