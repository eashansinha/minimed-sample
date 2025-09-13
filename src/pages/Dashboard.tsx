import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Activity,
  Bell,
  ChevronDown,
  Droplet,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  Wifi,
  FileText,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  generateGlucoseReadings, 
  generateDeviceStatus, 
  generateDailySummary,
  generateInsulinDeliveries 
} from '@/utils/mockData';
import { GlucoseReading } from '@/types/glucose';
import { DeviceStatus } from '@/types/device';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [dailySummary, setDailySummary] = useState<ReturnType<typeof generateDailySummary> | null>(null);

  useEffect(() => {
    // Initialize mock data
    setGlucoseReadings(generateGlucoseReadings(24));
    setDeviceStatus(generateDeviceStatus());
    setDailySummary(generateDailySummary());

    // Simulate real-time updates
    const interval = setInterval(() => {
      setGlucoseReadings(generateGlucoseReadings(24));
      setDeviceStatus(generateDeviceStatus());
      setDailySummary(generateDailySummary());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
      case 'rising_quickly':
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case 'falling':
      case 'falling_quickly':
        return <ArrowDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-green-500" />;
    }
  };

  const getGlucoseColor = (value: number) => {
    if (value < 70) return 'text-red-600';
    if (value > 180) return 'text-orange-600';
    return 'text-green-600';
  };

  // Prepare chart data
  const chartData = glucoseReadings.map(reading => ({
    time: format(reading.timestamp, 'HH:mm'),
    value: reading.value,
    timestamp: reading.timestamp
  }));

  // Time in Range pie chart data
  const timeInRangeData = dailySummary ? [
    { name: 'Below Range', value: dailySummary.timeInRange.below, color: '#ef4444' },
    { name: 'In Range', value: dailySummary.timeInRange.inRange, color: '#10b981' },
    { name: 'Above Range', value: dailySummary.timeInRange.above, color: '#f59e0b' }
  ] : [];

  const sidebarItems = [
    { icon: Home, label: 'Overview', active: true },
    { icon: Activity, label: 'Glucose Monitoring' },
    { icon: Droplet, label: 'Insulin Management' },
    { icon: Wifi, label: 'Device Status' },
    { icon: FileText, label: 'Reports' },
    { icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">MiniMed Dashboard</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:inline">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform duration-300 mt-16 lg:mt-0`}>
          <div className="p-4">
            <nav className="space-y-1">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-medical-blue/10 text-medical-blue' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {/* Welcome Message */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-600">
              Here's your diabetes management overview for today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Current Glucose */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Current Glucose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${dailySummary ? getGlucoseColor(dailySummary.currentGlucose.value) : ''}`}>
                      {dailySummary?.currentGlucose.value || '--'}
                    </p>
                    <p className="text-sm text-gray-500">mg/dL</p>
                  </div>
                  <div className="flex flex-col items-center">
                    {dailySummary && getTrendIcon(dailySummary.currentGlucose.trend)}
                    <span className="text-xs text-gray-500 mt-1">
                      {dailySummary?.currentGlucose.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time in Range */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Time in Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {dailySummary ? Math.round(dailySummary.timeInRange.inRange) : '--'}%
                    </p>
                    <p className="text-sm text-gray-500">70-180 mg/dL</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            {/* Total Insulin */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Insulin Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      {dailySummary?.totalInsulin || '--'}
                    </p>
                    <p className="text-sm text-gray-500">units</p>
                  </div>
                  <Droplet className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* Device Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pump Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Battery</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={deviceStatus?.batteryLevel} className="w-20 h-2" />
                      <span className="text-sm font-medium">{deviceStatus?.batteryLevel.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Reservoir</span>
                    <span className="text-sm font-medium">{deviceStatus?.reservoirLevel.toFixed(0)}U</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Glucose Trend Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>24-Hour Glucose Trend</CardTitle>
                <CardDescription>
                  Your glucose levels over the past 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[40, 250]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" />
                    <ReferenceLine y={125} stroke="#10b981" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorGlucose)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Time in Range Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Time in Range</CardTitle>
                <CardDescription>
                  Distribution of glucose levels today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={timeInRangeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {timeInRangeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {timeInRangeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest insulin deliveries and glucose readings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generateInsulinDeliveries(1).slice(0, 5).map((delivery, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        delivery.type === 'bolus' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {delivery.type === 'bolus' ? (
                          <Zap className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Droplet className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {delivery.type === 'bolus' ? 'Bolus' : 'Basal'} Delivery
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(delivery.timestamp, 'HH:mm')} - {delivery.amount.toFixed(1)} units
                          {delivery.carbsEntered && ` • ${delivery.carbsEntered}g carbs`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(delivery.timestamp, 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
