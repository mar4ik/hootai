import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { analyzeContent } from "../../src/lib/ai-service";
import { AnalysisData } from "../../src/components/main-content";

export async function httpTrigger(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json() as AnalysisData;
    const { type, content, fileName } = body;

    if (!type || !content) {
      return {
        status: 400,
        jsonBody: { error: "Missing required fields: type and content" }
      };
    }

    if (type !== "url" && type !== "file") {
      return {
        status: 400,
        jsonBody: { error: 'Invalid type: must be "url" or "file"' }
      };
    }

    const result = await analyzeContent({ type, content, fileName });
    return {
      status: 200,
      jsonBody: result,
      headers: { "Content-Type": "application/json" }
    };
  } catch (error) {
    context.error("API route error:", error);
    return {
      status: 500,
      jsonBody: { error: "Failed to analyze content" }
    };
  }
}

app.http('analyze', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: httpTrigger
}); 