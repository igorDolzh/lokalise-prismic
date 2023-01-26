import Link from 'next/link'


export default function Home() {
  return (
    <ul>
      <li>
        <Link href="/apply-recent-translations">Apply Recent Translations</Link>
      </li>
      <li>
        <Link href="/export-new-messages">Export New Messages</Link>
      </li>
    </ul>
  )
}
