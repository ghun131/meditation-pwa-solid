import dayjs from "dayjs";

export function isEarlyMorning() {
  const now = dayjs().hour();
  return now >= 3 && now <= 5;
}

export function isSafari() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("safari") &&
    !userAgent.includes("chrome") &&
    !userAgent.includes("firefox")
  );
}
