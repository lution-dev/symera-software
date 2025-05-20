import { db } from './server/db';
import { eq } from 'drizzle-orm';
import { tasks } from './shared/schema';

async function updateTaskAssigneesInDescription() {
  try {
    console.log('Fetching existing tasks...');
    
    // Fetch tasks assigned to user 8650891
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, '8650891'));
    
    console.log(`Found ${userTasks.length} tasks assigned to user 8650891`);
    
    // Additional team members to add to task descriptions
    const teamMembers = [
      { id: 'user1', name: 'João Silva' },
      { id: 'user2', name: 'Maria Santos' },
      { id: 'user3', name: 'Carlos Oliveira' }
    ];
    
    for (const task of userTasks) {
      console.log(`Updating task ${task.id}: ${task.title}`);
      
      // Create new description with multiple assignees
      let description = task.description || '';
      
      // Add collaborators section if it doesn't exist
      if (!description.includes('Colaboradores:')) {
        description += '\n\n**Colaboradores:** Lucas Pires (principal)';
        
        // Add other team members
        teamMembers.forEach(member => {
          description += `, ${member.name}`;
        });
      }
      
      // Update the task
      await db.update(tasks)
        .set({ 
          description,
          updatedAt: new Date()
        })
        .where(eq(tasks.id, task.id));
      
      console.log(`  - Updated task ${task.id} with multiple assignees`);
    }
    
    console.log('Successfully updated tasks with multiple assignees!');
  } catch (error) {
    console.error('Error updating tasks:', error);
  } finally {
    process.exit(0);
  }
}

updateTaskAssigneesInDescription();