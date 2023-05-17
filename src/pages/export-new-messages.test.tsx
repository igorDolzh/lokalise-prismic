import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  cleanup,
} from '@testing-library/react'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import * as fs from 'fs'
import { join } from 'path'
import nock from 'nock'

import ExportNewMessages from './export-new-messages'

describe('export new messages', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  afterEach(() => {
    cleanup()
    nock.cleanAll()
  })

  test('show form for exporting new messages', () => {
    render(<ExportNewMessages />)

    const prismicZipFileInput = screen.getByTestId('prismic-zip-file')
    expect(prismicZipFileInput).toBeInTheDocument()

    const filterInput = screen.getByLabelText(/Filter/)
    expect(filterInput).toBeInTheDocument()

    const lokaliseTokenInput = screen.getByLabelText(/Lokalise Token/)
    expect(lokaliseTokenInput).toBeInTheDocument()

    const checkMessagesButton = screen.getByText(/check messages/i)
    expect(checkMessagesButton).toBeInTheDocument()

    const noNeedLokaliseTaskCheckBox = screen.getByText(
      /No need for Lokalise task/,
    )
    expect(noNeedLokaliseTaskCheckBox).toBeInTheDocument()

    const lokaliseTaskTitleInput = screen.getByLabelText(/Lokalise Task Title/)
    expect(lokaliseTaskTitleInput).toBeInTheDocument()

    const lokaliseTaskDescriptionInput = screen.getByLabelText(
      /Lokalise Task Description/,
    )
    expect(lokaliseTaskDescriptionInput).toBeInTheDocument()

    const languagesInput = screen.getByLabelText(/Languages/)
    expect(languagesInput).toBeInTheDocument()

    const submitButton = screen.getByText(/submit/i)
    expect(submitButton).toBeInTheDocument()
  })

  const TEST_FILE = join(__dirname, 'test/fixtures/test.zip')

  const FILTER = 'X_3PDxEAACEATwxV'

  const TOKEN = 'token'

  test('show table with the messages from the document', async () => {
    const lokaliseGetKeysNock = nock('https://localhost:123')
      .get(
        '/api/get-translations?language=en&token=token&projectId=302610005f102393819ad8.14734010',
      )
      .reply(200, {
        response: [
          {
            file: 'locale/en.json',
            translations: {
              'Ebooks Index Page': 'Ebooks Index Page',
              'Tips and insights to boost you and your business':
                'Tips and insights to boost you and your business',
            },
          },
        ],
      })
    render(<ExportNewMessages />)

    const buf = fs.readFileSync(TEST_FILE)

    const file = new File([buf], 'text.zip', {
      type: 'application/zip',
    })

    const prismicZipFileInput = screen
      .getByTestId('prismic-zip-file')
      .querySelector('input')
    expect(prismicZipFileInput).toBeInTheDocument()

    if (prismicZipFileInput) {
      await userEvent.upload(prismicZipFileInput, file)
    }

    const filterInput = screen.getByLabelText(/Filter/)
    expect(filterInput).toBeInTheDocument()

    await userEvent.type(filterInput, FILTER)

    const lokaliseTokenInput = screen.getByLabelText(/Lokalise Token/)
    expect(lokaliseTokenInput).toBeInTheDocument()

    await userEvent.type(lokaliseTokenInput, TOKEN)

    const checkMessagesButton = screen.getByText(/check messages/i)
    expect(checkMessagesButton).toBeInTheDocument()

    const MessageHeader = screen.queryByText(/Message/)
    expect(MessageHeader).not.toBeInTheDocument()

    const isInsideLocaliseHeader = screen.queryByText(/Is inside Localise/)
    expect(isInsideLocaliseHeader).not.toBeInTheDocument()

    const SuccessMessages = screen.queryByText(/Check is finished/)
    expect(SuccessMessages).not.toBeInTheDocument()

    await userEvent.click(checkMessagesButton)
    await waitFor(() => {
      const SuccessMessages = screen.getByText(/Check is finished/)
      expect(SuccessMessages).toBeInTheDocument()

      const MessageHeader = screen.getByText(/Message/)
      expect(MessageHeader).toBeInTheDocument()
      const isInsideLocaliseHeader = screen.getByText(/Is inside Localise/)
      expect(isInsideLocaliseHeader).toBeInTheDocument()
      const YesStatus = screen.getAllByText(/Yes/)
      console.log(YesStatus)
      expect(YesStatus).toHaveLength(2)
      const NoStatus = screen.getAllByText(/No/)
      expect(NoStatus).toHaveLength(51)
    })
  })

  test('push new messages into localise.com', async () => {
    const lokaliseGetKeysNock = nock('https://localhost:123/')
      .get(
        '/api/get-translations?language=en&token=token&projectId=302610005f102393819ad8.14734010',
      )
      .reply(200, {
        response: [
          {
            file: 'locale/en.json',
            translations: {
              'Ebooks Index Page': 'Ebooks Index Page',
              'Tips and insights to boost you and your business':
                'Tips and insights to boost you and your business',
            },
          },
        ],
      })

    const lokaliseCreateKeys = nock('https://localhost:123/')
      .post('/api/create-keys')
      .reply(200, {
        response: 'success',
      })
    render(<ExportNewMessages />)

    const buf = fs.readFileSync(TEST_FILE)

    const file = new File([buf], 'text.zip', {
      type: 'application/zip',
    })

    const prismicZipFileInput = screen
      .getByTestId('prismic-zip-file')
      .querySelector('input')
    expect(prismicZipFileInput).toBeInTheDocument()

    if (prismicZipFileInput) {
      await userEvent.upload(prismicZipFileInput, file)
    }

    const filterInput = screen.getByLabelText(/Filter/)
    expect(filterInput).toBeInTheDocument()

    await userEvent.clear(filterInput)
    await userEvent.type(filterInput, FILTER)

    const lokaliseTokenInput = screen.getByLabelText(/Lokalise Token/)
    expect(lokaliseTokenInput).toBeInTheDocument()

    await userEvent.clear(lokaliseTokenInput)
    await userEvent.type(lokaliseTokenInput, TOKEN)

    const checkMessagesButton = screen.getByText(/check messages/i)
    expect(checkMessagesButton).toBeInTheDocument()

    const MessageHeader = screen.queryByText(/Message/)
    expect(MessageHeader).not.toBeInTheDocument()

    const isInsideLocaliseHeader = screen.queryByText(/Is inside Localise/)
    expect(isInsideLocaliseHeader).not.toBeInTheDocument()

    expect(isInsideLocaliseHeader).not.toBeInTheDocument()

    const submitButton = screen.getByText(/Submit/)
    expect(submitButton).toBeDisabled()

    const SuccessMessage = screen.queryByText(/Check is finished/)
    expect(SuccessMessage).not.toBeInTheDocument()

    await userEvent.click(checkMessagesButton)
    await waitFor(() => {
      const SuccessMessage = screen.getByText(/Check is finished/)
      expect(SuccessMessage).toBeInTheDocument()

      const MessageHeader = screen.getByText(/Message/)
      expect(MessageHeader).toBeInTheDocument()
      const isInsideLocaliseHeader = screen.getByText(/Is inside Localise/)
      expect(isInsideLocaliseHeader).toBeInTheDocument()
      const YesStatus = screen.getAllByText(/Yes/)
      console.log(YesStatus)
      expect(YesStatus).toHaveLength(2)
      const NoStatus = screen.getAllByText(/No/)
      expect(NoStatus).toHaveLength(51)
      expect(submitButton).toBeEnabled()
    })

    const lokaliseTaskTitleInput = screen.getByLabelText(/Lokalise Task Title/)

    await userEvent.type(lokaliseTaskTitleInput, 'Title')

    const lokaliseTaskDescriptionInput = screen.getByLabelText(
      /Lokalise Task Description/,
    )
    await userEvent.type(lokaliseTaskDescriptionInput, 'Description')

    const languagesInput = screen.getByLabelText(/Languages/)
    expect(languagesInput).toBeInTheDocument()

    await userEvent.click(languagesInput)

    //await userEvent.click(screen.getByText(/Dansk/))

    await userEvent.click(screen.getByRole('option', { name: /da/ }))

    const chosenDanishOption = screen.getByText(/Dansk/)

    expect(chosenDanishOption).toBeInTheDocument()

    const SuccessMessagesForUploading = screen.queryByText(
      /Messages are uploaded in Lokalise/,
    )
    expect(SuccessMessagesForUploading).not.toBeInTheDocument()

    screen.debug(submitButton)

    expect(submitButton).toBeEnabled()

    await userEvent.click(submitButton)

    await waitFor(() => {
      const SuccessMessagesForUploading = screen.getByText(
        /Messages are uploaded in Lokalise/,
      )
      expect(SuccessMessagesForUploading).toBeInTheDocument()
    })
  })
})
