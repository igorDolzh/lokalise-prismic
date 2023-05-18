import { join } from 'path'
import { readFileSync } from 'fs'
import handler from './create-keys'
import { LokaliseApi } from '@lokalise/node-api'
import nodeMocks from 'node-mocks-http'
import nock from 'nock'
import { waitFor } from '@testing-library/dom'

const FILTER = 'X_3PDxEAACEATwxV'

const TOKEN = 'token'

const LOCALISE_PROJECT_ID = '302610005f102393819ad8.14734010'

const MOCK_KEYS_WITHOUT_TRANSLATION = {
  project_id: '302610005f102393819ad8.14734010',
  keys: [
    {
      key_id: 316941632,
      created_at: '2023-05-04 12:26:25 (Etc/UTC)',
      created_at_timestamp: 1683203185,
      key_name: {
        ios: 'Automatically charged from your bank account',
        android: 'Automatically charged from your bank account',
        web: 'Automatically charged from your bank account',
        other: 'Automatically charged from your bank account',
      },
      filenames: {
        ios: '',
        android: '',
        web: '/home/runner/work/product-web/product-web/app/locales/%LANG_ISO%/messages.json',
        other: '',
      },
      description: 'https://github.com/pleo-io/product-web/pull/11286',
      platforms: ['web'],
      tags: ['author-macko911', 'pr-11286', 'sha-e895a08f'],
      translations: [
        {
          translation_id: 2551726069,
          segment_number: 1,
          key_id: 316941632,
          language_iso: 'en',
          translation: 'Automatically charged from your bank account',
          modified_by: 121609,
          modified_by_email: 'localise-api@pleo.io',
          modified_at: '2023-05-04 12:26:25 (Etc/UTC)',
          modified_at_timestamp: 1683203185,
          is_reviewed: false,
          reviewed_by: 0,
          is_unverified: false,
          is_fuzzy: false,
          words: 6,
          custom_translation_statuses: [],
          task_id: null,
        },
        {
          translation_id: 2551726070,
          segment_number: 1,
          key_id: 316941632,
          language_iso: 'de',
          translation: '',
          modified_by: 121609,
          modified_by_email: 'localise-api@pleo.io',
          modified_at: '2023-05-04 12:26:25 (Etc/UTC)',
          modified_at_timestamp: 1683203185,
          is_reviewed: false,
          reviewed_by: 0,
          is_unverified: true,
          is_fuzzy: true,
          words: 0,
          custom_translation_statuses: [],
          task_id: 1445545,
        },
      ],
      is_plural: false,
      plural_name: '',
      is_hidden: false,
      is_archived: false,
      context: '',
      base_words: 6,
      char_limit: 0,
      custom_attributes: '',
      modified_at: '2023-05-04 12:26:40 (Etc/UTC)',
      modified_at_timestamp: 1683203200,
      translations_modified_at: '2023-05-04 12:26:25 (Etc/UTC)',
      translations_modified_at_timestamp: 1683203185,
    },
  ],
}

const MOCK_LANGUAGES = {
  project_id: '302610005f102393819ad8.14734010',
  languages: [
    {
      lang_id: 1,
      lang_iso: 'en',
      lang_name: 'English',
      is_rtl: true,
      plural_forms: [],
    },
    {
      lang_id: 2,
      lang_iso: 'da',
      lang_name: 'Danish',
      is_rtl: true,
      plural_forms: [],
    },
    {
      lang_id: 3,
      lang_iso: 'es',
      lang_name: 'Spanish',
      is_rtl: true,
      plural_forms: [],
    },
  ],
}

const MOCK_TEAMS = {
  teams: [
    {
      team_id: 18821,
      name: 'Pleo Team',
      created_at: '2018-12-31 12:00:00 (Etc/UTC)',
      created_at_timestamp: 1546257600,
      plan: 'Essential',
      quota_usage: {
        users: 14,
        keys: 8125,
        projects: 4,
        mau: 119337,
      },
      quota_allowed: {
        users: 40,
        keys: 10000,
        projects: 99999999,
        mau: 200000,
      },
    },
  ],
}

