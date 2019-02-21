<template>
<div class="animated fadeIn">
  <div class="row">
    <div class="col-sm-6 col-lg-3">
      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa fa-users highlight-icon bg-primary p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Registered Merchants</div>
            <strong>10</strong>
          </div>
        </div>
      </div>

    </div>
    <!--/.col-->
    <div class="col-sm-6 col-lg-3">

      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa fa-industry highlight-icon bg-success p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Allocated Warehouse Space (In sqft)</div>
            <strong>15600</strong>
          </div>
        </div>
      </div>
    </div>
    <!--/.col-->
    <div class="col-sm-6 col-lg-3">
      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa  fa-cubes highlight-icon bg-warning p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Allocated Warehouse Space</div>
            <strong>4417.55 (Cubic Meter)</strong>
          </div>
        </div>
      </div>
    </div>
    <!--/.col-->

    <div class="col-sm-6 col-lg-3">
      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa fa-shopping-bag highlight-icon bg-danger p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Inventory</div>
            <strong>(In sqft)</strong>
            <!--div class="text-muted text-uppercase font-weight-bold small">(In sqft)</div-->
          </div>
        </div>
      </div>

    </div>
    <!--/.col-->
  </div>
  <!--/.row-->




  <div class="row">
    <div class="col-sm-6 col-lg-3">
      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa fa-truck highlight-icon bg-info p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Orders Shipped</div>
            <strong>34</strong>
          </div>
        </div>
      </div>

    </div>
    <!--/.col-->
    <div class="col-sm-6 col-lg-3">

      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa fa-cart-plus highlight-icon bg-warning p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Process Orders</div>
            <strong>370</strong>
            <div class="text-muted text-uppercase font-weight-bold small"></div>
          </div>
        </div>
      </div>


    </div>
    <!--/.col-->
    <div class="col-sm-6 col-lg-3">
      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa fa-shopping-cart highlight-icon bg-danger p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Total Sale</div>
            <strong>99000.00</strong>
            <div class="text-muted text-uppercase font-weight-bold small"></div>
          </div>
        </div>
      </div>

    </div>
    <!--/.col-->
    <div class="col-sm-6 col-lg-3">
      <div class="card">
        <div class="card-body p-3 d-flex align-items-center">
          <i class="fa fa-rupee highlight-icon bg-success p-3 font-2xl mr-3"></i>
          <div>
            <div class="card-text text-dark ">Total Revenue</div>
            <strong>140500.80</strong>
            <div class="text-muted text-uppercase font-weight-bold small"></div>
          </div>
        </div>
      </div>

    </div>
    <!--/.col-->
  </div>
  <!--/.row-->



  <div class="row">
    <div class="col-md-12">
      <b-card class="card-title" header="Warehouse Wise Inventory
 &amp; Inventory">
        <div class="row">
          <div class="col-sm-12 col-lg-4">
            <div class="row">
              <!--div class="col-sm-6">
                  <Callout variant="info">
                    <small class="text-muted">New Clients</small><br>
                    <strong class="h4">9,123</strong>
                  </Callout>
                </div-->
              <!--/.col-->
              <!--div class="col-sm-6">
                  <Callout variant="danger">
                    <small class="text-muted">Recuring Clients</small><br>
                    <strong class="h4">22,643</strong>
                  </Callout>
                </div-->
              <!--/.col-->
            </div>
            <!--/.row-->

            <!--ul class="horizontal-bars">
                <li>
                  <div class="title">
                    Monday
                  </div>
                  <div class="bars">
                    <b-progress class="progress-xs" :value="34" variant="info"></b-progress>
                    <b-progress class="progress-xs" :value="78" variant="danger"></b-progress>
                  </div>
                </li>
                <li>
                  <div class="title">
                    Tuesday
                  </div>
                  <div class="bars">
                    <b-progress class="progress-xs" :value="56" variant="info"></b-progress>
                    <b-progress class="progress-xs" :value="94" variant="danger"></b-progress>
                  </div>
                </li>
                <li>
                  <div class="title">
                    Wednesday
                  </div>
                  <div class="bars">
                    <b-progress class="progress-xs" :value="12" variant="info"></b-progress>
                    <b-progress class="progress-xs" :value="67" variant="danger"></b-progress>
                  </div>
                </li>
                <li>
                  <div class="title">
                    Thursday
                  </div>
                  <div class="bars">
                    <b-progress class="progress-xs" :value="43" variant="info"></b-progress>
                    <b-progress class="progress-xs" :value="91" variant="danger"></b-progress>
                  </div>
                </li>
                <li>
                  <div class="title">
                    Friday
                  </div>
                  <div class="bars">
                    <b-progress class="progress-xs" :value="22" variant="info"></b-progress>
                    <b-progress class="progress-xs" :value="73" variant="danger"></b-progress>
                  </div>
                </li>
                <li>
                  <div class="title">
                    Saturday
                  </div>
                  <div class="bars">
                    <b-progress class="progress-xs" :value="53" variant="info"></b-progress>
                    <b-progress class="progress-xs" :value="82" variant="danger"></b-progress>
                  </div>
                </li>
                <li>
                  <div class="title">
                    Sunday
                  </div>
                  <div class="bars">
                    <b-progress class="progress-xs" :value="9" variant="info"></b-progress>
                    <b-progress class="progress-xs" :value="69" variant="danger"></b-progress>
                  </div>
                </li>
                <li class="legend">
                  <span class="badge badge-pill badge-info"></span> <small>New clients</small> &nbsp; <span class="badge badge-pill badge-danger"></span> <small>Recurring clients</small>
                </li>
              </ul-->
          </div>
          <!--/.col-->
          <div class="col-sm-6 col-lg-4">
            <div class="row">
              <!--div class="col-sm-6">
                  <Callout variant="warning">
                    <small class="text-muted">Pageviews</small><br>
                    <strong class="h4">78,623</strong>
                  </Callout>
                </div-->
              <!--/.col-->
              <!--div class="col-sm-6">
                  <Callout variant="success">
                    <small class="text-muted">Organic</small><br>
                    <strong class="h4">49,123</strong>
                  </Callout>
                </div-->
              <!--/.col-->
            </div>
            <!--/.row-->
          </div>
          <!--/.col-->
          <div class="col-sm-6 col-lg-4">
            <div class="row">
              <!--div class="col-sm-6">
                  <Callout>
                    <small class="text-muted">CTR</small><br>
                    <strong class="h4">23%</strong>
                  </Callout>
                </div-->
              <!--/.col-->
              <!--div class="col-sm-6">
                  <Callout variant="primary">
                    <small class="text-muted">Bounce Rate</small><br>
                    <strong class="h4">5%</strong>
                  </Callout>
                </div-->
              <!--/.col-->
            </div>
            <!--/.row-->


          </div>
          <!--/.col-->
        </div>
        <!--/.row-->
        <br/>



        <b-table class="table-outline mb-0" hover responsive outline :items="tableItems" :fields="tableFields" head-variant="default">
          <template slot="avatar" scope="item">
            <div class="avatar">
              <!--img :src="item.value.url" class="img-avatar" alt=""-->
              <span class="avatar-status" v-bind:class="{ 'bg-success': item.value.status == 'success',  'bg-warning': item.value.status == 'warning', 'bg-danger': item.value.status == 'danger', 'bg-secondary': item.value.status == '' }"></span>
            </div>
          </template>
          <template slot="user" scope="item">
            <div>{{item.value.name}}</div>
            <div class="small text-muted">
              <span>
                <template v-if="item.value.new">New</template>
          <template v-else>Recurring</template>
          </span> | Registered: {{item.value.registered}}
    </div>
    </template>
    <template slot="country" scope="item">
          <div class="clearfix">
          <div class="float-right">
            <strong>{{item.value.value}}</strong>
          </div>
          </div>
          </template>
    <template slot="usage" scope="item">
          <div class="clearfix">
          <div class="float-right">
            <strong>{{item.value.value}}</strong>
          </div>
          </div>
          </template>
    <template slot="payment" scope="item">
          <div class="clearfix">
          <div class="float-right">
            <strong>{{item.value.value}}</strong>
          </div>
          </div>
          </template>
    <template slot="activity" scope="item">
          <div class="clearfix">
          <div class="float-right">
            <strong>{{item.value.value}}</strong>
          </div>
          </div>
          </template>
    </b-table>




    <br>
    <br>
    <h4>Top Performer Merchants</h4>
    <b-table class="table-outline mb-0" hover responsive outline :items="tableItems2" :fields="tableFields2" head-variant="default">
      <template slot="avatar" scope="item">
  <div class="avatar">
    <!--img :src="item.value.url" class="img-avatar" alt=""-->
    <span class="avatar-status" v-bind:class="{ 'bg-success': item.value.status == 'success',  'bg-warning': item.value.status == 'warning', 'bg-danger': item.value.status == 'danger', 'bg-secondary': item.value.status == '' }"></span>
  </div>
