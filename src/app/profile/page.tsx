'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import
{
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Alert,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Chip
} from '@mui/material'
import
{
  Delete,
  PersonAdd,
  Warning
} from '@mui/icons-material'
import DashboardLayout from '@/components/DashboardLayout'

interface UserData
{
  id: string
  name: string
  email: string
  accountId: string
  isAccountOwner: boolean
  account?: {
    id: string
    name: string
    ownerId: string
    users: Array<{
      id: string
      name: string
      email: string
    }>
  }
}

export default function ProfilePage ()
{
  const { data: session, update } = useSession()
  const router = useRouter()
  const [ loading, setLoading ] = useState(true)
  const [ saving, setSaving ] = useState(false)
  const [ userData, setUserData ] = useState<UserData | null>(null)
  const [ error, setError ] = useState<string | null>(null)
  const [ success, setSuccess ] = useState<string | null>(null)

  // Form states
  const [ name, setName ] = useState('')
  const [ email, setEmail ] = useState('')
  const [ currentPassword, setCurrentPassword ] = useState('')
  const [ newPassword, setNewPassword ] = useState('')
  const [ confirmPassword, setConfirmPassword ] = useState('')
  const [ accountName, setAccountName ] = useState('')

  // Dialog states
  const [ deleteAccountDialog, setDeleteAccountDialog ] = useState(false)
  const [ addUserDialog, setAddUserDialog ] = useState(false)
  const [ newUserEmail, setNewUserEmail ] = useState('')

  // Redirect to signin if not authenticated
  useEffect(() =>
  {
    if (session === null) router.push('/auth/signin')
  }, [ session, router ])

  // Fetch user data
  const fetchUserData = async () =>
  {
    try
    {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (!response.ok)
      {
        throw new Error('Failed to fetch user data')
      }
      const data = await response.json()
      setUserData(data)
      setName(data.name || '')
      setEmail(data.email || '')
      setAccountName(data.account?.name || '')
    } catch (err)
    {
      console.error('Error fetching user data:', err)
      setError('Failed to load profile data')
    } finally
    {
      setLoading(false)
    }
  }

  useEffect(() =>
  {
    if (session)
    {
      fetchUserData()
    }
  }, [ session ])

  const handleUpdateProfile = async () =>
  {
    if (!name.trim())
    {
      setError('Name is required')
      return
    }

    try
    {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() !== userData?.email ? email.trim() : undefined
        })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const data = await response.json()
      setSuccess(data.message)
      await update() // Refresh session data
      await fetchUserData() // Refresh user data
    } catch (err: any)
    {
      setError(err.message)
    } finally
    {
      setSaving(false)
    }
  }

  const handleChangePassword = async () =>
  {
    if (!currentPassword || !newPassword || !confirmPassword)
    {
      setError('All password fields are required')
      return
    }

    if (newPassword !== confirmPassword)
    {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6)
    {
      setError('New password must be at least 6 characters')
      return
    }

    try
    {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any)
    {
      setError(err.message)
    } finally
    {
      setSaving(false)
    }
  }

  const handleUpdateAccountName = async () =>
  {
    if (!accountName.trim())
    {
      setError('Account name is required')
      return
    }

    try
    {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/account/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountName.trim()
        })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update account name')
      }

      setSuccess('Account name updated successfully')
      await fetchUserData()
    } catch (err: any)
    {
      setError(err.message)
    } finally
    {
      setSaving(false)
    }
  }

  const handleAddUser = async () =>
  {
    if (!newUserEmail.trim())
    {
      setError('Email is required')
      return
    }

    try
    {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/account/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail.trim()
        })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add user')
      }

      setSuccess('User invitation sent successfully')
      setNewUserEmail('')
      setAddUserDialog(false)
      await fetchUserData()
    } catch (err: any)
    {
      setError(err.message)
    } finally
    {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () =>
  {
    try
    {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/account/delete', {
        method: 'DELETE'
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete account')
      }

      router.push('/auth/signin?message=Account deleted successfully')
    } catch (err: any)
    {
      setError(err.message)
      setSaving(false)
    }
  }

  const handleRemoveUser = async (userId: string) =>
  {
    try
    {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/account/remove-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok)
      {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove user')
      }

      setSuccess('User removed successfully')
      await fetchUserData()
    } catch (err: any)
    {
      setError(err.message)
    } finally
    {
      setSaving(false)
    }
  }

  if (loading)
  {
    return (
      <DashboardLayout title="Profile">
        <Container maxWidth="lg" sx={ { py: 8, textAlign: 'center' } }>
          <CircularProgress />
          <Typography variant="h6" sx={ { mt: 2 } }>
            Loading profile...
          </Typography>
        </Container>
      </DashboardLayout>
    )
  }

  if (!session || !userData)
  {
    return null
  }

  return (
    <DashboardLayout title="Profile">
      <Container maxWidth="lg" sx={ { py: 3 } }>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={ { mb: 3, color: 'black' } }>
          Profile Settings
        </Typography>

        {/* Error/Success Messages */ }
        { error && (
          <Alert severity="error" sx={ { mb: 3 } } onClose={ () => setError(null) }>
            { error }
          </Alert>
        ) }
        { success && (
          <Alert severity="success" sx={ { mb: 3 } } onClose={ () => setSuccess(null) }>
            { success }
          </Alert>
        ) }

        <Stack spacing={ 3 }>
          {/* Personal Information */ }
          <Card>
            <CardHeader title="Personal Information" />
            <CardContent>
              <Stack spacing={ 3 }>
                <TextField
                  label="Full Name"
                  value={ name }
                  onChange={ (e) => setName(e.target.value) }
                  fullWidth
                  required
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={ email }
                  onChange={ (e) => setEmail(e.target.value) }
                  fullWidth
                  required
                  helperText={ email !== userData.email ? "Changing email will require verification" : "" }
                />
                <Box>
                  <Button
                    variant="contained"
                    onClick={ handleUpdateProfile }
                    disabled={ saving }
                    sx={ { bgcolor: '#ff6b35', color: 'white', '&:hover': { bgcolor: '#e55a2b' } } }
                  >
                    { saving ? <CircularProgress size={ 20 } color="inherit" /> : 'Update Profile' }
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Change Password */ }
          <Card>
            <CardHeader title="Change Password" />
            <CardContent>
              <Stack spacing={ 3 }>
                <TextField
                  label="Current Password"
                  type="password"
                  value={ currentPassword }
                  onChange={ (e) => setCurrentPassword(e.target.value) }
                  fullWidth
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={ newPassword }
                  onChange={ (e) => setNewPassword(e.target.value) }
                  fullWidth
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  value={ confirmPassword }
                  onChange={ (e) => setConfirmPassword(e.target.value) }
                  fullWidth
                />
                <Box>
                  <Button
                    variant="contained"
                    onClick={ handleChangePassword }
                    disabled={ saving }
                    sx={ { bgcolor: '#ff6b35', color: 'white', '&:hover': { bgcolor: '#e55a2b' } } }
                  >
                    { saving ? <CircularProgress size={ 20 } color="inherit" /> : 'Change Password' }
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Account Management (Owner Only) */ }
          { userData.isAccountOwner && (
            <>
              <Card>
                <CardHeader
                  title="Account Management"
                  subheader="You are the account owner"
                />
                <CardContent>
                  <Stack spacing={ 3 }>
                    <TextField
                      label="Account Name"
                      value={ accountName }
                      onChange={ (e) => setAccountName(e.target.value) }
                      fullWidth
                      required
                    />
                    <Box>
                      <Button
                        variant="contained"
                        onClick={ handleUpdateAccountName }
                        disabled={ saving }
                        sx={ { bgcolor: '#ff6b35', color: 'white', '&:hover': { bgcolor: '#e55a2b' } } }
                      >
                        { saving ? <CircularProgress size={ 20 } color="inherit" /> : 'Update Account Name' }
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Account Users */ }
              <Card>
                <CardHeader
                  title="Account Users"
                  action={
                    <Button
                      variant="outlined"
                      startIcon={ <PersonAdd /> }
                      onClick={ () => setAddUserDialog(true) }
                      sx={ { borderColor: '#ff6b35', color: '#ff6b35' } }
                    >
                      Add User
                    </Button>
                  }
                />
                <CardContent>
                  <List>
                    { userData.account?.users.map((user) => (
                      <ListItem
                        key={ user.id }
                        secondaryAction={
                          user.id !== userData.id ? (
                            <IconButton
                              edge="end"
                              onClick={ () => handleRemoveUser(user.id) }
                              disabled={ saving }
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          ) : (
                            <Chip
                              label="Owner"
                              size="small"
                              color="primary"
                              sx={ { color: 'white' } }
                            />
                          )
                        }
                      >
                        <ListItemText
                          primary={ user.name }
                          secondary={ user.email }
                        />
                      </ListItem>
                    )) }
                  </List>
                </CardContent>
              </Card>

              {/* Danger Zone */ }
              <Card sx={ { borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' } }>
                <CardHeader
                  title="Danger Zone"
                  titleTypographyProps={ { color: 'error.main' } }
                />
                <CardContent>
                  <Alert severity="warning" sx={ { mb: 2 } }>
                    <Typography variant="body2">
                      Deleting your account will permanently remove all data including orders, users, and settings.
                      This action cannot be undone.
                    </Typography>
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={ <Delete /> }
                    onClick={ () => setDeleteAccountDialog(true) }
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </>
          ) }
        </Stack>

        {/* Add User Dialog */ }
        <Dialog open={ addUserDialog } onClose={ () => setAddUserDialog(false) } maxWidth="sm" fullWidth>
          <DialogTitle>Add User to Account</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={ newUserEmail }
              onChange={ (e) => setNewUserEmail(e.target.value) }
              sx={ { mt: 2 } }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => setAddUserDialog(false) }>Cancel</Button>
            <Button
              onClick={ handleAddUser }
              variant="contained"
              disabled={ saving }
              sx={ { bgcolor: '#ff6b35', color: 'white', '&:hover': { bgcolor: '#e55a2b' } } }
            >
              { saving ? <CircularProgress size={ 20 } color="inherit" /> : 'Send Invitation' }
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */ }
        <Dialog open={ deleteAccountDialog } onClose={ () => setDeleteAccountDialog(false) }>
          <DialogTitle sx={ { color: 'error.main' } }>
            <Warning sx={ { mr: 1, verticalAlign: 'middle' } } />
            Delete Account
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you absolutely sure you want to delete your account and all associated data?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => setDeleteAccountDialog(false) }>Cancel</Button>
            <Button
              onClick={ handleDeleteAccount }
              color="error"
              variant="contained"
              disabled={ saving }
            >
              { saving ? <CircularProgress size={ 20 } color="inherit" /> : 'Delete Account' }
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  )
}