const MOCK_USER_GROUPS = {
  team_id: 18821,
  user_groups: [
    {
      group_id: 50031,
      name: 'Proofreaders[da] [group]',
      permissions: {
        is_admin: false,
        is_reviewer: true,
        languages: [
          {
            lang_id: 640,
            lang_iso: 'da',
            lang_name: 'Danish',
            is_writable: 1,
          },
        ],
        admin_rights: {},
      },
      created_at: '2019-01-08 09:10:46 (Etc/UTC)',
      created_at_timestamp: 1546257600,
      team_id: 18821,
      projects: ['598901215bexxx43dcba74.xxx'],
      members: [22212],
    },
    {
      group_id: 50032,
      name: 'Proofreaders[es] [group]',
      permissions: {
        is_admin: false,
        is_reviewer: true,
        languages: [
          {
            lang_id: 640,
            lang_iso: 'es',
            lang_name: 'Spanish',
            is_writable: 1,
          },
        ],
        admin_rights: {},
      },
      created_at: '2019-01-08 09:10:46 (Etc/UTC)',
      created_at_timestamp: 1546257600,
      team_id: 18821,
      projects: ['598901215bexxx43dcba74.xxx'],
      members: [22212],
    },
  ],
}

const MOCK_TASK_RESPONSE = {
  project_id: '302610005f102393819ad8.14734010',
  task: {
    task_id: 55392,
    title: 'Title',
    description: 'Description',
    status: 'created',
    progress: 0,
    can_be_parent: true,
    task_type: 'translation',
    due_date: '2024-12-31 12:00:00 (Etc/UTC)',
    due_date_timestamp: 1546257600,
    keys_count: 3,
    words_count: 91,
    created_at: '2021-12-31 12:00:00 (Etc/UTC)',
    created_at_timestamp: 1640944800,
    created_by: 420,
    created_by_email: 'manager@yourcompany.com',
    languages: [
      {
        language_iso: 'es',
        users: [
          {
            user_id: 22212,
            email: 'jdoe@mycompany.com',
            fullname: 'John Doe',
          },
        ],
        groups: {},
        keys: [11212, 11241, 11245],
        status: 'created',
        progress: 0,
        initial_tm_leverage: {
          '0%+': 0,
          '60%+': 0,
          '75%+': 0,
          '95%+': 0,
          '100%': 0,
        },
        keys_count: 3,
        words_count: 91,
        completed_at: null,
        completed_at_timestamp: null,
        completed_by: null,
        completed_by_email: null,
      },
      {
        language_iso: 'da',
        users: {},
        groups: {},
        keys: [11212, 11241, 11245],
        status: 'in progress',
        progress: 0,
        initial_tm_leverage: {
          '0%+': 0,
          '60%+': 0,
          '75%+': 0,
          '95%+': 0,
          '100%': 0,
        },
        keys_count: 3,
        words_count: 91,
        completed_at: null,
        completed_at_timestamp: null,
        completed_by: null,
        completed_by_email: null,
      },
    ],
    source_language_iso: 'en',
    auto_close_languages: true,
    auto_close_task: true,
    auto_close_items: true,
    completed_at: null,
    completed_at_timestamp: null,
    completed_by: null,
    completed_by_email: null,
    custom_translation_status_ids: [77, 85, 86],
  },
}

