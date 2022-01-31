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
        const failedStep = result.steps.find(step => step.category === 'test.step' && step.error)
        if (failedStep && failedStep.title) {
          let stepName = failedStep.title
          if (failedStep.steps.length) {
            const subStep = failedStep.steps.find(step => step.category === 'test.step' && step.error)
            if (subStep) stepName = `${stepName} > ${subStep.title}`
          }
          console.log(`##teamcity[testMetadata testName='${testName}' name='Failed at step' value='${stepName}']`)
        }
        if (this.artifactsFolder && result.attachments) {
          result.attachments.forEach(attachment => {
            let contentType;
            if (attachment.contentType.includes('video')) contentType = 'video'
            if (attachment.contentType.includes('image')) contentType = 'image'
            const attachmentPath = `e2e/${attachment.path.split(this.artifactsFolder).pop()}`
            console.log(`##teamcity[testMetadata testName='${testName}' type='${contentType}' value='${attachmentPath}']`)
          })
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
