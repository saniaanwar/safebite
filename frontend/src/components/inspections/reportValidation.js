const allowedFields = new Set(["visitDate", "description"]);

const bostonDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getTodayInBoston(now = new Date()) {
  const parts = Object.fromEntries(
    bostonDateFormatter
      .formatToParts(now)
      .map(({ type, value }) => [type, value]),
  );

  return `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}`;
}

function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  // Reject dates that JavaScript normalizes into another day.
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function validateReportInput(body, now = new Date()) {
  const errors = {};

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      errors: { form: "Send a JSON object with visitDate and description." },
      value: null,
    };
  }

  if (Object.keys(body).some((field) => !allowedFields.has(field))) {
    errors.form = "Only visitDate and description may be submitted.";
  }

  const { visitDate } = body;
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!isCalendarDate(visitDate)) {
    errors.visitDate = "Choose a valid visit date.";
  } else if (visitDate > getTodayInBoston(now)) {
    errors.visitDate = "Visit date cannot be later than today in Boston.";
  }

  if (
    typeof body.description !== "string" ||
    description.length < 1 ||
    description.length > 1000
  ) {
    errors.description = "Enter a description between 1 and 1,000 characters.";
  }

  return {
    errors,
    value: Object.keys(errors).length === 0 ? { visitDate, description } : null,
  };
}
