import type { AdminSession } from "@/lib/admin-auth";
import { getFirebasePublicConfig } from "@/lib/runtime-config";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type AdminBooking = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  whatsapp: string;
  serviceKey: string;
  serviceName: string;
  sessionKey: string;
  sessionName: string;
  durationMinutes: number;
  priceLei: number;
  appointmentDate: string;
  appointmentTime: string;
  confirmedDate: string;
  confirmedTime: string;
  sector: string;
  address: string;
  people: number;
  message: string;
  internalNote: string;
  language: "ro" | "en";
  status: BookingStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type BookingAdminPatch = {
  status?: BookingStatus;
  confirmedDate?: string;
  confirmedTime?: string;
  internalNote?: string;
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

function parseBooking(document: FirestoreDocument): AdminBooking {
  const fields = document.fields ?? {};
  const id = document.name?.split("/").pop() ?? "";
  const createdAt = timestampField(fields, "createdAt");
  const fallbackReference = id ? "SN-" + id.slice(0, 8).toUpperCase() : "SN-UNKNOWN";

  return {
    id,
    reference: stringField(fields, "reference") || fallbackReference,
    name: stringField(fields, "name"),
    phone: stringField(fields, "phone"),
    whatsapp: stringField(fields, "whatsapp"),
    serviceKey: stringField(fields, "serviceKey"),
    serviceName: stringField(fields, "serviceName"),
    sessionKey: stringField(fields, "sessionKey"),
    sessionName: stringField(fields, "sessionName"),
    durationMinutes: intField(fields, "durationMinutes"),
    priceLei: intField(fields, "priceLei"),
    appointmentDate: stringField(fields, "appointmentDate"),
    appointmentTime: stringField(fields, "appointmentTime"),
    confirmedDate: stringField(fields, "confirmedDate"),
    confirmedTime: stringField(fields, "confirmedTime"),
    sector: stringField(fields, "sector"),
    address: stringField(fields, "address"),
    people: intField(fields, "people"),
    message: stringField(fields, "message"),
    internalNote: stringField(fields, "internalNote"),
    language: stringField(fields, "language") === "en" ? "en" : "ro",
    status: (stringField(fields, "status") || "pending") as BookingStatus,
    source: stringField(fields, "source"),
    createdAt,
    updatedAt: timestampField(fields, "updatedAt") || createdAt,
    updatedBy: stringField(fields, "updatedBy"),
  };
}

async function readError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: { message?: string } };
    return payload.error?.message || "Firestore request failed.";
  } catch {
    return "Firestore request failed with status " + response.status + ".";
  }
}

const stringValue = (value: string) => ({ stringValue: value });
const integerValue = (value: number) => ({ integerValue: String(value) });
const timestampValue = (value: string) => ({ timestampValue: value });

function documentName(projectId: string, path: string) {
  return "projects/" + projectId + "/databases/(default)/documents/" + path;
}

export async function listAdminBookings(session: AdminSession): Promise<AdminBooking[]> {
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
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        limit: 200,
      },
    }),
  });

  if (!response.ok) throw new Error(await readError(response));

  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows
    .filter((row) => Boolean(row.document?.name))
    .map((row) => parseBooking(row.document as FirestoreDocument));
}

export async function updateAdminBooking(
  session: AdminSession,
  booking: AdminBooking,
  patch: BookingAdminPatch,
): Promise<void> {
  const { projectId, apiKey } = await getFirebasePublicConfig();
  const now = new Date().toISOString();
  const fields: Record<string, FirestoreValue> = {
    updatedAt: timestampValue(now),
    updatedBy: stringValue(session.email),
  };

  if (patch.status) fields["status"] = stringValue(patch.status);
  if (patch.confirmedDate !== undefined) {
    fields["confirmedDate"] = stringValue(patch.confirmedDate);
  }
  if (patch.confirmedTime !== undefined) {
    fields["confirmedTime"] = stringValue(patch.confirmedTime);
  }
  if (patch.internalNote !== undefined) {
    fields["internalNote"] = stringValue(patch.internalNote.slice(0, 1500));
  }

  const nextStatus = patch.status ?? booking.status;
  const nextDate =
    (patch.confirmedDate ?? booking.confirmedDate) || booking.appointmentDate;
  const nextTime =
    (patch.confirmedTime ?? booking.confirmedTime) || booking.appointmentTime;

  const oldDate = booking.confirmedDate || booking.appointmentDate;
  const oldWasConfirmed = booking.status === "confirmed" && Boolean(oldDate);
  const nextIsConfirmed =
    nextStatus === "confirmed" && Boolean(nextDate) && Boolean(nextTime);

  const writes: Array<Record<string, unknown>> = [
    {
      update: {
        name: documentName(projectId, "bookings/" + booking.id),
        fields,
      },
      updateMask: { fieldPaths: Object.keys(fields) },
      currentDocument: { exists: true },
    },
  ];

  if (oldWasConfirmed && (!nextIsConfirmed || oldDate !== nextDate)) {
    writes.push({
      delete: documentName(
        projectId,
        "availability/" + oldDate + "/slots/" + booking.id,
      ),
    });
  }

  if (nextIsConfirmed) {
    writes.push({
      update: {
        name: documentName(
          projectId,
          "availability/" + nextDate + "/slots/" + booking.id,
        ),
        fields: {
          startTime: stringValue(nextTime),
          durationMinutes: integerValue(booking.durationMinutes),
          status: stringValue("booked"),
          updatedAt: timestampValue(now),
        },
      },
      updateMask: {
        fieldPaths: ["startTime", "durationMinutes", "status", "updatedAt"],
      },
    });
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

  if (!response.ok) throw new Error(await readError(response));
}

export async function seedConfirmedAvailability(
  session: AdminSession,
  bookings: AdminBooking[],
): Promise<void> {
  const confirmed = bookings.filter(
    (booking) =>
      booking.status === "confirmed" &&
      Boolean(booking.confirmedDate || booking.appointmentDate) &&
      Boolean(booking.confirmedTime || booking.appointmentTime),
  );
  if (confirmed.length === 0) return;

  const { projectId, apiKey } = await getFirebasePublicConfig();
  const now = new Date().toISOString();
  const writes = confirmed.map((booking) => {
    const date = booking.confirmedDate || booking.appointmentDate;
    const time = booking.confirmedTime || booking.appointmentTime;
    return {
      update: {
        name: documentName(
          projectId,
          "availability/" + date + "/slots/" + booking.id,
        ),
        fields: {
          startTime: stringValue(time),
          durationMinutes: integerValue(booking.durationMinutes),
          status: stringValue("booked"),
          updatedAt: timestampValue(now),
        },
      },
      updateMask: {
        fieldPaths: ["startTime", "durationMinutes", "status", "updatedAt"],
      },
    };
  });

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

  if (!response.ok) throw new Error(await readError(response));
}
