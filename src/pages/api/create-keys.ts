import { LokaliseApi, Language } from '@lokalise/node-api'
import type { NextApiRequest, NextApiResponse } from 'next'

import nodeMocks from 'node-mocks-http'

export enum UserGroups {
  general = '[group]',
  reviewersOnly = '[reviewers-group]',
}

const teamName = 'Pleo Team'
/**
 * Returns an object languages as key and value is the list of ids of the members for certain language
 */
async function getAssigneeIdObject(
  lokalise: LokaliseApi,
  languageList: string[],
  projectId: string,
): Promise<{ [language: string]: number[] }> {
  const teams = await lokalise.teams.list()
  const supportedTaskLanguagesParsed = languageList
  const languages = await lokalise.languages.list({
    project_id: projectId,
  })
  const langaugeList = languages.map(
    ({ lang_iso: langISO }: { lang_iso: string }) => langISO,
  )
  const team = teams.find(({ name }: { name: string }) => name === teamName) //Get Pleo Team. At the moment it is a single team, but it could be changed in the future
  if (team) {
    const userGroups = await lokalise.userGroups.list({
      team_id: team.team_id,
    })
    const assigneeIdObject: { [language: string]: number[] } = {}
    langaugeList.forEach((language: string) => {
      const userGroupsWithLanguage = userGroups.filter((userGroupDetails) => {
        const languageListInPermissions =
          userGroupDetails.permissions.languages.map(
            ({ lang_iso: langISO }: { lang_iso: string }) => langISO,
          )
        return (
          languageListInPermissions.includes(language) &&
          userGroupDetails.name.includes(UserGroups.general) //translators, not reviewers
        )
      })
      const members: number[] = userGroupsWithLanguage.reduce(
        (acc: number[], userGroup: any) => {
          return [...acc, ...userGroup.members]
        },
        [],
      )
      if (
        members.length > 0 &&
        supportedTaskLanguagesParsed.includes(language)
      ) {
        assigneeIdObject[language] = members
      }
    })
    return assigneeIdObject
  }
  return {}
}

async function onProcessFinished(
  req: NextApiRequest,
  res: NextApiResponse,
  lokalise: LokaliseApi,
) {
  const body = req.body

  if (Boolean(JSON.parse(body.isLokaliseTaskNeeded))) {
    let taskResponse

    const keysForTask = await lokalise.keys.list({
      filter_tags: body.filter,
      project_id: body.projectId,
    })

    if (keysForTask?.length === 0) {
      res.status(402)
      res.json({ response: 'Not keys found' })
      return
    }

    const assigneeIdObject = await getAssigneeIdObject(
      lokalise,
      body.languages,
      body.projectId,
    )

    if (Object.keys(assigneeIdObject).length === 0) {
      res.status(402)
      res.json({ response: 'Something wrong with assignees' })
      return
    }

    taskResponse = await lokalise.tasks.create(
      {
        title: body.taskTitle,
        description: body.taskDescription,
        keys: keysForTask?.map((item) => item.key_id),
        languages: Object.keys(assigneeIdObject).map((lang) => ({
          language_iso: lang,
          users: assigneeIdObject[lang],
        })),
      },
      { project_id: body.projectId },
    )

    res.status(200)
    res.json({ response: taskResponse })
  } else {
    res.status(200)
    res.json({ response: 'success' })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const body = req.body

    const lokalise = new LokaliseApi({
      apiKey: body.token,
    })

    let process = await lokalise.files.upload(body.projectId, {
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

    if (process.status === 'finished') {
      onProcessFinished(req, res, lokalise)
    } else {
      let inteval = await setInterval(async () => {
        if (process.status === 'finished') {
          clearInterval(inteval)
          onProcessFinished(req, res, lokalise)
        } else {
          //@ts-ignore
          process = await lokalise.queuedProcesses().get(process.process_id, {
            project_id: body.projectId,
          })
        }
      }, 1000)
    }
  } catch (e) {
    console.log(e)
    res.status(500)
    res.json({ response: e })
  }
}
