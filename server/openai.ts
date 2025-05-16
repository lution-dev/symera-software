import OpenAI from "openai";
import { CreateEventData } from "@shared/schema";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Error handling function
const handleOpenAIError = (error: any) => {
  console.error("OpenAI API Error:", error);
  if (error.response) {
    console.error(error.response.status, error.response.data);
    throw new Error(`OpenAI API error: ${error.response.status}`);
  } else {
    throw new Error(`OpenAI API error: ${error.message || "Unknown error"}`);
  }
};

// Generate a checklist for an event based on its details
export async function generateEventChecklist(eventData: CreateEventData): Promise<Array<{ title: string, dueDate?: Date, description?: string, priority?: string }>> {
  try {
    // Use startDate if available, otherwise fallback to the date field
    const eventStartDate = new Date(eventData.startDate || eventData.date);
    const eventEndDate = eventData.endDate ? new Date(eventData.endDate) : eventStartDate;
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Format date with time if available
    const formatDateWithTime = (date: Date, time?: string) => {
      const dateStr = date.toLocaleDateString();
      return time ? `${dateStr} às ${time}` : dateStr;
    };
    
    const eventStartDisplay = formatDateWithTime(eventStartDate, eventData.startTime);
    const eventEndDisplay = formatDateWithTime(eventEndDate, eventData.endTime);
    
    // Determine if it's a multi-day event
    const isMultiDay = eventStartDate.getTime() !== eventEndDate.getTime();
    const dateDisplay = isMultiDay 
      ? `de ${eventStartDisplay} até ${eventEndDisplay}`
      : eventStartDisplay;

    // Prepare prompt for OpenAI
    const prompt = `
      Create a comprehensive checklist for a ${eventData.type} event named "${eventData.name}" that will occur ${dateDisplay}. 
      
      Additional details:
      - Location: ${eventData.location || 'To be determined'}
      - Number of attendees: ${eventData.attendees || 'Unknown'}
      - Budget: ${eventData.budget ? `$${eventData.budget}` : 'Not specified'}
      - Days until event: ${daysUntilEvent}
      - Description: ${eventData.description || 'Not provided'}
      - Event duration: ${isMultiDay ? `Multiple days (${Math.ceil((eventEndDate.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24))} days)` : 'Single day'}

      Please provide a detailed, organized checklist with tasks that need to be completed before the event.
      For each task, include:
      - task title
      - suggested due date (relative to event date - e.g., "3 weeks before event")
      - brief description (optional)
      - priority (low, medium, or high)

      Format the response as a JSON array with these properties.
      
      Each task should be reasonable and specific to this type of event.
      Distribute tasks appropriately based on the time available before the event.
      
      Response format:
      [
        {
          "title": "Task title",
          "dueDateBefore": number of days before the event,
          "description": "Brief description of the task",
          "priority": "low|medium|high"
        },
        ...
      ]
    `;

    // Call OpenAI API to generate checklist
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert event planner who creates detailed checklists for various types of events." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    // Parse and process the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    if (!Array.isArray(parsedResponse.tasks)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Process tasks and calculate actual due dates
    return parsedResponse.tasks.map((task: any) => {
      // Calculate due date based on days before event
      let dueDate: Date | undefined = undefined;
      if (typeof task.dueDateBefore === 'number') {
        // Use eventStartDate para calcular a data de vencimento das tarefas
        dueDate = new Date(eventStartDate);
        dueDate.setDate(dueDate.getDate() - task.dueDateBefore);
      }

      return {
        title: task.title,
        dueDate: dueDate,
        description: task.description,
        priority: task.priority?.toLowerCase() || 'medium'
      };
    });
  } catch (error) {
    handleOpenAIError(error);
    return [];
  }
}
