import { getCurrentCustomerSession } from "@/lib/customer-auth";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

export type CustomerBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type CustomerBooking = {
  id: string;
  reference: string;
  serviceName: string;
  sessionName: string;
  durationMinutes: number;
  priceLei: number;
  appointmentDate: string;
  appointmentTime: string;
  confirmedDate: string;
  confirmedTime: string;
  sector: string;
  address: string;
  status: CustomerBookingStatus;
  createdAt: string;
};

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
  timestampValue?: string;
};

type FirestoreDocument = {
  name?: string;
  fields?: Record<string, FirestoreValue>;
};

function stringField(fields: Record<string, FirestoreValue>, key: string) {
  return fields[key]?.stringValue ?? "";
}

function intField(fields: Record<string, FirestoreValue>, key: string) {
  return Number(fields[key]?.integerValue ?? 0);
}

function timestampField(fields: Record<string, FirestoreValue>, key: string) {
  return fields[key]?.timestampValue ?? "";
}

function parseBooking(document: FirestoreDocument): CustomerBooking {
  const fields = document.fields ?? {};
  const id = document.name?.split("/").pop() ?? "";
  return {
    id,
    reference: stringField(fields, "reference") || "SN-" + id.slice(0, 8).toUpperCase(),
    serviceName: stringField(fields, "serviceName"),
    sessionName: stringField(fields, "sessionName"),
    durationMinutes: intField(fields, "durationMinutes"),
    priceLei: intField(fields, "priceLei"),
    appointmentDate: stringField(fields, "appointmentDate"),
    appointmentTime: stringField(fields, "appointmentTime"),
    confirmedDate: stringField(fields, "confirmedDate"),
    confirmedTime: stringField(fields, "confirmedTime"),
    sector: stringField(fields, "sector"),
    address: stringField(fields, "address"),
    status: (stringField(fields, "status") || "pending") as CustomerBookingStatus,
    createdAt: timestampField(fields, "createdAt"),
  };
}

async function responseError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: { message?: string } };
    return payload.error?.message || "Booking request failed.";
  } catch {
    return "Booking request failed with status " + response.status + ".";
  }
}

function documentName(projectId: string, path: string) {
  return "projects/" + projectId + "/databases/(default)/documents/" + path;
}

export async function listCustomerBookings(): Promise<CustomerBooking[]> {
  const session = await getCurrentCustomerSession();
  if (!session) throw new Error("Sign in to view your bookings.");

  const { projectId, apiKey } = await getFirebasePublicConfig();
  const endpoint =
    "https://firestore.googleapis.com/v1/projects/" +
    encodeURIComponent(projectId) +
    "/databases/(default)/documents:runQuery?key=" +
    encodeURIComponent(apiKey);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + session.idToken,
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "bookings" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "customerUid" },
            op: "EQUAL",
            value: { stringValue: session.uid },
          },
        },
        limit: 100,
      },
    }),
  });

  if (!response.ok) throw new Error(await responseError(response));

  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows
    .filter((row) => Boolean(row.document?.name))
    .map((row) => parseBooking(row.document as FirestoreDocument))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function cancelCustomerBooking(booking: CustomerBooking): Promise<void> {
  const session = await getCurrentCustomerSession();
  if (!session) throw new Error("Sign in to manage this booking.");

  const { projectId, apiKey } = await getFirebasePublicConfig();
  const now = new Date().toISOString();

  const writes: Array<Record<string, unknown>> = [
    {
      update: {
        name: documentName(projectId, "bookings/" + booking.id),
        fields: {
          status: { stringValue: "cancelled" },
          updatedAt: { timestampValue: now },
          updatedBy: { stringValue: session.email },
        },
      },
      updateMask: { fieldPaths: ["status", "updatedAt", "updatedBy"] },
      currentDocument: { exists: true },
    },
  ];

  if (booking.status === "confirmed") {
    const date = booking.confirmedDate || booking.appointmentDate;
    if (date) {
      writes.push({
        delete: documentName(
          projectId,
          "availability/" + date + "/slots/" + booking.id,
        ),
      });
    }
  }

  const endpoint =
    "https://firestore.googleapis.com/v1/projects/" +
    encodeURIComponent(projectId) +
    "/databases/(default)/documents:commit?key=" +
    encodeURIComponent(apiKey);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer " + session.idToken,
    },
    body: JSON.stringify({ writes }),
  });

  if (!response.ok) throw new Error(await responseError(response));
}
