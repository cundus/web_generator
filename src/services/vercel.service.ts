import { Vercel } from "@vercel/sdk";

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_API_KEY,
  
});

export async function addAndReviewDomain(domain: string, deploymentId: string,projectName:string) {
  try {
    console.log("Adding domain: " + domain,deploymentId,projectName);
    
  

    // Add a new domain
    const addDomainResponse = await vercel.projects.addProjectDomain({
      idOrName: projectName, //The project name used in the deployment URL
      requestBody: {
        name: domain,
      },
    });

    console.log(`Domain added: ${addDomainResponse.name}`);
    console.log("Domain Details:", JSON.stringify(addDomainResponse, null, 2));
    return addDomainResponse;
  } catch (error) {
    console.error(
      error instanceof Error ? `Error: ${error.message}` : String(error)
    );
    throw error; // Re-throw the error so it can be handled by the controller
  }
}
