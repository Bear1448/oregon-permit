import { TOPICS, type TopicId } from "./types.ts";

export type Route =
  | { name: "home" }
  | { name: "practice" }
  | { name: "study" }
  | { name: "study-topic"; topic: TopicId }
  | { name: "review" }
  | { name: "permit" };

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, "").replace(/^\/+|\/+$/g, "");
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home" };
  if (parts[0] === "practice") return { name: "practice" };
  if (parts[0] === "study" && parts[1]) {
    if ((TOPICS as readonly string[]).includes(parts[1])) {
      return { name: "study-topic", topic: parts[1] as TopicId };
    }
    return { name: "home" };
  }
  if (parts[0] === "study") return { name: "study" };
  if (parts[0] === "review") return { name: "review" };
  if (parts[0] === "permit") return { name: "permit" };
  return { name: "home" };
}

export function hashFor(route: Route): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "practice":
      return "#/practice";
    case "study":
      return "#/study";
    case "study-topic":
      return `#/study/${route.topic}`;
    case "review":
      return "#/review";
    case "permit":
      return "#/permit";
  }
}

export function screenTitle(route: Route): string {
  switch (route.name) {
    case "home":
      return "Oregon Permit Study";
    case "practice":
      return "Practice Test";
    case "study":
      return "Study by Topic";
    case "study-topic":
      return "Study by Topic";
    case "review":
      return "Review Mistakes";
    case "permit":
      return "Getting My Permit";
  }
}
