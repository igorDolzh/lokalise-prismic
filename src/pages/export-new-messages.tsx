import React from 'react';
import { useForm, useController, Controller } from 'react-hook-form';

import styled from 'styled-components';
import JSZip from 'jszip'
import MultiSelect from "@khanacademy/react-multi-select";
import { useLocalStorage} from '../helpers/useLocalStorage'

import {languageOptions} from '../helpers/index'

  
  const Form = styled.form`
      display: flex;
      flex-direction: column;
      max-width: 400px;
  `
  
  const Input = styled.input`
      padding: 10px;
      border-radius: 10px;
      margin: 10px;
  `

const messages = {}
function processFile(rawdata: string, initialTag: string) {
    const jsonFile = JSON.parse(rawdata);
    const forbiddenKeys = ['id', 'grouplang', 'program_name', 'licence_type']
    const tags = [...jsonFile.tags, initialTag]
    if (jsonFile.type) {
        tags.push(jsonFile.type)
    }
    if (jsonFile.uid) {
        tags.push(jsonFile.uid)
    } else if (jsonFile.prismic_title && (typeof jsonFile.prismic_title === 'string' || jsonFile.prismic_title instanceof String)) {
        tags.push(jsonFile.prismic_title.slice(0, 25))
    } else if (jsonFile.title && (typeof jsonFile.title === 'string' || jsonFile.title instanceof String) ) {
        tags.push(jsonFile.title.slice(0, 25))
    } else if (jsonFile.category && (typeof jsonFile.category === 'string' || jsonFile.category instanceof String)) {
        tags.push(jsonFile.category.slice(0, 25))
    } else if (jsonFile.name && (typeof jsonFile.name === 'string' || jsonFile.name instanceof String)) {
        tags.push(jsonFile.name.slice(0, 25))
    } else if (jsonFile.platform && (typeof jsonFile.platform === 'string' || jsonFile.platform instanceof String)) {
        tags.push(jsonFile.platform.slice(0, 25))
    }

    
    const isLangGB = jsonFile.lang === "en-gb"

    
    function iterateKeys(obj: any, k: any) {
        const keys = Object.keys(obj)
        keys.forEach((key) => {
            const value = obj[key]
            if (typeof value === 'object' &&
            value !== null) {
                iterateKeys(value, ++k)
                return
            }
            if ((typeof value === 'string' || value instanceof String)) {
                const isCapitalLetter = value.match(/[A-Z]/)
                const isLink = value.match(/:\/\//)
                const isKeyForbidden = forbiddenKeys.includes(key)
                const isKeyContainText = key.includes("text")
                if ((Boolean(isCapitalLetter) || isKeyContainText) && !isLink && !isKeyForbidden && value) {
                    if (!messages[value.trim()]) {
                        messages[value.trim()] = tags
                    } else {
                        messages[value.trim()] = [...new Set([...messages[value.trim()], ...tags])]
                    }                    
                }
            }
        })
    }
    
    if (isLangGB) {
        iterateKeys(jsonFile, 0)
    }
}
async function sendToLokalise(data: any, lokaliseTaskTitle: string, lokaliseTaskDescription: string, lokaliseToken: string, languages: string) {
    const messages = Object.keys(data)
    const KEYS_PER_REQUEST = 500 // The amount of keys in one request
    const LOCALISE_PROJECT_ID = '302610005f102393819ad8.14734010'
    const timeTag = `time-${new Date().getTime()}`

const keys = messages.filter((message) => Boolean(message)).map((message) => ({
    key_name: message,
    tags: [...data[message], timeTag],
    platforms: [
        "web"
    ],
    translations: [
        {
            language_iso: "en",
            translation: message
        }
    ]
}))

async function createKeys(keys: any) {
    const options = {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
            keys: keys,
            token: lokaliseToken,
            projectId: LOCALISE_PROJECT_ID,
            taskTitle: lokaliseTaskTitle,
            taskDescription: lokaliseTaskDescription,
            languages: languages.split(',')
        })
      };
      
    const response = await fetch(`/api/create-keys`, options)
     const data = await response.json()
     console.log(data)


}


async function pushNewKeys() {
    const steps = Math.ceil(keys.length / KEYS_PER_REQUEST + 1)
    for (let i=0;i<steps;i++) {
        await createKeys(keys.slice(i*KEYS_PER_REQUEST, (i+1)*KEYS_PER_REQUEST))
        console.log(`New keys successfully pushed! ${i}/${steps}`)
    }
}

