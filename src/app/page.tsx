'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import
{
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar
} from '@mui/material'
import
{
  Restaurant,
  Speed,
  Analytics,
  ArrowForward
} from '@mui/icons-material'

export default function LandingPage ()
{
  const { data: session, status } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() =>
  {
    if (status === 'authenticated')
    {
      router.push('/orders')
    }
  }, [ status, router ])

  if (status === 'loading')
  {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={ { minHeight: '100vh', bgcolor: 'background.default' } }>
      {/* Header */ }
      <AppBar position="static" sx={ { bgcolor: 'white', color: 'text.primary', boxShadow: 1 } }>
        <Toolbar>
          <Typography variant="h6" component="div" sx={ { flexGrow: 1, fontWeight: 'bold', color: 'primary.main' } }>
            RestaunaX
          </Typography>
          <Box sx={ { display: 'flex', gap: 2 } }>
            <Button
              color="primary"
              onClick={ () => router.push('/auth/signin') }
              sx={ { textTransform: 'none' } }
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              onClick={ () => router.push('/auth/signup') }
              sx={ { textTransform: 'none' } }
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */ }
      <Box
        sx={ {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        } }
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" fontWeight="bold" mb={ 2 }>
            RestaunaX
          </Typography>
          <Typography variant="h5" mb={ 4 } sx={ { opacity: 0.9 } }>
            Streamline your restaurant operations with our powerful order management dashboard
          </Typography>
          <Box sx={ { display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' } }>
            <Button
              variant="contained"
              size="large"
              endIcon={ <ArrowForward /> }
              onClick={ () => router.push('/auth/signin') }
              sx={ {
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                px: 4,
                py: 1.5
              } }
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={ () => router.push('/auth/signup') }
              sx={ {
                borderColor: 'white',
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                px: 4,
                py: 1.5
              } }
            >
              Sign Up
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */ }
      <Container maxWidth="lg" sx={ { py: 8 } }>
        <Typography variant="h3" textAlign="center" mb={ 2 } fontWeight="bold">
          Why Choose RestaunaX?
        </Typography>
        <Typography variant="h6" textAlign="center" mb={ 6 } color="text.secondary">
          Everything you need to manage your restaurant orders efficiently
        </Typography>

        <Box
          sx={ {
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4
          } }
        >
          <Card sx={ { height: '100%', textAlign: 'center', p: 2 } }>
            <CardContent>
              <Restaurant sx={ { fontSize: 60, color: 'primary.main', mb: 2 } } />
              <Typography variant="h5" fontWeight="bold" mb={ 2 }>
                Order Management
              </Typography>
              <Typography color="text.secondary">
                Track and manage all your orders in real-time. From pending to delivered,
                keep everything organized in one place.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={ { height: '100%', textAlign: 'center', p: 2 } }>
            <CardContent>
              <Speed sx={ { fontSize: 60, color: 'primary.main', mb: 2 } } />
              <Typography variant="h5" fontWeight="bold" mb={ 2 }>
                Fast & Efficient
              </Typography>
              <Typography color="text.secondary">
                Streamlined interface designed for speed. Update order statuses
                with just one click and keep your kitchen running smoothly.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={ { height: '100%', textAlign: 'center', p: 2 } }>
            <CardContent>
              <Analytics sx={ { fontSize: 60, color: 'primary.main', mb: 2 } } />
              <Typography variant="h5" fontWeight="bold" mb={ 2 }>
                Real-time Updates
              </Typography>
              <Typography color="text.secondary">
                Get instant notifications and updates. Monitor your restaurant's
                performance with live data and analytics.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* CTA Section */ }
      <Box sx={ { bgcolor: 'grey.50', py: 8 } }>
        <Container maxWidth="md" sx={ { textAlign: 'center' } }>
          <Typography variant="h4" fontWeight="bold" mb={ 2 }>
            Ready to get started?
          </Typography>
          <Typography variant="h6" mb={ 4 } color="text.secondary">
            Join thousands of restaurants already using RestaunaX
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={ <ArrowForward /> }
            onClick={ () => router.push('/auth/signup') }
            sx={ { px: 4, py: 1.5 } }
          >
            Start Free Trial
          </Button>
        </Container>
      </Box>

      {/* Footer */ }
      <Box sx={ { bgcolor: 'grey.900', color: 'white', py: 6 } }>
        <Container maxWidth="lg">
          <Box sx={ { display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', md: 'flex-start' }, gap: 4 } }>
            <Box sx={ { textAlign: { xs: 'center', md: 'left' } } }>
              <Typography variant="h6" fontWeight="bold" mb={ 1 } sx={ { color: 'white' } }>
                RestaunaX
              </Typography>
              <Typography color="grey.400" sx={ { maxWidth: 300 } }>
                Streamline your restaurant operations with our powerful order management system.
              </Typography>
            </Box>

            <Box sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 4 }, textAlign: { xs: 'center', md: 'left' } } }>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={ 1 } sx={ { color: 'white' } }>
                  Product
                </Typography>
                <Typography component="div" color="grey.400" sx={ { mb: 0.5, cursor: 'pointer', '&:hover': { color: 'white' } } }>
                  Features
                </Typography>
                <Typography component="div" color="grey.400" sx={ { mb: 0.5, cursor: 'pointer', '&:hover': { color: 'white' } } }>
                  Pricing
                </Typography>
                <Typography component="div" color="grey.400" sx={ { cursor: 'pointer', '&:hover': { color: 'white' } } }>
                  Demo
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={ 1 } sx={ { color: 'white' } }>
                  Support
                </Typography>
                <Typography component="div" color="grey.400" sx={ { mb: 0.5, cursor: 'pointer', '&:hover': { color: 'white' } } }>
                  Help Center
                </Typography>
                <Typography component="div" color="grey.400" sx={ { mb: 0.5, cursor: 'pointer', '&:hover': { color: 'white' } } }>
                  Contact Us
                </Typography>
                <Typography component="div" color="grey.400" sx={ { cursor: 'pointer', '&:hover': { color: 'white' } } }>
                  Documentation
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={ { borderTop: '1px solid', borderColor: 'grey.800', mt: 4, pt: 3, textAlign: 'center' } }>
            <Typography color="grey.400" variant="body2">
              © 2025 RestaunaX. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
