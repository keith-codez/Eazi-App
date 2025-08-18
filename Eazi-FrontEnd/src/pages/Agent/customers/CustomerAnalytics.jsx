import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2']

export default function Dashboard() {
  // Sample/fake data — replace with your actual processed values
  const customerGrowthData = [
    { month: 'Jan', count: 40 },
    { month: 'Feb', count: 70 },
    { month: 'Mar', count: 90 },
    { month: 'Apr', count: 120 },
  ]

  const bookingFrequencyData = [
    { name: '1 booking', value: 30 },
    { name: '2-3 bookings', value: 50 },
    { name: '4+ bookings', value: 20 }
  ]

  const bookingDurationData = [
    { name: '1-3 days', value: 40 },
    { name: '4-7 days', value: 35 },
    { name: '8+ days', value: 25 }
  ]

  const paymentMethodData = [
    { name: 'Mobile Transfer', value: 45 },
    { name: 'Cash', value: 35 },
    { name: 'Debit Card', value: 20 }
  ]

  const leadConversionData = [
    { name: 'Leads', value: 80 },
    { name: 'Converted', value: 50 }
  ]

  const topCustomers = [
    { name: 'John M.', bookings: 5 },
    { name: 'Faith C.', bookings: 4 },
    { name: 'Munya P.', bookings: 3 }
  ]

  return (
    <div className="p-4 grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="text-sm text-gray-500">Total Customers</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">1,250</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="text-sm text-gray-500">Repeat Customers</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">480</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
                <h3 className="text-sm text-gray-500">New Customers (May)</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">65</p>
            </div>
        </div>
        
        {/* Customer Growth */}
        <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-xl font-semibold mb-2">Customer Growth</h2>
            <ResponsiveContainer width="100%" height={250}>
            <LineChart data={customerGrowthData}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
            </ResponsiveContainer>
        </div>
      
        {/* Donut Charts + Conversion Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Donut Charts (Booking Frequency, Duration, Payment Method) */}
            <div className="col-span-2 grid md:grid-cols-3 gap-4">
                {[{
                title: 'Booking Frequency',
                data: bookingFrequencyData
                }, {
                title: 'Booking Duration',
                data: bookingDurationData
                }, {
                title: 'Payment Method',
                data: paymentMethodData
                }].map((chart, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center">
                    <h3 className="text-md font-medium mb-2">{chart.title}</h3>
                    <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                        <Pie
                        data={chart.data}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={30} // 👈 donut hole
                        outerRadius={60}
                        label
                        >
                        {chart.data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                    {/* Chart Legend */}
                    <ul className="mt-2 text-sm w-full">
                    {chart.data.map((entry, i) => (
                        <li key={i} className="flex items-center mb-1">
                        <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span>{entry.label} ({entry.value})</span>
                        </li>
                    ))}
                    </ul>
                </div>
                ))}
        </div>

        {/* Conversion Rate + Top Customers */}
        <div className="flex flex-col gap-6">
          {/* Conversion Chart */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-md font-medium mb-1">Lead to Customer Conversion</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={leadConversionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-md font-medium mb-2">Top Customers</h3>
            <ul className="space-y-2">
              {topCustomers.map((cust, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{cust.name}</span>
                  <span className="text-gray-500">{cust.bookings} bookings</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