</template>
<template slot="user" scope="item">
<div>{{item.value.name}}</div>
<div class="small text-muted">
  <span>
      <template v-if="item.value.new">New</template>
      <template v-else>Recurring</template>
    </span> | Registered: {{item.value.registered}}
</div>
</template>
<template slot="country" scope="item">
<div class="clearfix">
  <div class="float-right">
    <strong>{{item.value.value}}</strong>
  </div>
</div>
</template>
<template slot="usage" scope="item">
<div class="clearfix">
  <div class="float-right">
    <strong>{{item.value.value}}</strong>
  </div>
</div>
</template>
<template slot="payment" scope="item">
<div class="clearfix">
  <div class="float-right">
    <strong>{{item.value.value}}</strong>
  </div>
</div>
</template>
<template slot="activity" scope="item">
<div class="clearfix">
  <div class="float-right">
    <strong>{{item.value.value}}</strong>
  </div>
</div>
</template>
        </b-table>
        <br>
        <br>
        <h4>Low Performer Merchants</h4>
        <b-table class="table-outline mb-0" hover responsive outline
          :items="tableItems3"
          :fields="tableFields3"
          head-variant="default"
          >
                    <template slot="avatar" scope="item">
                      <div class="avatar">
                        <!--img :src="item.value.url" class="img-avatar" alt=""-->
                        <span class="avatar-status" v-bind:class="{ 'bg-success': item.value.status == 'success',  'bg-warning': item.value.status == 'warning', 'bg-danger': item.value.status == 'danger', 'bg-secondary': item.value.status == '' }"></span>
                      </div>
                    </template>
                    <template slot="user" scope="item">
                      <div>{{item.value.name}}</div>
                      <div class="small text-muted">
                        <span>
                          <template v-if="item.value.new">New</template>
                          <template v-else>Recurring</template>
                        </span> | Registered: {{item.value.registered}}
                      </div>
                    </template>
                    <template slot="country" scope="item">
                    <div class="clearfix">
                    <div class="float-right">
                      <strong>{{item.value.value}}</strong>
                    </div>
                    </div>
                    </template>
                    <template slot="usage" scope="item">
                    <div class="clearfix">
                    <div class="float-right">
                      <strong>{{item.value.value}}</strong>
                    </div>
                    </div>
                    </template>
                    <template slot="payment" scope="item">
                    <div class="clearfix">
                    <div class="float-right">
                      <strong>{{item.value.value}}</strong>
                    </div>
                    </div>
                    </template>
                    <template slot="activity" scope="item">
                    <div class="clearfix">
                    <div class="float-right">
                      <strong>{{item.value.value}}</strong>
                    </div>
                    </div>
                    </template>
                  </b-table>

      </b-card>
    </div><!--/.col-->
  </div><!--/.row-->
