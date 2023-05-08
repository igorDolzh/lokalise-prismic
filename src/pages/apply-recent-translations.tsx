import React from 'react';
import { useForm } from 'react-hook-form';
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Form, Input, StyledMultiSelect } from '../styles/general'
import Button from '@mui/material/Button';

import {languageOptions, LOCALISE_PROJECT_ID} from '../helpers/index'

const locales = [
    {
        code: 'en-gb',
        urlCode: 'en',
        country: 'gb',
        countryName: 'United Kingdom',
        language: 'en',
        languageName: 'English',
        htmlLang: 'en-gb',
        default: true,
        isPreLaunch: false,
    },
    {
        code: 'da-dk',
        urlCode: 'da',
        country: 'dk',
        countryName: 'Danmark',
        language: 'da',
        languageName: 'Dansk',
        htmlLang: 'da-dk',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'de-de',
        urlCode: 'de',
        country: 'de',
        countryName: 'Deutschland',
        language: 'de',
        languageName: 'Deutsch',
        htmlLang: 'de-de',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'es-es',
        urlCode: 'es',
        country: 'es',
        countryName: 'España',
        language: 'es',
        languageName: 'Español',
        htmlLang: 'es-es',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'sv-se',
        urlCode: 'se',
        country: 'se',
        countryName: 'Sverige',
        language: 'sv',
        languageName: 'Svenska',
        htmlLang: 'sv-se',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'en-ie',
        urlCode: 'ie',
        country: 'ie',
        countryName: 'Ireland',
        language: 'en',
        languageName: 'English',
        htmlLang: 'en-ie',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'fi-fi',
        urlCode: 'fi',
        country: 'fi',
        countryName: 'Suomi',
        language: 'fi',
        languageName: 'Suomi',
        htmlLang: 'fi-fi',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'de-at',
        urlCode: 'at',
        country: 'at',
        countryName: 'Österreich',
        language: 'de',
        languageName: 'Deutsch',
        htmlLang: 'de-at',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'fr-be',
        urlCode: 'fr-be',
        country: 'be',
        countryName: 'Belgique',
        language: 'fr',
        languageName: 'Français',
        htmlLang: 'fr-be',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'nl-be',
        urlCode: 'nl-be',
        country: 'be',
        countryName: 'België',
        language: 'nl',
        languageName: 'Nederlands',
        htmlLang: 'nl-be',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'fr-fr',
        urlCode: 'fr',
        country: 'fr',
        countryName: 'France',
        language: 'fr',
        languageName: 'Français',
        htmlLang: 'fr-fr',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'nl-nl',
        urlCode: 'nl',
        country: 'nl',
        countryName: 'Nederland',
        language: 'nl',
        languageName: 'Nederlands',
        htmlLang: 'nl-nl',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'et-ee',
        urlCode: 'ee',
        country: 'ee',
        countryName: 'Eesti',
        language: 'en',
        languageName: 'English',
        htmlLang: 'en-ee',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'it-it',
        urlCode: 'it',
        country: 'it',
        countryName: 'Italia',
        language: 'it',
        languageName: 'Italiano',
        htmlLang: 'it-it',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'pt-pt',
        urlCode: 'pt',
        country: 'pt',
        countryName: 'Portugal',
        language: 'pt',
        languageName: 'Português',
        htmlLang: 'pt-pt',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'en-lu',
        urlCode: 'lu',
        country: 'lu',
        countryName: 'Luxembourg',
        language: 'en',
        languageName: 'English',
        htmlLang: 'en-lu',
        default: false,
        isPreLaunch: false,
    },
    {
        code: 'no-no',
        urlCode: 'no',
        country: 'no',
        countryName: 'Norge',
        language: 'no',
        languageName: 'Norsk',
        htmlLang: 'no-no',
        default: false,
        isPreLaunch: false,
    },
]


