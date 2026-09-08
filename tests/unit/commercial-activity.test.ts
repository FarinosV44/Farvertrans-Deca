import { describe, expect, it } from "vitest";
import { summariseActivity } from "@/lib/commercial/activity";

const NOW = new Date("2026-09-08T12:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

describe("summariseActivity", () => {
  it("counts rolling windows independently", () => {
    const s = summariseActivity(
      [daysAgo(1), daysAgo(3), daysAgo(20), daysAgo(45), daysAgo(80)],
      NOW,
    );
    expect(s.total).toBe(5);
    expect(s.d7).toBe(2);
    expect(s.d30).toBe(3);
    expect(s.d60).toBe(4);
    expect(s.d90).toBe(5);
    expect(s.prev30).toBe(1); // the 45-day-old one
  });

  it("first/last/daysSinceLast reflect the extremes", () => {
    const s = summariseActivity([daysAgo(2), daysAgo(50), daysAgo(10)], NOW);
    expect(s.firstAt).toEqual(daysAgo(50));
    expect(s.lastAt).toEqual(daysAgo(2));
    expect(s.daysSinceLast).toBe(2);
  });

  it("trend: up when the last 30d beat the prior 30d", () => {
    const s = summariseActivity([daysAgo(1), daysAgo(5), daysAgo(10), daysAgo(40)], NOW);
    expect(s.trend).toBe("up");
  });

  it("trend: down when it fell", () => {
    const s = summariseActivity([daysAgo(5), daysAgo(35), daysAgo(40), daysAgo(50)], NOW);
    expect(s.trend).toBe("down");
  });

  it("trend: new when there is recent activity but nothing in the prior window", () => {
    const s = summariseActivity([daysAgo(2), daysAgo(9)], NOW);
    expect(s.trend).toBe("new");
  });

  it("trend: none for an empty history", () => {
    const s = summariseActivity([], NOW);
    expect(s.trend).toBe("none");
    expect(s.total).toBe(0);
    expect(s.firstAt).toBeNull();
    expect(s.busiestWeekday).toBeNull();
    expect(s.daysSinceLast).toBeNull();
  });

  it("weekday histogram and busiest weekday", () => {
    // 2026-09-07 is a Monday (UTC getUTCDay() === 1)
    const monday = new Date("2026-09-07T09:00:00Z");
    const alsoMonday = new Date("2026-08-31T09:00:00Z");
    const tuesday = new Date("2026-09-01T09:00:00Z");
    const s = summariseActivity([monday, alsoMonday, tuesday], NOW);
    expect(s.weekday[1]).toBe(2);
    expect(s.weekday[2]).toBe(1);
    expect(s.busiestWeekday).toBe(1);
  });

  it("ignores future-dated events and invalid dates", () => {
    const future = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000);
    const s = summariseActivity([daysAgo(1), future, new Date("nonsense")], NOW);
    expect(s.total).toBe(1);
  });
});
