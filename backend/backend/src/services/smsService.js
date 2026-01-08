const axios = require("axios");
const Setting = require("../models/Setting");

class SmsService {
  constructor() {
    this.apiKey = process.env.FAST2SMS_API_KEY;
    this.senderId = process.env.FAST2SMS_SENDER_ID || "TXTIND";
    this.language = "english";
    this.route = process.env.FAST2SMS_ROUTE || "p";

    // Debug log to check env values
    console.log("FAST2SMS INIT:", {
      apiKey: this.apiKey?.slice(0, 5) + "...",
      senderId: this.senderId,
      route: this.route
    });
  }

  async getSettings() {
    const settings = await Setting.find({
      key: { $in: ["fast2sms_api_key", "fast2sms_enabled", "fast2sms_sender_id", "fast2sms_route", "fast2sms_dlt_message_id"] }
    });

    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    return {
      apiKey: map.fast2sms_api_key || this.apiKey,
      senderId: map.fast2sms_sender_id || this.senderId,
      enabled: map.fast2sms_enabled !== "false",
      route: map.fast2sms_route || this.route,
      dltMessageId: map.fast2sms_dlt_message_id || null,
    };
  }

  async sendOTP(phone, otp) {
    try {
      const { apiKey, enabled, senderId, route, dltMessageId } = await this.getSettings();

      console.log("FAST2SMS USING SETTINGS:", {
        apiKey: apiKey?.slice(0, 5) + "...",
        senderId,
        route
      });

      if (!enabled || !apiKey) {
        return { success: true };
      }

      const normalized = (phone || "").replace(/\D/g, "").slice(-10);

      let resp;
      if (route === "p") {
        const form = new URLSearchParams({
          message: `Login code: ${otp}. Valid for 5 minutes. Do not share.`,
          language: this.language,
          route,
          sender_id: senderId,
          flash: "0",
          numbers: normalized,
        });
        resp = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          form.toString(),
          {
            headers: {
              authorization: apiKey,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
      } else if (route === "otp") {
        const payload = {
          route: "otp",
          variables_values: String(otp),
          numbers: normalized,
        };
        resp = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          payload,
          {
            headers: {
              authorization: apiKey,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (route === "dlt") {
        if (!dltMessageId || !senderId) {
          return { success: false, error: "DLT configuration missing", details: "fast2sms_dlt_message_id or sender_id" };
        }
        const payload = {
          route: "dlt",
          sender_id: senderId,
          message: dltMessageId,
          variables_values: String(otp),
          numbers: normalized,
        };
        resp = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          payload,
          {
            headers: {
              authorization: apiKey,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const payload = {
          route,
          sender_id: senderId,
          message: `Login code: ${otp}. Valid for 5 minutes. Do not share.`,
          language: this.language,
          numbers: normalized,
        };
        resp = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          payload,
          {
            headers: {
              authorization: apiKey,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const ok = resp?.data?.return === true;

      return {
        success: ok,
        details: JSON.stringify(resp?.data || {}),
        message: resp?.data?.message,
        request_id: resp?.data?.request_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: JSON.stringify(error.response?.data || {}),
      };
    }
  }
}

module.exports = new SmsService();
