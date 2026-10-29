#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_CONFIG_PATH = 'A:\\生图apikey.txt';
const STORAGE_ROOT = 'A:\\Claude使用image出图';
const INDEX_FILE = path.join(STORAGE_ROOT, 'index.json');
const COST_LOG_FILE = path.join(STORAGE_ROOT, 'cost-log.json');

// 读取 API 配置
async function loadApiConfig() {
  try {
    const content = await fs.readFile(API_CONFIG_PATH, 'utf-8');
    const config = JSON.parse(content);
    return {
      apiKey: config.key,
      baseUrl: config.url,
    };
  } catch (error) {
    throw new Error(`Failed to load API config from ${API_CONFIG_PATH}: ${error.message}`);
  }
}

// 从 prompt 提取关键词作为标签
function extractTags(prompt) {
  const commonWords = ['一张', '一个', '的', '和', '或', '与', '在', '图片', '图像', 'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'of', 'image', 'picture'];
  const words = prompt.toLowerCase()
    .replace(/[^一-龥a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !commonWords.includes(w));
  return [...new Set(words)].slice(0, 10);
}

// 确保存储目录存在（按年月组织）
async function ensureStorageDir() {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthDir = path.join(STORAGE_ROOT, yearMonth);

  try {
    await fs.access(STORAGE_ROOT);
  } catch {
    await fs.mkdir(STORAGE_ROOT, { recursive: true });
  }

  try {
    await fs.access(monthDir);
  } catch {
    await fs.mkdir(monthDir, { recursive: true });
  }

  return monthDir;
}

// 更新全局索引
async function updateIndex(imageData) {
  let index = [];
  try {
    const content = await fs.readFile(INDEX_FILE, 'utf-8');
    index = JSON.parse(content);
  } catch {
    // 索引文件不存在，创建新的
  }
  index.push(imageData);
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
}

// 下载并保存图片到本地
async function downloadAndSave(imageUrl, metadata, customTags = []) {
  const monthDir = await ensureStorageDir();
  const now = new Date();
  const hash = createHash('md5').update(imageUrl).digest('hex').slice(0, 6);

  // 从 prompt 生成简短的文件名前缀
  const promptWords = metadata.prompt
    .replace(/[^一-龥a-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1)
    .slice(0, 3)
    .join('-');

  const filenamePrefix = promptWords.slice(0, 30) || 'image';
  const filename = `${filenamePrefix}_${hash}.png`;
  const filepath = path.join(monthDir, filename);
  const metapath = path.join(monthDir, `${filename}.json`);

  // 下载图片
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

  if (!response.data) {
    throw new Error(`Failed to download image: response.data is ${typeof response.data}`);
  }

  // 确保 response.data 是 Buffer
  const imageBuffer = Buffer.isBuffer(response.data)
    ? response.data
    : Buffer.from(response.data);

  await fs.writeFile(filepath, imageBuffer);

  // 提取标签
  const autoTags = extractTags(metadata.prompt);
  const allTags = [...new Set([...autoTags, ...customTags])];

  // 保存元数据
  const fullMetadata = {
    ...metadata,
    original_url: imageUrl,
    saved_at: now.toISOString(),
    local_path: filepath,
    filename,
    tags: allTags,
  };
  await fs.writeFile(metapath, JSON.stringify(fullMetadata, null, 2));

  // 更新全局索引
  await updateIndex({
    filename,
    path: filepath,
    tags: allTags,
    prompt: metadata.prompt,
    tool: metadata.tool,
    model: metadata.model,
    created_at: now.toISOString(),
  });

  return { filepath, tags: allTags };
}

// 可用的高质量模型（按推荐优先级排序）
const AVAILABLE_MODELS = [
  'gpt-image-2.5-sunburst',   // GPT Image 2.5 Sunburst - 最佳性价比（测试验证）
  'gpt-image-2.5-flare',      // GPT Image 2.5 Flare - 最高清晰度
  'gpt-image-2',              // GPT Image 2 - 经济选择
];

const DEFAULT_MODEL = AVAILABLE_MODELS[0]; // 默认使用 sunburst（噪点最低，性价比最高）

// OpenAI 图片生成定价（美元）
// 参考: https://openai.com/api/pricing/
// 已验证可用模型：sunburst, flare, gpt-image-2
const PRICING = {
  'gpt-image-2.5-sunburst': {
    '1024x1024': 0.08,
    '1792x1024': 0.08,
    '1024x1792': 0.08,
    '512x512': 0.06,
    '256x256': 0.04,
  },
  'gpt-image-2.5-flare': {
    '1024x1024': 0.10,
    '1792x1024': 0.10,
    '1024x1792': 0.10,
    '512x512': 0.08,
    '256x256': 0.06,
  },
  'gpt-image-2': {
    '1024x1024': 0.04,
    '512x512': 0.03,
    '256x256': 0.02,
  },
};

// 计算单次生成费用
function calculateCost(model, size, n = 1) {
  const modelPricing = PRICING[model];
  if (!modelPricing) {
    return { cost: 0, note: 'Unknown model pricing' };
  }

  const unitCost = modelPricing[size];
  if (!unitCost) {
    return { cost: 0, note: 'Unknown size pricing' };
  }

  return {
    cost: unitCost * n,
    unit_cost: unitCost,
    currency: 'USD',
  };
}

// 记录费用到本地日志
async function logCost(toolName, model, size, n, cost) {
  let costLog = [];
  try {
    const content = await fs.readFile(COST_LOG_FILE, 'utf-8');
    costLog = JSON.parse(content);
  } catch {
    // 日志文件不存在，创建新的
  }

  const entry = {
    timestamp: new Date().toISOString(),
    tool: toolName,
    model,
    size,
    n,
    cost: cost.cost,
    unit_cost: cost.unit_cost,
    currency: cost.currency,
  };

  costLog.push(entry);

  // 计算累计费用
  const totalCost = costLog.reduce((sum, e) => sum + (e.cost || 0), 0);

  await fs.writeFile(COST_LOG_FILE, JSON.stringify(costLog, null, 2));

  return {
    entry,
    total_cost: totalCost,
    total_entries: costLog.length,
  };
}

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'image-generator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 列出可用工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_image',
        description: `文生图：Generate an image from a text prompt using high-quality AI models. Uses ${DEFAULT_MODEL} by default (最佳性价比 - 实测噪点最低). Available models: ${AVAILABLE_MODELS.join(', ')}`,
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The text prompt describing the image to generate (支持中文)',
            },
            model: {
              type: 'string',
              description: `Model to use. Defaults to ${DEFAULT_MODEL} (最高质量). Available: ${AVAILABLE_MODELS.join(', ')}`,
              enum: AVAILABLE_MODELS,
            },
            size: {
              type: 'string',
              description: 'Image size. Default: 1024x1024',
              enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
            },
            quality: {
              type: 'string',
              description: 'Image quality. Default: high',
              enum: ['low', 'medium', 'high', 'auto'],
            },
            n: {
              type: 'number',
              description: 'Number of images to generate. Default: 1',
              minimum: 1,
              maximum: 4,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'edit_image',
        description: '图生图/局部编辑：Edit an existing image based on a prompt. Can modify specific areas while keeping others unchanged. Supports inpainting with mask (修改指定区域，其他保持不变).',
        inputSchema: {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              description: 'Base64-encoded PNG image or URL to the image to edit',
            },
            prompt: {
              type: 'string',
              description: 'Description of the edits to make (支持中文)',
            },
            mask: {
              type: 'string',
              description: 'Optional: Base64-encoded mask image (transparent areas will be edited). If not provided, entire image context is used for editing.',
            },
            model: {
              type: 'string',
              description: `Model to use. Defaults to ${DEFAULT_MODEL}`,
              enum: AVAILABLE_MODELS,
            },
            size: {
              type: 'string',
              description: 'Output image size. Default: 1024x1024',
              enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
            },
            n: {
              type: 'number',
              description: 'Number of variations to generate. Default: 1',
              minimum: 1,
              maximum: 4,
            },
          },
          required: ['image', 'prompt'],
        },
      },
      {
        name: 'create_variation',
        description: '图生图变体：Create variations of an existing image. Keeps the overall style and composition while generating new versions (保持风格和构图，生成变体).',
        inputSchema: {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              description: 'Base64-encoded PNG image or URL to create variations from',
            },
            model: {
              type: 'string',
              description: `Model to use. Defaults to ${DEFAULT_MODEL}`,
              enum: AVAILABLE_MODELS,
            },
            n: {
              type: 'number',
              description: 'Number of variations to generate. Default: 1',
              minimum: 1,
              maximum: 4,
            },
            size: {
              type: 'string',
              description: 'Output image size. Default: 1024x1024',
              enum: ['256x256', '512x512', '1024x1024'],
            },
          },
          required: ['image'],
        },
      },
      {
        name: 'list_images',
        description: '检索图片：Search and list generated images by tags, date, or keywords. Returns matching images with metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              description: 'Filter by tags (AND logic - all tags must match)',
              items: { type: 'string' },
            },
            keyword: {
              type: 'string',
              description: 'Search in prompt text (case-insensitive)',
            },
            month: {
              type: 'string',
              description: 'Filter by month, format: YYYY-MM (e.g., 2026-10)',
            },
            tool: {
              type: 'string',
              description: 'Filter by tool used',
              enum: ['generate_image', 'edit_image', 'create_variation'],
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return. Default: 20',
              minimum: 1,
              maximum: 100,
            },
          },
          required: [],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;

  try {
    // list_images 不需要 API 配置
    if (toolName === 'list_images') {
      const { tags = [], keyword, month, tool, limit = 20 } = request.params.arguments;

      // 读取全局索引
      let index = [];
      try {
        const content = await fs.readFile(INDEX_FILE, 'utf-8');
        index = JSON.parse(content);
      } catch {
        // 索引文件不存在
      }

      // 过滤
      let results = index;

      if (tags.length > 0) {
        results = results.filter(item =>
          tags.every(tag => item.tags && item.tags.includes(tag.toLowerCase()))
        );
      }

      if (keyword) {
        const kw = keyword.toLowerCase();
        results = results.filter(item =>
          item.prompt && item.prompt.toLowerCase().includes(kw)
        );
      }

      if (month) {
        results = results.filter(item =>
          item.created_at && item.created_at.startsWith(month)
        );
      }

      if (tool) {
        results = results.filter(item => item.tool === tool);
      }

      // 限制数量，最新的在前
      results = results.slice(-limit).reverse();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                tool: 'list_images',
                total: results.length,
                filters: { tags, keyword, month, tool, limit },
                images: results,
                storage_root: STORAGE_ROOT,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // 其他工具需要加载 API 配置
    const config = await loadApiConfig();

    if (toolName === 'generate_image') {
      const { prompt, model = DEFAULT_MODEL, size = '1024x1024', quality = 'high', n = 1 } = request.params.arguments;

      if (!prompt || typeof prompt !== 'string') {
        throw new Error('prompt is required and must be a string');
      }

      const response = await axios.post(
        `${config.baseUrl}/v1/images/generations`,
        {
          model,
          prompt,
          size,
          quality,
          n,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );

      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error('No images returned from API');
      }

      // 下载并保存所有图片
      const images = await Promise.all(
        response.data.data.map(async (item) => {
          const metadata = {
            tool: 'generate_image',
            model,
            prompt,
            size,
            quality,
            revised_prompt: item.revised_prompt || prompt,
          };

          let filepath, tags;

          // 支持 url 或 b64_json
          if (item.url) {
            ({ filepath, tags } = await downloadAndSave(item.url, metadata));
          } else if (item.b64_json) {
            // 处理 base64 编码的图片
            const imageBuffer = Buffer.from(item.b64_json, 'base64');
            const monthDir = await ensureStorageDir();
            const now = new Date();
            const hash = createHash('md5').update(item.b64_json).digest('hex').slice(0, 6);

            const promptWords = metadata.prompt
              .replace(/[^一-龥a-z0-9\s-]/gi, ' ')
              .split(/\s+/)
              .filter(w => w.length > 1)
              .slice(0, 3)
              .join('-');

            const filenamePrefix = promptWords.slice(0, 30) || 'image';
            const filename = `${filenamePrefix}_${hash}.png`;
            filepath = path.join(monthDir, filename);
            const metapath = path.join(monthDir, `${filename}.json`);

            await fs.writeFile(filepath, imageBuffer);

            const autoTags = extractTags(metadata.prompt);
            tags = autoTags;

            const fullMetadata = {
              ...metadata,
              saved_at: now.toISOString(),
              local_path: filepath,
              filename,
              tags,
            };
            await fs.writeFile(metapath, JSON.stringify(fullMetadata, null, 2));

            await updateIndex({
              filename,
              path: filepath,
              tags,
              prompt: metadata.prompt,
              tool: metadata.tool,
              model: metadata.model,
              created_at: now.toISOString(),
            });
          } else {
            throw new Error('No image data (url or b64_json) in API response');
          }

          return {
            url: item.url || null,
            local_path: filepath,
            tags,
            revised_prompt: item.revised_prompt || prompt,
          };
        })
      );

      // 计算并记录费用
      const costInfo = calculateCost(model, size, n);
      const costLog = await logCost('generate_image', model, size, n, costInfo);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                tool: 'generate_image',
                model,
                prompt,
                size,
                quality,
                images,
                cost: {
                  this_request: `$${costInfo.cost.toFixed(4)} USD`,
                  unit_cost: `$${costInfo.unit_cost.toFixed(4)} USD per image`,
                  total_spent: `$${costLog.total_cost.toFixed(4)} USD`,
                  total_requests: costLog.total_entries,
                },
                storage_root: STORAGE_ROOT,
                note: 'Images saved locally with auto-extracted tags. URLs may expire in 24h, use local_path for persistent access.',
              },
              null,
              2
            ),
          },
        ],
      };
    } else if (toolName === 'edit_image') {
      const { image, prompt, mask, model = DEFAULT_MODEL, size, n = 1 } = request.params.arguments;

      if (!image || typeof image !== 'string') {
        throw new Error('image is required and must be a string (file path, base64 or URL)');
      }
      if (!prompt || typeof prompt !== 'string') {
        throw new Error('prompt is required and must be a string');
      }

      // 处理图片输入：支持本地文件路径、HTTP URL、base64
      let imageUrl;
      if (image.startsWith('http://') || image.startsWith('https://')) {
        // HTTP URL
        imageUrl = image;
      } else if (image.startsWith('data:')) {
        // 已经是 data URL，直接使用
        imageUrl = image;
      } else {
        // 尝试作为本地文件路径读取
        try {
          const imageBuffer = await fs.readFile(image);
          const base64 = imageBuffer.toString('base64');
          imageUrl = `data:image/png;base64,${base64}`;
        } catch (err) {
          // 如果不是有效文件路径，假设是纯 base64 字符串
          imageUrl = `data:image/png;base64,${image}`;
        }
      }

      // 构建符合 OpenAI API 规范的请求体
      const requestBody = {
        model,
        images: [
          {
            image_url: imageUrl
          }
        ],
        prompt,
        n,
      };

      // 只有明确提供了 size 参数才添加，否则让 API 保持原图尺寸
      if (size) {
        requestBody.size = size;
      }

      if (mask) {
        let maskUrl;
        if (mask.startsWith('http://') || mask.startsWith('https://')) {
          maskUrl = mask;
        } else if (mask.startsWith('data:')) {
          maskUrl = mask;
        } else {
          try {
            const maskBuffer = await fs.readFile(mask);
            const base64 = maskBuffer.toString('base64');
            maskUrl = `data:image/png;base64,${base64}`;
          } catch (err) {
            maskUrl = `data:image/png;base64,${mask}`;
          }
        }
        requestBody.mask = {
          image_url: maskUrl
        };
      }

      const response = await axios.post(
        `${config.baseUrl}/v1/images/edits`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );

      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error('No images returned from API');
      }

      // 下载并保存所有图片
      const images = await Promise.all(
        response.data.data.map(async (item) => {
          const metadata = {
            tool: 'edit_image',
            model,
            prompt,
            size,
            has_mask: !!mask,
          };

          let filepath, tags;

          // 支持 url 或 b64_json
          if (item.url) {
            ({ filepath, tags } = await downloadAndSave(item.url, metadata));
          } else if (item.b64_json) {
            // 处理 base64 编码的图片
            const imageBuffer = Buffer.from(item.b64_json, 'base64');
            const monthDir = await ensureStorageDir();
            const now = new Date();
            const hash = createHash('md5').update(item.b64_json).digest('hex').slice(0, 6);

            const promptWords = metadata.prompt
              .replace(/[^一-龥a-z0-9\s-]/gi, ' ')
              .split(/\s+/)
              .filter(w => w.length > 1)
              .slice(0, 3)
              .join('-');

            const filenamePrefix = promptWords.slice(0, 30) || 'image';
            const filename = `${filenamePrefix}_${hash}.png`;
            filepath = path.join(monthDir, filename);
            const metapath = path.join(monthDir, `${filename}.json`);

            await fs.writeFile(filepath, imageBuffer);

            const autoTags = extractTags(metadata.prompt);
            tags = autoTags;

            const fullMetadata = {
              ...metadata,
              saved_at: now.toISOString(),
              local_path: filepath,
              filename,
              tags,
            };
            await fs.writeFile(metapath, JSON.stringify(fullMetadata, null, 2));

            await updateIndex({
              filename,
              path: filepath,
              tags,
              prompt: metadata.prompt,
              tool: metadata.tool,
              model: metadata.model,
              created_at: now.toISOString(),
            });
          } else {
            throw new Error('No image data (url or b64_json) in API response');
          }

          return {
            url: item.url || null,
            local_path: filepath,
            tags,
          };
        })
      );

      // 计算并记录费用（edit_image 使用实际 size 或默认 1024x1024）
      const actualSize = size || '1024x1024';
      const costInfo = calculateCost(model, actualSize, n);
      const costLog = await logCost('edit_image', model, actualSize, n, costInfo);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                tool: 'edit_image',
                model,
                prompt,
                size: actualSize,
                has_mask: !!mask,
                images,
                cost: {
                  this_request: `$${costInfo.cost.toFixed(4)} USD`,
                  unit_cost: `$${costInfo.unit_cost.toFixed(4)} USD per image`,
                  total_spent: `$${costLog.total_cost.toFixed(4)} USD`,
                  total_requests: costLog.total_entries,
                },
                storage_root: STORAGE_ROOT,
                note: 'Images saved locally with auto-extracted tags. URLs may expire in 24h, use local_path for persistent access.',
              },
              null,
              2
            ),
          },
        ],
      };
    } else if (toolName === 'create_variation') {
      const { image, model = DEFAULT_MODEL, size = '1024x1024', n = 1 } = request.params.arguments;

      if (!image || typeof image !== 'string') {
        throw new Error('image is required and must be a string (file path, base64 or URL)');
      }

      // 处理图片输入：支持本地文件路径、HTTP URL、base64
      let imageUrl;
      if (image.startsWith('http://') || image.startsWith('https://')) {
        imageUrl = image;
      } else if (image.startsWith('data:')) {
        imageUrl = image;
      } else {
        try {
          const imageBuffer = await fs.readFile(image);
          const base64 = imageBuffer.toString('base64');
          imageUrl = `data:image/png;base64,${base64}`;
        } catch (err) {
          imageUrl = `data:image/png;base64,${image}`;
        }
      }

      const response = await axios.post(
        `${config.baseUrl}/v1/images/variations`,
        {
          model,
          images: [
            {
              image_url: imageUrl
            }
          ],
          size,
          n,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );

      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error('No images returned from API');
      }

      // 下载并保存所有图片
      const images = await Promise.all(
        response.data.data.map(async (item) => {
          const metadata = {
            tool: 'create_variation',
            model,
            size,
            prompt: 'image variation', // create_variation 没有 prompt，用默认值
          };

          let filepath, tags;

          // 支持 url 或 b64_json
          if (item.url) {
            ({ filepath, tags } = await downloadAndSave(item.url, metadata));
          } else if (item.b64_json) {
            // 处理 base64 编码的图片
            const imageBuffer = Buffer.from(item.b64_json, 'base64');
            const monthDir = await ensureStorageDir();
            const now = new Date();
            const hash = createHash('md5').update(item.b64_json).digest('hex').slice(0, 6);

            const filename = `variation_${hash}.png`;
            filepath = path.join(monthDir, filename);
            const metapath = path.join(monthDir, `${filename}.json`);

            await fs.writeFile(filepath, imageBuffer);

            tags = ['variation'];

            const fullMetadata = {
              ...metadata,
              saved_at: now.toISOString(),
              local_path: filepath,
              filename,
              tags,
            };
            await fs.writeFile(metapath, JSON.stringify(fullMetadata, null, 2));

            await updateIndex({
              filename,
              path: filepath,
              tags,
              prompt: metadata.prompt,
              tool: metadata.tool,
              model: metadata.model,
              created_at: now.toISOString(),
            });
          } else {
            throw new Error('No image data (url or b64_json) in API response');
          }

          return {
            url: item.url || null,
            local_path: filepath,
            tags,
          };
        })
      );

      // 计算并记录费用
      const costInfo = calculateCost(model, size, n);
      const costLog = await logCost('create_variation', model, size, n, costInfo);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                tool: 'create_variation',
                model,
                size,
                images,
                cost: {
                  this_request: `$${costInfo.cost.toFixed(4)} USD`,
                  unit_cost: `$${costInfo.unit_cost.toFixed(4)} USD per image`,
                  total_spent: `$${costLog.total_cost.toFixed(4)} USD`,
                  total_requests: costLog.total_entries,
                },
                storage_root: STORAGE_ROOT,
                note: 'Images saved locally with auto-extracted tags. URLs may expire in 24h, use local_path for persistent access.',
              },
              null,
              2
            ),
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              tool: toolName,
              error: errorMessage,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Image Generator MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
