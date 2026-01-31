/**
 * Email Service for sending notifications
 * 
 * Uses official Mailtrap SDK for sending emails.
 * Set MAILTRAP_TOKEN in .env to enable.
 */

import { MailtrapClient } from "mailtrap"

interface EmailRecipient {
    email: string
    name?: string
}

interface SendEmailOptions {
    to: EmailRecipient[]
    subject: string
    html: string
    from?: { email: string; name: string }
}

const skipEmails = process.env.SKIP_EMAILS === "true"
const mailtrapToken = process.env.MAILTRAP_TOKEN || ""
const senderEmail = process.env.SENDER_EMAIL || "hello@demomailtrap.co"
const senderName = process.env.SENDER_NAME || "Hackathon Platform"

// Initialize Mailtrap client (sandbox mode for development)
const client = new MailtrapClient({
    token: mailtrapToken,
    testInboxId: 4241427, // Test inbox ID from SIH
    sandbox: true,
})

/**
 * Sends an email using Mailtrap SDK
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
    if (skipEmails) {
        console.log(`[Email] Skipping email to: ${options.to.map(t => t.email).join(", ")}`)
        console.log(`[Email] Subject: ${options.subject}`)
        return { success: true, skipped: true }
    }

    if (!mailtrapToken) {
        console.warn("[Email] MAILTRAP_TOKEN not configured, skipping email")
        return { success: true, skipped: true }
    }

    try {
        // Send email using Mailtrap SDK
        await client.send({
            from: options.from || { email: senderEmail, name: senderName },
            to: options.to.map(r => ({ email: r.email, name: r.name })),
            subject: options.subject,
            html: options.html,
        })

        console.log(`[Email] Sent email to: ${options.to.map(t => t.email).join(", ")}`)
        return { success: true }
    } catch (error) {
        console.error("[Email] Error sending email:", error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to send email" 
        }
    }
}

/**
 * Email template for meeting scheduled notification
 */
export function meetingScheduledTemplate(data: {
    recipientName: string
    meetingTitle: string
    hackathonName: string
    hostName: string
    date: string
    time: string
    duration: number
    meetLink: string
    meetingType: "MENTORING" | "EVALUATION" | "PRESENTATION"
    notes?: string
}): string {
    const typeLabels = {
        MENTORING: "Mentoring Session",
        EVALUATION: "Evaluation Session",
        PRESENTATION: "Presentation",
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${typeLabels[data.meetingType]} Scheduled</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📅 ${typeLabels[data.meetingType]} Scheduled</h1>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hi <strong>${data.recipientName}</strong>,
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            A ${typeLabels[data.meetingType].toLowerCase()} has been scheduled for <strong>${data.hackathonName}</strong>.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px; color: #1f2937;">Meeting Details</h3>
            <table style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Title:</td>
                    <td style="padding: 8px 0; font-weight: 600;">${data.meetingTitle}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Host:</td>
                    <td style="padding: 8px 0; font-weight: 600;">${data.hostName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                    <td style="padding: 8px 0; font-weight: 600;">${data.date}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Time:</td>
                    <td style="padding: 8px 0; font-weight: 600;">${data.time}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Duration:</td>
                    <td style="padding: 8px 0; font-weight: 600;">${data.duration} minutes</td>
                </tr>
            </table>
        </div>

        ${data.notes ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e;">
                <strong>Notes:</strong> ${data.notes}
            </p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
            <a href="${data.meetLink}" 
               style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                🎥 Join Google Meet
            </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Meeting Link: <a href="${data.meetLink}" style="color: #6366f1;">${data.meetLink}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 14px; color: #9ca3af; text-align: center;">
            This email was sent by the Hackathon Platform.<br>
            Please add this meeting to your calendar.
        </p>
    </div>
</body>
</html>
`
}

/**
 * Email template for meeting cancelled notification
 */
export function meetingCancelledTemplate(data: {
    recipientName: string
    meetingTitle: string
    hackathonName: string
    date: string
    time: string
    reason?: string
}): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Cancelled</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ef4444; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">❌ Meeting Cancelled</h1>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-bottom: 20px;">
            Hi <strong>${data.recipientName}</strong>,
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            The following meeting for <strong>${data.hackathonName}</strong> has been cancelled:
        </p>

        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
            <p style="margin: 0;"><strong>${data.meetingTitle}</strong></p>
            <p style="margin: 5px 0 0; color: #6b7280;">${data.date} at ${data.time}</p>
        </div>

        ${data.reason ? `
        <p style="font-size: 14px; color: #6b7280;">
            <strong>Reason:</strong> ${data.reason}
        </p>
        ` : ''}

        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            Please contact the organizer if you have any questions.
        </p>
    </div>
</body>
</html>
`
}
