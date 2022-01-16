class TeamCityReporter {
    escape(str) {
      if (!str) return ''

      return str
        .toString()
        .replace(/\x1B.*?m/g, '')
        .replace(/\|/g, '||')
        .replace(/\n/g, '|n')
        .replace(/\r/g, '|r')
        .replace(/\[/g, '|[')
        .replace(/\]/g, '|]')
        .replace(/\u0085/g, '|x')
        .replace(/\u2028/g, '|l')
        .replace(/\u2029/g, '|p')
        .replace(/'/g, "|'")
    }

    getTestName(test) {
      return this.escape(`${test.parent.title} * ${test.title}`)
    }

    onBegin(config, suite) {
      this.flowId = process.env.TEAMCITY_FLOWID || process.pid.toString()
      console.log(`##teamcity[testRetrySupport enabled='true' flowId='${this.flowId}']`)
    }

    onTestBegin(test) {
      const testName = this.getTestName(test)
      console.log(`##teamcity[testStarted name='${testName}' flowId='${this.flowId}']`)
    }

    onTestEnd(test, result) {
      const testName = this.getTestName(test)
      switch (result.status) {
        case 'skipped':
          console.log(`##teamcity[testIgnored name='${testName}' flowId='${this.flowId}']`)
          break
        case 'failed':
        case 'timedOut':
          console.log(
            `##teamcity[testFailed name='${testName}' message='${this.escape(
              result.error.stack,
            )}' description='${this.escape(result.error.stack)}' flowId='${this.flowId}']`,
          )
          if (this.artifactsFolder && result.attachments[0]) {
            const videoPath = `e2e/${result.attachments[0].path.split(this.artifactsFolder).pop()}`
            console.log(`##teamcity[testMetadata testName='${testName}' type='video' value='${videoPath}']`)
          }
          break
        case 'passed':
          break
      }
      console.log(
        `##teamcity[testFinished name='${testName}' duration='${this.escape(result.duration)}' flowId='${this.flowId}']`,
      )
    }
  }


  const createReporter = (config = {}) => {
    return class CustomReporter extends TeamCityReporter {
      constructor() {
        super()
        this.artifactsFolder = config.artifactsFolder
      }
    }
  }


  module.exports.createReporter = createReporter;