import { v0 } from "v0-sdk";
import databaseService from "./database.service";

export const createProject = async (owner: string, projectName: string, description: string, chatId: string) => {
  const project = await v0.projects.create({
    name: projectName,
    description: description,
  });

  // Insert into database with correct schema
  await databaseService.query(
    'INSERT INTO web_generator (owner, project_name, project_id, chat_id) VALUES ($1, $2, $3, $4)',
    [owner, projectName, project.id, chatId]
  );

  return project;
};
