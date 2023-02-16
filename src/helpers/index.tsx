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
    {label: 'Dansk (da)', id: SupportedLanguage.DA},
    {label: 'Svenska (sv)', id: SupportedLanguage.SV},
    {label: 'English (en)', id: SupportedLanguage.EN},
    {label: 'Deutsch (de)', id: SupportedLanguage.DE},
    {label: 'Deutsch (Österreich) (de-AT)', id: SupportedLanguage.DE_AT},
    {label: 'Español (es)', id: SupportedLanguage.ES},
    {label: 'Français (fr)', id: SupportedLanguage.FR},
    {label: 'Français (Belgique) (fr-BE)', id: SupportedLanguage.FR_BE},
    {label: 'Suomi (fi)', id: SupportedLanguage.FI},
    {label: 'Nederlands (nl)', id: SupportedLanguage.NL},
    {label: 'Nederlands (België) (nl-BE)', id: SupportedLanguage.NL_BE},
    {label: 'Português (pt)', id: SupportedLanguage.PT},
    {label: 'Italiano (it)', id: SupportedLanguage.IT},
    {label: 'Norsk (no)', id: SupportedLanguage.NO},
]

export async function getTranslations(language: string, token: string, projectId: string) {
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
      };
      
    const response = await fetch(`/api/get-translations?language=${language}&token=${token}&projectId=${projectId}`, options)
     const data = await response.json()
     console.log('data',data)
     return data.response?.[0]?.translations
}

export const LOCALISE_PROJECT_ID = '302610005f102393819ad8.14734010'