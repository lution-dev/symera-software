import { db } from './server/db';
import { eq } from 'drizzle-orm';
import { taskAssignees, tasks } from './shared/schema';

async function addTaskAssignees() {
  try {
    console.log('Fetching existing tasks...');
    
    // Fetch tasks assigned to user 8650891
    const userTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, '8650891'));
    
    console.log(`Found ${userTasks.length} tasks assigned to user 8650891`);
    
    // Add additional team members as assignees to these tasks
    const teamMemberIds = ['user1', 'user2', 'user3'];
    
    for (const task of userTasks) {
      console.log(`Adding assignees to task ${task.id}: ${task.title}`);
      
      // Add original assignee first
      await db.insert(taskAssignees).values({
        taskId: task.id,
        userId: task.assigneeId as string
      }).onConflictDoNothing();
      
      // Add additional team members
      for (const userId of teamMemberIds) {
        console.log(`  - Adding ${userId} as assignee`);
        await db.insert(taskAssignees).values({
          taskId: task.id,
          userId: userId
        }).onConflictDoNothing();
      }
    }
    
    console.log('Successfully added multiple assignees to tasks!');
  } catch (error) {
    console.error('Error updating task assignees:', error);
  } finally {
    process.exit(0);
  }
}

addTaskAssignees();