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
  CardActions,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Fab,
  Divider
} from '@mui/material'
import
{
  LocalShipping,
  ShoppingBag,
  Close,
  Refresh,
  Add,
  Restaurant
} from '@mui/icons-material'
import { Order, OrderStatus } from '@/types/order'
import CreateOrderDialog from '@/components/CreateOrderDialog'
import DashboardLayout from '@/components/DashboardLayout'
import { sampleOrders } from '@/lib/sampleData'

interface TabPanelProps
{
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel (props: TabPanelProps)
{
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={ value !== index }
      id={ `order-tabpanel-${ index }` }
      aria-labelledby={ `order-tab-${ index }` }
      { ...other }
    >
      { value === index && <Box sx={ { pt: 3 } }>{ children }</Box> }
    </div>
  )
}

const statusColors = {
  pending: '#ff9800',
  preparing: '#2196f3',
  ready: '#4caf50',
  delivered: '#9e9e9e'
}

const statusLabels = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  delivered: 'Delivered'
}

export default function OrderDashboard ()
{
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ orders, setOrders ] = useState<Order[]>([])
  const [ selectedOrder, setSelectedOrder ] = useState<Order | null>(null)
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)
  const [ tabValue, setTabValue ] = useState(0)
  const [ createOrderOpen, setCreateOrderOpen ] = useState(false)
  const [ demoMode, setDemoMode ] = useState(false)
  const [ drawerOpen, setDrawerOpen ] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Redirect to signin if not authenticated
  useEffect(() =>
  {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin')
  }, [ session, status, router ])

  const fetchOrders = async () =>
  {
    try
    {
      setLoading(true)
      const response = await fetch('/api/orders')
      if (!response.ok)
      {
        if (response.status === 500)
        {
          // Fallback to demo mode if database connection fails
          setDemoMode(true)
          setOrders(sampleOrders)
          setError('Database connection failed. Using demo data.')
        } else
        {
          throw new Error('Failed to fetch orders')
        }
      } else
      {
        const data = await response.json()
        setOrders(data)
        setDemoMode(false)
        setError(null)
      }
    } catch (err)
    {
      console.error('Error fetching orders:', err)
      // Fallback to demo mode
      setDemoMode(true)
      setOrders(sampleOrders)
      setError('Failed to connect to database. Using demo data.')
    } finally
    {
      setLoading(false)
    }
  }

  useEffect(() =>
  {
    fetchOrders()
  }, [])

  const getOrdersByStatus = (status: OrderStatus) =>
  {
    return orders.filter(order => order.status === status)
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) =>
  {
    if (demoMode)
    {
      // In demo mode, update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
      return
    }

    try
    {
      const response = await fetch(`/api/orders/${ orderId }`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok)
      {
        throw new Error('Failed to update order')
      }

      const updatedOrder = await response.json()
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      )
      setSelectedOrder(updatedOrder)
    } catch (error)
    {
      console.error('Error updating order:', error)
      alert('Failed to update order status')
    }
  }

  const getStatusIcon = (orderType: string) =>
  {
    switch (orderType)
    {
      case 'delivery':
        return <LocalShipping />
      case 'pickup':
        return <ShoppingBag />
      default:
        return <Restaurant />
    }
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null =>
  {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
      delivered: null
    }
    return statusFlow[ currentStatus ]
  }

  const handleOrderClick = (order: Order) =>
  {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const renderOrderCard = (order: Order) => (
    <Card
      key={ order.id }
      sx={ {
        mb: 2,
        cursor: 'pointer',
        '&:hover': { elevation: 4 },
        transition: 'box-shadow 0.2s'
      } }
      onClick={ () => handleOrderClick(order) }
    >
      <CardContent sx={ { pb: 1 } }>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={ 1 }>
          <Typography variant="h6" component="h3">
            { order.customerName }
          </Typography>
          <Chip
            icon={ getStatusIcon(order.orderType) }
            label={ order.orderType }
            size="small"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={ 1 }>
          Order #{ order.id }
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={ 2 }>
          { order.items.length } item(s) • ${ order.total.toFixed(2) }
        </Typography>

        <Chip
          label={ statusLabels[ order.status ] }
          size="small"
          sx={ {
            backgroundColor: statusColors[ order.status ],
            color: 'white',
            fontWeight: 'bold'
          } }
        />
      </CardContent>

      <CardActions sx={ { pt: 0 } }>
        { getNextStatus(order.status) && (
          <Button
            size="small"
            variant="contained"
            onClick={ (e) =>
            {
              e.stopPropagation()
              const nextStatus = getNextStatus(order.status)
              if (nextStatus)
              {
                updateOrderStatus(order.id, nextStatus)
              }
            } }
          >
            Mark as { statusLabels[ getNextStatus(order.status)! ] }
          </Button>
        ) }
      </CardActions>
    </Card>
  )

  if (loading && orders.length === 0)
  {
    return (
      <DashboardLayout title="Orders">
        <Container maxWidth="lg" sx={ { py: 8, textAlign: 'center' } }>
          <CircularProgress />
          <Typography variant="h6" sx={ { mt: 2 } }>
            Loading orders...
          </Typography>
        </Container>
      </DashboardLayout>
    )
  }

  if (!session)
  {
    return null // Will redirect
  }

  return (
    <DashboardLayout title="Orders">
      <Container maxWidth="lg" sx={ { py: 3 } }>
        {/* Header with Actions */ }
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 3 }>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Orders Management
          </Typography>
          <Box display="flex" gap={ 2 }>
            <Button
              variant="contained"
              startIcon={ <Add /> }
              onClick={ () => setCreateOrderOpen(true) }
            >
              { isMobile ? 'New' : 'New Order' }
            </Button>
            <Button
              variant="outlined"
              startIcon={ <Refresh /> }
              onClick={ fetchOrders }
              disabled={ loading }
            >
              { isMobile ? '' : 'Refresh' }
              { isMobile && <Refresh /> }
            </Button>
          </Box>
        </Box>

        {/* Error Alert */ }
        { error && (
          <Alert
            severity="warning"
            sx={ { mb: 3 } }
            action={
              demoMode && (
                <Button color="inherit" size="small" onClick={ fetchOrders }>
                  Try Again
                </Button>
              )
            }
          >
            { error }
            { demoMode && " - All changes are temporary and won't be saved." }
          </Alert>
        ) }

        {/* Tabs */ }
        <Box sx={ { borderBottom: 1, borderColor: 'divider', mb: 3 } }>
          <Tabs
            value={ tabValue }
            onChange={ (_, newValue) => setTabValue(newValue) }
            variant={ isMobile ? "scrollable" : "standard" }
            scrollButtons="auto"
          >
            <Tab label={ `Pending (${ getOrdersByStatus('pending').length })` } />
            <Tab label={ `Preparing (${ getOrdersByStatus('preparing').length })` } />
            <Tab label={ `Ready (${ getOrdersByStatus('ready').length })` } />
            <Tab label={ `Delivered (${ getOrdersByStatus('delivered').length })` } />
          </Tabs>
        </Box>

        {/* Tab Panels */ }
        <TabPanel value={ tabValue } index={ 0 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('pending').map(renderOrderCard) }
            { getOrdersByStatus('pending').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No pending orders
              </Typography>
            ) }
          </Box>
        </TabPanel>

        <TabPanel value={ tabValue } index={ 1 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('preparing').map(renderOrderCard) }
            { getOrdersByStatus('preparing').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No orders being prepared
              </Typography>
            ) }
          </Box>
        </TabPanel>

        <TabPanel value={ tabValue } index={ 2 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('ready').map(renderOrderCard) }
            { getOrdersByStatus('ready').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No orders ready
              </Typography>
            ) }
          </Box>
        </TabPanel>

        <TabPanel value={ tabValue } index={ 3 }>
          <Box sx={ { display: 'grid', gap: 2 } }>
            { getOrdersByStatus('delivered').map(renderOrderCard) }
            { getOrdersByStatus('delivered').length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={ 4 }>
                No delivered orders
              </Typography>
            ) }
          </Box>
        </TabPanel>
      </Container>

      {/* Mobile Floating Action Button */ }
      { isMobile && (
        <Fab
          color="primary"
          onClick={ () => setCreateOrderOpen(true) }
          sx={ {
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          } }
        >
          <Add />
        </Fab>
      ) }

      {/* Order Details Drawer */ }
      <Drawer
        anchor="right"
        open={ drawerOpen }
        onClose={ () => setDrawerOpen(false) }
        sx={ {
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 500,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
          },
        } }
      >
        { selectedOrder && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 2 }>
              <Typography variant="h5" fontWeight="bold">
                { selectedOrder.customerName }
              </Typography>
              <IconButton onClick={ () => setDrawerOpen(false) }>
                <Close />
              </IconButton>
            </Box>

            <Typography variant="subtitle1" color="text.secondary" mb={ 2 }>
              Order #{ selectedOrder.id }
            </Typography>

            <Box display="flex" gap={ 1 } mb={ 2 }>
              <Chip
                icon={ getStatusIcon(selectedOrder.orderType) }
                label={ selectedOrder.orderType }
                variant="outlined"
              />
              <Chip
                label={ statusLabels[ selectedOrder.status ] }
                sx={ {
                  backgroundColor: statusColors[ selectedOrder.status ],
                  color: 'white',
                } }
              />
            </Box>

            <Typography variant="body2" color="text.secondary" mb={ 3 }>
              Order placed: { new Date(selectedOrder.createdAt).toLocaleString() }
            </Typography>

            <Divider sx={ { mb: 2 } } />

            <Typography variant="h6" mb={ 2 }>
              Items
            </Typography>

            { selectedOrder.items.map((item) => (
              <Box
                key={ item.id }
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={ 1 }
                borderBottom="1px solid"
                borderColor="divider"
              >
                <Box>
                  <Typography variant="body1">{ item.name }</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: { item.quantity }
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight="bold">
                  ${ (item.price * item.quantity).toFixed(2) }
                </Typography>
              </Box>
            )) }

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={ 2 } mb={ 3 }>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${ selectedOrder.total.toFixed(2) }</Typography>
            </Box>

            { getNextStatus(selectedOrder.status) && (
              <Button
                variant="contained"
                fullWidth
                startIcon={ getStatusIcon(getNextStatus(selectedOrder.status)!) }
                onClick={ () =>
                {
                  const nextStatus = getNextStatus(selectedOrder.status)
                  if (nextStatus)
                  {
                    updateOrderStatus(selectedOrder.id, nextStatus)
                  }
                } }
                sx={ { mt: 'auto' } }
              >
                Mark as { statusLabels[ getNextStatus(selectedOrder.status)! ] }
              </Button>
            ) }
          </>
        ) }
      </Drawer>

      {/* Create Order Dialog */ }
      <CreateOrderDialog
        open={ createOrderOpen }
        onClose={ () => setCreateOrderOpen(false) }
        onOrderCreated={ fetchOrders }
      />
    </DashboardLayout>
  )
}
