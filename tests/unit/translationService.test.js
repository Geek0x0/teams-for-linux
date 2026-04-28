'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const TranslationService = require('../../app/translation');
const { extractOpenAIMessage } = require('../../app/translation');

function createFetchResponse(body, ok = true, status = 200) {
	return {
		ok,
		status,
		text: async () => JSON.stringify(body),
	};
}

describe('TranslationService', () => {
	describe('Provider handling', () => {
		it('returns a clear error when DeepL provider is requested', async () => {
			const service = new TranslationService({
				translation: {
					enabled: true,
					provider: 'deepl',
					apiKey: 'legacy-deepl-key',
				},
			});

			const result = await service.translate({ text: '你好' });
			assert.strictEqual(result.success, false);
			assert.match(result.error, /DeepL support has been removed/i);
		});

		it('uses generic apiKey/apiUrl/model fields with provider alias ai', async () => {
			let capturedUrl = '';
			let capturedAuth = '';
			let capturedBody = null;
			const fetchStub = async (url, options) => {
				capturedUrl = url;
				capturedAuth = options.headers.Authorization;
				capturedBody = JSON.parse(options.body);
				return createFetchResponse({
					choices: [
						{
							message: {
								content: 'Hello',
							},
						},
					],
				});
			};

			const service = new TranslationService({
				translation: {
					enabled: true,
					provider: 'ai',
					apiKey: 'generic-ai-key',
					apiUrl: 'https://ai.example.test/v1/chat/completions',
					model: 'custom-model',
				},
			}, fetchStub);

			const result = await service.translate({ text: '你好' });

			assert.strictEqual(result.success, true);
			assert.strictEqual(capturedUrl, 'https://ai.example.test/v1/chat/completions');
			assert.strictEqual(capturedAuth, 'Bearer generic-ai-key');
			assert.strictEqual(capturedBody.model, 'custom-model');
		});
	});

	describe('OpenAI-compatible provider', () => {
		it('builds a chat completion request and extracts translated text', async () => {
			let capturedBody = null;
			const fetchStub = async (_url, options) => {
				capturedBody = JSON.parse(options.body);
				return createFetchResponse({
					choices: [
						{
							message: {
								content: 'Bonjour tout le monde',
							},
						},
					],
				});
			};

			const service = new TranslationService({
				translation: {
					enabled: true,
					provider: 'openai',
					targetLanguage: 'FR',
					languages: [{ code: 'FR', label: 'French' }],
					openai: {
						apiKey: 'openai-key',
						apiUrl: 'https://api.openai.com/v1/chat/completions',
						model: 'gpt-4.1-mini',
					},
				},
			}, fetchStub);

			const result = await service.translate({ text: 'Hello world' });

			assert.strictEqual(result.success, true);
			assert.strictEqual(result.text, 'Bonjour tout le monde');
			assert.strictEqual(capturedBody.model, 'gpt-4.1-mini');
			assert.strictEqual(capturedBody.messages[0].role, 'system');
			assert.ok(
				capturedBody.messages[1].content.includes('"targetLanguage":"French"'),
				`Expected French target language in request body, got: ${capturedBody.messages[1].content}`
			);
		});

		it('extracts array-based content from OpenAI-compatible responses', () => {
			const translatedText = extractOpenAIMessage({
				choices: [
					{
						message: {
							content: [
								{ type: 'text', text: 'Hola ' },
								{ type: 'text', text: 'mundo' },
							],
						},
					},
				],
			});

			assert.strictEqual(translatedText, 'Hola mundo');
		});
	});

	describe('Validation and error handling', () => {
		it('rejects empty text', async () => {
			const service = new TranslationService({
				translation: {
					enabled: true,
					provider: 'openai',
					openai: { apiKey: 'test-key' },
				},
			});

			const result = await service.translate({ text: '   ' });
			assert.strictEqual(result.success, false);
			assert.strictEqual(result.error, 'Text is required');
		});

		it('surfaces missing AI API key', async () => {
			const service = new TranslationService({
				translation: {
					enabled: true,
					provider: 'ai',
				},
			});

			const result = await service.translate({ text: 'hello' });
			assert.strictEqual(result.success, false);
			assert.strictEqual(result.error, 'OpenAI-compatible API key is not configured');
		});

		it('surfaces API errors', async () => {
			const fetchStub = async () => createFetchResponse({
				message: 'Invalid authentication token',
			}, false, 401);

			const service = new TranslationService({
				translation: {
					enabled: true,
					provider: 'openai',
					openai: {
						apiKey: 'bad-key',
						apiUrl: 'https://api.openai.com/v1/chat/completions',
					},
				},
			}, fetchStub);

			const result = await service.translate({ text: 'hello' });
			assert.strictEqual(result.success, false);
			assert.strictEqual(result.error, 'Invalid authentication token');
		});

	});
});
