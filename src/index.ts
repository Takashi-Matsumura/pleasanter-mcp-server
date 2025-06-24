#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PleasanterClient } from './pleasanter/client.js';
import { IssueTools } from './tools/issues.js';
import { SearchTools } from './tools/search.js';
import { ResourceProvider } from './resources/provider.js';
import { PromptTemplates } from './prompts/templates.js';

class PleasanterMCPServer {
  private server: Server;
  private client: PleasanterClient;
  private issueTools: IssueTools;
  private searchTools: SearchTools;
  private resourceProvider: ResourceProvider;
  private promptTemplates: PromptTemplates;

  constructor() {
    // Environment variables
    const baseUrl = process.env.PLEASANTER_BASE_URL;
    const apiKey = process.env.PLEASANTER_API_KEY;

    if (!baseUrl || !apiKey) {
      console.error('Error: PLEASANTER_BASE_URL and PLEASANTER_API_KEY environment variables are required');
      process.exit(1);
    }

    // Initialize Pleasanter client
    this.client = new PleasanterClient({
      baseUrl,
      apiKey,
      timeout: parseInt(process.env.PLEASANTER_TIMEOUT || '30000'),
      retries: parseInt(process.env.PLEASANTER_RETRIES || '3'),
    });

    // Initialize tools and providers
    this.issueTools = new IssueTools(this.client);
    this.searchTools = new SearchTools(this.client);
    this.resourceProvider = new ResourceProvider(this.client);
    this.promptTemplates = new PromptTemplates();

    // Initialize MCP server
    this.server = new Server({
      name: 'pleasanter-mcp-server',
      version: '1.0.0',
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const issueToolDefs = this.issueTools.getToolDefinitions();
      const searchToolDefs = this.searchTools.getToolDefinitions();
      
      return {
        tools: [...issueToolDefs, ...searchToolDefs],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Route to appropriate tool handler
        if (name.startsWith('pleasanter_create_issue') || 
            name.startsWith('pleasanter_get_issues') || 
            name.startsWith('pleasanter_update_issue') || 
            name.startsWith('pleasanter_delete_issue') || 
            name.startsWith('pleasanter_bulk_create_issues')) {
          const result = await this.issueTools.handleToolCall(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } else if (name.startsWith('pleasanter_advanced_search') || 
                   name.startsWith('pleasanter_multi_site_search') || 
                   name.startsWith('pleasanter_trend_analysis') || 
                   name.startsWith('pleasanter_status_summary')) {
          const result = await this.searchTools.handleToolCall(name, args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error executing tool ${name}:`, errorMessage);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: errorMessage,
                tool: name,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: this.resourceProvider.getResourceTemplates(),
      };
    });

    // Handle resource reads
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      try {
        return await this.resourceProvider.getResource(uri);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error reading resource ${uri}:`, errorMessage);
        
        return {
          contents: [
            {
              type: 'text',
              text: JSON.stringify({
                error: errorMessage,
                uri,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }
    });

    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: this.promptTemplates.getPromptDefinitions(),
      };
    });

    // Handle prompt generation
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const promptText = await this.promptTemplates.generatePrompt(name, args || {});
        
        return {
          description: `Generated prompt: ${name}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: promptText,
              },
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error generating prompt ${name}:`, errorMessage);
        
        return {
          description: `Error generating prompt: ${name}`,
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Error generating prompt: ${errorMessage}`,
              },
            },
          ],
        };
      }
    });
  }

  async start() {
    try {
      // Health check
      console.error('[INFO] Checking connection to Pleasanter...');
      const isHealthy = await this.client.healthCheck();
      
      if (!isHealthy) {
        console.error('[ERROR] Failed to connect to Pleasanter API. Please check your configuration.');
        process.exit(1);
      }
      
      console.error('[INFO] Successfully connected to Pleasanter API');
      
      // Start server
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.error('[INFO] Pleasanter MCP server started successfully');
      console.error('[INFO] Available tools:');
      
      const tools = [
        ...this.issueTools.getToolDefinitions(),
        ...this.searchTools.getToolDefinitions(),
      ];
      
      tools.forEach(tool => {
        console.error(`  - ${tool.name}: ${tool.description}`);
      });
      
      console.error('[INFO] Available resources:');
      const resources = this.resourceProvider.getResourceTemplates();
      resources.forEach(resource => {
        console.error(`  - ${resource.uri}: ${resource.description}`);
      });
      
      console.error('[INFO] Available prompts:');
      const prompts = this.promptTemplates.getPromptDefinitions();
      prompts.forEach(prompt => {
        console.error(`  - ${prompt.name}: ${prompt.description}`);
      });
      
    } catch (error) {
      console.error('[ERROR] Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
const server = new PleasanterMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});