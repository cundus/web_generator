import { v0 } from "v0-sdk";
import databaseService from "./database.service";

export const createProject = async (
  owner: string,
  projectName: string,
  description: string,
  chatId: string
) => {
  const project = await v0.projects.create({
    name: projectName,
    description: description,
  });

  // Insert into database with correct schema
  await databaseService.query(
    "INSERT INTO web_generator (owner, project_name, project_id, chat_id) VALUES ($1, $2, $3, $4)",
    [owner, projectName, project.id, chatId]
  );

  return project;
};

export const createChat = async (
  owner: string,
  projectId: string,
  message: string
) => {
  const chat = await v0.chats.create({
    system: "You are a great frontend developer",
    message: message,
    modelConfiguration: {
      modelId: "v0-1.5-sm",
      imageGenerations: false,
      thinking: false,
    },
    projectId: projectId,
  });

  // Update into database with correct schema
  await databaseService.query(
    "UPDATE web_generator SET chat_id = $2 WHERE owner = $1",
    [owner, chat.id]
  );

  return chat;
};
