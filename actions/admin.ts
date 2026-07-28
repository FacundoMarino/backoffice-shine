"use server";

import { revalidatePath } from "next/cache";

import { apiFetch, getAccessToken } from "@/lib/api";

async function authedFetch<T>(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  if (!token) return { data: null, error: { message: "No session", status: 401 } };
  return apiFetch<T>(path, { ...init, authToken: token });
}

export async function fetchDashboard() {
  return authedFetch<{
    kpis: {
      pendingVerifications: number;
      totalUsers: number;
      clientsCount: number;
      workersCount: number;
      mrr: number;
      approvalRate: number;
      activeSubscriptions: number;
      inactiveSubscriptions: number;
    };
    weeklyBars: { label: string; value: number }[];
  }>("/admin/dashboard");
}

export async function fetchVerifications(params?: {
  q?: string;
  status?: string;
  locality?: string;
  accountType?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  if (params?.locality) sp.set("locality", params.locality);
  if (params?.accountType) sp.set("accountType", params.accountType);
  const qs = sp.toString();
  return authedFetch<
    {
      id: string;
      nombre: string;
      tipo: string;
      ciudad: string;
      fechaSolicitud: string;
      estado: string;
    }[]
  >(`/admin/verifications${qs ? `?${qs}` : ""}`);
}

export async function fetchVerification(id: string) {
  return authedFetch<{
    id: string;
    nombre: string;
    tipo: string;
    ciudad: string;
    zona: string;
    fechaSolicitud: string;
    estado: string;
    telefono: string | null;
    bio: string | null;
    anios: string | null;
    tarifa: number | null;
    photoUrl: string | null;
    availability: unknown;
    servicios: string[];
    documentos: {
      id: string;
      docType: string;
      fileUrl: string;
      status: string;
    }[];
    rejectionReason: string | null;
  }>(`/admin/verifications/${id}`);
}

export async function approveVerification(id: string) {
  const result = await authedFetch(`/admin/verifications/${id}/approve`, {
    method: "POST",
  });
  revalidatePath("/verificacion");
  revalidatePath(`/verificacion/${id}`);
  revalidatePath("/dashboard");
  return result;
}

export async function rejectVerification(
  id: string,
  reason: string,
  comment?: string,
) {
  const result = await authedFetch(`/admin/verifications/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason, comment }),
  });
  revalidatePath("/verificacion");
  revalidatePath(`/verificacion/${id}`);
  revalidatePath("/dashboard");
  return result;
}

export async function fetchWorkers() {
  return authedFetch<
    {
      id: string;
      userId: string;
      nombre: string;
      tipo: string;
      ciudad: string;
      verificationStatus: string;
      subscriptionStatus: string;
      accountStatus: string;
      rating: number;
    }[]
  >("/admin/users/workers");
}

export async function fetchClients() {
  return authedFetch<
    {
      id: string;
      userId: string;
      nombre: string;
      email: string;
      ciudad: string;
      fechaAlta: string;
      cantidadResenas: number;
      accountStatus: string;
    }[]
  >("/admin/users/clients");
}

export async function banUser(userId: string, reason: string, comment?: string) {
  const result = await authedFetch(`/admin/users/${userId}/ban`, {
    method: "POST",
    body: JSON.stringify({ reason, comment }),
  });
  revalidatePath("/usuarios");
  return result;
}

export async function unbanUser(userId: string) {
  const result = await authedFetch(`/admin/users/${userId}/unban`, {
    method: "POST",
  });
  revalidatePath("/usuarios");
  return result;
}

export async function fetchServices() {
  return authedFetch<{ id: string; name: string; isActive: boolean }[]>(
    "/admin/services",
  );
}

export async function createService(name: string) {
  const result = await authedFetch("/admin/services", {
    method: "POST",
    body: JSON.stringify({ name, isActive: true }),
  });
  revalidatePath("/servicios");
  return result;
}

export async function toggleService(id: string) {
  const result = await authedFetch(`/admin/services/${id}/toggle`, {
    method: "PATCH",
  });
  revalidatePath("/servicios");
  return result;
}

export async function deleteService(id: string) {
  const result = await authedFetch(`/admin/services/${id}`, { method: "DELETE" });
  revalidatePath("/servicios");
  return result;
}

export async function fetchLocations() {
  return authedFetch<
    {
      id: string;
      name: string;
      isActive: boolean;
      cities: {
        id: string;
        name: string;
        isActive: boolean;
        districts: { id: string; name: string; isActive: boolean }[];
      }[];
    }[]
  >("/admin/locations");
}

export async function toggleLocation(
  level: "country" | "city" | "district",
  id: string,
  isActive: boolean,
) {
  const result = await authedFetch("/admin/locations", {
    method: "PATCH",
    body: JSON.stringify({ level, id, isActive }),
  });
  revalidatePath("/ubicaciones");
  return result;
}

export async function createCountry(name: string) {
  const result = await authedFetch("/admin/locations/countries", {
    method: "POST",
    body: JSON.stringify({ name, isActive: true }),
  });
  revalidatePath("/ubicaciones");
  return result;
}

export async function createCity(countryId: string, name: string) {
  const result = await authedFetch("/admin/locations/cities", {
    method: "POST",
    body: JSON.stringify({ countryId, name, isActive: true }),
  });
  revalidatePath("/ubicaciones");
  return result;
}

export async function createDistrict(cityId: string, name: string) {
  const result = await authedFetch("/admin/locations/districts", {
    method: "POST",
    body: JSON.stringify({ cityId, name, isActive: true }),
  });
  revalidatePath("/ubicaciones");
  return result;
}

export async function fetchPlans() {
  return authedFetch<
    {
      id: string;
      name: string;
      durationMonths: number;
      price: number;
      description: string | null;
      isActive: boolean;
    }[]
  >("/admin/plans");
}

export async function savePlan(input: {
  id?: string;
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
  isActive: boolean;
}) {
  const result = input.id
    ? await authedFetch(`/admin/plans/${input.id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      })
    : await authedFetch("/admin/plans", {
        method: "POST",
        body: JSON.stringify(input),
      });
  revalidatePath("/planes");
  return result;
}

export async function deletePlan(id: string) {
  const result = await authedFetch(`/admin/plans/${id}`, { method: "DELETE" });
  revalidatePath("/planes");
  return result;
}

export async function fetchReviews() {
  return authedFetch<
    {
      id: string;
      autor: string;
      trabajador: string;
      calificacion: number;
      comentario: string | null;
      fecha: string;
      estado: string;
    }[]
  >("/admin/reviews");
}

export async function hideReview(id: string, reason: string, comment?: string) {
  const result = await authedFetch(`/admin/reviews/${id}/hide`, {
    method: "POST",
    body: JSON.stringify({ reason, comment }),
  });
  revalidatePath("/resenas");
  return result;
}

export async function deleteReview(id: string, reason: string, comment?: string) {
  const result = await authedFetch(`/admin/reviews/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ reason, comment }),
  });
  revalidatePath("/resenas");
  return result;
}
