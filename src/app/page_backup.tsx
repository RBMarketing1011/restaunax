'use client'

import { useState, useEffect } from 'react'
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
  Restaurant,
  LocalShipping,
  ShoppingBag,
  Close,
  Refresh,
  Add
} from '@mui/icons-material'
import { Order, OrderStatus } from '@/types/order'
import CreateOrderDialog from '@/components/CreateOrderDialog'
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
      // In demo mode, just update the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      if (selectedOrder && selectedOrder.id === orderId)
      {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
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
        throw new Error('Failed to update order status')
      }

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      if (selectedOrder && selectedOrder.id === orderId)
      {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (err)
    {
      console.error('Error updating order status:', err)
      setError('Failed to update order status')
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

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Order #{ order.id } • { order.items.length } item(s)
        </Typography>

        <Typography variant="body2" sx={ { mb: 1 } }>
          { order.items.map(item => `${ item.quantity }x ${ item.name }`).join(', ') }
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary">
            ${ order.total.toFixed(2) }
          </Typography>
          <Chip
            label={ statusLabels[ order.status ] }
            size="small"
            sx={ {
              backgroundColor: statusColors[ order.status ],
              color: 'white'
            } }
          />
        </Box>
      </CardContent>

      <CardActions sx={ { pt: 0, px: 2, pb: 1, justifyContent: 'flex-end' } }>
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
            sx={ { minWidth: 'auto', px: 1 } }
          >
            { statusLabels[ getNextStatus(order.status)! ] }
          </Button>
        ) }
      </CardActions>
    </Card>
  )

  if (loading)
  {
    return (
      <Container maxWidth="lg" sx={ { mt: 4, textAlign: 'center' } }>
        <CircularProgress />
        <Typography variant="h6" sx={ { mt: 2 } }>
          Loading orders...
        </Typography>
      </Container>
    )
  }

  return (
    <Box sx={ { height: '100vh', display: 'flex', flexDirection: 'column' } }>
      {/* Sticky Header */ }
      <Box
        sx={ {
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pt: 2,
          pb: 1
        } }
      >
        <Container maxWidth="lg">
          {/* Header - Mobile Responsive */ }
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={ isMobile ? "flex-start" : "center" }
            mb={ 2 }
            flexDirection={ isMobile ? "column" : "row" }
            gap={ isMobile ? 2 : 0 }
          >
            <Box display="flex" alignItems="center">
              <Restaurant sx={ { mr: 1, fontSize: 32 } } />
              <Typography variant={ isMobile ? "h5" : "h4" } component="h1">
                Restaunax Dashboard
              </Typography>
            </Box>
            { !isMobile && (
              <Box display="flex" gap={ 2 }>
                <Button
                  variant="contained"
                  startIcon={ <Add /> }
                  onClick={ () => setCreateOrderOpen(true) }
                  sx={ { color: "white" } }
                >
                  New Order
                </Button>
                <Button
                  variant="outlined"
                  startIcon={ <Refresh /> }
                  onClick={ fetchOrders }
                  disabled={ loading }
                >
                  Refresh
                </Button>
              </Box>
            ) }
          </Box>

          {/* Error Alert */ }
          { error && (
            <Alert
              severity="warning"
              sx={ { mb: 2 } }
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

          {/* Sticky Tabs */ }
          <Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
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
        </Container>
      </Box>

      {/* Scrollable Content Area */ }
      <Box sx={ { flex: 1, overflow: 'auto' } }>
        <Container maxWidth="lg" sx={ { pt: 3, pb: isMobile ? 10 : 4 } }>
          <TabPanel value={ tabValue } index={ 0 }>
            <Box>
              { getOrdersByStatus('pending').map(renderOrderCard) }
              { getOrdersByStatus('pending').length === 0 && (
                <Typography color="text.secondary" textAlign="center">
                  No pending orders
                </Typography>
              ) }
            </Box>
          </TabPanel>

          <TabPanel value={ tabValue } index={ 1 }>
            <Box>
              { getOrdersByStatus('preparing').map(renderOrderCard) }
              { getOrdersByStatus('preparing').length === 0 && (
                <Typography color="text.secondary" textAlign="center">
                  No orders in preparation
                </Typography>
              ) }
            </Box>
          </TabPanel>

          <TabPanel value={ tabValue } index={ 2 }>
            <Box>
              { getOrdersByStatus('ready').map(renderOrderCard) }
              { getOrdersByStatus('ready').length === 0 && (
                <Typography color="text.secondary" textAlign="center">
                  No orders ready for pickup
                </Typography>
              ) }
            </Box>
          </TabPanel>

          <TabPanel value={ tabValue } index={ 3 }>
            <Box>
              { getOrdersByStatus('delivered').map(renderOrderCard) }
              { getOrdersByStatus('delivered').length === 0 && (
                <Typography color="text.secondary" textAlign="center">
                  No delivered orders
                </Typography>
              ) }
            </Box>
          </TabPanel>
        </Container>
      </Box>

      {/* Mobile Floating Action Buttons */ }
      { isMobile && (
        <Box sx={ { position: 'fixed', bottom: 16, right: 16, zIndex: 1000, display: 'flex', gap: 1 } }>
          <Fab
            color="primary"
            onClick={ () => setCreateOrderOpen(true) }
            sx={ { color: 'white' } }
          >
            <Add />
          </Fab>
          <Fab
            color="secondary"
            onClick={ fetchOrders }
            disabled={ loading }
          >
            <Refresh />
          </Fab>
        </Box>
      ) }

      {/* Order Details Drawer */ }
      <Drawer
        anchor="right"
        open={ drawerOpen }
        onClose={ () => setDrawerOpen(false) }
        sx={ {
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 400,
            padding: 2
          }
        } }
      >
        { selectedOrder && (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 2 }>
              <Typography variant="h6">Order Details</Typography>
              <IconButton onClick={ () => setDrawerOpen(false) }>
                <Close />
              </IconButton>
            </Box>

            <Divider sx={ { mb: 2 } } />

            <Box mb={ 2 }>
              <Typography variant="subtitle1" fontWeight="bold">
                { selectedOrder.customerName }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order #{ selectedOrder.id }
              </Typography>
            </Box>

            <Box display="flex" gap={ 1 } mb={ 2 }>
              <Chip
                icon={ getStatusIcon(selectedOrder.orderType) }
                label={ selectedOrder.orderType }
                size="small"
                variant="outlined"
              />
              <Chip
                label={ statusLabels[ selectedOrder.status ] }
                size="small"
                sx={ {
                  backgroundColor: statusColors[ selectedOrder.status ],
                  color: 'white'
                } }
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
              Order placed: { new Date(selectedOrder.createdAt).toLocaleString() }
            </Typography>

            <Divider sx={ { mb: 2 } } />

            <Typography variant="subtitle2" fontWeight="bold" mb={ 1 }>
              Items:
            </Typography>

            { selectedOrder.items.map((item) => (
              <Box key={ item.id } display="flex" justifyContent="space-between" mb={ 1 }>
                <Box>
                  <Typography variant="body2">{ item.name }</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Qty: { item.quantity }
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  ${ (item.price * item.quantity).toFixed(2) }
                </Typography>
              </Box>
            )) }

            <Divider sx={ { my: 2 } } />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 2 }>
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
                  if (nextStatus && selectedOrder)
                  {
                    updateOrderStatus(selectedOrder.id, nextStatus)
                  }
                } }
                sx={ { mt: 2 } }
              >
                Mark as { statusLabels[ getNextStatus(selectedOrder.status)! ] }
              </Button>
            ) }
          </>
        ) }
      </Drawer>

      <CreateOrderDialog
        open={ createOrderOpen }
        onClose={ () => setCreateOrderOpen(false) }
        onOrderCreated={ fetchOrders }
      />
    </Box>
  )
}
