import { EventTimestampSchema, EventDaysArraySchema } from "./event";

describe("event schema", () => {
  const ISO_TIMESTAMP = "2014-02-11T11:30:30";

  it("parses timestamp as string", () => {
    expect(EventTimestampSchema.parse(ISO_TIMESTAMP)).toEqual(
      new Date(ISO_TIMESTAMP)
    );
  });

  it("parses timestamp as date", () => {
    expect(EventTimestampSchema.parse(new Date(ISO_TIMESTAMP))).toEqual(
      new Date(ISO_TIMESTAMP)
    );
  });

  it("fails to parse timestamp as integer", () => {
    expect(EventTimestampSchema.safeParse(5).success).toBe(false);
  });

  it("parses event days as string", () => {
    expect(EventDaysArraySchema.parse(["2014-02-11"])).toContainEqual(
      "2014-02-11"
    );
  });

  it("fails to parse event days/dates as string", () => {
    expect(
      EventDaysArraySchema.safeParse([new Date(ISO_TIMESTAMP)]).success
    ).toBe(false);
  });

  it("fails to parse event days/dates as string", () => {
    expect(EventDaysArraySchema.safeParse([ISO_TIMESTAMP]).success).toBe(false);
  });
});
