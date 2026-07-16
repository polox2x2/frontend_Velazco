import { useState, useEffect, useMemo } from 'react';
import { Bell, User, ShoppingBag, AlertTriangle, DollarSign, Download, Calendar, FileText, TrendingUp, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from './Dashboard.module.css';
import { adminApi } from '../../../services/api';

const COLORS = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);

  // States for data
  const [dailySalesTotal, setDailySalesTotal] = useState(0);
  const [dailyOrdersCount, setDailyOrdersCount] = useState(0);
  const [weeklySalesData, setWeeklySalesData] = useState<any[]>([]);
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  // State for Reportes
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Default to first day of current month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    if (activeTab === 'reportes') {
      fetchReportsData();
    }
  }, [activeTab]);

  const fetchReportsData = async () => {
    try {
      setLoadingReports(true);
      // Fetch a larger dataset, filtering will happen on frontend for simplicity
      const res = await adminApi.getDeliveredOrders(0, 2000);
      setDeliveredOrders(res.content || []);
    } catch (error) {
      console.error("Error fetching reports", error);
    } finally {
      setLoadingReports(false);
    }
  };

  // Filter and compute KPIs
  const { filteredReports, kpis } = useMemo(() => {
    if (!deliveredOrders.length) return { filteredReports: [], kpis: { total: 0, count: 0, avg: 0 } };

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = deliveredOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= start && orderDate <= end;
    });

    let totalRevenue = 0;
    filtered.forEach(order => {
      const orderTotal = order.details ? order.details.reduce((sum: number, d: any) => sum + (d.unitPrice * d.quantity), 0) : 0;
      totalRevenue += orderTotal;
    });

    return {
      filteredReports: filtered,
      kpis: {
        total: totalRevenue,
        count: filtered.length,
        avg: filtered.length > 0 ? totalRevenue / filtered.length : 0
      }
    };
  }, [deliveredOrders, startDate, endDate]);

  const exportToCSV = () => {
    if (filteredReports.length === 0) return;
    
    // Add BOM for Excel UTF-8 support and use semicolon for column division
    let csv = '\uFEFFCliente;Fecha Orden;Fecha Entrega;Total (S/.);Metodo Pago;Repartidor\n';
    
    filteredReports.forEach(order => {
      const total = order.details ? order.details.reduce((sum: number, d: any) => sum + (d.unitPrice * d.quantity), 0) : 0;
      
      const clientName = `"${(order.clientName || '').replace(/"/g, '""')}"`;
      const date = `"${new Date(order.date).toLocaleString()}"`;
      const deliveryDate = `"${order.deliveryDate ? new Date(order.deliveryDate).toLocaleString() : ''}"`;
      // Convert to string and replace period with comma for decimals if Excel expects it, though string is usually fine.
      const totalStr = `"${total.toFixed(2).replace('.', ',')}"`;
      const paymentMethod = `"${(order.paymentMethod || 'N/A').replace(/"/g, '""')}"`;
      const deliveredBy = `"${(order.deliveredBy?.name || 'N/A').replace(/"/g, '""')}"`;

      csv += `${clientName};${date};${deliveryDate};${totalStr};${paymentMethod};${deliveredBy}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredReports.length === 0) return;
    
    const doc = new jsPDF('landscape');
    
    // Title & Header
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text('Velazco - Reporte de Ventas', 14, 22);
    
    // Date Range
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periodo: ${startDate} al ${endDate}`, 14, 30);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 36);
    
    // KPIs Background
    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 42, 269, 25, 3, 3, 'FD');
    
    // KPIs Data
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Ingresos Totales:`, 20, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/. ${kpis.total.toFixed(2)}`, 20, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Pedidos:`, 110, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`${kpis.count}`, 110, 60);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Ticket Promedio:`, 200, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/. ${kpis.avg.toFixed(2)}`, 200, 60);
    
    doc.setFont('helvetica', 'normal');

    // Table
    const tableColumn = ["ID", "Cliente", "Fecha Orden", "Fecha Entrega", "Método Pago", "Repartidor", "Total"];
    const tableRows: any[] = [];

    filteredReports.forEach(order => {
      const total = order.details ? order.details.reduce((sum: number, d: any) => sum + (d.unitPrice * d.quantity), 0) : 0;
      const orderData = [
        `#${order.id}`,
        order.clientName,
        new Date(order.date).toLocaleString(),
        order.deliveryDate ? new Date(order.deliveryDate).toLocaleString() : '-',
        order.paymentMethod || 'N/A',
        order.deliveredBy?.name || 'N/A',
        `S/. ${total.toFixed(2)}`
      ];
      tableRows.push(orderData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4, halign: 'center' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left', cellWidth: 50 },
        2: { halign: 'center', cellWidth: 40 },
        3: { halign: 'center', cellWidth: 40 },
        4: { halign: 'center', cellWidth: 35 },
        5: { halign: 'left', cellWidth: 45 },
        6: { halign: 'right', fontStyle: 'bold', cellWidth: 35 }
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 75, left: 14, right: 14 },
      didDrawPage: function (data: any) {
        const str = 'Página ' + ((doc as any).internal.getNumberOfPages ? (doc as any).internal.getNumberOfPages() : '');
        doc.setFontSize(10);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    doc.save(`reporte_ventas_${startDate}_al_${endDate}.pdf`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [daily, weekly, top, payments, lowStock] = await Promise.all([
          adminApi.getDailySales(),
          adminApi.getWeeklySales(),
          adminApi.getTopProducts(),
          adminApi.getPaymentMethods(),
          adminApi.getLowStockProducts()
        ]);

        // Daily (Returns a List of DailySaleResponseDto)
        if (Array.isArray(daily) && daily.length > 0) {
          // Assuming the first item is the most recent day (today)
          const today = daily[0];
          setDailySalesTotal(today.totalSales || 0);
          setDailyOrdersCount(today.salesCount || 0);
        }

        // Weekly (Returns a List of WeeklySaleResponseDto)
        if (Array.isArray(weekly) && weekly.length > 0) {
          const currentWeek = weekly[0];
          if (currentWeek.orders) {
             const mappedWeekly = currentWeek.orders.map((o: any) => ({
               name: o.dayOfWeek,
               sales: o.orderTotal
             }));
             setWeeklySalesData(mappedWeekly);
          }
        }

        // Top Products
        if (Array.isArray(top)) {
          const mappedTop = top.map(t => ({
            name: t.productName,
            sales: t.totalQuantitySold
          }));
          setTopProductsData(mappedTop);
        }

        // Payment Methods
        if (Array.isArray(payments)) {
          const mappedPayments = payments.map((p, i) => ({
            name: p.paymentMethod,
            value: p.percentage,
            color: COLORS[i % COLORS.length]
          }));
          setPaymentMethodsData(mappedPayments);
        }

        // Low Stock (Returns an object with 'products' array)
        if (lowStock && lowStock.products) {
          setLowStockProducts(lowStock.products);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn}><Bell size={20} /></button>
          <button className={styles.iconBtn}><User size={20} /></button>
        </div>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Vista General
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'reportes' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('reportes')}
        >
          Reportes
        </button>
      </div>

      {loading ? (
        <div style={{padding: '2rem', textAlign: 'center'}}>Cargando métricas...</div>
      ) : activeTab === 'general' ? (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>Ventas del Día</span>
                <DollarSign size={20} className={styles.statIconLight} />
              </div>
              <div className={styles.statValue}>S/. {dailySalesTotal.toFixed(2)}</div>
              <div className={styles.statSubtitle}>Actualizado hoy</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>Pedidos del Día</span>
                <ShoppingBag size={20} className={styles.statIconLight} />
              </div>
              <div className={styles.statValue}>{dailyOrdersCount}</div>
              <div className={styles.statSubtitle}>Actualizado hoy</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statTitle}>Productos Bajos</span>
                <AlertTriangle size={20} className={styles.statIconLight} />
              </div>
              <div className={styles.statValue}>{lowStockProducts.length}</div>
              <div className={styles.statSubtitle}>Requieren reposición</div>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            {/* Ventas Semanales */}
            <div className={styles.chartCard}>
              <h2>Ventas Semanales</h2>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                    <RechartsTooltip cursor={{ fill: '#f5f5f5' }} />
                    <Bar dataKey="sales" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ventas por Método de Pago */}
            <div className={styles.chartCard}>
              <h2>Ventas por Método de Pago</h2>
              <div className={styles.chartWrapper}>
                {paymentMethodsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        labelLine={false}
                        label={({ cx, cy, midAngle = 0, outerRadius, value, name }) => {
                          const radius = outerRadius + 25;
                          const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                          const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                          return (
                            <text x={x} y={y} fill="#888" fontSize="12" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                              {`${name} ${value.toFixed(1)}%`}
                            </text>
                          );
                        }}
                      >
                        {paymentMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{textAlign: 'center', paddingTop: '2rem', color: '#888'}}>Sin datos de pago</div>
                )}
              </div>
            </div>

            {/* Productos Más Vendidos */}
            <div className={styles.chartCard}>
              <h2>Productos Más Vendidos (Mes)</h2>
              <div className={styles.horizontalBarsContainer}>
                {topProductsData.length > 0 ? topProductsData.map((prod, idx) => {
                  const maxSales = Math.max(...topProductsData.map(p => p.sales));
                  const percentage = maxSales > 0 ? (prod.sales / maxSales) * 100 : 0;
                  return (
                    <div key={idx} className={styles.horizontalBarRow}>
                      <div className={styles.hBarLabelGroup}>
                        <span className={styles.hBarName}>{prod.name}</span>
                        <span className={styles.hBarValue}>{prod.sales}</span>
                      </div>
                      <div className={styles.hBarTrack}>
                        <div className={styles.hBarFill} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <div style={{color: '#888'}}>No hay ventas registradas en el mes.</div>}
              </div>
            </div>

            {/* Productos con Bajo Stock */}
            <div className={styles.chartCard}>
              <h2>Productos con Bajo Stock</h2>
              <div className={styles.lowStockList}>
                {lowStockProducts.length > 0 ? lowStockProducts.map((item: any) => (
                  <div key={item.id} className={styles.lowStockRow}>
                    <div className={styles.lsInfo}>
                      <AlertTriangle size={16} className={item.stock <= 5 ? styles.iconCritical : styles.iconWarning} />
                      <span className={styles.lsName}>{item.name}</span>
                    </div>
                    <div className={styles.lsStock}>
                      Stock: <span className={item.stock <= 5 ? styles.textCritical : styles.textWarning}>{item.stock}</span>
                    </div>
                  </div>
                )) : <div style={{color: '#888'}}>Todos los productos tienen stock suficiente.</div>}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.reportesContainer}>
          <div className={styles.reportesHeader}>
            <div>
              <h2>Historial de Ventas Completadas</h2>
              <p style={{color: '#666', fontSize: '0.9rem', marginTop: '4px'}}>
                Reporte gerencial de ventas pagadas y entregadas.
              </p>
            </div>
            
            <div className={styles.reportesActions}>
              <div className={styles.dateFilters}>
                <div>
                  <label>Desde: </label>
                  <input type="date" className={styles.dateInput} value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label>Hasta: </label>
                  <input type="date" className={styles.dateInput} value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>

              <button className={styles.exportBtn} onClick={exportToCSV} disabled={filteredReports.length === 0}>
                <Download size={16} /> CSV
              </button>
              <button className={`${styles.exportBtn} ${styles.exportPdfBtn}`} onClick={exportToPDF} disabled={filteredReports.length === 0}>
                <FileText size={16} /> PDF
              </button>
            </div>
          </div>

          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                <DollarSign size={24} />
              </div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiTitle}>Ingresos Totales</span>
                <span className={styles.kpiValue}>S/. {kpis.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                <ShoppingBag size={24} />
              </div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiTitle}>Pedidos Completados</span>
                <span className={styles.kpiValue}>{kpis.count}</span>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiTitle}>Ticket Promedio</span>
                <span className={styles.kpiValue}>S/. {kpis.avg.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            {loadingReports ? (
              <div style={{padding: '2rem', textAlign: 'center'}}>Cargando reportes...</div>
            ) : filteredReports.length === 0 ? (
              <div style={{padding: '2rem', textAlign: 'center'}}>No hay ventas completadas en este rango de fechas.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha Orden</th>
                    <th>Método de Pago</th>
                    <th>Repartidor</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((order) => {
                    const total = order.details ? order.details.reduce((sum: number, d: any) => sum + (d.unitPrice * d.quantity), 0) : 0;
                    return (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td style={{fontWeight: 500}}>{order.clientName}</td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <Calendar size={14} color="#888" />
                            {new Date(order.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <CreditCard size={14} color="#888" />
                            {order.paymentMethod || 'Efectivo'}
                          </div>
                        </td>
                        <td>{order.deliveredBy?.name || '-'}</td>
                        <td style={{fontWeight: 600, color: '#27ae60'}}>S/. {total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
