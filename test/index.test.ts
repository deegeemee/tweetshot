import assert from 'assert/strict';
import { after, describe, it, mock } from 'node:test';
import { tweetShot } from '../src/index';
import { Browser } from 'puppeteer-core';
import { accessSync, readFileSync, rmSync } from 'fs';
import os from 'os';
import { R_OK } from 'node:constants';

const tweetUrl = 'https://twitter.com/deegeemee/status/1682087529612360704';

const testOutFile = os.tmpdir() + '/tweetshot-test-file.webp';

describe('tweetShot', () => {
  after(() => {
    rmSync(testOutFile);
  });

  it('should throw error if chromeExecutable is invalid', async () => {
    await assert.rejects(tweetShot({ tweetUrl, chromeExecutable: undefined }), (err: Error) => {
      assert.match(err.message, /chromeExecutable is required/);
      return true;
    });
  });

  it('should throw error if tweetUrl is invalid', async () => {
    await assert.rejects(tweetShot({ tweetUrl: 'https://invalid.url' }), (err: Error) => {
      assert.match(err.message, /tweetUrl is invalid/);
      return true;
    });
  });

  it('should throw error if imageWidth is out of range', async () => {
    await assert.rejects(tweetShot({ tweetUrl, imageWidth: 0 }), (err: Error) => {
      assert.match(err.message, /imageWidth must be between 220 and 550/);
      return true;
    });
    await assert.rejects(tweetShot({ tweetUrl, imageWidth: 1000 }), (err: Error) => {
      assert.match(err.message, /imageWidth must be between 220 and 550/);
      return true;
    });
  });

  it('should return a Buffer if outFile is not specified', async () => {
    const mockFetch = async () => ({
      json: async () => ({
        html: `<h1>Hello, world!</h1>`,
      }),
      status: 200,
    });
    mock.method(global, 'fetch', mockFetch);

    const mockBrowser = {
      newPage: async () => ({
        setViewport: async () => {},
        screenshot: async () => new Uint8Array(readFileSync('test/3x3.webp')),
        setContent: async (c: string) => {},
        close: async () => {},
      }),
      close: async () => {},
    } as unknown as Browser;

    const result = await tweetShot({ tweetUrl, browser: mockBrowser });

    assert.ok(result instanceof Buffer);
  });

  it('should return a write to outFile if specified', async () => {
    const mockFetch = async () => ({
      json: async () => ({
        html: `<h1>Hello, world!</h1>`,
      }),
      status: 200,
    });
    mock.method(global, 'fetch', mockFetch);

    const mockBrowser = {
      newPage: async () => ({
        setViewport: async () => {},
        screenshot: async () => new Uint8Array(readFileSync('test/3x3.webp')),
        setContent: async (c: string) => {},
        close: async () => {},
      }),
      close: async () => {},
    } as unknown as Browser;

    const result = await tweetShot({ tweetUrl, browser: mockBrowser, outFile: testOutFile });

    assert.ok(result.format === 'webp');
    assert.ok(result.width === 3);
    assert.ok(result.height === 3);

    assert.doesNotThrow(() => accessSync(testOutFile, R_OK));
  });
});