async function getTranslations(language: string, token: string, projectId: string) {
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

function update(obj, val, newVal) {
  for (var i in obj) {
    if (typeof obj[i] == "object") {
      update(obj[i], val, newVal);
    } else if (obj[i] === val) {
      obj[i] = newVal;
    }
  }
  return obj;
}

function processFile(rawdata: string, vocab: any, filename: string, isCreate: boolean, locale: string) {
  const jsonFile = JSON.parse(rawdata);
  const forbiddenKeys = ["id", "grouplang", "program_name", "licence_type"];
  let isUpdated = false;

  const isLangGB = jsonFile.lang === "en-gb";

  function iterateKeys(obj, original) {
    const keys = Object.keys(obj);
    keys.forEach((key) => {
      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        iterateKeys(value, original);
        return;
      }
      if (typeof value === "string" || value instanceof String) {
        const isCapitalLetter = value.match(/[A-Z]/);
        const isLink = value.match(/:\/\//);
        const isKeyForbidden = forbiddenKeys.includes(key);
        const isKeyContainText = key.includes("text");
        if (
          (Boolean(isCapitalLetter) || isKeyContainText) &&
          !isLink &&
          !isKeyForbidden
        ) {
          if (vocab[value.trim()]) {
            update(original, value, vocab[value.trim()]);
            isUpdated = true
          }
        }
      }
    });
  }

    iterateKeys(jsonFile, jsonFile);
    jsonFile.lang = locale;
    const outputFile =
        isCreate
        ? `translate_${jsonFile.grouplang}_${locale}.json`
        : filename;

    if (isUpdated) {
        return ({
            filename: outputFile,
            data: JSON.stringify(jsonFile)
        })
    } else {
        return null
    }
}

function getVocab(vocabParsed: string, enMessagesParsed: string) {
  if (!enMessagesParsed) {
    return vocabParsed;
  }

  const vocabParsedWithEn = {};
  Object.keys(vocabParsed).forEach((key) => {
    vocabParsedWithEn[enMessagesParsed[key]] = vocabParsed[key];
  });

  return vocabParsedWithEn;
}


async function handleFile(file: any, filter: string, langauges: string[], lokaliseToken: string) {
    
    console.log('Hello', file.name)
    const zip = await JSZip.loadAsync(file)
    const fileNames = Object.keys(zip.files)
    const filterArray = filter.split(',')
    const languagesArray = langauges
    const enMessages = await getTranslations("en", lokaliseToken, LOCALISE_PROJECT_ID)
    var zipWrite = new JSZip();
    const infoForFiles = [] as any
    console.log("fileNames", fileNames)
    // for valuable info
    for (const file of fileNames) {
        const data = await zip.file(file)?.async("string")
    
        if (data) {
            const parsedData = JSON.parse(data)
            infoForFiles.push({
                groupId: parsedData.grouplang,
                locale: parsedData.lang,
                fullFileName: file
            })
        }
      }
    console.log("infoForFiles", infoForFiles)
    for (const lang of languagesArray) {
        const prismicLocale = locales.find(({ language }) => language === lang)?.code
        const translations = await getTranslations(lang, lokaliseToken, LOCALISE_PROJECT_ID)
        const vocab = getVocab(translations, enMessages);
        console.log('vocab', vocab)
        for (const file of fileNames) {
            const fileName = file.split('$')[0]
            if (filterArray.includes(fileName) || !filter) {
                console.log('infoForFiles', infoForFiles)
                console.log('file', file)
                const fileGroupId = infoForFiles.find(({ fullFileName }: { fullFileName: any }) => fullFileName === file)?.groupId
                console.log('fileGroupId', fileGroupId)
                const translatedFileName = infoForFiles
                                            .find(({groupId, locale}: {groupId : any, locale: any}) => fileGroupId === groupId && prismicLocale === locale)?.fullFileName
                console.log('translatedFileName', translatedFileName, 'prismicLocale', prismicLocale)
                const isCreate = !translatedFileName
                const currentFileName = translatedFileName ?? file
                const data = await zip.file(file ?? currentFileName)?.async("string")
                
            
                if (data && prismicLocale) {
                    const result = processFile(data, vocab, currentFileName, isCreate, prismicLocale)
                    console.log("result", result)
                    if (result) {
                        console.log("write file")
                        zipWrite.file(result.filename, result.data)
                    }
                    //console.log(file)
                }
            }
          }
    }

    zipWrite.generateAsync({type:"blob"}).then(function (blob) {
        console.log("saveAs")
        saveAs(blob, "import.zip");
    }, function (err) {
        console.log("Error")
    });
}


export default function ApplyRecentTranslations() {
  const defaultValues = { languages: [], prismicZipFile: "", filter: '', lokaliseTaskTitle: "", lokaliseTaskDescription: "", lokaliseToken: "" };
    const form = useForm({defaultValues, shouldUseNativeValidation: true});
    const {
      register,
      handleSubmit,
      watch,
      formState,
      setValue,
      trigger
    } = form
    const onSubmit = (data: any) => {
        const { prismicZipFile, filter, languages, lokaliseToken } = form.getValues()
        for (var i = 0; i < prismicZipFile.length; i++) {
            handleFile(prismicZipFile[i], filter, ['de', 'es', 'sv', 'da', 'nl', 'fr', 'fi', 'it', 'pt', 'no'], lokaliseToken);
        }
      }

      React.useEffect(() => {
        const lokaliseToken = form.getValues().lokaliseToken
        if (lokaliseToken) {
            localStorage.setItem('lokaliseToken', lokaliseToken)
        }
      }, [watch('lokaliseToken')])
    
      React.useEffect(() => {
        setValue('lokaliseToken', localStorage.getItem('lokaliseToken') ?? '') 
      },[])

      React.useEffect(() => console.log(formState))
      

    return (
        /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
        <Form onSubmit={handleSubmit(onSubmit)}>
               <StyledMultiSelect
                    options={languageOptions}
                    selected={watch('languages')}
                    onSelectedChanged={(selected: any) => setValue('languages', selected)}
                    {...register('languages', { required: true })}
                />
    
          <Input defaultValue="" placeholder="Filter" type="text" {...register('filter', { required: true })} />

          <Input defaultValue="" placeholder="Lokalise Token" type="password" {...register('lokaliseToken', { required: true })} />
    
          <Input type="file" {...register('prismicZipFile', { required: true })} />
          {/* errors will return when field validation fails  */}
    
          <Button type="submit" variant="outlined">Submit</Button>
        </Form>
      );
}