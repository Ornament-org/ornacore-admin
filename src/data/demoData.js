export const dashboardStats = [
  {
    label: "Total Shopkeepers",
    value: "1,248",
    delta: "+12.5%",
    comparison: "vs last month",
    tone: "purple",
    icon: "shopkeepers",
  },
  {
    label: "Pending Approval",
    value: "36",
    delta: "-8.3%",
    comparison: "vs last month",
    tone: "orange",
    icon: "pending",
  },
  {
    label: "Total Orders",
    value: "2,845",
    delta: "+18.7%",
    comparison: "vs last month",
    tone: "blue",
    icon: "orders",
  },
  {
    label: "Total Sales",
    value: "₹2,45,78,000",
    delta: "+24.6%",
    comparison: "vs last month",
    tone: "green",
    icon: "sales",
  },
  {
    label: "Total Due Amount",
    value: "₹45,76,800",
    delta: "-5.4%",
    comparison: "vs last month",
    tone: "red",
    icon: "due",
  },
];

export const salesTrend = [
  { date: "20 May", sales: 720000 },
  { date: "23 May", sales: 990000 },
  { date: "26 May", sales: 880000 },
  { date: "29 May", sales: 1250000 },
  { date: "01 Jun", sales: 910000 },
  { date: "04 Jun", sales: 1080000 },
  { date: "07 Jun", sales: 1450000 },
  { date: "10 Jun", sales: 1780000 },
  { date: "13 Jun", sales: 1960000 },
  { date: "16 Jun", sales: 1410000 },
  { date: "18 Jun", sales: 1640000 },
  { date: "20 Jun", sales: 2040000 },
];

export const orderStatus = [
  { name: "Requested", value: 485, color: "#dca13b" },
  { name: "Confirmed", value: 1245, color: "#bc8425" },
  { name: "Packed", value: 652, color: "#e4ded1" },
  { name: "Dispatched", value: 305, color: "#69b6c4" },
  { name: "Delivered", value: 128, color: "#3ca269" },
  { name: "Cancelled", value: 30, color: "#ef6358" },
];

export const recentOrders = [
  {
    id: "#ORD-2024-1258",
    shop: "Ramesh Jewellers",
    amount: "₹1,25,000",
    status: "CONFIRMED",
    tone: "success",
    initials: "RJ",
  },
  {
    id: "#ORD-2024-1257",
    shop: "Shree Radha Jewellers",
    amount: "₹85,500",
    status: "PACKED",
    tone: "warning",
    initials: "SR",
  },
  {
    id: "#ORD-2024-1256",
    shop: "Maa Laxmi Jewellers",
    amount: "₹2,45,000",
    status: "DISPATCHED",
    tone: "info",
    initials: "ML",
  },
  {
    id: "#ORD-2024-1255",
    shop: "Vishal Ornaments",
    amount: "₹1,05,000",
    status: "REQUESTED",
    tone: "purple",
    initials: "VO",
  },
  {
    id: "#ORD-2024-1254",
    shop: "Shiv Shakti Jewellers",
    amount: "₹75,200",
    status: "DELIVERED",
    tone: "success",
    initials: "SS",
  },
];

export const topCategories = [
  { name: "Rings", amount: "₹78,45,000", share: 32 },
  { name: "Nose Pins", amount: "₹45,12,000", share: 18 },
  { name: "Earrings", amount: "₹38,75,000", share: 16 },
  { name: "Chains", amount: "₹32,45,000", share: 13 },
  { name: "Pendants", amount: "₹28,75,000", share: 11 },
];

export const dueAging = [
  { name: "0–30 Days", value: 1245000, color: "#e0aa49" },
  { name: "31–60 Days", value: 1875000, color: "#c58b31" },
  { name: "61–90 Days", value: 985000, color: "#8db7df" },
  { name: "90+ Days", value: 471800, color: "#5b8cc4" },
];

export const lowStockItems = [
  { name: "Saniya Floral Nose Pin 22K", stock: 5, metal: "G" },
  { name: "Mumbai Plain Ring 22K", stock: 8, metal: "G" },
  { name: "Gold Chain 22K 10gm", stock: 3, metal: "G" },
  { name: "Diamond Stud Earring", stock: 2, metal: "D" },
  { name: "Silver Payal 925", stock: 7, metal: "S" },
];

