import { expect, test } from "@playwright/test";
import { devLogin } from "./utils";

test.describe("messages", () => {
  test("stores, recovers, and acknowledges an offline direct message", async ({ browser }) => {
    const recipientContext = await browser.newContext();
    const senderContext = await browser.newContext();
    const recipient = await recipientContext.newPage();
    const sender = await senderContext.newPage();
    const message = `Queued message ${Date.now()}`;

    try {
      await devLogin(recipient, "admin");
      await devLogin(sender, "active");

      await sender.goto("/messages");
      await sender.getByRole("button", { name: "New message" }).click();
      await sender.locator('select[name="recipientId"]').selectOption({ label: "Local Admin" });
      await sender.getByRole("button", { name: "Create", exact: true }).click();

      await expect(sender.getByRole("heading", { name: "Local Admin" })).toBeVisible();
      await sender.getByRole("textbox", { name: "Message", exact: true }).fill(message);
      const sendResponsePromise = sender.waitForResponse(
        (response) =>
          response.request().method() === "POST" && response.url().endsWith("/api/chat/messages"),
      );
      await sender.getByRole("button", { name: "Send", exact: true }).click();
      const sendResponse = await sendResponsePromise;
      expect(sendResponse.ok()).toBe(true);
      const { messageId } = (await sendResponse.json()) as { messageId: string };
      const sentMessage = sender.locator(".chat-message", { hasText: message });
      await expect(sentMessage).toContainText(message);
      await expect(sentMessage).not.toContainText("Sending...");
      await expect(sentMessage).not.toContainText("Not sent");

      await recipient.bringToFront();
      await recipient.evaluate(() => window.dispatchEvent(new Event("focus")));
      const messageIndicator = recipient.getByRole("link", {
        name: /Messages, \d+ unread/,
      });
      await expect(messageIndicator).toBeVisible();
      await messageIndicator.click();
      await expect(recipient.locator(".chat-message", { hasText: message })).toContainText(
        message,
        {
          timeout: 10_000,
        },
      );

      await recipient.reload();
      await expect(recipient.locator(".chat-message", { hasText: message })).toContainText(message);

      await expect
        .poll(async () => {
          const response = await recipient.request.get("/api/chat/inbox");
          const inbox = (await response.json()) as { messages: Array<{ id: string }> };
          return inbox.messages.some((entry) => entry.id === messageId);
        })
        .toBe(false);
    } finally {
      await senderContext.close();
      await recipientContext.close();
    }
  });
});