// async function updateTagsForExisted() {
//     const listOfTheKeys = await api.keys.list(LOCALISE_PROJECT_ID, {limit: 5000})
//     const keysForUpdate = listOfTheKeys.keys
//         .filter(({key_name}) => messages.includes(key_name.web))
//         .map(({key_id, key_name}) => ({
//             key_id: key_id,
//             tags: data[key_name.web]
//         }))
//     const steps = Math.ceil(keysForUpdate.length / KEYS_PER_REQUEST + 1)
//     for (let i=1;i<steps;i++) {
//         await api.keys.updateMany(LOCALISE_PROJECT_ID, {keys: keysForUpdate.slice(i*KEYS_PER_REQUEST, (i+1)*KEYS_PER_REQUEST)})
//         console.log(`Tags are successfully updated!  ${i}/${steps}`)
//     }  
// }
async function run() {
    await pushNewKeys()
   // await updateTagsForExisted()
   // await createTask()
}

run()
}


async function handleFile(file: any, filter: string, lokaliseTaskTitle: string, lokaliseTaskDescription: string, lokaliseToken: string, languages: string) {
    console.log('Hello', file.name)
    const zip = await JSZip.loadAsync(file)
    const fileNames = Object.keys(zip.files)
    const filterArray = filter.split(',')

    for (const file of fileNames) {
        const fileName = file.split('$')[0]
        if (filterArray.includes(fileName)) {
            const data = await zip.file(file)?.async("string")
        
            if (data) {
                processFile(data, fileName)
                //console.log(file)
            }
        }
      }
    console.log(messages)
    sendToLokalise(messages, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken, languages)
}

async function checkNewMessages(file: any, filter: string) {
    console.log('Hello', file.name)
    const zip = await JSZip.loadAsync(file)
    const fileNames = Object.keys(zip.files)
    const filterArray = filter.split(',')

    for (const file of fileNames) {
        const fileName = file.split('$')[0]
        if (filterArray.includes(fileName)) {
            const data = await zip.file(file)?.async("string")
        
            if (data) {
                processFile(data, fileName)
                //console.log(file)
            }
        }
      }
    console.log(Object.keys(messages))
}

export const usePersistForm = ({
    value,
    localStorageKey,
  }) => {
    React.useEffect(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value, localStorageKey]);
  
    return;
  };
  

export default function App() {
    const defaultValues = { languages: [], prismicZipFile: "", filter: "", lokaliseTaskTitle: "", lokaliseTaskDescription: "", lokaliseToken: "" };
    console.log(defaultValues)
    const form = useForm({defaultValues});

  const {
    register,
    handleSubmit,
    watch,
    formState,
    control,
    setValue,
    getValues
  } = form

  const { lokaliseToken } = getValues()
  const onSubmit = (data: any) => {
    const { prismicZipFile, filter, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken, languages } = form.getValues()
    for (var i = 0; i < prismicZipFile.length; i++) {
        handleFile(prismicZipFile[i], filter, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken, languages.join(','));
    }
  }
  
  const onCheck = () => {
    const { prismicZipFile, filter } = form.getValues()
    for (var i = 0; i < prismicZipFile.length; i++) {
        checkNewMessages(prismicZipFile[i], filter);
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

  console.log(watch('languages')); // watch input value by passing the name of it
  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Input placeholder="Lokalise Task Title" type="text" {...register('lokaliseTaskTitle', { required: true })} />

      <Input placeholder="Lokalise Task Description" type="text" {...register('lokaliseTaskDescription', { required: true })} />

      <Input placeholder="Lokalise Token" type="password" {...register('lokaliseToken', { required: true })} />

      <MultiSelect
      options={languageOptions}
      selected={watch('languages')}
      onSelectedChanged={(selected: any) => setValue('languages', selected)}
      {...register('languages', { required: true })}
    />



      {/* <Selector control={control} {...register('languages', { required: true })} name="languages"  /> */}

      <Input placeholder="Filter" type="text" {...register('filter', { required: true })} />

      <Input type="file" {...register('prismicZipFile', { required: true })} />

      <Input type="button" value="New messages" onClick={() => {
        onCheck()
      }}/>

      <Input type="submit" />
    </Form>
  );
}

