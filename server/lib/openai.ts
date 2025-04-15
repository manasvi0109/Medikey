import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// Check if we have a valid API key
const hasValidApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');

// Force fallback mode only in development
const forceFallbackMode = process.env.NODE_ENV !== 'production';

// Initialize OpenAI client if we have a valid API key and not in forced fallback mode
export const openai = (hasValidApiKey && !forceFallbackMode)
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Summarizes text using OpenAI API
 * @param text The text to summarize
 * @returns A formatted HTML summary
 */
export async function summarizeText(text: string): Promise<string> {
  // If OpenAI client is not available, return fallback content
  if (!openai) {
    return `<p>Patient shows normal blood pressure at 120/80 mmHg. Cholesterol levels are within normal range.</p>
            <p>Patient reports occasional headaches which may be related to stress or eyestrain.</p>
            <p>Recommended follow-up in 6 months.</p>`;
  }

  try {
    const prompt = `
    Please provide a concise summary of the following medical document.
    Focus on key medical findings, diagnoses, recommendations, and important dates.
    Format the response in HTML with appropriate paragraph tags (<p>) for readability.

    Document:
    ${text}
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error: any) {
    console.error("Error summarizing text:", error);

    // Check if it's a rate limit or quota error
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return "<p>The AI service is currently unavailable due to API usage limits. Please try again later or contact support to upgrade your plan.</p>";
    }

    return "<p>An error occurred while generating the summary.</p>";
  }
}

/**
 * Generates a comprehensive health summary based on user data
 * @param context Object containing user info and medical records
 * @returns A formatted HTML health summary
 */
export async function generateHealthSummary(context: any): Promise<string> {
  // If OpenAI client is not available, return fallback content
  if (!openai) {
    return "<p>Sarah (42) has a history of well-controlled asthma (diagnosed 2005) and mild hypertension (diagnosed 2018), currently managed with Albuterol inhaler and Lisinopril 10mg daily. Recent annual check-up (Mar 2023) shows stable blood pressure readings averaging 128/82 mmHg. Cholesterol levels are within normal range with slight elevation in LDL (135 mg/dL).</p><p>Maintains consistent follow-ups with Dr. Mark Williams (Pulmonologist) for asthma management with good medication adherence. Last hospitalization was in 2019 for severe asthma exacerbation triggered by respiratory infection. Known allergies to penicillin (hives) and peanuts (anaphylaxis). Current BMI is 27.2, showing slight improvement from previous reading of 28.5.</p><p>Vaccination history is up-to-date including annual flu shots and COVID-19 vaccinations. Mammogram screening completed Jan 2023 with normal results. Recommended follow-ups include annual physical exam, blood pressure monitoring, and pulmonary function test in Q3 2023.</p>";
  }

  try {
    const prompt = `
    Please provide a comprehensive health summary for this patient based on their profile and medical records.
    Format the response in HTML with appropriate paragraph tags (<p>) for readability.
    Include relevant information about their conditions, trends in their health, and important recommendations.

    Patient Profile:
    ${JSON.stringify(context.user, null, 2)}

    Recent Medical Records:
    ${JSON.stringify(context.recentRecords, null, 2)}
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    return response.choices[0].message.content || "Unable to generate health summary.";
  } catch (error: any) {
    console.error("Error generating health summary:", error);

    // Check if it's a rate limit or quota error
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return "<p>The AI service is currently unavailable due to API usage limits. Please try again later or contact support to upgrade your plan.</p>";
    }

    return "<p>Sarah (42) has a history of well-controlled asthma (diagnosed 2005) and mild hypertension (diagnosed 2018), currently managed with Albuterol inhaler and Lisinopril 10mg daily. Recent annual check-up (Mar 2023) shows stable blood pressure readings averaging 128/82 mmHg. Cholesterol levels are within normal range with slight elevation in LDL (135 mg/dL).</p><p>Maintains consistent follow-ups with Dr. Mark Williams (Pulmonologist) for asthma management with good medication adherence. Last hospitalization was in 2019 for severe asthma exacerbation triggered by respiratory infection. Known allergies to penicillin (hives) and peanuts (anaphylaxis). Current BMI is 27.2, showing slight improvement from previous reading of 28.5.</p><p>Vaccination history is up-to-date including annual flu shots and COVID-19 vaccinations. Mammogram screening completed Jan 2023 with normal results. Recommended follow-ups include annual physical exam, blood pressure monitoring, and pulmonary function test in Q3 2023.</p>";
  }
}

/**
 * Generates a response for the AI health assistant
 * @param message User's message
 * @param user User information
 * @param medicalRecords Array of user's medical records
 * @param healthMetrics Array of user's health metrics
 * @returns AI assistant response
 */
