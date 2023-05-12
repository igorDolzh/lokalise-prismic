import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

import JSZip from 'jszip'

import {
  Form,
  Input,
  Wrapper,
  Side,
  Row,
  Col,
  WrapperColumn,
  Autocomplete,
} from '../styles/general'

import {
  languageOptions,
  getTranslations,
  LOCALISE_PROJECT_ID,
  getMessagesWithTagsFromArchive,
} from '../helpers/index'

async function sendToLokalise({
  data,
  lokaliseTaskTitle,
  lokaliseTaskDescription,
  lokaliseToken,
  languages,
  filter,
  isLokaliseTaskNeeded,
}: {
  data: { [key: string]: string[] }
  lokaliseTaskTitle: string
  lokaliseTaskDescription: string
  lokaliseToken: string
  languages: string[]
  filter: string
  isLokaliseTaskNeeded: boolean
}) {
  const messages = Object.keys(data)
  const keys: { [key: string]: string } = {}
  const timeTag = `time-${new Date().getTime()}`
  const tags = [...data[messages[0]], timeTag].join(',')

  messages.forEach((message) => {
    keys[message] = message
  })

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
        isLokaliseTaskNeeded: isLokaliseTaskNeeded,
      }),
    }

    const response = await fetch(`/api/create-keys`, options)
    const data = await response.json()
  }

  await createKeys(keys)
  console.log(`New keys successfully pushed!`)
}

async function onFileSubmit({
  file,
  filter,
  lokaliseTaskTitle,
  lokaliseTaskDescription,
  lokaliseToken,
  languages,
  isLokaliseTaskNeeded,
}: {
  file: any
  filter: string
  lokaliseTaskTitle: string
  lokaliseTaskDescription: string
  lokaliseToken: string
  languages: string[]
  isLokaliseTaskNeeded: boolean
}) {
  let messages: { [key: string]: string[] } = {}
  const zip = await JSZip.loadAsync(file)
  const fileNames = Object.keys(zip.files)
  const filterArray = filter.split(',')

  for (const file of fileNames) {
    const fileName = file.split('$')[0]
    if (filterArray.includes(fileName)) {
      const data = await zip.file(file)?.async('string')

      if (data) {
        messages = getMessagesWithTagsFromArchive(data, fileName)
      }
    }
  }

  sendToLokalise({
    data: messages,
    lokaliseTaskTitle,
    lokaliseTaskDescription,
    lokaliseToken,
    languages,
    filter,
    isLokaliseTaskNeeded,
  })
}

async function getStatusForMessageByFilter({
  file,
  filter,
  lokaliseToken,
}: {
  file: any
  filter: string
  lokaliseToken: string
}) {
  let messages: { [key: string]: string[] } = {}
  const zip = await JSZip.loadAsync(file)
  const fileNames = Object.keys(zip.files)
  const filterArray = filter.split(',')

  for (const file of fileNames) {
    const fileName = file.split('$')[0]
    if (filterArray.includes(fileName)) {
      const data = await zip.file(file)?.async('string')

      if (data) {
        messages = getMessagesWithTagsFromArchive(data, fileName)
      }
    }
  }

  const localiseMessagesResponse = await getTranslations(
    'en',
    lokaliseToken,
    LOCALISE_PROJECT_ID,
  )
  const localiseMessages = Object.keys(localiseMessagesResponse)
  const result = Object.keys(messages).map((message) => ({
    message,
    isInLocalise: localiseMessages.includes(message),
  }))

  return result
}

export const usePersistForm = ({
  value,
  localStorageKey,
}: {
  value: string
  localStorageKey: string
}) => {
  React.useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(value))
  }, [value, localStorageKey])

  return
}

export default function App() {
  const defaultValues = {
    languages: [],
    prismicZipFile: '',
    filter: '',
    lokaliseTaskTitle: '',
    lokaliseTaskDescription: '',
    lokaliseToken: '',
    isLokaliseTaskNeeded: true,
  }

  const form = useForm({ defaultValues, shouldUseNativeValidation: true })
  const [results, setResults] = React.useState<
    { message: string; isInLocalise: boolean }[]
  >([])

  const {
    register,
    handleSubmit,
    watch,
    formState,
    control,
    setValue,
    getValues,
  } = form

  const onSubmit = () => {
    const {
      prismicZipFile,
      filter,
      lokaliseTaskTitle,
      lokaliseTaskDescription,
      lokaliseToken,
      languages,
      isLokaliseTaskNeeded,
    } = form.getValues()

    onFileSubmit({
      file: prismicZipFile[0],
      filter,
      lokaliseTaskTitle,
      lokaliseTaskDescription,
      lokaliseToken,
      languages: languages.map(({ id }) => id),
      isLokaliseTaskNeeded,
    })
  }

  const onCheck = async () => {
    const { prismicZipFile, filter, lokaliseToken } = form.getValues()
    const result = await getStatusForMessageByFilter({
      file: prismicZipFile[0],
      filter,
      lokaliseToken,
    })
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
  }, [])

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Wrapper>
        <Side>
          <Input
            type="file"
            {...register('prismicZipFile', { required: true })}
            data-testid="prismic-zip-file"
          />

          <Input
            label="Filter"
            type="text"
            {...register('filter', { required: true })}
          />

          <Input
            label="Lokalise Token"
            type="password"
            {...register('lokaliseToken', { required: true })}
          />

          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              onCheck()
            }}
          >
            Check messages
          </Button>
        </Side>
        <Side>
          <Controller
            name="isLokaliseTaskNeeded"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                label="No need for Lokalise task"
                control={
                  <Checkbox
                    checked={value}
                    onChange={(e) => {
                      onChange(Boolean(e.target.checked))
                    }}
                  />
                }
              />
            )}
          />

          <Input
            label="Lokalise Task Title"
            type="text"
            {...register('lokaliseTaskTitle', { required: true })}
          />

          <Input
            label="Lokalise Task Description"
            type="text"
            {...register('lokaliseTaskDescription', { required: true })}
          />

          <Controller
            name="languages"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                value={value || null}
                id="tags-standard"
                options={languageOptions.filter(
                  ({ id }) => !value.map(({ id }) => id).includes(id),
                )}
                getOptionLabel={(option) => option.label}
                onChange={(event, val) => {
                  onChange(val)
                }}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Languages" />
                )}
              />
            )}
          />
          <Button
            type="submit"
            variant="outlined"
            disabled={!results.some(({ isInLocalise }) => isInLocalise)}
          >
            Submit
          </Button>
        </Side>
      </Wrapper>
      {results.length > 0 && (
        <WrapperColumn>
          <Row>
            <Col>Message</Col>
            <Col>Is inside Localise?</Col>
          </Row>
          {results.map((result) => (
            <Row key={result.message}>
              <Col>{result.message}</Col>
              <Col>{result.isInLocalise ? 'Yes' : 'No'}</Col>
            </Row>
          ))}
        </WrapperColumn>
      )}
    </Form>
  )
}
