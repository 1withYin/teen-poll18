import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import axios from 'axios'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Results = () => {
  const { id } = useParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState('bar')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(`/api/results/${id}`)
        setResults(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching results:', error)
        setLoading(false)
      }
    }

    fetchResults()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!results) {
    return <div className="text-center">Results not found</div>
  }

  const chartData = {
    labels: results.options.map(opt => `${opt.code} (${opt.percentage}%)`),
    datasets: [
      {
        label: 'Votes',
        data: results.options.map(opt => opt.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        text: results.question,
        color: 'white',
        font: {
          size: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-4"
    >
      <div className="flex justify-center space-x-4 mb-8">
        <button
          className={`px-4 py-2 rounded-lg ${
            chartType === 'bar'
              ? 'bg-white text-[#0A0F2B]'
              : 'bg-white/10 hover:bg-white/20'
          }`}
          onClick={() => setChartType('bar')}
        >
          Bar Chart
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            chartType === 'pie'
              ? 'bg-white text-[#0A0F2B]'
              : 'bg-white/10 hover:bg-white/20'
          }`}
          onClick={() => setChartType('pie')}
        >
          Pie Chart
        </button>
      </div>

      <div className="bg-white/10 rounded-lg p-6">
        {chartType === 'bar' ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <Pie data={chartData} options={chartOptions} />
        )}
      </div>

      {results.custom_responses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/10 rounded-lg p-6"
        >
          <h3 className="text-xl font-bold mb-4">Other Responses</h3>
          <div className="space-y-2">
            {results.custom_responses.map((response, index) => (
              <div
                key={response + '-' + index}
                className="p-3 bg-white/5 rounded-lg"
              >
                {response}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Results 