</div>
</template>

<script>
import CardLine1ChartExample from './dashboard/CardLine1ChartExample'
import CardLine2ChartExample from './dashboard/CardLine2ChartExample'
import CardLine3ChartExample from './dashboard/CardLine3ChartExample'
import CardBarChartExample from './dashboard/CardBarChartExample'
import MainChartExample from './dashboard/MainChartExample'
import SocialBoxChartExample from './dashboard/SocialBoxChartExample'
import {
  Callout
} from '../components/'

export default {
  name: 'dashboard',
  components: {
    Callout,
    CardLine1ChartExample,
    CardLine2ChartExample,
    CardLine3ChartExample,
    CardBarChartExample,
    MainChartExample,
    SocialBoxChartExample
  },
  data: function() {
    return {
      tableItems: [{
          avatar: {
            url: 'static/img/avatars/1.jpg',
            status: 'success'
          },
          user: {
            name: 'Nagpur (MAHARASHTRA-PUNE)	',
            new: true,
            registered: 'Jan 1, 2015'
          },
          country: {
            value: 233445
          },
          usage: {
            value: 233445
          },
          payment: {
            value: 233445
          },
          activity: '10 sec ago'
        },
        {
          avatar: {
            url: 'static/img/avatars/2.jpg',
            status: 'danger'
          },
          user: {
            name: 'Vijay Logistics (MAHARASHTRA-PUNE)	',
            new: false,
            registered: 'Jan 1, 2015'
          },
          country: {
            value: 233445
          },
          usage: {
            value: 233445
          },
          payment: {
            value: 233445
          },
          activity: '5 minutes ago'
        },
        {
          avatar: {
            url: 'static/img/avatars/3.jpg',
            status: 'warning'
          },
          user: {
            name: 'ERRIL IMPEX INDIA PVT LTD (DELHI-New Delhi)	',
            new: true,
            registered: 'Jan 1, 2015'
          },
          country: {
            value: 233445
          },
          usage: {
            value: 233445
          },
          payment: {
            value: 233445
          },
          activity: '1 hour ago'
        },
        {
          avatar: {
            url: 'static/img/avatars/4.jpg',
            status: ''
          },
          user: {
            name: 'M/s Lavanya Traders (J P Nagar - Bangalore) (KARNATAKA-BANGALORE)	',
            new: true,
            registered: 'Jan 1, 2015'
          },
          country: {
            value: 233445
          },
          usage: {
            value: 233445
          },
          payment: {
            value: 233445
          },
          activity: 'Last month'
        },
        {
          avatar: {
            url: 'static/img/avatars/5.jpg',
            status: 'success'
          },
          user: {
            name: 'M/s Lavanya Traders (J P Nagar - Bangalore) (KARNATAKA-BANGALORE)	',
            new: true,
            registered: 'Jan 1, 2015'
          },
          country: {
            value: 233445
          },
          usage: {
            value: 233445
          },
          payment: {
            value: 233445
          },
          activity: 'Last week'
        },
        {
          avatar: {
            url: 'static/img/avatars/6.jpg',
            status: 'danger'
          },
          user: {
            name: 'Min2Max Retail Company (MAHARASHTRA-MUMBAI)	',
            new: true,
            registered: 'Jan 1, 2015'
          },
          country: {
            value: 233445
          },
          usage: {
            value: 233445
          },
          payment: {
            value: 233445
          },
          activity: 'Last week'
        }
      ],
      tableItems2: [


        {
          avatar: { url: 'static/img/avatars/2.jpg', status: 'danger' },
          user: { name: 'Vijay Logistics (MAHARASHTRA-PUNE)	', new: false, registered: 'Jan 1, 2015' },
          country: { value:233445 },
          usage: { value:233445 },
          payment: { value:233445 },
          activity: '5 minutes ago'
        },
        {
          avatar: { url: 'static/img/avatars/3.jpg', status: 'warning' },
          user: { name: 'ERRIL IMPEX INDIA PVT LTD (DELHI-New Delhi)	', new: true, registered: 'Jan 1, 2015' },
          country: { value:233445 },
          usage: { value:233445 },
          payment: { value:233445 },
          activity: '1 hour ago'
        },


      ],
      tableItems3: [{
          avatar: {
            url: 'static/img/avatars/1.jpg',
            status: 'success'
          },
          user: {
            name: 'Nagpur (MAHARASHTRA-PUNE)	',
            new: true,
            registered: 'Jan 1, 2015'
          },
          country: {
            value: 233445
          },
          usage: {
            value: 233445
          },
          payment: {
            value: 233445
          },
          activity: '10 sec ago'
        },





      ],
      tableFields: {
        avatar: {
          label: '<i class="icon-people"></i>',
          class: 'text-center'
        },
        user: {
          label: 'WarehouseName'
        },
        country: {
          label: 'TotalAllocatedArea(sqft)',
          class: 'text-center'
        },
        usage: {
          label: 'TotalStoredInventory'
        },
        payment: {
          label: 'Total AllocatedShipments',
          class: 'text-center'
        },
        activity: {
          label: 'Activity'
        }
      },
      tableFields2: {
        avatar: {
          label: '<i class="icon-people"></i>',
          class: 'text-center'
        },
        user: {
          label: 'MerchantName'
        },
        country: {
          label: 'TotalAllocatedArea(sqft)',
          class: 'text-center'
        },
        usage: {
          label: 'TotalStoredInventory'
        },
        payment: {
          label: 'Total AllocatedShipments',
          class: 'text-center'
        },
        activity: {
          label: 'Activity'
        }
      },
      tableFields3: {
        avatar: {
          label: '<i class="icon-people"></i>',
          class: 'text-center'
        },
        user: {
          label: 'MerchantName'
        },
        country: {
          label: 'TotalAllocatedArea(sqft)',
          class: 'text-center'
        },
        usage: {
          label: 'TotalStoredInventory'
        },
        payment: {
          label: 'Total AllocatedShipments',
          class: 'text-center'
        },
        activity: {
          label: 'Activity'
        }
      }

    }
  },


  methods: {
    variant(value) {
      let $variant
      if (value <= 25) {
        $variant = 'info'
      } else if (value > 25 && value <= 50) {
        $variant = 'success'
      } else if (value > 50 && value <= 75) {
        $variant = 'warning'
      } else if (value > 75 && value <= 100) {
        $variant = 'danger'
      }
      return $variant
    }
  }
}
</script>
