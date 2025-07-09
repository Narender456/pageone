import {
    Users as UserOutlined,
    Calendar as CalendarOutlined,
    CheckCircle as CheckCircleOutlined,
    XCircle as CloseCircleOutlined,
    Clock as ClockOutlined,
    AlertCircle as WarningOutlined,
    Check as CheckOutlined,
    X as XOutlined,
    Activity as ActivityOutlined,
    BarChart as ChartOutlined,
    Settings as SettingsOutlined,
    LogOut as LogOutOutlined,
    Menu as MenuOutlined,
    Bell as BellOutlined,
    Search as SearchOutlined,
    Filter as FilterOutlined,
    MoreVertical as MoreOutlined,
    Edit as EditOutlined,
    Trash as DeleteOutlined,
    Plus as PlusOutlined,
    RefreshCcw as RefreshOutlined,
    Download as DownloadOutlined
  } from 'lucide-react';
  
  // Basic icons
  export {
    UserOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockOutlined,
    WarningOutlined,
    CheckOutlined,
    XOutlined,
    ActivityOutlined,
    ChartOutlined,
    SettingsOutlined,
    LogOutOutlined,
    MenuOutlined,
    BellOutlined,
    SearchOutlined,
    FilterOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    RefreshOutlined,
    DownloadOutlined
  };
  
  // Custom icon components with default styling
  export const IconButton = ({ icon: Icon, onClick, className = '', ...props }) => {
    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        {...props}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  };
  
  // Status icons with colors
  export const StatusIcon = ({ status }) => {
    const iconMap = {
      pending: ClockOutlined,
      complete: CheckCircleOutlined,
      approve: CheckCircleOutlined,
      decline: CloseCircleOutlined,
      warning: WarningOutlined
    };
  
    const colorMap = {
      pending: 'text-orange-500',
      complete: 'text-green-500',
      approve: 'text-green-500',
      decline: 'text-red-500',
      warning: 'text-yellow-500'
    };
  
    const Icon = iconMap[status] || WarningOutlined;
    const colorClass = colorMap[status] || 'text-gray-500';
  
    return <Icon className={`w-5 h-5 ${colorClass}`} />;
  };