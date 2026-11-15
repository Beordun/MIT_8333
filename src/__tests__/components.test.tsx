import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StatusBadge, PriorityBadge } from "@/components/Badges";

describe("Frontend Badge Components", () => {
  it("renders all request status labels accurately", () => {
    expect(renderToStaticMarkup(<StatusBadge status="PENDING" />)).toContain("Pending");
    expect(renderToStaticMarkup(<StatusBadge status="ASSIGNED" />)).toContain("Assigned");
    expect(renderToStaticMarkup(<StatusBadge status="IN_PROGRESS" />)).toContain("In Progress");
    expect(renderToStaticMarkup(<StatusBadge status="RESOLVED" />)).toContain("Resolved");
    expect(renderToStaticMarkup(<StatusBadge status="CLOSED" />)).toContain("Closed");
  });

  it("renders all priority labels accurately", () => {
    expect(renderToStaticMarkup(<PriorityBadge priority="LOW" />)).toContain("Low");
    expect(renderToStaticMarkup(<PriorityBadge priority="MEDIUM" />)).toContain("Medium");
    expect(renderToStaticMarkup(<PriorityBadge priority="HIGH" />)).toContain("High");
    expect(renderToStaticMarkup(<PriorityBadge priority="CRITICAL" />)).toContain("Critical");
  });
});

