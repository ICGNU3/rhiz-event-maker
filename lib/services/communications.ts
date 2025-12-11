
import { NotificationChannel, NotificationContext, EventAppConfig } from "@/lib/types";

// Mock AI Service until we wire up the real BAML client
const MOCK_AI_ENABLED = true;

interface ChannelRecommendation {
  channel: NotificationChannel;
  reason: string;
  delayed?: boolean;
  sendTime?: Date;
}

interface RewrittenMessage {
  subject?: string;
  body: string;
  originalBody: string;
  tone: string;
}

/**
 * Smart Notification Service
 * Decides the HOW and WHEN of messaging, not just the WHAT.
 */
export const SmartNotificationService = {

  /**
   * Determines the best channel based on event tone and urgency.
   * e.g. A "Rave" can use SMS. A "Board Meeting" should use Email.
   */
  async determineBestChannel(
    config: EventAppConfig, 
    context: NotificationContext
  ): Promise<ChannelRecommendation> {
    const toneKeywords = config.branding.toneKeywords || [];
    const isProfessional = toneKeywords.some(k => ["professional", "corporate", "formal"].includes(k.toLowerCase()));
    
    // Default to email
    let recommendation: ChannelRecommendation = {
        channel: "email",
        reason: "Default channel for standard communications"
    };

    if (context.priority === "high") {
        if (!isProfessional || context.messageType === "reminder") {
            // High priority reminders for non-corporate events can go via SMS
            recommendation = {
                channel: "sms",
                reason: "High priority update requires immediate attention"
            };
        }
    }

    // Optimization: Batch low priority updates?
    if (context.priority === "low") {
        recommendation = {
            channel: "in_app",
            reason: "Low priority, avoid notification fatigue",
            delayed: true
        };
    }

    // TODO: Connect to User Preferences (not yet in data model)
    // if (user.preferences.noSms) return "email";

    return recommendation;
  },

  /**
   * Uses AI to rewrite the message to match the event's "Vibe"
   */
  async optimizeMessageContent(
    content: string, 
    config: EventAppConfig
  ): Promise<RewrittenMessage> {
    if (!MOCK_AI_ENABLED) {
        return { body: content, originalBody: content, tone: "original" };
    }

    const keywords = config.branding.toneKeywords.join(", ");
    
    // In a real implementation, this would call BAML
    // return baml.RewriteMessage({ content, toneKeywords: keywords });
    
    console.log(`[AI Stub] Rewriting message with tone: ${keywords}`);
    
    return {
        body: content, // Placeholder: In real app, this would be transformed
        originalBody: content,
        tone: keywords
    };
  },

  /**
   * Main entry point to send a notification
   */
  async sendNotification(
    config: EventAppConfig,
    context: NotificationContext,
    content: string
  ) {
    const recommendation = await this.determineBestChannel(config, context);
    const optimizedContent = await this.optimizeMessageContent(content, config);

    console.log(`[Notification] Sending via ${recommendation.channel.toUpperCase()}`);
    console.log(`[Notification] Reason: ${recommendation.reason}`);
    console.log(`[Notification] Content: ${optimizedContent.body}`);

    return {
        success: true,
        channel: recommendation.channel,
        deliveredAt: new Date()
    };
  }
};
