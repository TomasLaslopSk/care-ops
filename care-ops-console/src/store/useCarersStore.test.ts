import { describe, it, expect, beforeEach } from "vitest";
import useCarersStore from "./useCarersStore";

describe("useCarersStore", () => {
  beforeEach(() => {
    useCarersStore.getState().clear();
  });

  it("starts with empty filters", () => {
    const { region, status } = useCarersStore.getState();
    expect(region).toBe("");
    expect(status).toBe("");
  });

  it("setRegion updates the region", () => {
    useCarersStore.getState().setRegion("North");
    expect(useCarersStore.getState().region).toBe("North");
  });

  it("setStatus updates the status", () => {
    useCarersStore.getState().setStatus("active");
    expect(useCarersStore.getState().status).toBe("active");
  });

  it("clear resets both filters", () => {
    useCarersStore.getState().setRegion("South");
    useCarersStore.getState().setStatus("onboarding");
    useCarersStore.getState().clear();
    const { region, status } = useCarersStore.getState();
    expect(region).toBe("");
    expect(status).toBe("");
  });
});
