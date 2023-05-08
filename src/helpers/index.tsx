export enum SupportedLanguage {
  DA = 'da',
  SV = 'sv',
  EN = 'en',
  DE = 'de',
  DE_AT = 'de-AT',
  ES = 'es',
  FR = 'fr',
  FR_BE = 'fr-BE',
  FI = 'fi',
  NL = 'nl',
  NL_BE = 'nl-BE',
  PT = 'pt',
  IT = 'it',
  NO = 'no',
}

export const languageOptions = [
  { label: 'Dansk (da)', id: SupportedLanguage.DA },
  { label: 'Svenska (sv)', id: SupportedLanguage.SV },
  { label: 'English (en)', id: SupportedLanguage.EN },
  { label: 'Deutsch (de)', id: SupportedLanguage.DE },
  { label: 'Deutsch (Österreich) (de-AT)', id: SupportedLanguage.DE_AT },
  { label: 'Español (es)', id: SupportedLanguage.ES },
  { label: 'Français (fr)', id: SupportedLanguage.FR },
  { label: 'Français (Belgique) (fr-BE)', id: SupportedLanguage.FR_BE },
  { label: 'Suomi (fi)', id: SupportedLanguage.FI },
  { label: 'Nederlands (nl)', id: SupportedLanguage.NL },
  { label: 'Nederlands (België) (nl-BE)', id: SupportedLanguage.NL_BE },
  { label: 'Português (pt)', id: SupportedLanguage.PT },
  { label: 'Italiano (it)', id: SupportedLanguage.IT },
  { label: 'Norsk (no)', id: SupportedLanguage.NO },
]

export async function getTranslations(
  language: string,
  token: string,
  projectId: string,
) {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  }

  const response = await fetch(
    `/api/get-translations?language=${language}&token=${token}&projectId=${projectId}`,
    options,
  )
  const data = await response.json()
  console.log('data', data)
  return data.response?.[0]?.translations
}

export const LOCALISE_PROJECT_ID = '302610005f102393819ad8.14734010'

export function getMessagesWithTagsFromArchive(
  rawdata: string,
  initialTag: string,
) {
  const messages: { [key: string]: string[] } = {}
  const jsonFile = JSON.parse(rawdata)
  const forbiddenKeys = ['id', 'grouplang', 'program_name', 'licence_type']
  const tags: string[] = [...jsonFile.tags, initialTag]
  if (jsonFile.type) {
    tags.push(jsonFile.type)
  }
  if (jsonFile.uid) {
    tags.push(jsonFile.uid)
  } else if (
    jsonFile.prismic_title &&
    (typeof jsonFile.prismic_title === 'string' ||
      jsonFile.prismic_title instanceof String)
  ) {
    tags.push(jsonFile.prismic_title.slice(0, 25))
  } else if (
    jsonFile.title &&
    (typeof jsonFile.title === 'string' || jsonFile.title instanceof String)
  ) {
    tags.push(jsonFile.title.slice(0, 25))
  } else if (
    jsonFile.category &&
    (typeof jsonFile.category === 'string' ||
      jsonFile.category instanceof String)
  ) {
    tags.push(jsonFile.category.slice(0, 25))
  } else if (
    jsonFile.name &&
    (typeof jsonFile.name === 'string' || jsonFile.name instanceof String)
  ) {
    tags.push(jsonFile.name.slice(0, 25))
  } else if (
    jsonFile.platform &&
    (typeof jsonFile.platform === 'string' ||
      jsonFile.platform instanceof String)
  ) {
    tags.push(jsonFile.platform.slice(0, 25))
  }

  const isLangGB = jsonFile.lang === 'en-gb'

  function iterateKeys(obj: any, k: any) {
    const keys = Object.keys(obj)
    keys.forEach((key) => {
      const value = obj[key]
      if (typeof value === 'object' && value !== null) {
        iterateKeys(value, ++k)
        return
      }
      if (typeof value === 'string' || value instanceof String) {
        const isCapitalLetter = value.match(/[A-Z]/)
        const isLink = value.match(/:\/\//)
        const isKeyForbidden = forbiddenKeys.includes(key)
        const isKeyContainText = key.includes('text')
        if (
          (Boolean(isCapitalLetter) || isKeyContainText) &&
          !isLink &&
          !isKeyForbidden &&
          value
        ) {
          if (!messages[value.trim()]) {
            messages[value.trim()] = tags
          } else {
            messages[value.trim()] = [
              ...new Set([...messages[value.trim()], ...tags]),
            ]
          }
        }
      }
    })
  }

  if (isLangGB) {
    iterateKeys(jsonFile, 0)
  }

  return messages
}
