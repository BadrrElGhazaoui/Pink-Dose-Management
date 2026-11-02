const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

initializeApp();

const db = getFirestore();
const messaging = getMessaging();
const MAX_MULTICAST_SIZE = 500;
const INVALID_TOKEN_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

exports.notifyOnAccountingActivity = onDocumentCreated(
  {
    document: "accounting/{entryId}",
    region: "us-central1",
    retry: true,
  },
  async (event) => {
    const activity = event.data && event.data.data();
    if (!activity) {
      logger.error("Accounting activity event has no document data.", {
        entryId: event.params.entryId,
      });
      return;
    }

    const tokenSnapshot = await db.collection("pushTokens").get();
    const registrations = tokenSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return typeof data.token === "string" && data.token.length > 0;
    });

    if (!registrations.length) {
      logger.info("No registered devices for push delivery.", {
        entryId: event.params.entryId,
      });
      return;
    }

    const actor = typeof activity.actor === "string" ? activity.actor : "";
    const description =
      typeof activity.description === "string" && activity.description.trim()
        ? activity.description.trim()
        : "A record was updated";
    const body = `${actor ? `${actor}: ` : ""}${description}`.slice(0, 180);
    const staleTokenRefs = [];
    let successCount = 0;
    let failureCount = 0;
    let retryableFailureCount = 0;

    for (let offset = 0; offset < registrations.length; offset += MAX_MULTICAST_SIZE) {
      const batch = registrations.slice(offset, offset + MAX_MULTICAST_SIZE);
      const response = await messaging.sendEachForMulticast({
        tokens: batch.map((doc) => doc.data().token),
        data: {
          title: `Pink Dose · ${activity.category || "Activity"}`,
          body,
          entryId: event.params.entryId,
        },
        webpush: {
          headers: { Urgency: "high" },
        },
      });

      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((result, index) => {
        if (result.success) return;
        const code = result.error && result.error.code;
        if (INVALID_TOKEN_CODES.has(code)) {
          staleTokenRefs.push(batch[index].ref);
          return;
        }
        retryableFailureCount += 1;
        logger.error("Push notification delivery failed.", {
          entryId: event.params.entryId,
          tokenDocument: batch[index].id,
          errorCode: code || "unknown",
          message: result.error && result.error.message,
        });
      });
    }

    await Promise.all(staleTokenRefs.map((ref) => ref.delete()));
    logger.info("Push notification delivery completed.", {
      entryId: event.params.entryId,
      recipientCount: registrations.length,
      successCount,
      failureCount,
      staleTokensRemoved: staleTokenRefs.length,
    });
    if (retryableFailureCount > 0) {
      throw new Error(`Could not deliver ${retryableFailureCount} push notification(s).`);
    }
  },
);