export const shopkeeperRows = [
  {
    id: "SK-1024",
    shop: "Ramesh Jewellers",
    owner: "Ramesh Kumar",
    city: "Ahmedabad",
    status: "APPROVED",
    due: "₹1,25,000",
    staff: "Amit Sharma",
  },
  {
    id: "SK-1025",
    shop: "Shree Radha Jewellers",
    owner: "Neha Agarwal",
    city: "Jaipur",
    status: "PENDING",
    due: "₹85,500",
    staff: "Unassigned",
  },
  {
    id: "SK-1026",
    shop: "Maa Laxmi Jewellers",
    owner: "Mukesh Soni",
    city: "Indore",
    status: "APPROVED",
    due: "₹2,40,000",
    staff: "Rahul Verma",
  },
  {
    id: "SK-1027",
    shop: "Vishal Ornaments",
    owner: "Vishal Mehta",
    city: "Surat",
    status: "SUSPENDED",
    due: "₹75,200",
    staff: "Amit Sharma",
  },
];

export const productRows = [
  {
    id: "PRD-201",
    designCode: "NP-SAN-001",
    name: "Saniya Floral Nose Pin",
    metal: "Gold",
    category: "Nose Pins",
    variant: "22K / 0.120g",
    stock: 5,
    price: "₹2,210",
    status: "ACTIVE",
  },
  {
    id: "PRD-202",
    designCode: "RG-MUM-014",
    name: "Mumbai Bloom Ring",
    metal: "Gold",
    category: "Rings",
    variant: "22K / 3.250g",
    stock: 18,
    price: "₹24,850",
    status: "ACTIVE",
  },
  {
    id: "PRD-203",
    designCode: "ER-DIA-009",
    name: "Classic Diamond Stud",
    metal: "Diamond",
    category: "Earrings",
    variant: "18K / 1.80g",
    stock: 2,
    price: "₹38,500",
    status: "LOW STOCK",
  },
  {
    id: "PRD-204",
    designCode: "CH-BOX-021",
    name: "Daily Box Chain",
    metal: "Gold",
    category: "Chains",
    variant: "22K / 10.00g",
    stock: 0,
    price: "₹74,500",
    status: "OUT OF STOCK",
  },
];

export const orderRows = recentOrders.map((order, index) => ({
  id: order.id,
  shopkeeper: order.shop,
  city: ["Ahmedabad", "Jaipur", "Indore", "Surat", "Rajkot"][index],
  amount: order.amount,
  payment: ["PARTIALLY PAID", "UNPAID", "PAID", "CREDIT", "PAID"][index],
  status: order.status,
  staff: ["Amit Sharma", "Rahul Verma", "Amit Sharma", "Unassigned", "Neha Jain"][index],
}));

export const inventoryRows = productRows.map((product, index) => ({
  id: product.id,
  product: product.name,
  designCode: product.designCode,
  variant: product.variant,
  onHand: product.stock,
  available: product.stock,
  reserved: [4, 2, 1, 0][index],
  threshold: [10, 8, 5, 6][index],
  status: product.stock === 0 ? "OUT OF STOCK" : product.stock < 10 ? "LOW STOCK" : "IN STOCK",
}));

export const paymentRows = [
  {
    id: "PAY-7401",
    shopkeeper: "Ramesh Jewellers",
    method: "CASH",
    amount: "₹65,000",
    status: "PAID",
    reference: "CASH-240620",
    date: "20 Jun 2026",
  },
  {
    id: "PAY-7402",
    shopkeeper: "Shree Radha Jewellers",
    method: "BANK TRANSFER",
    amount: "₹1,00,000",
    status: "PAID",
    reference: "HDFC-829410",
    date: "18 Jun 2026",
  },
  {
    id: "PAY-7403",
    shopkeeper: "Maa Laxmi Jewellers",
    method: "UPI",
    amount: "₹75,000",
    status: "PAID",
    reference: "UPI-547902",
    date: "15 Jun 2026",
  },
];

export const staffRows = [
  {
    id: "EMP-101",
    name: "Amit Sharma",
    email: "amit@ornacore.com",
    role: "MANAGER",
    status: "ACTIVE",
    lastLogin: "Today, 10:42 AM",
  },
  {
    id: "EMP-102",
    name: "Rahul Verma",
    email: "rahul@ornacore.com",
    role: "SALES",
    status: "ACTIVE",
    lastLogin: "Yesterday, 6:20 PM",
  },
  {
    id: "EMP-103",
    name: "Neha Jain",
    email: "neha@ornacore.com",
    role: "ACCOUNTS",
    status: "ACTIVE",
    lastLogin: "18 Jun, 4:10 PM",
  },
];
