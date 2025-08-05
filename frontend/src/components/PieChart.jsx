import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const PieChart = ({ data, color }) => {
  // Generate colors based on the base color
  const generateColors = (baseColor, count) => {
    const colors = []
    for (let i = 0; i < count; i++) {
      // Add varying opacity to create different shades
      colors.push(`${baseColor}${90 - i * 20}`)
    }
    return colors
  }

  const chartData = {
    labels: data.map(item => item.text),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: generateColors(color, data.length),
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        color: 'white',
        font: {
          size: 13,
          weight: 'bold'
        },
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = Math.round((value / total) * 100)
          return percentage > 8 ? `${context.chart.data.labels[context.dataIndex]}\n${percentage}%` : ''
        }
      },
      tooltip: {
        titleFont: {
          size: 16
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((context.raw / total) * 100)
            return `${context.label}: ${percentage}%`
          }
        }
      }
    },
    maintainAspectRatio: true,
    responsive: true,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 20,
        right: 20
      }
    }
  }

  return (
    <div className="w-full aspect-square max-w-[400px] mx-auto p-4">
      <Pie data={chartData} options={options} />
    </div>
  )
}

export default PieChart 