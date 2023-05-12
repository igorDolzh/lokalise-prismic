import { join } from 'path'
import { readFileSync } from 'fs'
import handler from './create-keys'
import { LokaliseApi } from '@lokalise/node-api'
import nodeMocks from 'node-mocks-http'
import nock from 'nock'

const FILTER = 'X_3PDxEAACEATwxV'

const TOKEN = 'token'

const LOCALISE_PROJECT_ID = '302610005f102393819ad8.14734010'

describe('create keys', () => {
  // We create req and res mocks
  const req = nodeMocks.createRequest()
  const res = nodeMocks.createResponse()

  // We're using the same headers and we're mocking .status and .end function,
  // because we're going to see how many times they've called
  // and what they've called with
  beforeEach(() => {
    req.headers = { username: 'test', password: 'test123' }
    res.status = jest.fn(function () {
      return this
    })

    res.json = jest.fn(function () {
      return this
    })
    res.end = jest.fn()

    //jest.useFakeTimers()
  })

  // We need to reset mocks after every test so that we could reuse them in another
  afterEach(() => {
    jest.resetAllMocks()
    nock.restore()

    // jest.runOnlyPendingTimers()
    // jest.useRealTimers()
  })

  test('first test', async () => {
    const keys: { [key: string]: string } = {
      firstKey: 'firstKey',
      secondKey: 'secondKey',
    }
    const body: {
      keys: { [key: string]: string }
      token: string
      projectId: string
      taskTitle: string
      taskDescription: string
      languages: string[]
      filter: string
      tags: string
      isLokaliseTaskNeeded: boolean
    } = {
      keys: keys,
      token: TOKEN,
      projectId: LOCALISE_PROJECT_ID,
      taskTitle: '',
      taskDescription: '',
      languages: ['en'],
      filter: FILTER,
      tags: 'tags',
      isLokaliseTaskNeeded: false,
    }

    req.body = body

    const successReply = {
      result: 200,
      text: 'success',
    }

    const lokaliseUploadNock = nock('https://api.lokalise.com:443', {
      encodedQueryParams: true,
    })
      .post('/api2/projects/302610005f102393819ad8.14734010/files/upload', {
        data: Buffer.from(JSON.stringify(body.keys)).toString('base64'),
        filename: 'from-program.json',
        lang_iso: 'en',
        tags: body.tags.split(','),
        replace_modified: true,
        use_automations: true,
        convert_placeholders: false,
        apply_tm: true,
        detect_icu_plurals: false,
        tag_inserted_keys: true,
        tag_skipped_keys: true,
        tag_updated_keys: true,
      })
      .reply(200, { process: { status: 'finished' } })

    // Using async/await here to wait for the response
    await handler(req, res)

    expect(lokaliseUploadNock.isDone()).toBe(true)

    // And here we're checking our mocks that we created in beforeEach function
    expect(res.json).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith({ response: 'success' })
  })
})