describe('create keys', () => {
  // We create req and res mocks
  const req = nodeMocks.createRequest()
  const res = nodeMocks.createResponse()

  beforeEach(() => {
    req.headers = { username: 'test', password: 'test123' }
    res.status = jest.fn(function () {
      return this
    })

    res.json = jest.fn(function () {
      return this
    })
    res.end = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  test('send keys without creating a task', async () => {
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
    expect(res.status).toBeCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ response: 'success' })
  })

  test('send keys with creating a task', async () => {
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
      taskTitle: 'Title',
      taskDescription: 'Description',
      languages: ['es', 'da'],
      filter: FILTER,
      tags: 'tags',
      isLokaliseTaskNeeded: true,
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
        apply_tm: true,
        detect_icu_plurals: false,
        tag_inserted_keys: true,
        tag_skipped_keys: true,
        tag_updated_keys: true,
      })
      .reply(200, { process: { status: 'finished' } })

    const lokaliseGetKeys = nock('https://api.lokalise.com:443')
      .get(
        `/api2/projects/302610005f102393819ad8.14734010/keys/?filter_tags=${body.filter}`,
      )
      .reply(200, MOCK_KEYS_WITHOUT_TRANSLATION)

    const lokaliseTeams = nock('https://api.lokalise.com:443')
      .get(`/api2/teams`)
      .reply(200, MOCK_TEAMS)

    const lokaliseLanguages = nock('https://api.lokalise.com:443')
      .get(`/api2/projects/302610005f102393819ad8.14734010/languages/`)
      .reply(200, MOCK_LANGUAGES)

    const lokaliseUserGroups = nock('https://api.lokalise.com:443')
      .get(`/api2/teams/18821/groups/`)
      .reply(200, MOCK_USER_GROUPS)

    const lokaliseCreateTasks = nock('https://api.lokalise.com:443')
      .post(`/api2/projects/302610005f102393819ad8.14734010/tasks/`, {
        title: body.taskTitle,
        description: body.taskDescription,
        keys: MOCK_KEYS_WITHOUT_TRANSLATION.keys.map((item) => item.key_id),
        languages: [
          {
            language_iso: 'da',
            users: [22212],
          },
          {
            language_iso: 'es',
            users: [22212],
          },
        ],
      })
      .reply(200, MOCK_TASK_RESPONSE)

    // Using async/await here to wait for the response
    await handler(req, res)

    await waitFor(() => {
      expect(lokaliseUploadNock.isDone()).toBe(true)
      expect(lokaliseGetKeys.isDone()).toBe(true)
      expect(lokaliseTeams.isDone()).toBe(true)
      expect(lokaliseLanguages.isDone()).toBe(true)
      expect(lokaliseUserGroups.isDone()).toBe(true)
      expect(lokaliseCreateTasks.isDone()).toBe(true)

      // And here we're checking our mocks that we created in beforeEach function
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.status).toBeCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        response: MOCK_TASK_RESPONSE.task,
      })
    })
  })

  test('send an error that no keys found for task', async () => {
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
      taskTitle: 'Title',
      taskDescription: 'Description',
      languages: ['es', 'da'],
      filter: FILTER,
      tags: 'tags',
      isLokaliseTaskNeeded: true,
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
        apply_tm: true,
        detect_icu_plurals: false,
        tag_inserted_keys: true,
        tag_skipped_keys: true,
        tag_updated_keys: true,
      })
      .reply(200, { process: { status: 'finished' } })

    const lokaliseGetKeys = nock('https://api.lokalise.com:443')
      .get(
        `/api2/projects/302610005f102393819ad8.14734010/keys/?filter_tags=${body.filter}`,
      )
      .reply(200, { project_id: '302610005f102393819ad8.14734010', keys: [] })

    const lokaliseTeams = nock('https://api.lokalise.com:443')
      .get(`/api2/teams`)
      .reply(200, MOCK_TEAMS)

    const lokaliseLanguages = nock('https://api.lokalise.com:443')
      .get(`/api2/projects/302610005f102393819ad8.14734010/languages/`)
      .reply(200, MOCK_LANGUAGES)

    const lokaliseUserGroups = nock('https://api.lokalise.com:443')
      .get(`/api2/teams/18821/groups/`)
      .reply(200, MOCK_USER_GROUPS)

    const lokaliseCreateTasks = nock('https://api.lokalise.com:443')
      .post(`/api2/projects/302610005f102393819ad8.14734010/tasks/`, {
        title: body.taskTitle,
        description: body.taskDescription,
        keys: MOCK_KEYS_WITHOUT_TRANSLATION.keys.map((item) => item.key_id),
        languages: [
          {
            language_iso: 'da',
            users: [22212],
          },
          {
            language_iso: 'es',
            users: [22212],
          },
        ],
      })
      .reply(200, MOCK_TASK_RESPONSE)

    // Using async/await here to wait for the response
    await handler(req, res)

    await waitFor(() => {
      expect(lokaliseUploadNock.isDone()).toBe(true)
      expect(lokaliseGetKeys.isDone()).toBe(true)
      expect(lokaliseTeams.isDone()).toBe(false)
      expect(lokaliseLanguages.isDone()).toBe(false)
      expect(lokaliseUserGroups.isDone()).toBe(false)
      expect(lokaliseCreateTasks.isDone()).toBe(false)

      // And here we're checking our mocks that we created in beforeEach function
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.status).toBeCalledWith(402)
      expect(res.json).toHaveBeenCalledWith({
        response: 'Not keys found',
      })
    })
  })

  test('send an error that something wrong with assignees', async () => {
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
      taskTitle: 'Title',
      taskDescription: 'Description',
      languages: ['es', 'da'],
      filter: FILTER,
      tags: 'tags',
      isLokaliseTaskNeeded: true,
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
        apply_tm: true,
        detect_icu_plurals: false,
        tag_inserted_keys: true,
        tag_skipped_keys: true,
        tag_updated_keys: true,
      })
      .reply(200, { process: { status: 'finished' } })

    const lokaliseGetKeys = nock('https://api.lokalise.com:443')
      .get(
        `/api2/projects/302610005f102393819ad8.14734010/keys/?filter_tags=${body.filter}`,
      )
      .reply(200, MOCK_KEYS_WITHOUT_TRANSLATION)

    const lokaliseTeams = nock('https://api.lokalise.com:443')
      .get(`/api2/teams`)
      .reply(200, {
        teams: [
          {
            team_id: 18821,
            name: 'Another Team',
            created_at: '2018-12-31 12:00:00 (Etc/UTC)',
            created_at_timestamp: 1546257600,
            plan: 'Essential',
            quota_usage: {
              users: 14,
              keys: 8125,
              projects: 4,
              mau: 119337,
            },
            quota_allowed: {
              users: 40,
              keys: 10000,
              projects: 99999999,
              mau: 200000,
            },
          },
        ],
      })

    const lokaliseLanguages = nock('https://api.lokalise.com:443')
      .get(`/api2/projects/302610005f102393819ad8.14734010/languages/`)
      .reply(200, MOCK_LANGUAGES)

    const lokaliseUserGroups = nock('https://api.lokalise.com:443')
      .get(`/api2/teams/18821/groups/`)
      .reply(200, MOCK_USER_GROUPS)

    const lokaliseCreateTasks = nock('https://api.lokalise.com:443')
      .post(`/api2/projects/302610005f102393819ad8.14734010/tasks/`, {
        title: body.taskTitle,
        description: body.taskDescription,
        keys: MOCK_KEYS_WITHOUT_TRANSLATION.keys.map((item) => item.key_id),
        languages: [
          {
            language_iso: 'da',
            users: [22212],
          },
          {
            language_iso: 'es',
            users: [22212],
          },
        ],
      })
      .reply(200, MOCK_TASK_RESPONSE)

    // Using async/await here to wait for the response
    await handler(req, res)

    await waitFor(() => {
      expect(lokaliseUploadNock.isDone()).toBe(true)
      expect(lokaliseGetKeys.isDone()).toBe(true)
      expect(lokaliseTeams.isDone()).toBe(true)
      expect(lokaliseLanguages.isDone()).toBe(true)
      expect(lokaliseUserGroups.isDone()).toBe(false)
      expect(lokaliseCreateTasks.isDone()).toBe(false)

      // And here we're checking our mocks that we created in beforeEach function
      expect(res.json).toHaveBeenCalledTimes(1)
      expect(res.status).toBeCalledWith(402)
      expect(res.json).toHaveBeenCalledWith({
        response: 'Something wrong with assignees',
      })
    })
  })
})
