import React from 'react';
import { useForm, useController, Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'


import JSZip from 'jszip'

import { useLocalStorage} from '../helpers/useLocalStorage'
import { Form, Input, StyledMultiSelect, Wrapper, Side, Row, Col, WrapperColumn, Autocomplete,  } from '../styles/general'

import {languageOptions, getTranslations, LOCALISE_PROJECT_ID} from '../helpers/index'



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
async function sendToLokalise(data: any, lokaliseTaskTitle: string, lokaliseTaskDescription: string, lokaliseToken: string, languages: string[], filter: string, isLokaliseTaskNeeded: boolean) {
    const messages = Object.keys(data)
    const keys = {}
    const KEYS_PER_REQUEST = 500 // The amount of keys in one request
    const timeTag = `time-${new Date().getTime()}`
    const tags = [...data[messages[0]], timeTag].join(',')
    console.log("tags", tags)

    // const keys = messages.filter((message) => Boolean(message)).map((message) => ({
    //     key_name: message,
    //     tags: [...data[message], timeTag],
    //     platforms: [
    //         "web"
    //     ],
    //     translations: [
    //         {
    //             language_iso: "en",
    //             translation: message
    //         }
    //     ]
    // }))

    messages.forEach((message) => {
        keys[message] = message
    })

    console.log('sendToLokalise sendToLokalise', Object.keys(keys).length)

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
            languages: languages,
            filter: filter,
            tags: tags,
            isLokaliseTaskNeeded: isLokaliseTaskNeeded
        })
      };
      
    const response = await fetch(`/api/create-keys`, options)
     const data = await response.json()
     console.log(data)


}


async function pushNewKeys() {
    //const steps = Math.ceil(keys.length / KEYS_PER_REQUEST)
    // for (let i=0;i<steps;i++) {
        
    // }

    await createKeys(keys)
    console.log(`New keys successfully pushed!`)
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


async function handleFile(file: any, filter: string, lokaliseTaskTitle: string, lokaliseTaskDescription: string, lokaliseToken: string, languages: string[], isLokaliseTaskNeeded: boolean) {
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
    console.log('messages', Object.keys(messages))
    sendToLokalise(messages, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken, languages, filter, isLokaliseTaskNeeded)
}

async function checkNewMessages(file: any, filter: string, lokaliseToken: string) {
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
    const localiseMessagesResponse = await getTranslations('en', lokaliseToken, LOCALISE_PROJECT_ID)
    const localiseMessages = Object.keys(localiseMessagesResponse)
    const result = Object.keys(messages).map((message) => ({
        message,
        isInLocalise: localiseMessages.includes(message)
    }))

    console.log(Object.keys(messages))
    console.log(localiseMessages)

    return result
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
    const defaultValues = { languages: [], prismicZipFile: "", filter: "", lokaliseTaskTitle: "", lokaliseTaskDescription: "", lokaliseToken: "", isLokaliseTaskNeeded: true };
    console.log(defaultValues)
    const form = useForm({defaultValues, shouldUseNativeValidation: true});
    const [results, setResults] = React.useState<{message: string, isInLocalise: boolean}[]>([])

  const {
    register,
    handleSubmit,
    watch,
    formState,
    control,
    setValue,
    getValues
  } = form

  const { languages, isLokaliseTaskNeeded } = getValues()
  const onSubmit = (data: any) => {
    const { prismicZipFile, filter, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken, languages, isLokaliseTaskNeeded } = form.getValues()
    for (var i = 0; i < prismicZipFile.length; i++) {
        handleFile(prismicZipFile[i], filter, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken, languages.map(({id}) => id), isLokaliseTaskNeeded);
    }
  }
  
  const onCheck = async () => {
    const { prismicZipFile, filter, lokaliseToken } = form.getValues()
    const result = await checkNewMessages(prismicZipFile[0], filter, lokaliseToken);
    setResults(result)
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

  console.log(watch('isLokaliseTaskNeeded')); // watch input value by passing the name of it
  console.log(watch('languages'))
  console.log(form.getValues())
  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <Form onSubmit={handleSubmit(onSubmit)}>
        <Wrapper>
            <Side>
                <Input type="file" {...register('prismicZipFile', { required: true })} />

                <Input label="Filter" type="text" {...register('filter', { required: true })} />

                <Input label="Lokalise Token" type="password" {...register('lokaliseToken', { required: true })} />

                <Button type="button" variant="outlined" onClick={() => {
                onCheck()
            }}>Check messages</Button>
            </Side>
            <Side>
            <FormControlLabel
                    label="No need for Lokalise task"
                    control={
                        <Checkbox onChange={(e) => {
                            console.log('e.target.checked', e.target.checked)
                            setValue('isLokaliseTaskNeeded', Boolean(e.target.checked))
                        }} />
                    }
                />
                <Input label="Lokalise Task Title" type="text" {...register('lokaliseTaskTitle', { required: true })} />

                <Input label="Lokalise Task Description" type="text" {...register('lokaliseTaskDescription', { required: true })} />
                <Autocomplete
                    multiple
                    value={languages}
                    id="tags-standard"
                    options={languageOptions}
                    getOptionLabel={(option) => option.label}
                    onChange={(event, val) => {
                        console.log('onchange', val)
                        setValue('languages', val)
                      }}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        label="Languages"
                    />
                    )}
      />

                <Button type="submit" variant="outlined" disabled={!results.some(({isInLocalise}) => isInLocalise)}>Submit</Button>
            </Side>
        </Wrapper>
        {results.length > 0 && 
            <WrapperColumn>
                <Row>
                    <Col>Message</Col>
                    <Col>Is inside Localise?</Col>
                </Row>
                {
                    results.map((result) => (
                        <Row key={result.message}>
                            <Col>{result.message}</Col>
                            <Col>{result.isInLocalise ? 'Yes' : 'No'}</Col>
                        </Row>
                    ))
                }
        </WrapperColumn>}

    </Form>
  );
}