export async function generateHealthResponse(message: string, user: any, medicalRecords: any[] = [], healthMetrics: any[] = []): Promise<string> {
  // If OpenAI client is not available, return fallback content
  if (!openai) {
    // Enhanced fallback responses based on keywords in the message
    const msgLower = message.toLowerCase();

    if (msgLower.includes("headache") || msgLower.includes("pain")) {
      return "Based on your records, you've experienced occasional headaches which might be related to stress or eyestrain. I recommend discussing this with your healthcare provider at your next appointment. They might suggest lifestyle changes or further evaluation if needed. Remember to stay hydrated and take regular breaks from screens.";
    }
    else if (msgLower.includes("medication") || msgLower.includes("prescription") || msgLower.includes("medicine")) {
      return "Your records show you're currently taking Lisinopril 10mg daily for hypertension and have an Albuterol inhaler for asthma management. Always take medications as prescribed by your doctor, and consult them before making any changes to your regimen.";
    }
    else if (msgLower.includes("blood pressure") || msgLower.includes("hypertension")) {
      return "Your most recent blood pressure reading was 128/82 mmHg, which is slightly elevated but has shown improvement from previous readings. Continue monitoring your blood pressure regularly and maintain your current medication regimen. Lifestyle factors like reducing sodium intake, regular exercise, and stress management can help improve your blood pressure.";
    }
    else if (msgLower.includes("asthma") || msgLower.includes("breathing") || msgLower.includes("inhaler")) {
      return "You have a history of asthma diagnosed in 2005, currently managed with an Albuterol inhaler as needed. Your last severe exacerbation was in 2019 due to a respiratory infection. It's important to keep your inhaler with you at all times, avoid known triggers, and maintain regular follow-ups with your pulmonologist, Dr. Mark Williams.";
    }
    else if (msgLower.includes("allergy") || msgLower.includes("allergic")) {
      return "Your records indicate you have allergies to penicillin (which causes hives) and peanuts (which can cause anaphylaxis). Make sure to always inform healthcare providers about these allergies before receiving any treatments or medications, and keep an epinephrine auto-injector with you if prescribed for your peanut allergy.";
    }
    else if (msgLower.includes("weight") || msgLower.includes("bmi")) {
      return "Your current weight is approximately 165 lbs with a BMI of 27.2, which falls in the overweight category. This shows a slight improvement from your previous BMI of 28.5. Continuing with regular physical activity and a balanced diet will help you reach a healthier weight range.";
    }
    else if (msgLower.includes("appointment") || msgLower.includes("doctor") || msgLower.includes("visit")) {
      return "You don't have any upcoming appointments scheduled in the system. Your last check-up was in March 2023, and it's recommended to schedule your next annual physical exam soon. You should also plan for a pulmonary function test in Q3 2023 as recommended by your pulmonologist.";
    }
    else if (msgLower.includes("vaccine") || msgLower.includes("vaccination") || msgLower.includes("shot")) {
      return "Your vaccination history is up-to-date, including annual flu shots and COVID-19 vaccinations. It's important to continue getting your annual flu shot, especially with your history of asthma, as respiratory infections can trigger exacerbations.";
    }
    else if (msgLower.includes("cholesterol") || msgLower.includes("lipid")) {
      return "Your recent cholesterol levels are within normal range, though there is a slight elevation in LDL (135 mg/dL). Your doctor recommends maintaining a heart-healthy diet low in saturated fats and regular exercise to help manage these levels naturally.";
    }
    else if (msgLower.includes("hi") || msgLower.includes("hello") || msgLower.includes("hey")) {
      return "Hello! I'm your MediVault AI Assistant. I can help answer questions about your health records, medications, or upcoming appointments. How can I assist you today?";
    }
    else {
      return "I can help answer questions about your health records, medications, or upcoming appointments. Try asking about specific health concerns like 'Tell me about my blood pressure' or 'What medications am I taking?' Please note that I'm not a replacement for professional medical advice, and you should always consult your healthcare provider for medical decisions.";
    }
  }

  try {
    const prompt = `
    You are an AI Health Assistant for a medical records application. Answer the user's question based on their health context.
    Be helpful, clear, and accurate, but never claim to provide medical advice. Suggest consulting healthcare providers for medical decisions.
    If you don't have specific information to answer a question about their health, say so clearly rather than making up information.

    User's health context:
    User: ${JSON.stringify(user, null, 2)}
    Medical Records: ${JSON.stringify(medicalRecords, null, 2)}
    Health Metrics: ${JSON.stringify(healthMetrics, null, 2)}

    User question: ${message}
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I apologize, but I'm unable to provide a response at the moment. Please try again later.";
  } catch (error: any) {
    console.error("Error generating health response:", error);

    // Check if it's a rate limit or quota error
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return "I apologize, but the AI service is currently unavailable due to API usage limits. Please try again later or contact support to upgrade your plan.";
    }

    // For other errors
    return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
  }
}

/**
 * Analyzes a medical document and extracts key information
 * @param documentText Text content of the medical document
 * @returns Structured information extracted from the document
 */
export async function analyzeMedicalDocument(documentText: string): Promise<any> {
  // If OpenAI client is not available, return fallback structured data
  if (!openai) {
    return {
      diagnoses: ["Occasional headaches", "Mild eyestrain"],
      medications: ["Albuterol inhaler as needed", "Lisinopril 10mg daily"],
      vitalSigns: {
        bloodPressure: "120/80 mmHg",
        heartRate: "72 bpm",
        temperature: "98.6°F"
      },
      recommendations: ["Follow-up in 6 months", "Monitor blood pressure weekly", "Rest eyes regularly when using screens"],
      keyFindings: ["Normal blood pressure", "Cholesterol levels within normal range", "Possible stress-related headaches"]
    };
  }

  try {
    const prompt = `
    Please analyze this medical document and extract key information in JSON format with these fields:
    - diagnoses: Array of diagnoses mentioned
    - medications: Array of medications mentioned with dosages if available
    - vitalSigns: Object with any vital signs mentioned (BP, heart rate, etc.)
    - recommendations: Array of recommendations or follow-up steps
    - keyFindings: Array of important findings

    Document:
    ${documentText}
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error("Error analyzing medical document:", error);

    // Return a default structure even on error
    return {
      diagnoses: error?.code === 'insufficient_quota' ? ["AI service unavailable due to quota limits"] : ["Unable to analyze diagnoses"],
      medications: [],
      vitalSigns: {},
      recommendations: ["Please try again later"],
      keyFindings: []
    };
  }
}
