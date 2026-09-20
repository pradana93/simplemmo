import { test, expect } from "@playwright/test";

test("home renders dashboard nav without horizontal scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  for (const label of ["Home", "Skills", "PvP", "Market", "Guild"]) {
    await expect(page.getByRole("navigation", { name: "Main" }).getByText(label)).toBeVisible();
  }
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientW = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollW).toBeLessThanOrEqual(clientW + 1);
});
