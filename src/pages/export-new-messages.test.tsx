import { render, screen } from '@testing-library/react'
import ExportNewMessages from './export-new-messages'

test('first test', () => {
  render(<ExportNewMessages />)
  const checkMessagesButton = screen.getByText(/check messages/i)
  expect(checkMessagesButton).toBeInTheDocument()
})
