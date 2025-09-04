import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import
  {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Avatar,
    Divider,
    useTheme,
    useMediaQuery,
    Toolbar,
    Menu,
    MenuItem
  } from '@mui/material'
import
  {
    Restaurant,
    Assignment,
    Dashboard,
    Menu as MenuIcon,
    Close,
    AccountCircle,
    Logout,
    Settings
  } from '@mui/icons-material'

interface SidebarProps
{
  mobileOpen: boolean
  onMobileToggle: () => void
}

const drawerWidth = 280

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
    available: false // Will add later
  },
  {
    text: 'Orders',
    icon: <Assignment />,
    path: '/orders',
    available: true
  }
]

export default function Sidebar ({ mobileOpen, onMobileToggle }: SidebarProps)
{
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [ profileMenuAnchor, setProfileMenuAnchor ] = useState<null | HTMLElement>(null)

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) =>
  {
    setProfileMenuAnchor(event.currentTarget)
  }

  const handleProfileClose = () =>
  {
    setProfileMenuAnchor(null)
  }

  const handleLogout = () =>
  {
    setProfileMenuAnchor(null)
    signOut({ callbackUrl: '/' })
  }

  const handleNavigation = (path: string, available: boolean) =>
  {
    if (!available) return
    router.push(path)
    if (isMobile)
    {
      onMobileToggle()
    }
  }

  const drawerContent = (
    <Box sx={ { height: '100%', display: 'flex', flexDirection: 'column' } }>
      {/* Logo Section */ }
      <Box
        sx={ {
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        } }
      >
        <Restaurant sx={ { fontSize: 32, color: 'primary.main' } } />
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          RestaunaX
        </Typography>
        { isMobile && (
          <IconButton
            onClick={ onMobileToggle }
            sx={ { ml: 'auto' } }
            aria-label="close drawer"
          >
            <Close />
          </IconButton>
        ) }
      </Box>

      {/* Navigation */ }
      <List sx={ { flex: 1, px: 2, py: 2 } }>
        { menuItems.map((item) => (
          <ListItem key={ item.text } disablePadding sx={ { mb: 1 } }>
            <ListItemButton
              onClick={ () => handleNavigation(item.path, item.available) }
              selected={ pathname === item.path }
              disabled={ !item.available }
              sx={ {
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: item.available ? 'action.hover' : 'transparent',
                },
                opacity: item.available ? 1 : 0.5
              } }
            >
              <ListItemIcon sx={ { minWidth: 40 } }>
                { item.icon }
              </ListItemIcon>
              <ListItemText
                primary={ item.text }
                primaryTypographyProps={ {
                  fontWeight: pathname === item.path ? 600 : 400
                } }
              />
              { !item.available && (
                <Typography variant="caption" color="text.secondary">
                  Soon
                </Typography>
              ) }
            </ListItemButton>
          </ListItem>
        )) }
      </List>

      {/* User Profile Section */ }
      <Box sx={ { p: 2, borderTop: '1px solid', borderColor: 'divider' } }>
        <ListItemButton
          onClick={ handleProfileClick }
          sx={ {
            borderRadius: 2,
            p: 2
          } }
        >
          <ListItemIcon sx={ { minWidth: 40 } }>
            <Avatar sx={ { width: 32, height: 32, fontSize: '0.875rem' } }>
              { session?.user?.name?.charAt(0)?.toUpperCase() || 'U' }
            </Avatar>
          </ListItemIcon>
          <Box sx={ { flex: 1, minWidth: 0 } }>
            <Typography variant="subtitle2" noWrap>
              { session?.user?.name || 'User' }
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              { session?.user?.email }
            </Typography>
          </Box>
          <AccountCircle />
        </ListItemButton>

        {/* Profile Menu */ }
        <Menu
          anchorEl={ profileMenuAnchor }
          open={ Boolean(profileMenuAnchor) }
          onClose={ handleProfileClose }
          anchorOrigin={ {
            vertical: 'top',
            horizontal: 'right',
          } }
          transformOrigin={ {
            vertical: 'bottom',
            horizontal: 'right',
          } }
        >
          <MenuItem onClick={ handleProfileClose } disabled>
            <Settings sx={ { mr: 2 } } />
            Settings
            <Typography variant="caption" color="text.secondary" sx={ { ml: 1 } }>
              Soon
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={ handleLogout }>
            <Logout sx={ { mr: 2 } } />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={ { width: { md: drawerWidth }, flexShrink: { md: 0 } } }
    >
      {/* Mobile drawer */ }
      <Drawer
        variant="temporary"
        open={ mobileOpen }
        onClose={ onMobileToggle }
        ModalProps={ {
          keepMounted: true, // Better open performance on mobile.
        } }
        sx={ {
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        } }
      >
        { drawerContent }
      </Drawer>

      {/* Desktop drawer */ }
      <Drawer
        variant="permanent"
        sx={ {
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'relative',
            height: '100vh'
          },
        } }
        open
      >
        { drawerContent }
      </Drawer>
    </Box>
  )
}
