export const createCalendarEvent = async ({ accessToken, summary, description, startDateTime }) => {
  const start = new Date(startDateTime);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create calendar event");
  }

  return res.json();
};