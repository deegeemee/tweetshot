import { Browser, launch } from 'puppeteer-core';
import sharp from 'sharp';

type OEmbedResponse = {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height: number;
  type: string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
};

export type TweetShotParams = {
  /**
   * Tweet URL to screenshot
   */
  tweetUrl: string;

  /**
   * File to save the screenshot to
   * If not specified, the screenshot will be returned as a Buffer
   *
   * @default undefined
   */
  outFile?: string;

  /**
   * Browser to use for screenshotting
   *
   * @default undefined
   */
  browser?: Browser;
  chromeExecutable?: string;

  /**
   * Hides the media in the tweet
   *
   * @default false
   */
  hideMedia?: boolean;

  /**
   * Hides the thread in the tweet
   *
   * @default false
   */
  hideThread?: boolean;

  /**
   * Language to use
   * @see https://developer.x.com/en/docs/twitter-for-websites/supported-languages
   *
   * @default 'dark'
   */
  lang?:
    | 'en'
    | 'ar'
    | 'bn'
    | 'cs'
    | 'da'
    | 'de'
    | 'el'
    | 'es'
    | 'fa'
    | 'fi'
    | 'fil'
    | 'fr'
    | 'he'
    | 'hi'
    | 'hu'
    | 'id'
    | 'it'
    | 'ja'
    | 'ko'
    | 'msa'
    | 'nl'
    | 'no'
    | 'pl'
    | 'pt'
    | 'ro'
    | 'ru'
    | 'sv'
    | 'th'
    | 'tr'
    | 'uk'
    | 'ur'
    | 'vi'
    | 'zh-cn'
    | 'zh-tw';

  /**
   * The theme of the tweet
   *
   * @default 'dark'
   */
  theme?: 'dark' | 'light';

  /**
   * Width of the image to screenshot
   * Must be between 220 and 550
   * @see https://developer.x.com/en/docs/twitter-for-websites/oembed-api
   *
   * @default 550
   */
  imageWidth?: number;
  imageType?: 'jpeg' | 'webp' | 'png';
  imageQuality?: number;
};

type DefaultParams = Required<
  Pick<
    TweetShotParams,
    | 'hideMedia'
    | 'hideThread'
    | 'lang'
    | 'theme'
    | 'imageWidth'
    | 'imageType'
    | 'imageQuality'
    | 'chromeExecutable'
  >
>;

const defaultParams: DefaultParams = {
  hideMedia: false,
  hideThread: false,
  chromeExecutable: process.env.CHROME_BIN ?? '',
  lang: 'en',
  theme: 'dark',
  imageWidth: 550,
  imageType: 'webp',
  imageQuality: 100,
};

function getOEmbedHTML(params: TweetShotParams): Promise<string> {
  const oEmbedUrl = `https://publish.twitter.com/oembed?url=${params.tweetUrl}&maxwidth=${params.imageWidth}&theme=${params.theme}&omit_script=true&dnt=true`;
  return fetch(oEmbedUrl)
    .then((response) => response.json() as Promise<OEmbedResponse>)
    .then(
      ({ html }) => `
        <!DOCTYPE html>
        <html lang="en">
        <body>
          ${html}
          <script src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        </body>
        </html>
      `
    );
}

/**
 * Performs screenshot of a tweet
 *
 * @param {TweetShotParams} params The parameters for the screenshot
 *
 * @returns {Promise<sharp.OutputInfo>} The screenshot as a sharp.OutputInfo
 */
export async function tweetShot(
  params: TweetShotParams & { outFile: string }
): Promise<sharp.OutputInfo>;

/**
 * Performs screenshot of a tweet
 *
 * @param {TweetShotParams} params The parameters for the screenshot
 *
 * @returns {Promise<Buffer>} The screenshot as a Buffer
 */
export async function tweetShot(input: TweetShotParams): Promise<Buffer>;

/**
 * Performs screenshot of a tweet
 *
 * @param {TweetShotParams} params The parameters for the screenshot
 *
 * @returns {Promise<sharp.OutputInfo | Buffer>} The screenshot as a sharp.OutputInfo if params.outFile is specified, otherwise returns a Buffer
 */
export async function tweetShot(input: TweetShotParams): Promise<Buffer | sharp.OutputInfo> {
  const params: DefaultParams & TweetShotParams = {
    ...defaultParams,
    ...input,
  };

  try {
    if (!params.chromeExecutable) {
      throw new Error(
        'chromeExecutable is required, either set it in the environment variable CHROME_BIN or pass it as a parameter'
      );
    }

    if (!params.tweetUrl) {
      throw new Error('tweetUrl is required');
    }

    if (!params.tweetUrl.match(/^https:\/\/(twitter|x)\.com\/.+\/status\/[0-9]+$/)) {
      throw new Error('tweetUrl is invalid, it must be a valid tweet URL');
    }

    if (params.imageWidth > 550 || params.imageWidth < 220) {
      throw new Error('imageWidth must be between 220 and 550');
    }

    const oEmbedHtmlFileContent = await getOEmbedHTML(params);

    const browser = params.browser
      ? params.browser
      : await launch({
          executablePath: params.chromeExecutable,
          headless: true,
        });

    const page = await browser.newPage();
    await page.setViewport({ width: params.imageWidth, height: 2048 });
    await page.setContent(oEmbedHtmlFileContent, {
      waitUntil: 'networkidle0',
    });

    const screenshot: Uint8Array = await page.screenshot({
      type: params.imageType,
      quality: params.imageQuality,
      omitBackground: true,
      encoding: 'binary',
    });

    await page.close();
    await browser.close();

    if (params.outFile) {
      return sharp(screenshot).trim().toFile(params.outFile);
    }

    return sharp(screenshot).trim().toBuffer();
  } catch (e) {
    return Promise.reject(e);
  }
}
