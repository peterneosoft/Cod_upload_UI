<script>
import { Bar } from 'vue-chartjs'

export default Bar.extend({
  mounted () {
    // Overwriting base render method with actual data.
    this.renderChart({
      labels: ['Pending', 'Received', 'TotalAmount'],
      datasets: [
        {
          label: 'GitHub Commits',
          backgroundColor: '#f87979',
          data: [0, 20, 40, 60, 80, 100, 120]
        }
      ]
    })
  }
})
</script>
