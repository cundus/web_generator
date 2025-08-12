import { v0 } from "v0-sdk";
import databaseService from "./database.service";

export const createProject = async (
  owner: string,
  projectName: string,
  description: string
) => {
  // Check if project already exists in database
  const existingProject = await findExistingProject(owner, projectName);
  
  if (existingProject) {
    // Verify the project still exists in v0, return it if found
    const v0Project = await getV0ProjectById(existingProject.project_id);
    if (v0Project) {
      return v0Project;
    }
    // If project exists in DB but not in v0, we'll create a new one
    // and update the existing DB record
  }

  // Create new project in v0
  const newProject = await v0.projects.create({
    name: projectName,
    description: description,
  });

  // Save project to database
  await saveProjectToDatabase(owner, projectName, newProject.id, existingProject?.id);

  return newProject;
};

/**
 * Find existing project in database by owner and project name
 */
const findExistingProject = async (owner: string, projectName: string) => {
  const result = await databaseService.query(
    "SELECT id, project_id FROM web_generator WHERE owner = $1 AND project_name = $2",
    [owner, projectName]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Get project from v0 by project ID with error handling
 */
const getV0ProjectById = async (projectId: string) => {
  try {
    return await v0.projects.getById({ projectId });
  } catch (error) {
    // Project might have been deleted from v0
    console.warn(`Project ${projectId} not found in v0:`, error);
    return null;
  }
};

/**
 * Save or update project in database
 */
const saveProjectToDatabase = async (
  owner: string, 
  projectName: string, 
  projectId: string,
  existingRecordId?: number
) => {
  if (existingRecordId) {
    // Update existing record with new project ID
    await databaseService.query(
      "UPDATE web_generator SET project_id = $1 WHERE id = $2",
      [projectId, existingRecordId]
    );
  } else {
    // Insert new record
    await databaseService.query(
      "INSERT INTO web_generator (owner, project_name, project_id) VALUES ($1, $2, $3)",
      [owner, projectName, projectId]
    );
  }
};

export const getProjects = async () => {
  const projects = await v0.projects.find();

  return projects;
};

export const createChat = async (
  owner: string,
  projectId: string,
  message: string
) => {
  // Check if user already has an existing chat
  const existingChatId = await findExistingChatId(owner);
  
  if (existingChatId) {
    // Try to use existing chat and send message
    const existingChat = await getV0ChatById(existingChatId);
    if (existingChat) {
      return existingChat;
      // return await sendMessageToChat(existingChatId, message);
    }
    // If chat exists in DB but not in v0, we'll create a new one
  }

  // Create new chat in v0
  const newChat = await createNewV0Chat(projectId, message);

  // Save chat ID to database
  await saveChatIdToDatabase(owner, newChat.id);

  return newChat;
};

/**
 * Find existing chat ID for a user from database
 */
const findExistingChatId = async (owner: string): Promise<string | null> => {
  const result = await databaseService.query(
    "SELECT chat_id FROM web_generator WHERE owner = $1 AND chat_id IS NOT NULL",
    [owner]
  );
  
  return result.rows.length > 0 ? result.rows[0].chat_id : null;
};

/**
 * Get chat from v0 by chat ID with error handling
 */
const getV0ChatById = async (chatId: string) => {
  try {
    return await v0.chats.getById({ chatId });
  } catch (error) {
    // Chat might have been deleted from v0
    console.warn(`Chat ${chatId} not found in v0:`, error);
    return null;
  }
};

/**
 * Send message to existing chat
 */
const sendMessageToChat = async (chatId: string, message: string) => {
  try {
    return await v0.chats.sendMessage({
      chatId,
      message,
    });
  } catch (error) {
    console.error(`Failed to send message to chat ${chatId}:`, error);
    throw error;
  }
};

/**
 * Create new chat in v0 with default configuration
 */
const createNewV0Chat = async (projectId: string, message: string) => {
  return await v0.chats.create({
    system: "You are a great frontend developer",
    message,
    modelConfiguration: {
      modelId: "v0-1.5-sm",
      imageGenerations: false,
      thinking: false,
    },
    projectId,
  });
};

/**
 * Save chat ID to database for the user
 */
const saveChatIdToDatabase = async (owner: string, chatId: string) => {
  await databaseService.query(
    "UPDATE web_generator SET chat_id = $1 WHERE owner = $2",
    [chatId, owner]
  );
};

export const findChat = async () => {
  const chat = await v0.chats.find({
    limit: "10",
    offset: "0",
    isFavorite: "false",
  });

  return chat;
};

export const getDeployments = async (
  projectId: string,
  chatId: string,
  versionId: string
) => {
  const deployments = await v0.deployments.find({
    projectId,
    chatId,
    versionId,
  });
  return deployments;
};


export const deployToVercel = async (chatId: string, projectId: string, versionId: string) => {
  // Check if deployment already exists
  const existingDeployments = await getDeployments(projectId, chatId, versionId);
  
  if (existingDeployments && existingDeployments.data && existingDeployments.data.length > 0) {
    // Return the first existing deployment
    console.log(`Using existing deployment: ${existingDeployments.data[0].id}`);
    return existingDeployments.data[0];
  }

  // Create new deployment if none exists
  console.log('Creating new deployment...');
  const deployment = await v0.deployments.create({
    projectId,
    chatId,
    versionId,
  });

  return deployment;
};