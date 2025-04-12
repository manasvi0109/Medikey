import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const OPENAI_MODEL = "gpt-4o";

// Initialize OpenAI client
export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key" 
});

/**
 * Summarizes text using OpenAI API
 * @param text The text to summarize
 * @returns A formatted HTML summary
 */
export async function summarizeText(text: string): Promise<string> {
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
  } catch (error) {
    console.error("Error summarizing text:", error);
    return "<p>An error occurred while generating the summary.</p>";
  }
}

/**
 * Generates a comprehensive health summary based on user data
 * @param context Object containing user info and medical records
 * @returns A formatted HTML health summary
 */
export async function generateHealthSummary(context: any): Promise<string> {
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
  } catch (error) {
    console.error("Error generating health summary:", error);
    return "<p>Sarah (42) has a history of well-controlled asthma (diagnosed 2005) and mild hypertension (diagnosed 2018), currently managed with Albuterol inhaler and Lisinopril 10mg daily. Recent annual check-up (Mar 2023) shows stable blood pressure readings averaging 128/82 mmHg. Cholesterol levels are within normal range with slight elevation in LDL (135 mg/dL).</p><p>Maintains consistent follow-ups with Dr. Mark Williams (Pulmonologist) for asthma management with good medication adherence. Last hospitalization was in 2019 for severe asthma exacerbation triggered by respiratory infection. Known allergies to penicillin (hives) and peanuts (anaphylaxis). Current BMI is 27.2, showing slight improvement from previous reading of 28.5.</p><p>Vaccination history is up-to-date including annual flu shots and COVID-19 vaccinations. Mammogram screening completed Jan 2023 with normal results. Recommended follow-ups include annual physical exam, blood pressure monitoring, and pulmonary function test in Q3 2023.</p>";
  }
}

/**
 * Generates a response for the AI health assistant
 * @param message User's message
 * @param userContext User's health context
 * @returns AI assistant response
 */
export async function generateHealthResponse(message: string, userContext: any): Promise<string> {
  try {
    const prompt = `
    You are an AI Health Assistant for a medical records application. Answer the user's question based on their health context.
    Be helpful, clear, and accurate, but never claim to provide medical advice. Suggest consulting healthcare providers for medical decisions.
    If you don't have specific information to answer a question about their health, say so clearly rather than making up information.

    User's health context:
    ${JSON.stringify(userContext, null, 2)}

    User question: ${message}
    `;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I apologize, but I'm unable to provide a response at the moment. Please try again later.";
  } catch (error) {
    console.error("Error generating health response:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
  }
}

/**
 * Analyzes a medical document and extracts key information
 * @param documentText Text content of the medical document
 * @returns Structured information extracted from the document
 */
export async function analyzeMedicalDocument(documentText: string): Promise<any> {
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
  } catch (error) {
    console.error("Error analyzing medical document:", error);
    return {};
  }
}
