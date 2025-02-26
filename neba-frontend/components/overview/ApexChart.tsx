
import dynamic from 'next/dynamic';

export const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false, loading: () => null });

