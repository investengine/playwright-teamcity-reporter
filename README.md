# playwright-teamcity-reporter

## About

Custom reporter to integrate Playwright test runner with TeamCity CI.

## Installation

```
npm i -D @investengine/playwright-teamcity-reporter
```

## Usage

Create a `reporter.js` file which should import `createReporter` function, which is used to create your custom reporter with options provided.

```
// reporter.js

import { createReporter } from '@investengine/playwright-teamcity-reporter'

const reporter = createReporter({
  // provide options here if necessary

  artifactsFolder: 'e2e/artifacts/'
})

export default reporter
```

Provide path to your reporter file in playwright.config.js:

```
// playwright.config.js

const config = {
  ...
  reporter: 'path/to/reporter.js'
};
```

See [Using Reporters in CI Playwright docs](https://playwright.dev/docs/test-reporters#reporters-on-ci) and [Custom Reporters Playwright docs](https://playwright.dev/docs/test-reporters#custom-reporters) for more info.

## List of options

- `artifactsFolder` [optional] - path to the artifacts folder. Should duplicate `outputDir` parameter in your `playwright.config.js`. Used to provide videofile metadata of failed tests to TeamCity.

## Feature requests

Feel free to provide feature requests via github issues. This reporter is just a very basic version which can be upgraded for different use-cases.
