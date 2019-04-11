<script>
import { Pie } from 'vue-chartjs'
// import dashboard from './../components/dashboard/dashboard.component.js'

export default Pie.extend({
   props: ['chartdata'],

  mounted () {
    // let data = dashboard.getPieShipmentPercent()
    this.renderChart(
      // labels: ['Prepaid', 'Wallet', 'Card', 'Cash','NDR'],
      // datasets: [
      //   {
      //     backgroundColor: [
      //       '#41B883',
      //       '#E46651',
      //       '#00D8FF',
      //       '#DD1B16',
      //       '#FDCC0D'
      //     ],
      //     data: [40, 20, 80, 10,30]
      //   }
      // ]
      this.chartdata
    ), {responsive: true, maintainAspectRatio: false}

    console.log("this.data",  this.chartdata);
  }
})
</script>
