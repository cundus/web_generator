import { createProject, createChat, deployToVercel } from "./v0.service";
import { addAndReviewDomain } from "./vercel.service";

/**
 * Reserved subdomains that cannot be used directly
 */
const RESERVED_SUBDOMAINS = ['app', 'engine', 'waha'];

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

/**
 * Generate domain name with reserved subdomain handling
 * If app_name is a reserved subdomain, prefix it with owner name
 */
const generateDomainName = (owner: string, app_name?: string): string => {
  const sanitizedOwner = sanitizeOwner(owner);
  
  if (!app_name) {
    return sanitizedOwner;
  }
  
  const sanitizedAppName = sanitizeOwner(app_name);
  
  // Check if the app_name is a reserved subdomain
  if (RESERVED_SUBDOMAINS.includes(sanitizedAppName)) {
    return `${sanitizedOwner}${sanitizedAppName}`;
  }
  
  return sanitizedAppName;
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

  // Generate domain name with reserved subdomain handling
  const domainName = generateDomainName(owner, app_name);

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
  const domainResult = await addAndReviewDomain(
    customDomain,
    deployment.id,
    deployment.inspectorUrl.split("/")[4]
  );

  if (!domainResult) {
    throw new Error("Failed to add custom domain to Vercel");
  }

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
