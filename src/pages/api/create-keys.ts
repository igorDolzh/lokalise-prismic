import { LokaliseApi, Language } from "@lokalise/node-api";
import type { NextApiRequest, NextApiResponse } from "next";

export enum UserGroups {
  general = "[group]",
  reviewersOnly = "[reviewers-group]",
}

const teamName = "Pleo Team";
/**
 * Returns an object languages as key and value is the list of ids of the members for certain language
 */
async function getAssigneeIdObject(
  lokalise: LokaliseApi,
  languageList: string[],
  projectId: string
): Promise<{ [language: string]: number[] }> {
  const teams = await lokalise.teams().list();
  console.log("teams success", teams.items);
  const supportedTaskLanguagesParsed = languageList;
  const languages = await lokalise.languages().list({
    project_id: projectId,
  });
  const langaugeList = languages.items.map(
    ({ lang_iso: langISO }: { lang_iso: string }) => langISO
  );
  const team = teams.items.find(
    ({ name }: { name: string }) => name === teamName
  ); //Get Pleo Team. At the moment it is a single team, but it could be changed in the future

  if (team) {
    const userGroups = await lokalise.userGroups().list({
      team_id: team.team_id,
    });

    const assigneeIdObject: { [language: string]: number[] } = {};

    langaugeList.forEach((language: string) => {
      const userGroupsWithLanguage = userGroups.items.filter(
        (userGroupDetails) => {
          const languageListInPermissions =
            userGroupDetails.permissions.languages.map(
              ({ lang_iso: langISO }: { lang_iso: string }) => langISO
            );
          return (
            languageListInPermissions.includes(language) &&
            userGroupDetails.name.includes(UserGroups.general) //translators, not reviewers
          );
        }
      );
      const members: number[] = userGroupsWithLanguage.reduce(
        (acc: number[], userGroup: any) => {
          return [...acc, ...userGroup.members];
        },
        []
      );
      if (
        members.length > 0 &&
        supportedTaskLanguagesParsed.includes(language)
      ) {
        assigneeIdObject[language] = members;
      }
    });
    return assigneeIdObject;
  }
  return {};
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    //console.log("req.body", req.body);
    const body = req.body;

    const lokalise = new LokaliseApi({
      apiKey: body.token,
    });
    //await lokalise.keys().list({ project_id: body.projectId })
    const response = await lokalise.keys().create(
      {
        keys: body.keys,
      },
      { project_id: body.projectId }
    );

    //console.log("response", JSON.stringify(response));
    console.log("response?.items.length", response?.items.length);
    if (response?.items?.length > 0) {
      const assigneeIdObject = await getAssigneeIdObject(
        lokalise,
        body.languages,
        body.projectId
      );
      console.log("assigneeIdObject", JSON.stringify(assigneeIdObject));
      console.log(
        "response?.items?.map((item) => item.key_id)",
        JSON.stringify(response?.items?.map((item) => item.key_id))
      );
      for (const lang of body.languages) {
        const users = assigneeIdObject[lang];
        if (users) {
          const taskResponse = await lokalise.tasks().create(
            {
              title: `${body.taskTitle}[${new Date().getTime()}]`,
              description: body.taskDescription,
              keys: response?.items?.map((item) => item.key_id),
              languages: [
                {
                  language_iso: lang,
                  users: users,
                },
              ],
            },
            { project_id: body.projectId }
          );
          //console.log(taskResponse);
        }
      }
    }

    res.status(200).json({ response: response });
  } catch (e) {
    res.status(500).json({ response: e });
  }
}
