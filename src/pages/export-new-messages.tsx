import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import JSZip from 'jszip'
import MultiSelect from "@khanacademy/react-multi-select";


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
async function sendToLokalise(data: any, lokaliseTaskTitle: string, lokaliseTaskDescription: string, lokaliseToken: string) {
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
            languages: ['es']
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


async function handleFile(file: any, filter: string, lokaliseTaskTitle: string, lokaliseTaskDescription: string, lokaliseToken: string) {
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
    sendToLokalise(messages, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken)
}


export default function App() {
    const form = useForm();
  const {
    register,
    handleSubmit,
    watch,
    formState,
  } = form
  const onSubmit = (data: any) => console.log(data);
  
  React.useEffect(() => {
    const { prismicZipFile, filter, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken } = form.getValues()
    for (var i = 0; i < prismicZipFile.length; i++) {
        handleFile(prismicZipFile[i], filter, lokaliseTaskTitle, lokaliseTaskDescription, lokaliseToken);
    }
  }, [watch('prismicZipFile')])

  console.log(watch('prismicZipFile')); // watch input value by passing the name of it

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Input defaultValue="" placeholder="Lokalise Task Title" type="text" {...register('lokaliseTaskTitle', { required: true })} />

      <Input defaultValue="" placeholder="Lokalise Task Description" type="text" {...register('lokaliseTaskDescription', { required: true })} />

      <Input defaultValue="" placeholder="Lokalise Token" type="password" {...register('lokaliseToken', { required: true })} />

      <Input defaultValue="" placeholder="Filter" type="text" {...register('filter', { required: true })} />

      <Input type="file" {...register('prismicZipFile', { required: true })} />
      {/* errors will return when field validation fails  */}
      {formState.errors.exampleRequired && <span>This field is required</span>}

      <Input type="submit" />
    </Form>
  );
}

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