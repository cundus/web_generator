import { createProject, createChat, deployToVercel } from "./v0.service";
import { addAndReviewDomain } from "./vercel.service";

/**
 * Sanitize owner name to only allow letters and numbers
 * Converts to lowercase and removes any non-alphanumeric characters
 */
const sanitizeOwner = (owner: string): string => {
  if (!owner || typeof owner !== "string") {
    throw new Error("Owner must be a non-empty string");
  }

  const sanitized = owner.toLowerCase().replace(/[^a-z0-9]/g, "");
  console.log(sanitized);

  if (sanitized.length === 0) {
    throw new Error("Owner must contain at least one letter or number");
  }

  if (sanitized.length > 20) {
    throw new Error(
      "Owner name too long (max 20 characters after sanitization)"
    );
  }

  return sanitized;
};

export const generateWeb = async ({
  owner,
  message,
  description,
  app_name,
}: {
  owner: string;
  message: string;
  description: string;
  app_name?: string;
}) => {
  // Sanitize owner to only allow letters and numbers
  const sanitizedOwner = sanitizeOwner(owner);

  // Determine domain name: use app_name if provided, otherwise use owner
  const domainName = app_name ? sanitizeOwner(app_name) : sanitizedOwner;

  // 1. create project
  const project = await createProject(
    sanitizedOwner,
    "project_" + sanitizedOwner,
    description
  );
  // 2. create chat
  // 3. generate web
  const chat = await createChat(sanitizedOwner, project.id, message);
  //   console.log(chat);

  // 4. deploy to vercel
  if (!chat.latestVersion?.id) {
    throw new Error("Chat version not found");
  }

  const deployment = await deployToVercel(
    chat.id,
    project.id,
    chat.latestVersion?.id
  );

  console.log(deployment);

  // 5. add domain to vercel
  const customDomain = domainName + ".trady.finance";
  await addAndReviewDomain(
    customDomain,
    deployment.id,
    deployment.inspectorUrl.split("/")[4]
  );

  // 6. return result with URLs
  const result = {
    project: {
      id: project.id,
      name: project.name,
    },
    chat: {
      id: chat.id,
      versionId: chat.latestVersion?.id,
    },
    deployment,
    urls: {
      customDomain: `https://${customDomain}`, // Custom domain URL (primary)
      primaryUrl: `https://${customDomain}`, // Main URL to use
    },
    success: true,
    message: `Website successfully deployed and available at: https://${customDomain}`,
  };

  return result;
};
