import Link from 'next/link'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';


export default function Home() {
  return (
    <div>
      <h2>Prismic-Localise Integration</h2>
      <nav aria-label="secondary mailbox folders">
        <List>
          <ListItem disablePadding>
            <ListItemButton component="a" href="/apply-recent-translations" >
              <ListItemText primary="Apply Recent Translations" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href="/export-new-messages">
              <ListItemText primary="Export New Messages" />
            </ListItemButton>
          </ListItem>
        </List>
      </nav>
    </div>
  )
}
