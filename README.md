# @deegeemee/tweetshot

A Node.js library to take screenshots of tweets

## Installation

```bash
npm install @deegeemee/tweetshot
```

## Usage

```ts
import { tweetShot } from '@deegeemee/tweetshot';

const tweetUrl = 'https://twitter.com/deegeemee/status/1682087529612360704';

tweetShot({ tweetUrl })
  .then((buffer) => {
    // Buffer is a Buffer
  ]);
```

Or if you want to save the screenshot to a file:

```ts
import { tweetShot } from '@deegeemee/tweetshot';

const tweetUrl = 'https://twitter.com/deegeemee/status/1682087529612360704';

tweetShot({ tweetUrl, outFile: '/path/to/output.webp' });
  .then((output) => {
    // output is a sharp.OutputInfo
  });
```

## API

### tweetShot(params: TweetShotParams)

Performs screenshot of a tweet

#### Parameters

| Name             | Type    | Description                                                                                                           | Default                         |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| tweetUrl         | string  | Tweet URL to screenshot                                                                                               | N/A                             |
| outFile          | string  | File to save the screenshot to.                                                                                       | N/A                             |
| browser          | Browser | Browser to use for screenshotting.                                                                                    | N/A                             |
| chromeExecutable | string  | Path to the Chrome executable.                                                                                        | CHROME_BIN environment variable |
| hideMedia        | boolean | Hides the media in the tweet.                                                                                         | false                           |
| hideThread       | boolean | Hides the thread in the tweet.                                                                                        | false                           |
| lang             | string  | Language to use. See [supported languages](https://developer.x.com/en/docs/twitter-for-websites/supported-languages). | 'en'                            |
| theme            | string  | The theme of the tweet.                                                                                               | 'dark'                          |
| imageWidth       | number  | Width of the image to screenshot. Must be 220-550                                                                     | 550                             |
| imageType        | string  | Image type to use. Can be `'webp' \| 'jpeg' \| 'png'`                                                                 | 'webp'                          |
| imageQuality     | number  | Image quality to use. Value 0 - 100, not applicable for `'png'`                                                       | 100                             |

# npm scripts

`npm run build` - Builds the library  
`npm run test` - Runs the tests  
`npm run test:watch` - Runs the tests in watch mode  
`npm run lint` - Runs the linter
