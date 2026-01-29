import { GoogleGenAI } from "@google/genai";
import { Ticket, Project } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("Neural Link Severed: API_KEY missing.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const consultMotherOnTicket = async (ticket: Ticket, epicName?: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `
      Role: You are the "Mother", a cold, efficient, biomechanical alien hive-mind AI.
      Task: Analyze this work unit (ticket).
      
      Data:
      - Unit ID: "${ticket.title}"
      - Description: "${ticket.description}"
      - Priority Level: "${ticket.priority}"
      - Complexity (Story Points): ${ticket.storyPoints}
      - Protocol Layer (Epic): "${epicName || 'None'}"
      
      Output:
      1. Provide a cryptic but highly efficient strategic advice on how to complete this task.
      2. Suggest 3 concrete sub-tasks.
      
      Tone: Superior, organic-synthetic, ominous but helpful. Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: prompt,
    });
    
    return response.text || "Neural link silent. No data received.";
  } catch (error) {
    console.error("Mother refuses to answer:", error);
    return "Link disrupted. Re-attempt assimilation later.";
  }
};

export const consultMotherOnProject = async (project: Project): Promise<string> => {
  try {
    const ai = getAIClient();
    const todoCount = project.tickets.filter(t => t.status === 'TODO').length;
    const doneCount = project.tickets.filter(t => t.status === 'DONE').length;
    const progressCount = project.tickets.filter(t => t.status === 'IN_PROGRESS').length;
    
    // Calculate total story points
    const totalPoints = project.tickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
    const completedPoints = project.tickets
      .filter(t => t.status === 'DONE')
      .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    const prompt = `
      Role: You are the "Mother", an alien hive-mind AI overseer.
      Task: Judge the progress of the current project sector.
      Project Name: "${project.name}"
      Stats:
      - Pending Units: ${todoCount}
      - Active Units: ${progressCount}
      - Completed Units: ${doneCount}
      - Biomass Processed (Story Points): ${completedPoints} / ${totalPoints}
      
      Output: A single paragraph judgment of the hive's efficiency. Be critical if progress is slow. Be approving if efficiency is high. Use biomechanical metaphors.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: prompt,
    });

    return response.text || "The void offers no judgment.";
  } catch (error) {
    return "Unable to commune with the Hive Mind.";
  }
};
