'use client'

import { useState } from 'react'
import { useTheme, useMediaQuery, Box, AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import Sidebar from './Sidebar'

interface DashboardLayoutProps
{
  children: React.ReactNode
  title?: string
}

export default function DashboardLayout ({ children, title }: DashboardLayoutProps)
{
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [ mobileOpen, setMobileOpen ] = useState(false)

  const handleDrawerToggle = () =>
  {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={ { display: 'flex', height: '100vh' } }>
      {/* Sidebar */ }
      <Sidebar mobileOpen={ mobileOpen } onMobileToggle={ handleDrawerToggle } />

      {/* Main content area */ }
      <Box sx={ { flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }>
        {/* Mobile header with hamburger menu */ }
        { isMobile && (
          <AppBar
            position="static"
            sx={ {
              backgroundColor: 'background.paper',
              color: 'text.primary',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderBottom: '1px solid',
              borderColor: 'divider'
            } }
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={ handleDrawerToggle }
                sx={ { mr: 2 } }
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                { title || 'RestaunaX' }
              </Typography>
            </Toolbar>
          </AppBar>
        ) }

        {/* Page content */ }
        <Box
          component="main"
          sx={ {
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: 'background.default'
          } }
        >
          { children }
        </Box>
      </Box>
    </Box>
  )
}
