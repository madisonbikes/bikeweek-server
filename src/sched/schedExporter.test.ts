import { sortEventTypes } from "./schedExporter";

describe("event type sort function", () => {
  it("correctly sorts food before ride", () => {
    expect(sortEventTypes(["ride", "food"])).toEqual(["food", "ride"]);
  });

  it("correctly sorts food before anything else", () => {
    expect(sortEventTypes(["blarg", "food", "alice"])).toEqual([
      "food",
      "alice",
      "blarg",
    ]);
  });

  it("correctly sorts ride before most anything else", () => {
    expect(sortEventTypes(["blarg", "ride", "alice"])).toEqual([
      "ride",
      "alice",
      "blarg",
    ]);
  });

  it("correctly sorts food before ride when mixed", () => {
    expect(sortEventTypes(["blarg", "ride", "food"])).toEqual([
      "food",
      "ride",
      "blarg",
    ]);
  });
});
