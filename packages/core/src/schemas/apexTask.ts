import { z } from 'zod';

export const ApexTaskSchema = z.object({
  task_id: z.string(),
  whatsapp_chat_id: z.string().nullable(),
  card_type: z.string(),
  task_description: z.string(),
  task_message: z.string(),
  task_category: z.string(),
  last_updated_at: z.string(),
});

export const ApexTasksResponseSchema = z.array(ApexTaskSchema);

export type ApexTask = z.infer<typeof ApexTaskSchema>;

// React Native style file reference
interface FileReference {
  uri: string;
  name: string;
  type: string;
}

export interface SubmitApexTaskRequest {
  taskId: string;
  message?: string;
  image?: FileReference | File;
  audio?: FileReference | File;
}
