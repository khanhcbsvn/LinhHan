/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, DollarSign, Users, AlertTriangle, LayoutDashboard, ShoppingCart, UserCircle, Search, LogOut } from 'lucide-react';

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3500 },
  { name: 'Wed', revenue: 5500 },
  { name: 'Thu', revenue: 3600 },
  { name: 'Fri', revenue: 6900 },
  { name: 'Sat', revenue: 8500 },
  { name: 'Sun', revenue: 7800 },
];

const lowStockItems = [
  { id: 1, sku: 'SSD-1TB-SAM', name: 'Samsung 1TB SSD NVMe', stock: 2, price: '$120.00' },
  { id: 2, sku: 'RAM-16GB-COR', name: 'Corsair Vengeance 16GB DDR4', stock: 4, price: '$75.00' },
  { id: 3, sku: 'MON-27-DELL', name: 'Dell 27" 4K Monitor', stock: 1, price: '$350.00' },
];

const recentOrders = [
  { id: 'ORD-089', customer: 'Nguyễn Văn A', amount: '$470.00', status: 'Completed', method: 'Transfer' },
  { id: 'ORD-090', customer: 'Trần Thị B', amount: '$120.00', status: 'Completed', method: 'Cash' },
  { id: 'ORD-091', customer: 'Lê C', amount: '$1,200.00', status: 'Pending', method: 'Transfer' },
];

export default function App() {
  return (
    <div className="h-screen w-full bg-slate-50 flex text-slate-800 font-sans overflow-hidden">
      {/* Sidebar - Sleek Theme */}
      <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex shrink-0">
        <div className="text-xl font-bold text-indigo-600 mb-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Package size={20} />
          </div>
          VAI-ERP
        </div>
        <nav className="flex-1 flex flex-col space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<ShoppingCart size={20} />} label="Sales (POS)" />
          <NavItem icon={<Package size={20} />} label="Inventory" />
          <NavItem icon={<Users size={20} />} label="HR & Staff" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 gap-6 min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tổng quan doanh nghiệp</h1>
            <p className="text-[13px] text-slate-500 mt-1">Cập nhật lúc: {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}, {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 text-[13px] font-medium text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
               <UserCircle className="w-5 h-5 text-slate-400" />
            </div>
            Admin: Nguyễn Văn A
          </div>
        </header>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
          <MetricCard title="Doanh thu" value="425.800.000₫" subtitle="↑ 12.5% so với tuần trước" subtitleColor="text-emerald-500" />
          <MetricCard title="Đơn hàng" value="42" subtitle="8 đơn chờ xử lý" subtitleColor="text-slate-500" />
          <MetricCard title="Cảnh báo tồn kho" value="03" subtitle="Cần nhập hàng ngay" subtitleColor="text-red-500" valueColor="text-red-500" />
          <MetricCard title="Nhân sự" value="12/15" subtitle="Đang trong ca làm việc" subtitleColor="text-slate-500" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 shrink-0 h-[380px]">
          {/* Chart Area */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-[15px] text-slate-800">Biểu đồ doanh thu 7 ngày qua</span>
              <span className="text-xs font-semibold text-indigo-600 cursor-pointer">Xem báo cáo chi tiết &rarr;</span>
            </div>
            <div className="flex-1 p-5 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock List */}
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-[15px] text-slate-800">Cảnh báo tồn kho (&lt; 5 đơn vị)</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">SKU</th>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">Linh kiện</th>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">Tồn</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3 border-b border-slate-100 text-slate-800 font-medium">{item.sku}</td>
                      <td className="px-5 py-3 border-b border-slate-100 text-slate-800">{item.name}</td>
                      <td className="px-5 py-3 border-b border-slate-100">
                        {item.stock < 5 ? (
                          <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded border border-red-100 font-semibold text-xs inline-block">
                            0{item.stock}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-800">{item.stock}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)] shrink-0 mb-6">
           <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-[15px] text-slate-800">Đơn hàng gần đây</span>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">Mã đơn</th>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">Khách hàng</th>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">Phương thức</th>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">Tổng tiền</th>
                    <th className="text-left px-5 py-3 bg-[#fcfcfd] text-slate-500 font-semibold border-b border-slate-200">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-5 py-3 border-b border-slate-100 text-slate-800 font-medium">{order.id}</td>
                      <td className="px-5 py-3 border-b border-slate-100 text-slate-800">{order.customer}</td>
                      <td className="px-5 py-3 border-b border-slate-100 text-slate-500">{order.method}</td>
                      <td className="px-5 py-3 border-b border-slate-100 text-slate-800 font-medium">{order.amount}</td>
                      <td className="px-5 py-3 border-b border-slate-100">
                        {order.status === 'Completed' ? (
                          <span className="bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded font-semibold text-xs inline-block">
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="bg-orange-50 text-orange-500 px-2 py-0.5 rounded font-semibold text-xs inline-block border border-orange-100">
                            Chờ xử lý
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
        
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div
      className={`px-4 py-3 rounded-lg text-[14px] font-medium cursor-pointer mb-1 flex items-center gap-3 transition-colors ${
        active 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function MetricCard({ title, value, subtitle, subtitleColor = "text-slate-500", valueColor = "text-slate-800" }: {
  title: string; value: string; subtitle: string; subtitleColor?: string; valueColor?: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">{title}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      <div className={`text-xs mt-1 font-medium ${subtitleColor}`}>{subtitle}</div>
    </div>
  );
}


